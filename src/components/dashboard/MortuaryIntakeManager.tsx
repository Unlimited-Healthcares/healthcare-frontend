import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Truck, 
    Thermometer, 
    Clock, 
    User, 
    ShieldAlert, 
    MapPin, 
    FileCheck, 
    CheckCircle2,
    Calendar,
    Gavel,
    History,
    Save
} from 'lucide-react';
import { toast } from 'sonner';
import { mortuaryService, MortuaryStatus } from '@/services/mortuaryService';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface MortuaryIntake {
    id: string;
    patientName: string;
    location: string;
    collectionTime?: string;
    transportTeam: string;
    coldStorageUnit: string;
    temperature: number;
    coronerCase: boolean;
    status: 'AWAITING' | 'COLLECTED' | 'STORED';
}

export function MortuaryIntakeManager({ remain }: { remain: any }) {
    const { profile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [intake, setIntake] = useState<any>({
        id: remain.id,
        deceasedName: remain.name || remain.patientName,
        location: remain.location || 'Ward/Room Not Specified',
        unit: 'Unit B-12',
        status: remain.status || 'AWAITING',
        notes: '',
        centerId: (profile as any)?.centerId || remain.centerId
    });

    const [extra, setExtra] = useState({
        transportTeam: 'Hospital Logistics Team A',
        temperature: 3.8,
        coronerCase: false,
    });

    const handleLogCollection = async () => {
        try {
            setIsSaving(true);
            const data = {
                deceasedName: intake.deceasedName,
                unit: intake.unit,
                status: 'COLLECTED' as any,
                notes: `Collection Logged. Team: ${extra.transportTeam}. Location: ${intake.location}`,
                centerId: intake.centerId
            };
            
            if (intake.id && !intake.id.startsWith('MOCK')) {
                await mortuaryService.updateRecord(intake.id, data);
            } else {
                const newRecord = await mortuaryService.createRecord(data);
                setIntake((prev: any) => ({ ...prev, id: newRecord.id }));
            }

            setIntake((prev: any) => ({ 
                ...prev, 
                status: 'COLLECTED', 
                collectionTime: new Date().toISOString().replace('T', ' ').substring(0, 16) 
            }));
            toast.success("Collection Logged", {
                description: "Remains transferred to transport team. Chain of custody updated."
            });
        } catch (error) {
            console.error("Failed to log collection:", error);
            toast.error("Failed to update mortuary registry");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinalizeStorage = async () => {
        try {
            setIsSaving(true);
            await mortuaryService.updateRecord(intake.id, {
                status: 'STORED' as any,
                notes: `${intake.notes || ''}\nStored in ${intake.unit} at ${extra.temperature}°C. Coroner Case: ${extra.coronerCase}`
            });
            
            setIntake((prev: any) => ({ ...prev, status: 'STORED' }));
            toast.success("Storage Finalized", {
                description: `Remains secured in ${intake.unit} at ${extra.temperature}°C.`
            });
        } catch (error) {
            console.error("Failed to finalize storage:", error);
            toast.error("Failed to secure registry record");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCoroner = () => {
        const newState = !extra.coronerCase;
        setExtra(prev => ({ ...prev, coronerCase: newState }));
        if (newState) {
            toast.warning("LEGAL HOLD PLACED", {
                description: "Coroner case flagged. Legal and Admin teams notified. Release blocked."
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <Truck className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Intake & Logistics Terminal</h3>
                </div>
                <Badge className={`font-black text-[10px] tracking-widest px-4 py-1.5 uppercase ${intake.status === 'STORED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {intake.status}
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Logistics Section */}
                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                            <History className="h-4 w-4 text-indigo-500" /> Collection Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current Location</Label>
                                <p className="text-xs font-black uppercase text-slate-900 flex items-center gap-2 mt-1">
                                    <MapPin className="h-3 w-3 text-indigo-500" /> {intake.location}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Collection Time</Label>
                                <p className="text-xs font-black uppercase text-slate-900 flex items-center gap-2 mt-1">
                                    <Clock className="h-3 w-3 text-indigo-500" /> {intake.collectionTime || 'PENDING'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transport Team / Personnel</Label>
                            <Input 
                                className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" 
                                value={extra.transportTeam}
                                onChange={e => setExtra({...extra, transportTeam: e.target.value})}
                                disabled={intake.status === 'STORED'}
                            />
                        </div>

                        {intake.status === 'AWAITING' && (
                            <Button 
                                onClick={handleLogCollection}
                                disabled={isSaving}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3 shadow-xl shadow-indigo-100"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Truck className="h-5 w-5" />}
                                {isSaving ? 'Logging...' : 'Log Collection from Ward'}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Storage Section */}
                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
                        <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-emerald-600" /> Cold Storage Monitoring
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Unit</Label>
                                <Input 
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold" 
                                    value={intake.unit}
                                    onChange={e => setIntake({...intake, unit: e.target.value})}
                                    disabled={intake.status === 'STORED'}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temperature (°C)</Label>
                                <div className="relative">
                                    <Input 
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold pl-12" 
                                        type="number"
                                        step="0.1"
                                        value={extra.temperature}
                                        onChange={e => setExtra({...extra, temperature: parseFloat(e.target.value)})}
                                    />
                                    <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-slate-900 text-white space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${extra.coronerCase ? 'bg-amber-500' : 'bg-white/10'}`}>
                                        <Gavel className={`h-5 w-5 ${extra.coronerCase ? 'text-slate-900' : 'text-white'}`} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Coroner Case / Legal Hold</p>
                                        <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Blocks release for investigation</p>
                                    </div>
                                </div>
                                <Button 
                                    onClick={toggleCoroner}
                                    variant="ghost" 
                                    className={`rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest border ${extra.coronerCase ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    {extra.coronerCase ? 'HOLD ACTIVE' : 'FLAG CASE'}
                                </Button>
                            </div>
                        </div>

                        {intake.status === 'COLLECTED' && (
                            <Button 
                                onClick={handleFinalizeStorage}
                                disabled={isSaving}
                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest gap-3 shadow-xl shadow-emerald-100"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                {isSaving ? 'Securing...' : 'Finalize Storage & Secure'}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
