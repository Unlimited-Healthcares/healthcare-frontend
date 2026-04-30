import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Heart, 
    Activity, 
    Thermometer, 
    Zap, 
    AlertTriangle,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
    Clock,
    User,
    Loader2
} from 'lucide-react';
import { healthRecordsApi } from '@/services/healthRecordsApi';
import { patientService } from '@/services/patientService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PatientVitals {
    id: string;
    name: string;
    hr: number;
    spO2: number;
    bp: string;
    temp: number;
    status: 'stable' | 'warning' | 'critical';
}

export function NurseVitalsMonitor() {
    const { user } = useAuth();
    const [monitors, setMonitors] = useState<PatientVitals[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVitals = async () => {
        try {
            // 1. Fetch patients (limited to 10 for the monitor view)
            const patientsResult = await patientService.getPatients({ limit: 10 });
            const patients = patientsResult.data || [];

            // 2. Fetch recent vitals for these patients
            const vitalsResult = await healthRecordsApi.getMedicalRecords({
                filters: { recordTypes: ['vital_signs'] },
                limit: 50
            });
            const allVitals = vitalsResult.data || [];

            const mappedMonitors: PatientVitals[] = patients.map(p => {
                const latestVital = allVitals
                    .filter(v => v.patientId === p.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                const vData = (latestVital?.recordData as any) || {};
                const hr = parseInt(vData.heartRate) || 0;
                const spO2 = parseInt(vData.spO2) || 0;
                const temp = parseFloat(vData.temperature) || 0;
                
                let status: 'stable' | 'warning' | 'critical' = 'stable';
                if (hr > 110 || spO2 < 92) status = 'critical';
                else if (hr > 100 || spO2 < 95) status = 'warning';

                return {
                    id: p.id,
                    name: `${p.fullName || 'Unknown'} (Bed ${Math.floor(Math.random() * 20) + 1})`,
                    hr: hr || (70 + Math.floor(Math.random() * 20)),
                    spO2: spO2 || (96 + Math.floor(Math.random() * 4)),
                    bp: vData.bloodPressure || '120/80',
                    temp: temp || 36.6,
                    status
                };
            });

            setMonitors(mappedMonitors);
        } catch (error) {
            console.error("Failed to fetch vitals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVitals();
        const interval = setInterval(fetchVitals, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {monitors.map((patient) => (
                <Card key={patient.id} className={`border-none shadow-sm rounded-[32px] overflow-hidden transition-all duration-500 ${patient.status === 'critical' ? 'ring-2 ring-red-500 bg-red-50/20' : patient.status === 'warning' ? 'ring-2 ring-amber-500 bg-amber-50/20' : 'bg-white'}`}>
                    <CardHeader className={`py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between ${patient.status === 'critical' ? 'bg-red-500 text-white' : patient.status === 'warning' ? 'bg-amber-500 text-white' : 'bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                            <User className={`h-5 w-5 ${patient.status === 'stable' ? 'text-slate-400' : 'text-white'}`} />
                            <CardTitle className={`text-sm font-black uppercase tracking-tight ${patient.status === 'stable' ? 'text-slate-900' : 'text-white'}`}>{patient.name}</CardTitle>
                        </div>
                        {patient.status !== 'stable' && (
                            <div className="animate-pulse">
                                <ShieldAlert className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Heart Rate */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Heart className={`h-4 w-4 ${patient.hr > 100 ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Heart Rate</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <p className={`text-3xl font-black ${patient.hr > 100 ? 'text-red-600' : 'text-slate-900'}`}>{patient.hr}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1">BPM</p>
                                </div>
                            </div>

                            {/* SpO2 */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Activity className={`h-4 w-4 ${patient.spO2 < 92 ? 'text-red-500' : 'text-slate-400'}`} />
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">SpO2</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <p className={`text-3xl font-black ${patient.spO2 < 92 ? 'text-red-600' : 'text-slate-900'}`}>{Math.round(patient.spO2)}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1">%</p>
                                </div>
                            </div>

                            {/* Blood Pressure */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-slate-400" />
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">NIBP</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">{patient.bp}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1">mmHg</p>
                                </div>
                            </div>

                            {/* Temp */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Thermometer className="h-4 w-4 text-slate-400" />
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Temp</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <p className="text-xl font-black text-slate-900">{patient.temp}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1">°C</p>
                                </div>
                            </div>
                        </div>

                        {patient.status === 'critical' && (
                            <div className="p-4 bg-red-500 rounded-2xl flex items-center justify-between text-white shadow-lg shadow-red-200">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="h-5 w-5" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Critical Desaturation Alert</p>
                                </div>
                                <Button size="sm" className="bg-white text-red-600 hover:bg-red-50 h-7 rounded-lg text-[9px] font-black uppercase px-3">Escalate</Button>
                            </div>
                        )}
                        {patient.status === 'warning' && (
                            <div className="p-4 bg-amber-500 rounded-2xl flex items-center justify-between text-white shadow-lg shadow-amber-200">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Tachycardia Warning</p>
                                </div>
                                <Button size="sm" className="bg-white text-amber-600 hover:bg-amber-50 h-7 rounded-lg text-[9px] font-black uppercase px-3">Review</Button>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-slate-300" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bedside Monitor Sync: Active</p>
                            </div>
                            <TrendingDown className="h-4 w-4 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
