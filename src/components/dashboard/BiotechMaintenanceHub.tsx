import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Wrench,
    AlertTriangle, 
    Clock, 
    User, 
    Stethoscope, 
    CheckCircle2, 
    ArrowRight,
    Search,
    Filter,
    ShieldAlert,
    MessageSquare,
    Video
} from 'lucide-react';
import { toast } from 'sonner';
import { biotechService, MaintenanceTicket } from '@/services/biotechService';
import { useAuth } from '@/hooks/useAuth';

export function BiotechMaintenanceHub() {
    const { profile } = useAuth();
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                const data = await biotechService.getTickets((profile as any)?.centerId);
                setTickets(data);
            } catch (error) {
                console.error("Failed to fetch tickets:", error);
                toast.error("Failed to load maintenance tickets");
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [profile]);

    const handleAction = async (id: string, action: string) => {
        if (action === 'Resolve Report') {
            try {
                await biotechService.resolveTicket(id, 'resolved');
                setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
                toast.success("Ticket resolved successfully");
            } catch (error) {
                toast.error("Failed to resolve ticket");
            }
            return;
        }
        
        toast.info(`${action}: Ticket ${id}`, {
            description: "Synchronizing maintenance log across facility infrastructure."
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <Wrench className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Equipment Maintenance Hub</h3>
                </div>
                <div className="flex gap-2">
                    <Badge className="bg-red-50 text-red-600 font-black text-[10px] tracking-widest px-4 py-1.5 border-red-100">1 CRITICAL TICKET</Badge>
                </div>
            </div>

            <div className="grid gap-4">
                {tickets.map((ticket) => (
                    <Card key={ticket.id} className={`border-none shadow-sm rounded-3xl overflow-hidden transition-all ${ticket.priority === 'critical' ? 'bg-red-50/50 ring-1 ring-red-100' : 'bg-white'}`}>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ticket.priority === 'critical' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{ticket.equipment?.name || 'Unknown Device'}</p>
                                            <Badge variant="outline" className={`text-[9px] font-black uppercase ${ticket.priority === 'critical' ? 'text-red-600 border-red-200 bg-red-50' : 'text-slate-400 border-slate-200'}`}>
                                                {ticket.priority} Priority
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">“{ticket.issueDescription}”</p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <User className="h-3 w-3 text-slate-400" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ticket: {ticket.ticketNumber} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" onClick={() => handleAction(ticket.id, 'Joining Video Consult')} className="h-10 w-10 p-0 rounded-xl hover:bg-indigo-50 text-indigo-600">
                                        <Video className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" onClick={() => handleAction(ticket.id, 'Opening Chat')} className="h-10 w-10 p-0 rounded-xl hover:bg-indigo-50 text-indigo-600">
                                        <MessageSquare className="h-5 w-5" />
                                    </Button>
                                    <Button 
                                        onClick={() => handleAction(ticket.id, 'Resolve Report')}
                                        disabled={ticket.status === 'resolved'}
                                        className="rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest h-10 px-6"
                                    >
                                        {ticket.status === 'resolved' ? 'Resolved' : 'Resolve Report'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-indigo-600 text-white">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <h4 className="text-lg font-black uppercase tracking-tight">Predictive Maintenance Feed</h4>
                            <p className="text-xs font-bold text-indigo-100/70 uppercase tracking-widest">AI-Driven Equipment Lifecycle Forecast</p>
                        </div>
                        <Button className="rounded-xl bg-white text-indigo-600 font-black text-[10px] uppercase tracking-widest h-10 px-6">View Full Audit</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/50">Next Week</p>
                            <p className="text-sm font-bold">Calibration: Infusion Pump CC Plus (Ward 4)</p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/50">Urgent Requirement</p>
                            <p className="text-sm font-bold">Battery Replace: Defibrillator Cart 1 (ER)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
