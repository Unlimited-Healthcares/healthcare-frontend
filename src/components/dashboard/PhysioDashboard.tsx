import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Dumbbell,
    Accessibility,
    Target,
    Users,
    Video,
    Clock,
    Search,
    Stethoscope,
    PersonStanding,
    History,
    TrendingUp,
    Plus,
    PlusCircle,
    ChevronRight,
    ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { SpecialtyUpdateModal } from './SpecialtyUpdateModal';
import { PhysioAssessmentHub } from './PhysioAssessmentHub';
import { RehabPlanCreator } from './RehabPlanCreator';
import { ClinicalTimeline } from './ClinicalTimeline';
import { patientService } from '@/services/patientService';

export const PhysioDashboard = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
    const { handleQuickAction } = useQuickActionHandler();

    const [patients, setPatients] = useState<any[]>([]);

    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoading(true);
            try {
                const result = await patientService.getPatients({ limit: 10 });
                setPatients(result.data || []);
            } catch (error) {
                console.error("Failed to fetch patients:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const displayName = profile?.name || user?.name || 'Physiotherapist';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Physiotherapy Dashboard</h1>
                    <p className="text-gray-500">{displayName}. Rehabilitation & Functional Mobility Hub.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => navigate('/discovery?type=patient')}
                        variant="outline"
                        className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 gap-2 font-bold px-6 shadow-sm"
                    >
                        <Search className="h-4 w-4" />
                        Find Referrals
                    </Button>
                    <Button
                        onClick={() => setIsSpecialtyModalOpen(true)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold px-6 shadow-md shadow-emerald-100"
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
                role="practitioner"
            />

            <QuickActions user={user} onAction={handleQuickAction} />
            <IncomingWorkflowProposals />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-emerald-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">Active Cases</CardTitle>
                        <Accessibility className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : patients.length}</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            Current rehab programs
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-indigo-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-600">New Referrals</CardTitle>
                        <PlusCircle className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">04</div>
                        <p className="text-xs text-indigo-600 flex items-center mt-1">
                            Awaiting initial assessment
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Goals Met</CardTitle>
                        <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                            Recovery milestones achieved
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-amber-50/50 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600">Avg. ROM Improvement</CardTitle>
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+15%</div>
                        <p className="text-xs text-amber-600 flex items-center mt-1">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto overflow-y-hidden">
                    <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
                    <TabsTrigger value="assessment" className="rounded-lg px-6">Physical Assessment</TabsTrigger>
                    <TabsTrigger value="rehab" className="rounded-lg px-6">Home Program (HEP)</TabsTrigger>
                    <TabsTrigger value="collaboration" className="rounded-lg px-6">MDT Sessions</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg px-6">Rehab Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-lg font-bold">Current Rehabilitation Load</CardTitle>
                                <CardDescription>Managing patient recovery pathways</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {patients.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                                                    {p.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{p.fullName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target: Walk 50m • Week 2/4</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-slate-300 hover:text-emerald-600" onClick={() => setActiveTab('assessment')}>
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-3 space-y-6">
                            <Card className="border-none shadow-sm rounded-2xl bg-indigo-600 text-white overflow-hidden">
                                <CardHeader className="border-b border-white/10">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <History className="h-4 w-4 text-indigo-300" /> Recent Referrals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {[
                                        { name: 'Alice Peterson', diag: 'Post-Surgery (Hip)', time: '2h ago' },
                                        { name: 'Sam Jones', diag: 'Post-Stroke (Right)', time: '5h ago' }
                                    ].map((ref, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                            <div>
                                                <p className="text-xs font-black uppercase">{ref.name}</p>
                                                <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest">{ref.diag}</p>
                                            </div>
                                            <Badge className="bg-white text-indigo-600 text-[8px] font-black">{ref.time}</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="p-8 bg-emerald-500 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-emerald-100">
                                <Video className="h-8 w-8" />
                                <h4 className="text-lg font-black uppercase tracking-tight">Multi-Person Progress Review</h4>
                                <p className="text-xs font-bold text-emerald-100 leading-relaxed mb-4">Host a session with the patient, caregiver, and lead doctor to adjust exercise intensity.</p>
                                <Button className="w-full h-12 bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-700/20">
                                    Start Review Call
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="assessment">
                    {patients.length > 0 ? (
                        <PhysioAssessmentHub patient={{ name: patients[0].fullName }} />
                    ) : (
                        <div className="py-20 text-center text-slate-300 italic">Select a patient to begin physical assessment.</div>
                    )}
                </TabsContent>

                <TabsContent value="rehab">
                    <RehabPlanCreator patientId={patients[0]?.id || 'default'} />
                </TabsContent>

                <TabsContent value="collaboration">
                    <div className="flex flex-col items-center justify-center p-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-center">
                        <Users className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-600 uppercase tracking-tight">Active MDT Sessions</h3>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Collaborative progress reviews involving Patient, Caregiver, and Doctor will appear here.</p>
                        <Button className="mt-8 bg-emerald-600 text-white rounded-xl h-12 px-8 font-black uppercase text-xs tracking-widest gap-2">
                            <PlusCircle className="h-4 w-4" /> New Session Invite
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold">Longitudinal Recovery Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <ClinicalTimeline />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
