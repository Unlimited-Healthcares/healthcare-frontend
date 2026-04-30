import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Cpu, 
    Zap, 
    Wifi, 
    WifiOff, 
    AlertCircle, 
    Search, 
    Settings, 
    Activity, 
    Terminal,
    Play,
    RefreshCw,
    ShieldCheck,
    Video,
    Bluetooth,
    BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MedicalDevice {
    id: string;
    name: string;
    serialNumber: string;
    type: 'Ventilator' | 'Monitor' | 'Infusion Pump' | 'Defibrillator';
    status: 'online' | 'offline' | 'faulty';
    lastCalibration: string;
    location: string;
}

export function BiotechDeviceRegistry() {
    const [devices, setDevices] = useState<MedicalDevice[]>([
        { id: 'dev1', name: 'Dräger Evita V500', serialNumber: 'VENT-2044-X1', type: 'Ventilator', status: 'online', lastCalibration: '2026-04-15', location: 'ICU Bed 4' },
        { id: 'dev2', name: 'Mindray BeneVision N22', serialNumber: 'MON-2044-A2', type: 'Monitor', status: 'faulty', lastCalibration: '2026-03-20', location: 'ER Bay 2' },
        { id: 'dev3', name: 'Alaris CC Plus', serialNumber: 'PUMP-2044-B7', type: 'Infusion Pump', status: 'online', lastCalibration: '2026-04-01', location: 'Ward 4B' },
        { id: 'dev4', name: 'ZOLL R Series', serialNumber: 'DEFIB-2044-C9', type: 'Defibrillator', status: 'offline', lastCalibration: '2026-02-14', location: 'Emergency Cart 1' }
    ]);

    const [selectedDevice, setSelectedDevice] = useState<MedicalDevice | null>(null);
    const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
    const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
    const [isTesting, setIsTesting] = useState(false);

    const runSelfTest = () => {
        setIsTesting(true);
        setDiagnosticLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Initiating remote self-test via Bluetooth...`]);
        
        setTimeout(() => {
            setDiagnosticLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Checking CPU & Memory registers... OK`]);
        }, 1000);
        
        setTimeout(() => {
            setDiagnosticLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Verifying sensor calibration... FAULT DETECTED (O2 Sensor)`]);
            setIsTesting(false);
            toast.error("Diagnostic Fault Found", {
                description: "Device MON-2044-A2 reported O2 sensor misalignment."
            });
        }, 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
                        <Cpu className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Medical Device Registry</h3>
                </div>
                <div className="flex gap-2">
                    <Badge className="bg-emerald-50 text-emerald-600 font-black text-[10px] tracking-widest px-4 py-1.5 border-emerald-100">84% OPERATIONAL</Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {devices.map((dev) => (
                    <Card key={dev.id} className={`border-none shadow-sm rounded-3xl overflow-hidden transition-all ${dev.status === 'faulty' ? 'ring-2 ring-red-500 bg-red-50/10' : 'bg-white'}`}>
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dev.status === 'online' ? 'bg-emerald-500 text-white' : dev.status === 'faulty' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className={`text-[9px] font-black uppercase ${dev.status === 'online' ? 'text-emerald-600 border-emerald-200' : 'text-slate-400 border-slate-200'}`}>
                                        {dev.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{dev.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{dev.serialNumber}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Location: {dev.location}</p>
                                    <p className="text-[9px] font-black text-indigo-600 uppercase">Type: {dev.type}</p>
                                </div>
                                <Button 
                                    onClick={() => { setSelectedDevice(dev); setIsDiagnosticOpen(true); }}
                                    className="w-full rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest h-10"
                                >
                                    Remote Work
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDiagnosticOpen} onOpenChange={setIsDiagnosticOpen}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-slate-950 border-none rounded-[40px] shadow-2xl">
                    <div className="p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-cyan-600 flex items-center justify-center text-white shadow-xl shadow-cyan-900/20">
                                    <Terminal className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Remote Diagnostic Console</h3>
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Target: {selectedDevice?.serialNumber} • {selectedDevice?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Network Link</p>
                                    <div className="flex items-center gap-1">
                                        <Wifi className="h-4 w-4 text-emerald-400" />
                                        <Bluetooth className="h-4 w-4 text-emerald-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-4">
                                <div className="bg-black/40 rounded-[2rem] p-6 border border-white/5 font-mono text-[11px] h-[300px] overflow-y-auto custom-scrollbar">
                                    {diagnosticLogs.map((log, i) => (
                                        <p key={i} className={log.includes('FAULT') ? 'text-red-400' : 'text-cyan-400/80'}>{log}</p>
                                    ))}
                                    {isTesting && (
                                        <p className="text-white animate-pulse">Running analysis...</p>
                                    )}
                                    {diagnosticLogs.length === 0 && !isTesting && (
                                        <p className="text-white/20 italic">Ready for remote command execution.</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <Button onClick={runSelfTest} disabled={isTesting} className="h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black uppercase text-[10px] tracking-widest gap-2">
                                        <Play className="h-4 w-4" /> Run Self-Test
                                    </Button>
                                    <Button className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest gap-2 border border-white/10">
                                        <RefreshCw className="h-4 w-4" /> Calibrate
                                    </Button>
                                    <Button className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest gap-2 border border-white/10">
                                        <ShieldCheck className="h-4 w-4" /> Update Firmware
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <Video className="h-4 w-4" /> Ward Nurse Assistance
                                    </p>
                                    <Button variant="outline" className="w-full h-24 rounded-2xl border-2 border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest flex flex-col gap-2 hover:bg-white/10">
                                        <Video className="h-6 w-6 text-cyan-400" /> Join Live Camera
                                    </Button>
                                    <p className="text-[9px] text-white/30 font-medium leading-relaxed italic text-center px-4">
                                        Guided reset, battery-change, or positioning via live video link.
                                    </p>
                                </div>

                                <Card className="bg-indigo-600 border-none rounded-[2rem] overflow-hidden shadow-xl shadow-indigo-900/20">
                                    <CardContent className="p-6 space-y-3 text-white">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="h-4 w-4 text-white/60" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Predictive Status</p>
                                        </div>
                                        <p className="text-xs font-bold leading-relaxed">
                                            Usage patterns suggest battery depletion in ~8 days. Calibration scheduled for next week.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button variant="outline" onClick={() => setIsDiagnosticOpen(false)} className="flex-1 h-16 rounded-[2rem] border-2 border-white/10 text-white font-black uppercase text-xs tracking-widest hover:bg-white/5">Exit Console</Button>
                            <Button 
                                onClick={() => {
                                    toast.success("Maintenance Logged", { description: "Device status updated to ONLINE. Predictive cycle triggered." });
                                    setIsDiagnosticOpen(false);
                                }}
                                className="flex-[2] h-16 bg-white text-slate-900 hover:bg-slate-100 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-white/10"
                            >
                                <CheckCircle2 className="h-5 w-5 mr-2" /> Log Repair & Close Ticket
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
