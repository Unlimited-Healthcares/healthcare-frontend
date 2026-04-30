import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
    Accessibility, 
    Target, 
    TrendingUp, 
    Dumbbell, 
    Stethoscope, 
    FileText, 
    Activity, 
    CheckCircle2,
    Save,
    ArrowRight,
    ClipboardList,
    Brain,
    PersonStanding,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { rehabService } from '@/services/rehabService';

interface PhysioAssessment {
    rom: number; // Range of Motion 0-180
    strength: number; // 0-5 scale
    balance: number; // 0-10 scale
    goals: string[];
    diagnosis: string;
    limitations: string;
}

export function PhysioAssessmentHub({ patient }: { patient: any }) {
    const [assessment, setAssessment] = useState<PhysioAssessment>({
        rom: 90,
        strength: 3,
        balance: 5,
        goals: ['Walk 50m with walker', 'Ascend 3 stairs'],
        diagnosis: 'Post-Stroke Left-Sided Hemiparesis',
        limitations: 'Limited weight bearing on left leg, reduced shoulder flexion'
    });

    const [newGoal, setNewGoal] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddGoal = () => {
        if (!newGoal) return;
        setAssessment(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
        setNewGoal('');
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await rehabService.saveAssessment({
                patientId: patient.id,
                ...assessment
            });
            toast.success("Assessment Finalized", {
                description: "Range of motion and strength metrics saved to patient's clinical timeline."
            });
        } catch (error) {
            console.error("Failed to save assessment:", error);
            toast.error("Failed to commit assessment");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                        <PersonStanding className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Clinical Assessment Terminal</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Patient: {patient.name} • Specialist: Physio. Elena Rodriguez</p>
                    </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 font-black text-[10px] tracking-widest px-4 py-1.5 border-emerald-100">ACTIVE SESSION</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Metrics */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-500" /> Physical Metrics (ROM / Strength)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Range of Motion (ROM)</Label>
                                    <Badge className="bg-emerald-500 text-white font-black">{assessment.rom}°</Badge>
                                </div>
                                <Slider 
                                    value={[assessment.rom]} 
                                    max={180} 
                                    step={1} 
                                    onValueChange={(val) => setAssessment({...assessment, rom: val[0]})}
                                    className="py-4"
                                />
                                <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase">
                                    <span>Fixed (0°)</span>
                                    <span>Neutral (90°)</span>
                                    <span>Full (180°)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Muscle Strength (0-5)</Label>
                                        <Badge className="bg-indigo-500 text-white font-black">{assessment.strength}/5</Badge>
                                    </div>
                                    <Slider 
                                        value={[assessment.strength]} 
                                        max={5} 
                                        step={0.5} 
                                        onValueChange={(val) => setAssessment({...assessment, strength: val[0]})}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance Score (0-10)</Label>
                                        <Badge className="bg-amber-500 text-white font-black">{assessment.balance}/10</Badge>
                                    </div>
                                    <Slider 
                                        value={[assessment.balance]} 
                                        max={10} 
                                        step={1} 
                                        onValueChange={(val) => setAssessment({...assessment, balance: val[0]})}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Target className="h-4 w-4 text-emerald-400" /> Rehabilitation Goals
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Enter new recovery goal..." 
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 font-bold text-white"
                                    value={newGoal}
                                    onChange={e => setNewGoal(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
                                />
                                <Button onClick={handleAddGoal} className="h-14 w-14 bg-emerald-600 text-white rounded-2xl">
                                    <Plus className="h-6 w-6" />
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {assessment.goals.map((goal, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm font-bold text-white/80">{goal}</p>
                                        </div>
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Referral Context */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-500" /> Referral Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diagnosis (Consensus)</p>
                                    <p className="text-xs font-black text-slate-900 leading-relaxed uppercase">{assessment.diagnosis}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Functional Limitations</p>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{assessment.limitations}"</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-indigo-100 text-indigo-600 font-black uppercase text-xs tracking-widest gap-2">
                                <ClipboardList className="h-4 w-4" /> View Discharge Plan
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-indigo-600 text-white">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Collaboration Invitations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <p className="text-xs font-bold text-indigo-100/70 leading-relaxed mb-4">Launch multi-person sessions with patient, caregiver, and lead physician to review intensity and ROM progress.</p>
                            <Button className="w-full h-14 bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 shadow-xl shadow-indigo-700/20">
                                <Plus className="h-5 w-5" /> Invite Team to Session
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" className="h-14 rounded-2xl px-8 border-2 font-black uppercase text-xs tracking-widest">Reset Assessment</Button>
                <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-12 font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 gap-3"
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {isSaving ? 'Committing...' : 'Commit Assessment Results'}
                </Button>
            </div>
        </div>
    );
}

function Plus(props: any) {
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
