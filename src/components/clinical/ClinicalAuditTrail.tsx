import React, { useState, useEffect } from 'react';
import { medicalReportsService } from '@/services/medicalReportsService';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, User, Eye, Download, Edit2, Printer, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface AuditLog {
    id: string;
    recordId: string;
    accessedByUser: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | any;
    accessType: string;
    accessedAt: string;
    ipAddress: string;
    userAgent: string;
    record?: {
        title: string;
    };
}

export function ClinicalAuditTrail() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const response = await medicalReportsService.getAuditLogs({
                    limit: 50
                });
                setLogs(response.data as any || []);
            } catch (error) {
                console.error('Failed to fetch audit logs', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'VIEW_RECORD': return <Eye className="h-4 w-4 text-blue-500" />;
            case 'DOWNLOAD_FILES': return <Download className="h-4 w-4 text-teal-500" />;
            case 'UPDATE_RECORD': return <Edit2 className="h-4 w-4 text-amber-500" />;
            case 'PRINT_RECORD': return <Printer className="h-4 w-4 text-slate-500" />;
            default: return <Shield className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActionBadge = (type: string) => {
        switch (type) {
            case 'VIEW_RECORD': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">View</Badge>;
            case 'DOWNLOAD_FILES': return <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-100">Download</Badge>;
            case 'UPDATE_RECORD': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">Edit</Badge>;
            case 'PRINT_RECORD': return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-100">Print</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <Card className="border-none shadow-soft rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight uppercase">Access Audit Trail</CardTitle>
                            <CardDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                                Comprehensive log of all clinical data operations
                            </CardDescription>
                        </div>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Filter by User or Record..."
                            className="pl-10 rounded-2xl border-slate-200 focus:ring-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-100 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-4 px-6">Timestamp</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-4 px-6">Practitioner / User</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-4 px-6">Action</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-4 px-6">Target Record</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-4 px-6">IP / Meta</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={5} className="py-8"><div className="h-4 bg-slate-100 rounded w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-xs font-bold">{format(new Date(log.accessedAt), 'MMM d, HH:mm')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <User className="h-3 w-3 text-slate-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900">{log.accessedByUser?.firstName || 'System'} {log.accessedByUser?.lastName || ''}</div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase">{log.accessedByUser?.email || 'AUDIT_INTERNAL'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {getActionIcon(log.accessType)}
                                                {getActionBadge(log.accessType)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="text-sm font-bold text-slate-700">{log.record?.title || 'Unknown Record'}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: {log.recordId}</div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="font-mono text-[10px] font-bold text-slate-500">{log.ipAddress}</div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center">
                                        <Shield className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No audit logs available</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
