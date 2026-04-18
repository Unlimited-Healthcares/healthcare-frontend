import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    User as LucideUser,
    Search,
    ArrowRight,
    ClipboardCheck,
    Check,
    X,
    Stethoscope,
    FileText,
    Microscope,
    Camera,
    Printer,
    Download,
    Share2,
    Heart
} from 'lucide-react';
import { discoveryService } from '@/services/discoveryService';
import { patientService, PatientRecord } from '@/services/patientService';
import { medicalReportsService } from '@/services/medicalReportsService';
import { Request, User } from '@/types/discovery';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ClinicalReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    centerData?: any;
    preselectedPatient?: PatientRecord | null;
}

export const ClinicalReportModal = ({ isOpen, onClose, centerData, preselectedPatient }: ClinicalReportModalProps) => {
    const [step, setStep] = useState(1);
    const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [loading, setLoading] = useState(false);

    // Manual search for patient if no request
    const [patients, setPatients] = useState<PatientRecord[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchedPatients, setSearchedPatients] = useState<User[]>([]);

    // Report Data
    const [findings, setFindings] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [conclusion, setConclusion] = useState('');
    const [vitals, setVitals] = useState({
        heartRate: '',
        bp: '',
        temp: '',
        spO2: '',
        respiratoryRate: ''
    });
    const [reportId, setReportId] = useState(() => `REP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    const [generatedRecordId, setGeneratedRecordId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchIncomingRequests();
            fetchPatients(''); // Initial fetch to show some patients
            if (preselectedPatient) {
                handleSelectPatientManual(preselectedPatient as any);
            }
        }
    }, [isOpen, preselectedPatient]);

    const fetchIncomingRequests = async () => {
        setLoading(true);
        try {
            // Get pending referrals or orders
            const res = await discoveryService.getReceivedRequests({
                type: 'referral',
                status: 'pending'
            });
            setIncomingRequests(res.requests || []);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async (query: string = '') => {
        try {
            setLoading(true);

            // If query is empty, try to get recent patients or all patients
            if (!query) {
                const res = await patientService.getPatients({ limit: 10 });
                if (res.data && res.data.length > 0) {
                    setSearchedPatients(res.data.map(p => ({
                        id: p.id,
                        displayName: p.fullName || 'Patient',
                        publicId: p.patientId || p.id,
                        email: p.email as string
                    } as User)));
                }
                return;
            }

            const res = await discoveryService.searchUsers({
                type: 'patient',
                search: query || undefined,
                limit: 10
            });

            setSearchedPatients(res.users || []);

            // Also fetch referred patients as fallback/active list
            const referredRes = await discoveryService.getReceivedRequests({
                type: 'referral'
            });

            const referredPatients: PatientRecord[] = [];
            const patientIds = new Set();

            referredRes.requests.forEach(req => {
                if (req.metadata?.patientId && !patientIds.has(req.metadata.patientId)) {
                    patientIds.add(req.metadata.patientId);
                    referredPatients.push({
                        id: req.metadata.patientId as string,
                        fullName: (req.metadata.patientName as string) || 'Referred Patient',
                        userId: req.senderId
                    } as PatientRecord);
                }
            });

            setPatients(referredPatients);
        } catch (error) {
            console.error("Fetch patients failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSearch = (val: string) => {
        setSearchTerm(val);
        const timeout = setTimeout(() => fetchPatients(val), 500);
        return () => clearTimeout(timeout);
    };

    const handleSelectPatientManual = async (user: User) => {
        const patientData = {
            id: user.id || user.publicId,
            fullName: user.displayName || `${user.profile?.firstName} ${user.profile?.lastName}`.trim(),
            userId: user.id
        } as PatientRecord;

        setSelectedPatient(patientData);
        setStep(2);

        // Fetch latest vitals for this patient
        try {
            const details = await patientService.getPatientById(patientData.id);
            if (details?.vitals) {
                setVitals({
                    heartRate: details.vitals.heartRate?.toString() || '',
                    bp: details.vitals.bp || '',
                    temp: details.vitals.temp?.toString() || '',
                    spO2: details.vitals.spO2?.toString() || '',
                    respiratoryRate: (details.vitals as any).respiratoryRate?.toString() || ''
                });
                toast.info("Latest patient vitals auto-populated");
            }
        } catch (error) {
            console.warn("Could not fetch patient vitals", error);
        }
    };

    const handleSelectRequest = async (req: Request) => {
        setSelectedRequest(req);
        // Pre-fill patient if possible (from metadata)
        if (req.metadata?.patientId) {
            const patientData = {
                id: req.metadata.patientId as string,
                fullName: req.metadata.patientName as string,
                userId: req.senderId
            };
            setSelectedPatient(patientData);
            setStep(2);

            // Fetch latest vitals
            try {
                const details = await patientService.getPatientById(patientData.id);
                if (details?.vitals) {
                    setVitals({
                        heartRate: details.vitals.heartRate?.toString() || '',
                        bp: details.vitals.bp || '',
                        temp: details.vitals.temp?.toString() || '',
                        spO2: details.vitals.spO2?.toString() || '',
                        respiratoryRate: (details.vitals as any).respiratoryRate?.toString() || ''
                    });
                }
            } catch (e) { }
        }
    };

    const handleSubmitReport = async () => {
        if (!selectedPatient || !diagnosis) {
            toast.error("Please fill in the diagnosis and patient details");
            return;
        }

        try {
            setLoading(true);

            // 0. Save as a formal Medical Record for permanence
            const record = await medicalReportsService.createMedicalReport({
                patientId: selectedPatient.id,
                title: `Clinical Finding: ${diagnosis}`,
                diagnosis: diagnosis,
                treatment: conclusion,
                notes: findings,
                recordType: selectedRequest?.metadata?.category as string || 'diagnosis',
                centerId: centerData?.id || '',
                vitals: vitals
            } as any);

            if (record && record.id) {
                setGeneratedRecordId(record.id);
            }

            // 1. Respond to the original request as 'approved' (meaning findings given)
            if (selectedRequest) {
                await discoveryService.respondToRequest(
                    selectedRequest.id,
                    'approve',
                    `Clinical findings submitted. Diagnosis: ${diagnosis}`,
                    {
                        reportId,
                        findings,
                        diagnosis,
                        conclusion,
                        vitals,
                        recordId: record.id,
                        completedAt: new Date().toISOString()
                    }
                );
            }

            // 2. We could also send a "treatment_proposal" back to the doctor
            await discoveryService.createRequest({
                recipientId: selectedRequest?.senderId || '',
                requestType: 'medical_report_proposal',
                message: `Medical Results for ${selectedPatient.fullName}`,
                metadata: {
                    reportId,
                    patientId: selectedPatient.id,
                    diagnosis,
                    findings,
                    conclusion,
                    vitals,
                    recordId: record.id
                }
            });

            toast.success("Clinical report submitted and permanently recorded!");
            setStep(3);
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to submit clinical report");
        } finally {
            setLoading(false);
        }
    };

    const handlePrintReport = async () => {
        if (!generatedRecordId) return;
        try {
            setLoading(true);
            const digitalReport = await medicalReportsService.generateDigitalReport(generatedRecordId);
            if (digitalReport?.pdfUrl) {
                window.open(digitalReport.pdfUrl, '_blank');
            } else {
                toast.error("PDF generation failed on server");
            }
        } catch (error) {
            toast.error("Failed to generate PDF");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep(1);
        setSelectedRequest(null);
        setSelectedPatient(null);
        setFindings('');
        setDiagnosis('');
        setConclusion('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={reset}>
            <DialogContent className="sm:max-w-[800px] h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-3xl p-0 border-0 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-700 p-8 text-white relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <Activity className="h-7 w-7" />
                            Clinical Finding & Diagnosis result
                        </DialogTitle>
                        <DialogDescription className="text-teal-100 font-medium opacity-90">
                            Document diagnostic findings, imaging results, and specialist diagnoses.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step Bar */}
                    <div className="flex gap-4 mt-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex-1">
                                <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-white' : 'bg-white/20'}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar pb-32 sm:pb-8">
                    {/* Step 1: Select Context */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <ClipboardCheck className="h-5 w-5 text-teal-500" />
                                    Select Request or Patient
                                </h4>
                                <Badge className="bg-teal-50 text-teal-700 border-0">{incomingRequests.length} Pending Orders</Badge>
                            </div>

                            {incomingRequests.length > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Requests</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        {incomingRequests.map(req => (
                                            <button
                                                key={req.id}
                                                onClick={() => handleSelectRequest(req)}
                                                className="group flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-teal-500 hover:bg-teal-50/30 transition-all text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                                                        {req.metadata?.category === 'diagnostic' ? <Microscope className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 uppercase">{(req.metadata?.patientName as string) || 'Unknown Patient'}</p>
                                                        <p className="text-xs text-gray-500">Ordered by: {req.senderName}</p>
                                                        <Badge variant="outline" className="mt-1 text-[9px] px-1 h-4">{(req.metadata?.serviceRequested as string) || 'General Order'}</Badge>
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-10 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">No pending requests found.</p>
                                        <Button variant="link" className="text-teal-600" onClick={fetchIncomingRequests}>Refresh</Button>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-gray-900 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                            <LucideUser className="h-4 w-4 text-teal-500" />
                                            Find Patient Manually (Walk-in)
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                placeholder="Search by name, email or public ID..."
                                                className="pl-12 h-12 rounded-2xl border-2 border-gray-100 focus:border-teal-500 transition-all"
                                                value={searchTerm}
                                                onChange={(e) => handlePatientSearch(e.target.value)}
                                            />
                                        </div>

                                        {searchedPatients.length > 0 ? (
                                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 rounded-2xl border border-gray-100 p-2">
                                                {searchedPatients.map(user => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => handleSelectPatientManual(user)}
                                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 text-left transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-black text-[10px]">
                                                                {user.displayName?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-gray-900 leading-none">{user.displayName || 'Patient'}</p>
                                                                <p className="text-[10px] text-gray-500 mt-1">{user.email || user.publicId}</p>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="h-4 w-4 text-gray-300" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : searchTerm.length >= 3 && !loading && (
                                            <p className="text-center text-xs text-gray-400 py-4">No patients found matching "{searchTerm}"</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100 italic text-[11px] text-gray-400">
                                Tip: You can also search for a patient manually to create finding for walk-in cases.
                            </div>
                        </div>
                    )}

                    {/* Step 2: Findings Input */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between bg-teal-50 p-4 rounded-2xl border border-teal-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 font-black">
                                        {selectedPatient?.fullName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-teal-800 uppercase leading-none">Reporting for</p>
                                        <p className="text-lg font-black text-gray-900">{selectedPatient?.fullName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-teal-600 uppercase">Referrer</p>
                                    <p className="text-xs font-bold text-gray-700">{selectedRequest?.senderName || 'Self-Ordered'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-teal-500" />
                                        Detailed Observations / Findings
                                    </Label>
                                    <Textarea
                                        placeholder="Record the raw data, visual observations, lab readings..."
                                        className="min-h-[140px] rounded-2xl border-2 bg-gray-50 focus:bg-white transition-colors"
                                        value={findings}
                                        onChange={(e) => setFindings(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold flex items-center gap-2">
                                        <Stethoscope className="h-4 w-4 text-teal-500" />
                                        Primary Diagnosis
                                    </Label>
                                    <Input
                                        placeholder="Enter the medical diagnosis..."
                                        className="h-12 rounded-xl"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-gray-900 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-emerald-500" />
                                        Physiological Parameters (Patient Specific Vitals)
                                    </Label>
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Heart Rate</Label>
                                            <div className="relative">
                                                <Activity className="absolute left-3 top-2.5 h-3.5 w-3.5 text-rose-500" />
                                                <Input
                                                    placeholder="80 bpm"
                                                    className="pl-9 h-9 text-xs rounded-xl"
                                                    value={vitals.heartRate}
                                                    onChange={(e) => setVitals(prev => ({ ...prev, heartRate: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Blood Pressure</Label>
                                            <div className="relative">
                                                <Heart className="absolute left-3 top-2.5 h-3.5 w-3.5 text-blue-500" />
                                                <Input
                                                    placeholder="120/80"
                                                    className="pl-9 h-9 text-xs rounded-xl"
                                                    value={vitals.bp}
                                                    onChange={(e) => setVitals(prev => ({ ...prev, bp: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Temperature</Label>
                                            <div className="relative">
                                                <Stethoscope className="absolute left-3 top-2.5 h-3.5 w-3.5 text-orange-500" />
                                                <Input
                                                    placeholder="36.5 °C"
                                                    className="pl-9 h-9 text-xs rounded-xl"
                                                    value={vitals.temp}
                                                    onChange={(e) => setVitals(prev => ({ ...prev, temp: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase">SpO2</Label>
                                            <div className="relative">
                                                <Activity className="absolute left-3 top-2.5 h-3.5 w-3.5 text-teal-500" />
                                                <Input
                                                    placeholder="98 %"
                                                    className="pl-9 h-9 text-xs rounded-xl"
                                                    value={vitals.spO2}
                                                    onChange={(e) => setVitals(prev => ({ ...prev, spO2: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Resp. Rate</Label>
                                            <div className="relative">
                                                <Activity className="absolute left-3 top-2.5 h-3.5 w-3.5 text-indigo-500" />
                                                <Input
                                                    placeholder="16 bpm"
                                                    className="pl-9 h-9 text-xs rounded-xl"
                                                    value={vitals.respiratoryRate}
                                                    onChange={(e) => setVitals(prev => ({ ...prev, respiratoryRate: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-bold">Conclusion / Recommendation</Label>
                                    <Textarea
                                        placeholder="Final summary and suggested next steps..."
                                        className="min-h-[100px] rounded-2xl"
                                        value={conclusion}
                                        onChange={(e) => setConclusion(e.target.value)}
                                    />
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Step 3: Success & Preview */}
                    {step === 3 && (
                        <div className="py-8 space-y-8 animate-in zoom-in-95 duration-700">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 ring-8 ring-teal-50">
                                    <Check className="h-10 w-10 stroke-[3]" />
                                </div>
                                <h4 className="text-2xl font-black text-gray-900 uppercase">Results Formally Documented</h4>
                                <p className="text-gray-500 max-w-sm">The diagnosis result has been officially signed and a copy has been sent to the referring doctor.</p>
                            </div>

                            {/* Result Preview */}
                            <div className="border-4 border-double border-teal-200 rounded-[2rem] p-10 bg-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-10 right-10 opacity-5">
                                    <Activity className="h-32 w-32" />
                                </div>

                                <div className="flex justify-between items-start mb-8 border-b-2 border-teal-50 pb-8">
                                    <div>
                                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Medical Diagnosis Report</p>
                                        <h3 className="text-3xl font-black text-gray-900 mt-2 uppercase tracking-tight">Final Result</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-block p-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-tighter mb-2">Authenticated</div>
                                        <p className="text-[10px] text-gray-400 font-bold">REPORT REF</p>
                                        <p className="font-mono font-bold text-gray-700">{reportId}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 mb-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Patient</p>
                                        <p className="text-lg font-black text-gray-900 border-b border-gray-100 pb-1">{selectedPatient?.fullName}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Certified By</p>
                                        <p className="text-lg font-black text-teal-700 border-b border-teal-50 pb-1 uppercase">{centerData?.name || 'Authorized Lab'}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-teal-50/50 rounded-3xl border border-teal-100">
                                        <p className="text-[10px] font-black text-teal-600 uppercase mb-3">Principal Diagnosis</p>
                                        <p className="text-xl font-bold text-gray-900 leading-tight">
                                            {diagnosis}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="grid grid-cols-5 gap-2 mb-4">
                                            {Object.entries(vitals).map(([key, value]) => value && (
                                                <div key={key} className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{key === 'bp' ? 'Blood Pressure' : key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                    <p className="text-xs font-black text-slate-900">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Findings Summary</p>
                                            <p className="text-sm text-gray-600 leading-relaxed indent-4">
                                                {findings || 'No detailed observations recorded.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-dashed border-gray-200 flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-medium italic">Electronically Certified: {new Date().toLocaleDateString()}</p>
                                        <div className="h-10 w-32 border-b-2 border-gray-200 mt-2 font-cursive text-gray-400 text-xs italic">Digital Signature Seal</div>
                                    </div>
                                    <div className="h-16 w-16 bg-gray-900 rounded-lg flex items-center justify-center p-2">
                                        <div className="grid grid-cols-3 gap-1">
                                            {Array(9).fill(0).map((_, i) => <div key={i} className="h-2 w-2 bg-white/20 rounded-sm" />)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    className="flex-1 h-14 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold flex gap-2"
                                    onClick={handlePrintReport}
                                    disabled={loading || !generatedRecordId}
                                >
                                    <Printer className="h-5 w-5" /> {loading ? 'Generating...' : 'Download PDF Result'}
                                </Button>
                                <Button className="h-14 w-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center">
                                    <Share2 className="h-6 w-6" />
                                </Button>
                                <Button className="flex-1 h-14 bg-blue-100 hover:bg-blue-200 text-blue-700 border-0 rounded-2xl font-bold" onClick={reset}>
                                    Return to Feed
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Shared Navigation Footer */}
                {step < 3 && (
                    <div className="shrink-0 p-4 sm:p-8 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-3 z-50">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                className="flex-1 h-14 sm:h-16 rounded-2xl border-2 font-black uppercase text-xs tracking-widest text-slate-500"
                                onClick={() => setStep(prev => prev - 1)}
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            className={cn(
                                "h-14 sm:h-16 rounded-2xl font-black text-xs sm:text-lg uppercase tracking-widest shadow-xl transition-all active:scale-95 flex-[2] bg-teal-600 shadow-teal-100",
                                step === 1 && "w-full"
                            )}
                            onClick={step === 1 ? () => selectedPatient && setStep(2) : handleSubmitReport}
                            disabled={loading || (step === 1 && !selectedPatient) || (step === 2 && !diagnosis)}
                        >
                            {loading ? 'Processing...' : step === 1 ? 'Prepare Findings Protocol' : 'Finalize & Sign Result'}
                            {step === 1 && <ArrowRight className="ml-2 h-5 w-5" />}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
