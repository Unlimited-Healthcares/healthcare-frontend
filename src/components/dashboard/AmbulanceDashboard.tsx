import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Truck,
    Users,
    Clock,
    Activity,
    AlertCircle,
    CheckCircle2,
    Navigation,
    Shield,
    Stethoscope,
    ArrowUpRight
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { FacilityManagement } from './FacilityManagement';
import { EmergencySOS } from './EmergencySOS';
import { AmbulanceMissionDashboard } from './AmbulanceMissionDashboard';
import { DashboardTasks } from './DashboardTasks';
import { ClinicalTimeline } from './ClinicalTimeline';
import { DashboardAlerts } from './DashboardAlerts';
import { ServiceManagement } from './ServiceManagement';

import { useAnalytics } from '@/hooks/useAnalytics';
import { EmergencyList } from '@/components/emergency/EmergencyList';
import { emergencyService } from '@/services/emergencyService';
import { healthcareCentersService } from '@/services/healthcareCentersService';
import { RequestStatus, AmbulanceRequest } from '@/types/emergency';
import { toast } from 'sonner';
import { EnterpriseHeader } from './EnterpriseHeader';
import { useCenterProfile } from '@/hooks/useCenterProfile';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { FleetLiveMap } from '@/components/emergency/FleetLiveMap';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const activityData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 15 },
    { name: 'Wed', count: 10 },
    { name: 'Thu', count: 18 },
    { name: 'Fri', count: 22 },
    { name: 'Sat', count: 25 },
    { name: 'Sun', count: 20 },
];

interface AmbulanceDashboardProps {
    centerId: string;
    centerType?: string;
    centerName?: string;
}

export function AmbulanceDashboard({ centerId, centerType, centerName }: AmbulanceDashboardProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [pendingRequests, setPendingRequests] = useState<AmbulanceRequest[]>([]);
    const [activeUnits, setActiveUnits] = useState<AmbulanceRequest[]>([]);
    const [staffMembers, setStaffMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewingMission, setViewingMission] = useState<AmbulanceRequest | null>(null);
    const { user } = useAuth();
    const { trackUserAction } = useAnalytics(centerId);
    const { profile, loading: loadingProfile } = useCenterProfile(centerId);

    const loadEmergencyData = async () => {
        try {
            setLoading(true);
            const response = await emergencyService.getAmbulanceRequests({});
            const allRequests = response.data || [];

            // Pending Requests (triage)
            setPendingRequests(allRequests.filter(req => req.status === RequestStatus.PENDING));

            // Active Units (on missions)
            setActiveUnits(allRequests.filter(req => [
                RequestStatus.DISPATCHED,
                RequestStatus.EN_ROUTE,
                RequestStatus.ON_SCENE,
                RequestStatus.TRANSPORTING
            ].includes(req.status as RequestStatus)));

        } catch (error) {
            console.error('Failed to load ambulance requests:', error);
            toast.error('Failed to sync live emergency data');
        } finally {
            setLoading(false);
        }
    };

    const loadStaff = async () => {
        try {
            const response = await healthcareCentersService.getCenterStaff(centerId);
            setStaffMembers(response || []);
        } catch (error) {
            console.error('Failed to load center staff:', error);
        }
    };

    useEffect(() => {
        loadEmergencyData();
        loadStaff();
    }, [centerId]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        trackUserAction('tab_change', 'ambulance_dashboard', { tab: value });
    };

    const { handleQuickAction } = useQuickActionHandler();

    if (viewingMission) {
        return (
            <AmbulanceMissionDashboard 
                request={viewingMission} 
                onBack={() => setViewingMission(null)} 
                onUpdate={loadEmergencyData}
            />
        );
    }

    return (
        <div className="space-y-6">
            <EnterpriseHeader profile={profile} isLoading={loadingProfile} />

            <div className="-mt-6 space-y-4">
                <QuickActions onAction={handleQuickAction} user={user} />
                <IncomingWorkflowProposals />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-red-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">Active Runs</CardTitle>
                        <Navigation className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeUnits.length}</div>
                        <p className="text-xs text-red-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            {activeUnits.filter(u => u.status === RequestStatus.EN_ROUTE).length} en route to scene/hospital
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-amber-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600">Pending Requests</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRequests.length}</div>
                        <p className="text-xs text-amber-600 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Avg wait: 8 mins
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Total Personnel</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{staffMembers.length}</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                            <Shield className="h-3 w-3 mr-1" />
                            Active on shift
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">Completed Today</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" />
                            100% success rate
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                <div className="md:col-span-8 space-y-6">
                    <DashboardTasks />
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-100">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-black uppercase tracking-tight text-slate-900">Emergency Mission Timeline</CardTitle>
                                    <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Dispatch Progression</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <ClinicalTimeline />
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-4 space-y-6">
                    <DashboardAlerts />
                    <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-[32px] p-6 text-white shadow-xl">
                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">ER MDT Escalation</h3>
                        <p className="text-xs text-white/70 font-bold mb-6 leading-relaxed">Directly notify ER doctors and prepare teams for incoming critical patients.</p>
                        <div className="space-y-3">
                            <Button 
                                onClick={() => navigate('/video-conferences')}
                                className="w-full rounded-2xl py-6 bg-white/20 hover:bg-white/30 border-none text-white font-black uppercase tracking-widest text-xs gap-3"
                            >
                                <Users className="h-4 w-4" /> Relate ER MDT
                            </Button>
                            <EmergencySOS />
                        </div>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl flex flex-wrap h-auto gap-1">
                    <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="dispatch" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Live Dispatch</TabsTrigger>
                    <TabsTrigger value="requests" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Pending Calls</TabsTrigger>
                    <TabsTrigger value="fleet" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Fleet & Teams</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Services</TabsTrigger>

                    <TabsTrigger value="management" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Management</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Response Volume Trends</CardTitle>
                                <CardDescription>Emergency calls processed over the last 7 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={activityData}>
                                            <defs>
                                                <linearGradient id="colorAmbulance" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAmbulance)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Active Ambulance Teams</CardTitle>
                                <CardDescription>Current status of field teams</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {activeUnits.length > 0 ? (
                                        activeUnits.map((req, i) => (
                                            <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                                                            <Truck className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold text-gray-900">{req.ambulanceId || 'UNIT-PENDING'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {req.teamPersonnel?.some(p => p.role === 'Doctor' || p.role === 'Nurse') && (
                                                            <div className="h-4 w-4 bg-emerald-100 rounded-full flex items-center justify-center" title="Expert Team - Clinical Access Active">
                                                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                            </div>
                                                        )}
                                                        <Badge variant={req.status === 'en_route' ? 'destructive' : req.status === 'on_scene' ? 'outline' : 'secondary'}>
                                                            {req.status?.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>{req.teamPersonnel?.map(p => p.name).join(', ') || 'Team Assigning...'}</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => setViewingMission(req)}
                                                        className="h-6 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50"
                                                    >
                                                        Join Mission <ArrowUpRight className="h-3 w-3 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No units in field</p>
                                        </div>
                                    )}
                                    <Button variant="outline" className="w-full mt-2 rounded-xl border-gray-200" onClick={() => setActiveTab('fleet')}>View Full Fleet</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="dispatch">
                    <FleetLiveMap />
                </TabsContent>

                <TabsContent value="requests">
                    <div className="space-y-4">
                        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white">
                                <CardTitle>Incoming Emergency Calls</CardTitle>
                                <CardDescription>Triage and dispatch teams to these locations</CardDescription>
                            </CardHeader>
                            <CardContent className="bg-white px-0">
                                <EmergencyList
                                    activeTab="ambulances"
                                    ambulanceRequests={pendingRequests}
                                    alerts={[]}
                                    viralReports={[]}
                                    loading={loading}
                                    error={null}
                                    pagination={{ page: 1, limit: 10, total: pendingRequests.length, totalPages: 1 }}
                                    userRole="ambulance_service"
                                    staffMembers={staffMembers}
                                    onAcknowledgeAlert={() => { }}
                                    onResolveAlert={() => { }}
                                    onDispatchAmbulance={async (id, team) => {
                                        try {
                                            await emergencyService.updateRequestStatus(id, { status: 'dispatched', teamPersonnel: team });
                                            toast.success('Ambulance dispatched successfully');
                                            loadEmergencyData();
                                        } catch (e) {
                                            toast.error('Failed to dispatch ambulance');
                                        }
                                    }}
                                    onUpdateAmbulanceStatus={async (id, status, metadata) => {
                                        try {
                                            await emergencyService.updateRequestStatus(id, { status, ...metadata });
                                            toast.success(`Status updated to ${status.replace('_', ' ')}`);
                                            loadEmergencyData();
                                        } catch (e) {
                                            toast.error('Failed to update status');
                                        }
                                    }}
                                    onReviewReport={() => { }}
                                    onVerifyReport={() => { }}
                                    onPageChange={() => { }}
                                    onCancelAmbulance={async (id) => {
                                        try {
                                            await emergencyService.updateRequestStatus(id, { status: 'cancelled' });
                                            toast.success('Ambulance request cancelled');
                                            loadEmergencyData();
                                        } catch (e) {
                                            toast.error('Failed to cancel request');
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="fleet">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-red-600" />
                                    Fleet Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {activeUnits.length > 0 ? (
                                        activeUnits.map(unit => (
                                            <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white">
                                                        <Truck className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{unit.ambulanceId || 'UNIT-000'}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{unit.status}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-emerald-500">In Mission</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <Shield className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-tight">Establishing Fleet Sync...<br /><span className="text-[10px] font-medium">Ready for deployment</span></p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-red-600" />
                                    Medical Personnel
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {staffMembers.length > 0 ? (
                                        staffMembers.slice(0, 5).map(staff => (
                                            <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                                                        {staff.profile?.name?.[0] || staff.name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{staff.profile?.name || staff.name || 'Staff Member'}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{staff.role || 'Responder'}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-blue-500">On Duty</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-6 text-center text-gray-400 italic text-sm">
                                            No staff members registered
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="services">
                    <ServiceManagement centerId={centerId} />
                </TabsContent>



                <TabsContent value="management">
                    <FacilityManagement centerId={centerId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
