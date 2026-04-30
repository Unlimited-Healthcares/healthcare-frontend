import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    ExternalLink,
    FlaskConical
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
import { FacilityManagement } from './FacilityManagement';
import { Image as ImageIcon, Receipt, ShieldAlert, Zap, Truck } from 'lucide-react';
import { ImagingMissionDashboard } from './ImagingMissionDashboard';
import { LabMissionDashboard } from './LabMissionDashboard';
import { DicomViewer } from './DicomViewer';
import { ServiceManagement } from './ServiceManagement';
import { toast } from 'sonner';

import { EnterpriseHeader } from './EnterpriseHeader';
import { useCenterProfile } from '@/hooks/useCenterProfile';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { DiagnosticResultModal } from '../clinical/DiagnosticResultModal';
import { useAuth } from '@/hooks/useAuth';

const activityData: any[] = [];

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
    const [viewingImagingMission, setViewingImagingMission] = useState<any>(null);
    const [viewingLabMission, setViewingLabMission] = useState<any>(null);

    const handleRecordResult = (order?: any) => {
        setSelectedOrder(order);
        setIsResultModalOpen(true);
    };

    // Live data fetching for professional stats
    const { data: encountersRes, isLoading: loadingEncounters } = useEncounters({ centerId });

    const encounters = (encountersRes as any)?.data || (Array.isArray(encountersRes) ? encountersRes : []);

    if (viewingImagingMission) {
        return (
            <ImagingMissionDashboard 
                order={viewingImagingMission} 
                onBack={() => setViewingImagingMission(null)} 
                onComplete={() => {
                    setViewingImagingMission(null);
                    // Refresh data
                }}
            />
        );
    }

    if (viewingLabMission) {
        return (
            <LabMissionDashboard 
                order={viewingLabMission} 
                onBack={() => setViewingLabMission(null)} 
                onComplete={() => {
                    setViewingLabMission(null);
                    // Refresh data
                }}
            />
        );
    }

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
            count: '0',
            sub: 'Staff on duty',
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/50'
        },
        {
            label: 'Avg Turnaround',
            count: '0h',
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
                                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No recent results</p>
                                    </div>
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
                                <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <Clipboard className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No pending orders</p>
                                    <p className="text-[10px] text-slate-300 mt-1">Diagnostic requests will appear here when issued by physicians.</p>
                                </div>
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
