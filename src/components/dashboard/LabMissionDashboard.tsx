import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Microscope, 
    User, 
    Activity, 
    Clock, 
    CheckCircle2, 
    ArrowLeft,
    AlertTriangle,
    FlaskConical,
    TestTube,
    Zap,
    Send,
    ShieldAlert,
    Thermometer,
    FileText,
    History,
    Pipette
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface LabMissionDashboardProps {
    order: any;
    onBack: () => void;
    onComplete: () => void;
}

export function LabMissionDashboard({ order, onBack, onComplete }: LabMissionDashboardProps) {
    const [labStatus, setLabStatus] = useState<'pending' | 'collected' | 'started' | 'processing' | 'completed'>('pending');
    const [sampleLogs, setSampleLogs] = useState({
        timeDrawn: new Date().toISOString(),
        haemolysis: 'None',
        clotting: 'None',
        instrument: '',
        technique: ''
    });
    const [results, setResults] = useState<{ parameter: string; value: string; unit: string; isCritical: boolean }[]>([]);
    const [newResult, setNewResult] = useState({ parameter: '', value: '', unit: '', isCritical: false });

    const handleUpdateStatus = (status: 'collected' | 'started' | 'processing' | 'completed') => {
        setLabStatus(status);
        toast.success(`Lab status: ${status.toUpperCase()}`);
    };

    const handleAddResult = () => {
        if (!newResult.parameter || !newResult.value) return;
        setResults([...results, { ...newResult }]);
        if (newResult.isCritical) {
            toast.error(`CRITICAL VALUE DETECTED: ${newResult.parameter} ${newResult.value}`, {
                description: "On-call consultant will be notified upon submission."
            });
        }
        setNewResult({ parameter: '', value: '', unit: '', isCritical: false });
    };

    const handleFinalize = () => {
        const hasCritical = results.some(r => r.isCritical);
        toast.success("Lab mission completed. Results uploaded to Referring Doctor and Cardiologist.");
        if (hasCritical) {
            toast.info("CRITICAL ALERT: Notifying on-call consultant immediately.", {
                icon: <ShieldAlert className="h-5 w-5 text-red-600" />,
                duration: 5000
            });
        }
        onComplete();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Lab Mission: {order.id}</h1>
                            <Badge className={`${order.priority === 'STAT' || order.priority.includes('Urgent') ? 'bg-red-500' : 'bg-blue-500'} text-white border-none px-3`}>
                                {order.priority.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">MLS Unit 204 • {order.exam}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sample Status</p>
                        <p className={`text-sm font-black uppercase ${labStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {labStatus}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-slate-100">
                        <Microscope className="h-6 w-6" />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Left Column: Patient & Context */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" /> Patient Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-black text-slate-900 uppercase">{order.patient}</p>
                                <Badge variant="outline" className="border-slate-200 text-slate-500 font-black text-[9px]">ID: {order.id.slice(-6)}</Badge>
                            </div>
                            
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Required Sample(s)</p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-red-50 text-red-600 border-red-100 font-black text-[9px] uppercase tracking-widest">Whole Blood</Badge>
                                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-black text-[9px] uppercase tracking-widest">Serum</Badge>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Clinical Context
                                    </p>
                                    <p className="text-xs font-bold text-slate-700">"Rule out {order.priority.toLowerCase()} condition. Correlation with ECG required."</p>
                                </div>
                                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <History className="h-3 w-3" /> Last Results (24h)
                                    </p>
                                    <p className="text-xs font-bold text-slate-700 underline cursor-pointer">View Longitudinal Data</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mission Workflow Controls */}
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/5">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Laboratory Workflow</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                <Button 
                                    onClick={() => handleUpdateStatus('collected')}
                                    className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 ${labStatus === 'collected' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    <Pipette className="h-4 w-4" /> Sample Collected
                                </Button>
                                <Button 
                                    onClick={() => handleUpdateStatus('started')}
                                    className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 ${labStatus === 'started' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    <Clock className="h-4 w-4" /> Started Analysis
                                </Button>
                                <Button 
                                    onClick={() => handleUpdateStatus('processing')}
                                    className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 ${labStatus === 'processing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    <Zap className="h-4 w-4" /> Processing Results
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Logging & Results */}
                <div className="md:col-span-8 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Sample Logs */}
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <History className="h-4 w-4 text-blue-500" /> Sample Accession Logs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Drawn</Label>
                                        <Input 
                                            type="datetime-local"
                                            className="rounded-xl bg-slate-50 border-slate-100 h-11 font-bold text-xs" 
                                            value={sampleLogs.timeDrawn.slice(0, 16)}
                                            onChange={e => setSampleLogs({...sampleLogs, timeDrawn: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instrument Used</Label>
                                        <Input 
                                            className="rounded-xl bg-slate-50 border-slate-100 h-11 font-bold text-xs" 
                                            placeholder="e.g. Cobas 6000"
                                            value={sampleLogs.instrument}
                                            onChange={e => setSampleLogs({...sampleLogs, instrument: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sample Integrity (Haemolysis/Clotting)</Label>
                                        <div className="flex gap-2">
                                            {['None', 'Mild', 'Moderate', 'Severe'].map((m) => (
                                                <Button 
                                                    key={m}
                                                    variant="outline"
                                                    onClick={() => setSampleLogs({...sampleLogs, haemolysis: m})}
                                                    className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase ${sampleLogs.haemolysis === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-100'}`}
                                                >
                                                    {m}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lab Technician Notes</Label>
                                        <Textarea 
                                            placeholder="Add observations on sample quality or analyzer alerts..."
                                            className="rounded-xl bg-slate-50 border-slate-100 min-h-[80px] font-bold p-4"
                                            value={sampleLogs.technique}
                                            onChange={e => setSampleLogs({...sampleLogs, technique: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Result Entry */}
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <FlaskConical className="h-4 w-4 text-emerald-500" /> Result Entry Portal
                                </CardTitle>
                                <Badge className="bg-emerald-500 text-white font-black text-[9px]">LIVE ENTRY</Badge>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500">Parameter</Label>
                                            <Input 
                                                placeholder="e.g. Troponin I" 
                                                className="h-10 rounded-xl"
                                                value={newResult.parameter}
                                                onChange={e => setNewResult({...newResult, parameter: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500">Value</Label>
                                            <Input 
                                                placeholder="e.g. 12" 
                                                className="h-10 rounded-xl"
                                                value={newResult.value}
                                                onChange={e => setNewResult({...newResult, value: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500">Unit</Label>
                                            <Input 
                                                placeholder="e.g. ng/L" 
                                                className="h-10 rounded-xl"
                                                value={newResult.unit}
                                                onChange={e => setNewResult({...newResult, unit: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 mt-5">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setNewResult({...newResult, isCritical: !newResult.isCritical})}
                                                className={`h-10 rounded-xl gap-2 font-black text-[9px] uppercase tracking-widest ${newResult.isCritical ? 'bg-red-600 text-white border-red-600' : 'border-slate-200 text-slate-600'}`}
                                            >
                                                <ShieldAlert className="h-4 w-4" /> Critical
                                            </Button>
                                            <Button 
                                                onClick={handleAddResult}
                                                className="h-10 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 h-[150px] overflow-y-auto custom-scrollbar">
                                    {results.length > 0 ? (
                                        results.map((res, i) => (
                                            <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border ${res.isCritical ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase">{res.parameter}</p>
                                                    <p className={`text-lg font-black ${res.isCritical ? 'text-red-600' : 'text-slate-900'}`}>{res.value} <span className="text-xs font-bold text-slate-400">{res.unit}</span></p>
                                                </div>
                                                {res.isCritical && (
                                                    <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center text-white animate-pulse">
                                                        <ShieldAlert className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20">
                                            <FlaskConical className="h-12 w-12 mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No results entered</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Integrated Laboratory Information System (LIS) Preview */}
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-400" /> Laboratory Information System (LIS)
                            </CardTitle>
                            <Badge className="bg-blue-500 text-white font-black text-[9px]">ENTERPRISE SYNC</Badge>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="h-3 w-3" /> Analyzer Status
                                    </h4>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-xs font-bold text-emerald-400 mb-1">ONLINE • READY</p>
                                        <p className="text-[10px] text-white/60">Beckman Coulter AU5800</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <History className="h-3 w-3" /> QC Metrics
                                    </h4>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-xs font-bold text-white mb-1">99.8% PASS</p>
                                        <p className="text-[10px] text-white/60">Latest Levey-Jennings: Normal</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <Send className="h-3 w-3" /> Auto-Validation
                                    </h4>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-xs font-bold text-blue-400 mb-1">ENABLED</p>
                                        <p className="text-[10px] text-white/60">Cross-checking Medical History...</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Turnaround Timer</p>
                            <p className="text-sm font-black text-slate-900">00:42:15</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end max-w-md">
                        {labStatus === 'completed' || results.length > 0 ? (
                            <Button 
                                onClick={handleFinalize}
                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-200 gap-3"
                            >
                                <Send className="h-5 w-5" /> Finalize & Dispatch Results
                            </Button>
                        ) : (
                            <Button 
                                disabled
                                className="w-full h-14 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-[0.2em] border-2 border-slate-200"
                            >
                                Process Sample to Submit
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
