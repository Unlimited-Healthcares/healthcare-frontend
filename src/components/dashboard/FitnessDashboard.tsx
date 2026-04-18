import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Activity,
    Dumbbell,
    Clock,
    Users,
    TrendingUp,
    Heart,
    Flame,
    Zap,
    Plus,
    Calendar
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { SchedulingCalendar } from './SchedulingCalendar';
import { ServiceManagement } from './ServiceManagement';
import { FacilityManagement } from './FacilityManagement';

import { EnterpriseHeader } from './EnterpriseHeader';
import { useCenterProfile } from '@/hooks/useCenterProfile';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { useAuth } from '@/hooks/useAuth';

const fitnessData = [
    { name: 'Mon', entries: 25 },
    { name: 'Tue', entries: 35 },
    { name: 'Wed', entries: 30 },
    { name: 'Thu', entries: 42 },
    { name: 'Fri', entries: 40 },
    { name: 'Sat', entries: 65 },
    { name: 'Sun', entries: 58 },
];

interface FitnessDashboardProps {
    centerId: string;
    centerType?: string;
}

export function FitnessDashboard({ centerId, centerType = 'fitness-center' }: FitnessDashboardProps) {
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
                <Card className="border-none shadow-sm bg-orange-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600">Active Members</CardTitle>
                        <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">124</div>
                        <p className="text-xs text-orange-600 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" />
                            85% attendance rate
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-rose-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-rose-600">Avg Heart Rate</CardTitle>
                        <Heart className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">72 bpm</div>
                        <p className="text-xs text-rose-600 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" />
                            Optimal resting
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-amber-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600">Total Calories Burned</CardTitle>
                        <Flame className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45.2k</div>
                        <p className="text-xs text-amber-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Collective weekly burn
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Peak Energy Usage</CardTitle>
                        <Zap className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">92%</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Between 5 PM - 8 PM
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
                    <TabsTrigger value="members" className="rounded-lg px-6">Members</TabsTrigger>
                    <TabsTrigger value="classes" className="rounded-lg px-6">Classes</TabsTrigger>
                    <TabsTrigger value="trainers" className="rounded-lg px-6">Trainers</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg px-6">Services</TabsTrigger>

                    <TabsTrigger value="management" className="rounded-lg px-6">Management</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Entry Trend</CardTitle>
                                <CardDescription>Historical weekly membership entries</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={fitnessData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="entries" fill="#f97316" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Active Sessions</CardTitle>
                                <CardDescription>Personal training appointments today</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { name: 'Yoga High', trainer: 'Sarah Miller', time: '10:00 AM', enrolled: '12/15' },
                                        { name: 'HIIT Intensive', trainer: 'Mark Ruffalo', time: '11:30 AM', enrolled: '8/10' },
                                        { name: 'Strength Lab', trainer: 'David Goggins', time: '1:00 PM', enrolled: '5/8' }
                                    ].map((session, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                                <Dumbbell className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-gray-900 text-sm truncate">{session.name}</div>
                                                <div className="text-[10px] text-gray-500">{session.trainer} • {session.time}</div>
                                            </div>
                                            <div className="text-[10px] text-orange-600 font-bold whitespace-nowrap">
                                                {session.enrolled}
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full mt-2 rounded-xl border-gray-200">View All Sessions</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="classes">
                    <SchedulingCalendar />
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
