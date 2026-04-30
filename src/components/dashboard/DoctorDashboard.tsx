import { useState } from 'react';
import { patientService, PatientRecord } from '@/services/patientService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Users,
    Calendar,
    Activity,
    TrendingUp,
    Clock,
    ArrowUpRight,
    FileText,
    Plus,
    Search,
    Star,
    Shield,
    Cpu,
    Stethoscope,
    Video
} from 'lucide-react';
import { cn, getLicenseStatus } from '@/lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { PatientList } from './PatientList';
import { ColleagueList } from './ColleagueList';
import { SchedulingCalendar } from './SchedulingCalendar';
import { MedicalRecords } from './MedicalRecords';
import { DicomViewer } from './DicomViewer';
import { HealthRecordsCard } from './HealthRecordsCard';
import { AppointmentsCard } from './AppointmentsCard';
import { SpecialtyUpdateModal } from './SpecialtyUpdateModal';
import { ServiceManagement } from './ServiceManagement';
import { ClinicalTimeline } from './ClinicalTimeline';
import { DashboardTasks } from './DashboardTasks';
import { DashboardAlerts } from './DashboardAlerts';
import { EmergencySOS } from './EmergencySOS';
import { PhysicianPatientHub } from './PhysicianPatientHub';
import { DischargePlanner } from './DischargePlanner';
import { PatientPostDischargeHub } from './PatientPostDischargeHub';
import { EndOfLifeConfirmation } from './EndOfLifeConfirmation';
import { useAuth } from '@/hooks/useAuth';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { ClinicalRequestModal } from '../clinical/ClinicalRequestModal';
import { ClinicalReportModal } from '../clinical/ClinicalReportModal';
import { appointmentService } from '@/services/appointmentService';
import { medicalReportsService } from '@/services/medicalReportsService';
import { useEffect } from 'react';
import { toast } from 'sonner';

const appointmentStats: any[] = [];

export function DoctorDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
    const navigate = useNavigate();
    const { profile, user } = useAuth();
    const [viewingPatientHub, setViewingPatientHub] = useState<any>(null);
    const displayName = profile?.name || user?.name || 'Doctor';

    const { handleQuickAction } = useQuickActionHandler();
    const isAllied = user?.roles?.includes('allied_practitioner');
    const specialty = profile?.specialization || (user as any)?.specialization;
    const dashboardTitle = specialty ? `${specialty} Dashboard` : (isAllied ? 'Allied Healthcare Practitioner Dashboard' : 'Health Care Practitioner Dashboard');

    // Clinical Modals
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
    const [preselectedCategory, setPreselectedCategory] = useState<'diagnostic' | 'pharmacy' | 'imaging' | null>(null);
    const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
    const [stats, setStats] = useState({
        activePatients: 0,
        appointmentsToday: 0,
        pendingReports: 0,
        satisfaction: '4.9'
    });
    const [statsLoading, setStatsLoading] = useState(true);

    if (viewingPatientHub) {
        return (
            <PhysicianPatientHub 
                patient={viewingPatientHub} 
                onBack={() => setViewingPatientHub(null)} 
            />
        );
    }

    useEffect(() => {
        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                // Fetch counts in parallel
                const [patientsRes, appointmentsRes, reportsRes] = await Promise.all([
                    patientService.getPatients({ limit: 1 }),
                    appointmentService.getAppointments({
                        dateFrom: new Date().toISOString().split('T')[0],
                        dateTo: new Date().toISOString().split('T')[0],
                        limit: 1
                    }),
                    medicalReportsService.getMedicalReports({ limit: 1 })
                ]);

                // Update stats with proper total extraction
                setStats({
                    activePatients: patientsRes.total || (patientsRes as any).pagination?.total || 0,
                    appointmentsToday: (appointmentsRes as any).pagination?.total || (appointmentsRes as any).total || (appointmentsRes as any).data?.length || 0,
                    pendingReports: (reportsRes as any).pagination?.total || (reportsRes as any).total || (reportsRes as any).data?.length || 0,
                    satisfaction: '4.9'
                });
            } catch (error) {
                console.error("Dashboard stats fetch failed:", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const onDashboardAction = async (action: string, data?: any) => {
        if (action === 'ClinicalRequest' || action === 'Request') {
            setSelectedPatient(data?.patient || null);
            if (data?.category) {
                setPreselectedCategory(data.category);
            }
            setIsRequestModalOpen(true);
        } else if (action === 'ClinicalReport' || action === 'Review') {
            setSelectedPatient(data?.patient || null);
            setIsReportModalOpen(true);
        } else if (action === 'Call a Practitioner' || action === 'Call a doctor') {
            navigate('/discovery?type=doctor');
        } else if (action === 'ViewHistory' || action === 'OpenHub') {
            setViewingPatientHub(data?.patient || data);
        } else if (action === 'Escalate') {
            toast.warning(`ESCALATION: Emergency page sent to Dr. ${displayName}`, {
                description: `Patient ${data?.patientName} stability concern: ${data?.reason || 'Critical decline'}`
            });
        } else if (action === 'ViewHistory') {
        } else if (action.startsWith('Create ') || action === 'Refer Patient' || action === 'Initiate Medical Order') {
            const cleanAction = action.replace('Create ', '').replace('Initiate ', '').replace(' Order', '').trim();
            const clinicalMap: Record<string, string> = {
                'Medical Report': 'ClinicalReport',
                'Prescription & Diagnosis': 'prescription',
                'Care Task': 'care_task',
                'Appointment Schedule': 'appointment',
                'Call': 'call',
                'Treatment': 'treatment',
                'Treatment Schedule': 'treatment',
                'Diagnostic Request': 'diagnostic'
            };

            const category = clinicalMap[cleanAction];

            if (category === 'ClinicalReport') {
                setSelectedPatient(data?.patient || null);
                setIsReportModalOpen(true);
                return;
            }

            if (category || action === 'Initiate Medical Order') {
                setPreselectedCategory(category as any || null);
                if (data?.user) {
                    try {
                        const patient = await patientService.getPatientByUserId(data.user);
                        if (patient) setSelectedPatient(patient);
                    } catch (err) {
                        console.error("Failed to resolve patient:", err);
                    }
                }
                setIsRequestModalOpen(true);
                return;
            }
        } else if (action.startsWith('Review ')) {
            // Handle "Review" actions by navigating to records
            if (data?.user) {
                try {
                    // QuickActions provide userId, we need patientId for the records tab
                    const patient = await patientService.getPatientByUserId(data.user);
                    if (patient) {
                        setSelectedPatientId(patient.id);
                        setActiveTab('records');
                    } else {
                        toast.error("Could not find a clinical patient record for this user.");
                    }
                } catch (err) {
                    console.error("Failed to resolve patient for review:", err);
                }
            }
            handleQuickAction(action, data);
        } else {
            handleQuickAction(action, data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{dashboardTitle}</h1>
                    <p className="text-gray-500">Connecting with patients and colleagues. Here is your practice and collaboration overview.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Button
                        onClick={() => navigate('/discovery?type=patient')}
                        variant="outline"
                        className="rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 gap-2 font-bold px-4 sm:px-6 shadow-sm flex-1 sm:flex-none text-xs sm:text-sm justify-center whitespace-nowrap"
                    >
                        <Search className="h-4 w-4" />
                        Find patients/link Doctor
                    </Button>
                    <Button
                        onClick={() => navigate('/discovery?type=biotech_engineer')}
                        variant="outline"
                        className="rounded-xl border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 gap-2 font-bold px-4 sm:px-6 shadow-sm flex-1 sm:flex-none text-xs sm:text-sm justify-center whitespace-nowrap"
                    >
                        <Cpu className="h-4 w-4" />
                        Connect Biotech Specialist
                    </Button>
                    <Button
                        onClick={() => navigate('/discovery?type=doctor')}
                        variant="outline"
                        className="rounded-xl border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 gap-2 font-bold px-4 sm:px-6 shadow-sm flex-1 sm:flex-none text-xs sm:text-sm justify-center whitespace-nowrap"
                    >
                        <Users className="h-4 w-4" />
                        Find Colleagues
                    </Button>
                    <Button
                        onClick={() => setIsSpecialtyModalOpen(true)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold px-4 sm:px-6 shadow-md shadow-blue-100 flex-1 sm:flex-none text-xs sm:text-sm justify-center whitespace-nowrap"
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
                role={user?.roles?.[0] || 'doctor'}
            />

            <QuickActions onAction={onDashboardAction} user={user} />
            <IncomingWorkflowProposals />

            <ClinicalRequestModal
                isOpen={isRequestModalOpen}
                onClose={() => {
                    setIsRequestModalOpen(false);
                    setSelectedPatient(null);
                    setPreselectedCategory(null);
                }}
                currentDoctor={user}
                preselectedPatient={selectedPatient}
                preselectedCategory={preselectedCategory}
            />

            <ClinicalReportModal
                isOpen={isReportModalOpen}
                onClose={() => {
                    setIsReportModalOpen(false);
                    setSelectedPatient(null);
                }}
                preselectedPatient={selectedPatient}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Active Patients</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? '...' : stats.activePatients}</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +0 this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-purple-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600">Today's Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? '...' : stats.appointmentsToday}</div>
                        <p className="text-xs text-purple-600 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {stats.appointmentsToday > 0 ? `${stats.appointmentsToday} scheduled` : 'No upcoming visits'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">Reports Pending</CardTitle>
                        <FileText className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? '...' : stats.pendingReports}</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" />
                            {stats.pendingReports > 0 ? `${stats.pendingReports} in queue` : 'No pending reports'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Patient Satisfaction</CardTitle>
                        <Star className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.9/5.0</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1 font-medium">
                            <Activity className="h-3 w-3 mr-1" />
                            Based on 0 reviews
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
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-black uppercase tracking-tight text-slate-900">Clinical Event Timeline</CardTitle>
                                    <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Patient Journey</CardDescription>
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
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-6 text-white shadow-xl">
                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">MDT Quick-Access</h3>
                        <p className="text-xs text-white/70 font-bold mb-6 leading-relaxed">Initiate or join multi-person video consultations with specialized departments.</p>
                        <div className="space-y-3">
                            <Button 
                                onClick={() => navigate('/video-conferences')}
                                className="w-full rounded-2xl py-6 bg-white/20 hover:bg-white/30 border-none text-white font-black uppercase tracking-widest text-xs gap-3"
                            >
                                <Video className="h-4 w-4" /> Start Video Consult
                            </Button>
                            <Button 
                                onClick={() => navigate('/chat')}
                                className="w-full rounded-2xl py-6 bg-white text-blue-700 hover:bg-blue-50 border-none font-black uppercase tracking-widest text-xs gap-3"
                            >
                                <Users className="h-4 w-4" /> MDT Group Chat
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
                    <TabsTrigger value="patients" className="rounded-lg px-6">Patients</TabsTrigger>
                    <TabsTrigger value="colleagues" className="rounded-lg px-6">Colleagues</TabsTrigger>
                    <TabsTrigger value="appointments" className="rounded-lg px-6">Schedule</TabsTrigger>
                    <TabsTrigger value="records" className="rounded-lg px-6">Records</TabsTrigger>
                    <TabsTrigger value="discharge" className="rounded-lg px-6">Discharge Planner</TabsTrigger>
                    <TabsTrigger value="recovery" className="rounded-lg px-6">Recovery Support</TabsTrigger>
                    <TabsTrigger value="eol" className="rounded-lg px-6">EOL Protocol</TabsTrigger>
                    <TabsTrigger value="imaging" className="rounded-lg px-6">Imaging</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg px-6">Services</TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-lg px-6">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Appointment Trends</CardTitle>
                                <CardDescription>Weekly consultation volume</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        {appointmentStats.length > 0 ? (
                                            <AreaChart data={appointmentStats}>
                                                <defs>
                                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />
                                                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                            </AreaChart>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 italic">
                                                No trend data available.
                                            </div>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-3 space-y-4">
                            <AppointmentsCard />
                            <HealthRecordsCard />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="patients">
                    <PatientList
                        centerId={(profile as any)?.centerId}
                        onAction={(action, patient) => onDashboardAction(action, { patient })}
                    />
                </TabsContent>

                <TabsContent value="colleagues">
                    <ColleagueList />
                </TabsContent>

                <TabsContent value="appointments">
                    <SchedulingCalendar />
                </TabsContent>

                <TabsContent value="records">
                    <MedicalRecords
                        userRole="doctor"
                        patientId={selectedPatientId}
                        onAction={onDashboardAction}
                    />
                </TabsContent>

                <TabsContent value="discharge">
                    <DischargePlanner patient={{ name: 'John Doe' }} role="doctor" />
                </TabsContent>

                <TabsContent value="recovery">
                    <PatientPostDischargeHub patientId={selectedPatientId || 'default'} />
                </TabsContent>

                <TabsContent value="eol">
                    <EndOfLifeConfirmation patient={{ id: '8821', name: 'John Doe' }} currentDoctor={user} />
                </TabsContent>

                <TabsContent value="imaging">
                    <DicomViewer />
                </TabsContent>

                <TabsContent value="services">
                    <ServiceManagement
                        userId={user?.id}
                        centerId={(profile as any)?.centerId}
                        centerType={(profile as any)?.centerType || 'clinic'}
                    />
                </TabsContent>

                <TabsContent value="analytics">
                    <Card className="border-none shadow-sm rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Clinical Metrics</CardTitle>
                            <CardDescription>Key performance indicators</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    {appointmentStats.length > 0 ? (
                                        <BarChart data={appointmentStats}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 italic">
                                            No clinical metrics available.
                                        </div>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Spacer for mobile bottom navigation */}
            <div className="h-24 md:hidden" aria-hidden="true" />
        </div >
    );
}
