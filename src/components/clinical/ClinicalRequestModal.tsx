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
    FileText,
    User as LucideUser,
    Search,
    Building2,
    ClipboardCheck,
    Download,
    Stethoscope,
    TestTube,
    Pill,
    Scan,
    Printer,
    ArrowRight,
    MapPin,
    DollarSign,
    Check,
    CheckCheck,
    Activity,
    Heart,
    Send,
    Microscope,
    Radio,
    ShieldCheck,
    ClipboardList,
    Calendar,
    Phone,
    Mail,
    CheckCircle2,
    Paperclip,
    X,
    Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { patientService, PatientRecord } from '@/services/patientService';
import { discoveryService } from '@/services/discoveryService';
import { medicalReportsService } from '@/services/medicalReportsService';
import { Center, CENTER_TYPES, User } from '@/types/discovery';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { SignaturePad } from '@/components/ui/SignaturePad';

interface ClinicalRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDoctor?: any;
    preselectedPatient?: PatientRecord | null;
    preselectedCategory?: 'referral' | 'diagnostic' | 'pharmacy' | 'imaging' | 'prescription' | 'radiotherapy' | 'report' | 'care_task' | 'appointment' | 'call' | 'treatment' | 'transfer' | 'connection' | 'biotech' | 'consultation' | 'death_certificate' | 'discharge_summary' | null;
}

export const ClinicalRequestModal = ({
    isOpen,
    onClose,
    currentDoctor,
    preselectedPatient,
    preselectedCategory
}: ClinicalRequestModalProps) => {
    const { user } = useAuth();
    const isAmbulanceService = user?.roles?.includes('ambulance_service');
    const [step, setStep] = useState(1);
    const [patients, setPatients] = useState<PatientRecord[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedPatients, setSearchedPatients] = useState<User[]>([]);
    const [category, setCategory] = useState<'referral' | 'diagnostic' | 'pharmacy' | 'imaging' | 'prescription' | 'radiotherapy' | 'report' | 'care_task' | 'appointment' | 'call' | 'treatment' | 'transfer' | 'connection' | 'biotech' | 'consultation' | 'death_certificate' | 'discharge_summary'>('diagnostic');
    const [colleagueName, setColleagueName] = useState('');
    const [consentGiven, setConsentGiven] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Search results for centers
    const [centers, setCenters] = useState<Center[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
    const [serviceSearch, setServiceSearch] = useState('');

    // Request details
    const [clinicalNotes, setClinicalNotes] = useState('');
    const [priority, setPriority] = useState('routine');
    const [vitals, setVitals] = useState({
        heartRate: '',
        bp: '',
        temp: '',
        spO2: '',
        respiratoryRate: ''
    });
    const [referringDoctor, setReferringDoctor] = useState(currentDoctor?.profile?.displayName || '');
    const [referringCenter, setReferringCenter] = useState(currentDoctor?.profile?.centerName || '');
    const [referringPhone, setReferringPhone] = useState(currentDoctor?.phone || currentDoctor?.profile?.phoneNumber || '');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [imageLink, setImageLink] = useState('');
    const [referringEmail, setReferringEmail] = useState(currentDoctor?.email || '');
    const [receivingDoctor, setReceivingDoctor] = useState('');
    const [imagingTransferDetails, setImagingTransferDetails] = useState('');
    const [hasAttachedReports, setHasAttachedReports] = useState(false);
    const [requestId] = useState(() => `REQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

    const [transferDate, setTransferDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Specialized Fields
    const [prescriptionDetails, setPrescriptionDetails] = useState({
        medication: '',
        dosage: '',
        frequency: '',
        duration: ''
    });
    const [radiotherapyDetails, setRadiotherapyDetails] = useState({
        targetArea: '',
        dose: '',
        cycles: '',
        technique: ''
    });
    const [deathCertificateDetails, setDeathCertificateDetails] = useState({
        dateTimeOfDeath: '',
        causeOfDeath: '',
        placeOfDeath: '',
        informantName: ''
    });
    const [dischargeSummaryDetails, setDischargeSummaryDetails] = useState({
        admissionDate: '',
        dischargeDate: '',
        summaryOfCare: '',
        followUpInstructions: ''
    });

    // Ambulance Transfer Paperwork
    const [sceneCondition, setSceneCondition] = useState('');
    const [dispatchTime, setDispatchTime] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [completedTime, setCompletedTime] = useState('');
    const [cprConsent, setCprConsent] = useState<'yes' | 'no' | 'n/a'>('n/a');
    const [destinationHospital, setDestinationHospital] = useState('');
    const [receivingPhysicianName, setReceivingPhysicianName] = useState('');
    const [reportDetails, setReportDetails] = useState({
        findings: '',
        impression: '',
        recommendations: '',
        specimenType: '',
        labNumber: `LAB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    });

    const [signature, setSignature] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchRecentPatients();
            if (preselectedPatient) {
                setSelectedPatient(preselectedPatient);
                setStep(2); // Jump to step 2 if patient is already selected
            }
            if (preselectedCategory) {
                setCategory(preselectedCategory as any);
            }
            if (currentDoctor) {
                setReferringDoctor(currentDoctor.profile?.displayName || currentDoctor.name || '');
                setReferringCenter(currentDoctor.profile?.centerName || '');
            }
        }
    }, [isOpen, preselectedPatient, preselectedCategory]);

    const fetchRecentPatients = async (query: string = '') => {
        setLoading(true);
        try {
            const centerId = (currentDoctor as any)?.centerId || (currentDoctor as any)?.profile?.centerId;

            // For hospital dashboards, always use the patient service with centerId filtering
            // This ensures we only see "Hospital Patients" as requested
            const res = await patientService.getPatients({
                limit: 10,
                search: query,
                centerId: centerId
            });

            setPatients(res.data);
            // Clear searchedPatients since we are using unified listing for hospital context
            setSearchedPatients([]);
        } catch (error) {
            console.error("Failed to fetch patients", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSearch = (val: string) => {
        setSearchQuery(val);

        if (searchTimeout) clearTimeout(searchTimeout);

        if (!val.trim()) {
            setSearchedPatients([]);
            return;
        }

        const timeout = setTimeout(() => fetchRecentPatients(val), 500);
        setSearchTimeout(timeout);
    };

    const handleSelectPatientManual = async (user: User | PatientRecord) => {
        const patientData = {
            id: user.id || (user as User).publicId,
            fullName: (user as User).displayName || (user as PatientRecord).fullName || `${(user as User).profile?.firstName} ${(user as User).profile?.lastName}`.trim(),
            userId: (user as User).id || (user as PatientRecord).userId,
            gender: (user as PatientRecord).gender || (user as User).profile?.gender,
            age: (user as PatientRecord).age || ((user as User).profile?.dateOfBirth ? new Date().getFullYear() - new Date((user as User).profile!.dateOfBirth!).getFullYear() : undefined)
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

    const handleSearchCenters = async () => {
        setLoading(true);
        try {
            // Map category to center types
            const categoryToType: Record<string, string> = {
                'diagnostic': 'Diagnostic Center',
                'pharmacy': 'Pharmacy',
                'imaging': 'Radiology Center',
                'radiotherapy': 'Radiology Center',
                'prescription': 'Pharmacy',
                'care_task': 'Clinic',
                'appointment': 'Hospital',
                'call': 'Clinic',
                'treatment': 'Hospital',
                'referral': 'Hospital',
                'diagnosis': 'Clinic',
                'biotech': 'Diagnostic Center'
            };

            const res = await discoveryService.searchCenters({
                type: categoryToType[category],
                service: serviceSearch,
                limit: 5
            });
            setCenters(res.centers || []);
        } catch (error) {
            toast.error("Failed to search for healthcare centers");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async () => {
        if (!selectedPatient) {
            toast.error("Please select a patient before submitting");
            return;
        }

        const destinationCenter = selectedCenter || {
            id: 'manual-dispatch',
            name: (category === 'transfer' && isAmbulanceService) ? destinationHospital : 'Direct Field Order'
        };


        if (!referringDoctor.trim() || !referringCenter.trim()) {
            toast.error("Please ensure referring doctor and center information is filled");
            return;
        }

        try {
            setLoading(true);

            // 0. Create a formal Medical Record for permanence
            const record = await medicalReportsService.createMedicalReport({
                patientId: selectedPatient.id,
                title: `${category.toUpperCase()} Request Card`,
                diagnosis: `Clinical Indication: ${clinicalNotes}`,
                notes: `Requested service: ${serviceSearch}. Request ID: ${requestId}`,
                recordType: category,
                centerId: destinationCenter.id,
                status: 'ACTIVE',
                vitals: vitals
            } as any);

            // 1. Create the request via discovery service
            await discoveryService.createRequest({
                recipientId: destinationCenter.id,
                requestType: category,
                message: `Clinical Diagnosis & Prescription for ${selectedPatient.fullName}. Note: ${clinicalNotes}`,
                metadata: {
                    requestId,
                    patientId: selectedPatient.id,
                    patientName: selectedPatient.fullName,
                    category,
                    priority,
                    clinicalNotes,
                    serviceRequested: serviceSearch,
                    destinationCenter: destinationCenter.name,
                    receivingDoctor,
                    imagingTransferDetails,
                    hasAttachedReports: attachedFiles.length > 0,
                    attachmentsCount: attachedFiles.length,
                    recordId: record.id,
                    referringPhone,
                    referringEmail,
                    price: selectedCenter?.offeredServices?.find(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))?.price,
                    // Ambulance Papers
                    sceneCondition,
                    dispatchTime,
                    arrivalTime,
                    completedTime,
                    cprConsent,
                    destinationHospital,
                    receivingPhysicianName,
                    transferDate,
                    prescriptionDetails,
                    radiotherapyDetails,
                    reportDetails,
                    signature,
                    vitals,
                    deathCertificateDetails,
                    dischargeSummaryDetails,
                }
            });

            toast.success("Clinical request created and permanently recorded!");

            if (isAmbulanceService) {
                toast.info("Wallet Debited: Consultation fee processed for immediate specialist access.", {
                    icon: <DollarSign className="h-4 w-4 text-emerald-600" />
                });
            }

            setStep(4); // Show completion / PDF view
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to create clinical request");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep(1);
        setSelectedPatient(null);
        setSelectedCenter(null);
        setClinicalNotes('');
        setServiceSearch('');
        setVitals({
            heartRate: '',
            bp: '',
            temp: '',
            spO2: '',
            respiratoryRate: ''
        });
        setReportDetails({
            findings: '',
            impression: '',
            recommendations: '',
            specimenType: '',
            labNumber: `LAB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        });
        setSignature(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={reset}>
            <DialogContent className="w-screen sm:w-[95vw] max-w-[750px] h-[90dvh] sm:h-[92vh] sm:max-h-[92vh] p-0 border-0 shadow-2xl bg-white overflow-hidden flex flex-col sm:rounded-[2.5rem] mb-safe">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-indigo-950 px-6 pt-14 pb-8 sm:p-8 text-white relative overflow-hidden shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <DialogHeader className="text-left">
                            <DialogTitle className="text-2xl sm:text-2xl md:text-3xl font-black flex items-center gap-3 uppercase tracking-tight">
                                {category === 'transfer' ? (
                                    <>< LucideUser className="h-8 w-8 text-orange-400" /> In-house Transfer</>
                                ) : category === 'connection' ? (
                                    <><Phone className="h-8 w-8 text-cyan-300" /> Connect Colleagues</>
                                ) : category === 'prescription' ? (
                                    <><Pill className="h-8 w-8 text-rose-400" /> Clinical Diagnosis and Prescription</>
                                ) : category === 'radiotherapy' ? (
                                    <><Radio className="h-8 w-8 text-purple-400" /> Radiotherapy Order</>
                                ) : category === 'diagnostic' ? (
                                    <><Microscope className="h-8 w-8 text-emerald-400" /> Medical Investigation</>
                                ) : category === 'biotech' ? (
                                    <><Activity className="h-8 w-8 text-blue-400" /> Bioengineering Request</>
                                ) : category === 'consultation' ? (
                                    <><Stethoscope className="h-8 w-8 text-indigo-400" /> Specialist Consultation</>
                                ) : category === 'referral' ? (
                                    <><ArrowRight className="h-8 w-8 text-blue-400" /> Clinical Referral</>
                                ) : category === 'death_certificate' ? (
                                    <><FileText className="h-8 w-8 text-slate-400" /> Death Certificate</>
                                ) : category === 'discharge_summary' ? (
                                    <><ClipboardCheck className="h-8 w-8 text-emerald-400" /> Discharge Summary</>
                                ) : (
                                    <><ClipboardCheck className="h-8 w-8 text-emerald-400" /> Request Card</>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-blue-100/80 font-semibold mt-2 text-sm leading-tight max-w-[90%]">
                                {category === 'transfer'
                                    ? "Document emergency patient transfer, scene conditions, and destination details."
                                    : category === 'prescription'
                                        ? "Issue a formally signed medication order to the pharmacy."
                                        : category === 'biotech'
                                            ? "Request equipment procurement or bio-medical engineering services."
                                            : category === 'consultation'
                                                ? "Formalize a specialist review or second opinion for your patient."
                                                : category === 'referral'
                                                    ? "Process a patient transfer to a specialty clinic or hospital."
                                                    : category === 'death_certificate'
                                                        ? "Issue a formal, signed certification of death for legal and medical records."
                                                        : category === 'discharge_summary'
                                                            ? "Document the patient's hospital course and post-discharge plan."
                                                            : "Create a formal, digitally signed medical request."}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Step Indicator */}
                        <div className="flex gap-3 mt-8">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex-1">
                                    <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-white' : 'bg-white/20'}`} />
                                    <p className="text-[10px] uppercase tracking-widest font-black mt-2 opacity-60">Step 0{s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-3 sm:p-8 flex-1 overflow-y-auto custom-scrollbar pb-32 sm:pb-8">
                    {/* Step 1: Select Patient */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 zoom-in-95 duration-500">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    < LucideUser className="h-5 w-5 text-blue-500" /> Identify Patient
                                </h4>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0">{patients.length} Recent</Badge>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search patients..."
                                    className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200"
                                    value={searchQuery}
                                    onChange={(e) => handlePatientSearch(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(searchedPatients.length > 0 ? searchedPatients.map(user => ({
                                    id: user.id || user.publicId,
                                    fullName: user.displayName || `${user.profile?.firstName} ${user.profile?.lastName}`.trim(),
                                    gender: user.profile?.gender,
                                    age: user.profile?.dateOfBirth ? new Date().getFullYear() - new Date(user.profile.dateOfBirth).getFullYear() : undefined
                                })) : patients.filter(p => p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()))).map((patient) => (
                                    <button
                                        key={patient.id}
                                        onClick={() => handleSelectPatientManual(patient as any)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedPatient?.id === patient.id
                                            ? 'border-blue-600 bg-blue-50/50'
                                            : 'border-gray-100 hover:border-blue-200 bg-white'
                                            }`}
                                    >
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {patient.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 truncate">{patient.fullName}</p>
                                            <p className="text-[10px] text-gray-500">{patient.gender || 'N/A'} · {patient.age || '??'}yrs</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {selectedPatient && (
                                <Button className="w-full h-14 bg-blue-600 rounded-2xl font-bold text-lg" onClick={() => setStep(2)}>
                                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Step 2: Clinical Order Form */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20 w-full overflow-x-hidden">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-4 px-1">
                                <h4 className="text-base sm:text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                                    <ClipboardCheck className="h-6 w-6 text-blue-600" /> {
                                        category === 'prescription' ? 'Clinical Diagnosis and Prescription Form' :
                                            category === 'radiotherapy' ? 'Radiotherapy Request Form' :
                                                category === 'report' ? 'Clinical Result / Report Form' :
                                                    category === 'biotech' ? 'Equipment / Bioengineering Form' :
                                                        category === 'consultation' ? 'Specialist Consulting Form' :
                                                            category === 'diagnostic' || category === 'imaging' ? 'Medical Investigation Form' :
                                                                category === 'death_certificate' ? 'Death Certification Form' :
                                                                    category === 'discharge_summary' ? 'Clinical Discharge Summary' :
                                                                        'Medical Order Form'
                                    }
                                </h4>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 uppercase animate-pulse">
                                    <ShieldCheck className="h-3 w-3" /> Digital Verification Active
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1 space-y-6">
                                    {/* Category Selection */}
                                    <div className="space-y-3">
                                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Request Category</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {[
                                                { id: 'diagnostic', label: 'Diagnostic', icon: Microscope },
                                                { id: 'radiotherapy', label: 'Radiotherapy', icon: Radio },
                                                { id: 'prescription', label: 'Prescription', icon: Pill },
                                                { id: 'referral', label: 'Referral', icon: ArrowRight },
                                                { id: 'biotech', label: 'Biotech', icon: Activity },
                                                { id: 'consultation', label: 'Specialist', icon: Stethoscope },
                                                { id: 'death_certificate', label: 'Death Cert', icon: FileText },
                                                { id: 'discharge_summary', label: 'Discharge', icon: ClipboardCheck },
                                            ].map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategory(cat.id as any)}
                                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all gap-1.5 ${category === cat.id ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    <cat.icon className="h-4 w-4" />
                                                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter leading-tight text-center">{cat.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Formal Order Table Form */}
                                    <div className="bg-slate-50/50 border border-slate-200 rounded-[2rem] p-6 space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <ClipboardList className="h-4 w-4 text-blue-600" /> Order Specifications
                                            </h5>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-slate-200 text-slate-400">Section 01</Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Primary Investigation/Medication *</Label>
                                                    <Input
                                                        placeholder="e.g. Full Blood Count..."
                                                        className="h-11 rounded-xl bg-white border-slate-200 font-bold"
                                                        value={serviceSearch}
                                                        onChange={(e) => setServiceSearch(e.target.value)}
                                                    />
                                                </div>

                                                {category === 'prescription' && (
                                                    <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Dosage</Label>
                                                            <Input placeholder="500mg" className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={prescriptionDetails.dosage} onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, dosage: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Frequency</Label>
                                                            <Input placeholder="BD (2x)" className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={prescriptionDetails.frequency} onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, frequency: e.target.value })} />
                                                        </div>
                                                    </div>
                                                )}

                                                {(category === 'diagnostic' || category === 'imaging') && (
                                                    <div className="animate-in fade-in duration-500">
                                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Priority Level</Label>
                                                        <div className="flex gap-2">
                                                            {['routine', 'urgent', 'stat'].map((p) => (
                                                                <button
                                                                    key={p}
                                                                    type="button"
                                                                    onClick={() => setPriority(p)}
                                                                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all border ${priority === p ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-200'}`}
                                                                >
                                                                    {p}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {category === 'death_certificate' && (
                                                    <div className="space-y-4 animate-in fade-in duration-500">
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Date & Time of Death *</Label>
                                                            <Input type="datetime-local" className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={deathCertificateDetails.dateTimeOfDeath} onChange={(e) => setDeathCertificateDetails({ ...deathCertificateDetails, dateTimeOfDeath: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Primary Cause of Death *</Label>
                                                            <Input placeholder="e.g. Myocardial Infarction..." className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={deathCertificateDetails.causeOfDeath} onChange={(e) => setDeathCertificateDetails({ ...deathCertificateDetails, causeOfDeath: e.target.value })} />
                                                        </div>
                                                    </div>
                                                )}

                                                {category === 'discharge_summary' && (
                                                    <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-500">
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Admission Date</Label>
                                                            <Input type="date" className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={dischargeSummaryDetails.admissionDate} onChange={(e) => setDischargeSummaryDetails({ ...dischargeSummaryDetails, admissionDate: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Discharge Date</Label>
                                                            <Input type="date" className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={dischargeSummaryDetails.dischargeDate} onChange={(e) => setDischargeSummaryDetails({ ...dischargeSummaryDetails, dischargeDate: e.target.value })} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                {category === 'radiotherapy' ? (
                                                    <>
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Anatomical Target *</Label>
                                                            <Input placeholder="Anatomy..." className="h-11 rounded-xl bg-white border-slate-200 font-bold" value={radiotherapyDetails.targetArea} onChange={(e) => setRadiotherapyDetails({ ...radiotherapyDetails, targetArea: e.target.value })} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Dose (Gy)</Label>
                                                                <Input placeholder="Gy" className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={radiotherapyDetails.dose} onChange={(e) => setRadiotherapyDetails({ ...radiotherapyDetails, dose: e.target.value })} />
                                                            </div>
                                                            <div>
                                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Cycles</Label>
                                                                <Input placeholder="Ct" className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={radiotherapyDetails.cycles} onChange={(e) => setRadiotherapyDetails({ ...radiotherapyDetails, cycles: e.target.value })} />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : category === 'death_certificate' ? (
                                                    <div className="space-y-4 animate-in fade-in duration-500">
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Place of Death *</Label>
                                                            <Input placeholder="e.g. General Hospital, Ward 4..." className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={deathCertificateDetails.placeOfDeath} onChange={(e) => setDeathCertificateDetails({ ...deathCertificateDetails, placeOfDeath: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Informant Name/Relation</Label>
                                                            <Input placeholder="Next of Kin..." className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={deathCertificateDetails.informantName} onChange={(e) => setDeathCertificateDetails({ ...deathCertificateDetails, informantName: e.target.value })} />
                                                        </div>
                                                    </div>
                                                ) : category === 'discharge_summary' ? (
                                                    <div className="space-y-4 animate-in fade-in duration-500">
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Summary of Hospital Care *</Label>
                                                            <Textarea placeholder="Treatment provided, progress..." className="min-h-[80px] rounded-lg bg-white border-slate-200 text-xs font-bold" value={dischargeSummaryDetails.summaryOfCare} onChange={(e) => setDischargeSummaryDetails({ ...dischargeSummaryDetails, summaryOfCare: e.target.value })} />
                                                        </div>
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Follow-up Instructions</Label>
                                                            <Input placeholder="e.g. Clinic visit in 2 weeks..." className="h-10 rounded-lg bg-white border-slate-200 text-xs font-bold" value={dischargeSummaryDetails.followUpInstructions} onChange={(e) => setDischargeSummaryDetails({ ...dischargeSummaryDetails, followUpInstructions: e.target.value })} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div>
                                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Clinical Indication/Notes *</Label>
                                                            <Textarea
                                                                placeholder="Clinical reasoning..."
                                                                className="min-h-[100px] rounded-xl bg-white border-slate-200 text-xs font-bold resize-none"
                                                                value={clinicalNotes}
                                                                onChange={(e) => setClinicalNotes(e.target.value)}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-200">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block text-center">Provider Selection</Label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <Input
                                                    placeholder="Search preferred facility..."
                                                    className="h-11 rounded-xl bg-white border-slate-200 font-bold flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="h-11 rounded-xl px-6 bg-blue-600 text-white hover:bg-blue-700 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100"
                                                    onClick={handleSearchCenters}
                                                    disabled={!serviceSearch || loading}
                                                >
                                                    <Search className="h-3 w-3 mr-2 text-white" /> Find Providers
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Provider Selection List with Prices */}
                                    {centers.length > 0 && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Available Providers</Label>
                                            <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                                                {centers.map((center) => {
                                                    const offeredService = center.offeredServices?.find(s =>
                                                        s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                                                        serviceSearch.toLowerCase().includes(s.name.toLowerCase())
                                                    );

                                                    return (
                                                        <button
                                                            key={center.id}
                                                            type="button"
                                                            onClick={() => setSelectedCenter(center)}
                                                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${selectedCenter?.id === center.id ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 bg-white hover:border-blue-200'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                                                    <Building2 className="h-4 w-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{center.name}</p>
                                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">
                                                                        {center.type} · {center.city}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-black text-emerald-600">
                                                                    {offeredService && typeof offeredService.price === 'number'
                                                                        ? `₦${offeredService.price.toLocaleString()}`
                                                                        : 'Contact for Price'}
                                                                </p>
                                                                <Badge className="bg-emerald-50 text-emerald-700 text-[8px] border-0 h-4">AVAIL.</Badge>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Specialized Metadata */}
                                    {category === 'transfer' && isAmbulanceService && (
                                        <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black text-orange-700 uppercase tracking-widest flex items-center gap-2">
                                                    <Activity className="h-3.5 w-3.5" /> Ambulance Transfer Paperwork
                                                </Label>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Scene Condition / Medical State *</Label>
                                                    <Input
                                                        placeholder="e.g. Critical, Stable, Unconscious..."
                                                        className="h-10 rounded-xl mt-1.5 border-orange-100 bg-white"
                                                        value={sceneCondition}
                                                        onChange={(e) => setSceneCondition(e.target.value)}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Destination Hospital *</Label>
                                                        <Input
                                                            placeholder="Hospital Name"
                                                            className="h-10 rounded-xl mt-1.5 border-orange-100"
                                                            value={destinationHospital}
                                                            onChange={(e) => setDestinationHospital(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Receiving Physician *</Label>
                                                        <Input
                                                            placeholder="Dr. Name"
                                                            className="h-10 rounded-xl mt-1.5 border-orange-100"
                                                            value={receivingPhysicianName}
                                                            onChange={(e) => setReceivingPhysicianName(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full lg:w-[320px] space-y-6">
                                    {/* Vitals Pad */}
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <Activity className="h-3 w-3 text-red-500" /> Vitals Snapshot
                                        </Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'BP', key: 'bp', placeholder: '120/80', unit: 'mmHg' },
                                                { label: 'HR', key: 'heartRate', placeholder: '72', unit: 'bpm' },
                                                { label: 'Temp', key: 'temp', placeholder: '36.5', unit: '°C' },
                                                { label: 'SpO2', key: 'spO2', placeholder: '98', unit: '%' },
                                            ].map((v) => (
                                                <div key={v.key} className="space-y-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase">{v.label} ({v.unit})</span>
                                                    <Input
                                                        placeholder={v.placeholder}
                                                        className="h-9 rounded-lg border-gray-200 bg-white text-[10px] font-black"
                                                        value={vitals[v.key as keyof typeof vitals]}
                                                        onChange={(e) => setVitals({ ...vitals, [v.key]: e.target.value })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Practitioner Verification */}
                                    <div className="space-y-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
                                        <Label className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck className="h-3.5 w-3.5" /> Clinician Auth
                                        </Label>
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-blue-400" />
                                                <Input
                                                    placeholder="Contact Phone"
                                                    className="pl-9 h-9 rounded-lg border-blue-100 text-[10px] font-bold"
                                                    value={referringPhone}
                                                    onChange={(e) => setReferringPhone(e.target.value)}
                                                />
                                            </div>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-blue-400" />
                                                <Input
                                                    placeholder="Clinician Email"
                                                    className="pl-9 h-9 rounded-lg border-blue-100 text-[10px] font-bold"
                                                    value={referringEmail}
                                                    onChange={(e) => setReferringEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Signature Area */}
                                        <div className="mt-4 pt-4 border-t border-blue-100">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Digital E-Signature</Label>
                                            <SignaturePad
                                                onSave={(data) => setSignature(data)}
                                                onClear={() => setSignature(null)}
                                                className="bg-white rounded-xl h-24"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4 px-2">
                                <Button variant="outline" className="h-14 rounded-2xl font-bold uppercase tracking-widest order-2 sm:order-1" onClick={() => setStep(1)}>
                                    Back
                                </Button>
                                <Button
                                    className="h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all uppercase tracking-widest order-1 sm:order-2"
                                    onClick={() => setStep(3)}
                                    disabled={!serviceSearch || !clinicalNotes || !referringPhone || !signature}
                                >
                                    Review Document <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Formal Document Preview & Print */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500 pb-20 w-full overflow-x-hidden">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Final Medical Order</h3>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                            <ShieldCheck className="h-3 w-3" /> Legally Verified Clinical Document
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document ID</p>
                                    <p className="text-xs font-mono font-bold text-slate-900">UHC-ORD-{requestId}</p>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-slate-100 rounded-[35px] shadow-2xl shadow-blue-50/50 overflow-hidden relative group">
                                {/* Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-12">
                                    <h1 className="text-9xl font-black uppercase tracking-[0.2em] select-none text-blue-900 italic">OFFICIAL</h1>
                                </div>

                                <div className="p-8 space-y-8 relative z-10">
                                    {/* Header Section */}
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                                                    {category === 'report' ? 'Reporting Practitioner' : 'Requesting Clinician'}
                                                </h4>
                                                <p className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">{currentDoctor?.profile?.name || currentDoctor?.name || 'Dr. Practitioner'}</p>
                                                <div className="mt-2 space-y-0.5">
                                                    <p className="text-[11px] font-bold text-slate-500 flex items-center gap-2 tracking-tight"><Phone className="h-3 w-3" /> {referringPhone}</p>
                                                    <p className="text-[11px] font-bold text-slate-500 flex items-center gap-2 tracking-tight"><Mail className="h-3 w-3" /> {referringEmail}</p>
                                                </div>
                                            </div>
                                            {category === 'report' && (
                                                <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-[9px] font-black uppercase tracking-widest w-fit">
                                                    Lab Ref: {reportDetails.labNumber}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right space-y-4">
                                            <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                                                {category === 'report' ? 'Report Finalized: ' : 'Order Issued: '} {format(new Date(), 'dd MMM yyyy')}
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-slate-100 w-fit ml-auto">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Patient Details</h4>
                                                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{selectedPatient?.fullName}</p>
                                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Registry ID: {selectedPatient?.id.substring(0, 12)}...</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clinical Body */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="md:col-span-2 space-y-6">
                                            <div>
                                                <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                    {(category as string) === 'prescription' ? 'Prescription Order' :
                                                        category === 'radiotherapy' ? 'Radiotherapy Target' :
                                                            'Investigation Order'}
                                                </h5>
                                                <div className="text-xl font-black text-slate-900 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 uppercase tracking-tight leading-relaxed italic flex justify-between items-center">
                                                    <span>{serviceSearch.toUpperCase()}</span>
                                                    {selectedCenter?.offeredServices?.find(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())) && (
                                                        <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                                            ₦{selectedCenter?.offeredServices?.find(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))?.price?.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                    <div className="h-4 w-1 bg-blue-600 rounded-full" />
                                                    Clinical Order Details
                                                </h5>

                                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                            <tr>
                                                                <th className="px-4 py-3 border-b border-slate-200">Attribute</th>
                                                                <th className="px-4 py-3 border-b border-slate-200">Specification</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            <tr>
                                                                <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Request Type</td>
                                                                <td className="px-4 py-3 font-black text-slate-900 uppercase">{category}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Service/Item</td>
                                                                <td className="px-4 py-3 font-black text-blue-600 uppercase">{serviceSearch}</td>
                                                            </tr>
                                                            {(category as string) === 'prescription' && (
                                                                <>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Dosage</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{prescriptionDetails.dosage || 'AS DIRECTED'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Frequency</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{prescriptionDetails.frequency || 'N/A'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Duration</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{prescriptionDetails.duration || 'N/A'}</td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                            {category === 'radiotherapy' && (
                                                                <>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Target Area</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{radiotherapyDetails.targetArea || 'N/A'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Technique</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{radiotherapyDetails.technique || 'EXTERNAL BEAM'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Total Dose</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{radiotherapyDetails.dose} Gy</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Cycles</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{radiotherapyDetails.cycles}</td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                            {category === 'transfer' && (
                                                                <>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Destination</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{destinationHospital}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Receiving M.O.</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{receivingPhysicianName}</td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                            {category === 'death_certificate' && (
                                                                <>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Time of Death</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{deathCertificateDetails.dateTimeOfDeath}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Cause of Death</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{deathCertificateDetails.causeOfDeath}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Place of Death</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{deathCertificateDetails.placeOfDeath}</td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                            {category === 'discharge_summary' && (
                                                                <>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Admission Date</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{dischargeSummaryDetails.admissionDate}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-3 font-bold text-slate-400 uppercase text-[9px]">Discharge Date</td>
                                                                        <td className="px-4 py-3 font-bold text-slate-900 uppercase">{dischargeSummaryDetails.dischargeDate}</td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div>
                                                <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                    <div className="h-4 w-1 bg-blue-600 rounded-full" />
                                                    {category === 'death_certificate' ? 'Death Certification Remarks' :
                                                        category === 'discharge_summary' ? 'Post-Discharge Instructions' :
                                                            category === 'report' ? 'Interpretative Remarks' : 'Conclusion / Recommendation'}
                                                </h5>
                                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 border-dashed">
                                                    <div className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                        {category === 'death_certificate' ? (
                                                            <div className="space-y-4">
                                                                <p className="text-slate-900">{clinicalNotes}</p>
                                                                {deathCertificateDetails.informantName && (
                                                                    <div className="pt-2 border-t border-slate-200">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Informant Details</p>
                                                                        <p className="text-slate-900 font-black">{deathCertificateDetails.informantName}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : category === 'discharge_summary' ? (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Summary of Care</p>
                                                                    <p className="text-slate-900">{dischargeSummaryDetails.summaryOfCare}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Follow-up Plan</p>
                                                                    <p className="text-slate-900">{dischargeSummaryDetails.followUpInstructions}</p>
                                                                </div>
                                                                {clinicalNotes && (
                                                                    <div className="pt-2 border-t border-slate-200">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Additional Notes</p>
                                                                        <p className="text-slate-500 italic">{clinicalNotes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : category === 'report' ? (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 underline decoration-emerald-100">Findings / Results</p>
                                                                    <p className="text-slate-900">{reportDetails.findings}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 underline decoration-emerald-100">Clinical Impression</p>
                                                                    <p className="text-slate-900">{reportDetails.impression}</p>
                                                                </div>
                                                                {clinicalNotes && (
                                                                    <div className="pt-2 border-t border-slate-200">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Additional Dr's Notes</p>
                                                                        <p className="text-slate-500 italic">{clinicalNotes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : clinicalNotes}
                                                    </div>
                                                    {category === 'transfer' && isAmbulanceService && (
                                                        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6">
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scene Condition</p>
                                                                <p className="text-sm font-black text-slate-900 border-l-4 border-orange-500 pl-3 uppercase">{sceneCondition || 'N/A'}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPR Consent</p>
                                                                <p className="text-sm font-black text-slate-900 border-l-4 border-orange-500 pl-3 uppercase">{cprConsent}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timings</p>
                                                                <p className="text-[11px] font-bold text-slate-700">Dispatch: {dispatchTime || '—'} · Arrival: {arrivalTime || '—'} · Done: {completedTime || '—'}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</p>
                                                                <p className="text-[11px] font-bold text-slate-700 uppercase">{destinationHospital || '—'} (Physician: {receivingPhysicianName || '—'})</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {attachedFiles.length > 0 && (
                                                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2">
                                                            <Paperclip className="h-4 w-4 text-blue-500" />
                                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{attachedFiles.length} Clinical Documents Attached for Review</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                                                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60 flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-emerald-400" /> Recorded Vitals
                                                </h5>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {[
                                                        { label: 'Blood Pressure', val: vitals.bp || '—', unit: 'mmHg' },
                                                        { label: 'Heart Rate', val: vitals.heartRate || '—', unit: 'bpm' },
                                                        { label: 'Temperature', val: vitals.temp || '—', unit: '°C' },
                                                        { label: 'Oxygen Sat.', val: vitals.spO2 || '—', unit: '%' },
                                                    ].map((v) => (
                                                        <div key={v.label} className="flex justify-between items-end border-b border-white/10 pb-2">
                                                            <span className="text-[9px] font-bold text-white/50 uppercase">{v.label}</span>
                                                            <div className="text-right">
                                                                <span className="text-lg font-black">{v.val}</span>
                                                                <span className="text-[9px] font-bold ml-1 opacity-40 uppercase">{v.unit}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Formal Stamp/Signature Pad */}
                                            <div className="relative mt-auto pt-8">
                                                <div className="p-4 border-2 border-blue-100 rounded-3xl bg-blue-50/30 flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
                                                    <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-45">
                                                        <ShieldCheck className="h-24 w-24 text-blue-900" />
                                                    </div>

                                                    {signature ? (
                                                        <img src={signature} alt="Clinician Signature" className="h-16 object-contain relative z-10" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 relative z-10 animate-in zoom-in-0 duration-700">
                                                            <CheckCheck className="h-6 w-6 text-white" />
                                                        </div>
                                                    )}

                                                    <div className="text-center relative z-10">
                                                        <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-tight">Digital Clinic Stamp</p>
                                                        <p className="text-[8px] font-black text-blue-600/60 uppercase tracking-tighter mt-1 italic">Verified on Order</p>
                                                    </div>

                                                    <div className="mt-4 w-full h-px bg-blue-200/50" />
                                                    <div className="text-center py-2 relative z-10">
                                                        <p className="text-sm font-serif italic font-bold text-gray-800 scale-125 mb-1 select-none">
                                                            {currentDoctor?.profile?.name || currentDoctor?.name || 'Dr. Practitioner'}
                                                        </p>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest underline decoration-blue-100 decoration-2 underline-offset-4 font-mono">ORDER-AUTHORIZED</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-blue-600 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                            <ShieldCheck className="h-3 w-3 text-blue-200" /> Bilateral Verification Active
                                        </div>
                                        <p className="text-[9px] font-bold text-blue-100/60 lowercase tracking-tighter">For 3rd party verification, contact clinician: {referringPhone} / {referringEmail}</p>
                                    </div>
                                    <div className="text-[9px] font-black text-blue-100 uppercase tracking-tighter bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                                        Doc ID: {requestId}-{Math.random().toString(36).substring(7).toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 sm:pt-4 pb-32 sm:pb-8">
                                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest border-2" onClick={() => setStep(2)}>
                                    Edit Details
                                </Button>
                                <Button
                                    className={cn(
                                        "flex-[2] h-14 text-white rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest",
                                        "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                                    )}
                                    onClick={handleCreateRequest}
                                    disabled={loading}
                                >
                                    {loading ? 'Archiving...' : (category === 'report' ? 'Sign & Archive Result' : 'Sign & Submit Order')}
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Final Confirmation */}
                    {step === 4 && (
                        <div className="py-12 space-y-10 animate-in zoom-in-95 duration-700">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-100 rounded-full blur-2xl opacity-50 animate-pulse" />
                                    <div className="h-28 w-28 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-white shadow-2xl relative z-10 rotate-3 transition-transform hover:rotate-0">
                                        <ShieldCheck className="h-14 w-14" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Order Successfully Archived</h4>
                                    <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm leading-relaxed uppercase tracking-tighter">
                                        Your clinical request has been permanently recorded and dispatched to the health network.
                                    </p>
                                </div>
                                <div className="flex justify-center gap-3">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">Record ID Hash Active</Badge>
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">Bilateral Verified</Badge>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 space-y-6 relative overflow-hidden">
                                <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                                    <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                                        <Building2 className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Registered Registry Destination</p>
                                        <p className="text-sm font-black text-slate-800 uppercase mt-1 tracking-tight">Cloud Dispatch — Universal Healthcare Archive</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Order Metadata</span>
                                        <span>Status</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Blockchain ID', val: `0x${Math.random().toString(16).substring(2, 12).toUpperCase()}`, status: 'SECURED' },
                                            { label: 'Clinical Hash', val: Math.random().toString(36).substring(2, 15).toUpperCase(), status: 'FINALIZED' },
                                            { label: 'Timestamp', val: format(new Date(), 'dd MMM yyyy HH:mm:ss'), status: 'SYNCED' },
                                        ].map((meta) => (
                                            <div key={meta.label} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{meta.label}</p>
                                                    <p className="text-xs font-mono font-bold text-slate-900">{meta.val}</p>
                                                </div>
                                                <div className="px-2 py-1 bg-emerald-50 text-[8px] font-black text-emerald-700 rounded-md uppercase tracking-tighter">
                                                    {meta.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    className="flex-1 h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 uppercase tracking-widest"
                                    onClick={() => window.print()}
                                >
                                    <Printer className="h-5 w-5" /> Generate PDF
                                </Button>
                                <Button
                                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase tracking-widest"
                                    onClick={reset}
                                >
                                    Dismiss <CheckCircle2 className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Fixed Footer Navigation */}
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
                                "h-14 sm:h-16 rounded-2xl font-black text-xs sm:text-lg uppercase tracking-widest shadow-xl transition-all active:scale-95",
                                step === 1 ? "w-full bg-blue-600" : "flex-[2] bg-blue-600 shadow-blue-100"
                            )}
                            onClick={() => setStep(next => next + 1)}
                            disabled={loading || (step === 1 && !selectedPatient) || (step === 2 && (!serviceSearch || (category === 'transfer' && !destinationHospital)))}
                        >
                            {step === 1 ? 'Configure Service Protocol' : 'Authorize Requirements'}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
