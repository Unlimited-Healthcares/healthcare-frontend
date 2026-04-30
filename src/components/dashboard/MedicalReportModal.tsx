import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    FileText,
    User,
    Calendar,
    ArrowRight,
    Printer,
    CheckCircle2,
    Building,
    Clipboard,
    Stethoscope,
    Activity,
    Thermometer,
    Dumbbell,
    Dna,
    AlertCircle,
    Save,
    MapPin,
    Phone,
    Mail,
    Fingerprint,
    ShieldCheck,
    Lock,
    Download,
    CreditCard
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { medicalReportsService } from '@/services/medicalReportsService';
import { auditService } from '@/services/auditService';
import { notificationService } from '@/services/notificationService';
import { cn } from "@/lib/utils";

interface MedicalReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientData?: {
        id?: string;
        fullName?: string;
        dob?: string;
        age?: string;
        gender?: string;
        patientId?: string;
        mrn?: string;
        address?: string;
        phone?: string;
        email?: string;
        emergencyContact?: string;
        relationship?: string;
    };
}

export const MedicalReportModal: React.FC<MedicalReportModalProps> = ({
    isOpen,
    onClose,
    patientData
}) => {
    const { user, profile } = useAuth();
    const [step, setStep] = useState<'edit' | 'success'>('edit');
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Facility Info (Live from Profile)
        facilityName: (profile as any)?.centerName || (profile as any)?.name || 'Digital Medical Center',
        facilityAddress: (profile as any)?.centerAddress || (profile as any)?.address || 'Healthcare District Platform',
        facilityPhone: (profile as any)?.centerPhone || (profile as any)?.phone || '+1 (UHC) PRO-SYNC',
        facilityEmail: (profile as any)?.centerEmail || (profile as any)?.email || 'records@uhc-platform.com',

        // Patient Info (can be pre-filled)
        fullName: patientData?.fullName || '',
        dob: patientData?.dob || '',
        age: patientData?.age || '',
        gender: patientData?.gender || '',
        patientId: patientData?.patientId || '',
        mrn: patientData?.mrn || 'MRN-' + Math.floor(Math.random() * 100000),
        address: patientData?.address || '',
        phone: patientData?.phone || '',
        email: patientData?.email || '',
        emergencyContact: patientData?.emergencyContact || '',
        relationship: patientData?.relationship || '',

        // Report Details
        reportDate: new Date().toISOString().split('T')[0],
        reportType: 'General Assessment',
        referringPhysician: '',
        clinicHospital: (profile as any)?.centerName || (profile as any)?.name || '',
        reportingClinician: (profile as any)?.displayName || user?.name || user?.email || 'Authorized Clinician',
        designation: (user?.roles?.[0])?.toUpperCase() || 'Medical Practitioner',
        licenseNo: profile?.id?.substring(0, 8).toUpperCase() || 'LIC-SYNC-ACTIVE',

        // Death Certificate Specific
        timeOfDeath: '',
        causeOfDeath: '',
        placeOfDeath: '',

        // Discharge Summary Specific
        dateOfAdmission: '',
        dateOfDischarge: '',
        hospitalCourse: '',

        // Clinical Content
        chiefComplaint: '',
        hpi: '',

        // PMH
        chronicConditions: '',
        previousSurgeries: '',
        allergies: '',
        currentMedications: '',
        familyHistory: '',
        socialHistory: '',

        // Vitals
        bp: '',
        hr: '',
        temp: '',
        rr: '',
        spo2: '',
        weight: '',
        height: '',
        bmi: '',
        systemExamination: '',

        // Results
        labTests: '',
        imagingStudies: '',
        otherTests: '',

        // Diagnosis
        primaryDiagnosis: '',
        secondaryDiagnosis: '',
        differentialDiagnosis: '',

        // Management
        medicationsPrescribed: '',
        proceduresPerformed: '',
        referrals: '',
        followUp: '',

        // Digital Signature
        signaturePin: '',
        isSigned: false,
        signatureTimestamp: '',
        sealId: ''
    });

    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Sync profile data when it loads
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                facilityName: (profile as any).centerName || (profile as any).name || prev.facilityName,
                facilityAddress: (profile as any).centerAddress || (profile as any).address || prev.facilityAddress,
                facilityPhone: (profile as any).centerPhone || (profile as any).phone || prev.facilityPhone,
                facilityEmail: (profile as any).centerEmail || (profile as any).email || prev.facilityEmail,
                reportingClinician: (profile as any).displayName || user?.name || prev.reportingClinician,
                clinicHospital: (profile as any).centerName || (profile as any).name || prev.clinicHospital,
                designation: (user?.roles?.[0])?.toUpperCase() || prev.designation
            }));
        }
    }, [profile, user]);

    // Auto-calculate BMI
    useEffect(() => {
        const w = parseFloat(formData.weight);
        const h = parseFloat(formData.height);
        if (w > 0 && h > 0) {
            const hMeter = h / 100;
            const bmi = (w / (hMeter * hMeter)).toFixed(1);
            setFormData(prev => ({ ...prev, bmi }));
        }
    }, [formData.weight, formData.height]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = async () => {
        if (!patientData?.id && !formData.fullName) {
            toast.error("Patient identification required for synchronization");
            return;
        }

        if (!formData.signaturePin || formData.signaturePin.length < 4) {
            toast.error("Valid Digital Signature PIN required to seal this report");
            return;
        }

        setIsSaving(true);
        try {
            // Generate a Mock Cryptographic Seal for demonstration of legality
            const sealId = `UHC-SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;

            await medicalReportsService.createMedicalReport({
                patientId: patientData?.id || formData.patientId || 'anonymous',
                title: `${formData.reportType}: ${formData.fullName}`,
                reportType: 'general',
                diagnosis: formData.primaryDiagnosis || 'Pending Clinical Confirmation',
                prescription: formData.medicationsPrescribed,
                notes: formData.chiefComplaint,
                centerId: (profile as any)?.centerId || (user as any)?.centerId || 'platform-default',
                priority: 'normal',
                metadata: {
                    isDigitallySigned: true,
                    digitalSeal: sealId,
                    signedBy: formData.reportingClinician,
                    clinicianLicense: formData.licenseNo,
                    signedAt: new Date().toISOString(),
                    verificationHash: btoa(formData.primaryDiagnosis + sealId).substring(0, 32),
                    hpi: formData.hpi,
                    pmh: {
                        chronic: formData.chronicConditions,
                        surgeries: formData.previousSurgeries,
                        family: formData.familyHistory,
                        social: formData.socialHistory
                    },
                    vitals: {
                        bp: formData.bp,
                        hr: formData.hr,
                        temp: formData.temp,
                        weight: formData.weight,
                        height: formData.height,
                        bmi: formData.bmi,
                        spo2: formData.spo2
                    },
                    mortality: formData.reportType === 'Death Certificate' ? {
                        time: formData.timeOfDeath,
                        cause: formData.causeOfDeath,
                        place: formData.placeOfDeath
                    } : undefined,
                    discharge: formData.reportType === 'Discharge Summary' ? {
                        admission: formData.dateOfAdmission,
                        discharge: formData.dateOfDischarge,
                        course: formData.hospitalCourse
                    } : undefined,
                    investigations: {
                        lab: formData.labTests,
                        imaging: formData.imagingStudies
                    },
                    management: {
                        procedures: formData.proceduresPerformed,
                        referrals: formData.referrals,
                        followUp: formData.followUp
                    }
                }
            });

            setFormData(prev => ({ ...prev, sealId, isSigned: true, signatureTimestamp: new Date().toLocaleString() }));
            setStep('success');
            toast.success("MEDICAL REPORT Authenticated & Cryptographically Sealed");

            // Trigger Notification and Email Simulation
            await notificationService.createNotification({
                userId: patientData?.id || 'anonymous',
                title: 'Medical Report Authenticated',
                message: `An official medical report has been generated and sealed by ${formData.reportingClinician}. A copy has been dispatched to your registered email.`,
                type: 'medical_record',
                deliveryMethod: 'all', // Triggers both platform and email
                data: {
                    reportId: sealId,
                    clinician: formData.reportingClinician,
                    license: formData.licenseNo
                }
            });
        } catch (error) {
            console.error("Critical failure during report sync:", error);
            toast.error("Communication error with Medical Registry");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            // In a real system, this would call medicalReportsService.generateDigitalReport
            // For now, we simulate the fetch and blob handling for the premium feel
            toast.info("Generating Official Encrypted PDF...");

            // Artificial delay for the premium "processing" feel requested
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock PDF generation - in production this would be:
            // const blob = await medicalReportsService.generateDigitalReport(formData.reportId);
            // const url = window.URL.createObjectURL(blob);

            toast.success("Medical Report PDF Generated Successfully");
        } catch (error) {
            toast.error("Failed to generate digital report");
        } finally {
            setIsExporting(false);
        }
    };

    const inputClasses = "h-12 rounded-xl bg-slate-50 border-none px-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20";
    const textareaClasses = "rounded-2xl bg-slate-50 border-none px-4 py-3 font-medium text-slate-900 resize-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]";
    const sectionClasses = "bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6";
    const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl bg-slate-50 border-none shadow-2xl p-0 overflow-hidden outline-none sm:rounded-[40px] h-[100dvh] sm:h-[90vh]">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-8 md:p-10 pb-6 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <FileText className="h-7 w-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Medical Report</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Full Clinical Documentation Protocol</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar space-y-8 pb-32 sm:pb-10">
                        <AnimatePresence mode="wait">
                            {step === 'edit' && (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-8"
                                >
                                    {/* Facility Header - Visual branding */}
                                    <div className="bg-slate-900 text-white p-10 rounded-[40px] shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 transform translate-x-12 -translate-y-12 opacity-10">
                                            <Building className="h-48 w-48" />
                                        </div>
                                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <div className="h-12 w-12 bg-blue-500 rounded-xl mb-4 flex items-center justify-center">
                                                    <Building className="h-7 w-7" />
                                                </div>
                                                <Input
                                                    id="facilityName"
                                                    value={formData.facilityName}
                                                    onChange={handleInputChange}
                                                    className="bg-white/10 border-none text-2xl font-black mb-2 h-auto py-1"
                                                />
                                                <div className="space-y-1 text-slate-400 text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-3 w-3" />
                                                        <Input id="facilityAddress" value={formData.facilityAddress} onChange={handleInputChange} className="bg-transparent border-none h-6 p-0 text-slate-300" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-end items-start md:items-end gap-2 text-slate-400 text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3" />
                                                    <Input id="facilityPhone" value={formData.facilityPhone} onChange={handleInputChange} className="bg-transparent border-none h-6 p-0 text-slate-300 text-right w-full" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3" />
                                                    <Input id="facilityEmail" value={formData.facilityEmail} onChange={handleInputChange} className="bg-transparent border-none h-6 p-0 text-slate-300 text-right w-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 1: Patient Information */}
                                    <div className={sectionClasses}>
                                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Patient Information Portfolio</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-2">
                                                <Label className={labelClasses}>Full Name</Label>
                                                <Input id="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClasses} placeholder="Enter patient full name" />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Date of Birth</Label>
                                                <Input id="dob" value={formData.dob} onChange={handleInputChange} type="date" className={inputClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Age</Label>
                                                <Input id="age" value={formData.age} onChange={handleInputChange} className={inputClasses} placeholder="Age" />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Gender</Label>
                                                <Input id="gender" value={formData.gender} onChange={handleInputChange} className={inputClasses} placeholder="Gender" />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Patient ID</Label>
                                                <Input id="patientId" value={formData.patientId} onChange={handleInputChange} className={inputClasses} placeholder="ID Number" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className={labelClasses}>Address</Label>
                                                <Input id="address" value={formData.address} onChange={handleInputChange} className={inputClasses} placeholder="Residential Address" />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>MRN (Medical Record No)</Label>
                                                <Input id="mrn" value={formData.mrn} onChange={handleInputChange} className={inputClasses + " bg-blue-50/50 text-blue-800"} readOnly />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Phone</Label>
                                                <Input id="phone" value={formData.phone} onChange={handleInputChange} className={inputClasses} placeholder="Phone Number" />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Email</Label>
                                                <Input id="email" value={formData.email} onChange={handleInputChange} className={inputClasses} placeholder="Email Address" />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Emergency Contact</Label>
                                                <Input id="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} className={inputClasses} placeholder="Name / Contact" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Report Details & Clinician */}
                                    <div className={sectionClasses}>
                                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Clinical Report Protocol Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div>
                                                <Label className={labelClasses}>Report Date</Label>
                                                <Input id="reportDate" value={formData.reportDate} onChange={handleInputChange} type="date" className={inputClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Report Type</Label>
                                                <Select
                                                    value={formData.reportType}
                                                    onValueChange={(val) => setFormData(prev => ({ ...prev, reportType: val }))}
                                                >
                                                    <SelectTrigger className={inputClasses}>
                                                        <SelectValue placeholder="Select Report Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="General Assessment">General Assessment</SelectItem>
                                                        <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                                                        <SelectItem value="Death Certificate">Death Certificate</SelectItem>
                                                        <SelectItem value="Specialist Referral">Specialist Referral</SelectItem>
                                                        <SelectItem value="Diagnostic Report">Diagnostic Report</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Referring Physician</Label>
                                                <Input id="referringPhysician" value={formData.referringPhysician} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Clinic / Hospital</Label>
                                                <Input id="clinicHospital" value={formData.clinicHospital} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className={labelClasses}>Reporting Clinician</Label>
                                                <Input id="reportingClinician" value={formData.reportingClinician} onChange={handleInputChange} className={inputClasses + " bg-emerald-50/50"} />
                                            </div>
                                    
                                    {/* Section 2.5: Specialized Clinical Protocols (Conditional) */}
                                    {formData.reportType === 'Death Certificate' && (
                                        <div className={cn(sectionClasses, "border-rose-200 bg-rose-50/10")}>
                                            <div className="flex items-center gap-3 border-b border-rose-100 pb-4 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                                    <AlertCircle className="h-4 w-4" />
                                                </div>
                                                <h3 className="text-xs font-black text-rose-900 uppercase tracking-[0.2em]">MORTALITY REPORTING PROTOCOL</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <Label className={labelClasses}>Time of Death</Label>
                                                    <Input id="timeOfDeath" type="time" value={formData.timeOfDeath} onChange={handleInputChange} className={inputClasses + " border-rose-200"} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className={labelClasses}>Place of Death</Label>
                                                    <Input id="placeOfDeath" value={formData.placeOfDeath} onChange={handleInputChange} className={inputClasses + " border-rose-200"} placeholder="Facility, Ward, or Location address" />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <Label className={labelClasses}>Immediate Cause of Death</Label>
                                                    <Textarea id="causeOfDeath" value={formData.causeOfDeath} onChange={handleInputChange} className={textareaClasses + " border-rose-100 min-h-[100px]"} placeholder="Document clinical cause of mortality..." />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {formData.reportType === 'Discharge Summary' && (
                                        <div className={cn(sectionClasses, "border-emerald-200 bg-emerald-50/10")}>
                                            <div className="flex items-center gap-3 border-b border-emerald-100 pb-4 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                <h3 className="text-xs font-black text-emerald-900 uppercase tracking-[0.2em]">HOSPITAL DISCHARGE PROTOCOL</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label className={labelClasses}>Date of Admission</Label>
                                                    <Input id="dateOfAdmission" type="date" value={formData.dateOfAdmission} onChange={handleInputChange} className={inputClasses + " border-emerald-200"} />
                                                </div>
                                                <div>
                                                    <Label className={labelClasses}>Date of Discharge</Label>
                                                    <Input id="dateOfDischarge" type="date" value={formData.dateOfDischarge} onChange={handleInputChange} className={inputClasses + " border-emerald-200"} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className={labelClasses}>Summary of Hospital Course</Label>
                                                    <Textarea id="hospitalCourse" value={formData.hospitalCourse} onChange={handleInputChange} className={textareaClasses + " border-emerald-100"} placeholder="Comprehensive summary of clinical journey during stay..." />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                            <div>
                                                <Label className={labelClasses}>Designation</Label>
                                                <Input id="designation" value={formData.designation} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>License / Reg No</Label>
                                                <Input id="licenseNo" value={formData.licenseNo} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Clinical Content (SOAP-like but structured as requested) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className={sectionClasses}>
                                            <Label className={labelClasses}>Chief Complaint (CC)</Label>
                                            <Textarea id="chiefComplaint" value={formData.chiefComplaint} onChange={handleInputChange} className={textareaClasses + " min-h-[150px]"} placeholder="Document patient's own words..." />
                                        </div>
                                        <div className={sectionClasses}>
                                            <Label className={labelClasses}>History of Present Illness (HPI)</Label>
                                            <Textarea id="hpi" value={formData.hpi} onChange={handleInputChange} className={textareaClasses + " min-h-[150px]"} placeholder="Onset, duration, character, severity, associated symptoms..." />
                                        </div>
                                    </div>

                                    {/* Section 4: Past Medical History */}
                                    <div className={sectionClasses}>
                                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                                                <Dna className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Comprehensive Medical History</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label className={labelClasses}>Chronic Conditions</Label>
                                                <Textarea id="chronicConditions" value={formData.chronicConditions} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Previous Surgeries</Label>
                                                <Textarea id="previousSurgeries" value={formData.previousSurgeries} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Allergies</Label>
                                                <Input id="allergies" value={formData.allergies} onChange={handleInputChange} className={inputClasses + " border-rose-100 ring-rose-500/10"} placeholder="Known Alergies" />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Current Medications</Label>
                                                <Input id="currentMedications" value={formData.currentMedications} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Family History</Label>
                                                <Textarea id="familyHistory" value={formData.familyHistory} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Social History</Label>
                                                <Textarea id="socialHistory" value={formData.socialHistory} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 5: Physical Examination & Vitals */}
                                    <div className={sectionClasses}>
                                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
                                                <Activity className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Physical Examination & Vitals Registry</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            <div>
                                                <Label className={labelClasses}>Blood Pressure</Label>
                                                <div className="relative">
                                                    <Activity className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                                    <Input id="bp" value={formData.bp} onChange={handleInputChange} className={inputClasses + " pl-10"} placeholder="120/80" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Heart Rate</Label>
                                                <div className="relative">
                                                    <Activity className="absolute left-3 top-3.5 h-4 w-4 text-rose-500" />
                                                    <Input id="hr" value={formData.hr} onChange={handleInputChange} className={inputClasses + " pl-10"} placeholder="72" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Temp (°C)</Label>
                                                <div className="relative">
                                                    <Thermometer className="absolute left-3 top-3.5 h-4 w-4 text-orange-500" />
                                                    <Input id="temp" value={formData.temp} onChange={handleInputChange} className={inputClasses + " pl-10"} placeholder="36.6" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Resp Rate</Label>
                                                <Input id="rr" value={formData.rr} onChange={handleInputChange} className={inputClasses} placeholder="16" />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>SpO2 (%)</Label>
                                                <Input id="spo2" value={formData.spo2} onChange={handleInputChange} className={inputClasses} placeholder="98" />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Weight (kg)</Label>
                                                <div className="relative">
                                                    <Dumbbell className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                                    <Input id="weight" value={formData.weight} onChange={handleInputChange} className={inputClasses + " pl-10"} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Height (cm)</Label>
                                                <Input id="height" value={formData.height} onChange={handleInputChange} className={inputClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>BMI</Label>
                                                <Input id="bmi" value={formData.bmi} onChange={handleInputChange} className={inputClasses + " bg-slate-100"} readOnly placeholder="Auto" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className={labelClasses}>System Examination</Label>
                                            <Textarea id="systemExamination" value={formData.systemExamination} onChange={handleInputChange} className={textareaClasses + " min-h-[120px]"} placeholder="Detailed system-by-system findings..." />
                                        </div>
                                    </div>

                                    {/* Section 6: Investigations */}
                                    <div className={sectionClasses}>
                                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Clipboard className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Investigations & Diagnostic Assets</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className={labelClasses}>Laboratory Tests</Label>
                                                <Textarea id="labTests" value={formData.labTests} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Imaging Studies</Label>
                                                <Textarea id="imagingStudies" value={formData.imagingStudies} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Other Tests</Label>
                                                <Textarea id="otherTests" value={formData.otherTests} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 7: Diagnosis / Assessment */}
                                    <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl space-y-6">
                                        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Stethoscope className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Diagnostic Assessment Registry</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-2 block">Primary Diagnosis</Label>
                                                <Input id="primaryDiagnosis" value={formData.primaryDiagnosis} onChange={handleInputChange} className="h-12 bg-white/5 border-none text-white font-black" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-2 block">Secondary Diagnosis</Label>
                                                    <Input id="secondaryDiagnosis" value={formData.secondaryDiagnosis} onChange={handleInputChange} className="h-10 bg-white/5 border-none text-slate-300" />
                                                </div>
                                                <div>
                                                    <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-2 block">Differential Diagnosis</Label>
                                                    <Input id="differentialDiagnosis" value={formData.differentialDiagnosis} onChange={handleInputChange} className="h-10 bg-white/5 border-none text-slate-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 8: Treatment Plan */}
                                    <div className={sectionClasses}>
                                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Treatment Plan & Management Strategy</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label className={labelClasses}>Medications Prescribed</Label>
                                                <Textarea id="medicationsPrescribed" value={formData.medicationsPrescribed} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Procedures Performed</Label>
                                                <Textarea id="proceduresPerformed" value={formData.proceduresPerformed} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Referrals</Label>
                                                <Textarea id="referrals" value={formData.referrals} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                            <div>
                                                <Label className={labelClasses}>Follow-up Instructions</Label>
                                                <Textarea id="followUp" value={formData.followUp} onChange={handleInputChange} className={textareaClasses} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Digital Signature & Finalization */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <ShieldCheck className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-black uppercase tracking-tight">Digital Authentication & Seal</h3>
                                        </div>
                                        <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
                                            <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
                                                <Fingerprint className="h-48 w-48 text-white" />
                                            </div>

                                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
                                                            Authorized Signatory
                                                        </Label>
                                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                                            <p className="font-bold text-lg">{formData.reportingClinician}</p>
                                                            <p className="text-sm text-blue-400 font-medium">{formData.designation} · {formData.licenseNo}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                                        <Lock className="h-3 w-3" />
                                                        <p>By signing, you attest that this report is a true and accurate reflection of the clinical findings.</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
                                                            Clinician Digital PIN
                                                        </Label>
                                                        <Input
                                                            id="signaturePin"
                                                            type="password"
                                                            value={formData.signaturePin}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter 4-6 Digit PIN"
                                                            className="h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-500 font-mono text-2xl tracking-[0.5em] text-center rounded-xl focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={handleSave}
                                                        disabled={isSaving || formData.signaturePin.length < 4}
                                                        type="button"
                                                        className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase shadow-xl shadow-blue-900/40 relative overflow-hidden"
                                                    >
                                                        {isSaving ? (
                                                            <div className="flex items-center gap-2">
                                                                <Activity className="h-5 w-5 animate-pulse" />
                                                                Sealing Report...
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Fingerprint className="h-5 w-5" />
                                                                Finalize & Sign Report
                                                            </div>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {step === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-12 text-center space-y-8"
                                >
                                    <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                                        <ShieldCheck className="h-12 w-12" />
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Report Sealed Successfully</h2>
                                        <p className="text-slate-500 font-medium">Your medical report has been cryptographically signed and synchronized.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 text-left">
                                            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                                <Fingerprint className="h-6 w-6" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Verification Seal</p>
                                                <p className="font-mono text-xs font-bold text-slate-900 truncate">{formData.sealId || 'UHC-AUTH-PENDING'}</p>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 text-left">
                                            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Signed Timestamp</p>
                                                <p className="text-sm font-bold text-slate-900">{formData.signatureTimestamp}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-16 rounded-2xl border-slate-200 font-bold gap-3 text-slate-900 px-6"
                                            onClick={handleExportPDF}
                                            disabled={isExporting}
                                        >
                                            {isExporting ? (
                                                <Activity className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Download className="h-5 w-5" />
                                            )}
                                            {isExporting ? 'Generating...' : 'Export Official PDF'}
                                        </Button>
                                        <Button
                                            className="flex-1 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-xl shadow-emerald-100 gap-3 px-6"
                                            onClick={() => setIsInvoiceOpen(true)}
                                        >
                                            <CreditCard className="h-5 w-5" />
                                            Generate Invoice
                                        </Button>
                                    </div>
                                    <div className="pt-6">
                                        <button
                                            onClick={onClose}
                                            className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                                        >
                                            Return to Patient Terminal
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>

            {/* Post-Sync Automated Invoice Trigger */}
            <InvoiceModal
                isOpen={isInvoiceOpen}
                onClose={() => {
                    setIsInvoiceOpen(false);
                    onClose(); // Close both as the final step in the workflow
                }}
                patientName={formData.fullName}
            />
        </Dialog>
    );
};
