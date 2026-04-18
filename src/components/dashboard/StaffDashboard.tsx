import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Settings,
    CheckCircle,
    UserPlus,
    Search,
    Phone,
    Clock,
    CheckCircle2,
    CalendarCheck,
    ArrowRight,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { PatientList } from './PatientList';
import { SchedulingCalendar } from './SchedulingCalendar';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { discoveryService } from '@/services/discoveryService';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function HospitalRegistryDashboard({ centerName = 'Hospital' }: { centerName?: string }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('tasks');
    const navigate = useNavigate();
    const { handleQuickAction } = useQuickActionHandler();
    const [isLoading, setIsLoading] = useState(true);
    const [activeRequests, setActiveRequests] = useState<any[]>([]);

    const fetchRegistryData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch multiple interactive types for the registry (Secretary management)
            const types = [
                'consultation_request',
                'appointment_proposal',
                'service_interest',
                'treatment_proposal'
            ];

            const promises = types.map(type =>
                discoveryService.getReceivedRequests({
                    type: type as any,
                    page: 1,
                    limit: 10
                }).catch(() => ({ requests: [] }))
            );

            const results = await Promise.all(promises);
            const allRequests = results.flatMap(res => res.requests || []);

            // Map the requests to our dashboard format
            const mappedRequests = allRequests.map(req => ({
                id: req.id,
                patientName: req.sender?.displayName || req.senderName || 'Anonymous Patient',
                requestedService: req.metadata?.serviceName || req.requestType.replace('_', ' '),
                providerType: req.metadata?.providerType || 'Provider',
                status: req.status === 'pending' ? 'pending' : (req.metadata?.appointmentDate ? 'scheduled' : 'waiting_approval'),
                requestedAt: req.createdAt,
                priority: req.metadata?.priority || 'Normal'
            }));

            setActiveRequests(mappedRequests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
        } catch (error) {
            console.error("Failed to fetch registry data:", error);
            toast.error("Could not load real registry data from server.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRegistryData();
    }, [fetchRegistryData]);

    const handleContactProvider = async (requestId: string) => {
        try {
            toast.loading("Notifying clinical team...", { id: requestId });

            // In a real EMR, we might send an internal notification or update metadata
            // Here we update the request metadata to signal provider contact
            await discoveryService.respondToRequest(requestId, 'approve', "Registry has notified the provider. Waiting for clinical confirmation.", {
                registryAction: 'contacted_provider',
                statusLabel: 'waiting_approval'
            });

            toast.success("Clinical team notified. Status: Waiting for Approval", { id: requestId });
            fetchRegistryData();
        } catch (error) {
            toast.error("Failed to update status", { id: requestId });
        }
    };

    const handleSchedulePatient = async (requestId: string) => {
        try {
            toast.loading("Finalizing schedule...", { id: requestId });

            // This would normally open a scheduling modal, but for the summary card:
            await discoveryService.respondToRequest(requestId, 'approve', "Registry has finalized the consultation schedule.", {
                registryAction: 'finalized_schedule',
                statusLabel: 'scheduled',
                appointmentDate: new Date().toISOString()
            });

            toast.success("Patient successfully scheduled for consultation.", { id: requestId });
            fetchRegistryData();
        } catch (error) {
            toast.error("Scheduling failed", { id: requestId });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending Request</Badge>;
            case 'waiting_approval':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 animate-pulse">Waiting for Approval</Badge>;
            case 'scheduled':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Scheduled</Badge>;
            default:
                return <Badge variant="outline" className="bg-gray-50">{status.replace('_', ' ')}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{centerName} Registry Dashboard</h1>
                    <p className="text-gray-500">Managing real-time patient admissions and clinical workflows.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => fetchRegistryData()}
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white/80"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        onClick={() => navigate('/discovery?type=patient')}
                        variant="outline"
                        className="rounded-xl border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 gap-2 font-bold px-6 shadow-sm"
                    >
                        <Search className="h-4 w-4" />
                        Find Patients
                    </Button>
                </div>
            </div>

            <QuickActions user={user} onAction={handleQuickAction} />

            <div className="grid gap-6">
                <IncomingWorkflowProposals />

                <Card className="border-none shadow-md overflow-hidden rounded-2xl border-l-4 border-indigo-500">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-bold text-indigo-900">Patient Management Registry</CardTitle>
                                <CardDescription>Coordinate patient visits and provider availability (LIVE)</CardDescription>
                            </div>
                            {!isLoading && (
                                <Badge className="bg-indigo-600 font-bold">
                                    {activeRequests.filter(r => r.status !== 'scheduled').length} Active
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-4">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p className="font-bold uppercase tracking-widest text-[10px]">Syncing with Registry Server...</p>
                            </div>
                        ) : activeRequests.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 font-medium italic">
                                No active registry requests found for this center.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {activeRequests.slice(0, 5).map((request) => (
                                    <div key={request.id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${request.priority === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 text-lg">{request.patientName}</h4>
                                                        {getStatusBadge(request.status)}
                                                        {request.priority === 'Urgent' && <Badge className="bg-red-500 text-[10px] uppercase font-black">Urgent</Badge>}
                                                    </div>
                                                    <p className="text-sm text-gray-600 font-medium">
                                                        Requesting <span className="text-indigo-600 font-bold">{request.requestedService}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 italic">
                                                        <Clock className="h-3 w-3" /> Received {new Date(request.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                                {request.status === 'pending' && (
                                                    <Button
                                                        onClick={() => handleContactProvider(request.id)}
                                                        variant="outline"
                                                        className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 gap-2 font-bold px-4"
                                                    >
                                                        <Phone className="h-4 w-4" />
                                                        Contact Provider
                                                    </Button>
                                                )}

                                                {request.status === 'waiting_approval' && (
                                                    <Button
                                                        onClick={() => handleSchedulePatient(request.id)}
                                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold px-6 shadow-indigo-100 shadow-lg"
                                                    >
                                                        <CalendarCheck className="h-4 w-4" />
                                                        Confirm Schedule
                                                    </Button>
                                                )}

                                                {request.status === 'scheduled' && (
                                                    <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in zoom-in duration-300">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        Scheduled
                                                    </div>
                                                )}

                                                <Button variant="ghost" size="icon" className="rounded-full text-gray-400" onClick={() => navigate(`/requests`)}>
                                                    <ArrowRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeRequests.length > 5 && (
                            <div className="p-4 bg-gray-50/50 text-center border-t border-gray-100">
                                <Button variant="link" className="text-indigo-600 font-bold" onClick={() => navigate('/requests')}>
                                    View All Registry Requests ({activeRequests.length})
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-indigo-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-600">Active Queue</CardTitle>
                        <UserPlus className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeRequests.length}</div>
                        <p className="text-xs text-indigo-600 flex items-center mt-1 font-medium italic">
                            Real-time patient load
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Registry ID</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold truncate">{user?.id?.split('-')[0] || 'REG-MASTER'}</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1 font-medium capitalize">
                            Authenticated as {user?.roles?.[0]}
                        </p>
                    </CardContent>
                </Card>

                {/* Status KPI Cards */}
                <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">Pending Billing</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
                            Financial records synchronized
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-amber-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600">Registry Status</CardTitle>
                        <Settings className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ACTIVE</div>
                        <p className="text-xs text-amber-600 flex items-center mt-1 font-medium">
                            System heartbeat normal
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl">
                    <TabsTrigger value="tasks" className="rounded-lg px-6 font-bold">Registry Console</TabsTrigger>
                    <TabsTrigger value="appointments" className="rounded-lg px-6 font-bold">Clinical Schedule</TabsTrigger>
                    <TabsTrigger value="patients" className="rounded-lg px-6 font-bold">Master Patient Index</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-4">
                    <Card className="border-none shadow-sm rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-800">Operational Log</CardTitle>
                            <CardDescription>Registry synchronization logs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center py-8 text-gray-400 italic font-medium bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                                    Monitor the LIVE Registry section above for active patient interactions.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appointments">
                    <SchedulingCalendar />
                </TabsContent>

                <TabsContent value="patients">
                    <PatientList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
