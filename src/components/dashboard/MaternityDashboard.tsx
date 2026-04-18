import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Activity,
    Heart,
    Baby,
    TrendingUp,
    ArrowUpRight,
    Plus,
    Calendar,
    Stethoscope,
    Clock,
    FileText,
    ArrowLeftRight
} from 'lucide-react';
import { format } from 'date-fns';
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
import { patientService } from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';
import { useEffect } from 'react';

const maternityData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 15 },
    { name: 'Wed', count: 18 },
    { name: 'Thu', count: 14 },
    { name: 'Fri', count: 20 },
    { name: 'Sat', count: 10 },
    { name: 'Sun', count: 8 },
];

interface MaternityDashboardProps {
    centerId: string;
    centerType?: string;
}

export function MaternityDashboard({ centerId, centerType = 'maternity' }: MaternityDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        activePatients: 0,
        deliveriesThisMonth: 0,
        pendingReviews: 0,
        totalAppointments: 0,
        newPatientCount: 0,
        followUpCount: 0,
        chartData: maternityData,
        upcomingAppointments: [] as any[]
    });
    const { profile, loading: loadingProfile } = useCenterProfile(centerId);
    const { user } = useAuth();
    const { handleQuickAction } = useQuickActionHandler();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch basic stats
                const [patientsRes, analyticsRes, appointmentsRes, allAptsRes] = await Promise.all([
                    patientService.getPatients({ centerId, limit: 1 }),
                    appointmentService.getAppointmentAnalytics(centerId),
                    appointmentService.getAppointments({ centerId, limit: 3, status: 'scheduled' }),
                    appointmentService.getAppointments({ centerId, limit: 100 }) // Fetch more to calculate types locally if backend doesn't aggregate
                ]);

                const newCount = allAptsRes.data.filter((a: any) => a.patientType === 'new').length;
                const followCount = allAptsRes.data.filter((a: any) => a.patientType === 'follow-up').length;

                // Calculate some maternity-specific logic if needed
                // For now, mapping general analytics to maternity labels
                setStats(prev => ({
                    ...prev,
                    activePatients: patientsRes.total,
                    deliveriesThisMonth: analyticsRes?.metrics?.completedAppointments || 0,
                    pendingReviews: (analyticsRes?.metrics?.totalAppointments || 0) - (analyticsRes?.metrics?.completedAppointments || 0),
                    totalAppointments: analyticsRes?.metrics?.totalAppointments || 0,
                    newPatientCount: newCount,
                    followUpCount: followCount,
                    upcomingAppointments: appointmentsRes.data || []
                    // Optionally transform analyticsRes into chartData format
                }));
            } catch (error) {
                console.error("Error fetching maternity dashboard data:", error);
            }
        };

        if (centerId) {
            fetchDashboardData();
        }
    }, [centerId]);

    return (
        <div className="space-y-6 pb-28 sm:pb-8">
            <EnterpriseHeader profile={profile} isLoading={loadingProfile} />

            <div className="-mt-6 space-y-4">
                <QuickActions user={user} onAction={handleQuickAction} />
                <IncomingWorkflowProposals />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-pink-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-pink-600">Active Expecting</CardTitle>
                        <Heart className="h-4 w-4 text-pink-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activePatients || '0'}</div>
                        <p className="text-xs text-pink-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +3 this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Deliveries This Month</CardTitle>
                        <Baby className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.deliveriesThisMonth || '0'}</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" />
                            100% success rate
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-indigo-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-600">Postnatal Reviews</CardTitle>
                        <Stethoscope className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingReviews || '0'}</div>
                        <p className="text-xs text-indigo-600 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            4 due today
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-amber-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">New Consultations</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.newPatientCount || '0'}</div>
                        <p className="text-xs text-amber-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Requires Fee
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700">Follow-up Visits</CardTitle>
                        <ArrowLeftRight className="h-4 w-4 text-emerald-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.followUpCount || '0'}</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Same Service
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
                    <TabsTrigger value="prenatal" className="rounded-lg px-6">Prenatal</TabsTrigger>
                    <TabsTrigger value="delivery" className="rounded-lg px-6">Delivery</TabsTrigger>
                    <TabsTrigger value="neonatal" className="rounded-lg px-6">Neonatal</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg px-6">Services</TabsTrigger>
                    <TabsTrigger value="management" className="rounded-lg px-6">Staff</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Delivery Trends</CardTitle>
                                <CardDescription>Consolidated weekly delivery statistics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={maternityData}>
                                            <defs>
                                                <linearGradient id="colorMaternity" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorMaternity)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Upcoming Prenatal Visits</CardTitle>
                                <CardDescription>Next 3 scheduled appointments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats.upcomingAppointments.length > 0 ? (
                                        stats.upcomingAppointments.map((apt) => (
                                            <div key={apt.id} className="flex items-center justify-between p-3 bg-pink-50/30 rounded-xl border border-pink-100/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-pink-100 rounded-lg">
                                                        <Heart className="h-4 w-4 text-pink-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 leading-tight">
                                                            {apt.patient?.firstName} {apt.patient?.lastName || 'Patient'}
                                                        </div>
                                                        <div className="text-xs text-pink-600">
                                                            {apt.reason || 'Prenatal Checkup'} • {apt.doctor || 'Dr. Assigned'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-bold text-pink-700 bg-pink-100/50 px-2 py-1 rounded-md">
                                                    {format(new Date(apt.appointmentDate), 'h:mm a')}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 text-sm italic">
                                            No upcoming appointments scheduled today.
                                        </div>
                                    )}
                                    <Button variant="outline" className="w-full mt-2 rounded-xl border-gray-200">Full Schedule</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="prenatal" className="space-y-4">
                    <Card className="border-none shadow-premium rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Current Prenatal Care Patients</CardTitle>
                                <CardDescription>Overview of active prenatal files and progress</CardDescription>
                            </div>
                            <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl">
                                <Plus className="h-4 w-4 mr-2" />
                                New Case
                            </Button>
                        </CardHeader>
                        <CardContent className="px-0">
                            <PatientList centerId={centerId} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="delivery" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="border-none shadow-premium rounded-2xl bg-white p-6 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Active Labor Monitor</h4>
                                <p className="text-sm text-slate-500">Real-time status tracking for patients in active labor units.</p>
                            </div>
                            <Button variant="ghost" className="w-full justify-between text-blue-600 hover:bg-blue-50">
                                View 4 Patients
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Card>
                        <Card className="border-none shadow-premium rounded-2xl bg-white p-6 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Baby className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Delivery Suites</h4>
                                <p className="text-sm text-slate-500">Management of high-dependency and standard delivery rooms.</p>
                            </div>
                            <Button variant="ghost" className="w-full justify-between text-purple-600 hover:bg-purple-50">
                                Room Allocation
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Card>
                        <Card className="border-none shadow-premium rounded-2xl bg-white p-6 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Birth Records</h4>
                                <p className="text-sm text-slate-500">Legal birth notifications and procedure documentation.</p>
                            </div>
                            <Button variant="ghost" className="w-full justify-between text-indigo-600 hover:bg-indigo-50">
                                Finalize Records
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="neonatal" className="space-y-4">
                    <Card className="border-none shadow-premium rounded-2xl bg-white overflow-hidden">
                        <CardHeader>
                            <CardTitle>Nursery & NICU Management</CardTitle>
                            <CardDescription>Monitoring of newborns and specialized neonatal care units.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <PatientList centerId={centerId} />
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
        </div>
    );
}
