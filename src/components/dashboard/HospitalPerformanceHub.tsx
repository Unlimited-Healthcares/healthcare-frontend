import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Activity, 
    Hotel, 
    Truck, 
    Pill, 
    Cpu, 
    Users, 
    AlertTriangle, 
    TrendingUp, 
    TrendingDown,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    LineChart, 
    Line,
    Cell
} from 'recharts';

const performanceData = [
    { name: 'Mon', beds: 88, meds: 92, devices: 98 },
    { name: 'Tue', beds: 92, meds: 85, devices: 95 },
    { name: 'Wed', beds: 94, meds: 78, devices: 92 },
    { name: 'Thu', beds: 85, meds: 70, devices: 88 },
    { name: 'Fri', beds: 82, meds: 65, devices: 85 },
    { name: 'Sat', beds: 78, meds: 60, devices: 82 },
    { name: 'Sun', beds: 80, meds: 55, devices: 80 },
];

export function HospitalPerformanceHub() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Hospital Performance Engine</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Real-time resource allocation and clinical throughput metrics</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 font-black text-[10px] tracking-widest px-4 py-1.5 border-emerald-100 uppercase">SYSTEM OPTIMAL</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm rounded-[32px] p-6 bg-white overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                            <Hotel className="h-6 w-6" />
                        </div>
                        <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px]">94% FULL</Badge>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Bed Occupancy</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black">282/300</p>
                        <TrendingUp className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[94%] bg-rose-500 rounded-full" />
                    </div>
                    <p className="text-[9px] font-bold text-rose-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Critical threshold reached
                    </p>
                </Card>

                <Card className="border-none shadow-sm rounded-[32px] p-6 bg-white overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                            <Pill className="h-6 w-6" />
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px]">STABLE</Badge>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Pharmacy Stock</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black">82%</p>
                        <TrendingDown className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[82%] bg-emerald-500 rounded-full" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Global inventory index</p>
                </Card>

                <Card className="border-none shadow-sm rounded-[32px] p-6 bg-white overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                            <Cpu className="h-6 w-6" />
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px]">98% UPTIME</Badge>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Device Health</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black">4/521 Faulty</p>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[99%] bg-blue-500 rounded-full" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Fleet maintenance status</p>
                </Card>

                <Card className="border-none shadow-sm rounded-[32px] p-6 bg-slate-900 text-white overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-white/10 text-white">
                            <Users className="h-6 w-6" />
                        </div>
                        <Badge className="bg-indigo-500 text-white border-none font-black text-[9px]">TARGET MET</Badge>
                    </div>
                    <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-1">MDT Completion</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black">92%</p>
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[92%] bg-indigo-500 rounded-full" />
                    </div>
                    <p className="text-[9px] font-bold text-white/40 mt-2 uppercase tracking-widest">Inter-departmental sync</p>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-none shadow-premium rounded-[40px] overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Throughput Analysis</CardTitle>
                            <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">7-Day Resource Elasticity</CardDescription>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-[9px] font-black uppercase text-slate-400">Beds</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className="text-[9px] font-black uppercase text-slate-400">Meds</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar dataKey="beds" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="meds" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-premium rounded-[40px] overflow-hidden bg-slate-900 text-white">
                    <CardHeader className="p-8 border-b border-white/5">
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Active System Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {[
                                { title: 'Critical Bed Shortage', detail: 'Emergency Ward > 98%', color: 'rose' },
                                { title: 'Low Statin Inventory', detail: 'Pharmacy Central Feed', color: 'amber' },
                                { title: 'Device Outage', detail: 'Mindray Monitor (ICU-3)', color: 'rose' },
                                { title: 'MDT Lagging', detail: 'Oncology Board Review', color: 'blue' }
                            ].map((alert, i) => (
                                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl bg-${alert.color}-500/20 text-${alert.color}-400 flex items-center justify-center`}>
                                            <AlertCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight">{alert.title}</p>
                                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{alert.detail}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl text-white/20 group-hover:text-white group-hover:bg-white/10">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
