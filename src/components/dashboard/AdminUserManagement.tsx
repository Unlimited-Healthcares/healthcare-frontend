import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Users, 
    UserPlus, 
    Search, 
    Filter, 
    MoreVertical, 
    ShieldCheck, 
    ShieldAlert, 
    Ban,
    UserMinus,
    History,
    ChevronRight,
    CheckCircle2,
    Lock,
    Stethoscope,
    Activity,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface UserRole {
    id: string;
    name: string;
    role: string;
    status: 'ACTIVE' | 'INACTIVE';
    lastActive: string;
}

export function AdminUserManagement() {
    const [users, setUsers] = useState<UserRole[]>([
        { id: '1', name: 'Dr. Sarah Chen', role: 'Doctor (Cardiology)', status: 'ACTIVE', lastActive: '2 mins ago' },
        { id: '2', name: 'Elena Rodriguez', role: 'Physiotherapist', status: 'ACTIVE', lastActive: '10 mins ago' },
        { id: '3', name: 'James Wilson', role: 'Pharmacist', status: 'INACTIVE', lastActive: '2 days ago' },
        { id: '4', name: 'Admin Michael', role: 'Hospital Admin', status: 'ACTIVE', lastActive: 'Now' }
    ]);

    const handleDeactivate = (id: string) => {
        toast.warning("User Deactivated", {
            description: "Access credentials revoked. Audit log entry created."
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Access Control & Role Registry</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage global permissions for clinical and technical staff</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button className="flex-1 md:flex-none bg-slate-900 text-white rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest gap-2">
                        <UserPlus className="h-4 w-4" /> Provision New User
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="border-none shadow-premium rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search by name, role, or ID..." 
                                className="pl-12 h-12 rounded-2xl border-none bg-white shadow-sm font-bold"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="rounded-xl h-12 border-slate-100 font-bold text-xs gap-2">
                                <Filter className="h-4 w-4" /> Roles
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Personnel</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Designated Role</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Telemetry</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{u.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UID: {u.id}0024</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] uppercase tracking-widest px-3">
                                                    {u.role}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                        {u.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{u.lastActive}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                                                        <History className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleDeactivate(u.id)}
                                                        className="h-10 w-10 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600"
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                                                        <MoreVertical className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm rounded-[32px] p-6 bg-slate-900 text-white flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Active Sessions</p>
                            <p className="text-2xl font-black">242</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-indigo-400" />
                        </div>
                    </Card>
                    <Card className="border-none shadow-sm rounded-[32px] p-6 bg-white flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pending Onboarding</p>
                            <p className="text-2xl font-black">08</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-amber-500" />
                        </div>
                    </Card>
                    <Card className="border-none shadow-sm rounded-[32px] p-6 bg-white flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Admin Overrides</p>
                            <p className="text-2xl font-black">14</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-indigo-600" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
