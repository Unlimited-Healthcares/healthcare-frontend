import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Download, 
    Printer, 
    ShieldCheck, 
    Clock, 
    User,
    CheckCircle2,
    Stamp,
    Fingerprint,
    Share2,
    ArrowDownToLine
} from 'lucide-react';
import { toast } from 'sonner';

export function DigitalDeathCertificate({ record }: { record: any }) {
    const handleDownload = () => {
        toast.success("Certificate Downloaded", {
            description: "Digital Death Certificate (Verified/Signed) saved to your device."
        });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <Card className="border-none shadow-premium rounded-[40px] overflow-hidden bg-white relative">
                {/* Visual Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                    <ShieldCheck className="w-[400px] h-[400px]" />
                </div>

                <CardHeader className="bg-slate-900 text-white p-10 text-center relative z-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 backdrop-blur-xl">
                            <FileText className="h-8 w-8" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Digital Death Certificate</CardTitle>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">Health Authority Verified • Document ID: {record.id.toUpperCase()}</p>
                </CardHeader>

                <CardContent className="p-12 space-y-10 relative z-10">
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject Name</p>
                                <p className="text-lg font-black uppercase text-slate-900">{record.deceasedName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Cessation</p>
                                <p className="text-lg font-black uppercase text-slate-900">{record.intakeDate}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Verification Signatures</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Fingerprint className="h-4 w-4 text-emerald-500" />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-900 uppercase">Dr. James Wilson</p>
                                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Verified Intensivist</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Fingerprint className="h-4 w-4 text-emerald-500" />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-900 uppercase">Dr. Elena Rodriguez</p>
                                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Verifying Specialist</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 text-center space-y-4">
                        <Stamp className="h-8 w-8 text-indigo-600 mx-auto opacity-40" />
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Official Electronic Seal</p>
                        <p className="text-[9px] font-bold text-indigo-400 leading-relaxed max-w-xs mx-auto">This document is cryptographically co-signed by two independent clinical practitioners and is legally valid for all registry purposes.</p>
                    </div>

                    <div className="flex gap-4">
                        <Button 
                            onClick={handleDownload}
                            className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-100 gap-3"
                        >
                            <ArrowDownToLine className="h-5 w-5" /> Download Digital PDF
                        </Button>
                        <Button variant="outline" className="h-14 w-14 rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-indigo-600">
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" className="h-14 w-14 rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-indigo-600">
                            <Printer className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
