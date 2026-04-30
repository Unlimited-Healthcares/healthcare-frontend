import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    ShieldCheck, 
    Lock, 
    UserCheck, 
    Eye, 
    AlertTriangle, 
    FileText, 
    Download, 
    ChevronRight,
    Search,
    History,
    Clock,
    CheckCircle2,
    XCircle,
    Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
    id: string;
    actor: string;
    action: string;
    target: string;
    status: 'AUTHORIZED' | 'UNAUTHORIZED';
    timestamp: string;
}

export function AdminComplianceAudit() {
    const [logs, setLogs] = useState<AuditLog[]>([
        { id: '1', actor: 'Dr. Sarah Chen', action: 'Accessed Patient Records', target: '#8821 (John Doe)', status: 'AUTHORIZED', timestamp: '2026-04-30 02:15:22' },
        { id: '2', actor: 'Unknown IP (192.168.1.4)', action: 'Failed Login Attempt', target: 'Mortuary DB', status: 'UNAUTHORIZED', timestamp: '2026-04-30 02:18:04' },
        { id: '3', actor: 'Elena Rodriguez', action: 'Updated Rehab Plan', target: '#8821 (John Doe)', status: 'AUTHORIZED', timestamp: '2026-04-30 02:22:45' },
        { id: '4', actor: 'Admin Michael', action: 'Revoked User Credentials', target: 'James Wilson', status: 'AUTHORIZED', timestamp: '2026-04-30 02:25:12' }
    ]);

    const handleGenerateReport = (standard: string) => {
        toast.success(`${standard} Report Generated`, {
            description: "Compliance audit successfully compiled in PDF/Excel format."
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Privacy & Compliance Sentinel</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cryptographic audit logs and regulatory compliance reporting</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl h-12 border-slate-200 font-bold text-xs gap-2">
                        <History className="h-4 w-4" /> View Full Archive
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* ISO Compliance HUD */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-none shadow-sm rounded-3xl bg-indigo-600 text-white p-6">
                            <p className="text-[10px] font-black uppercase text-indigo-200 tracking-widest mb-1">ISO 27001 Status</p>
                            <h4 className="text-2xl font-black">COMPLIANT</h4>
                            <div className="mt-4 flex items-center gap-2 text-indigo-100/60">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white">Cryptographic Hashing Active</span>
                            </div>
                        </Card>
                        <Card className="border-none shadow-sm rounded-3xl bg-white p-6 border-l-4 border-emerald-500">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Privacy Impact (PIA)</p>
                            <h4 className="text-2xl font-black text-slate-900">LOW RISK</h4>
                            <div className="mt-4 flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">MDT Module Validated</span>
                            </div>
                        </Card>
                        <Card className="border-none shadow-sm rounded-3xl bg-white p-6 border-l-4 border-amber-500">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Access Reviews</p>
                            <h4 className="text-2xl font-black text-slate-900">14 PENDING</h4>
                            <div className="mt-4 flex items-center gap-2 text-amber-600">
                                <Clock className="h-4 w-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Next MDT Review in 48h</span>
                            </div>
                        </Card>
                    </div>

                    <Card className="border-none shadow-premium rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-6 px-8">
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-tight">Immutable Audit Stream</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SHA-256 Hashed Event Log (ISO 27001 Clause 12.4.1)</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="bg-indigo-500/10 text-indigo-600 border-none font-black text-[9px] uppercase tracking-widest">TAMPER-PROOF</Badge>
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest">VERIFIED</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {logs.map((log) => (
                                    <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.status === 'AUTHORIZED' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>
                                                {log.status === 'AUTHORIZED' ? <UserCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{log.actor}</p>
                                                    <Badge variant="outline" className={`text-[7px] font-black uppercase ${log.status === 'AUTHORIZED' ? 'text-indigo-500 border-indigo-100' : 'text-rose-500 border-rose-100'}`}>
                                                        {log.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                    {log.action} → <span className="text-slate-600 font-black">{log.target}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="hidden lg:block text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[8px] font-mono text-slate-300">LOG HASH: 8f2b...c9d4</p>
                                                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Validated</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.timestamp}</p>
                                                <Button variant="ghost" className="text-[9px] font-black uppercase text-indigo-600 p-0 h-auto mt-1 flex items-center gap-1">
                                                    <Fingerprint className="h-3 w-3" /> Digital Sign-off
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Regulatory Exports */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-premium rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/5 py-8">
                            <CardTitle className="text-xl font-black uppercase tracking-tight">ISO Frameworks</CardTitle>
                            <CardDescription className="text-white/40 font-bold uppercase text-[9px] tracking-widest mt-1">Export ISO 27001/27701 compliant reports</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {[
                                { name: 'ISO 27001:2022', code: 'ISMS' },
                                { name: 'ISO 27701:2019', code: 'PIMS' },
                                { name: 'SOC2 Type II', code: 'USA' },
                                { name: 'GDPR / NDPR Audit', code: 'PRIVACY' }
                            ].map((standard, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight">{standard.name}</p>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{standard.code} Registry Alignment</p>
                                    </div>
                                    <Button 
                                        onClick={() => handleGenerateReport(standard.name)}
                                        className="h-10 w-10 p-0 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="p-8 bg-slate-800 rounded-[2.5rem] text-white border border-white/10 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                                <Lock className="h-5 w-5" />
                            </div>
                            <Badge className="bg-rose-500/10 text-rose-400 border-none font-black text-[8px] uppercase">Alert</Badge>
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-tight">Privileged Access Review</h4>
                        <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-widest">Manual review required for 2 new specialists added to the MDT Board this week.</p>
                        <Button className="w-full h-12 bg-white text-slate-900 hover:bg-indigo-50 rounded-xl font-black uppercase text-[10px] tracking-widest">
                            Run Review Workflow
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
