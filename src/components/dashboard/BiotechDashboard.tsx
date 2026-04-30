import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Activity,
    Microscope,
    Cpu,
    Dna,
    Network,
    FileText,
    ArrowUpRight,
    Search,
    Clock,
    Zap,
    FlaskConical,
    Settings,
    Stethoscope
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { useNavigate } from 'react-router-dom';
import { medicalReportsService } from '@/services/medicalReportsService';
import { SpecialtyUpdateModal } from './SpecialtyUpdateModal';
import { ServiceManagement } from './ServiceManagement';

import { discoveryService } from '@/services/discoveryService';
import { BiotechDeviceRegistry } from './BiotechDeviceRegistry';
import { BiotechMaintenanceHub } from './BiotechMaintenanceHub';

interface DashboardStats {
    activeProjects: number;
    pendingAnalysis: number;
    systemAlerts: number;
    collaborations: number;
}

interface Signal {
    id: string;
    type: string;
    message: string;
    status: string;
    createdAt: string;
}

export function BiotechDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const { handleQuickAction } = useQuickActionHandler();
    const [stats, setStats] = useState<DashboardStats>({
        activeProjects: 0,
        pendingAnalysis: 0,
        systemAlerts: 0,
        collaborations: 0
    });
    const [recentSignals, setRecentSignals] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);

    const specialty = profile?.specialization || (user as any)?.specialization;
    const dashboardTitle = specialty ? `${specialty} Dashboard` : 'Biotech Engineering Dashboard';

    const displayName = profile?.name || user?.name || 'Biotech Specialist';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch real requests data from Discovery Service
                const [sentReqs, receivedReqs, reports] = await Promise.all([
                    discoveryService.getSentRequests({ limit: 50 }),
                    discoveryService.getReceivedRequests({ limit: 50 }),
                    medicalReportsService.getMedicalReports({ limit: 50 })
                ]);

                // Calculate stats from real data
                const activeCollaborations = sentReqs.requests.filter(r => r.status === 'approved').length;
                const pending = receivedReqs.requests.filter(r => r.status === 'pending').length;

                setStats({
                    activeProjects: activeCollaborations,
                    pendingAnalysis: pending,
                    systemAlerts: 0, // Backend doesn't have system alerts yet
                    collaborations: sentReqs.total + receivedReqs.total
                });

                // Map requests to "signals"
                const combinedSignals = [
                    ...receivedReqs.requests.map(r => ({
                        id: r.id,
                        signal: r.requestType.replace('_', ' ').toUpperCase(),
                        type: 'COLLABORATION',
                        location: r.senderName,
                        time: new Date(r.createdAt).toLocaleDateString(),
                        color: 'bg-blue-100 text-blue-600'
                    })),
                    ...reports.data.map(rep => ({
                        id: rep.id,
                        signal: 'REPORT GENERATED',
                        type: 'MEDICAL',
                        location: rep.patientName || 'Patient',
                        time: new Date(rep.generatedDate).toLocaleDateString(),
                        color: 'bg-green-100 text-green-600'
                    }))
                ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

                setRecentSignals(combinedSignals);

                // Try to get real chart data if the service supports it
                try {
                    const analytics = await medicalReportsService.getChartData();
                    if (analytics && analytics.trends) {
                        setChartData(analytics.trends.map(t => ({
                            name: t.period,
                            analysis: t.medicalRecords
                        })));
                    }
                } catch (e) {
                    console.warn('Could not fetch chart data, using empty state');
                }

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const onDashboardAction = (action: string, data?: any) => {
        handleQuickAction(action, data);
    };

    return (
        <div className="space-y-6 pb-32 sm:pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Biotech Engineering Dashboard</h1>
                    <p className="text-gray-500">{displayName}. Managing equipment lifecycle and technical services.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Button
                        onClick={() => navigate('/discovery?type=center')}
                        variant="outline"
                        className="rounded-xl border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 gap-2 font-bold px-4 sm:px-6 shadow-sm flex-1 sm:flex-none justify-center whitespace-nowrap text-xs sm:text-sm"
                    >
                        <Search className="h-4 w-4" />
                        Find Research Entities
                    </Button>
                    <Button
                        onClick={() => navigate('/discovery?type=biotech_engineer')}
                        variant="outline"
                        className="rounded-xl border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 gap-2 font-bold px-4 sm:px-6 shadow-sm flex-1 sm:flex-none justify-center whitespace-nowrap text-xs sm:text-sm"
                    >
                        <Cpu className="h-4 w-4" />
                        Connect Biotech Specialist
                    </Button>
                    <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white gap-2 font-bold px-4 sm:px-6 shadow-md shadow-blue-200 flex-1 sm:flex-none justify-center whitespace-nowrap text-xs sm:text-sm">
                        <PlusIcon className="h-4 w-4" />
                        New Analysis
                    </Button>
                    <Button
                        onClick={() => setIsSpecialtyModalOpen(true)}
                        className="rounded-xl border-blue-200 bg-white text-blue-700 hover:bg-blue-50 gap-2 font-bold px-4 sm:px-6 shadow-sm flex-1 sm:flex-none justify-center whitespace-nowrap text-xs sm:text-sm"
                    >
                        <Stethoscope className="h-4 w-4" />
                        {profile?.specialization ? 'Update Specialty' : 'Add Specialty'}
                    </Button>
                </div>
            </div>

            <SpecialtyUpdateModal
                isOpen={isSpecialtyModalOpen}
                onClose={() => setIsSpecialtyModalOpen(false)}
                currentSpecialty={profile?.specialization as any}
                role="biotech_engineer"
            />

            <QuickActions user={user} onAction={onDashboardAction} />
            <IncomingWorkflowProposals />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Active Projects</CardTitle>
                        <Network className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.activeProjects}</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1 font-medium">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +2 from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-cyan-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-cyan-600">Pending Analysis</CardTitle>
                        <Microscope className="h-4 w-4 text-cyan-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.pendingAnalysis}</div>
                        <p className="text-xs text-cyan-600 flex items-center mt-1 font-medium">
                            <Clock className="h-3 w-3 mr-1" />
                            4 urgent requests
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">System Alerts</CardTitle>
                        <Zap className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.systemAlerts}</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
                            <Activity className="h-3 w-3 mr-1" />
                            {stats.systemAlerts === 0 ? 'All nodes operational' : `${stats.systemAlerts} active alerts`}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-indigo-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-600">Total Interactions</CardTitle>
                        <Dna className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.collaborations}</div>
                        <p className="text-xs text-indigo-600 flex items-center mt-1 font-medium">
                            <UsersIcon className="h-3 w-3 mr-1" />
                            Sent & Received
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto overflow-y-hidden">
                    <TabsTrigger value="overview" className="rounded-lg px-6">Service Overview</TabsTrigger>
                    <TabsTrigger value="fleet" className="rounded-lg px-6">Device Fleet</TabsTrigger>
                    <TabsTrigger value="work-orders" className="rounded-lg px-6">Maintenance Hub</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg px-6">Service Listings</TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-lg px-6">System Config</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Research & Analysis Throughput</CardTitle>
                                <CardDescription>Monthly volume of processed bio-metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {chartData.length > 0 ? (
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorBio" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />
                                                <Area type="monotone" dataKey="analysis" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorBio)" />
                                            </AreaChart>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-400 italic">
                                                No throughput data available
                                            </div>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Recent Technical Activities</CardTitle>
                                <CardDescription>Latest updates from connected facilities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentSignals.length > 0 ? recentSignals.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center`}>
                                                <FlaskConical className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-gray-900 text-sm truncate">{item.signal}</div>
                                                <div className="text-[10px] text-gray-500">{item.location} • {item.type}</div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium">
                                                {item.time}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-gray-400 italic">
                                            No recent signals detected
                                        </div>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="w-full mt-2 rounded-xl border-gray-200 hover:bg-gray-100 font-bold transition-colors"
                                        onClick={() => onDashboardAction('Maintenance and repair')}
                                    >
                                        View Maintenance Logs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="fleet">
                    <BiotechDeviceRegistry />
                </TabsContent>

                <TabsContent value="work-orders">
                    <BiotechMaintenanceHub />
                </TabsContent>

                <TabsContent value="services">
                    <ServiceManagement
                        userId={user?.id}
                        centerId={(profile as any)?.centerId}
                        centerType={(profile as any)?.centerType || 'biotech'}
                    />
                </TabsContent>

                <TabsContent value="settings">
                    <Card className="border-none shadow-sm rounded-2xl">
                        <CardHeader>
                            <CardTitle>System Configuration</CardTitle>
                            <CardDescription>Manage environment variables and node connectivity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 italic">
                                <Settings className="h-12 w-12 text-gray-200 mb-4" />
                                <p>No system configurations found.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}

function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}