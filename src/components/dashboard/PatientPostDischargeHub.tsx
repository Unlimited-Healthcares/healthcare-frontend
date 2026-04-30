import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Home, 
    FileText, 
    Pill, 
    Calendar, 
    Video, 
    MessageSquare, 
    AlertTriangle, 
    MapPin, 
    Activity,
    Clock,
    Phone,
    ArrowRight,
    ChevronRight,
    ShieldAlert,
    UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

export function PatientPostDischargeHub() {
    const [activeTab, setActiveTab] = useState('summary');

    const handleSOS = () => {
        toast.error("EMERGENCY SOS ACTIVATED", {
            description: "Location & Medical Profile transmitted to nearest ambulance dispatch.",
            duration: 10000
        });
    };

    const handleTelehealth = (provider: string) => {
        toast.success(`Starting Telehealth Session: ${provider}`, {
            description: "Secure multi-person video link active (Patient + Family + Clinician)."
        });
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Active Episode Header */}
            <div className="p-8 bg-slate-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <Badge className="bg-emerald-500 text-white font-black text-[10px] tracking-widest px-4 py-1.5 border-none">ACTIVE EPISODE: RECOVERY</Badge>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Discharged: April 28, 2026</p>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Acute Myocardial Infarction</h2>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">Post-PCI Recovery Phase • Care Continuity active</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Clinic Visit</p>
                            <p className="text-xs font-black uppercase">May 15</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">INR Check</p>
                            <p className="text-xs font-black uppercase">May 07</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Daily Physio</p>
                            <p className="text-xs font-black uppercase">Active</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Med Sync</p>
                            <p className="text-xs font-black uppercase">Verified</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Main Content Area */}
                <div className="md:col-span-8 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-6 px-8">
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-tight">Your Care Plan</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Instructions from your clinical team</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Post-Discharge Medications</p>
                                    <Button variant="ghost" className="text-[9px] font-black uppercase text-indigo-600 p-0 h-auto">View Digital E-RX</Button>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Aspirin 75mg', freq: 'Daily (Morning)', status: 'Active' },
                                        { name: 'Ticagrelor 90mg', freq: 'Twice Daily', status: 'Active' }
                                    ].map((med, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                                                    <Pill className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase">{med.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.freq}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-white text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest">ON TRACK</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Urgent Warning Signs
                                </p>
                                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl space-y-3">
                                    <p className="text-xs font-bold text-red-700/80 leading-relaxed uppercase">
                                        Seek immediate help if you experience: Crushing chest pain, extreme shortness of breath, or excessive bleeding.
                                    </p>
                                    <Button variant="ghost" className="text-red-700 font-black text-[10px] uppercase tracking-widest p-0 h-auto gap-2">
                                        View Full Red-Flag Guide <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-32 rounded-[2rem] border-2 border-indigo-100 flex flex-col gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50">
                            <Video className="h-6 w-6 text-indigo-600" />
                            Telehealth Visit
                        </Button>
                        <Button variant="outline" className="h-32 rounded-[2rem] border-2 border-blue-100 flex flex-col gap-3 font-black uppercase text-[10px] tracking-widest hover:bg-blue-50">
                            <MessageSquare className="h-6 w-6 text-blue-600" />
                            Chat with Nurse
                        </Button>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="md:col-span-4 space-y-6">
                    <Button 
                        onClick={handleSOS}
                        className="w-full h-24 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] flex flex-col gap-2 font-black uppercase text-xs tracking-widest shadow-2xl shadow-red-200"
                    >
                        <ShieldAlert className="h-8 w-8 animate-pulse" />
                        EMERGENCY SOS
                    </Button>

                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-indigo-600 text-white">
                        <CardHeader className="border-b border-white/5 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Video className="h-4 w-4 text-indigo-300" /> Remote Consults
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {[
                                { provider: 'Dr. Sarah Chen', role: 'Cardiologist', time: 'Mon, 10:00 AM' },
                                { provider: 'Elena Rodriguez', role: 'Physio', time: 'Wed, 2:30 PM' }
                            ].map((visit, i) => (
                                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-black uppercase">{visit.provider}</p>
                                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{visit.role}</p>
                                        </div>
                                        <Badge className="bg-white text-indigo-600 text-[8px] font-black">{visit.time}</Badge>
                                    </div>
                                    <Button onClick={() => handleTelehealth(visit.provider)} className="w-full h-8 bg-white/10 hover:bg-white/20 text-white font-black text-[9px] uppercase tracking-widest rounded-lg">Join multi-person session</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-blue-500" /> Support Desk
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <UserCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase">Nurse Desk</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Side-effects & Vitals</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <Pill className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase">Pharmacy Desk</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Refills & Med Queries</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
