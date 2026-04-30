import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
    LogOut, 
    Pill, 
    Calendar, 
    AlertTriangle, 
    CheckCircle2, 
    Save, 
    FileText, 
    UserCheck,
    Stethoscope,
    ShieldCheck,
    ArrowRight,
    ClipboardList,
    Clock,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface DischargePlan {
    diagnosis: string;
    medications: { drug: string; dose: string; instruction: string; pharmacistNote?: string }[];
    followUps: { provider: string; date: string; reason: string }[];
    redFlags: string[];
    nurseVerification: { counselled: boolean; medUnderstanding: boolean; completed: boolean };
}

import { clinicalService } from '@/services/clinicalService';

export function DischargePlanner({ patient, role }: { patient: any, role: string }) {
    const [plan, setPlan] = useState<DischargePlan>({
        diagnosis: 'Acute Myocardial Infarction - Post-PCI',
        medications: [
            { drug: 'Aspirin', dose: '75mg Daily', instruction: 'Permanent' },
            { drug: 'Ticagrelor', dose: '90mg BD', instruction: 'For 12 months', pharmacistNote: 'Start statin in 48h' }
        ],
        followUps: [
            { provider: 'Cardiologist', date: '2026-05-15', reason: 'Post-PCI Review' },
            { provider: 'Pharmacist', date: '2026-05-07', reason: 'INR Check' }
        ],
        redFlags: ['Crushing chest pain', 'Shortness of breath', 'Excessive bruising/bleeding'],
        nurseVerification: { counselled: false, medUnderstanding: false, completed: false }
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await clinicalService.saveDischargePlan({
                patientId: patient.id,
                ...plan
            });
            toast.success("Discharge Plan Finalized", {
                description: "Distributed to Pharmacy, Nursing, and Patient Portal."
            });
        } catch (error) {
            console.error("Failed to save discharge plan:", error);
            toast.error("Failed to finalize discharge");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleNurseTask = (task: keyof DischargePlan['nurseVerification']) => {
        setPlan(prev => ({
            ...prev,
            nurseVerification: { ...prev.nurseVerification, [task]: !prev.nurseVerification[task] }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        <LogOut className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Discharge & Continuity Hub</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Patient: {patient.name} • Active Episode: AMI-2044</p>
                    </div>
                </div>
                <Badge className="bg-blue-50 text-blue-600 font-black text-[10px] tracking-widest px-4 py-1.5 border-blue-100">FINALIZING DISCHARGE</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Clinical Plan (Doctor View) */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-indigo-500" /> Physician's Discharge Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Diagnosis</Label>
                                <Textarea 
                                    className="rounded-2xl border-slate-100 bg-slate-50 font-bold min-h-[100px]" 
                                    value={plan.diagnosis}
                                    readOnly={role !== 'doctor'}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Post-Discharge Medications</Label>
                                <div className="space-y-3">
                                    {plan.medications.map((med, i) => (
                                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Pill className="h-5 w-5 text-indigo-500" />
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase">{med.drug} {med.dose}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.instruction}</p>
                                                </div>
                                            </div>
                                            {med.pharmacistNote && (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[8px] font-black uppercase">
                                                    PHARMACY FLAG: {med.pharmacistNote}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Red Flag Warning Signs (Urgent Re-admission)</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {plan.redFlags.map((flag, i) => (
                                        <div key={i} className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                            <p className="text-[10px] font-black text-red-700 uppercase">{flag}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Nursing Checklist (Nurse View) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-emerald-600" /> Nurse Discharge Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {[
                                { key: 'counselled', label: 'Counsel Patient on Red Flags', icon: AlertTriangle },
                                { key: 'medUnderstanding', label: 'Confirm Med Understanding', icon: Pill },
                                { key: 'completed', label: 'Mark Discharge Tasks Completed', icon: ShieldCheck }
                            ].map((task) => (
                                <Button
                                    key={task.key}
                                    variant="outline"
                                    onClick={() => toggleNurseTask(task.key as any)}
                                    className={`w-full h-16 rounded-2xl border-2 flex items-center justify-between px-6 transition-all ${plan.nurseVerification[task.key as keyof typeof plan.nurseVerification] ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}
                                >
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                        <task.icon className={`h-4 w-4 ${plan.nurseVerification[task.key as keyof typeof plan.nurseVerification] ? 'text-emerald-500' : 'text-slate-300'}`} />
                                        {task.label}
                                    </div>
                                    {plan.nurseVerification[task.key as keyof typeof plan.nurseVerification] && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-indigo-600 text-white">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-indigo-300" /> Follow-up Appointments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {plan.followUps.map((fu, i) => (
                                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-black uppercase">{fu.provider}</p>
                                        <Badge className="bg-indigo-400 text-white text-[8px] font-black">{fu.date}</Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-indigo-100/60 uppercase tracking-widest">{fu.reason}</p>
                                </div>
                            ))}
                            <Button className="w-full h-14 bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-black uppercase text-xs tracking-widest gap-2 shadow-xl shadow-indigo-700/20">
                                <Calendar className="h-4 w-4" /> Book Additional Telehealth
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" className="h-16 rounded-[2rem] px-10 border-2 font-black uppercase text-xs tracking-widest">Save Draft</Button>
                <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] px-16 font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 gap-3"
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {isSaving ? 'Finalizing...' : 'Finalize & Sync to Patient App'}
                </Button>
            </div>
        </div>
    );
}
