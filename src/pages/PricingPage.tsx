import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Shield, Zap, Star, Wallet, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { integrationsService } from '@/services/integrationsService';
import { toast } from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    description: 'Perfect for individual patients starting their health journey.',
    features: [
      'Basic Health Tracking',
      'Clinical Consultation Booking',
      'Digital Prescriptions',
      '500MB Lab Report Storage',
      'Standard Chat Support'
    ],
    buttonText: 'Subscribe to Basic',
    highlight: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    description: 'Advanced features for proactive health management.',
    features: [
      'Everything in Basic',
      'AI Health Insights',
      'Priority Consultation Access',
      '5GB Lab Report Storage',
      '24/7 Priority Support',
      'Family History Tracking',
      'Smart Device Integration'
    ],
    buttonText: 'Subscribe to Premium',
    highlight: true,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Healthcare Pro',
    price: 99.99,
    description: 'For healthcare providers and small clinics.',
    features: [
      'Everything in Premium',
      'Patient Portfolio Management',
      'Digital EMR System',
      'Billing & Invoice Automation',
      'Unlimited Cloud Storage',
      'Custom Patient Forms',
      'Telehealth Video Rooms'
    ],
    buttonText: 'Subscribe to Pro',
    highlight: false
  }
];

const PricingPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'binance'>('paystack');

  // Cleanup any lingering loading toasts on mount (e.g. after back button from gateway)
  useEffect(() => {
    toast.dismiss('payment-loading');
  }, []);

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    try {
      setLoading(plan.id);

      const paymentData = {
        amount: plan.price,
        currency: 'USD',
        patientId: profile?.id || '',
        centerId: '', // Platform subscription
        description: `Subscription to ${plan.name} Plan`,
        paymentMethod: paymentMethod,
        metadata: {
          email: user?.email,
          planId: plan.id,
          planName: plan.name,
          userId: user?.id,
          callbackUrl: `${window.location.origin}/payment/callback`,
          redirectUrl: `${window.location.origin}/payment/callback`,
          cancelUrl: `${window.location.origin}/pricing`
        }
      };

      const result = await integrationsService.processPayment(paymentData);

      if (result.redirectUrl) {
        toast.loading(`Redirecting to secure gateway for ${plan.name}...`, {
          id: 'payment-loading',
          duration: 5000
        });
        setTimeout(() => {
          window.location.href = result.redirectUrl!;
        }, 800);
      } else if (result.status === 'succeeded') {
        toast.dismiss('payment-loading');
        toast.success(`Success! You are now subscribed to ${plan.name}`);
      }
    } catch (error) {
      toast.dismiss('payment-loading');
      console.error('Subscription error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process subscription');
    } finally {
      setLoading(null);
    }
  };

  const handleEnterpriseAction = () => {
    window.location.href = 'mailto:codesphere@unlimitedhealthcares.com?subject=Enterprise Inquiry';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950/50 py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-blue-600/10 text-blue-600 border-none px-4 py-1.5 uppercase font-black text-xs tracking-widest">
            Flexible Plans
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Choose Your <span className="text-blue-600">Health Journey</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Join thousands of users who have revolutionized their healthcare experience.
            Select a plan that fits your needs perfectly.
          </p>

          <div className="flex items-center justify-center space-x-1 text-xs text-blue-600 font-bold uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/20 w-max mx-auto px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800">
            <CreditCard className="w-4 h-4" />
            <span>Multi-channel Secure Payments</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="flex flex-col items-center gap-4 pt-4 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Select Active Payment Gateway</Label>
          <div className="flex p-1.5 bg-gray-100 dark:bg-gray-900 rounded-3xl w-full max-w-[500px] border border-gray-200 dark:border-gray-800 shadow-inner">
            <button
              onClick={() => setPaymentMethod('paystack')}
              className={cn(
                "flex-1 h-14 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-black text-[9px] uppercase tracking-tighter",
                paymentMethod === 'paystack'
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-lg scale-[1.02] ring-1 ring-blue-100 dark:ring-blue-900"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20 text-[7px]">PS</div>
              Paystack
            </button>
            <button
              onClick={() => setPaymentMethod('flutterwave')}
              className={cn(
                "flex-1 h-14 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-black text-[9px] uppercase tracking-tighter",
                paymentMethod === 'flutterwave'
                  ? "bg-white dark:bg-gray-800 text-orange-600 shadow-lg scale-[1.02] ring-1 ring-orange-100 dark:ring-orange-900"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20 text-[7px]">FW</div>
              Flutterwave
            </button>
            <button
              onClick={() => setPaymentMethod('binance')}
              className={cn(
                "flex-1 h-14 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-black text-[9px] uppercase tracking-tighter",
                paymentMethod === 'binance'
                  ? "bg-white dark:bg-gray-800 text-yellow-600 shadow-lg scale-[1.02] ring-1 ring-yellow-100 dark:ring-yellow-900"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <div className="w-6 h-6 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-bold shadow-lg shadow-yellow-400/20 text-[7px]">BN</div>
              Binance
            </button>
          </div>
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Secure Verification Active
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-stretch pb-20">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col transition-all duration-300 overflow-visible ${plan.highlight
                ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-2xl md:scale-105 z-10'
                : 'border-gray-200 dark:border-gray-800 hover:shadow-xl'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 w-max">
                  <span className="bg-blue-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg border-2 border-white dark:border-gray-950">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${plan.id === 'basic' || plan.id === 'premium' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                  {plan.id === 'basic' && <Zap className="w-7 h-7 text-blue-600" />}
                  {plan.id === 'premium' && <Star className="w-7 h-7 text-blue-600" />}
                  {plan.id === 'enterprise' && <Shield className="w-7 h-7 text-purple-600" />}
                </div>
                <CardTitle className="text-2xl font-black text-gray-900 dark:text-white">{plan.name}</CardTitle>
                <CardDescription className="text-gray-500 font-medium px-4">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-8">
                <div className="text-center pt-2">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">${plan.price}</span>
                  <span className="text-gray-500 font-bold ml-1">/month</span>
                </div>

                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0 pb-8 px-8">
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={cn(
                    "w-full h-14 px-2 sm:px-4 rounded-2xl font-black flex items-center justify-center uppercase tracking-widest transition-all",
                    plan.highlight
                      ? "bg-blue-500 hover:bg-blue-400 text-white shadow-xl shadow-blue-500/30"
                      : "bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-white dark:text-slate-900 shadow-lg"
                  )}
                >
                  {loading === plan.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent" />
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 w-full">
                      <span className="text-[10px] xs:text-xs sm:text-sm truncate">
                        {plan.buttonText}
                      </span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    </div>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-20 p-8 sm:p-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Need a custom plan for your hospital?</h3>
            <p className="text-gray-500 font-medium">Get in touch with our sales team for tailored enterprise solutions.</p>
          </div>
          <Button
            variant="outline"
            className="h-14 w-full md:w-auto px-8 rounded-2xl border-gray-200 dark:border-gray-800 font-black uppercase tracking-widest text-xs"
            onClick={() => window.location.href = 'mailto:codesphere@unlimitedhealthcares.com?subject=Enterprise Inquiry'}
          >
            Talk to Sales
          </Button>
        </div>
      </div>
    </div >
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
);

export default PricingPage;
