import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    ShieldCheck, 
    Fingerprint, 
    Clock, 
    FileText, 
    Activity, 
    AlertTriangle, 
    Lock,
    UserCheck,
    CheckCircle2,
    HeartOff,
    Stethoscope,
    ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface EOLConfirmation {
    doctor1: { id: string; name: string; verified: boolean; timestamp?: string };
    doctor2: { id: string; name: string; verified: boolean; timestamp?: string };
    patientId: string;
    patientName: string;
    resuscitationAttempted: boolean;
    notes: string;
}

export function EndOfLifeConfirmation({ patient, currentDoctor }: { patient: any, currentDoctor: any }) {
    const [confirmation, setConfirmation] = useState<EOLConfirmation>({
        doctor1: { id: 'DR-4421', name: 'Dr. James Wilson (Intensivist)', verified: true, timestamp: '2026-04-30 02:45' },
        doctor2: { id: currentDoctor.id, name: currentDoctor.name, verified: false },
        patientId: patient.id,
        patientName: patient.name,
        resuscitationAttempted: true,
        notes: ''
    });

    const [isVerifying, setIsVerifying] = useState(false);

    const handleBiometricSignOff = () => {
        setIsVerifying(true);
        // Simulate biometric/2FA verification
        setTimeout(() => {
            setConfirmation(prev => ({
                ...prev,
                doctor2: { ...prev.doctor2, verified: true, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) }
            }));
            setIsVerifying(false);
            toast.success("Identity Verified", {
                description: "Biometric sign-off recorded for Death Confirmation."
            });
        }, 2000);
    };

    const handleFinalize = () => {
        toast.error("DEATH CONFIRMED", {
            description: "Mortuary Department notified. Room 304 transition status updated to 'Awaiting Collection'.",
            duration: 8000
        });
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        <HeartOff className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Clinical Death Confirmation</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Two-Doctor Independent Verification Protocol</p>
                    </div>
                </div>
                <Badge className="bg-rose-50 text-rose-600 font-black text-[10px] tracking-widest px-4 py-1.5 border-rose-100">CRITICAL PROTOCOL</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Protocol Context */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-slate-400" /> Verification Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {/* Doctor 1 (Previously Verified) */}
                            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-emerald-900 uppercase">{confirmation.doctor1.name}</p>
                                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Verified via Biometrics • {confirmation.doctor1.timestamp}</p>
                                    </div>
                                </div>
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            </div>

                            {/* Doctor 2 (Current Action) */}
                            <div className={`p-6 rounded-3xl border-2 border-dashed transition-all ${confirmation.doctor2.verified ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${confirmation.doctor2.verified ? 'bg-white text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                            {confirmation.doctor2.verified ? <ShieldCheck className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black uppercase ${confirmation.doctor2.verified ? 'text-emerald-900' : 'text-slate-500'}`}>{confirmation.doctor2.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{confirmation.doctor2.verified ? `Verified • ${confirmation.doctor2.timestamp}` : 'Awaiting 2nd Verification'}</p>
                                        </div>
                                    </div>
                                    {confirmation.doctor2.verified && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                                </div>

                                {!confirmation.doctor2.verified && (
                                    <Button 
                                        onClick={handleBiometricSignOff}
                                        disabled={isVerifying}
                                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3 shadow-xl shadow-slate-200"
                                    >
                                        <Fingerprint className={`h-5 w-5 ${isVerifying ? 'animate-pulse' : ''}`} />
                                        {isVerifying ? 'Verifying Identity...' : 'Biometric/2FA Sign-off'}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-tight">Clinical Documentation</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes / Circumstances</Label>
                                <textarea 
                                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 min-h-[100px] text-xs font-bold"
                                    placeholder="Brief summary of events leading to cessation of care..."
                                    value={confirmation.notes}
                                    onChange={e => setConfirmation({...confirmation, notes: e.target.value})}
                                />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Activity className="h-4 w-4 text-slate-400" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resuscitation Attempted: {confirmation.resuscitationAttempted ? 'YES' : 'NO'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Patient / Family Context */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-rose-400" /> Subject Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div>
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Subject Name</p>
                                <p className="text-xl font-black uppercase">{patient.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Room / Unit</p>
                                    <p className="text-sm font-black uppercase">Room 304 (ICU)</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Patient ID</p>
                                    <p className="text-sm font-black uppercase">#8821</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Family Contact (Primary)</p>
                                <p className="text-xs font-bold">Sarah Doe (+1 555-0102)</p>
                                <Badge className="mt-2 bg-rose-500/20 text-rose-300 border-none text-[8px] font-black uppercase">AWAITING NOTIFICATION</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-rose-600 text-white">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-white" /> System Triggers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    Mortuary Intake Alert
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    Family Dashboard Update
                                    <Badge className="bg-white/10 text-white text-[7px] ml-auto">AUTO-SMS</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    Legal/Coroner Review
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" className="h-16 rounded-[2rem] px-10 border-2 font-black uppercase text-xs tracking-widest">Cancel Protocol</Button>
                <Button 
                    onClick={handleFinalize}
                    disabled={!confirmation.doctor2.verified}
                    className="h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] px-16 font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 gap-3 disabled:opacity-50"
                >
                    <CheckCircle2 className="h-5 w-5" /> Finalize Death Confirmation
                </Button>
            </div>
        </div>
    );
}
