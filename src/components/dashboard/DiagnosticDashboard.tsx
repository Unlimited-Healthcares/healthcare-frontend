import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Activity,
    Clipboard,
    Microscope,
    Clock,
    Users,
    TrendingUp,
    FileText,
    ArrowUpRight,
    Search,
    ExternalLink
} from 'lucide-react';
import { useEncounters, usePrescriptions } from '@/hooks/useClinical';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { PatientList } from './PatientList';
import { MedicalRecords } from './MedicalRecords';
import { DicomViewer } from './DicomViewer';
import { ServiceManagement } from './ServiceManagement';
import { FacilityManagement } from './FacilityManagement';
import { Image as ImageIcon } from 'lucide-react';

import { EnterpriseHeader } from './EnterpriseHeader';
import { useCenterProfile } from '@/hooks/useCenterProfile';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { DiagnosticResultModal } from '../clinical/DiagnosticResultModal';
import { useAuth } from '@/hooks/useAuth';

const activityData = [
    { name: 'Mon', count: 45 },
    { name: 'Tue', count: 52 },
    { name: 'Wed', count: 48 },
    { name: 'Thu', count: 61 },
    { name: 'Fri', count: 55 },
    { name: 'Sat', count: 32 },
    { name: 'Sun', count: 28 },
];

interface DiagnosticDashboardProps {
    centerId: string;
    centerType?: string;
}

export function DiagnosticDashboard({ centerId, centerType = 'diagnostic' }: DiagnosticDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const { profile, loading: loadingProfile } = useCenterProfile(centerId);
    const { handleQuickAction } = useQuickActionHandler();
    const { user: currentUser } = useAuth();
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const handleRecordResult = (order?: any) => {
        setSelectedOrder(order);
        setIsResultModalOpen(true);
    };

    // Live data fetching for professional stats
    const { data: encountersRes, isLoading: loadingEncounters } = useEncounters({ centerId });

    // Safety check for data structure - handles both raw axios response and direct data
    const encounters = (encountersRes as any)?.data || (Array.isArray(encountersRes) ? encountersRes : []);

    const stats = [
        {
            label: 'Pending Tests',
            count: encounters.filter((e: any) => e.status === 'in-progress').length.toString(),
            sub: 'Waiting processing',
            icon: Microscope,
            color: 'text-blue-600',
            bg: 'bg-blue-50/50'
        },
        {
            label: 'Completed Reports',
            count: encounters.filter((e: any) => e.status === 'completed').length.toString(),
            sub: 'Digitally signed',
            icon: FileText,
            color: 'text-purple-600',
            bg: 'bg-purple-50/50'
        },
        {
            label: 'Active Technicians',
            count: '1',
            sub: 'Staff on duty',
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/50'
        },
        {
            label: 'Avg Turnaround',
            count: '4.2h',
            sub: 'Optimal efficiency',
            icon: TrendingUp,
            color: 'text-amber-600',
            bg: 'bg-amber-50/50'
        }
    ];

    return (
        <div className="space-y-6">
            <EnterpriseHeader profile={profile} isLoading={loadingProfile} />

            <div className="-mt-6 space-y-4">
                <QuickActions user={currentUser} onAction={handleQuickAction} />
                <IncomingWorkflowProposals />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className={`border-none shadow-sm ${stat.bg} rounded-2xl`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className={`text-sm font-medium ${stat.color}`}>{stat.label}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loadingEncounters ? '...' : stat.count}</div>
                            <p className={`text-xs ${stat.color} flex items-center mt-1`}>
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {stat.sub}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl flex flex-wrap h-auto gap-1 overflow-hidden">
                    <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="orders" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Test Orders</TabsTrigger>
                    <TabsTrigger value="imaging" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Imaging / DICOM</TabsTrigger>
                    <TabsTrigger value="patients" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Patients</TabsTrigger>
                    <TabsTrigger value="inventory" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Lab Supplies</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Services</TabsTrigger>
                    <TabsTrigger value="management" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Management</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Test Volume Trends</CardTitle>
                                <CardDescription>Daily diagnostic requests processed</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={activityData}>
                                            <defs>
                                                <linearGradient id="colorDiagnostic" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDiagnostic)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Recent Test Results</CardTitle>
                                <CardDescription>Latest processed diagnostic results</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Full Blood Count', patient: 'John Doe', time: '10 min ago', status: 'Ready' },
                                        { name: 'Lipid Profile', patient: 'Jane Smith', time: '25 min ago', status: 'In Progress' },
                                        { name: 'X-Ray Thorax', patient: 'Robert Brown', time: '1h ago', status: 'Ready' }
                                    ].map((test, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Microscope className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900 text-sm">{test.name}</div>
                                                <div className="text-[10px] text-gray-500">{test.patient} • {test.time}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`text-[10px] px-2 py-1 rounded-full font-bold ${test.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {test.status}
                                                </div>
                                                {test.status === 'Ready' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                                                        onClick={() => handleRecordResult(test)}
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        className="w-full mt-2 rounded-xl border-gray-200"
                                        onClick={() => handleRecordResult()}
                                    >
                                        Record New Result
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="imaging">
                    <DicomViewer />
                </TabsContent>

                <TabsContent value="patients">
                    <PatientList />
                </TabsContent>

                <TabsContent value="orders">
                    <Card className="border-none shadow-sm rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Pending Diagnostic & Imaging Orders</CardTitle>
                            <CardDescription>Manage queue and process image acquisitions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { id: 'ORD-1', patient: 'John Doe', type: 'Imaging', exam: 'Chest X-Ray', priority: 'Chest pain', status: 'Pending', time: '10 min ago' },
                                    { id: 'ORD-2', patient: 'Jane Smith', type: 'Lab', exam: 'Lipid Profile', priority: 'Routine', status: 'Processing', time: '25 min ago' },
                                    { id: 'ORD-3', patient: 'Robert Brown', type: 'Imaging', exam: 'CT Brain', priority: 'Stroke', status: 'Pending', time: '1h ago' },
                                    { id: 'ORD-4', patient: 'Alice Johnson', type: 'Imaging', exam: 'US Abdomen', priority: 'Trauma', status: 'Pending', time: '2h ago' }
                                ].map((order, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.type === 'Imaging' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {order.type === 'Imaging' ? <ImageIcon className="h-5 w-5" /> : <Microscope className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                    {order.exam}
                                                    {order.priority === 'Stroke' && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0 font-black text-[9px] uppercase tracking-wider">Stroke Protocol</Badge>}
                                                    {order.priority === 'Trauma' && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-2 py-0 font-black text-[9px] uppercase tracking-wider">Trauma</Badge>}
                                                    {order.priority === 'Chest pain' && <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none px-2 py-0 font-black text-[9px] uppercase tracking-wider">Chest Pain</Badge>}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    <span>{order.patient}</span> • <span>{order.id}</span> • <span>{order.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`text-[10px] px-2 py-1 rounded-full font-bold ${order.status === 'Processing' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                                                {order.status}
                                            </div>
                                            <Button
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs"
                                                onClick={() => handleRecordResult({
                                                    id: order.id,
                                                    patientName: order.patient,
                                                    serviceRequested: order.exam,
                                                    category: order.type,
                                                    priority: order.priority === 'Routine' ? 'normal' : 'high'
                                                })}
                                            >
                                                Process & Acquire
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services">
                    <ServiceManagement centerId={centerId} centerType={centerType} />
                </TabsContent>



                <TabsContent value="management">
                    <FacilityManagement centerId={centerId} />
                </TabsContent>
            </Tabs>

            <DiagnosticResultModal
                isOpen={isResultModalOpen}
                onClose={() => setIsResultModalOpen(false)}
                currentSpecialist={currentUser}
                pendingOrder={selectedOrder}
            />
        </div>
    );
}
