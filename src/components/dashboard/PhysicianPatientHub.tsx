import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    User, 
    Activity, 
    Clock, 
    Video, 
    CheckCircle2, 
    ArrowLeft,
    AlertTriangle,
    FlaskConical,
    Image as ImageIcon,
    Pill,
    History,
    Zap,
    Send,
    ShieldCheck,
    FileText,
    TrendingUp,
    Plus,
    Users,
    ShieldAlert,
    ChevronRight,
    Search,
    Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VideoConferenceRoom } from '@/components/videoConferences/VideoConferenceRoom';
import { DicomViewer } from './DicomViewer';
import { MDTClinicalPlanner } from './MDTClinicalPlanner';

interface PhysicianPatientHubProps {
    patient: any;
    onBack: () => void;
}

// Mock Drug Interaction Database
const DRUG_INTERACTIONS: Record<string, string[]> = {
    'Warfarin': ['NSAID', 'Aspirin', 'Ibuprofen', 'Naproxen'],
    'NSAID': ['Warfarin', 'Lithium', 'Methotrexate'],
    'Metformin': ['Contrast Dye', 'Alcohol'],
    'Lisinopril': ['Spironolactone', 'Potassium Supplements']
};

export function PhysicianPatientHub({ patient, onBack }: PhysicianPatientHubProps) {
    const [activeSection, setActiveSection] = useState('summary');
    const [isMdtCallOpen, setIsMdtCallOpen] = useState(false);
    const [isMdtPlannerOpen, setIsMdtPlannerOpen] = useState(false);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    
    // Prescription State
    const [newDrug, setNewDrug] = useState('');
    const [prescription, setPrescription] = useState<any[]>([]);
    const [interactionWarning, setInteractionWarning] = useState<string | null>(null);

    const checkInteractions = (drugName: string) => {
        const potentialInteractions = DRUG_INTERACTIONS[drugName] || [];
        const existingDrugs = prescription.map(p => p.name);
        
        const conflict = potentialInteractions.find(i => existingDrugs.includes(i));
        if (conflict) {
            setInteractionWarning(`DRUG-DRUG INTERACTION: ${drugName} conflicts with ${conflict}.`);
            toast.error("Drug Interaction Alert!", {
                description: `${drugName} may have severe interactions with ${conflict}.`
            });
        } else {
            setInteractionWarning(null);
        }
    };

    const handleAddDrug = () => {
        if (!newDrug) return;
        setPrescription([...prescription, { name: newDrug, dose: 'Once Daily', status: 'Pending' }]);
        setNewDrug('');
        setInteractionWarning(null);
    };

    const handleESign = () => {
        toast.success("Prescription Digitally Signed & Dispatched to Pharmacy");
        setIsPrescriptionModalOpen(false);
    };

    const handleEscalate = () => {
        toast.error("URGENT PAGE DISPATCHED", {
            description: `ELECTRONIC PAGER ALERT: Specialist response requested for ${patient.fullName || patient.name}. Clinical summary: Unstable vitals / guarded status. Dispatching to Pager ID: 2044-DOC.`,
            duration: 8000,
            icon: <ShieldAlert className="h-5 w-5 text-red-600" />
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">{patient.fullName || patient.name}</h1>
                            <div className={`w-3 h-3 rounded-full animate-pulse ${patient.triageColor === 'red' ? 'bg-red-500' : patient.triageColor === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <Badge variant="outline" className="border-slate-200 text-slate-500 font-black text-[9px]">ID: {patient.id.slice(-8)}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Specialist Consultation • Physician Hub</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={handleEscalate}
                        className="rounded-xl h-10 bg-red-50 border-red-100 text-red-600 font-black text-[10px] uppercase gap-2"
                    >
                        <ShieldAlert className="h-4 w-4" /> Escalate Case
                    </Button>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100">
                        <User className="h-6 w-6" />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Left Side: Summary & AI Triage */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-500" /> AI Triage Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Automated Risk Analysis</p>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                    "Patient presents with atypical chest discomfort and mild dyspnea. AI analysis suggests high probability of localized ischemia. Recommendation: Immediate troponin and 12-lead ECG correlation."
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Urgency Level</p>
                                    <p className="text-xs font-black text-red-600 uppercase">High (Protocol Red)</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Stability</p>
                                    <p className="text-xs font-black text-amber-600 uppercase">Guarded</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Observations</h4>
                                {[
                                    'Persistent tachycardia (112bpm)',
                                    'SpO2 stable at 96% on room air',
                                    'History of hypertension & T2DM'
                                ].map((obs, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {obs}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Specialist Actions */}
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Physician Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                            <Button className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3 justify-start px-6">
                                <Calendar className="h-5 w-5 text-blue-400" /> Schedule Follow-up
                            </Button>
                            <Button className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3 justify-start px-6">
                                <FlaskConical className="h-5 w-5 text-emerald-400" /> Request Lab / Imaging
                            </Button>
                            <Button 
                                onClick={() => setIsPrescriptionModalOpen(true)}
                                className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3 justify-start px-6"
                            >
                                <Pill className="h-5 w-5 text-purple-400" /> Prescription Writer
                            </Button>
                            <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3 shadow-xl shadow-indigo-500/20">
                                <CheckCircle2 className="h-5 w-5" /> Finalize Treatment Plan
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Diagnosis Panel */}
                <div className="md:col-span-8 space-y-6">
                    <Tabs defaultValue="diagnosis" className="w-full">
                        <TabsList className="bg-white/50 p-1 rounded-2xl border border-slate-200 h-12 w-full justify-start gap-1 overflow-x-auto">
                            <TabsTrigger value="diagnosis" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Diagnosis Panel</TabsTrigger>
                            <TabsTrigger value="medications" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Active Medications</TabsTrigger>
                            <TabsTrigger value="collaboration" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">MDT Collaboration</TabsTrigger>
                        </TabsList>

                        <TabsContent value="diagnosis" className="space-y-6 mt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Lab Results Diagnosis */}
                                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                                        <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                            <FlaskConical className="h-4 w-4 text-emerald-500" /> Lab Observations
                                        </CardTitle>
                                        <Badge className="bg-emerald-50 text-emerald-600 font-black text-[9px]">LATEST</Badge>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Troponin I', val: '12', unit: 'ng/L', status: 'normal' },
                                                { label: 'Potassium (K+)', val: '4.2', unit: 'mmol/L', status: 'normal' },
                                                { label: 'Creatinine', val: '1.1', unit: 'mg/dL', status: 'normal' }
                                            ].map((res, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <p className="text-xs font-black text-slate-900 uppercase">{res.label}</p>
                                                    <p className="text-sm font-black text-slate-900">{res.val} <span className="text-[10px] text-slate-400">{res.unit}</span></p>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-indigo-600">View Longitudinal Trends</Button>
                                    </CardContent>
                                </Card>

                                {/* Radiology Diagnosis */}
                                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                                        <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-blue-500" /> Imaging Insights
                                        </CardTitle>
                                        <Badge className="bg-blue-50 text-blue-600 font-black text-[9px]">PACS SYNC</Badge>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => toast.info("Opening Full DICOM Viewer...")}>
                                            <img 
                                                src="https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1000" 
                                                alt="Scan" 
                                                className="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-80 transition-opacity"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white font-black text-[10px] uppercase border border-white/20">
                                                    Open DICOM Viewer
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 text-center">Chest X-Ray • AP View • Captured 2h ago</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Full Timeline Summary */}
                            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <History className="h-4 w-4 text-indigo-500" /> Comprehensive Clinical History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="max-h-[300px] overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                        {[
                                            { time: '12:45', event: 'Troponin Result Uploaded', unit: 'Lab-Scientist Unit 204' },
                                            { time: '12:15', event: 'Imaging Acquisition Completed', unit: 'Radiographer Unit 105' },
                                            { time: '11:50', event: 'ER Arrival & Vitals Recorded', unit: 'Triage Nurse' },
                                            { time: '11:20', event: 'Ambulance Transport Started', unit: 'EMS Unit 12' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="w-16 text-[10px] font-black text-slate-400 uppercase">{item.time}</div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-black text-slate-900">{item.event}</p>
                                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{item.unit}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="medications" className="mt-6">
                            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                                <CardContent className="p-8">
                                    <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                        <Pill className="h-12 w-12 text-slate-300 mb-4" />
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Medication List</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Synchronized with Pharmacy & Home Care</p>
                                        <div className="mt-8 w-full max-w-md space-y-3">
                                            {[
                                                { name: 'Lisinopril 10mg', dose: '1 tab PO daily', status: 'Active' },
                                                { name: 'Aspirin 81mg', dose: '1 tab PO daily', status: 'Active' },
                                                { name: 'Atorvastatin 20mg', dose: '1 tab PO HS', status: 'Active' }
                                            ].map((med, i) => (
                                                <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{med.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{med.dose}</p>
                                                    </div>
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase">{med.status}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="collaboration" className="mt-6">
                            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex flex-col items-center justify-center py-12 text-center bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100 mb-4">
                                            <Users className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Multi-Person Clinical Plan</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 px-12">
                                            Invite surgeons, radiologists, and nurses to co-create a specialized patient care pathway.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button className="h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-widest gap-3" onClick={() => setIsMdtCallOpen(true)}>
                                            <Video className="h-5 w-5" /> Start MDT Call
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-16 rounded-2xl border-2 border-indigo-100 text-indigo-600 font-black uppercase text-xs tracking-widest gap-3"
                                            onClick={() => setIsMdtPlannerOpen(true)}
                                        >
                                            <Plus className="h-5 w-5" /> Create Multi-Person Plan
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Sticky Navigation Info */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-30 shadow-2xl">
                <div className="healthcare-container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Activity</p>
                            <p className="text-sm font-black text-slate-900">High Intensity • Review Mode</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-100">Audit Case Access</Button>
                        <Button className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100">Commit Findings</Button>
                    </div>
                </div>
            </div>

            {/* Prescription Writer Modal */}
            <Dialog open={isPrescriptionModalOpen} onOpenChange={setIsPrescriptionModalOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none rounded-[40px] shadow-2xl">
                    <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
                    <div className="p-8 space-y-6">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Badge className="bg-purple-50 text-purple-700 font-black text-[9px] uppercase tracking-widest mb-1">Advanced RX Terminal</Badge>
                                    <DialogTitle className="text-3xl font-black text-slate-900 uppercase tracking-tight">E-Prescription Writer</DialogTitle>
                                </div>
                                <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-xl shadow-purple-100">
                                    <Pill className="h-8 w-8" />
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Search className="h-4 w-4" /> Integrated Drug Database (Live API Check)
                                </Label>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Enter Drug Name (e.g. Warfarin, Metformin)..." 
                                        className="h-14 rounded-2xl border-slate-200 bg-white font-bold"
                                        value={newDrug}
                                        onChange={e => {
                                            setNewDrug(e.target.value);
                                            checkInteractions(e.target.value);
                                        }}
                                    />
                                    <Button onClick={handleAddDrug} className="h-14 bg-slate-900 text-white rounded-2xl px-8 font-black uppercase text-xs tracking-widest">Add</Button>
                                </div>

                                {interactionWarning && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-bounce">
                                        <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-black text-red-700 uppercase">Interaction Detected!</p>
                                            <p className="text-[10px] font-bold text-red-600 leading-relaxed">{interactionWarning}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 max-h-[250px] overflow-y-auto p-2 custom-scrollbar">
                                {prescription.map((med, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                                <Pill className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase">{med.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{med.dose}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-amber-50 text-amber-600 font-black text-[9px] uppercase">Awaiting Signature</Badge>
                                    </div>
                                ))}
                                {prescription.length === 0 && (
                                    <div className="py-12 text-center text-slate-300 uppercase font-black text-[10px] tracking-widest italic">
                                        No drugs added to current session
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 space-y-4">
                            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" /> Specialist E-Signature Authorization
                            </h5>
                            <div className="p-10 border-4 border-dashed border-indigo-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 bg-white relative group">
                                <div className="text-center">
                                    <p className="text-4xl font-serif italic text-indigo-900 opacity-60 select-none">
                                        Authorized...
                                    </p>
                                    <div className="h-px w-64 bg-indigo-200 mt-4 mx-auto" />
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-3">Digitally Secured Practitioner Signature</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1 h-16 rounded-[2rem] font-black uppercase text-xs tracking-widest border-2" onClick={() => setIsPrescriptionModalOpen(false)}>Discard Draft</Button>
                            <Button 
                                onClick={handleESign}
                                disabled={prescription.length === 0}
                                className="flex-[2] h-16 bg-purple-600 hover:bg-purple-700 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-purple-100 gap-3"
                            >
                                <CheckCircle2 className="h-5 w-5" /> Sign & Dispatch E-Prescription
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* MDT Planner Overlay */}
            <Dialog open={isMdtPlannerOpen} onOpenChange={setIsMdtPlannerOpen}>
                <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
                    <MDTClinicalPlanner 
                        patient={patient} 
                        onComplete={() => setIsMdtPlannerOpen(false)} 
                    />
                </DialogContent>
            </Dialog>

            {/* MDT Video Call Overlay */}
            <Dialog open={isMdtCallOpen} onOpenChange={setIsMdtCallOpen}>
                <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-slate-950 border-none rounded-[40px]">
                    <VideoConferenceRoom 
                        conference={{
                            id: 'mdt-' + patient.id,
                            title: `MDT: ${patient.fullName || patient.name}`,
                            type: 'consultation',
                            status: 'active',
                            participants: [
                                { id: 'p1', conferenceId: 'mdt-' + patient.id, userId: 'physician', userName: 'Physician (Lead)', userRole: 'doctor', isHost: true, isCoHost: false, isMicrophoneEnabled: true, isCameraEnabled: true, isScreenSharing: false, isHandRaised: false, connectionStatus: 'connected' },
                                { id: 'p2', conferenceId: 'mdt-' + patient.id, userId: 'surgeon', userName: 'Specialist: Surgeon', userRole: 'doctor', isHost: false, isCoHost: false, isMicrophoneEnabled: true, isCameraEnabled: true, isScreenSharing: false, isHandRaised: false, connectionStatus: 'connected' },
                                { id: 'p3', conferenceId: 'mdt-' + patient.id, userId: 'nurse', userName: 'Nurse Unit 1', userRole: 'nurse', isHost: false, isCoHost: false, isMicrophoneEnabled: true, isCameraEnabled: true, isScreenSharing: false, isHandRaised: false, connectionStatus: 'connected' }
                            ],
                            hostId: 'physician',
                            hostName: 'Lead Physician',
                            maxParticipants: 10,
                            currentParticipants: 3,
                            isRecordingEnabled: true,
                            isRecording: true,
                            waitingRoomEnabled: false,
                            autoAdmitParticipants: true,
                            muteParticipantsOnEntry: false,
                            provider: 'webrtc',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        }}
                        ws={null}
                        onLeave={() => setIsMdtCallOpen(false)}
                        userId="physician"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
