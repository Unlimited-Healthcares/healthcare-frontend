import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    ShieldCheck,
    Activity,
    Settings,
    ArrowUpRight,
    ArrowDownRight,
    Lock,
    Unlock,
    Server,
    Zap,
    Terminal,
    DollarSign,
    CreditCard,
    TrendingUp,
    Globe,
    Search,
    Filter,
    RefreshCw,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Clock,
    UserCheck,
    Building2,
    Calendar,
    LayoutDashboard,
    Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const [summaryData] = await Promise.all([
                adminService.getDashboardSummary(),
                fetchMaintenanceStatus()
            ]);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to fetch admin summary:', error);
            toast.error('Failed to synchronize system metrics');
        } finally {
            setLoading(false);
        }
    };

    const fetchMaintenanceStatus = async () => {
        try {
            const res = await adminService.getMaintenanceMode();
            if (res.success) {
                setMaintenanceMode(res.data.enabled);
            }
        } catch (error) {
            console.error('Failed to fetch maintenance status:', error);
        }
    };

    useEffect(() => {
        fetchSummary();
        fetchMaintenanceStatus();
    }, []);

    const toggleMaintenanceMode = async () => {
        const newStatus = !maintenanceMode;
        toast.promise(
            adminService.updateMaintenanceMode(newStatus),
            {
                loading: `Transitioning system to ${newStatus ? 'MAINTENANCE' : 'LIVE'} mode...`,
                success: () => {
                    setMaintenanceMode(newStatus);
                    return `System state successfully transitioned to ${newStatus ? 'MAINTENANCE' : 'LIVE'}`;
                },
                error: "Cloud state transition failed. Registry remains locked."
            }
        );
    };

    if (loading && !summary) {
        return (
            <DashboardLayout>
                <div className="h-screen flex flex-col items-center justify-center space-y-4">
                    <div className="h-12 w-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Global Ledger</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-8 space-y-8 max-w-[1800px] mx-auto min-h-screen bg-slate-50/50">
                {/* System HUD */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-red-600 rounded-lg text-white">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">GLOBAL COMMAND CENTER</h1>
                        </div>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest pl-11">Real-time Platform Intelligence & Governance</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
                                <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Core Status: Healthy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <RefreshCw className={loading ? "h-3 w-3 animate-spin text-slate-400" : "h-3 w-3 text-slate-400 cursor-pointer"} onClick={fetchSummary} />
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Last Sync: Just now</span>
                            </div>
                        </div>

                        <Button
                            variant={maintenanceMode ? "destructive" : "outline"}
                            className="rounded-2xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-sm border-slate-200"
                            onClick={toggleMaintenanceMode}
                        >
                            {maintenanceMode ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            System Lock: {maintenanceMode ? "ON" : "OFF"}
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <TabsList className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm h-auto inline-flex overflow-x-auto max-w-full">
                            <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                                <LayoutDashboard className="h-4 w-4 mr-2" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="users" className="rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                                <Users className="h-4 w-4 mr-2" /> Users & Trust
                            </TabsTrigger>
                            <TabsTrigger value="revenue" className="rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                                <DollarSign className="h-4 w-4 mr-2" /> Global Ledger
                            </TabsTrigger>
                            <TabsTrigger value="system" className="rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                                <Zap className="h-4 w-4 mr-2" /> Infra & Audit
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                                <Download className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                                <Filter className="h-4 w-4 text-slate-500" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Dynamic Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "Total Platform Users", value: summary?.totalUsers || 0, sub: "Synchronized Registry", icon: Users, color: "bg-blue-600", trend: "+12%" },
                                { title: "Medical Centers", value: summary?.totalCenters || 0, sub: "Verified Facilities", icon: Building2, color: "bg-indigo-600", trend: "+4" },
                                { title: "Account Verifications", value: summary?.pendingVerifications || 0, sub: "Pending Manual Review", icon: UserCheck, color: "bg-amber-600", trend: "Urgent", alert: true },
                                { title: "Platform Utilization", value: `${summary?.appointments?.total || 0}`, sub: "Total Medical Orders", icon: Activity, color: "bg-emerald-600", trend: "+25%" }
                            ].map((stat, i) => (
                                <Card key={i} className="border-none shadow-premium bg-white group hover:shadow-2xl transition-all duration-500 rounded-[32px] overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg shadow-${stat.color.split("-")[1]}-200`}>
                                                <stat.icon className="h-6 w-6" />
                                            </div>
                                            {stat.alert ? (
                                                <Badge className="bg-red-50 text-red-600 border-none px-3 py-1 rounded-full text-[10px] font-black animate-pulse">ACTION REQUIRED</Badge>
                                            ) : (
                                                <div className="flex items-center text-emerald-600 font-black text-[10px]">
                                                    <ArrowUpRight className="h-3 w-3 mr-1" /> {stat.trend}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value.toLocaleString()}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.title}</p>
                                        <p className="text-[9px] text-slate-300 font-bold uppercase mt-2">{stat.sub}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Integration of the main AdminDashboard component for real tables and granular charts */}
                        <AdminDashboard />
                    </TabsContent>

                    <TabsContent value="users" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* This will show User Management specifically if we want a separate view, but AdminDashboard handles it well */}
                        <div className="bg-white p-12 rounded-[40px] border border-slate-200 text-center space-y-4">
                            <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Users className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Accessing User Governance Vault</h2>
                            <p className="text-slate-500 max-w-md mx-auto font-medium">Use the User Directory below to manage platform participants, adjust roles, and enforce security protocols.</p>
                        </div>
                        <AdminDashboard />
                    </TabsContent>

                    <TabsContent value="revenue" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 border-none shadow-premium bg-white rounded-[40px] overflow-hidden">
                                <CardHeader className="p-10 pb-0">
                                    <CardTitle className="text-2xl font-black">REVENUE SETTLEMENT ANALYTICS</CardTitle>
                                    <div className="flex gap-4 mt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Commission</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-indigo-500" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gross Volume</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 pt-6">
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={summary?.charts?.revenueData || []}>
                                                <defs>
                                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                                                />
                                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#revenueGrad)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-premium bg-slate-900 text-white rounded-[40px] overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                                    <DollarSign className="h-64 w-64 rotate-12" />
                                </div>
                                <CardContent className="p-10 h-full flex flex-col justify-between relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-teal-400 font-black text-[10px] uppercase tracking-[0.3em]">Institutional Liquidity</p>
                                        <h3 className="text-4xl font-black">PLATFORM WALLET</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total USDT Balance</p>
                                            <h4 className="text-5xl font-black text-white tracking-tighter">$0.00</h4>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Binance Pay</p>
                                                <p className="text-lg font-black">$0.00</p>
                                            </div>
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Paystack</p>
                                                <p className="text-lg font-black">₦0.00</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full h-16 rounded-3xl bg-teal-500 hover:bg-teal-400 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-teal-500/20 mt-8">
                                        Settle Merchant Payouts
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Audit Log Component can go here */}
                        <div className="bg-white p-12 rounded-[40px] border border-slate-200 text-center">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">PLATFORM AUDIT LOGS</h2>
                            <p className="text-slate-500 font-medium mb-8">Access the granular event stream for all administrative and user-initiated state changes.</p>
                            <Button onClick={() => navigate('/admin/audit')} className="rounded-2xl h-14 px-8 bg-slate-900 text-white font-black uppercase tracking-widest text-xs">
                                View Full Security Audit
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboardPage;

