import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Activity,
    Pill,
    Package,
    Clock,
    TrendingUp,
    FileText,
    ArrowUpRight,
    ShoppingBag
} from 'lucide-react';
import { usePrescriptions } from '@/hooks/useClinical';
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
import { ServiceManagement } from './ServiceManagement';
import { FacilityManagement } from './FacilityManagement';

import { EnterpriseHeader } from './EnterpriseHeader';
import { useCenterProfile } from '@/hooks/useCenterProfile';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { useAuth } from '@/hooks/useAuth';
import { PharmacistVerificationHub } from './PharmacistVerificationHub';
import { PharmacyInventoryHub } from './PharmacyInventoryHub';

const activityData = [
    { name: 'Mon', count: 120 },
    { name: 'Tue', count: 145 },
    { name: 'Wed', count: 130 },
    { name: 'Thu', count: 168 },
    { name: 'Fri', count: 155 },
    { name: 'Sat', count: 92 },
    { name: 'Sun', count: 78 },
];

interface PharmacyDashboardProps {
    centerId: string;
    centerType?: string;
}

export function PharmacyDashboard({ centerId, centerType = 'pharmacy' }: PharmacyDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const { profile, loading: loadingProfile } = useCenterProfile(centerId);
    const { user } = useAuth();
    const { handleQuickAction } = useQuickActionHandler();

    // Live data fetching for professional stats
    const { data: prescriptionsRes, isLoading: loadingPrescriptions } = usePrescriptions({ centerId });
    const prescriptions = (prescriptionsRes as any)?.data || (Array.isArray(prescriptionsRes) ? prescriptionsRes : []);

    const stats = [
        {
            label: 'Total Prescriptions',
            count: prescriptions.length.toString(),
            sub: `+${prescriptions.filter((p: any) => new Date(p.createdAt || Date.now()).toDateString() === new Date().toDateString()).length} today`,
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-50/50'
        },
        {
            label: 'Pending Orders',
            count: prescriptions.filter((p: any) => p.status === 'pending').length.toString(),
            sub: 'Waiting fulfillment',
            icon: ShoppingBag,
            color: 'text-purple-600',
            bg: 'bg-purple-50/50'
        },
        {
            label: 'Low Stock Items',
            count: '0',
            sub: 'Operational status: OK',
            icon: Package,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/50'
        },
        {
            label: 'Total Revenue',
            count: '₦0',
            sub: 'Transfers synced',
            icon: TrendingUp,
            color: 'text-amber-600',
            bg: 'bg-amber-50/50'
        }
    ];

    return (
        <div className="space-y-6">
            <EnterpriseHeader profile={profile} isLoading={loadingProfile} />

            <div className="-mt-6 space-y-4">
                <QuickActions user={user} onAction={handleQuickAction} />
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
                            <div className="text-2xl font-bold">{loadingPrescriptions ? '...' : stat.count}</div>
                            <p className={`text-xs ${stat.color} flex items-center mt-1`}>
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {stat.sub}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
                    <TabsTrigger value="verification" className="rounded-lg px-6">Clinical Verification</TabsTrigger>
                    <TabsTrigger value="prescriptions" className="rounded-lg px-6">Dispensing Queue</TabsTrigger>
                    <TabsTrigger value="inventory" className="rounded-lg px-6">Inventory & Stock</TabsTrigger>
                    <TabsTrigger value="patients" className="rounded-lg px-6">Customers</TabsTrigger>
                    <TabsTrigger value="management" className="rounded-lg px-6">Management</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Sales & Dispensing Volume</CardTitle>
                                <CardDescription>Historical trends in daily prescription volume</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={activityData}>
                                            <defs>
                                                <linearGradient id="colorPharmacy" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPharmacy)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Recent Dispensed</CardTitle>
                                <CardDescription>Latest prescriptions filled for customers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { drug: 'Amoxicillin 500mg', type: 'Capsule', patient: 'Sam Jones', time: 'Just now' },
                                        { drug: 'Metformin 850mg', type: 'Tablet', patient: 'Alice Peterson', time: '15 min ago' },
                                        { drug: 'Lisinopril 10mg', type: 'Tablet', patient: 'Tom Hardy', time: '40 min ago' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                <Pill className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-gray-900 text-sm truncate">{item.drug}</div>
                                                <div className="text-[10px] text-gray-500">{item.patient} • {item.type}</div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium">
                                                {item.time}
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full mt-2 rounded-xl border-gray-200">View All Dispensing</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="verification">
                    <PharmacistVerificationHub />
                </TabsContent>

                <TabsContent value="prescriptions">
                    <div className="space-y-6">
                        <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Discharge Fulfillment</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing Discharge Plans • Digital Receipts • Delivery Logic</p>
                            </div>
                            <div className="flex gap-2">
                                <Button className="rounded-xl bg-white border-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-widest h-10 px-6 border-2">Generate Digital Receipt</Button>
                                <Button className="rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest h-10 px-6 shadow-lg shadow-indigo-100">Enable Home Delivery</Button>
                            </div>
                        </div>
                        <MedicalRecords userRole="center_staff" />
                    </div>
                </TabsContent>

                <TabsContent value="inventory">
                    <PharmacyInventoryHub />
                </TabsContent>

                <TabsContent value="patients">
                    <PatientList />
                </TabsContent>

                <TabsContent value="management">
                    <FacilityManagement centerId={centerId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
