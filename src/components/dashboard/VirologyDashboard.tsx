import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { virologyService, VirologyStats, PathogenAlert } from '@/services/virologyService';
import {
    Activity,
    Microscope,
    Clock,
    ArrowUpRight,
    Search,
    Dna,
    ShieldAlert,
    Thermometer
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
import { ServiceManagement } from './ServiceManagement';
import { FacilityManagement } from './FacilityManagement';

import { EnterpriseHeader } from './EnterpriseHeader';
import { useCenterProfile } from '@/hooks/useCenterProfile';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { useAuth } from '@/hooks/useAuth';

const viralActivityData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 18 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 25 },
    { name: 'Fri', count: 32 },
    { name: 'Sat', count: 20 },
    { name: 'Sun', count: 14 },
];

interface VirologyDashboardProps {
    centerId: string;
    centerType?: string;
}

export function VirologyDashboard({ centerId, centerType = 'virology' }: VirologyDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const { profile, loading: loadingProfile } = useCenterProfile(centerId);
    const { user } = useAuth();
    const { handleQuickAction } = useQuickActionHandler();

    const [stats, setStats] = useState<VirologyStats>({
        activeSamples: 0,
        sequencesCompleted: 0,
        safetyStatus: 'BSL-1',
        incubationTemp: 0
    });
    const [pathogens, setPathogens] = useState<PathogenAlert[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoadingData(true);
            try {
                const [statData, alertData] = await Promise.all([
                    virologyService.getStats(centerId),
                    virologyService.getPathogenAlerts()
                ]);
                setStats(statData);
                setPathogens(alertData);
            } catch (error) {
                console.error('Failed to load virology data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (centerId) {
            loadDashboardData();
        }
    }, [centerId]);

    // Fallback if API returns empty
    const displayPathogens = pathogens.length > 0 ? pathogens : [
        { id: '1', name: 'Influenza H1N1', strain: 'Variant-A', time: '12 min ago', threat: 'Low' as const, status: 'Active' },
        { id: '2', name: 'SARS-CoV-2', strain: 'Omicron', time: '45 min ago', threat: 'Moderate' as const, status: 'Active' },
        { id: '3', name: 'Norovirus', strain: 'GII.4', time: '2h ago', threat: 'Low' as const, status: 'Active' }
    ];

    return (
        <div className="space-y-6 pb-32 sm:pb-8">
            <EnterpriseHeader profile={profile} isLoading={loadingProfile} />

            <div className="-mt-6 space-y-4">
                <QuickActions user={user} onAction={handleQuickAction} />
                <IncomingWorkflowProposals />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Active Samples</CardTitle>
                        <Microscope className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSamples}</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +5 new strains
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-purple-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600">Sequences Completed</CardTitle>
                        <Dna className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.sequencesCompleted}</div>
                        <p className="text-xs text-purple-600 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" />
                            99.2% confidence
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">Safety Status</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.safetyStatus}</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Next audit in 12 days
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-amber-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600">Incubation Monitor</CardTitle>
                        <Thermometer className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.incubationTemp.toFixed(1)}°C</div>
                        <p className="text-xs text-amber-600 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" />
                            All systems nominal
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl overflow-x-auto flex-nowrap">
                    <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
                    <TabsTrigger value="pathogens" className="rounded-lg px-6">Pathogens</TabsTrigger>
                    <TabsTrigger value="sequencing" className="rounded-lg px-6">Sequencing</TabsTrigger>
                    <TabsTrigger value="patients" className="rounded-lg px-6">Infected Cases</TabsTrigger>
                    <TabsTrigger value="inventory" className="rounded-lg px-6">Bio-Inventory</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg px-6">Research Services</TabsTrigger>

                    <TabsTrigger value="management" className="rounded-lg px-6">Facility</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Infection Trends</CardTitle>
                                <CardDescription>Detection and reporting volume</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={viralActivityData}>
                                            <defs>
                                                <linearGradient id="colorVirology" x1="0" y1="0" x2="0" y2="1">
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
                                            <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVirology)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Pathogen Alert Status</CardTitle>
                                <CardDescription>Active pathogen monitoring</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {displayPathogens.map((test) => (
                                        <div key={test.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                <Dna className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900 text-sm">{test.name}</div>
                                                <div className="text-[10px] text-gray-500">{test.strain} • {test.time}</div>
                                            </div>
                                            <div className={`text-[10px] px-2 py-1 rounded-full font-bold ${test.threat === 'Low' ? 'bg-green-100 text-green-700' :
                                                test.threat === 'Moderate' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {test.threat}
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full mt-2 rounded-xl border-gray-200">Pathogen Database</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="pathogens">
                    <div className="p-8 text-center text-gray-500 italic">
                        Pathogen tracking system loading...
                    </div>
                </TabsContent>

                <TabsContent value="sequencing">
                    <div className="p-8 text-center text-gray-500 italic">
                        Genetic sequencing tools loading...
                    </div>
                </TabsContent>

                <TabsContent value="patients">
                    <PatientList centerId={centerId} />
                </TabsContent>

                <TabsContent value="inventory">
                    <div className="p-8 text-center text-gray-500 italic">
                        Biological inventory management...
                    </div>
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
