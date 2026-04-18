import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Activity,
    Clipboard,
    Brain,
    Clock,
    Users,
    TrendingUp,
    FileText,
    ArrowUpRight,
    Search,
    HeartPulse,
    MessagesSquare,
    Stethoscope
} from 'lucide-react';
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

const activityData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 18 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 22 },
    { name: 'Fri', count: 25 },
    { name: 'Sat', count: 10 },
    { name: 'Sun', count: 8 },
];

interface PsychiatricDashboardProps {
    centerId: string;
    centerType?: string;
}

export function PsychiatricDashboard({ centerId, centerType = 'psychiatric' }: PsychiatricDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const { profile, loading: loadingProfile } = useCenterProfile(centerId);
    const { user } = useAuth();
    const { handleQuickAction } = useQuickActionHandler();

    return (
        <div className="space-y-6">
            <EnterpriseHeader profile={profile} isLoading={loadingProfile} />

            <div className="-mt-6 space-y-4">
                <QuickActions user={user} onAction={handleQuickAction} />
                <IncomingWorkflowProposals />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-indigo-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-600">Active Consultations</CardTitle>
                        <Brain className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-indigo-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +2 scheduled today
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-purple-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600">Wellness Reports</CardTitle>
                        <FileText className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42</div>
                        <p className="text-xs text-purple-600 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" />
                            95% progress tracking
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">On-duty Specialists</CardTitle>
                        <Users className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            3 therapists active
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-rose-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-rose-600">Crisis Requests</CardTitle>
                        <HeartPulse className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-rose-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Stable since 24h
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
                    <TabsTrigger value="appointments" className="rounded-lg px-6">Therapy Sessions</TabsTrigger>
                    <TabsTrigger value="patients" className="rounded-lg px-6">Patient Files</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg px-6">Programs</TabsTrigger>

                    <TabsTrigger value="management" className="rounded-lg px-6">Management</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Patient Engagement Trends</CardTitle>
                                <CardDescription>Psychotherapy sessions and outreach volume</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={activityData}>
                                            <defs>
                                                <linearGradient id="colorPsych" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPsych)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Upcoming Sessions</CardTitle>
                                <CardDescription>Scheduled therapy and check-ups</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { name: 'CBT Session', patient: 'Alice Johnson', time: '14:30 Today', type: 'Therapy' },
                                        { name: 'Medication Review', patient: 'Sam Wilson', time: '16:00 Today', type: 'Clinical' },
                                        { name: 'Group Therapy', patient: 'Mental Health Unit A', time: 'Tomorrow 10:00', type: 'Group' }
                                    ].map((session, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Stethoscope className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900 text-sm">{session.name}</div>
                                                <div className="text-[10px] text-gray-500">{session.patient} • {session.time}</div>
                                            </div>
                                            <div className="text-[10px] px-2 py-1 rounded-full font-bold bg-indigo-100 text-indigo-700">
                                                {session.type}
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full mt-2 rounded-xl border-gray-200">View Appointments</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="patients">
                    <PatientList />
                </TabsContent>

                <TabsContent value="appointments">
                    <MedicalRecords userRole="center_staff" />
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
