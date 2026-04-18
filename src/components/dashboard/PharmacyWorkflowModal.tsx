import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Pill,
    MessageSquare,
    ClipboardList,
    Stethoscope,
    ShieldCheck,
    Plus,
    Trash2,
    Save,
    CheckCircle2,
    Clock,
    ShoppingCart,
    Archive,
    AlertCircle,
    Thermometer,
    Activity,
    Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { medicalReportsService } from '@/services/medicalReportsService';

interface MedicationLine {
    id: string;
    name: string;
    strength: string;
    quantity: string;
    dosage: string;
    frequency: string;
}

interface PharmacyWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'dispense' | 'counseling' | 'management' | 'ailment' | 'prevention';
    patientData?: any;
}

export const PharmacyWorkflowModal: React.FC<PharmacyWorkflowModalProps> = ({
    isOpen,
    onClose,
    type,
    patientData
}) => {
    const { user, profile } = useAuth();
    const [step, setStep] = useState<'edit' | 'success'>('edit');
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [medications, setMedications] = useState<MedicationLine[]>([
        { id: '1', name: '', strength: '', quantity: '', dosage: '', frequency: '' }
    ]);
    const [notes, setNotes] = useState('');
    const [counselingPoints, setCounselingPoints] = useState({
        dosage: false,
        sideEffects: false,
        foodInteractions: false,
        adherence: false,
        storage: false
    });
    const [vitals, setVitals] = useState({ temp: '', bp: '', weight: '' });

    useEffect(() => {
        if (isOpen) {
            setStep('edit');
            setMedications([{ id: '1', name: '', strength: '', quantity: '', dosage: '', frequency: '' }]);
            setNotes('');
        }
    }, [isOpen]);

    const addMedication = () => {
        setMedications([...medications, { id: Math.random().toString(), name: '', strength: '', quantity: '', dosage: '', frequency: '' }]);
    };

    const removeMedication = (id: string) => {
        setMedications(medications.filter(m => m.id !== id));
    };

    const updateMedication = (id: string, field: keyof MedicationLine, value: string) => {
        setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const reportData = {
                patientId: patientData?.id || 'anonymous',
                title: `PHARMACY ${type.toUpperCase()}: ${patientData?.fullName || 'Walk-in Patient'}`,
                reportType: 'pharmacy',
                diagnosis: type === 'ailment' ? notes : 'Pharmaceutical Care provided',
                prescription: medications.map(m => `${m.name} ${m.strength} - ${m.dosage} (${m.frequency}) x${m.quantity}`).join('\n'),
                notes: `Clinical pharmacy workflow: ${type}\n${notes}\nCounseling Provided: ${Object.entries(counselingPoints).filter(([_, v]) => v).map(([k]) => k).join(', ')}`,
                centerId: (profile as any)?.centerId || 'platform-default',
                metadata: {
                    workflowType: type,
                    vitals,
                    counselingPoints,
                    medications,
                    timestamp: new Date().toISOString()
                }
            };

            await medicalReportsService.createMedicalReport(reportData);
            setStep('success');
            toast.success(`Pharmacy ${type} record synchronized.`);
        } catch (error) {
            toast.error("Failed to sync record");
        } finally {
            setIsSaving(false);
        }
    };

    const getHeaderInfo = () => {
        switch (type) {
            case 'dispense': return { title: 'Medication Dispensing', icon: Pill, color: 'text-emerald-600', bg: 'bg-emerald-50' };
            case 'counseling': return { title: 'Patient Counseling', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' };
            case 'management': return { title: 'Medication Management', icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' };
            case 'ailment': return { title: 'Minor Ailment Treatment', icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50' };
            default: return { title: 'Pharmacy Workflow', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' };
        }
    };

    const header = getHeaderInfo();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-slate-50 border-none shadow-2xl p-0 overflow-hidden sm:rounded-[40px] h-[100dvh] sm:h-[90vh]">
                <div className="flex flex-col h-full">
                    <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${header.bg} rounded-2xl flex items-center justify-center ${header.color}`}>
                                <header.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{header.title}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{patientData?.fullName || 'Select Patient'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        <AnimatePresence mode="wait">
                            {step === 'edit' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                    {/* Patient Context */}
                                    {patientData && (
                                        <div className="bg-slate-900 rounded-3xl p-6 text-white flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Active Patient</p>
                                                <h3 className="text-lg font-bold">{patientData.fullName}</h3>
                                                <div className="flex gap-4 mt-1 text-xs text-slate-400 font-medium">
                                                    <span>{patientData.gender}</span>
                                                    <span>{patientData.dob || 'Age: ' + patientData.age}</span>
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Live Connection</Badge>
                                        </div>
                                    )}

                                    {/* Dispensing Section */}
                                    {(type === 'dispense' || type === 'ailment') && (
                                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                                            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                    <Pill className="h-4 w-4 text-emerald-500" />
                                                    {type === 'dispense' ? 'Medication Dispensing' : 'Prescribed Medications'}
                                                </h3>
                                                <Button variant="ghost" size="sm" onClick={addMedication} className="text-emerald-600 font-bold text-[10px] uppercase">
                                                    <Plus className="h-3 w-3 mr-1" /> Add Medication
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                {medications.map((m, i) => (
                                                    <div key={m.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 group relative p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all">
                                                        <div className="md:col-span-2">
                                                            <Label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Drug Name</Label>
                                                            <Input value={m.name} onChange={(e) => updateMedication(m.id, 'name', e.target.value)} className="h-10 bg-white border-none font-bold text-sm" placeholder="e.g. Amoxicillin" />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Strength</Label>
                                                            <Input value={m.strength} onChange={(e) => updateMedication(m.id, 'strength', e.target.value)} className="h-10 bg-white border-none font-bold text-sm" placeholder="500mg" />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Qty</Label>
                                                            <Input value={m.quantity} onChange={(e) => updateMedication(m.id, 'quantity', e.target.value)} className="h-10 bg-white border-none font-bold text-center text-sm" placeholder="21" />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <Label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Dosage & Frequency</Label>
                                                            <Input value={m.dosage} onChange={(e) => updateMedication(m.id, 'dosage', e.target.value)} className="h-10 bg-white border-none font-bold text-sm" placeholder="1 tab, TID" />
                                                        </div>
                                                        {medications.length > 1 && (
                                                            <button onClick={() => removeMedication(m.id)} className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Counseling Section */}
                                    {(type === 'counseling' || type === 'dispense') && (
                                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-slate-50">
                                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                                Education & Counseling Checklist
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                {Object.entries(counselingPoints).map(([key, val]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setCounselingPoints(prev => ({ ...prev, [key]: !val }))}
                                                        className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${val ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200'}`}
                                                    >
                                                        <CheckCircle2 className={`h-5 w-5 mx-auto ${val ? 'text-white' : 'text-slate-200'}`} />
                                                        <p className="text-[9px] font-black uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Ailment Triage */}
                                    {type === 'ailment' && (
                                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-slate-50">
                                                <Thermometer className="h-4 w-4 text-orange-500" />
                                                Minor Ailment Triage
                                            </h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <Label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Temp</Label>
                                                    <Input value={vitals.temp} onChange={(e) => setVitals(prev => ({ ...prev, temp: e.target.value }))} className="bg-slate-50 border-none h-12 rounded-xl font-bold" placeholder="36.5" />
                                                </div>
                                                <div>
                                                    <Label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">BP</Label>
                                                    <Input value={vitals.bp} onChange={(e) => setVitals(prev => ({ ...prev, bp: e.target.value }))} className="bg-slate-50 border-none h-12 rounded-xl font-bold" placeholder="120/80" />
                                                </div>
                                                <div>
                                                    <Label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Weight</Label>
                                                    <Input value={vitals.weight} onChange={(e) => setVitals(prev => ({ ...prev, weight: e.target.value }))} className="bg-slate-50 border-none h-12 rounded-xl font-bold" placeholder="70kg" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            <ClipboardList className="h-4 w-4 text-indigo-500" />
                                            Clinical Counseling Notes / Feedback
                                        </h3>
                                        <Textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="min-h-[150px] bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-900"
                                            placeholder="Document patient engagement, adherence concerns, or minor ailment assessment..."
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 'success' && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-8">
                                    <div className="w-24 h-24 bg-emerald-100 rounded-[32px] flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-50">
                                        <ShieldCheck className="h-12 w-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-slate-900 uppercase">Flow Synchronized</h3>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Pharmacy clinical record has been sealed</p>
                                    </div>
                                    <div className="flex gap-4 w-full max-w-sm">
                                        <Button className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-bold" onClick={onClose}>Close Dashboard</Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {step === 'edit' && (
                        <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-end gap-4 shrink-0">
                            <Button variant="ghost" onClick={onClose} className="font-bold text-slate-500">Cancel</Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-14 px-10 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest gap-2 shadow-xl"
                            >
                                {isSaving ? <Activity className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Complete {type} Workflow
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
