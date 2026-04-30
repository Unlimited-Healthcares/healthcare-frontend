import React, { useState, useEffect } from 'react';
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
    ArrowUpRight,
    ShieldAlert,
    Loader2
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
import { cn } from '@/lib/utils';
import { pharmacyService, InventoryItem } from '@/services/pharmacyService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function PharmacyInventoryHub() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const centerId = user?.centerId;

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await pharmacyService.getInventory(centerId);
            setInventory(data);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
            toast.error("Failed to sync inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (centerId) {
            fetchInventory();
        }
    }, [centerId]);

    const filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const chartData = filteredInventory.slice(0, 10).map(item => ({
        name: item.name,
        stock: item.stockLevel,
        status: item.status
    }));

    const lowStockCount = inventory.filter(i => i.status === 'low' || i.status === 'out_of_stock').length;

    const expiryAlerts = inventory
        .filter(i => i.expiryDate && new Date(i.expiryDate).getTime() < new Date().getTime() + (30 * 24 * 60 * 60 * 1000))
        .map(i => ({
            drug: i.name,
            batch: i.batchNumber || 'N/A',
            expiry: `${Math.ceil((new Date(i.expiryDate!).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))} Days`,
            color: new Date(i.expiryDate!).getTime() < new Date().getTime() + (7 * 24 * 60 * 60 * 1000) ? 'red' : 'amber'
        }));

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Inventory Stats and Safety */}
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
                        <CardContent className="p-8 relative min-h-[400px]">
                            {loading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
                                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronizing Vault...</p>
                                </div>
                            ) : null}
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                                            cursor={{ fill: '#f8fafc' }}
                                        />
                                        <Bar dataKey="stock" radius={[8, 8, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.status === 'low' ? '#ef4444' : '#6366f1'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Low Stock</p>
                                    <p className="text-2xl font-black text-red-700">{lowStockCount.toString().padStart(2, '0')}</p>
                                    <p className="text-[9px] font-bold text-red-400 mt-1 uppercase">Items below threshold</p>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">In-Transit</p>
                                    <p className="text-2xl font-black text-indigo-700">14</p>
                                    <p className="text-[9px] font-bold text-indigo-400 mt-1 uppercase">Scheduled deliveries</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total SKUs</p>
                                    <p className="text-xl font-black text-emerald-700 uppercase">{inventory.length}</p>
                                    <p className="text-[9px] font-bold text-emerald-400 mt-1 uppercase">Active inventory items</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-rose-500" /> Safety & Interaction Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1 space-y-4">
                                    <div className="p-6 bg-rose-50 rounded-[2.5rem] border border-rose-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-500">
                                            <AlertTriangle className="h-16 w-16" />
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <Badge className="bg-rose-500 text-white border-none font-black text-[8px] uppercase px-3 py-1">CRITICAL INTERACTION</Badge>
                                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Cross-Reference Active</span>
                                        </div>
                                        <h4 className="text-lg font-black text-rose-900 uppercase leading-tight">Warfarin + Aspirin Alert</h4>
                                        <p className="text-xs font-bold text-rose-700/70 mt-2">Extreme risk of major bleeding detected for Patient #8821 in Ward 4. System blocker active for this combination.</p>
                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Notify Prescriber</Button>
                                            <Button size="sm" variant="outline" className="border-rose-200 text-rose-600 rounded-xl font-black text-[9px] uppercase tracking-widest">View Alternatives</Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100">
                                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Look-Alike Alert</p>
                                            <p className="text-xs font-black text-amber-900 uppercase">Dopamine / Dobutamine</p>
                                            <p className="text-[9px] font-bold text-amber-500 mt-1 uppercase tracking-tight">Requires Double Sign-off</p>
                                        </div>
                                        <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
                                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Compliance Check</p>
                                            <p className="text-xs font-black text-indigo-900 uppercase">Narcotic Audit Sync</p>
                                            <p className="text-[9px] font-bold text-indigo-500 mt-1 uppercase tracking-tight">100% Verified Today</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-64 space-y-4">
                                    <div className="p-6 rounded-[2.5rem] bg-slate-900 text-white text-center">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Safety Score</p>
                                        <div className="relative inline-flex items-center justify-center">
                                            <svg className="w-32 h-32 transform -rotate-90">
                                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * 0.98} className="text-emerald-500" />
                                            </svg>
                                            <span className="absolute text-3xl font-black">98</span>
                                        </div>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4">Near-Zero Error Zone</p>
                                    </div>
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
