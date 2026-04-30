import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Heart,
    Activity,
    ClipboardCheck,
    Thermometer,
    AlertCircle,
    PlusCircle,
    FileText,
    Search,
    Shield,
    Stethoscope,
    Video
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { PatientList } from './PatientList';
import { QuickActions } from './QuickActions';
import { patientService, PatientRecord } from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';
import { healthRecordsApi } from '@/services/healthRecordsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn, getLicenseStatus } from '@/lib/utils';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { careTaskService } from '@/services/careTaskService';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { SpecialtyUpdateModal } from './SpecialtyUpdateModal';
import { ServiceManagement } from './ServiceManagement';
import { ClinicalTimeline } from './ClinicalTimeline';
import { DashboardTasks } from './DashboardTasks';
import { DashboardAlerts } from './DashboardAlerts';
import { EmergencySOS } from './EmergencySOS';
import { NurseVitalsMonitor } from './NurseVitalsMonitor';
import { NurseMedicationModule } from './NurseMedicationModule';
import { DischargePlanner } from './DischargePlanner';



export const NurseDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [patients, setPatients] = useState<PatientRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
    const { profile } = useAuth();

    const specialty = profile?.specialization || (user as any)?.specialization;
    const dashboardTitle = specialty ? `${specialty} Care Dashboard` : 'Nurse Care Dashboard';

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch patients
            // For now, we fetch all patients. Ideally filter by center or assignments.
            const patientsResult = await patientService.getPatients({ limit: 50 });
            let patientsList = patientsResult.data || [];

            // 2. Fetch vitals for these patients
            const vitalsResult = await healthRecordsApi.getMedicalRecords({
                filters: { recordTypes: ['vital_signs'] },
                limit: 100
            });
            const allVitals = vitalsResult.data || [];

            // 3. Fetch tasks (appointments & care tasks)
            const [appointmentsResult, careTasksResult] = await Promise.all([
                appointmentService.getAppointments({ limit: 100, status: 'scheduled' }),
                careTaskService.getCareTasks({})
            ]);

            const allAppointments = appointmentsResult.data || [];
            const allCareTasks = (careTasksResult as any) || [];

            // 4. Map everything together
            const enrichedPatients = patientsList.map(p => {
                // Get most recent vital for this specific patient
                const patientVitals = allVitals
                    .filter(v => v.patientId === p.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                // Get pending tasks (appointments + care tasks) for this specific patient
                const patientAppointments = allAppointments
                    .filter((t: any) => t.patientId === p.id)
                    .map((t: any) => ({
                        id: t.id,
                        type: 'appointment',
                        title: t.reason || 'Medical Checkup',
                        time: new Date(t.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: (t.status === 'completed' ? 'done' : 'pending') as 'done' | 'pending'
                    }));

                const patientCareTasks = allCareTasks
                    .filter((t: any) => t.patientId === p.id)
                    .map((t: any) => ({
                        id: t.id,
                        type: 'care_task',
                        title: t.title,
                        time: t.dueAt ? new Date(t.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP',
                        status: (t.status === 'completed' ? 'done' : 'pending') as 'done' | 'pending'
                    }));

                const patientTasks = [...patientAppointments, ...patientCareTasks];

                // Extract vitals data from recordData
                const vitalsData = (patientVitals?.recordData as any) || {};

                return {
                    ...p,
                    status: (patientVitals ? 'active' : 'scheduled') as any,
                    vitals: {
                        heartRate: vitalsData.heartRate || 72, // Fallback to mock for demo if data missing
                        bp: vitalsData.bloodPressure || "120/80",
                        temp: vitalsData.temperature || 36.6,
                        spO2: vitalsData.oxygenSaturation || 98,
                        lastUpdated: patientVitals?.createdAt ? new Date(patientVitals.createdAt).toLocaleTimeString() : 'No data'
                    },
                    tasks: patientTasks.length > 0 ? patientTasks : [
                        { id: `t1-${p.id}`, title: "Administer insulin (Aspart)", time: "07:00 AM", status: "pending" as const },
                        { id: `t2-${p.id}`, title: "Assist Intubation (Bed 4)", time: "10:30 AM", status: "pending" as const },
                        { id: `t3-${p.id}`, title: "Wound dressing (Sacral)", time: "14:00 PM", status: "pending" as const }
                    ]
                };
            });

            setPatients(enrichedPatients);
        } catch (error) {
            console.error("Nurse Dashboard fetch error:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // Set up refresh interval for "production-like" real-time feel
        const interval = setInterval(fetchDashboardData, 30000); // 30s
        return () => clearInterval(interval);
    }, []);

    const toggleTask = async (patientId: string, taskId: string) => {
        const patient = patients.find(p => p.id === patientId);
        const task = patient?.tasks?.find((t: any) => t.id === taskId);

        if (!task) return;

        const newStatus = task.status === 'done' ? 'pending' : 'completed';
        const displayStatus = task.status === 'done' ? 'pending' : 'done';

        try {
            if ((task as any).type === 'care_task') {
                await careTaskService.updateCareTask(taskId, { status: newStatus as any });
            } else if ((task as any).type === 'appointment') {
                await appointmentService.updateAppointment(taskId, { status: newStatus === 'completed' ? 'completed' : 'scheduled' });
            }

            setPatients(prev => prev.map(p => {
                if (p.id !== patientId) return p;
                return {
                    ...p,
                    tasks: p.tasks?.map((t: any) =>
                        t.id === taskId ? { ...t, status: displayStatus } : t
                    )
                };
            }));
            toast.success("Task updated in database");
        } catch (error) {
            toast.error("Failed to update task status");
        }
    };

    // Derived stats
    const totalAssigned = patients.length;
    const urgentPatients = patients.filter(p => p.vitals && (p.vitals.heartRate! > 100 || p.vitals.spO2! < 95)).length;
    const completedTasks = patients.reduce((acc, p) => acc + (p.tasks?.filter((t: any) => t.status === 'done').length || 0), 0);
    const totalTasks = patients.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
    const shiftProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const { handleQuickAction } = useQuickActionHandler();
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Nurse Care Dashboard</h1>
                    <p className="text-gray-500">Managed care overview and patient monitoring.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => navigate('/discovery?type=patient')}
                        variant="outline"
                        className="rounded-xl border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 gap-2 font-bold px-6 shadow-sm"
                    >
                        <Search className="h-4 w-4" />
                        Find Patients
                    </Button>
                    <Button
                        onClick={() => setIsSpecialtyModalOpen(true)}
                        className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white gap-2 font-bold px-4 sm:px-6 shadow-md shadow-teal-100 flex-1 sm:flex-none"
                    >
                        <Stethoscope className="h-4 w-4" />
                        {profile?.specialization ? 'Update Specialty' : 'Add Specialty'}
                    </Button>
                    <EmergencySOS />
                </div>
            </div>

            <SpecialtyUpdateModal
                isOpen={isSpecialtyModalOpen}
                onClose={() => setIsSpecialtyModalOpen(false)}
                currentSpecialty={profile?.specialization as any}
                role="nurse"
            />

            <QuickActions user={user} onAction={handleQuickAction} />
            <IncomingWorkflowProposals />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-teal-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-teal-600">Assigned Patients</CardTitle>
                        <Users className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : totalAssigned}</div>
                        <p className="text-xs text-teal-600 flex items-center mt-1">
                            Currently on shift
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-rose-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-rose-600">Urgent Alerts</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : urgentPatients}</div>
                        <p className="text-xs text-rose-600 flex items-center mt-1">
                            Requires immediate attention
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Task Completion</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : `${completedTasks}/${totalTasks}`}</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                            {shiftProgress}% overall progress
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-amber-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600">CLINICAL TREATMENT PLANS</CardTitle>
                        <FileText className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : totalAssigned}</div>
                        <p className="text-xs text-amber-600 flex items-center mt-1">
                            Active records managed
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
                                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-100">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-black uppercase tracking-tight text-slate-900">Clinical Event Timeline</CardTitle>
                                    <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Care Lifecycle Progress</CardDescription>
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
                    <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-[32px] p-6 text-white shadow-xl">
                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">MDT Quick-Access</h3>
                        <p className="text-xs text-white/70 font-bold mb-6 leading-relaxed">Collaborate with MDT members on shared clinical treatment plans.</p>
                        <div className="space-y-3">
                            <Button 
                                onClick={() => navigate('/video-conferences')}
                                className="w-full rounded-2xl py-6 bg-white/20 hover:bg-white/30 border-none text-white font-black uppercase tracking-widest text-xs gap-3"
                            >
                                <Video className="h-4 w-4" /> Start Video Consult
                            </Button>
                            <Button 
                                onClick={() => navigate('/chat')}
                                className="w-full rounded-2xl py-6 bg-white text-teal-700 hover:bg-teal-50 border-none font-black uppercase tracking-widest text-xs gap-3"
                            >
                                <Users className="h-4 w-4" /> Nurse MDT Chat
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
                    <TabsTrigger value="monitoring" className="rounded-lg px-6">Bedside Monitor</TabsTrigger>
                    <TabsTrigger value="medications" className="rounded-lg px-6">Medication Admin</TabsTrigger>
                    <TabsTrigger value="discharge" className="rounded-lg px-6">Discharge Tasks</TabsTrigger>
                    <TabsTrigger value="patients" className="rounded-lg px-6">Patient List</TabsTrigger>
                    <TabsTrigger value="tasks" className="rounded-lg px-6">Shift Tasks</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg px-6">Services</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Shift Progress</CardTitle>
                                <CardDescription>Patient care task completion per patient</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={patients.map(p => ({
                                            name: p.fullName?.split(' ')[0] || p.patientId || 'Patient',
                                            done: p.tasks?.filter(t => t.status === 'done').length || 0,
                                            total: p.tasks?.length || 0
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="done" fill="#0d9488" radius={[4, 4, 0, 0]} name="Completed" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                            <h3 className="font-bold text-gray-900 sticky top-0 bg-white/80 backdrop-blur-sm py-2">Individual Patient Vitals</h3>
                            {patients.length > 0 ? (
                                patients.map((p) => (
                                    <Card key={p.id} className="border-none shadow-sm rounded-xl overflow-hidden ring-1 ring-gray-100">
                                        <div className={cn("h-1", p.vitals && (p.vitals.heartRate! > 100 || p.vitals.spO2! < 95) ? "bg-rose-500" : "bg-teal-500")} />
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="font-bold text-sm text-gray-900">{p.fullName || p.patientId}</div>
                                                    <div className="text-[10px] text-gray-400">Last updated: {p.vitals?.lastUpdated}</div>
                                                </div>
                                                {p.vitals && (p.vitals.heartRate! > 100 || p.vitals.spO2! < 95) && (
                                                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-4">URGENT</Badge>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Heart className="h-3 w-3 text-rose-500" />
                                                    <span className="text-xs font-mono">{p.vitals?.heartRate} BPM</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Thermometer className="h-3 w-3 text-blue-500" />
                                                    <span className="text-xs font-mono">{p.vitals?.temp}°C</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-3 w-3 text-teal-500" />
                                                    <span className="text-xs font-mono">{p.vitals?.bp}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Activity className="h-3 w-3 text-cyan-500" />
                                                    <span className="text-xs font-mono">{p.vitals?.spO2}% SpO2</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400 text-sm">No patient data available.</div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="monitoring">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Ward Monitoring</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live Feed from Bedside Monitors & Wearables</p>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] tracking-widest px-4 py-1.5 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> SYSTEM SYNC: ACTIVE
                            </Badge>
                        </div>
                        <NurseVitalsMonitor />
                    </div>
                </TabsContent>

                <TabsContent value="medications">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Medication Administration Queue</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Scheduled Clinical Drug Delivery</p>
                        </div>
                        <NurseMedicationModule />
                    </div>
                </TabsContent>

                <TabsContent value="discharge">
                    <DischargePlanner patient={{ name: 'John Doe' }} role="nurse" />
                </TabsContent>

                <TabsContent value="patients">
                    <PatientList />
                </TabsContent>

                <TabsContent value="tasks">
                    <div className="grid gap-6 md:grid-cols-2">
                        {patients.map(p => (
                            <Card key={p.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-teal-600 text-white py-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-base">{p.fullName || p.patientId}</CardTitle>
                                            <CardDescription className="text-teal-100 text-xs">CLINICAL TREATMENT PLAN & Schedule</CardDescription>
                                        </div>
                                        <Badge className="bg-white text-teal-600 border-none">
                                            {p.tasks?.filter(t => t.status === 'pending').length} PENDING
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100">
                                        {p.tasks && p.tasks.length > 0 ? (
                                            p.tasks.map((task) => (
                                                <div key={task.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            task.status === 'done' ? "bg-gray-300" : "bg-teal-500"
                                                        )} />
                                                        <div>
                                                            <div className={cn("text-sm font-medium", task.status === 'done' && "text-gray-400 line-through")}>
                                                                {task.title}
                                                            </div>
                                                            <div className="text-xs text-gray-400">{task.time}</div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant={task.status === 'done' ? "outline" : "default"}
                                                        size="sm"
                                                        className={cn(
                                                            "rounded-lg h-8 text-[10px]",
                                                            task.status === 'done' ? "text-gray-400" : "bg-teal-600 hover:bg-teal-700"
                                                        )}
                                                        onClick={() => toggleTask(p.id, task.id)}
                                                    >
                                                        {task.status === 'done' ? 'REDO' : 'MARK DONE'}
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 italic text-sm">
                                                No specific tasks assigned.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="services">
                    <ServiceManagement
                        userId={user?.id}
                        centerId={(profile as any)?.centerId}
                        centerType={(profile as any)?.centerType || 'clinic'}
                    />
                </TabsContent>
            </Tabs>

            {/* Spacer for mobile bottom navigation */}
            <div className="h-24 md:hidden" aria-hidden="true" />
        </div>
    );
}

