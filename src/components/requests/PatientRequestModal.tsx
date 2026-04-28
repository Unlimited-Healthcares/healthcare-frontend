import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CreditCard as PaystackIcon, Globe as FlutterwaveIcon, ShieldCheck } from 'lucide-react';
import { Send, AlertCircle, Calendar, Clock, Stethoscope, X, DollarSign, HelpCircle, Info, CreditCard, CheckCircle2, Wallet, Check } from 'lucide-react';
import { walletApi } from '@/services/walletApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserType, Center } from '@/types/discovery';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { USD_TO_NGN_RATE } from '@/constants/services';
import { discoveryService } from '@/services/discoveryService';
import { patientService } from '@/services/patientService';
import { integrationsService } from '@/services/integrationsService';
import { formatApiError } from '@/lib/error-formatter';

interface PatientRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: UserType | Center;
  onSend: () => void;
  preselectedServices?: string[];
}

interface PatientRequestFormData {
  message: string;
  selectedServiceId?: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  urgency: string;
  symptoms: string;
  medicalHistory: string;
  currentMedications: string;
  insuranceInfo: {
    provider: string;
    policyNumber: string;
  };
  paymentMethod: string;
}

export const PatientRequestModal = ({ isOpen, onClose, recipient, onSend, preselectedServices = [] }: PatientRequestModalProps) => {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<PatientRequestFormData>({
    message: '',
    selectedServiceId: '',
    appointmentType: '',
    preferredDate: getTodayDate(),
    preferredTime: '',
    urgency: '',
    symptoms: '',
    medicalHistory: '',
    currentMedications: '',
    insuranceInfo: {
      provider: '',
      policyNumber: ''
    },
    paymentMethod: 'wallet'
  });

  const [isResolved, setIsResolved] = useState(false);
  const [offeredServices, setOfferedServices] = useState<any[]>(recipient.offeredServices || []);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [additionalServices, setAdditionalServices] = useState<string[]>(preselectedServices.slice(1));
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [providerSettings, setProviderSettings] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showGateway, setShowGateway] = useState(false);
  const [verifiedTransactionId, setVerifiedTransactionId] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const isCenter = 'type' in recipient;
  const selectedService = offeredServices?.find(s => s.id === formData.selectedServiceId);
  const baseAmount = selectedService?.price || (isCenter ? providerSettings?.paymentSettings?.serviceFee : providerSettings?.paymentSettings?.consultationFee) || 0;

  // Platform Commission Calculation (15%)
  const PLATFORM_CHARGE_RATE = 0.15;
  const platformCharge = baseAmount * PLATFORM_CHARGE_RATE;
  let finalAmount = Number(baseAmount) + Number(platformCharge);

  let finalCurrency = selectedService?.currency || providerSettings?.paymentSettings?.currency || 'USD';

  if ((formData.paymentMethod === 'paystack' || formData.paymentMethod === 'flutterwave') && finalCurrency === 'USD') {
    finalAmount = finalAmount * USD_TO_NGN_RATE;
    finalCurrency = 'NGN';
  }

  const handleOnlinePayment = async () => {
    setProcessingPayment(true);
    setLoading(true);
    try {
      const resId = await resolveRecipientId(recipient);

      const paymentData = {
        amount: baseAmount, // Backend handles adding 15% and splitting
        currency: selectedService?.currency || providerSettings?.paymentSettings?.currency || 'USD',
        patientId: user?.id || null,
        centerId: isCenter ? recipient.id : null,
        description: `Clinical Consultation: ${selectedService?.name || formData.appointmentType}`,
        paymentMethod: formData.paymentMethod,
        metadata: {
          email: user?.email,
          fullName: profile?.name || user?.name || 'Patient',
          appointmentType: formData.appointmentType,
          serviceId: formData.selectedServiceId,
          recipientId: resId,
          callbackUrl: `${window.location.origin}/dashboard`
        }
      };

      const result = await integrationsService.processPayment(paymentData);

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        toast.error('Payment gateway initialization failed. No redirect URL provided.');
      }
    } catch (err) {
      toast.error(formatApiError(err) || 'Consultation payment initialization failed');
    } finally {
      setProcessingPayment(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const id = await resolveRecipientId(recipient);
        if (id) {
          const data = isCenter ?
            await discoveryService.getCenterProfile(id) :
            await discoveryService.getUserProfile(id);
          setProviderSettings(data);
        }
      } catch (err) {
        console.error('Error fetching provider settings:', err);
      }
    };
    fetchSettings();
  }, [recipient, isCenter]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const balance = await walletApi.getBalance();
        setWalletBalance(balance);
      } catch (err) {
        setWalletBalance(0);
      }
    };
    fetchWallet();
  }, []);

  useEffect(() => {
    if (preselectedServices.length > 0 && offeredServices.length > 0) {
      const mainId = preselectedServices[0];
      const found = offeredServices.find(s => s.id === mainId || s.name === mainId);
      if (found) {
        setFormData(prev => ({ ...prev, selectedServiceId: found.id, appointmentType: found.name }));
      }
    }
  }, [preselectedServices, offeredServices]);

  const resolveRecipientId = async (target: UserType | Center): Promise<string | null> => {
    if (target.id && typeof target.id === 'string' && target.id.includes('-')) return target.id;
    if ('type' in target) {
      const staff = await discoveryService.getCenterStaff(target.id);
      return staff?.[0]?.id || target.id;
    }
    return target.id;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.symptoms) newErrors.symptoms = 'Clinical assessment details are required';
      if (!formData.urgency) newErrors.urgency = 'Triage priority is required';
    }
    if (currentStep === 2) {
      if (!formData.preferredDate) newErrors.preferredDate = 'Required';
      if (!formData.preferredTime) newErrors.preferredTime = 'Required';
    }
    if (currentStep === 3) {
      if (!formData.appointmentType) newErrors.appointmentType = 'Select a clinical action';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const resId = await resolveRecipientId(recipient);
      if (!resId) throw new Error('Recipient identity unresolved');

      if (formData.paymentMethod === 'wallet' && walletBalance !== null && walletBalance < finalAmount) {
        toast.error(`Insufficient wallet balance. Needed: ${finalAmount} ${finalCurrency}`);
        setLoading(false);
        return;
      }

      const isOnlineMethod = ['paystack', 'flutterwave'].includes(formData.paymentMethod);
      if (finalAmount > 0 && isOnlineMethod) {
        await handleOnlinePayment();
        return;
      }

      const metadata = {
        appointmentType: formData.appointmentType,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        urgency: formData.urgency,
        symptoms: formData.symptoms,
        medicalHistory: formData.medicalHistory || undefined,
        currentMedications: formData.currentMedications || undefined,
        paymentInfo: {
          method: formData.paymentMethod,
          amount: baseAmount,
          totalCharged: finalAmount,
          commission: platformCharge,
          currency: finalCurrency,
          status: formData.paymentMethod === 'wallet' ? 'paid' : 'pending'
        },
        serviceId: formData.selectedServiceId,
        patientId: currentPatientId || undefined
      };

      await discoveryService.createRequest({
        recipientId: resId,
        requestType: 'consultation_request',
        message: formData.message.trim(),
        metadata
      });

      setReceiptData({
        requestId: `REQ-${Date.now().toString().slice(-6)}`,
        serviceName: selectedService?.name || formData.appointmentType,
        amount: finalAmount,
        currency: finalCurrency,
        method: formData.paymentMethod,
        date: new Date().toLocaleDateString(),
        patientName: profile?.name || user?.name || 'Valued Patient',
      });

      setIsSuccess(true);
      onSend();
    } catch (err) {
      toast.error(formatApiError(err) || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      message: '',
      selectedServiceId: '',
      appointmentType: '',
      preferredDate: getTodayDate(),
      preferredTime: '',
      urgency: '',
      symptoms: '',
      medicalHistory: '',
      currentMedications: '',
      insuranceInfo: { provider: '', policyNumber: '' },
      paymentMethod: 'paystack'
    });
    setErrors({});
    setCurrentStep(1);
    setVerifiedTransactionId(null);
    setShowGateway(false);
  };

  const handleClose = () => {
    if (!loading && !processingPayment) {
      onClose();
      if (isSuccess) resetForm();
      setIsSuccess(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-4xl p-0 bg-white border border-blue-200 shadow-2xl [&>button]:hidden overflow-hidden flex flex-col h-[90dvh] sm:h-[85vh] rounded-[2rem] sm:rounded-3xl">
        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Request Confirmed!</h2>
            <p className="text-slate-500 mb-8 max-w-sm font-medium">Your request has been logged. Receipt generated below.</p>
            <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-50 border border-slate-100 mb-8 text-left space-y-4">
              <div className="flex justify-between text-xs font-bold text-slate-400 tracking-widest uppercase">
                <span>Receipt ID</span>
                <span>{receiptData?.requestId}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex justify-between"><span className="text-sm font-medium">Service</span><span className="text-sm font-black">{receiptData?.serviceName}</span></div>
                <div className="flex justify-between"><span className="text-sm font-medium">Status</span><Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px]">PAID</Badge></div>
                <div className="flex justify-between pt-2"><span className="text-lg font-black">Total</span><span className="text-lg font-black text-blue-600">{receiptData?.currency} {receiptData?.amount?.toLocaleString()}</span></div>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full max-w-xs h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase text-white shadow-xl shadow-blue-200">Back Home</Button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                    <Stethoscope className="h-8 w-8 text-blue-200" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight leading-tight uppercase">Clinical Intake</h2>
                    <DialogDescription className="text-blue-200 text-sm font-medium tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />
                      Direct Selection Portal
                    </DialogDescription>
                  </div>
                </div>
                <Button variant="ghost" onClick={handleClose} className="h-10 w-10 p-0 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-1 max-w-2xl mx-auto w-full">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      currentStep === s ? "bg-white text-blue-900 shadow-xl" : currentStep > s ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40"
                    )}>
                      {currentStep > s ? <CheckCircle2 className="h-5 w-5" /> : <span>{s}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {loading && !isSuccess && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4">
                <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center">Processing Clinical Request...</p>
              </div>
            )}
            {!loading && !isSuccess && (
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <ScrollArea className="flex-1">
                  <div className="p-6 sm:p-8 pb-12 sm:pb-16 max-w-3xl mx-auto">
                    <div className="space-y-8">
                      {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                          <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl">
                            <div className="flex items-center gap-3 mb-2">
                              <AlertCircle className="h-5 w-5 text-amber-600" />
                              <span className="text-xs font-black text-amber-900 uppercase tracking-widest">Triage Assessment</span>
                            </div>
                            <p className="text-[11px] text-amber-800 font-medium">Describe your clinical situation for the medical team.</p>
                          </div>
                          <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Summary</Label>
                            <Textarea value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} placeholder="State your symptoms and reason for visit..." className="min-h-[150px] border-slate-200 rounded-2xl focus:ring-blue-500 shadow-inner" />
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Triage Priority</Label>
                            <div className="grid grid-cols-3 gap-3">
                              {['Routine', 'Urgent', 'Emergency'].map(lvl => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, urgency: lvl })}
                                  className={cn(
                                    "px-4 py-3 rounded-2xl border-2 font-black uppercase text-[10px] tracking-tight transition-all",
                                    formData.urgency === lvl ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                                  )}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                          <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl mb-6">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Schedule Parameters</span>
                            </div>
                            <p className="text-[11px] text-blue-800 font-medium">Specify your preferred temporal slot for this session.</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Preferred Date</Label>
                              <Input type="date" value={formData.preferredDate} onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Preferred Time</Label>
                              <Input type="time" value={formData.preferredTime} onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner font-bold" />
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                          <Label className="uppercase text-[10px] font-black tracking-widest text-slate-400">Select Requested Service</Label>
                          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {offeredServices.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, selectedServiceId: s.id, appointmentType: s.name })}
                                className={cn(
                                  "p-5 rounded-3xl border-2 flex justify-between items-center transition-all",
                                  formData.selectedServiceId === s.id ? "border-blue-600 bg-blue-50/50 shadow-md" : "border-slate-100 hover:border-blue-200 bg-white"
                                )}
                              >
                                <div className="text-left">
                                  <span className="font-black text-slate-700 uppercase text-xs block">{s.name}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Clinical Protocol</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-blue-600 font-black tracking-widest">{s.currency} {s.price?.toLocaleString()}</span>
                                  {formData.selectedServiceId === s.id && <CheckCircle2 className="h-4 w-4 text-blue-600 mt-1 inline-block ml-2" />}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { id: 'wallet', name: 'Secure Wallet', icon: Wallet, desc: `Balance: ${finalCurrency} ${walletBalance?.toLocaleString() || '0'}` },
                              { id: 'paystack', name: 'Paystack Secure', icon: PaystackIcon, desc: 'Consultation Fee' },
                              { id: 'flutterwave', name: 'Flutterwave', icon: FlutterwaveIcon, desc: 'Service Payment' }
                            ].map(m => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                                className={cn(
                                  "relative p-6 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all text-center",
                                  formData.paymentMethod === m.id
                                    ? "bg-white border-blue-600 shadow-xl ring-4 ring-blue-50"
                                    : "bg-slate-50/50 border-transparent hover:bg-slate-100"
                                )}
                              >
                                <div className={cn("p-3 rounded-2xl", formData.paymentMethod === m.id ? "bg-blue-600 text-white" : "bg-white text-blue-600 shadow-sm")}>
                                  <m.icon className="h-6 w-6" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-widest block">{m.name}</span>
                                  <span className="text-[8px] text-slate-400 font-bold uppercase">{m.desc}</span>
                                </div>
                              </button>
                            ))}
                          </div>

                          <div className="mt-8 p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100 shadow-sm animate-in fade-in zoom-in duration-500">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultation Billing Summary</span>
                              <Badge className="bg-blue-200/50 text-blue-700 border-none font-black text-[9px] px-2 py-0.5 uppercase">Breakdown</Badge>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-600">Consultation Fee</span>
                                <span className="text-sm font-bold text-slate-900">{finalCurrency} {baseAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                  Platform Regulation Charge
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild><Info className="h-3 w-3 text-slate-300 cursor-help" /></TooltipTrigger>
                                      <TooltipContent><p className="text-[10px] max-w-xs">Standard 15% platform fee for clinical session mediation and secure verified delivery.</p></TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </span>
                                <span className="text-sm font-bold text-blue-600">+ {finalCurrency} {platformCharge.toLocaleString()}</span>
                              </div>
                              <div className="pt-3 border-t border-blue-200/50 flex justify-between items-center">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Total Consultation Amount</span>
                                <span className="text-xl font-black text-blue-600 tracking-tighter">{finalCurrency} {finalAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>

                <div className="flex justify-between items-center gap-4 px-6 py-6 sm:px-10 sm:py-8 border-t border-slate-100 bg-white shrink-0 pb-safe">
                  {currentStep > 1 && (
                    <Button type="button" variant="ghost" onClick={() => setCurrentStep(prev => prev - 1)} className="font-black uppercase text-[10px] tracking-widest text-slate-400">
                      Back
                    </Button>
                  )}
                  <div className="flex-1" />
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={() => { if (validateForm()) setCurrentStep(s => s + 1); }}
                      className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 px-8 sm:px-12 font-black uppercase tracking-widest text-white shadow-lg shadow-blue-200 w-full sm:w-auto"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-emerald-500 hover:bg-emerald-600 rounded-2xl h-14 px-8 sm:px-12 font-black uppercase tracking-widest text-white flex gap-2 shadow-lg shadow-emerald-200 w-full sm:w-auto"
                    >
                      {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white" /> : <Send className="h-4 w-4" />}
                      <span className="truncate">Pay & Confirm</span>
                    </Button>
                  )}
                </div>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PatientRequestModal;
