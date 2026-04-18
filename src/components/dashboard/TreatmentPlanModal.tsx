import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ClipboardList,
    Plus,
    Trash2,
    Save,
    FileText,
    User,
    Calendar,
    ArrowRight,
    Printer,
    CheckCircle2,
    Clock,
    Target,
    Activity,
    Edit3,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { medicalReportsService } from '@/services/medicalReportsService';
import { notificationService } from '@/services/notificationService';
import { CreateMedicalReportDto } from '@/types/medical-reports';

interface TreatmentGoal {
    id: string;
    goal: string;
    objectives: string[];
}

interface Intervention {
    id: string;
    description: string;
    frequency: string;
    duration: string;
}

interface TreatmentPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientName?: string;
    patientDob?: string;
    patientId?: string;
}

export const TreatmentPlanModal: React.FC<TreatmentPlanModalProps> = ({
    isOpen,
    onClose,
    patientName = "",
    patientDob = "",
    patientId = ""
}) => {
    const { user, profile } = useAuth();
    const [step, setStep] = useState<'edit' | 'preview' | 'success'>('edit');
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [diagnosis, setDiagnosis] = useState('');
    const [presentingProblems, setPresentingProblems] = useState(['', '', '']);
    const [goals, setGoals] = useState<TreatmentGoal[]>([
        { id: '1', goal: '', objectives: ['', ''] }
    ]);
    const [interventions, setInterventions] = useState<Intervention[]>([
        { id: '1', description: '', frequency: '', duration: '' }
    ]);
    const [progressIndicators, setProgressIndicators] = useState('');
    const [reviewDate, setReviewDate] = useState('');
    const [dischargeCriteria, setDischargeCriteria] = useState('');
    const [clinicianName, setClinicianName] = useState(
        (profile as any)?.displayName || user?.name || user?.email || 'Authorized Clinician'
    );

    const [name, setName] = useState(patientName || "");
    const [dob, setDob] = useState(patientDob || "");
    const [id, setId] = useState(patientId || "");
    const [planDate, setPlanDate] = useState("");

    // Handle prop changes
    React.useEffect(() => {
        if (patientName) setName(patientName);
        if (patientDob) setDob(patientDob);
        if (patientId) setId(patientId);
    }, [patientName, patientDob, patientId]);

    const handleProblemChange = (index: number, value: string) => {
        const newProblems = [...presentingProblems];
        newProblems[index] = value;
        setPresentingProblems(newProblems);
    };

    const addGoal = () => {
        setGoals([...goals, { id: Math.random().toString(), goal: '', objectives: ['', ''] }]);
    };

    const updateGoal = (id: string, value: string) => {
        setGoals(goals.map(g => g.id === id ? { ...g, goal: value } : g));
    };

    const updateObjective = (goalId: string, objIndex: number, value: string) => {
        setGoals(goals.map(g => g.id === goalId ? {
            ...g,
            objectives: g.objectives.map((obj, i) => i === objIndex ? value : obj)
        } : g));
    };

    const addObjective = (goalId: string) => {
        setGoals(goals.map(g => g.id === goalId ? { ...g, objectives: [...g.objectives, ''] } : g));
    };

    const addIntervention = () => {
        setInterventions([...interventions, { id: Math.random().toString(), description: '', frequency: '', duration: '' }]);
    };

    const updateIntervention = (id: string, field: keyof Intervention, value: string) => {
        setInterventions(interventions.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const calculateIntegrity = () => {
        const sections = [
            { id: 'metadata', weight: 20, filled: [name, dob, id, planDate].filter(Boolean).length / 4 },
            { id: 'diagnosis', weight: 20, filled: diagnosis ? 1 : 0 },
            { id: 'problems', weight: 15, filled: presentingProblems.some(p => p.trim()) ? 1 : 0 },
            { id: 'goals', weight: 25, filled: goals.some(g => g.goal.trim()) ? 1 : 0 },
            { id: 'interventions', weight: 20, filled: interventions.some(i => i.description.trim()) ? 1 : 0 }
        ];

        const total = sections.reduce((acc, section) => acc + (section.weight * section.filled), 0);
        return Math.min(Math.round(total), 100);
    };

    const integrity = calculateIntegrity();

    const handleSave = async () => {
        if (!diagnosis) {
            toast.error("Clinical Diagnosis is required for a Treatment Plan");
            return;
        }

        setIsSaving(true);
        try {
            const planId = `PLAN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

            // Persist to backend registry
            await medicalReportsService.createMedicalReport({
                patientId: id,
                title: `CLINICAL TREATMENT PLAN: ${name}`,
                reportType: 'general',
                diagnosis: diagnosis,
                priority: 'normal',
                centerId: (profile as any)?.centerId || 'platform-default',
                metadata: {
                    isTreatmentPlan: true,
                    planId,
                    patientName: name,
                    patientDob: dob,
                    patientId: id,
                    planDate: planDate,
                    presentingProblems,
                    goals,
                    interventions,
                    progressIndicators,
                    reviewDate,
                    dischargeCriteria,
                    clinician: clinicianName,
                    license: (profile as any)?.id?.substring(0, 8).toUpperCase() || 'N/A'
                }
            } as CreateMedicalReportDto);

            // Trigger Notification + Automated Email Registry
            await notificationService.createNotification({
                userId: id,
                title: 'Clinical Treatment Plan Finalized',
                message: `Your long-term care protocol has been synchronized by ${clinicianName}. An official worksheet copy has been dispatched to your email for your records.`,
                type: 'medical_record',
                deliveryMethod: 'all', // Correct mapping for Global Dispatch (Email + Platform)
                data: { planId, type: 'TREATMENT_PLAN', clinician: clinicianName }
            });

            setIsSaving(false);
            setStep('success');
            toast.success("CLINICAL TREATMENT PLAN Synchronized & Dispatched");
        } catch (error) {
            console.error("Critical failure during plan synchronization:", error);
            toast.error("Registry communication error. Please check your medical credentials.");
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl w-full bg-slate-50 sm:rounded-[40px] border-none shadow-3xl p-0 overflow-hidden outline-none h-[100dvh] sm:h-[90vh] sm:max-h-[850px] flex flex-col top-0 sm:top-[50%] left-0 sm:left-[50%] translate-x-0 sm:translate-x-[-50%] translate-y-0 sm:translate-y-[-50%] lg:max-h-[90vh]">
                {/* Header - Compact & Premium */}
                <div className="px-6 pt-14 pb-5 md:px-10 md:py-8 flex items-center justify-between bg-white border-b border-slate-100 shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100/50">
                            <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                CLINICAL TREATMENT PLAN
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Official Medical Protocol Registry
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Badge variant="outline" className="hidden md:flex h-9 px-4 rounded-xl border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[9px] bg-slate-50">
                            <Clock className="h-3 w-3 mr-2" /> Time-Tracked
                        </Badge>
                        <button
                            onClick={onClose}
                            className="p-2.5 md:p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative px-4 pt-6 pb-20 md:p-10">
                    <AnimatePresence mode="wait">
                        {step === 'edit' && (
                            <motion.div
                                key="edit"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="max-w-4xl mx-auto space-y-6 md:space-y-10"
                            >
                                {/* Metadata Section - Clean & Informative */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "Patient name", value: name, setter: setName, icon: User, type: "text" },
                                        { label: "Date of Birth", value: dob, setter: setDob, icon: Calendar, type: "date" },
                                        { label: "Clinical ID", value: id, setter: setId, icon: Activity, type: "text" },
                                        { label: "Plan Date", value: planDate, setter: setPlanDate, icon: Clock, type: "date" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                <item.icon className="h-3 w-3 text-teal-600" />
                                                {item.label}
                                            </Label>
                                            <input
                                                type={item.type}
                                                value={item.value}
                                                onChange={(e) => item.setter(e.target.value)}
                                                className="w-full font-bold text-slate-900 text-sm bg-transparent border-none p-0 focus:outline-none focus:ring-0 placeholder:text-slate-200"
                                                placeholder={`Enter ${item.label}...`}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Form Sections */}
                                <div className="space-y-6">
                                    {/* Diagnosis & Problems */}
                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                        <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Clinical Diagnosis Registry</h3>
                                            </div>
                                            <Textarea
                                                value={diagnosis}
                                                onChange={(e) => setDiagnosis(e.target.value)}
                                                placeholder="Enter detailed clinical diagnosis findings..."
                                                className="min-h-[140px] rounded-2xl bg-slate-50/50 border-slate-100 px-4 py-4 font-medium text-slate-900 resize-none focus:ring-4 focus:ring-teal-500/10 placeholder:text-slate-300 transition-all border-dashed"
                                            />
                                        </div>

                                        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                                                    <ShieldAlert className="h-4 w-4" />
                                                </div>
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Priority Problems</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {presentingProblems.map((prob, i) => (
                                                    <div key={i} className="group relative">
                                                        <Input
                                                            value={prob}
                                                            onChange={(e) => handleProblemChange(i, e.target.value)}
                                                            className="h-12 pl-10 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-slate-900 focus:ring-4 focus:ring-rose-500/10 transition-all"
                                                            placeholder={`Problem #${i + 1}...`}
                                                        />
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 group-focus-within:text-rose-400 transition-colors">
                                                            {i + 1}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Goals & Objectives */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                    <Target className="h-4 w-4" />
                                                </div>
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Measurable Goals & Steps</h3>
                                            </div>
                                            <Button
                                                onClick={addGoal}
                                                variant="outline"
                                                className="rounded-xl h-9 md:h-10 border-blue-100 bg-white text-blue-600 hover:bg-blue-50 font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-2 shadow-sm transition-all"
                                            >
                                                <Plus className="h-3.3 w-3.3" /> Add Goal
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {goals.map((g, gIdx) => (
                                                <motion.div
                                                    layout
                                                    key={g.id}
                                                    className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col"
                                                >
                                                    <div className="p-5 md:p-6 bg-slate-900 text-white flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[8px] font-black uppercase">Goal {gIdx + 1}</span>
                                                            </div>
                                                            <Textarea
                                                                value={g.goal}
                                                                onChange={(e) => updateGoal(g.id, e.target.value)}
                                                                className="min-h-[60px] bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-blue-500/30 text-sm font-bold resize-none"
                                                                placeholder="Type long-term measurable goal..."
                                                            />
                                                        </div>
                                                        <button
                                                            className="text-white/20 hover:text-rose-400 p-1 transition-colors"
                                                            onClick={() => setGoals(goals.filter(item => item.id !== g.id))}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="p-6 space-y-4 bg-slate-50/30 flex-1">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Functional Objectives</p>
                                                        {g.objectives.map((obj, oIdx) => (
                                                            <div key={oIdx} className="flex gap-3 items-center group">
                                                                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm group-focus-within:border-teal-500 group-focus-within:text-teal-600 transition-all">
                                                                    {String.fromCharCode(97 + oIdx)}
                                                                </div>
                                                                <Input
                                                                    value={obj}
                                                                    onChange={(e) => updateObjective(g.id, oIdx, e.target.value)}
                                                                    className="h-10 rounded-xl bg-white border-slate-200 text-slate-900 text-xs font-bold shadow-sm focus:ring-teal-500/10 placeholder:text-slate-200"
                                                                    placeholder={`Task ${gIdx + 1}.${oIdx + 1}...`}
                                                                />
                                                            </div>
                                                        ))}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="mt-2 text-teal-600 font-black text-[9px] uppercase tracking-widest h-8 hover:bg-teal-50 rounded-lg px-3"
                                                            onClick={() => addObjective(g.id)}
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" /> Add Phase
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Interventions Matrix - Optimized for Mobile Cards */}
                                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                                    <Edit3 className="h-4 w-4" />
                                                </div>
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Clinical Interventions</h3>
                                            </div>
                                            <Button
                                                onClick={addIntervention}
                                                variant="outline"
                                                className="rounded-xl h-9 md:h-10 border-purple-100 bg-white text-purple-600 hover:bg-purple-50 font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-2 shadow-sm transition-all"
                                            >
                                                <Plus className="h-3.3 w-3.3" /> Add Intervention
                                            </Button>
                                        </div>

                                        {/* Desktop Table View */}
                                        <div className="hidden md:block border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                            <table className="w-full border-collapse">
                                                <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Intervention</th>
                                                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Frequency</th>
                                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-32 text-center">Duration</th>
                                                        <th className="px-6 py-4 text-right"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {interventions.map((inv) => (
                                                        <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-4 py-2">
                                                                <Input
                                                                    value={inv.description}
                                                                    onChange={(e) => updateIntervention(inv.id, 'description', e.target.value)}
                                                                    className="border-none bg-transparent shadow-none font-bold text-slate-900 focus:ring-0 text-sm"
                                                                    placeholder="Intervention description..."
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <Input
                                                                    value={inv.frequency}
                                                                    onChange={(e) => updateIntervention(inv.id, 'frequency', e.target.value)}
                                                                    className="border-none bg-transparent shadow-none font-bold text-slate-600 focus:ring-0 text-sm"
                                                                    placeholder="e.g. Daily"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <Input
                                                                    value={inv.duration}
                                                                    onChange={(e) => updateIntervention(inv.id, 'duration', e.target.value)}
                                                                    className="border-none bg-transparent shadow-none font-bold text-slate-600 focus:ring-0 text-center text-sm"
                                                                    placeholder="Weeks/Months"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2 text-right">
                                                                <button
                                                                    className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                                    onClick={() => setInterventions(interventions.filter(i => i.id !== inv.id))}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden space-y-4">
                                            {interventions.map((inv) => (
                                                <div key={inv.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 relative group">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Description</Label>
                                                            <Input
                                                                value={inv.description}
                                                                onChange={(e) => updateIntervention(inv.id, 'description', e.target.value)}
                                                                className="h-10 bg-white rounded-xl border-slate-100 font-bold text-slate-900 text-xs shadow-sm"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Frequency</Label>
                                                                <Input
                                                                    value={inv.frequency}
                                                                    onChange={(e) => updateIntervention(inv.id, 'frequency', e.target.value)}
                                                                    className="h-10 bg-white rounded-xl border-slate-100 font-bold text-slate-600 text-xs shadow-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Duration</Label>
                                                                <Input
                                                                    value={inv.duration}
                                                                    onChange={(e) => updateIntervention(inv.id, 'duration', e.target.value)}
                                                                    className="h-10 bg-white rounded-xl border-slate-100 font-bold text-slate-600 text-xs shadow-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="absolute top-2 right-2 p-2 text-slate-200 hover:text-rose-500 transition-colors"
                                                        onClick={() => setInterventions(interventions.filter(i => i.id !== inv.id))}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Final Controls & Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Progress Indicators</h3>
                                            </div>
                                            <Textarea
                                                value={progressIndicators}
                                                onChange={(e) => setProgressIndicators(e.target.value)}
                                                placeholder="What measurable changes will indicate progress?"
                                                className="min-h-[120px] bg-slate-50/50 border-slate-100 rounded-2xl p-4 font-medium text-slate-900 resize-none border-dashed"
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                                                        <Calendar className="h-4 w-4" />
                                                    </div>
                                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Review & Discharge</h3>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Review Date</Label>
                                                        <div className="relative">
                                                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-teal-500 opacity-50" />
                                                            <Input
                                                                type="date"
                                                                value={reviewDate}
                                                                onChange={(e) => setReviewDate(e.target.value)}
                                                                className="pl-10 h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-xs shadow-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Discharge Target</Label>
                                                        <Input
                                                            value={dischargeCriteria}
                                                            onChange={(e) => setDischargeCriteria(e.target.value)}
                                                            placeholder="Success criteria..."
                                                            className="h-11 rounded-xl bg-slate-50/50 border-slate-100 font-bold text-xs shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden group border-none">
                                                <div className="relative z-10">
                                                    <Label className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] mb-3 block">Digital Clinician Signature</Label>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                                <CheckCircle2 className="h-5 w-5 text-teal-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-sm uppercase tracking-tight">{clinicianName}</p>
                                                                <p className="text-[8px] text-teal-500 font-bold uppercase">License: {(profile as any)?.id?.substring(0, 8).toUpperCase() || 'NWA-482'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="hidden sm:block opacity-20">
                                                            <Activity className="h-8 w-8" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="w-48 h-48 bg-teal-500 rounded-[64px] flex items-center justify-center shadow-[0_20px_50px_rgba(20,184,166,0.3)] relative group">
                                    <CheckCircle2 className="h-24 w-24 text-white group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full scale-150 -z-10" />
                                </div>
                                <div className="mt-10 space-y-4 px-6">
                                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight leading-none">
                                        PROTOCOL FINALIZED
                                    </h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
                                        Clinical intelligence synchronized across registry
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-md px-6">
                                    <Button className="h-16 flex-1 rounded-3xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-2xl gap-3 border-none hover:bg-slate-800 transition-all active:scale-[0.98]">
                                        <FileText className="h-5 w-5" /> Download PDF
                                    </Button>
                                    <Button variant="outline" className="h-16 flex-1 rounded-3xl border-slate-200 bg-white font-black uppercase text-xs tracking-widest gap-3 shadow-premium hover:bg-slate-50 transition-all active:scale-[0.98]">
                                        <Printer className="h-5 w-5" /> Print Sheet
                                    </Button>
                                </div>
                                <div className="mt-12">
                                    <button onClick={onClose} className="text-teal-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-teal-700 transition-colors flex items-center gap-2 group mx-auto">
                                        <span>Close Terminal</span>
                                        <X className="h-3 w-3 group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Fixed Action Footer */}
                {step === 'edit' && (
                    <div className="px-4 pt-4 pb-20 md:p-10 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4 md:gap-6 shrink-0 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                        <div className="flex-1 w-full sm:w-auto">
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Protocol Integrity</p>
                                <span className="text-[10px] font-black text-slate-400">{integrity}% Complete</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${integrity}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || integrity < 30}
                            className="h-14 md:h-20 w-full sm:w-auto px-10 md:px-14 rounded-2xl md:rounded-[36px] bg-teal-600 hover:bg-teal-700 text-white font-black uppercase text-xs md:text-sm tracking-widest shadow-[0_15px_35px_rgba(13,148,136,0.25)] flex items-center justify-center gap-4 transition-all hover:translate-y-[-2px] active:translate-y-[1px] disabled:opacity-50 disabled:translate-y-0"
                        >
                            {isSaving ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Synchronize Plan</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};


