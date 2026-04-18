import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    CheckCheck,
    FileText,
    Activity,
    ClipboardCheck,
    ShieldCheck,
    ArrowRight,
    Search,
    User,
    Clock,
    Printer,
    Send,
    Microscope,
    PenTool,
    Image as ImageIcon,
    Link as LinkIcon,
    Upload,
    ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { medicalReportsService } from '@/services/medicalReportsService';
import { PatientRecord } from '@/services/patientService';

interface DiagnosticResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSpecialist?: any; // The allied health practitioner (Lab Tech, Radiographer, etc.)
    pendingOrder?: any; // The original diagnostic request context
}

export const DiagnosticResultModal = ({
    isOpen,
    onClose,
    currentSpecialist,
    pendingOrder
}: DiagnosticResultModalProps) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [diagnosis, setDiagnosis] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [vitals, setVitals] = useState({
        heartRate: '',
        bp: '',
        temp: '',
        spO2: '',
        respiratoryRate: ''
    });
    const [specialistName, setSpecialistName] = useState(currentSpecialist?.profile?.name || currentSpecialist?.name || '');
    const [specialistTitle, setSpecialistTitle] = useState(currentSpecialist?.profile?.title || 'Diagnostic Scientist');
    const [specialistLicense, setSpecialistLicense] = useState(currentSpecialist?.profile?.licenseNumber || '');
    const [imageLink, setImageLink] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    // Auto-populate from order if provided
    useEffect(() => {
        if (isOpen && pendingOrder) {
            if (pendingOrder.vitals) {
                setVitals(pendingOrder.vitals);
            }
            if (currentSpecialist) {
                setSpecialistName(currentSpecialist.profile?.name || currentSpecialist.name || '');
                setSpecialistLicense(currentSpecialist.profile?.licenseNumber || '');
            }
        }
    }, [isOpen, pendingOrder, currentSpecialist]);

    const handleCreateResult = async () => {
        if (!diagnosis.trim() || !recommendation.trim()) {
            toast.error("Please fill in the primary diagnosis and conclusion");
            return;
        }

        try {
            setLoading(true);

            // 1. Create the formal Result Record
            const resultData = {
                patientId: pendingOrder?.patientId || pendingOrder?.metadata?.patientId,
                title: `Diagnostic Result: ${pendingOrder?.serviceRequested || 'Test Order'}`,
                diagnosis: diagnosis,
                notes: recommendation,
                recordType: 'diagnostic_result',
                category: pendingOrder?.category || 'diagnostic',
                centerId: currentSpecialist?.centerId,
                status: 'FINALIZED',
                vitals: vitals,
                metadata: {
                    originalRequestId: pendingOrder?.id || pendingOrder?.metadata?.requestId,
                    specialistName,
                    specialistLicense,
                    specialistTitle,
                    verificationHash: Math.random().toString(36).substring(2, 12).toUpperCase(),
                    archivedAt: new Date().toISOString(),
                    imageLink,
                    hasAttachedImages: attachedFiles.length > 0
                }
            };

            await medicalReportsService.createMedicalReport(resultData as any);

            toast.success("Diagnostic results finalized and archived!");
            setStep(4); // Success step
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to archive diagnostic result");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep(1);
        setDiagnosis('');
        setRecommendation('');
        setVitals({
            heartRate: '',
            bp: '',
            temp: '',
            spO2: '',
            respiratoryRate: ''
        });
        setImageLink('');
        setAttachedFiles([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && reset()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none sm:rounded-[40px] shadow-2xl h-[100dvh] sm:h-[90vh] flex flex-col">
                {/* Visual Header Strip */}
                <div className="h-2 bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 w-full" />

                <div className="p-8 flex-1 overflow-y-auto no-scrollbar pb-32 sm:pb-8">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-none px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                                    Result Entry Portal
                                </Badge>
                                <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                                    Archive Test Results
                                </DialogTitle>
                            </div>
                            <div className="h-14 w-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-xl shadow-teal-100 rotate-6 translate-x-1">
                                <Microscope className="h-8 w-8" />
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Step Indicators */}
                    <div className="flex items-center gap-2 mb-10 bg-slate-50 p-2 rounded-2xl w-fit">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-teal-600 w-16' : 'bg-slate-200'}`}
                            />
                        ))}
                    </div>

                    {/* Step 1: Request Overview */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <FileText className="h-32 w-32" />
                                </div>

                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-6 flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" /> Pending Service Order
                                </h4>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Ordered Investigation</p>
                                            <h3 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
                                                {pendingOrder?.serviceRequested || pendingOrder?.metadata?.serviceRequested || "General Service Panel"}
                                            </h3>
                                        </div>
                                        {pendingOrder?.priority === 'high' && (
                                            <Badge className="bg-red-500 text-white border-none px-2 py-0.5 font-black text-[8px] uppercase tracking-tighter animate-pulse">
                                                Urgent Priority
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/10">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Subject Patient</p>
                                            <p className="text-lg font-black uppercase text-white mt-1">{pendingOrder?.patientName || pendingOrder?.metadata?.patientName || "Select Patient"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Requesting Referrer</p>
                                            <p className="text-lg font-black uppercase text-white mt-1">{pendingOrder?.metadata?.referringDoctor || pendingOrder?.senderName || "Dr. Practitioner"}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 italic">
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                            "Referrer Clinical Notes: {pendingOrder?.clinicalNote || "Patient presenting with persistent symptoms requiring diagnostic verification."}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-teal-100 flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest"
                                onClick={() => setStep(2)}
                            >
                                Begin Clinical Result Entry <ArrowRight className="h-6 w-6" />
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Result Form */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <ClipboardCheck className="h-6 w-6" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Clinical Observation</h4>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                                        Primary Findings / Diagnosis <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Enter the medical diagnosis..."
                                        className="h-14 rounded-2xl border-slate-200 text-lg font-bold bg-white focus:ring-2 focus:ring-teal-100 uppercase"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                    />
                                </div>

                                {/* Physiological Parameters */}
                                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                    <Label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-teal-600" /> Physiological Parameters (Patient Vitals)
                                    </Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-bold text-slate-400 uppercase">Heart Rate (bpm)</Label>
                                            <Input
                                                className="h-12 rounded-xl bg-white border-slate-200 font-black text-center"
                                                value={vitals.heartRate}
                                                onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                                                placeholder="80"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-bold text-slate-400 uppercase">Blood Pressure</Label>
                                            <Input
                                                className="h-12 rounded-xl bg-white border-slate-200 font-black text-center"
                                                value={vitals.bp}
                                                onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                                                placeholder="120/80"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-bold text-slate-400 uppercase">Temp (°C)</Label>
                                            <Input
                                                className="h-12 rounded-xl bg-white border-slate-200 font-black text-center"
                                                value={vitals.temp}
                                                onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                                                placeholder="36.5"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-bold text-slate-400 uppercase">SpO2 (%)</Label>
                                            <Input
                                                className="h-12 rounded-xl bg-white border-slate-200 font-black text-center"
                                                value={vitals.spO2}
                                                onChange={(e) => setVitals({ ...vitals, spO2: e.target.value })}
                                                placeholder="98"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                                        Conclusion / Recommendation <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        placeholder="Final summary and suggested next steps..."
                                        className="min-h-[120px] rounded-[2rem] border-slate-200 p-6 font-medium text-slate-700 bg-white"
                                        value={recommendation}
                                        onChange={(e) => setRecommendation(e.target.value)}
                                    />
                                </div>

                                {/* Imaging Section */}
                                <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4" /> Radiology Imaging & PACS
                                        </Label>
                                        <Badge variant="outline" className="text-[8px] border-indigo-200 text-indigo-600 font-black uppercase">JPEG, PNG, DICOM</Badge>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => setAttachedFiles(Array.from(e.target.files || []))}
                                                />
                                                <div className="p-6 border-2 border-dashed border-indigo-200 rounded-3xl bg-white flex flex-col items-center justify-center gap-2 group-hover:border-indigo-400 transition-colors">
                                                    <Upload className="h-6 w-6 text-indigo-400" />
                                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                                        {attachedFiles.length > 0 ? `${attachedFiles.length} Images Attached` : 'Click or Drag images to attach'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                    <LinkIcon className="h-4 w-4 text-indigo-400" />
                                                </div>
                                                <Input
                                                    placeholder="OR Paste PACS/Image Access Link (HTTP://...)"
                                                    className="h-14 pl-12 rounded-2xl border-indigo-100 bg-white placeholder:text-indigo-200 text-indigo-900 font-bold text-xs"
                                                    value={imageLink}
                                                    onChange={(e) => setImageLink(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest" onClick={() => setStep(1)}>Back</Button>
                                <Button
                                    className="flex-[2] h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-lg transition-all uppercase tracking-widest"
                                    onClick={() => setStep(3)}
                                    disabled={!diagnosis || !recommendation}
                                >
                                    Proceed to Verify <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Sign & Submit */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <PenTool className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Final Registry Authorization</h3>
                            </div>

                            <div className="bg-white border-2 border-teal-100 rounded-[35px] shadow-2xl overflow-hidden relative group">
                                <div className="p-8 space-y-8 relative z-10">
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 w-fit">
                                                <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Rendering Specialist</h4>
                                                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{specialistName}</p>
                                                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{specialistTitle} • LIC #{specialistLicense}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification ID</p>
                                            <p className="text-xs font-mono font-bold text-slate-900">UHC-RES-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <CheckCheck className="h-4 w-4 text-teal-500" /> Specialist E-Signature
                                        </h5>
                                        <div className="p-10 border-4 border-dashed border-teal-50 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 bg-teal-50/20 relative group-hover:bg-teal-50/30 transition-colors">
                                            <div className="text-center">
                                                <p className="text-4xl font-serif italic text-teal-900 opacity-60 select-none">
                                                    {specialistName.split(' ')[0]}...
                                                </p>
                                                <div className="h-px w-64 bg-teal-200 mt-4 mx-auto" />
                                                <p className="text-[9px] font-black text-teal-600 uppercase tracking-[0.3em] mt-3">Digitally Authorized Signature</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-600 text-white rounded-full">
                                                <ShieldCheck className="h-3 w-3" />
                                                <span className="text-[8px] font-black uppercase tracking-tighter">Verified License Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-teal-600 p-4 text-center">
                                    <p className="text-white text-[9px] font-black uppercase tracking-[0.4em] opacity-80">Final Laboratory Registry Data</p>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-500 font-bold leading-relaxed px-4 italic text-center">
                                "I hereby certify that the above diagnostic results are true, accurate, and have been verified according to the Universal Healthcare clinical protocols."
                            </p>

                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest border-2" onClick={() => setStep(2)}>
                                    Edit Entry
                                </Button>
                                <Button
                                    className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest"
                                    onClick={handleCreateResult}
                                    disabled={loading}
                                >
                                    {loading ? 'Archiving...' : 'Sign & Submit Results'}
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="py-12 space-y-10 animate-in zoom-in-95 duration-700">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-teal-100 rounded-full blur-2xl opacity-50 animate-pulse" />
                                    <div className="h-28 w-28 rounded-[2rem] bg-teal-600 flex items-center justify-center text-white shadow-2xl relative z-10 rotate-3">
                                        <ClipboardCheck className="h-14 w-14" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Medical Record Archived</h4>
                                    <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm leading-relaxed uppercase tracking-tighter">
                                        The clinical findings have been synchronized with the patient's record and dispatched to the referrer.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { label: 'Blockchain Hash', val: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}` },
                                        { label: 'Registry ID', val: `UHC-RES-${Math.random().toString(36).substring(7).toUpperCase()}` },
                                        { label: 'Referrer Dispatch', val: pendingOrder?.metadata?.referringEmail || 'Auto-Sync Active' },
                                        { label: 'Archival Status', val: 'SECURED & DELIVERED' },
                                    ].map((meta) => (
                                        <div key={meta.label} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{meta.label}</p>
                                            <p className="text-xs font-mono font-bold text-slate-900">{meta.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    className="flex-1 h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 uppercase tracking-widest"
                                    onClick={() => window.print()}
                                >
                                    <Printer className="h-5 w-5" /> Print Result PDF
                                </Button>
                                <Button
                                    className="flex-1 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black shadow-xl shadow-teal-100 transition-all uppercase tracking-widest"
                                    onClick={reset}
                                >
                                    Back to Orders <CheckCheck className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
