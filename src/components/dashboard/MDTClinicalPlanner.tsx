import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Users, 
    Stethoscope, 
    Activity, 
    Pill, 
    ClipboardList,
    Plus,
    X,
    CheckCircle2,
    Send,
    UserPlus,
    Video,
    ShieldCheck,
    Dumbbell,
    HeartPulse,
    Brain,
    Thermometer
} from 'lucide-react';
import { toast } from 'sonner';

interface MDTClinicalPlannerProps {
    patient: any;
    onComplete: (plan: any) => void;
}

export function MDTClinicalPlanner({ patient, onComplete }: MDTClinicalPlannerProps) {
    const [diagnosis, setDiagnosis] = useState('');
    const [investigations, setInvestigations] = useState<string[]>([]);
    const [newInvestigation, setNewInvestigation] = useState('');
    const [therapies, setTherapies] = useState({
        medications: '',
        procedures: '',
        physio: '',
        rehabPlan: ''
    });

    const [participants, setParticipants] = useState([
        { role: 'Cardiologist', name: 'Dr. Sarah Chen', status: 'connected' },
        { role: 'Anaesthetist', name: 'Dr. James Wilson', status: 'connected' },
        { role: 'Radiographer', name: 'Mark Evans', status: 'connected' },
        { role: 'Physiotherapist', name: 'Elena Rodriguez', status: 'awaiting' },
        { role: 'Pharmacist', name: 'David Park', status: 'awaiting' },
        { role: 'Nurse', name: 'Unit 4 Lead', status: 'connected' }
    ]);

    const handleAddInvestigation = () => {
        if (!newInvestigation) return;
        setInvestigations([...investigations, newInvestigation]);
        setNewInvestigation('');
    };

    const handleRemoveInvestigation = (index: number) => {
        setInvestigations(investigations.filter((_, i) => i !== index));
    };

    const handleFinalize = () => {
        const plan = {
            diagnosis,
            investigations,
            therapies,
            timestamp: new Date().toISOString(),
            approvedBy: participants.filter(p => p.status === 'connected').map(p => p.role)
        };
        toast.success("MDT Clinical Plan Finalized", {
            description: "Pathway synchronized across all specialist dashboards."
        });
        onComplete(plan);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="p-8 bg-white/5 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">MDT Clinical Pathway</h2>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Complex Case Multi-Person Planning</p>
                        </div>
                    </div>
                    <Badge className="bg-red-500 text-white font-black text-[10px] tracking-widest px-3 py-1">LIVE SESSION</Badge>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Participants Status */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {participants.map((p, i) => (
                        <div key={i} className={`p-3 rounded-2xl border ${p.status === 'connected' ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10 opacity-50'}`}>
                            <p className="text-[9px] font-black uppercase text-white/50 mb-1">{p.role}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold">{p.name}</p>
                                <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                            </div>
                        </div>
                    ))}
                    <Button variant="ghost" className="h-full rounded-2xl border-2 border-dashed border-white/10 hover:bg-white/5 text-white/40 text-[10px] font-black uppercase gap-2">
                        <UserPlus className="h-4 w-4" /> Invite Specialist
                    </Button>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Diagnosis & Investigations */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-indigo-400" /> Working Diagnosis
                            </Label>
                            <Textarea 
                                placeholder="Enter clinical consensus diagnosis..." 
                                className="bg-white/5 border-white/10 rounded-2xl min-h-[100px] font-bold text-sm p-4 focus:ring-indigo-500 border-2"
                                value={diagnosis}
                                onChange={e => setDiagnosis(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-blue-400" /> Required Investigations
                            </Label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Add test (e.g. Stress ECHO, MRI)..." 
                                    className="bg-white/5 border-white/10 rounded-xl h-12 font-bold"
                                    value={newInvestigation}
                                    onChange={e => setNewInvestigation(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddInvestigation()}
                                />
                                <Button onClick={handleAddInvestigation} className="h-12 w-12 bg-white text-slate-900 rounded-xl">
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {investigations.map((test, i) => (
                                    <Badge key={i} className="bg-white/10 text-white border-white/20 px-3 py-1.5 rounded-lg gap-2">
                                        {test} <X className="h-3 w-3 cursor-pointer hover:text-red-400" onClick={() => handleRemoveInvestigation(i)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Therapies & Plans */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <HeartPulse className="h-4 w-4 text-rose-400" /> Multidisciplinary Therapies
                            </Label>
                            
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold text-white/30 uppercase ml-2">Medications & Procedures</Label>
                                    <Input 
                                        className="bg-white/5 border-white/10 rounded-xl h-11 text-xs" 
                                        placeholder="Dosage, Route, Surgical approach..." 
                                        value={therapies.medications}
                                        onChange={e => setTherapies({...therapies, medications: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold text-white/30 uppercase ml-2 flex items-center gap-2">
                                            <Dumbbell className="h-3 w-3" /> Physio
                                        </Label>
                                        <Input 
                                            className="bg-white/5 border-white/10 rounded-xl h-11 text-xs" 
                                            placeholder="Frequency, Focus..." 
                                            value={therapies.physio}
                                            onChange={e => setTherapies({...therapies, physio: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold text-white/30 uppercase ml-2 flex items-center gap-2">
                                            <Brain className="h-3 w-3" /> Rehab Plan
                                        </Label>
                                        <Input 
                                            className="bg-white/5 border-white/10 rounded-xl h-11 text-xs" 
                                            placeholder="Next milestones..." 
                                            value={therapies.rehabPlan}
                                            onChange={e => setTherapies({...therapies, rehabPlan: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-800/50 border border-white/10 rounded-[2.5rem] space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ClipboardList className="h-5 w-5 text-indigo-400" />
                                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Departmental Delegation</p>
                                </div>
                                <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[8px] font-black uppercase">AUTO-SYNC</Badge>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-bold uppercase text-white/80">Laboratory</span>
                                    <Button size="sm" variant="ghost" className="h-7 text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10">Dispatch Tests</Button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-bold uppercase text-white/80">Pharmacy</span>
                                    <Button size="sm" variant="ghost" className="h-7 text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10">Push Prescription</Button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-bold uppercase text-white/80">Imaging</span>
                                    <Button size="sm" variant="ghost" className="h-7 text-[8px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/5 hover:bg-blue-500/10">Request Scans</Button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] space-y-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                <p className="text-xs font-black uppercase text-emerald-400 tracking-widest">MDT Consensus Status</p>
                            </div>
                            <div className="flex -space-x-2">
                                {participants.filter(p => p.status === 'connected').map((p, i) => (
                                    <div key={i} title={p.name} className="w-10 h-10 rounded-full border-4 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-black shadow-lg">
                                        {p.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-white/60 font-bold leading-relaxed">
                                Consensus reached by all {participants.filter(p => p.status === 'connected').length} connected specialists. 
                                Path documented with Digital Signature IDs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="p-8 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <Button variant="ghost" className="text-white/60 font-black uppercase text-xs tracking-widest">Save Draft Pathway</Button>
                <div className="flex gap-4">
                    <Button variant="outline" className="border-white/10 text-white rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest">Discard</Button>
                    <Button 
                        onClick={handleFinalize}
                        disabled={!diagnosis}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-12 font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 gap-3"
                    >
                        <Send className="h-5 w-5" /> Finalize & Dispatch Plan
                    </Button>
                </div>
            </div>
        </div>
    );
}
