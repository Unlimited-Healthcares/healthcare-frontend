import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
   Stethoscope,
   Pill,
   Loader2,
   ChevronRight,
   ChevronLeft,
   Plus,
   Trash2,
   Search,
   FlaskConical,
   ClipboardList,
   CheckCircle2,
   Printer,
   Share2,
   Clock,
   History as HistoryIcon,
   Info,
   X,
   Upload,
   FileText,
   User as UserIcon,
   Fingerprint,
   Heart as HeartIcon,
   Thermometer,
   Scale,
   Wind,
   Zap,
   Activity as ActivityIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateHealthRecord, useHealthRecords } from '@/hooks/useHealthRecords';
import { useCreateEncounter, useCreatePrescription } from '@/hooks/useClinical';
import { clinicalService } from '@/services/clinicalService';
import { discoveryService } from '@/services/discoveryService';
import { healthcareCentersService } from '@/services/healthcareCentersService';
import { requestsService } from '@/services/requestsService';
import { healthRecordsApi } from '@/services/healthRecordsApi';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, getPermissions } from '@/lib/permissions';
import { complianceApi } from '@/services/complianceApi';
import { ShieldAlert } from 'lucide-react';

interface Patient {
   id: string;
   name: string;
   email?: string;
   profile?: any;
   userId?: string;
   displayId?: string;
}

interface ClinicalEncounterProps {
   patient?: Patient;
   onComplete?: (recordId: string) => void;
   onCancel?: () => void;
   initialStep?: number;
}

const COMMON_DIAGNOSES = [
   'Hypertension (Essential)',
   'Type 2 Diabetes Mellitus',
   'Acute Upper Respiratory Infection',
   'Malaria (Uncomplicated)',
   'Typhoid Fever',
   'Peptic Ulcer Disease',
   'Gastroenteritis',
   'Lower Back Pain (Musculoskeletal)',
   'Urinary Tract Infection',
   'Anaemia (Iron Deficiency)'
];

const CLINICAL_TEMPLATES: Record<string, { subjective: string, objective: string }> = {
   'Malaria (Uncomplicated)': {
      subjective: 'Patient reports fever, chills, rigors, headache, and joint pains...',
      objective: 'Temp > 37.5, splenomegaly, jaundice, and tachycardia assessment...'
   },
   'Hypertension (Essential)': {
      subjective: 'Dizziness, headache, visual disturbances, palpitations...',
      objective: 'BP record (systolic/diastolic), heart rate, pedal edema...'
   },
   'Type 2 Diabetes Mellitus': {
      subjective: 'Polyuria, polydipsia, polyphagia, weight loss, numbness...',
      objective: 'Random/Fasting blood sugar, skin assessment, visual check, BMI...'
   }
};

const COMMON_DRUGS = [
   'Amoxicillin 250mg',
   'Paracetamol 1g',
   'Metformin 850mg',
   'Amlodipine 5mg',
   'Omeprazole 20mg',
   'Artemether/Lumefantrine (20/120)',
   'Ciprofloxacin 500mg',
   'Lisinopril 5mg',
   'Metronidazole 200mg',
   'Ibuprofen 200mg'
];

const COMMON_LABS = [
   'Full Blood Count (FBC)',
   'Malaria Parasite (MP)',
   'Widal Test (Typhoid)',
   'Urinalysis',
   'Fasting Blood Sugar (FBS)',
   'Random Blood Sugar (RBS)',
   'Lipid Profile',
   'Liver Function Test (LFT)',
   'Kidney Function Test (KFT/UE)',
   'Stool Analysis',
   'Chest X-Ray',
   'Abdominal Ultrasound'
];

export function ClinicalEncounterDashboard({ patient: initialPatient, onComplete, onCancel, initialStep = 1 }: ClinicalEncounterProps) {
   const { user } = useAuth();
   const [step, setStep] = useState(initialPatient ? initialStep + 1 : 1);
   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient || null);
   const [patientSearch, setPatientSearch] = useState('');
   const [patientsList, setPatientsList] = useState<Patient[]>([]);
   const [isLoadingPatients, setIsLoadingPatients] = useState(false);

   const [formData, setFormData] = useState({
      subjective: '',
      objective: '',
      assessment: '',
      diagnosis: '',
      plan: '',
      vitals: {
         bp: '',
         hr: '',
         temp: '',
         weight: '',
         resp: '',
         spo2: ''
      },
      prescriptions: [] as any[],
      labsRequested: [] as string[]
   });

   const [isEmergencyOverride, setIsEmergencyOverride] = useState(false);

   const handleBreakGlass = async () => {
      if (window.confirm("WARNING: You are initiating an EMERGENCY OVERRIDE (Break Glass). This action will grant you temporary full access to this patient's records. THIS ACTION IS LOGGED AND AUDITED FOR COMPLIANCE. Continue?")) {
         setIsEmergencyOverride(true);
         await complianceApi.logAction('EMERGENCY_OVERRIDE_ACTIVATED', 'CLINICAL_WORKSPACE', {
            patientId: selectedPatient?.id,
            reason: 'Code Blue / Emergency Access'
         });
         toast.success("Emergency Override Activated.");
      }
   };

   useEffect(() => {
      if (!selectedPatient) {
         fetchPatients();
      }
   }, []);

   const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
         const response = await discoveryService.getReceivedRequests({ status: 'approved', page: 1, limit: 50 });
         const patientData: Patient[] = (response.requests || []).map((req: any) => ({
            id: req.senderId,
            userId: req.senderId,
            name: req.sender?.profile?.displayName || req.sender?.displayName || 'Unknown Patient',
            email: req.sender?.email,
            profile: req.sender?.profile
         }));
         setPatientsList(patientData);
      } catch (err) {
         console.error('Failed to load patients for encounter:', err);
      } finally {
         setIsLoadingPatients(false);
      }
   };

   const [drugSearch, setDrugSearch] = useState('');
   const [isDispatching, setIsDispatching] = useState<string | null>(null);
   const [diagSearch, setDiagSearch] = useState('');
   const [diagSuggestions, setDiagSuggestions] = useState<string[]>([]);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [patientHistory, setPatientHistory] = useState<any[]>([]);
   const [isLoadingHistory, setIsLoadingHistory] = useState(false);
   const createRecord = useCreateHealthRecord();
   const { mutateAsync: createEncounter } = useCreateEncounter();
   const { mutateAsync: createPrescription } = useCreatePrescription();
   const { profile } = useAuth();

   useEffect(() => {
      if (selectedPatient) {
         fetchPatientHistory();
      }
   }, [selectedPatient]);

   useEffect(() => {
      const timer = setTimeout(() => {
         if (diagSearch.length > 2) {
            // Passing undefined as type to search everything (including diagnoses)
            discoveryService.getSearchSuggestions(diagSearch, undefined as any)
               .then(setDiagSuggestions);
         } else {
            setDiagSuggestions([]);
         }
      }, 300);
      return () => clearTimeout(timer);
   }, [diagSearch]);

   const fetchPatientHistory = async () => {
      if (!selectedPatient) return;
      setIsLoadingHistory(true);
      try {
         const patientId = (selectedPatient as any).id || (selectedPatient as any).userId;
         const records = await healthRecordsApi.getMedicalRecords({
            filters: { patientId }
         });
         setPatientHistory(records.data || []);
      } catch (err) {
         console.error('Failed to load patient history:', err);
      } finally {
         setIsLoadingHistory(false);
      }
   };

   const handleVitalChange = (key: string, value: string) => {
      setFormData(prev => ({
         ...prev,
         vitals: { ...prev.vitals, [key]: value }
      }));
   };

   const addPrescription = (drug: string) => {
      const isLiquid = drug.toLowerCase().includes('syrup') || drug.toLowerCase().includes('suspension');
      const newPrescription = {
         drug,
         dosage: isLiquid ? '5ml' : '1 unit',
         frequency: 'twice daily (BID)',
         duration: '5 days',
         instructions: 'Take after meals'
      };
      setFormData(prev => ({
         ...prev,
         prescriptions: [...prev.prescriptions, newPrescription]
      }));
      toast.success(`Added ${drug} to prescription`);
   };

   const removePrescription = (index: number) => {
      setFormData(prev => ({
         ...prev,
         prescriptions: prev.prescriptions.filter((_, i) => i !== index)
      }));
   };

   const updatePrescription = (index: number, field: string, value: string) => {
      setFormData(prev => {
         const updated = [...prev.prescriptions];
         updated[index] = { ...updated[index], [field]: value };
         return { ...prev, prescriptions: updated };
      });
   };

   const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
         const patientId = (selectedPatient as any).id || (selectedPatient as any).userId;

         const isUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
         const centerId = [profile?.center_id, (profile as any)?.centerId].find(id => id && isUUID(id));

         if (!centerId) {
            console.warn('Clinical Workspace: Navigating session without active center mapping.');
         }

         // 1. Create Encounter
         const encounterResponse = await createEncounter({
            patientId,
            centerId,
            type: 'consultation',
            vitals: formData.vitals,
            metadata: {
               subjective: formData.subjective,
               objective: formData.objective,
               assessment: formData.assessment,
               labsRequested: formData.labsRequested
            }
         });

         const encounterId = (encounterResponse as any)?.id;

         // 2. Create Prescriptions if any
         if (formData.prescriptions.length > 0) {
            await createPrescription({
               patientId,
               encounterId,
               medications: formData.prescriptions.map(p => ({
                  name: p.drug,
                  dosage: p.dosage,
                  frequency: p.frequency,
                  duration: p.duration,
                  instructions: p.instructions
               })),
               notes: `Clinical Prescription for ${formData.diagnosis || 'General Treatment'}`
            });
         }

         // 3. Sync to Medical Records for global visibility
         const medicalRecordPayload = {
            patientId,
            title: `Clinical Encounter: ${formData.diagnosis || 'General Assessment'}`,
            recordType: 'consultation',
            category: 'Consultation',
            description: formData.subjective,
            diagnosis: formData.diagnosis,
            treatment: formData.plan,
            notes: `SOAP Note:\nS: ${formData.subjective}\nO: ${formData.objective}\nA: ${formData.assessment}\nP: ${formData.plan}`,
            recordData: {
               encounterId,
               vitals: formData.vitals,
               medications: formData.prescriptions,
               labs: formData.labsRequested,
               clinical_findings: formData.assessment
            },
            isSensitive: false,
            isShareable: true
         };

         const recordResponse = await createRecord.mutateAsync(medicalRecordPayload as any);
         const recordId = (recordResponse as any)?.data?.id || (recordResponse as any)?.id;

         toast.success('Clinical Workspace Synchronized Successfully');
         if (onComplete) onComplete(recordId || encounterId);
      } catch (error) {
         console.error('Failed to sync clinical workspace:', error);
         toast.error('Synchronization partial failure. Check clinical logs.');
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleDispatch = async (action: string) => {
      setIsDispatching(action);
      try {
         const patientId = (selectedPatient as any).id || (selectedPatient as any).userId;
         const isUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
         const centerId = [profile?.center_id, (profile as any)?.centerId].find(id => id && isUUID(id));

         if (action === 'lab') {
            if (formData.labsRequested.length === 0) {
               toast.error('No labs selected for dispatch');
               return;
            }

            await requestsService.createRequest({
               requestType: 'lab_order',
               message: `Diagnostic lab order for ${selectedPatient?.name || 'Patient'}. Tests: ${formData.labsRequested.join(', ')}`,
               metadata: {
                  centerId,
                  patientId,
                  tests: formData.labsRequested,
                  diagnosis: formData.diagnosis,
                  clinicalPriority: 'routine'
               }
            });

            toast.success('Diagnostic Order Dispatched', {
               description: `Sent ${formData.labsRequested.length} lab orders to the diagnostic network.`
            });
         } else if (action === 'pharmacy') {
            if (formData.prescriptions.length === 0) {
               toast.error('No medications available for transmission');
               return;
            }

            await requestsService.createRequest({
               requestType: 'pharmacy_transfer',
               message: `Prescription fulfillment for ${selectedPatient?.name || 'Patient'}.`,
               metadata: {
                  centerId,
                  patientId,
                  prescriptions: formData.prescriptions,
                  diagnosis: formData.diagnosis
               }
            });

            toast.success('Prescription Transmitted', {
               description: `${formData.prescriptions.length} medications sent to pharmacy network for fulfillment.`
            });
         } else if (action === 'print') {
            window.print();
         }
      } catch (error) {
         console.error(`Failed to dispatch ${action}:`, error);
         toast.error(`Dispatch failed: ${action} could not be synchronized.`);
      } finally {
         setIsDispatching(null);
      }
   };

   const renderStepIndicator = () => (
      <div className="mb-4 md:mb-8 w-full overflow-x-auto no-scrollbar py-2">
         <div className="flex items-center justify-between min-w-full md:min-w-0 md:max-w-4xl mx-auto relative px-2 md:px-6">
            {/* Connection Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-100 -z-10" />
            <motion.div
               className="absolute top-6 left-0 h-0.5 bg-primary -z-10 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
               initial={{ width: 0 }}
               animate={{ width: `${(step - 1) * 25}%` }}
               transition={{ duration: 0.8, ease: "circOut" }}
            />

            {[
               { n: 1, label: 'Patient', icon: UserIcon },
               { n: 2, label: 'Assessment', icon: Stethoscope },
               { n: 3, label: 'Diagnosis', icon: ActivityIcon },
               { n: 4, label: 'Prescription', icon: Pill },
               { n: 5, label: 'Dispatch', icon: CheckCircle2 }
            ].map((s, i) => (
               <div
                  key={s.n}
                  className="flex flex-col items-center relative"
                  onClick={() => {
                     // Only allow clicking steps we've reached or the current step
                     if (step > s.n || (s.n === 1 && step === 1) || (selectedPatient && s.n <= step)) {
                        setStep(s.n);
                     }
                  }}
               >
                  <motion.div
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                     className={`w-12 h-12 md:w-14 md:h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 border-2 cursor-pointer ${step === s.n
                        ? 'bg-primary text-white shadow-premium scale-110 border-primary'
                        : step > s.n
                           ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                           : 'bg-white text-slate-300 border-slate-100'
                        }`}
                  >
                     <s.icon className="h-6 w-6" />
                     {step > s.n && (
                        <motion.div
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"
                        >
                           <CheckCircle2 className="w-3 h-3 text-white" />
                        </motion.div>
                     )}
                  </motion.div>
                  <span className={`text-[10px] md:text-[9px] mt-2 font-black uppercase tracking-wider transition-colors text-center ${step === s.n ? 'text-primary' : 'text-slate-400'
                     }`}>
                     {s.label}
                  </span>
               </div>
            ))}
         </div>
      </div>
   );

   return (
      <Card className="border-none shadow-none bg-transparent flex flex-col h-[90dvh] md:h-full overflow-hidden">
         <CardHeader className="p-4 md:p-10 pb-2 md:pb-4 flex-shrink-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="space-y-1">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20">
                        <Stethoscope className="h-5 w-5" />
                     </div>
                     <Badge variant="outline" className="bg-slate-900 text-white border-none font-black text-[9px] tracking-[0.2em]">
                        SECURE CLINICAL WORKSPACE
                     </Badge>
                  </div>
                  <CardTitle className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                     Clinical Encounter Portal
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-sm md:text-lg italic">
                     {selectedPatient ? (
                        <>Active session: <span className="text-primary font-black not-italic">{selectedPatient.name}</span></>
                     ) : (
                        "Initiate clinical report synchronization"
                     )}
                  </CardDescription>
               </div>
               <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:contents w-full">
                  <div className="text-center md:text-right block md:hidden w-full order-first">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session Protocol</p>
                     <p className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full inline-block">ACTIVE-{new Date().getFullYear()}</p>
                  </div>
                  {/* Close button removed on mobile as it conflicts with Dialog's native X */}
                  <button
                     onClick={onCancel}
                     className="hidden md:flex w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-100 text-slate-400 items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                     <X className="h-5 w-5 md:h-6 md:w-6" />
                  </button>
               </div>
            </div>
         </CardHeader>

         <CardContent className="flex-1 overflow-hidden p-0 relative">
            <ScrollArea className="h-full w-full">
               <div className="relative pb-32 px-4 md:px-10">
                  {renderStepIndicator()}

                  <AnimatePresence mode="wait">
                     {/* STEP 1: PATIENT IDENTIFICATION */}
                     {step === 1 && (
                        <motion.div
                           key="step1"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           transition={{ duration: 0.4 }}
                           className="space-y-6 md:space-y-8"
                        >
                           <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
                              <div className="text-center p-6 md:p-10 bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-soft relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                 <div className="bg-primary/10 w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-inner border border-primary/20">
                                    <Search className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                                 </div>
                                 <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Synchronize Patient</h3>
                                 <p className="text-slate-500 font-medium mt-1 md:mt-2 max-w-md mx-auto italic text-sm md:text-base">High-fidelity search for clinical mapping.</p>
                              </div>

                              <div className="relative group">
                                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary transition-all group-focus-within:scale-110" />
                                 <Input
                                    placeholder="Entity scan... (Name, UID, or Clinical Reference)"
                                    className="pl-16 h-20 rounded-[30px] border-slate-200 bg-white shadow-soft font-black text-xl placeholder:text-slate-300 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
                                 />
                              </div>

                              <ScrollArea className="h-[300px] md:h-[400px] rounded-[32px] md:rounded-[40px] border border-slate-100 bg-white/50 backdrop-blur-xl p-2 md:p-4 shadow-inner">
                                 {isLoadingPatients ? (
                                    <div className="h-full flex flex-col items-center justify-center p-8 md:p-12 space-y-4">
                                       <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-4 border-primary/20 border-t-primary"></div>
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning network...</p>
                                    </div>
                                 ) : (
                                    <div className="space-y-2 md:space-y-3 pb-4">
                                       {patientsList.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).map(p => (
                                          <motion.button
                                             key={p.id}
                                             whileHover={{ scale: 1.01, x: 5 }}
                                             whileTap={{ scale: 0.99 }}
                                             onClick={() => {
                                                setSelectedPatient(p);
                                                setStep(2);
                                             }}
                                             className={`w-full flex items-center justify-between p-4 md:p-6 rounded-[20px] md:rounded-[24px] border transition-all ${selectedPatient?.id === p.id
                                                ? 'bg-primary/5 border-primary shadow-premium'
                                                : 'bg-white border-slate-100 hover:border-primary/30 hover:shadow-soft'
                                                }`}
                                          >
                                             <div className="flex items-center gap-3 md:gap-5 min-w-0">
                                                <div className={`h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-sm md:text-lg transition-all flex-shrink-0 ${selectedPatient?.id === p.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                                                   }`}>
                                                   {p.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="text-left min-w-0">
                                                   <p className="font-black text-slate-900 text-sm md:text-lg leading-none mb-1 md:mb-1.5 truncate">{p.name}</p>
                                                   <div className="flex flex-wrap items-center gap-1.5">
                                                      <Badge variant="outline" className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 border-slate-200 px-1 py-0">
                                                         VERIFIED
                                                      </Badge>
                                                      <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{p.email?.split('@')[0] || 'REF-PHI'}</span>
                                                   </div>
                                                </div>
                                             </div>
                                             <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 transition-all group-hover:text-primary flex-shrink-0">
                                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                                             </div>
                                          </motion.button>
                                       ))}
                                       {patientsList.length === 0 && !isLoadingPatients && (
                                          <div className="p-20 text-center space-y-4">
                                             <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                                <Info className="h-8 w-8 text-slate-300" />
                                             </div>
                                             <p className="text-slate-400 font-bold italic">No entities detected in secure network.</p>
                                          </div>
                                       )}
                                    </div>
                                 )}
                              </ScrollArea>
                           </div>
                        </motion.div>
                     )}

                     {/* STEP 2: ASSESSMENT & VITALS */}
                     {step === 2 && (
                        <motion.div
                           key="step2"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="space-y-8"
                        >
                           <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
                              {/* Clinical History Context Sidebar */}
                              <div className="lg:col-span-4 space-y-6">
                                 <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-slate-900 text-white shadow-2xl relative overflow-hidden group min-h-[400px]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/30 transition-all duration-1000" />
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                                       <HistoryIcon className="h-5 w-5" /> Clinical Intelligence
                                    </h4>

                                    <div className="space-y-4 relative z-10">
                                       {isLoadingHistory ? (
                                          <div className="space-y-3 animate-pulse">
                                             <div className="h-16 bg-white/5 rounded-2xl" />
                                             <div className="h-16 bg-white/5 rounded-2xl" />
                                          </div>
                                       ) : patientHistory.length > 0 ? (
                                          patientHistory
                                             .filter(rec => {
                                               const permissions = getPermissions(user?.roles);
                                               if (rec.recordType === 'psychiatric' && !permissions.canViewPsychNotes && !isEmergencyOverride) {
                                                 return false;
                                               }
                                               return true;
                                             })
                                             .slice(0, 5).map((rec, i) => (
                                              <div 
                                                key={i} 
                                                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-default group/item" 
                                                onMouseEnter={() => { 
                                                   complianceApi.logAction('HISTORY_ITEM_SCANNED', 'CLINICAL_HISTORY', { 
                                                      recordId: rec.id, 
                                                      patientId: selectedPatient?.id, 
                                                      emergencyAccess: isEmergencyOverride 
                                                   }); 
                                                }} 
                                              >
                                             
                                                <p className="text-sm font-black text-white truncate group-hover/item:text-primary transition-colors">{rec.title || rec.diagnosis}</p>
                                                <div className="flex items-center justify-between mt-1.5">
                                                   <p className="text-[10px] text-slate-500 font-bold">
                                                      {new Date(rec.createdAt).toLocaleDateString()}
                                                   </p>
                                                   <Badge className="bg-primary/20 text-primary text-[8px] font-black border-none uppercase px-2">{rec.recordType || 'Record'}</Badge>
                                                </div>
                                             </div>
                                          ))
                                       ) : (
                                          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px]">
                                             <ActivityIcon className="h-12 w-12 text-white/10 mx-auto mb-4" />
                                             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-6 leading-relaxed">No Analytical History Synchronized</p>
                                          </div>
                                       )}

                                       {(hasPermission(user?.roles, 'canViewClinicalNotes') || isEmergencyOverride) && (
                                          <Button variant="ghost" className="w-full rounded-2xl border border-white/10 text-white/30 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest mt-6 py-6 transition-all group-hover:border-primary/30">
                                             Browse Full Medical History
                                          </Button>
                                       )}

                                        {user?.roles?.includes('doctor') && !isEmergencyOverride && (
                                           <Button 
                                             variant="destructive" 
                                             onClick={handleBreakGlass} 
                                             className="w-full rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest mt-3 py-6 transition-all animate-pulse" 
                                           >
                                              <ShieldAlert className="h-4 w-4 mr-2" />
                                              Break Glass: Emergency Access
                                           </Button>
                                        )}
                                        {isEmergencyOverride && (
                                           <div className="w-full rounded-2xl bg-red-600 text-white text-center text-[10px] font-black uppercase tracking-widest mt-3 py-4 flex items-center justify-center gap-2" >
                                              <ShieldAlert className="h-4 w-4" />
                                              Emergency Access Active
                                           </div>
                                        )}
                                    </div>
                                 </div>

                                 <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 shadow-inner">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 italic">Clinical Directive</p>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                                       Historical vitals and diagnosis trends provided for differential diagnostic support. Verify all Subjective findings against the Global Patient Index.
                                    </p>
                                 </div>
                              </div>

                              <div className="lg:col-span-8 space-y-8">
                                 {/* Clinical Alert Banner (Live Data Driven) */}
                                 {(patientHistory.some(r => r.recordType === 'allergy') || patientHistory.some(r => r.tags?.includes('chronic'))) && (
                                    <motion.div
                                       initial={{ opacity: 0, y: -10 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       className="p-6 rounded-[32px] bg-red-50 border border-red-100 flex items-start gap-4 mb-8"
                                    >
                                       <div className="bg-red-500 text-white p-3 rounded-2xl shadow-premium">
                                          <Badge className="bg-transparent border-none p-0"><Fingerprint className="h-6 w-6" /></Badge>
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Critical Clinical Alerts</p>
                                          <div className="flex flex-wrap gap-2">
                                             {patientHistory.filter(r => r.recordType === 'allergy').map((a, i) => (
                                                <Badge key={i} className="bg-red-100 text-red-700 border-red-200 font-black px-3 py-1 rounded-full uppercase text-[9px]">{a.title || 'Allergy Detected'}</Badge>
                                             ))}
                                             {patientHistory.filter(r => r.tags?.includes('chronic')).map((c, i) => (
                                                <Badge key={i} className="bg-amber-100 text-amber-700 border-amber-200 font-black px-3 py-1 rounded-full uppercase text-[9px]">Chronic: {c.title || c.diagnosis}</Badge>
                                             ))}
                                          </div>
                                       </div>
                                    </motion.div>
                                 )}

                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                       { id: 'bp', label: 'BP (mmHg)', placeholder: '---', icon: ActivityIcon },
                                       { id: 'hr', label: 'HR (bpm)', placeholder: '---', icon: HeartIcon },
                                       { id: 'temp', label: 'Temp (°C)', placeholder: '---', icon: Thermometer },
                                       { id: 'weight', label: 'Weight (kg)', placeholder: '---', icon: Scale },
                                       { id: 'resp', label: 'Resp', placeholder: '---', icon: Wind },
                                       { id: 'spo2', label: 'SpO2 (%)', placeholder: '---', icon: Zap }
                                    ].map((v) => {
                                       const lastValue = patientHistory.find(r => r.recordType === 'vital_signs' || r.recordData?.[v.id])?.recordData?.[v.id];

                                       return (
                                          <div key={v.id} className="bg-white/80 backdrop-blur-xl border border-slate-100 p-4 rounded-3xl shadow-soft group/vital transition-all hover:border-primary/30">
                                             <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                   <v.icon className="h-3.5 w-3.5 text-primary/60" />
                                                   <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{v.label}</Label>
                                                </div>
                                                {lastValue && (
                                                   <Badge variant="outline" className="text-[8px] font-black text-primary p-0 h-auto uppercase border-none">Last: {lastValue}</Badge>
                                                )}
                                             </div>
                                             <Input
                                                className="border-none bg-slate-50/50 h-10 rounded-xl p-3 text-sm font-black focus-visible:ring-primary/20 cursor-pointer"
                                                placeholder={lastValue || v.placeholder}
                                                value={(formData.vitals as any)[v.id]}
                                                onClick={() => {
                                                   if (lastValue && !(formData.vitals as any)[v.id]) {
                                                      handleVitalChange(v.id, lastValue);
                                                   }
                                                }}
                                                onChange={(e) => handleVitalChange(v.id, e.target.value)}
                                             />
                                          </div>
                                       );
                                    })}
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                       <Label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 px-1">
                                          <HistoryIcon className="h-4 w-4 text-primary" /> Subjective Findings (Chief Complaint)
                                       </Label>
                                       <Textarea
                                          className="min-h-[120px] rounded-[32px] border-slate-200 bg-white shadow-soft focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all p-6 text-base font-medium leading-relaxed"
                                          placeholder={CLINICAL_TEMPLATES[formData.diagnosis]?.subjective || "Document clinical presentation, symptoms, and patient concerns..."}
                                          value={formData.subjective}
                                          onChange={(e) => setFormData(prev => ({ ...prev, subjective: e.target.value }))}
                                       />
                                    </div>
                                    <div className="space-y-3">
                                       <Label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 px-1">
                                          <Search className="h-4 w-4 text-primary" /> Objective Protocol
                                       </Label>
                                       <Textarea
                                          className="min-h-[120px] rounded-[32px] border-slate-200 bg-white shadow-soft focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all p-6 text-base font-medium leading-relaxed"
                                          placeholder={CLINICAL_TEMPLATES[formData.diagnosis]?.objective || "Document physical examination findings and clinical observations..."}
                                          value={formData.objective}
                                          onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                                       />
                                    </div>
                                 </div>

                                 <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-[40px] space-y-4">
                                    <h4 className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]">
                                       <FlaskConical className="h-4 w-4" /> Lab Investigations
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                       {COMMON_LABS.map(lab => (
                                          <Badge
                                             key={lab}
                                             onClick={() => {
                                                setFormData(prev => {
                                                   const exists = prev.labsRequested.includes(lab);
                                                   return {
                                                      ...prev,
                                                      labsRequested: exists
                                                         ? prev.labsRequested.filter(l => l !== lab)
                                                         : [...prev.labsRequested, lab]
                                                   };
                                                });
                                             }}
                                             className={`cursor-pointer transition-all px-3 py-1 text-[10px] font-bold border-none ${formData.labsRequested.includes(lab)
                                                ? 'bg-emerald-600 text-white shadow-md scale-105'
                                                : 'bg-white text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                          >
                                             {lab}
                                          </Badge>
                                       ))}
                                    </div>
                                    {formData.labsRequested.length > 0 && (
                                       <div className="pt-2">
                                          <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest leading-none">Selected: {formData.labsRequested.length} Investigations</p>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {/* STEP 3: DIAGNOSTIC CHARTING */}
                     {step === 3 && (
                        <motion.div
                           key="step3"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="space-y-8"
                        >
                           <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
                              <div className="lg:col-start-1 lg:col-end-12 flex flex-col gap-6">
                                 <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-[40px] space-y-4">
                                    <h4 className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]">
                                       <FlaskConical className="h-4 w-4" /> Lab Investigations (Diagnostic Map)
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                       {COMMON_LABS.map(lab => (
                                          <Badge
                                             key={lab}
                                             onClick={() => {
                                                setFormData(prev => {
                                                   const exists = prev.labsRequested.includes(lab);
                                                   return {
                                                      ...prev,
                                                      labsRequested: exists
                                                         ? prev.labsRequested.filter(l => l !== lab)
                                                         : [...prev.labsRequested, lab]
                                                   };
                                                });
                                             }}
                                             className={`cursor-pointer transition-all px-3 py-1 text-[10px] font-bold border-none ${formData.labsRequested.includes(lab)
                                                ? 'bg-emerald-600 text-white shadow-md scale-105'
                                                : 'bg-white text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                          >
                                             {lab}
                                          </Badge>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="relative group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-primary transition-all" />
                                    <Input
                                       placeholder="Search Clinical Diagnoses (ICD-10 High Fidelity)..."
                                       className="pl-16 h-16 rounded-[24px] border-slate-200 bg-white shadow-soft font-bold text-lg"
                                       value={diagSearch}
                                       onChange={(e) => setDiagSearch(e.target.value)}
                                    />
                                 </div>
                                 <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-auto pr-4 custom-scrollbar">
                                    {(diagSuggestions.length > 0 ? diagSuggestions : COMMON_DIAGNOSES).filter(d => d.toLowerCase().includes(diagSearch.toLowerCase())).map(diag => (
                                       <motion.button
                                          key={diag}
                                          whileHover={{ x: 5 }}
                                          onClick={() => {
                                             setFormData(prev => ({ ...prev, diagnosis: diag }));
                                             setStep(4);
                                          }}
                                          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${formData.diagnosis === diag
                                             ? 'bg-primary/5 border-primary shadow-md'
                                             : 'bg-white border-slate-100 hover:border-primary/20 hover:bg-slate-50/50'
                                             }`}
                                       >
                                          {formData.diagnosis === diag && (
                                             <div className="absolute top-0 right-0 w-12 h-12 bg-primary text-white rounded-bl-3xl flex items-center justify-center">
                                                <CheckCircle2 className="h-5 w-5" />
                                             </div>
                                          )}
                                          <span className={`font-black text-lg ${formData.diagnosis === diag ? 'text-primary' : 'text-slate-900 group-hover:text-primary transition-colors'}`}>
                                             {diag}
                                          </span>
                                       </motion.button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {/* STEP 4: PRESCRIPTION GENERATOR */}
                     {step === 4 && (
                        <motion.div
                           key="step4"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="space-y-8"
                        >
                           <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
                              <div className="lg:col-span-6 space-y-6">
                                 <div className="relative group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-purple-600 transition-all" />
                                    <Input
                                       placeholder="Access Drug Library (Generic & Brand)..."
                                       className="pl-16 h-16 rounded-[24px] border-slate-200 bg-white shadow-soft font-bold text-lg"
                                       value={drugSearch}
                                       onChange={(e) => setDrugSearch(e.target.value)}
                                    />
                                 </div>
                                 <ScrollArea className="h-[450px] rounded-[40px] border border-slate-100 bg-white/50 backdrop-blur-xl p-4 shadow-inner">
                                    <div className="space-y-3">
                                       {COMMON_DRUGS.filter(d => d.toLowerCase().includes(drugSearch.toLowerCase())).map(drug => (
                                          <motion.button
                                             key={drug}
                                             whileHover={{ scale: 1.01, x: 5 }}
                                             onClick={() => addPrescription(drug)}
                                             className="flex items-center justify-between p-6 rounded-2xl border border-white bg-white hover:border-purple-300 hover:shadow-soft transition-all group w-full"
                                          >
                                             <div className="flex items-center gap-4">
                                                <div className="bg-purple-50 p-3 rounded-xl text-purple-600 group-hover:scale-110 transition-transform shadow-inner border border-purple-100">
                                                   <Pill className="h-5 w-5" />
                                                </div>
                                                <span className="font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors uppercase tracking-tight">{drug}</span>
                                             </div>
                                             <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                <Plus className="h-5 w-5" />
                                             </div>
                                          </motion.button>
                                       ))}
                                    </div>
                                 </ScrollArea>
                              </div>
                              <div className="lg:col-span-6 flex flex-col">
                                 <div className="flex items-center justify-between mb-6 px-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                       <Pill className="h-5 w-5 text-purple-600" /> RX Workspace Manifest
                                    </h4>
                                    <Badge className="bg-slate-900 text-white border-none font-black px-4 py-1.5 rounded-full shadow-soft">{formData.prescriptions.length} ITEMS</Badge>
                                 </div>

                                 <ScrollArea className="h-[430px] pr-4 custom-scrollbar">
                                    {formData.prescriptions.length === 0 ? (
                                       <div className="h-[400px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                                          <Pill className="h-16 w-16 text-slate-200 mb-6" />
                                          <h5 className="text-xl font-black text-slate-400">Empty Prescription Protocol</h5>
                                          <p className="text-slate-400 font-medium max-w-xs mt-2 italic">Initiate search and map medications to the patient profile.</p>
                                       </div>
                                    ) : (
                                       <div className="space-y-6 pb-6">
                                          {formData.prescriptions.map((rx, i) => (
                                             <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white border border-slate-100 rounded-[24px] md:rounded-[32px] p-4 md:p-8 shadow-premium relative group overflow-hidden"
                                             >
                                                <div className={`absolute top-0 right-0 w-2 h-full ${['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'][i % 4]}`} />
                                                <button
                                                   onClick={() => removePrescription(i)}
                                                   className="absolute top-6 right-8 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                   <Trash2 className="h-6 w-6" />
                                                </button>

                                                <div className="font-black text-lg md:text-2xl text-slate-900 mb-4 md:mb-6 flex items-center justify-between gap-3">
                                                   <div className="flex items-center gap-3">
                                                      <span className="text-slate-300 font-black text-sm">#{i + 1}</span>
                                                      <div className={`w-2 h-2 rounded-full ${['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'][i % 4]}`} />
                                                      {rx.drug}
                                                   </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6">
                                                   <div className="space-y-2">
                                                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Dosage Protocol</Label>
                                                      <Input
                                                         className="h-10 md:h-12 text-sm rounded-xl bg-slate-50 border-none font-bold focus:ring-purple-500/20"
                                                         value={rx.dosage}
                                                         onChange={(e) => updatePrescription(i, 'dosage', e.target.value)}
                                                      />
                                                   </div>
                                                   <div className="space-y-2">
                                                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Frequency Cycle</Label>
                                                      <Select value={rx.frequency} onValueChange={(val) => updatePrescription(i, 'frequency', val)}>
                                                         <SelectTrigger className="h-12 text-sm rounded-xl bg-slate-50 border-none font-bold focus:ring-purple-500/20">
                                                            <SelectValue />
                                                         </SelectTrigger>
                                                         <SelectContent className="rounded-2xl border-slate-100 shadow-premium">
                                                            <SelectItem value="Once daily (OD)">Once daily (QD)</SelectItem>
                                                            <SelectItem value="twice daily (BID)">Twice daily (BID)</SelectItem>
                                                            <SelectItem value="thrice daily (TID)">Thrice daily (TID)</SelectItem>
                                                            <SelectItem value="four times daily (QID)">Four times daily (QID)</SelectItem>
                                                         </SelectContent>
                                                      </Select>
                                                   </div>
                                                   <div className="space-y-2">
                                                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Active Duration</Label>
                                                      <Input
                                                         className="h-12 text-sm rounded-xl bg-slate-50 border-none font-bold focus:ring-purple-500/20"
                                                         value={rx.duration}
                                                         onChange={(e) => updatePrescription(i, 'duration', e.target.value)}
                                                      />
                                                   </div>
                                                   <div className="space-y-2">
                                                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Special Directives</Label>
                                                      <Input
                                                         className="h-12 text-sm rounded-xl bg-slate-50 border-none font-bold focus:ring-purple-500/20"
                                                         value={rx.instructions}
                                                         onChange={(e) => updatePrescription(i, 'instructions', e.target.value)}
                                                      />
                                                   </div>
                                                </div>
                                             </motion.div>
                                          ))}
                                       </div>
                                    )}
                                 </ScrollArea>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {/* STEP 5: FINAL DISPATCH */}
                     {step === 5 && (
                        <motion.div
                           key="step5"
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 1.05 }}
                           className="space-y-8"
                        >
                           <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                              <div className="space-y-8">
                                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <ClipboardList className="h-5 w-5 text-primary" /> Synchronized Summary
                                 </h3>
                                 <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-premium space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500" />
                                    <div className="flex items-start gap-5">
                                       <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-inner">
                                          <UserIcon className="h-6 w-6" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Identity</p>
                                          <p className="text-xl font-black text-slate-900">{selectedPatient?.name || 'Protocol Unknown'}</p>
                                       </div>
                                    </div>
                                    {hasPermission(user?.roles, 'canViewDiagnoses') && (
                                       <div className="flex items-start gap-5">
                                          <div className="bg-primary/10 p-3 rounded-2xl text-primary shadow-inner">
                                             <ActivityIcon className="h-6 w-6" />
                                          </div>
                                          <div>
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Diagnosis</p>
                                             <p className="text-xl font-black text-slate-900">{formData.diagnosis || "No primary diagnosis mapped"}</p>
                                          </div>
                                       </div>
                                    )}
                                    <div className="flex items-start gap-5">
                                       <div className="bg-purple-100/50 p-3 rounded-2xl text-purple-600 shadow-inner">
                                          <Pill className="h-6 w-6" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pharmacy Payload</p>
                                          <p className="text-xl font-black text-slate-900">{formData.prescriptions.length} Active Medications</p>
                                       </div>
                                    </div>
                                    <div className="flex items-start gap-5">
                                       <div className="bg-emerald-100/50 p-3 rounded-2xl text-emerald-600 shadow-inner">
                                          <FlaskConical className="h-6 w-6" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Laboratory Orders</p>
                                          <p className="text-xl font-black text-slate-900">{formData.labsRequested.length} Selected Tests</p>
                                          {formData.labsRequested.length > 0 && (
                                             <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">{formData.labsRequested.join(', ')}</p>
                                          )}
                                       </div>
                                    </div>
                                 </div>

                                 <div className="space-y-3">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Management Plan & Follow-up Protocols</Label>
                                    <Textarea
                                       className="min-h-[160px] rounded-[32px] border-slate-200 bg-white p-6 shadow-soft text-base font-medium leading-relaxed italic"
                                       placeholder="Enter final CLINICAL TREATMENT PLAN, recovery milestones, and follow-up synchronization directives..."
                                       value={formData.plan}
                                       onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                                    />
                                 </div>
                              </div>

                              <div className="space-y-8">
                                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <ChevronRight className="h-5 w-5 text-primary" /> Post-Encounter Matrix
                                 </h3>
                                 <div className="grid grid-cols-1 gap-4">
                                    {[
                                       { id: 'lab', title: 'Send to Diagnostic Lab', desc: 'Secure dispatch to Apex Diagnostics Cluster', icon: FlaskConical, color: 'emerald' },
                                       { id: 'pharmacy', title: 'Transmit to Pharmacy', desc: 'Secure transmission to patient verified pharmacy', icon: Share2, color: 'purple' },
                                       { id: 'print', title: 'Print Clinical Report', desc: 'High-fidelity A4 Clinical Report formatting', icon: Printer, color: 'amber' }
                                    ].map((btn, i) => (
                                       <motion.button
                                          key={i}
                                          onClick={() => handleDispatch(btn.id)}
                                          whileHover={{ x: 8, scale: 1.01 }}
                                          disabled={isDispatching !== null}
                                          className={`flex items-center justify-between p-7 rounded-[32px] border border-slate-100 bg-white hover:border-primary/50 hover:shadow-premium transition-all group relative overflow-hidden w-full ${isDispatching === btn.id ? 'opacity-70 pointer-events-none' : ''}`}
                                       >
                                          <div className="flex items-center gap-5">
                                             <div className={`p-4 rounded-[20px] shadow-inner group-hover:scale-110 transition-transform ${btn.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                                btn.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                                   'bg-amber-50 text-amber-600'
                                                }`}>
                                                {isDispatching === btn.id ? (
                                                   <Loader2 className="h-6 w-6 animate-spin" />
                                                ) : (
                                                   <btn.icon className="h-6 w-6" />
                                                )}
                                             </div>
                                             <div className="text-left">
                                                <p className="font-black text-slate-900 text-lg leading-none mb-1.5">{btn.title}</p>
                                                <p className="text-xs text-slate-400 font-medium tracking-wide italic">{btn.desc}</p>
                                             </div>
                                          </div>
                                          <ChevronRight className="h-6 w-6 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                       </motion.button>
                                    ))}
                                 </div>

                                 <div className="p-8 bg-primary/5 border border-primary/20 rounded-[40px] relative">
                                    <div className="flex items-start gap-4">
                                       <div className="bg-white p-3 rounded-2xl text-primary shadow-soft">
                                          <Info className="h-6 w-6" />
                                       </div>
                                       <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                                          Synchronizing this workspace will update the patient's global health record across all authorized network nodes. This action is immutable.
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </ScrollArea>
         </CardContent>

         <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-4 pb-20 md:pb-6 border-t border-slate-100 flex items-center justify-between z-50 px-2 sm:px-4 md:px-8 flex-shrink-0">
            <Button
               variant="ghost"
               disabled={step === 1 || isSubmitting}
               onClick={() => setStep(prev => Math.max(1, prev - 1))}
               className={`rounded-xl md:rounded-2xl h-12 md:h-14 font-black transition-all px-2 sm:px-4 md:px-8 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:bg-slate-50'}`}
            >
               <ChevronLeft className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" /> Back
            </Button>

            <div className="flex gap-2 md:gap-4">
               {step < 5 ? (
                  <Button
                     onClick={() => setStep(prev => prev + 1)}
                     disabled={(step === 1 && !selectedPatient) || (step === 3 && !formData.diagnosis)}
                     className="rounded-xl md:rounded-2xl h-12 md:h-14 bg-slate-900 hover:bg-slate-800 text-white font-black px-4 md:px-12 shadow-premium transition-all hover:scale-105 active:scale-95 text-xs md:text-sm"
                  >
                     {step === 1 ? 'Assessment' : step === 2 ? 'Diagnosis' : step === 3 ? 'Prescription' : 'Review'} <ChevronRight className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
               ) : (
                  <Button
                     onClick={handleSubmit}
                     disabled={isSubmitting}
                     className="rounded-xl md:rounded-2xl h-12 md:h-14 bg-primary hover:bg-primary/90 text-white font-black px-6 md:px-16 shadow-premium transition-all text-xs md:text-sm"
                  >
                     {isSubmitting ? 'Syncing...' : 'SYNC WORKSPACE'} <CheckCircle2 className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
               )}
            </div>
         </div>

         <div className="hidden print:block p-10 font-serif">
            <div className="flex justify-between items-start mb-10 border-b-2 border-slate-900 pb-6">
               <div>
                  <h1 className="text-3xl font-bold uppercase tracking-tighter">Clinical Encounter Report</h1>
                  <p className="text-sm text-slate-500 italic">Unlimited Healthcare Professional Network</p>
               </div>
               <div className="text-right">
                  <p className="font-bold">Date: {new Date().toLocaleDateString()}</p>
                  <p>Provider ID: {profile?.display_id || 'PRO-SYSTEM'}</p>
               </div>
            </div>

            <div className="space-y-8">
               <section>
                  <h2 className="text-xl font-bold border-b border-slate-200 mb-3 uppercase tracking-wide">Patient Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                     <p><span className="font-bold">Name:</span> {selectedPatient?.name}</p>
                     <p><span className="font-bold">ID:</span> {selectedPatient?.displayId || selectedPatient?.id}</p>
                  </div>
               </section>

               <section>
                  <h2 className="text-xl font-bold border-b border-slate-200 mb-3 uppercase tracking-wide">Vitals Snapshot</h2>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                     <p>BP: {formData.vitals.bp || 'N/A'}</p>
                     <p>Temp: {formData.vitals.temp || 'N/A'}</p>
                     <p>HR: {formData.vitals.hr || 'N/A'}</p>
                     <p>Weight: {formData.vitals.weight || 'N/A'}</p>
                     <p>Resp: {formData.vitals.resp || 'N/A'}</p>
                     <p>SpO2: {formData.vitals.spo2 || 'N/A'}</p>
                  </div>
               </section>

               <section>
                  <h2 className="text-xl font-bold border-b border-slate-200 mb-3 uppercase tracking-wide">SOAP Findings</h2>
                  <div className="space-y-4 text-slate-800">
                     <p><span className="font-bold block text-sm text-slate-500 uppercase">Subjective:</span> {formData.subjective}</p>
                     <p><span className="font-bold block text-sm text-slate-500 uppercase">Objective:</span> {formData.objective}</p>
                     <p><span className="font-bold block text-sm text-slate-500 uppercase">Assessment:</span> {formData.assessment}</p>
                     <p><span className="font-bold block text-sm text-slate-500 uppercase">Diagnosis:</span> {formData.diagnosis}</p>
                  </div>
               </section>

               {formData.prescriptions.length > 0 && (
                  <section>
                     <h2 className="text-xl font-bold border-b border-slate-200 mb-3 uppercase tracking-wide">Prescriptions</h2>
                     <table className="w-full text-left text-sm border-collapse">
                        <thead>
                           <tr className="bg-slate-50">
                              <th className="p-2 border border-slate-200 font-bold uppercase text-[10px]">Medication</th>
                              <th className="p-2 border border-slate-200 font-bold uppercase text-[10px]">Dosage</th>
                              <th className="p-2 border border-slate-200 font-bold uppercase text-[10px]">Freq</th>
                              <th className="p-2 border border-slate-200 font-bold uppercase text-[10px]">Duration</th>
                           </tr>
                        </thead>
                        <tbody>
                           {formData.prescriptions.map((p, i) => (
                              <tr key={i}>
                                 <td className="p-2 border border-slate-200 italic font-medium">{p.drug}</td>
                                 <td className="p-2 border border-slate-200">{p.dosage}</td>
                                 <td className="p-2 border border-slate-200">{p.frequency}</td>
                                 <td className="p-2 border border-slate-200">{p.duration}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </section>
               )}

               {formData.labsRequested.length > 0 && (
                  <section>
                     <h2 className="text-xl font-bold border-b border-slate-200 mb-3 uppercase tracking-wide">Laboratory Investigations</h2>
                     <div className="flex flex-wrap gap-2">
                        {formData.labsRequested.map((l, i) => (
                           <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-xs border border-slate-200 font-bold">{l}</span>
                        ))}
                     </div>
                  </section>
               )}

               <section className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-10">
                  <h2 className="text-lg font-bold mb-2 uppercase tracking-tighter">Clinical Management Plan</h2>
                  <p className="italic leading-relaxed">{formData.plan || 'No additional plan specified.'}</p>
               </section>

               <div className="mt-20 flex justify-between items-end border-t border-slate-200 pt-10">
                  <div className="text-center">
                     <div className="w-56 h-px bg-slate-900 mb-2 mx-auto" />
                     <p className="text-[10px] uppercase font-black">Authorized Provider Signature</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] text-slate-400 uppercase tracking-widest">Digitally Authenticated / Unlimited Healthcare Network</p>
                  </div>
               </div>
            </div>
         </div>
      </Card >
   );
}
