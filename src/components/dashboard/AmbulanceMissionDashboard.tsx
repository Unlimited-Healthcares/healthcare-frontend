import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Truck, 
    User, 
    MapPin, 
    Activity, 
    Clock, 
    ShieldAlert, 
    Heart, 
    Video, 
    Mic, 
    Camera, 
    FileText, 
    CheckCircle2, 
    X,
    ChevronRight,
    ArrowLeft,
    AlertTriangle,
    Navigation,
    Stethoscope,
    Plus,
    Pill
} from 'lucide-react';
import { AmbulanceRequest, RequestStatus } from '@/types/emergency';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VideoConferenceRoom } from '@/components/videoConferences/VideoConferenceRoom';
import { emergencyService } from '@/services/emergencyService';

interface AmbulanceMissionDashboardProps {
    request: AmbulanceRequest;
    onBack: () => void;
    onUpdate: () => void;
}

export function AmbulanceMissionDashboard({ request, onBack, onUpdate }: AmbulanceMissionDashboardProps) {
    const [missionPhase, setMissionPhase] = useState<RequestStatus>(request.status);
    const [vitals, setVitals] = useState({
        hr: '',
        bp: '',
        spo2: '',
        gcs: '',
        bloodGlucose: '',
    });
    const [mechanism, setMechanism] = useState('');
    const [isMdtCallOpen, setIsMdtCallOpen] = useState(false);
    const [medsLog, setMedsLog] = useState<{ name: string; dosage: string; timestamp: Date }[]>([]);
    const [orders, setOrders] = useState<any[]>(request.medicalOrders || []);

    const updateStatus = async (newStatus: RequestStatus) => {
        try {
            await emergencyService.updateRequestStatus(request.id, { status: newStatus });
            setMissionPhase(newStatus);
            onUpdate();
            toast.success(`Mission status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
        } catch (error) {
            toast.error("Failed to update mission status");
        }
    };

    const handleSaveVitals = async () => {
        try {
            const newVitals = {
                ...vitals,
                hr: parseInt(vitals.hr),
                bp: vitals.bp,
                spo2: parseInt(vitals.spo2),
                gcs: parseInt(vitals.gcs),
                bloodGlucose: parseFloat(vitals.bloodGlucose),
                timestamp: new Date()
            };
            await emergencyService.updateClinicalData(request.id, { 
                vitals: newVitals
            });
            toast.success("Vitals and Mechanism of Injury transmitted to ER");
            onUpdate();
        } catch (error) {
            toast.error("Failed to transmit data");
        }
    };

    const handleLogMed = async (name: string, dosage: string) => {
        const newMed = { name, dosage, administeredBy: 'EMT Crew', timestamp: new Date() };
        try {
            await emergencyService.updateClinicalData(request.id, {
                interventions: [newMed]
            });
            setMedsLog(prev => [...prev, newMed]);
            toast.success(`Logged: ${name} ${dosage}`);
            onUpdate();
        } catch (error) {
            toast.error("Failed to log medication");
        }
    };

    const handleArrivedAtER = async () => {
        try {
            await emergencyService.updateRequestStatus(request.id, { status: RequestStatus.COMPLETED });
            setMissionPhase(RequestStatus.COMPLETED);
            toast.success("Handoff Complete. Pre-hospital report generated.");
            onUpdate();
        } catch (error) {
            toast.error("Failed to complete handoff");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 pb-24">
            {/* Mission Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Mission: {request.requestNumber}</h1>
                            <Badge className={`${request.priority === 'critical' ? 'bg-red-500' : 'bg-amber-500'} text-white border-none`}>
                                {request.priority.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Crew: {request.teamPersonnel?.map(p => p.name).join(', ') || 'Unit 402'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Hospital Arrival</p>
                        <p className="text-sm font-black text-slate-900">12:45 PM (8 mins)</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-red-600 border border-slate-100">
                        <Activity className="h-6 w-6 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Left Column: Patient & Mission Context */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" /> Patient ID: {request.id.slice(-6)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-black text-slate-900">{request.patientName}</p>
                                <Badge className={`${request.triageLevel === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} border-none font-black text-[10px] uppercase tracking-widest px-3`}>
                                    AI Triage: {request.triageLevel?.toUpperCase() || 'RED'}
                                </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Type</p>
                                    <p className="text-sm font-black text-slate-900">{request.medicalHistory?.blood_type || 'O+'}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Age/Gender</p>
                                    <p className="text-sm font-black text-slate-900">{request.patientAge || 42} / {request.patientGender || 'M'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100">
                                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Allergies
                                    </p>
                                    <p className="text-xs font-bold text-slate-700">{request.medicalHistory?.allergies?.join(', ') || 'Penicillin, Shellfish'}</p>
                                </div>
                                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <ShieldAlert className="h-3 w-3" /> Chronic Conditions
                                    </p>
                                    <p className="text-xs font-bold text-slate-700">{request.medicalHistory?.conditions?.join(', ') || 'Hypertension, Type 2 Diabetes'}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location / Scene</p>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">{request.pickupAddress}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mission Controls */}
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Mission Progression</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                <Button 
                                    onClick={() => updateStatus(RequestStatus.EN_ROUTE)}
                                    className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 ${missionPhase === RequestStatus.EN_ROUTE ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    <Navigation className="h-4 w-4" /> En-Route to Patient
                                </Button>
                                <Button 
                                    onClick={() => updateStatus(RequestStatus.ON_SCENE)}
                                    className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 ${missionPhase === RequestStatus.ON_SCENE ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    <CheckCircle2 className="h-4 w-4" /> Arrived On Scene
                                </Button>
                                <Button 
                                    onClick={() => updateStatus(RequestStatus.TRANSPORTING)}
                                    className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 ${missionPhase === RequestStatus.TRANSPORTING ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    <Truck className="h-4 w-4" /> Transporting to ER
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Clinical Tools */}
                <div className="md:col-span-8 space-y-6">
                    {/* Phase Specific Tooling */}
                    {missionPhase === RequestStatus.ON_SCENE || missionPhase === RequestStatus.TRANSPORTING ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Vitals Entry */}
                            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-red-500" /> En-Route Assessment
                                    </CardTitle>
                                    <Button size="sm" variant="outline" className="h-7 text-[9px] font-black uppercase rounded-lg border-red-200 text-red-600" onClick={handleSaveVitals}>
                                        Transmit Vitals
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-6 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heart Rate (HR)</Label>
                                            <div className="relative">
                                                <Input 
                                                    value={vitals.hr} 
                                                    onChange={(e) => setVitals({...vitals, hr: e.target.value})}
                                                    className="rounded-xl bg-slate-50 border-slate-100 h-11 font-black text-slate-900 pr-10" 
                                                    placeholder="--" 
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">BPM</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blood Pressure</Label>
                                            <div className="relative">
                                                <Input 
                                                    value={vitals.bp} 
                                                    onChange={(e) => setVitals({...vitals, bp: e.target.value})}
                                                    className="rounded-xl bg-slate-50 border-slate-100 h-11 font-black text-slate-900 pr-12" 
                                                    placeholder="--/--" 
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">mmHg</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SpO₂</Label>
                                            <div className="relative">
                                                <Input 
                                                    value={vitals.spo2} 
                                                    onChange={(e) => setVitals({...vitals, spo2: e.target.value})}
                                                    className="rounded-xl bg-slate-50 border-slate-100 h-11 font-black text-slate-900 pr-8" 
                                                    placeholder="--" 
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">GCS Score</Label>
                                            <div className="relative">
                                                <Input 
                                                    value={vitals.gcs} 
                                                    onChange={(e) => setVitals({...vitals, gcs: e.target.value})}
                                                    className="rounded-xl bg-slate-50 border-slate-100 h-11 font-black text-slate-900 pr-10" 
                                                    placeholder="--" 
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">/15</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mechanism of Injury</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {['MVA', 'Fall', 'Chest Pain', 'Respiratory', 'Trauma'].map((m) => (
                                                <Button 
                                                    key={m}
                                                    variant="outline"
                                                    onClick={() => setMechanism(m)}
                                                    className={`h-11 rounded-xl font-bold text-xs ${mechanism === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'}`}
                                                >
                                                    {m}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1 rounded-xl h-12 border-slate-100 gap-2 text-xs font-bold">
                                            <Camera className="h-4 w-4" /> Photo
                                        </Button>
                                        <Button variant="outline" className="flex-1 rounded-xl h-12 border-slate-100 gap-2 text-xs font-bold">
                                            <Video className="h-4 w-4" /> Video
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* MDT & ECG */}
                            <div className="space-y-6">
                                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white h-full min-h-[300px]">
                                    <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between">
                                        <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-red-500 animate-pulse" /> Live ECG Link
                                        </CardTitle>
                                        <Badge className="bg-emerald-500 text-white font-black text-[9px]">LIVE STREAM</Badge>
                                    </CardHeader>
                                    <CardContent className="p-0 relative flex items-center justify-center bg-black/40 h-48 overflow-hidden">
                                        <svg viewBox="0 0 1000 200" className="w-full h-full stroke-emerald-400 stroke-[2px] fill-none">
                                            <path d="M0 100 L50 100 L60 80 L70 120 L80 100 L130 100 L140 30 L150 170 L160 100 L210 100 L220 90 L230 110 L240 100 L290 100 L300 80 L310 120 L320 100 L370 100 L380 30 L390 170 L400 100 L450 100 L460 90 L470 110 L480 100 L530 100 L540 80 L550 120 L560 100 L610 100 L620 30 L630 170 L640 100 L690 100 L700 90 L710 110 L720 100 L770 100 L780 80 L790 120 L800 100 L850 100 L860 30 L870 170 L880 100 L930 100 L940 90 L950 110 L960 100 L1000 100">
                                                <animate attributeName="stroke-dasharray" from="1000 1000" to="1000 1000" dur="2s" repeatCount="indefinite" />
                                                <animate attributeName="stroke-dashoffset" from="1000" to="-1000" dur="5s" repeatCount="indefinite" />
                                            </path>
                                        </svg>
                                        <div className="absolute top-4 left-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Lead II - 72 BPM</div>
                                    </CardContent>
                                    <CardContent className="p-6">
                                        <Button 
                                            onClick={() => setIsMdtCallOpen(true)}
                                            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3 shadow-xl shadow-red-900/40"
                                        >
                                            <Video className="h-5 w-5" /> Start ER MDT Video Call
                                        </Button>
                                        <p className="text-[10px] text-center text-white/40 font-bold uppercase tracking-widest mt-3">Auto-inviting: Cardiologist, ER Doctor</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                                <Truck className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mission Initialized</h3>
                                <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Please confirm arrival at patient location to unlock clinical toolset and pre-arrival transmission.</p>
                            </div>
                            <Button 
                                onClick={() => updateStatus(RequestStatus.ON_SCENE)}
                                className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3"
                            >
                                Confirm Arrival <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Card>
                    )}

                    {/* Medical Orders & Meds Log */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <Mic className="h-4 w-4 text-blue-500" /> Verbal Orders Stream
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-[250px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {orders.length > 0 ? (
                                        orders.map((order, i) => (
                                            <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                    <Stethoscope className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{order.orderedBy}</p>
                                                        <p className="text-[9px] font-bold text-slate-400">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <p className="text-xs font-black text-slate-800 mt-0.5">“{order.order}”</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Button size="sm" variant="ghost" className="h-6 text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg">Acknowledge</Button>
                                                        <Button size="sm" variant="ghost" className="h-6 text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg">Decline</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                            <Mic className="h-8 w-8 mb-2 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Orders...</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <Pill className="h-4 w-4 text-emerald-500" /> Medications Administered
                                </CardTitle>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="icon" className="h-7 w-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-[32px] border-none shadow-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="font-black uppercase tracking-tight">Log Medication</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest">Medication Name</Label>
                                                <Input id="med-name" placeholder="e.g. Aspirin" className="rounded-xl h-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest">Dosage</Label>
                                                <Input id="med-dosage" placeholder="e.g. 300 mg" className="rounded-xl h-12" />
                                            </div>
                                            <Button 
                                                onClick={() => {
                                                    const name = (document.getElementById('med-name') as HTMLInputElement).value;
                                                    const dosage = (document.getElementById('med-dosage') as HTMLInputElement).value;
                                                    handleLogMed(name, dosage);
                                                }}
                                                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest"
                                            >
                                                Log Administration
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-[250px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                    {(request.medsAdministered || []).length > 0 ? (
                                        request.medsAdministered?.map((med, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{med.name}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{med.dosage}</p>
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">{new Date(med.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                            <Pill className="h-8 w-8 mb-2 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No meds logged</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-30 shadow-2xl">
                <div className="healthcare-container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time on Mission</p>
                            <p className="text-sm font-black text-slate-900">24:12</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end max-w-md">
                        {missionPhase === RequestStatus.TRANSPORTING ? (
                            <Button 
                                onClick={handleArrivedAtER}
                                className="w-full h-14 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-red-200 gap-3"
                            >
                                <CheckCircle2 className="h-5 w-5" /> Arrived at ER - Handoff
                            </Button>
                        ) : missionPhase === RequestStatus.COMPLETED ? (
                            <div className="flex items-center gap-4 w-full">
                                <Button 
                                    onClick={onBack}
                                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-200 gap-3"
                                >
                                    <FileText className="h-5 w-5" /> View Final PCR Report
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="h-14 w-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                            <div className="grid grid-cols-2 gap-0.5">
                                                <div className="w-1.5 h-1.5 bg-white" />
                                                <div className="w-1.5 h-1.5 bg-white" />
                                                <div className="w-1.5 h-1.5 bg-white" />
                                                <div className="w-1.5 h-1.5 bg-white" />
                                            </div>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-xs rounded-[40px] border-none shadow-2xl p-8 text-center">
                                        <h3 className="font-black uppercase tracking-tight mb-4">Patient Handoff QR</h3>
                                        <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-dashed border-slate-200 aspect-square flex items-center justify-center">
                                            {/* Simulated QR Code */}
                                            <div className="grid grid-cols-8 gap-1 opacity-80">
                                                {Array.from({ length: 64 }).map((_, i) => (
                                                    <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-transparent'} rounded-[1px]`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 leading-relaxed">
                                            Nurse to scan for instant digital handoff link
                                        </p>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ) : (
                            <Button 
                                disabled
                                className="w-full h-14 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-[0.2em] border-2 border-slate-200"
                            >
                                Mission in Progress
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* MDT Video Call Overlay */}
            <Dialog open={isMdtCallOpen} onOpenChange={setIsMdtCallOpen}>
                <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-slate-950 border-none rounded-[40px]">
                    <VideoConferenceRoom 
                        conference={{
                            id: 'mission-' + request.id,
                            title: `CRITICAL MDT: Mission ${request.requestNumber}`,
                            type: 'emergency',
                            status: 'active',
                            participants: [
                                { id: 'p1', conferenceId: 'mission-' + request.id, userId: 'er-lead', userName: 'ER Lead Doctor', userRole: 'doctor', isHost: true, isCoHost: false, isMicrophoneEnabled: true, isCameraEnabled: true, isScreenSharing: false, isHandRaised: false, connectionStatus: 'connected' },
                                { id: 'p2', conferenceId: 'mission-' + request.id, userId: 'cardiologist', userName: 'On-Call Cardiologist', userRole: 'doctor', isHost: false, isCoHost: false, isMicrophoneEnabled: true, isCameraEnabled: true, isScreenSharing: false, isHandRaised: false, connectionStatus: 'connected' },
                                { id: 'p3', conferenceId: 'mission-' + request.id, userId: 'emt-unit', userName: 'EMT Unit 402', userRole: 'doctor', isHost: false, isCoHost: false, isMicrophoneEnabled: true, isCameraEnabled: true, isScreenSharing: false, isHandRaised: false, connectionStatus: 'connected' }
                            ],
                            hostId: 'er-lead',
                            hostName: 'ER Lead Doctor',
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
                        userId="ambulance-crew"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
