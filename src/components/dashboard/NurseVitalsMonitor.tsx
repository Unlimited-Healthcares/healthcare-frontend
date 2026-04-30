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
    User
} from 'lucide-react';

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
    const [monitors, setMonitors] = useState<PatientVitals[]>([
        { id: 'p1', name: 'John Doe (Bed 1)', hr: 112, spO2: 91, bp: '145/95', temp: 38.2, status: 'critical' },
        { id: 'p2', name: 'Jane Smith (Bed 4)', hr: 82, spO2: 98, bp: '120/80', temp: 36.8, status: 'stable' },
        { id: 'p3', name: 'Robert Brown (Bed 7)', hr: 95, spO2: 94, bp: '138/88', temp: 37.1, status: 'warning' }
    ]);

    // Simulate real-time monitoring
    useEffect(() => {
        const interval = setInterval(() => {
            setMonitors(prev => prev.map(m => {
                if (m.status === 'stable') return m;
                // Fluctuating vitals for warning/critical
                return {
                    ...m,
                    hr: m.hr + (Math.random() > 0.5 ? 1 : -1),
                    spO2: Math.min(100, m.spO2 + (Math.random() > 0.5 ? 0.1 : -0.1))
                };
            }));
        }, 2000);
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
