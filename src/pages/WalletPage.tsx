import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import {
  CreditCard,
  Plus,
  History,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  PiggyBank,
  Settings,
  ShieldCheck,
  Lock,
  Zap,
  Bell,
  FileText,
  Building,
  Mail,
  ChevronRight,
  Globe,
  Info,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { walletApi } from '@/services/walletApi';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { USD_TO_NGN_RATE } from '@/constants/services';

export default function WalletPage() {
  const [balance, setBalance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [minTopUp, setMinTopUp] = useState(25);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [referenceCurrency, setReferenceCurrency] = useState('NGN');

  // Continuity Settings
  const [autoRecharge, setAutoRecharge] = useState(false);
  const [rechargeThreshold, setRechargeThreshold] = useState(10);
  const [rechargeAmount, setRechargeAmount] = useState(50);
  const [monthlyLimit, setMonthlyLimit] = useState(500);
  const [paymentProvider, setPaymentProvider] = useState<'paystack' | 'flutterwave' | 'binance'>('paystack');

  // Notification Settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [alertThresholds, setAlertThresholds] = useState<number[]>([10, 5, 2]);
  const [billingEmail, setBillingEmail] = useState('');

  // Billing Profile
  const [billingProfile, setBillingProfile] = useState({
    companyName: '',
    address: '',
    taxId: '',
  });

  const getCurrencySymbol = (curr: string) => {
    switch (curr?.toUpperCase()) {
      case 'NGN': return '₦';
      case 'GHS': return 'GH₵';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'KES': return 'KSh';
      case 'ZAR': return 'R';
      default: return '$';
    }
  };

  // Reactive conversion helper for the settings view
  const handleCurrencySwitch = (newCurr: string) => {
    if (newCurr === selectedCurrency) return;

    // Determine conversion factor
    let factor = 1;
    if (selectedCurrency === 'USD' && newCurr === 'NGN') factor = USD_TO_NGN_RATE;
    else if (selectedCurrency === 'NGN' && newCurr === 'USD') factor = 1 / USD_TO_NGN_RATE;

    // Update all relevant numeric states immediately for a "Live" feel
    setRechargeAmount(prev => Math.round(prev * factor));
    rechargeThreshold && setRechargeThreshold(prev => Math.round(prev * factor));
    monthlyLimit && setMonthlyLimit(prev => Math.round(prev * factor));
    setMinTopUp(prev => Math.round(prev * factor));
    setAlertThresholds(prev => prev.map(t => Math.round(t * factor)));

    setSelectedCurrency(newCurr);
    toast.success(`View context switched to ${newCurr}`, {
      icon: '🔄',
      style: { borderRadius: '1rem', fontWeight: 'bold' }
    });
  };

  useEffect(() => {
    // Keep minTopUp within reasonable bounds of the current unit scale
    const usdBases = [25, 50, 100, 250];
    const options = selectedCurrency === 'NGN' ? usdBases.map(a => Math.round(a * USD_TO_NGN_RATE)) : usdBases;
    // (Optional logic to snap to closest option if desired)
  }, [selectedCurrency]);

  useEffect(() => {
    loadWalletData();

    // Check for payment verification or cancellation in URL
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    const status = params.get('status');
    const cancelled = params.get('cancelled');

    if (status === 'cancelled' || cancelled === 'true') {
      toast.error('Deposit was cancelled. No charges were made.');
      window.history.replaceState({}, document.title, "/wallet");
      return;
    }

    if (reference) {
      verifyPayment(reference);
    }
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        walletApi.getBalance(),
        walletApi.getHistory()
      ]);
      setBalance(balanceRes);
      setHistory(historyRes);

      // Sync local settings state with backend data
      if (balanceRes.currency) {
        setSelectedCurrency(balanceRes.currency);
      }
      if (balanceRes.minimumTopUpAmount) {
        setMinTopUp(balanceRes.minimumTopUpAmount);
      }

      // Sync Continuity Settings from Backend
      setAutoRecharge(balanceRes.isAutoTopUpEnabled || false);
      if (balanceRes.rechargeThreshold !== undefined) setRechargeThreshold(Number(balanceRes.rechargeThreshold));
      if (balanceRes.rechargeAmount !== undefined) setRechargeAmount(Number(balanceRes.rechargeAmount));
      if (balanceRes.monthlySpendMax !== undefined) setMonthlyLimit(Number(balanceRes.monthlySpendMax));

      if (!balanceRes.isActivated) {
        setShowActivationModal(true);
      } else if (!balanceRes.onboardingComplete) {
        setShowSetupModal(true);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      toast.loading('Verifying your deposit...', { id: 'verify' });
      await walletApi.verifyDeposit(reference);
      toast.success('Wallet funded successfully!', { id: 'verify' });
      // Remove query params
      window.history.replaceState({}, document.title, "/wallet");
      loadWalletData();
    } catch (error) {
      toast.error('Payment verification failed', { id: 'verify' });
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    let depositToast = '';
    try {
      setIsDepositing(true);
      depositToast = toast.loading(`Initializing secure ${paymentProvider} deposit...`);
      const isApp = Capacitor.isNativePlatform();
      // On mobile, use a clean production URL that the live app already understands
      const callbackUrl = isApp
        ? 'https://unlimitedhealthcares.com/wallet'
        : window.location.origin + '/wallet';
      const response = await walletApi.initializeDeposit(amount, callbackUrl, paymentProvider);

      const authUrl = response?.authorization_url || response?.data?.authorization_url;
      if (authUrl) {
        toast.success('Redirecting to gateway...', {
          id: depositToast,
          duration: 3000
        });
        window.location.href = authUrl;
      } else {
        toast.error('Gateway URL not found in response', { id: depositToast });
        setIsDepositing(false);
      }
    } catch (error: any) {
      console.error('Deposit Error:', error);
      const errorMsg = error.data?.message || error.message || 'Failed to initialize deposit';
      if (depositToast) {
        toast.error(errorMsg, { id: depositToast });
      } else {
        toast.error(errorMsg);
      }
      setIsDepositing(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      // Show loading state for save
      const saveToast = toast.loading('Saving continuity settings...');

      await walletApi.updateSettings({
        minimumAmount: minTopUp,
        currency: selectedCurrency,
        isAutoTopUpEnabled: autoRecharge,
        rechargeThreshold: Number(rechargeThreshold),
        rechargeAmount: Number(rechargeAmount),
        monthlySpendMax: Number(monthlyLimit)
      });

      setShowSettingsModal(false);
      setShowSetupModal(false);
      toast.success('Wallet settings updated!', { id: saveToast });
      loadWalletData();
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleActivation = async () => {
    let toastId = '';
    try {
      setIsActivating(true);
      toastId = toast.loading(`Initializing ${paymentProvider} activation...`);
      const isApp = Capacitor.isNativePlatform();
      const callbackUrl = isApp
        ? 'https://unlimitedhealthcares.com/wallet'
        : window.location.origin + '/wallet';
      const response = await walletApi.initializeActivation(callbackUrl, paymentProvider);

      const authUrl = response?.authorization_url || response?.data?.authorization_url;
      if (authUrl) {
        toast.success('Redirecting to secure gateway...', {
          id: toastId,
          duration: 3000
        });
        window.location.href = authUrl;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error: any) {
      console.error('Activation failure details:', {
        error,
        data: error.data,
        status: error.status
      });
      const errorMsg = error.data?.message || error.message || 'Failed to initialize activation payment';
      if (toastId) {
        toast.error(errorMsg, { id: toastId });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsActivating(false);
    }
  };

  if (loading && !balance) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
            Finance Dashboard
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            My <span className="text-green-600">Wallet</span>
          </h1>
          <p className="text-gray-500 font-medium">Manage your prepaid credits and view transaction history.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setMinTopUp(balance?.minimumTopUpAmount || 25);
              setSelectedCurrency(balance?.currency || 'USD');
              setShowSettingsModal(true);
            }}
            variant="outline"
            className="rounded-xl h-11 border-gray-200 shadow-sm font-bold bg-white hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="rounded-xl h-11 border-gray-200 shadow-sm font-bold bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balance Card */}
        <Card className="lg:col-span-2 overflow-hidden border-none shadow-2xl shadow-indigo-500/10 bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white rounded-[3rem] relative p-2">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none">
            <ShieldCheck className="w-[32rem] h-[32rem] rotate-12" />
          </div>
          <CardContent className="p-8 sm:p-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3 space-y-8">
                <div className="space-y-2">
                  <Badge className="bg-indigo-400/20 text-indigo-200 border-none font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1">
                    Mission Critical Continuity
                  </Badge>
                  <CardTitle className="text-indigo-100/60 font-black uppercase tracking-[0.25em] text-[11px] pl-0.5">Available Liquidity</CardTitle>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                  <span className="text-6xl sm:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                    {getCurrencySymbol(selectedCurrency)}
                    {(() => {
                      const baseBalance = balance?.balance || 0;
                      if (balance?.currency === 'USD' && selectedCurrency === 'NGN') return (baseBalance * USD_TO_NGN_RATE).toLocaleString();
                      if (balance?.currency === 'NGN' && selectedCurrency === 'USD') return (baseBalance / USD_TO_NGN_RATE).toLocaleString(undefined, { maximumFractionDigits: 2 });
                      return baseBalance.toLocaleString();
                    })()}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400 font-black tracking-widest text-lg uppercase leading-none">{selectedCurrency}</span>
                      {selectedCurrency === 'USD' && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[8px] h-4 font-black">STABLE CORE</Badge>
                      )}
                    </div>
                    {selectedCurrency !== referenceCurrency && (
                      <div className="flex items-center gap-1.5 mt-1 border-l-2 border-white/20 pl-2 group cursor-help transition-all hover:border-indigo-400">
                        <span className="text-[10px] text-white/40 font-bold tracking-tighter uppercase whitespace-nowrap">
                          ≈ {getCurrencySymbol(referenceCurrency)}
                          {(() => {
                            const baseBalance = balance?.balance || 0;
                            let factor = 1;
                            if (balance?.currency === 'USD' && referenceCurrency === 'NGN') factor = USD_TO_NGN_RATE;
                            if (balance?.currency === 'NGN' && referenceCurrency === 'USD') factor = 1 / USD_TO_NGN_RATE;
                            return (baseBalance * factor).toLocaleString(undefined, { maximumFractionDigits: 2 });
                          })()}
                          {referenceCurrency} (LOCAL)
                        </span>
                        <Info className="h-3 w-3 text-white/20 group-hover:text-white/60" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="relative group">
                    <Button
                      onClick={() => setIsDepositing(true)}
                      className="bg-white text-indigo-900 hover:bg-indigo-50 rounded-[2rem] h-16 px-10 font-black text-xl shadow-2xl shadow-indigo-950/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <Plus className="w-6 h-6 mr-3 stroke-[3.5px]" /> Fund Wallet
                    </Button>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Supports Local NGN Rails</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-[2rem] px-8 h-16 backdrop-blur-sm shadow-inner group transition-all hover:bg-white/10">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Globe className="h-3 w-3 text-indigo-400" />
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Market Reserve</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                        <span className="text-xs font-black text-white uppercase tracking-tighter">Rate Locked: 1 USD / {USD_TO_NGN_RATE} NGN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="h-full bg-white/5 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-md flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-700">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Zap className={cn("w-6 h-6", autoRecharge ? "text-amber-400 fill-amber-400" : "text-white/20")} />
                      <Badge className={cn("border-none text-[8px] font-black uppercase tracking-widest py-1 px-3", autoRecharge ? "bg-amber-400/20 text-amber-300" : "bg-white/10 text-white/40")}>
                        {autoRecharge ? "RECHARGE ENABLED" : "AUTO-SWAP DISABLED"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-white/90 leading-tight">Infrastructure Protection</p>
                      <p className="text-[10px] text-indigo-300/80 font-bold leading-relaxed mt-1">
                        Auto-recharge logic ensures your clinical requests never trigger a <span className="text-rose-400">402 Payment Required</span> error.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-indigo-400">
                      <span>SAFETY LIMIT</span>
                      <span className="text-white">${monthlyLimit} / MO</span>
                    </div>
                    <Progress value={Math.min((balance?.balance / monthlyLimit) * 100, 100)} className="h-2 bg-white/10" />
                    <Button
                      variant="ghost"
                      onClick={() => setShowSettingsModal(true)}
                      className="w-full justify-between h-8 p-0 text-white/40 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                    >
                      Manage Continuity Settings <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="mt-8">
        {/* Transaction History */}
        <Card className="rounded-3xl border-gray-100 shadow-xl shadow-gray-200/50 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-gray-900">Transaction History</CardTitle>
              <CardDescription>A complete log of your financial activities on the platform.</CardDescription>
            </div>
            <History className="text-gray-300 w-8 h-8" />
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-20 grayscale opacity-40">
                <Wallet className="w-16 h-16 mx-auto mb-4" />
                <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50 text-left">
                      <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-widest text-gray-400">Activity</th>
                      <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-widest text-gray-400">Reference</th>
                      <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-widest text-gray-400 text-center">Date</th>
                      <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-widest text-gray-400 text-center">Status</th>
                      <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-widest text-gray-400 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history.map((tx) => (
                      <tr key={tx.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              tx.amount > 0 ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600"
                            )}>
                              {tx.amount > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-sm leading-none mb-1">{tx.description}</p>
                              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter h-4 border-gray-100">{tx.type}</Badge>
                            </div>
                          </div>
                        </td>
                        <td className="py-5">
                          <span className="font-mono text-xs text-gray-400 group-hover:text-gray-600 transition-colors">{tx.reference || 'N/A'}</span>
                        </td>
                        <td className="py-5 text-center text-xs font-bold text-gray-500">
                          {format(new Date(tx.createdAt), 'MMM dd, p')}
                        </td>
                        <td className="py-5 text-center">
                          <Badge className={cn(
                            "rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-wider",
                            tx.status === 'success' ? "bg-emerald-500" :
                              tx.status === 'pending' ? "bg-amber-500" : "bg-rose-500"
                          )}>
                            {tx.status}
                          </Badge>
                        </td>
                        <td className={cn(
                          "py-5 text-right font-black text-md",
                          tx.amount > 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {tx.amount > 0 ? '+' : ''}{getCurrencySymbol(balance?.currency)}{Math.abs(tx.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Setup Modal */}
      <AnimatePresence>
        {showSetupModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-y-auto max-h-[92vh] my-auto pb-safe-offset"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <CreditCard className="w-32 h-32" />
              </div>

              <div className="space-y-6 relative z-10">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <PiggyBank className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Setup Your Billing</h2>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    UHC platform uses a prepayment model. Choose a minimum amount to fund your account for future service requests.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">1. Select Preferred Currency</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['USD', 'NGN'].map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setSelectedCurrency(curr)}
                        className={cn(
                          "h-12 rounded-xl border-2 font-black transition-all",
                          selectedCurrency === curr
                            ? "border-green-600 bg-green-50 text-green-700"
                            : "border-gray-100 text-gray-400 hover:border-gray-200"
                        )}
                      >
                        {curr} ({getCurrencySymbol(curr)})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">2. Choose Minimum Top-Up</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[25, 50, 100, 250].map((usdAmt) => {
                      const amt = selectedCurrency === 'NGN' ? usdAmt * USD_TO_NGN_RATE : usdAmt;
                      return (
                        <button
                          key={amt}
                          onClick={() => setMinTopUp(amt)}
                          className={cn(
                            "h-16 rounded-2xl border-2 font-black text-lg transition-all",
                            minTopUp === amt
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10"
                              : "border-gray-100 text-gray-400 hover:border-gray-200"
                          )}
                        >
                          {getCurrencySymbol(selectedCurrency)}{amt.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 font-medium leading-tight">
                    You can change your default top-up amount anytime in wallet settings.
                    <span className="font-bold text-gray-900 ml-1">The {selectedCurrency} wallet is used for all service requests.</span>
                  </p>
                </div>

                <Button
                  onClick={handleUpdateSettings}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-500/20"
                >
                  Confirm & Initialize Wallet
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-4xl w-full shadow-3xl text-gray-900 border border-white/20 relative"
            >
              <div className="flex flex-col h-[85vh] md:h-auto max-h-[90vh]">
                <div className="flex justify-between items-center p-8 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Billing & Continuity</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Wallet Core Settings</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowSettingsModal(false)} className="rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 rotate-45 text-gray-400" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                  <Tabs defaultValue="continuity" className="flex flex-col md:flex-row h-full">
                    <TabsList className="flex md:flex-col h-auto bg-gray-50/50 p-4 border-r border-gray-100 items-stretch justify-start gap-2 shrink-0">
                      <TabsTrigger value="currency" className="justify-start gap-3 h-12 rounded-xl text-xs font-black uppercase tracking-widest aria-selected:bg-white aria-selected:text-indigo-600 aria-selected:shadow-md transition-all">
                        <Globe className="w-4 h-4" /> Currency
                      </TabsTrigger>
                      <TabsTrigger value="continuity" className="justify-start gap-3 h-12 rounded-xl text-xs font-black uppercase tracking-widest aria-selected:bg-white aria-selected:text-indigo-600 aria-selected:shadow-md">
                        <Zap className="w-4 h-4" /> Continuity
                      </TabsTrigger>
                      <TabsTrigger value="alerts" className="justify-start gap-3 h-12 rounded-xl text-xs font-black uppercase tracking-widest aria-selected:bg-white aria-selected:text-indigo-600 aria-selected:shadow-md">
                        <Bell className="w-4 h-4" /> Alerts
                      </TabsTrigger>
                      <TabsTrigger value="billing" className="justify-start gap-3 h-12 rounded-xl text-xs font-black uppercase tracking-widest aria-selected:bg-white aria-selected:text-indigo-600 aria-selected:shadow-md">
                        <Building className="w-4 h-4" /> Profile
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 p-8">
                      {/* Currency Tab */}
                      <TabsContent value="currency" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-6">
                          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                              <Globe className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-black text-indigo-900 tracking-tight">Active Wallet Currency</h4>
                              <p className="text-xs text-indigo-700/60 font-medium leading-tight">All internal balances and transaction logs will use this unit.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {['USD', 'NGN', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR'].map((curr) => (
                              <button
                                key={curr}
                                onClick={() => handleCurrencySwitch(curr)}
                                className={cn(
                                  "h-14 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center",
                                  selectedCurrency === curr
                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-600/10"
                                    : "border-gray-100 text-gray-400 hover:border-gray-200 bg-white"
                                )}
                              >
                                <span className="text-sm">{curr}</span>
                                <span className="text-[10px] opacity-60 leading-none">{getCurrencySymbol(curr)}</span>
                              </button>
                            ))}
                          </div>

                          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800/80 font-bold leading-relaxed">
                              Note: Changing your base currency might require a reconciliation of your current balance.
                              International Gateways will settle at the provided market rate.
                            </p>
                          </div>

                          <div className="pt-6 border-t border-gray-100 space-y-4">
                            <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Optional Reference Currency</Label>
                            <div className="flex flex-wrap gap-3">
                              {['NGN', 'GHS', 'KES', 'ZAR', 'EUR', 'GBP'].map((curr) => (
                                <button
                                  key={curr}
                                  onClick={() => setReferenceCurrency(curr)}
                                  className={cn(
                                    "px-4 h-10 rounded-xl border-2 font-black transition-all text-xs",
                                    referenceCurrency === curr
                                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                      : "border-gray-100 text-gray-400 hover:border-gray-200"
                                  )}
                                >
                                  {curr}
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium italic">Estimated balance in {referenceCurrency} will be shown on your main card.</p>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Continuity Tab */}
                      <TabsContent value="continuity" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-black text-gray-900 tracking-tight text-xl">Auto-Recharge (Auto-TopUp)</h4>
                            <p className="text-xs text-gray-500 font-medium">Never let your service requests fail with a 402 error.</p>
                          </div>
                          <Switch
                            checked={autoRecharge}
                            onCheckedChange={setAutoRecharge}
                            className="bg-gray-200 data-[state=checked]:bg-indigo-600"
                          />
                        </div>

                        {autoRecharge && (
                          <div className="space-y-6 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Trigger Threshold</Label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">{getCurrencySymbol(selectedCurrency)}</span>
                                  <Input
                                    type="number"
                                    value={rechargeThreshold}
                                    onChange={(e) => setRechargeThreshold(Number(e.target.value))}
                                    className="h-14 pl-10 rounded-2xl border-gray-100 font-black focus:border-indigo-500 bg-gray-50/50"
                                  />
                                  <span className="text-[9px] font-bold text-gray-400 mt-2 block pl-1 italic">When balance falls below this...</span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Recharge Amount</Label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">{getCurrencySymbol(selectedCurrency)}</span>
                                  <Input
                                    type="number"
                                    value={rechargeAmount}
                                    onChange={(e) => setRechargeAmount(Number(e.target.value))}
                                    className="h-14 pl-10 rounded-2xl border-gray-100 font-black focus:border-indigo-500 bg-gray-50/50"
                                  />
                                  <span className="text-[9px] font-bold text-gray-400 mt-2 block pl-1 italic">...automatically add this amount.</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-indigo-950 text-white p-6 rounded-3xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-24 h-24" />
                              </div>
                              <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2">
                                  <Lock className="w-4 h-4 text-indigo-400" />
                                  <h5 className="font-black text-sm uppercase tracking-widest">Safety Ceiling</h5>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black text-indigo-300 tracking-widest">MONTHLY SPEND MAX</Label>
                                  <div className="flex items-center gap-4">
                                    <Input
                                      type="number"
                                      value={monthlyLimit}
                                      onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                                      className="h-12 w-32 bg-white/10 border-white/10 rounded-xl font-black text-white focus:bg-white/20"
                                    />
                                    <p className="text-[10px] text-indigo-200 font-medium leading-relaxed">
                                      Protects you from runaway costs if your integration has a loop bug or high unexpected traffic.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {!autoRecharge && (
                          <div className="p-10 border-2 border-dashed border-gray-100 rounded-[3rem] text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                              <Zap className="w-8 h-8 opacity-40" />
                            </div>
                            <p className="text-xs text-gray-400 font-bold max-w-[240px] mx-auto leading-relaxed uppercase tracking-widest">
                              Continuous service is protected by enabling auto-topup.
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Alerts Tab */}
                      <TabsContent value="alerts" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-black text-gray-900 tracking-tight text-xl">Usage & Level Alerts</h4>
                              <p className="text-xs text-gray-500 font-medium">Be notified before your balance hits critically low levels.</p>
                            </div>
                            <Switch
                              checked={emailAlerts}
                              onCheckedChange={setEmailAlerts}
                              className="bg-gray-200 data-[state=checked]:bg-indigo-600"
                            />
                          </div>

                          <div className="space-y-4 pt-4 border-t border-gray-100">
                            <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Trigger Notifications when balance reached:</Label>
                            <div className="flex flex-wrap gap-3">
                              {alertThresholds.sort((a, b) => b - a).map((t, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-2xl border border-indigo-100 group">
                                  <span className="font-black text-sm">{getCurrencySymbol(selectedCurrency)}{t}</span>
                                  <button
                                    onClick={() => setAlertThresholds(prev => prev.filter(v => v !== t))}
                                    className="text-indigo-300 hover:text-indigo-600 p-0.5"
                                  >
                                    <Plus className="w-3 h-3 rotate-45" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const next = Math.max(...alertThresholds, 0) + 5;
                                  setAlertThresholds(prev => [...prev, next]);
                                }}
                                className="h-12 w-12 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 hover:text-gray-500 hover:border-gray-300 transition-all"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3 pt-6 border-t border-gray-100">
                            <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Dedicated Billing Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                              <Input
                                placeholder="accountant@company.com"
                                value={billingEmail}
                                onChange={(e) => setBillingEmail(e.target.value)}
                                className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold italic">Invoices and alerts will be sent here preferentially.</p>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Billing/Profile Tab */}
                      <TabsContent value="billing" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-black text-gray-900 tracking-tight text-xl">Professional Invoicing Profile</h4>
                            <p className="text-xs text-gray-500 font-medium">B2B Compliance and Tax/VAT documentation details.</p>
                          </div>

                          <div className="grid grid-cols-1 gap-6 pt-4 border-t border-gray-100">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Company/Entity Name</Label>
                              <Input
                                value={billingProfile.companyName}
                                onChange={(e) => setBillingProfile({ ...billingProfile, companyName: e.target.value })}
                                placeholder="Acme Health Solutions Ltd"
                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Full Legal Address</Label>
                              <Textarea
                                value={billingProfile.address}
                                onChange={(e) => setBillingProfile({ ...billingProfile, address: e.target.value })}
                                placeholder="12 Professional Way, Innovation Hub, Lagos, Nigeria"
                                className="rounded-2xl border-gray-100 bg-gray-50/50 font-bold resize-none"
                                rows={3}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">VAT / Tax Identification Number</Label>
                              <Input
                                value={billingProfile.taxId}
                                onChange={(e) => setBillingProfile({ ...billingProfile, taxId: e.target.value })}
                                placeholder="VAT-NG-123456789"
                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                              />
                            </div>
                          </div>

                          <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <History className="h-5 w-5 text-indigo-400" />
                              <span className="text-xs font-black text-indigo-900 tracking-widest uppercase">Invoice PDF Generation</span>
                            </div>
                            <Badge className="bg-indigo-600 text-[9px] h-6 px-3">Active for All Top-Ups</Badge>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50/30 rounded-b-[3rem] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 font-black uppercase" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Infrastructure Status</p>
                      <p className="text-xs font-bold text-gray-900 tracking-tight leading-none">Security Compliance: Level 4</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowSettingsModal(false)}
                      className="px-8 rounded-2xl font-black uppercase tracking-widest text-gray-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateSettings}
                      className="px-8 h-12 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-black/10 transition-transform active:scale-95"
                    >
                      Commit Changes
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Deposit Modal */}
        {isDepositing && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] max-w-lg w-full p-6 sm:p-10 shadow-3xl relative overflow-y-auto max-h-[92vh] my-auto pb-safe-offset"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-gray-900">Add Funds</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsDepositing(false)} className="rounded-full h-12 w-12 hover:bg-gray-100">
                  <Plus className="w-8 h-8 rotate-45 text-gray-500" />
                </Button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Deposit Amount</p>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-4xl">
                      {getCurrencySymbol(balance?.currency)}
                    </span>
                    <Input
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      onFocus={(e) => e.target.select()}
                      className="h-24 pl-20 text-5xl font-black rounded-3xl border-gray-100 focus:border-green-500 bg-gray-50 transition-all border-none focus:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Choose Payment Gateway</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentProvider('paystack')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        paymentProvider === 'paystack'
                          ? "border-blue-600 bg-blue-50/50 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      )}
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <CreditCard className={cn("w-6 h-6", paymentProvider === 'paystack' ? "text-blue-600" : "text-gray-400")} />
                      </div>
                      <span className={cn("text-xs font-black uppercase tracking-tight", paymentProvider === 'paystack' ? "text-blue-700" : "text-gray-400")}>
                        Paystack
                      </span>
                    </button>

                    <button
                      onClick={() => setPaymentProvider('flutterwave')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        paymentProvider === 'flutterwave'
                          ? "border-orange-600 bg-orange-50/50 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      )}
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Zap className={cn("w-6 h-6", paymentProvider === 'flutterwave' ? "text-orange-600" : "text-gray-400")} />
                      </div>
                      <span className={cn("text-xs font-black uppercase tracking-tight", paymentProvider === 'flutterwave' ? "text-orange-700" : "text-gray-400")}>
                        Flutterwave
                      </span>
                    </button>

                    <button
                      onClick={() => setPaymentProvider('binance')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 col-span-2",
                        paymentProvider === 'binance'
                          ? "border-yellow-500 bg-yellow-50/50 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      )}
                    >
                      <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Coins className={cn("w-6 h-6", paymentProvider === 'binance' ? "text-yellow-600" : "text-gray-400")} />
                      </div>
                      <span className={cn("text-xs font-black uppercase tracking-tight", paymentProvider === 'binance' ? "text-yellow-700" : "text-gray-400")}>
                        Binance Pay (Worldwide)
                      </span>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  className={cn(
                    "w-full h-20 text-white rounded-[32px] font-black text-2xl shadow-2xl transition-all active:scale-95",
                    paymentProvider === 'paystack'
                      ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
                      : paymentProvider === 'binance'
                        ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30 text-black"
                        : "bg-orange-600 hover:bg-orange-700 shadow-orange-500/30"
                  )}
                >
                  Pay with {paymentProvider === 'paystack' ? 'Paystack' : paymentProvider === 'binance' ? 'Binance Pay' : 'Flutterwave'}
                </Button>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Encryption via {paymentProvider === 'paystack' ? 'Paystack' : 'Flutterwave'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {/* Account Activation Modal */}
        {showActivationModal && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center bg-gray-950/90 backdrop-blur-xl p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[40px] max-w-xl w-full p-6 sm:p-12 shadow-3xl text-center relative overflow-y-auto max-h-[92vh] my-auto pb-safe-offset"
            >
              {/* Decorative Background Icon */}
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none hidden sm:block">
                <ShieldCheck className="w-64 h-64 rotate-12" />
              </div>

              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 sm:mb-4 tracking-tight">Activate Account</h2>
              <p className="text-gray-500 font-bold mb-6 sm:mb-10 text-sm sm:text-lg leading-relaxed px-2 sm:px-6">
                To protect our platform and community, a small one-time activation fee is required to unlock full access.
              </p>

              <div className="bg-gray-50 rounded-[32px] p-8 mb-10 border-2 border-dashed border-gray-100 flex flex-col items-center">
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">One-Time Activation Fee</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-green-600">
                    ${balance?.userRole?.some((r: any) => ['doctor', 'center', 'staff'].includes(r)) ? '10' : '5'}
                  </span>
                  <span className="text-xl font-bold text-gray-400">USD</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Payment Provider</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentProvider('paystack')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        paymentProvider === 'paystack'
                          ? "border-blue-600 bg-blue-50/50 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      )}
                    >
                      <CreditCard className={cn("w-6 h-6", paymentProvider === 'paystack' ? "text-blue-600" : "text-gray-300")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-tight", paymentProvider === 'paystack' ? "text-blue-700" : "text-gray-400")}>
                        Paystack
                      </span>
                    </button>

                    <button
                      onClick={() => setPaymentProvider('flutterwave')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        paymentProvider === 'flutterwave'
                          ? "border-orange-600 bg-orange-50/50 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      )}
                    >
                      <Zap className={cn("w-6 h-6", paymentProvider === 'flutterwave' ? "text-orange-600" : "text-gray-300")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-tight", paymentProvider === 'flutterwave' ? "text-orange-700" : "text-gray-400")}>
                        Flutterwave
                      </span>
                    </button>

                    <button
                      onClick={() => setPaymentProvider('binance')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 col-span-2",
                        paymentProvider === 'binance'
                          ? "border-yellow-500 bg-yellow-50/50 shadow-md"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      )}
                    >
                      <Coins className={cn("w-6 h-6", paymentProvider === 'binance' ? "text-yellow-600" : "text-gray-300")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-tight", paymentProvider === 'binance' ? "text-yellow-700" : "text-gray-400")}>
                        Binance Pay (Worldwide)
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleActivation}
                    disabled={isActivating}
                    className={cn(
                      "w-full h-20 text-white rounded-[32px] font-black text-2xl shadow-2xl transition-all active:scale-95",
                      paymentProvider === 'paystack'
                        ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
                        : paymentProvider === 'binance'
                          ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30 text-black"
                          : "bg-orange-600 hover:bg-orange-700 shadow-orange-500/30"
                    )}
                  >
                    {isActivating ? 'Processing...' : `Activating via ${paymentProvider === 'paystack' ? 'Paystack' : paymentProvider === 'binance' ? 'Binance Pay' : 'Flutterwave'}`}
                  </Button>
                  <div className="flex flex-col items-center gap-3 pt-4">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> PCI-DSS Compliant Gateway
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 2cm; }
        }
      `}</style>
    </div>
  );
}
