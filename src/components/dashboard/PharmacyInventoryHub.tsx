import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Package, 
    AlertTriangle, 
    Clock, 
    TrendingUp, 
    TrendingDown, 
    Plus,
    Search,
    Truck,
    Calendar,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';

const stockData = [
    { name: 'Amoxicillin', stock: 450, min: 100, status: 'ok' },
    { name: 'Insulin', stock: 12, min: 50, status: 'low' },
    { name: 'Warfarin', stock: 240, min: 50, status: 'ok' },
    { name: 'Paracetamol', stock: 1200, min: 200, status: 'ok' },
    { name: 'Ventolin', stock: 85, min: 100, status: 'low' }
];

export function PharmacyInventoryHub() {
    const [searchTerm, setSearchTerm] = useState('');

    const expiryAlerts = [
        { drug: 'Metformin 850mg', batch: 'BT-904', expiry: '15 Days', color: 'red' },
        { drug: 'Lisinopril 10mg', batch: 'BT-112', expiry: '34 Days', color: 'amber' }
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Inventory Stats */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-6">
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <Package className="h-4 w-4 text-indigo-500" /> Stock Level Analytics
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Inventory Monitoring</CardDescription>
                            </div>
                            <Button className="h-10 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest gap-2">
                                <Plus className="h-4 w-4" /> Add Batch
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stockData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                                            cursor={{ fill: '#f8fafc' }}
                                        />
                                        <Bar dataKey="stock" radius={[8, 8, 0, 0]}>
                                            {stockData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.status === 'low' ? '#ef4444' : '#6366f1'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Low Stock</p>
                                    <p className="text-2xl font-black text-red-700">02</p>
                                    <p className="text-[9px] font-bold text-red-400 mt-1 uppercase">Items below threshold</p>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">In-Transit</p>
                                    <p className="text-2xl font-black text-indigo-700">14</p>
                                    <p className="text-[9px] font-bold text-indigo-400 mt-1 uppercase">Scheduled deliveries</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Value</p>
                                    <p className="text-xl font-black text-emerald-700 uppercase">₦2.4M</p>
                                    <p className="text-[9px] font-bold text-emerald-400 mt-1 uppercase">Total inventory value</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Expiry & Supply Alerts */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/5 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-500" /> Expiry Watchlist
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {expiryAlerts.map((alert, i) => (
                                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight">{alert.drug}</p>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Batch {alert.batch}</p>
                                    </div>
                                    <Badge className={`${alert.color === 'red' ? 'bg-red-500' : 'bg-amber-500'} text-white font-black text-[9px] uppercase`}>
                                        {alert.expiry}
                                    </Badge>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-white/50 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 mt-2">View Expiry Audit Log</Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Truck className="h-4 w-4 text-indigo-500" /> Procurement Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {[
                                    { vendor: 'MegaPharm Ltd', status: 'In Transit', eta: '2h' },
                                    { vendor: 'SwissPharma', status: 'Pending Approval', eta: '1d' }
                                ].map((ship, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                            <Truck className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black uppercase text-slate-900">{ship.vendor}</p>
                                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{ship.status}</p>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">{ship.eta}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
