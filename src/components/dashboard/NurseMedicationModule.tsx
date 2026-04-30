import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Pill, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    User, 
    ShieldCheck, 
    AlertTriangle,
    Info,
    ChevronRight,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MedicationTask {
    id: string;
    patientName: string;
    drugName: string;
    dose: string;
    time: string;
    route: string;
    status: 'pending' | 'given' | 'refused';
}

import { pharmacyService } from '@/services/pharmacyService';
import { careTaskService } from '@/services/careTaskService';
import { useAuth } from '@/hooks/useAuth';

export function NurseMedicationModule() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<MedicationTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<MedicationTask | null>(null);
    const [verification, setVerification] = useState({
        nameMatch: false,
        doseMatch: false,
        timeMatch: false,
        routeMatch: false
    });

    const fetchMedications = async () => {
        try {
            setLoading(true);
            const response = await pharmacyService.getPendingPrescriptions();
            const data = Array.isArray(response) ? response : [];
            
            const mapped: MedicationTask[] = data.map((rx: any) => ({
                id: rx.id,
                patientName: rx.patient?.profile?.displayName || rx.patient?.name || 'Unknown Patient',
                drugName: rx.medication || rx.drugName || 'N/A',
                dose: rx.dosage || 'As directed',
                time: rx.frequency || 'Scheduled',
                route: rx.route || 'Oral',
                status: rx.administrationStatus || 'pending'
            }));
            setTasks(mapped);
        } catch (error) {
            console.error('Failed to fetch medications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedications();
    }, []);

    const handleAdminister = async (status: 'given' | 'refused') => {
        if (status === 'given' && !Object.values(verification).every(v => v)) {
            toast.error("Safety Validation Required", {
                description: "All 5 Rights (Patient, Drug, Dose, Route, Time) must be verified before administration."
            });
            return;
        }

        try {
            // Log as a care task or update prescription status
            await careTaskService.createCareTask({
                patientId: (selectedTask as any).patientId, 
                title: `Medication Admin: ${selectedTask?.drugName}`,
                description: `${status.toUpperCase()} - Dose: ${selectedTask?.dose}, Route: ${selectedTask?.route}`,
                priority: 'medium',
                type: 'medication',
                metadata: { status }
            } as any);

            setTasks(prev => prev.map(t => t.id === selectedTask?.id ? { ...t, status } : t));
            toast.success(status === 'given' ? "Medication Logged: GIVEN" : "Medication Logged: REFUSED", {
                description: `Patient: ${selectedTask?.patientName} • Nurse ID: RN-2044 • ${new Date().toLocaleTimeString()}`
            });
            setSelectedTask(null);
            setVerification({ nameMatch: false, doseMatch: false, timeMatch: false, routeMatch: false });
            fetchMedications(); // Refresh queue
        } catch (error) {
            console.error("Failed to log medication administration:", error);
            toast.error("Failed to log administration");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                        <Loader2 className="h-10 w-10 text-teal-600 animate-spin mb-4" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Pharmacy Vault...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                        <Pill className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-lg font-black text-slate-400 uppercase tracking-tight">All Medications Administered</p>
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">Medication queue for this shift is clear.</p>
                    </div>
                ) : tasks.map((task) => (
                    <Card key={task.id} className={`border-none shadow-sm rounded-3xl overflow-hidden ${task.status === 'given' ? 'bg-emerald-50/50' : task.status === 'refused' ? 'bg-red-50/50' : 'bg-white'}`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${task.status === 'given' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Pill className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{task.drugName}</p>
                                            <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200">{task.route}</Badge>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{task.patientName} • {task.dose} • {task.time}</p>
                                    </div>
                                </div>
                                {task.status === 'pending' ? (
                                    <Button 
                                        onClick={() => setSelectedTask(task)}
                                        className="rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest h-10 px-6"
                                    >
                                        Administer
                                    </Button>
                                ) : (
                                    <Badge className={`${task.status === 'given' ? 'bg-emerald-500' : 'bg-red-500'} text-white font-black uppercase text-[10px] tracking-widest px-4 py-1.5`}>
                                        {task.status}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                <DialogContent className="max-w-md p-0 overflow-hidden bg-white border-none rounded-[40px] shadow-2xl">
                    <div className="bg-slate-900 p-8 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-teal-400">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <Badge className="bg-teal-500 text-white font-black text-[10px] tracking-widest">SAFETY SCAN</Badge>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Medication Validation</h3>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">NURSE ID: RN-2044 • UNIT 4</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-3">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prescribed Drug</p>
                                <p className="text-lg font-black text-slate-900 uppercase">{selectedTask?.drugName}</p>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{selectedTask?.dose} • {selectedTask?.route} • Due @ {selectedTask?.time}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">5 Rights Verification</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: 'nameMatch', label: 'Right Drug' },
                                    { key: 'doseMatch', label: 'Right Dose' },
                                    { key: 'timeMatch', label: 'Right Time' },
                                    { key: 'routeMatch', label: 'Right Route' }
                                ].map((item) => (
                                    <Button
                                        key={item.key}
                                        variant="outline"
                                        onClick={() => setVerification(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof verification] }))}
                                        className={`h-14 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest gap-2 ${verification[item.key as keyof typeof verification] ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >
                                        <CheckCircle2 className={`h-4 w-4 ${verification[item.key as keyof typeof verification] ? 'text-teal-500' : 'text-slate-200'}`} /> {item.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => handleAdminister('refused')}
                                className="flex-1 h-14 rounded-2xl border-2 border-red-100 text-red-600 font-black uppercase text-xs tracking-widest gap-2"
                            >
                                <XCircle className="h-4 w-4" /> Refused
                            </Button>
                            <Button 
                                onClick={() => handleAdminister('given')}
                                className="flex-[2] h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-teal-100 gap-2"
                            >
                                <CheckCircle2 className="h-5 w-5" /> Administer & Log
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
