import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CreditCard,
    DollarSign,
    TrendingUp,
    Settings,
    ShieldCheck,
    ArrowUpRight,
    History,
    AlertCircle,
    Globe,
    Wallet,
    Coins
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { adminService } from '@/services/adminService';

const AdminFinancePage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [commissionRate, setCommissionRate] = useState(15);
    const [financeStats, setFinanceStats] = useState({
        totalRevenue: 0,
        binanceTotal: 0,
        paystackTotal: 0,
        flutterwaveTotal: 0,
        platformFees: 0,
        activeSubaccounts: 0
    });

    const [ledger, setLedger] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, ledgerRes, configRes] = await Promise.all([
                    adminService.getFinanceStats(),
                    adminService.getGlobalLedger(10),
                    adminService.getConfiguration('global_commission_rate').catch(() => null)
                ]);

                if (statsRes.success) {
                    setFinanceStats(statsRes.data);
                }
                if (ledgerRes.success) {
                    setLedger(ledgerRes.data);
                }
                if (configRes?.success) {
                    setCommissionRate(configRes.data.configValue.rate || 15);
                }
            } catch (error) {
                console.error("Failed to fetch finance data:", error);
                toast.error("Cloud registry error: Could not synchronize financial ledger.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleUpdateCommission = async () => {
        toast.promise(
            adminService.updateConfiguration('global_commission_rate', {
                configValue: { rate: commissionRate },
                description: 'Global platform commission rate for all medical transactions'
            }),
            {
                loading: 'Synchronizing global rate with cloud ledger...',
                success: `Commission rate locked at ${commissionRate}% across all regions.`,
                error: 'Registry sync failed. Verify permissions.'
            }
        );
    };

    const handleRevokeKeys = () => {
        toast.error("Critical Security Action: You are about to revoke all platform payment keys. This will halt all transactions.", {
            action: {
                label: 'Confirm Revocation',
                onClick: async () => {
                    toast.promise(
                        adminService.updateConfiguration('halt_transactions', {
                            configValue: { enabled: true },
                            description: 'EMERGENCY HALT: Global payment keys revoked/halted'
                        }),
                        {
                            loading: 'Executing global key rotation and transaction halt...',
                            success: 'Platform transactions have been halted successfully.',
                            error: 'Failed to halt transactions. Verify admin permissions.'
                        }
                    );
                }
            },
            duration: 10000
        });
    };

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Finance <span className="text-blue-600">Control</span></h1>
                        <p className="text-gray-500 font-medium">Manage platform revenue, gateway keys, and splits.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-xl border-gray-200 shadow-sm font-bold bg-white">
                            <History className="w-4 h-4 mr-2" /> Global Ledger
                        </Button>
                        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20">
                            <DollarSign className="w-4 h-4 mr-2" /> Manual Payout
                        </Button>
                    </div>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-none shadow-premium bg-white">
                        <CardContent className="p-6">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Volume</p>
                            <h3 className="text-4xl font-black text-gray-900">${financeStats.totalRevenue.toLocaleString()}</h3>
                            <div className="flex items-center mt-2 text-emerald-600 font-bold text-xs">
                                <ArrowUpRight className="h-4 w-4 mr-1" /> +22.4% vs last month
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-premium bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <CardContent className="p-6">
                            <p className="text-xs font-black text-blue-100 uppercase tracking-widest mb-1">Total Commisions</p>
                            <h3 className="text-4xl font-black">${financeStats.platformFees.toLocaleString()}</h3>
                            <div className="flex items-center mt-2 text-white/60 font-medium text-xs">
                                Realized platform revenue
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-premium bg-white">
                        <CardContent className="p-6">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Binance Pay (Crypto)</p>
                            <h3 className="text-4xl font-black text-yellow-500">${financeStats.binanceTotal.toLocaleString()}</h3>
                            <div className="flex items-center mt-2 text-gray-500 font-medium text-xs">
                                <Globe className="h-3 w-3 mr-1" /> Worldwide settlement
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-premium bg-white">
                        <CardContent className="p-6">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Provider Subaccounts</p>
                            <h3 className="text-4xl font-black text-gray-900">{financeStats.activeSubaccounts}</h3>
                            <div className="flex items-center mt-2 text-blue-600 font-bold text-xs">
                                <ShieldCheck className="h-4 w-4 mr-1" /> All linked correctly
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Controls */}
                    <div className="lg:col-span-2 space-y-8">
                        <Tabs defaultValue="gateways">
                            <TabsList className="bg-gray-100 p-1 rounded-2xl w-full sm:w-auto h-auto">
                                <TabsTrigger value="gateways" className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Gateways</TabsTrigger>
                                <TabsTrigger value="commissions" className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Commissions</TabsTrigger>
                                <TabsTrigger value="ledgers" className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">Ledgers</TabsTrigger>
                            </TabsList>

                            <TabsContent value="gateways" className="mt-6 space-y-6">
                                <Card className="border-none shadow-premium bg-white">
                                    <CardHeader>
                                        <CardTitle>Global Gateway Keys</CardTitle>
                                        <CardDescription>These keys control the real-world flow of money into your master accounts.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-100 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Coins className="h-5 w-5 text-yellow-600" />
                                                    <span className="font-black text-gray-900 uppercase tracking-widest text-xs">Binance Pay (STABLE)</span>
                                                </div>
                                                <Badge className="bg-emerald-500 text-[10px] uppercase font-black px-3">Live</Badge>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400">Master API Key</Label>
                                                    <Input value="**************************" readOnly className="bg-white/50 border-gray-100 rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400">Webhook Status</Label>
                                                    <div className="h-10 border border-green-200 bg-green-50 rounded-xl flex items-center px-4 gap-2">
                                                        <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse" />
                                                        <span className="text-[10px] font-bold text-green-700">Healthy: Receiving Signals</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                                    <span className="font-black text-gray-900 uppercase tracking-widest text-xs">Paystack (NGN Core)</span>
                                                </div>
                                                <Badge className="bg-emerald-500 text-[10px] uppercase font-black px-3">Live</Badge>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400">Public Key</Label>
                                                    <Input value="pk_live_*******************" readOnly className="bg-white/50 border-gray-100 rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400">Default Currency</Label>
                                                    <Input value="NGN (Nigerian Naira)" readOnly className="bg-white/50 border-gray-100 rounded-xl" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="commissions" className="mt-6">
                                <Card className="border-none shadow-premium bg-white">
                                    <CardHeader>
                                        <CardTitle>Commission Logic</CardTitle>
                                        <CardDescription>Determine how much the platform earns from every healthcare transaction.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <div className="p-8 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 text-center space-y-6">
                                            <div className="mx-auto w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                                                <span className="text-4xl font-black text-blue-600">{commissionRate}%</span>
                                            </div>
                                            <div className="max-w-xs mx-auto space-y-4">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Global Referral Rate</Label>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="50"
                                                    value={commissionRate}
                                                    onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                                                    This rate applies to Consultations, Biotech orders, and Medical Requests.
                                                </p>
                                                <Button
                                                    onClick={handleUpdateCommission}
                                                    className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-bold"
                                                >
                                                    Update System Rate
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                                <h4 className="text-sm font-black text-blue-900">Patient Add-on Cost</h4>
                                                <p className="text-2xl font-black text-blue-600">+{commissionRate}%</p>
                                                <p className="text-[10px] text-blue-700/60 mt-1">Added to the provider's base price during checkout.</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                                <h4 className="text-sm font-black text-indigo-900">Provider Service Fee</h4>
                                                <p className="text-2xl font-black text-indigo-600">-{commissionRate}%</p>
                                                <p className="text-[10px] text-indigo-700/60 mt-1">Deducted from the base price before payout.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="ledgers" className="mt-6">
                                <Card className="border-none shadow-premium bg-white">
                                    <CardHeader>
                                        <CardTitle>Global Transaction Ledger</CardTitle>
                                        <CardDescription>Real-time stream of all financial movement across the cloud registry.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100 italic">
                                                        <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Type</th>
                                                        <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">User/Target</th>
                                                        <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Amount</th>
                                                        <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {ledger.length > 0 ? ledger.map((tx) => (
                                                        <tr key={tx.id} className="group hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                                                        tx.type === 'deposit' ? "bg-emerald-100 text-emerald-600" :
                                                                            tx.type === 'service_payment' ? "bg-blue-100 text-blue-600" :
                                                                                "bg-gray-100 text-gray-600"
                                                                    )}>
                                                                        {tx.type === 'deposit' ? <ArrowUpRight className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                                                    </div>
                                                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">{tx.type.replace('_', ' ')}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-black text-gray-900">{tx.wallet?.user?.name || 'System User'}</span>
                                                                    <span className="text-[10px] text-gray-400">{tx.wallet?.user?.email || 'ID: ' + tx.id.substring(0, 8)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 text-right">
                                                                <span className={cn(
                                                                    "text-xs font-black",
                                                                    tx.amount > 0 ? "text-emerald-600" : "text-gray-900"
                                                                )}>{tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} <span className="text-[10px] opacity-60">USD</span></span>
                                                            </td>
                                                            <td className="py-4 text-right">
                                                                <Badge variant="outline" className={cn(
                                                                    "text-[9px] uppercase font-black px-2 py-0",
                                                                    tx.status === 'success' ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-gray-200 bg-gray-50 text-gray-400"
                                                                )}>
                                                                    {tx.status}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={4} className="py-12 text-center">
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No recent ledger entries found</p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-premium bg-white overflow-hidden">
                            <CardHeader className="bg-gray-50 pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    <CardTitle className="text-lg">Security Monitor</CardTitle>
                                </div>
                                <CardDescription>Payment system integrity check.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">TLS 1.3 Encryption</span>
                                    <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 font-black text-[10px]">Active</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">PCI Compliance</span>
                                    <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 font-black text-[10px]">Certified</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">3D Secure 2.0</span>
                                    <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 font-black text-[10px]">Forced</Badge>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        onClick={handleRevokeKeys}
                                        variant="ghost"
                                        className="w-full justify-between text-rose-600 font-bold hover:bg-rose-50 rounded-xl h-12"
                                    >
                                        <AlertCircle className="w-4 h-4 mr-2" /> Revoke Global Keys
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-premium bg-slate-900 text-white p-2">
                            <CardContent className="p-6 space-y-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                                    <Settings className="h-6 w-6" />
                                </div>
                                <h4 className="text-lg font-black tracking-tight">Financial Auditing</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Every transaction is signed and immutable. You can export the full ledger for tax compliance at any time.
                                </p>
                                <Button className="w-full h-11 bg-white text-slate-900 hover:bg-slate-100 font-black uppercase text-[10px] tracking-widest rounded-xl">
                                    Download 2026 Audit
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminFinancePage;
