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
                {/* Audit Logs */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-none shadow-premium rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-6 px-8">
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-tight">Live Event Stream</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time monitoring of all authorized and blocked actions</CardDescription>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest">ENCRYPTED LOGS</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {logs.map((log) => (
                                    <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.status === 'AUTHORIZED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>
                                                {log.status === 'AUTHORIZED' ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{log.actor}</p>
                                                    <Badge variant="outline" className={`text-[7px] font-black uppercase ${log.status === 'AUTHORIZED' ? 'text-emerald-500 border-emerald-100' : 'text-rose-500 border-rose-100'}`}>
                                                        {log.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                    {log.action} → <span className="text-slate-600">{log.target}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.timestamp}</p>
                                            <Button variant="ghost" className="text-[9px] font-black uppercase text-indigo-600 p-0 h-auto mt-1">Inspect Raw JSON</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Compliance Reporting */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-premium rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/5 py-8">
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Regulatory Exports</CardTitle>
                            <CardDescription className="text-white/40 font-bold uppercase text-[9px] tracking-widest mt-1">Generate validated compliance reports</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {[
                                { name: 'HIPAA / HITECH', code: 'USA' },
                                { name: 'GDPR Article 32', code: 'EU' },
                                { name: 'NHREC Standard', code: 'NGR' },
                                { name: 'NDPR Compliance', code: 'NGR' }
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

                    <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-indigo-100">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Fingerprint className="h-6 w-6" />
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-tight leading-tight">Mortuary Access Audit</h4>
                        <p className="text-xs font-bold text-indigo-100/60 leading-relaxed uppercase">Biometric verified access for remains management is logged independently to prevent unauthorized entry.</p>
                        <Button className="w-full h-12 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-700/20">
                            Review Mortuary Logs
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
