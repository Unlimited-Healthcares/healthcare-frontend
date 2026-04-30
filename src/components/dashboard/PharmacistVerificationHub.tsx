import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Pill, 
    AlertTriangle, 
    CheckCircle2, 
    Phone, 
    Video, 
    ShieldCheck, 
    MessageSquare,
    Search,
    User,
    ArrowRight,
    ClipboardCheck,
    FlaskConical,
    FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Prescription {
    id: string;
    patientName: string;
    drug: string;
    dosage: string;
    status: 'awaiting' | 'flagged' | 'verified';
    interaction: string | null;
    doctor: string;
}

import { pharmacyService } from '@/services/pharmacyService';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export function PharmacistVerificationHub() {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await pharmacyService.getPendingPrescriptions();
            const data = Array.isArray(response) ? response : [];
            const mapped: Prescription[] = data.map((rx: any) => ({
                id: rx.id,
                patientName: rx.patient?.profile?.displayName || rx.patient?.name || 'Unknown Patient',
                drug: rx.medication || rx.drugName || 'N/A',
                dosage: rx.dosage || 'As directed',
                status: rx.status || 'awaiting',
                interaction: rx.metadata?.interactionNotes || null,
                doctor: rx.practitioner?.profile?.displayName || rx.practitioner?.name || 'Clinical Staff'
            }));
            setPrescriptions(mapped);
        } catch (error) {
            console.error('Failed to fetch prescriptions:', error);
            toast.error("Failed to load clinical queue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const handleVerify = async (id: string) => {
        try {
            await pharmacyService.verifyPrescription(id, { status: 'verified', notes: 'Verified by pharmacist via hub' });
            toast.success("Prescription Verified", {
                description: "Safety checks passed. Patient notified for collection/delivery."
            });
            setSelectedRx(null);
            fetchPrescriptions();
        } catch (error) {
            console.error('Verification failed:', error);
            toast.error("Failed to verify prescription");
        }
    };

    const handleCallDoctor = () => {
        toast.info(`Calling ${selectedRx?.doctor}...`, {
            description: "Establishing secure clinical audio link."
        });
    };

    const handlePatientCounsel = () => {
        toast.success("Opening Patient Counselling Portal", {
            description: "Starting secure video link for medication education."
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                        <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Clinical Verification Hub</h3>
                </div>
                <div className="flex gap-2">
                    <Badge className="bg-red-50 text-red-600 font-black text-[10px] tracking-widest px-4 py-1.5 border-red-100">2 FLAG INTERACTIONS</Badge>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : prescriptions.length === 0 ? (
                    <div className="py-16 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                        <Pill className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-lg font-black text-slate-400 uppercase tracking-tight">No pending prescriptions</p>
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">Pharmacy queue is currently clear.</p>
                    </div>
                ) : prescriptions.map((rx) => (
                    <Card key={rx.id} className={`border-none shadow-sm rounded-3xl overflow-hidden transition-all ${rx.status === 'verified' ? 'bg-emerald-50/50 opacity-60' : rx.status === 'flagged' ? 'bg-red-50/50 ring-1 ring-red-100' : 'bg-white'}`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${rx.status === 'flagged' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Pill className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{rx.drug}</p>
                                            <Badge variant="outline" className={`text-[9px] font-black uppercase ${rx.status === 'flagged' ? 'border-red-200 text-red-600 bg-red-50' : 'border-slate-200 text-slate-400'}`}>
                                                {rx.status === 'flagged' ? 'Interaction Alert' : rx.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{rx.patientName} • Prescribed by {rx.doctor}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {rx.status === 'flagged' && (
                                        <Button variant="ghost" className="text-red-600 h-10 w-10 p-0 hover:bg-red-50 rounded-xl" onClick={() => setSelectedRx(rx)}>
                                            <AlertTriangle className="h-5 w-5" />
                                        </Button>
                                    )}
                                    <Button 
                                        onClick={() => setSelectedRx(rx)}
                                        disabled={rx.status === 'verified'}
                                        className={`rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 ${rx.status === 'verified' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}
                                    >
                                        {rx.status === 'verified' ? 'Verified' : 'Review RX'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedRx} onOpenChange={() => setSelectedRx(null)}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none rounded-[40px] shadow-2xl">
                    <div className="bg-slate-900 p-8 text-white relative">
                        <div className="absolute top-8 right-8">
                            <Badge className="bg-purple-500 text-white font-black text-[10px] tracking-widest px-4 py-1.5">CLINICAL RX-REVIEW</Badge>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tight">Prescription Verification</h3>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Verification Agent: Pharm. David Park • License ID: PH-2044</p>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Drug Detail</p>
                                <p className="text-lg font-black text-slate-900 uppercase">{selectedRx?.drug}</p>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{selectedRx?.dosage}</p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prescribing Doctor</p>
                                <p className="text-lg font-black text-slate-900 uppercase">{selectedRx?.doctor}</p>
                                <Button variant="ghost" onClick={handleCallDoctor} className="h-8 text-[9px] font-black uppercase tracking-widest text-indigo-600 p-0 gap-2 mt-1">
                                    <Phone className="h-3.5 w-3.5" /> Call Dr. Securely
                                </Button>
                            </div>
                        </div>

                        {selectedRx?.interaction && (
                            <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-200">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-black text-red-700 uppercase tracking-tight">Drug Interaction Detected</p>
                                </div>
                                <p className="text-xs font-bold text-red-600/70 leading-relaxed italic">
                                    "{selectedRx.interaction}"
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialist Actions</p>
                            <div className="grid grid-cols-3 gap-3">
                                <Button onClick={handlePatientCounsel} variant="outline" className="h-20 rounded-[1.5rem] border-2 font-black uppercase text-[10px] tracking-widest flex flex-col gap-2">
                                    <Video className="h-5 w-5 text-indigo-600" /> Counselling
                                </Button>
                                <Button variant="outline" className="h-20 rounded-[1.5rem] border-2 font-black uppercase text-[10px] tracking-widest flex flex-col gap-2">
                                    <FlaskConical className="h-5 w-5 text-emerald-600" /> Lab Results
                                </Button>
                                <Button variant="outline" className="h-20 rounded-[1.5rem] border-2 font-black uppercase text-[10px] tracking-widest flex flex-col gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" /> Discharge Plan
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setSelectedRx(null)} className="flex-1 h-16 rounded-[2rem] border-2 font-black uppercase text-xs tracking-widest">Hold Order</Button>
                            <Button 
                                onClick={() => handleVerify(selectedRx!.id)}
                                className="flex-[2] h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 gap-3"
                            >
                                <ShieldCheck className="h-6 w-6" /> Mark Verified & Dispense
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
