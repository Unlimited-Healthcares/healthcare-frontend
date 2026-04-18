import React, { useMemo, useState, useEffect } from 'react';
import { Send, Mail, Users, Calculator, Check, AlertCircle, Stethoscope, Landmark, Banknote, CreditCard, Coins, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { discoveryService } from '@/services/discoveryService';
import { User, Center } from '@/types/discovery';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { logger, generateCorrelationId } from '@/utils/logger';
import { CenterService } from '@/types/profile';
import { patientService } from '@/services/patientService';
import { formatApiError } from '@/lib/error-formatter';
import { cn } from '@/lib/utils';
import { Cpu } from 'lucide-react';

type Mode = 'email' | 'in_app';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  recipient: User;
  onSent: () => void;
  preselectedServices?: string[];
};

export const SendRequestModal: React.FC<Props> = ({ isOpen, onClose, recipient, onSent, preselectedServices = [] }) => {
  const { profile, user } = useAuth();
  const [mode, setMode] = useState<Mode>('in_app');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('custom');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('USD');
  const [submitting, setSubmitting] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const providerSettings = recipient.paymentSettings;
  const isBiotech = recipient?.roles?.includes('biotech_engineer');

  const isPatientBooking = useMemo(() => {
    return user?.roles?.includes('patient') || (recipient?.roles?.includes('doctor') && !profile?.centerId);
  }, [user?.roles, recipient?.roles, (profile as any)?.centerId]);

  const availableServices = useMemo(() => {
    return isPatientBooking ? (recipient?.offeredServices || []) : ((profile as any)?.services || []);
  }, [isPatientBooking, recipient?.offeredServices, (profile as any)?.services]);

  // Fetch current patient ID if user is a patient
  useEffect(() => {
    if (isOpen && isPatientBooking) {
      const fetchPatient = async () => {
        try {
          const patient = await patientService.getCurrentPatient();
          if (patient?.id) {
            setCurrentPatientId(patient.id);
          }
        } catch (error) {
          logger.error('Failed to fetch patient info', { error });
        }
      };
      fetchPatient();
    }
  }, [isOpen, isPatientBooking]);

  useEffect(() => {
    if (selectedServiceId === 'custom') {
      setPrice(0);
      setCurrency('USD');
    } else {
      const service = availableServices.find((s: any) => s.id === selectedServiceId || s.name === selectedServiceId);
      if (service) {
        setPrice(service.price || 0);
        setCurrency(service.currency || 'USD');
        if (!message) {
          const prefix = isPatientBooking
            ? "I would like to book your"
            : isBiotech
              ? "I am interested in a technical consultation regarding your"
              : "I would like to offer my";
          setMessage(`Hi ${recipient.displayName}, ${prefix} ${service.name} service. Please confirm availability.`);
        }
      }
    }
  }, [selectedServiceId, availableServices, recipient.displayName, message, isPatientBooking, isBiotech]);

  // Handle preselected services
  useEffect(() => {
    if (isOpen && preselectedServices.length > 0) {
      setSelectedServiceId(preselectedServices[0]);
    }
  }, [isOpen, preselectedServices]);

  // Initialize default payment method if available
  useEffect(() => {
    if (providerSettings?.methods && providerSettings.methods.length > 0 && !paymentMethod) {
      setPaymentMethod(providerSettings.methods[0].type);
    }
  }, [providerSettings, paymentMethod]);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please provide a message');
      return;
    }

    if (selectedServiceId !== 'custom' && !paymentMethod) {
      toast.error('Please select a payment method for the requested service');
      return;
    }

    setSubmitting(true);
    const correlationId = generateCorrelationId();

    try {
      const roles = recipient.roles || [];
      const role = roles[0] || 'doctor';

      const requestType = isPatientBooking
        ? 'patient_request'
        : isBiotech
          ? 'consultation_request'
          : 'connection';

      if (mode === 'email') {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast.error('Please provide a valid email');
          setSubmitting(false);
          return;
        }

        await discoveryService.sendInvitation({
          email,
          invitationType: 'staff_invitation',
          role: 'doctor',
          centerId: (profile as any)?.center_id,
          message: message.trim(),
          metadata: { price, currency, serviceId: selectedServiceId, paymentMethod },
        } as any);

        toast.success('Invitation sent successfully');
      } else {
        await discoveryService.createRequest({
          recipientId: recipient.id,
          requestType,
          message: message.trim(),
          metadata: {
            price,
            currency,
            serviceId: selectedServiceId,
            serviceName: selectedServiceId === 'custom' ? 'Custom Service' : availableServices.find((s: any) => s.id === selectedServiceId)?.name,
            recipientType: role,
            centerId: (profile as any)?.center_id,
            patientId: currentPatientId || undefined,
            paymentMethod,
            source: 'professional_discovery'
          }
        });

        toast.success(isBiotech ? 'Technical consultation request sent!' : 'Request sent successfully');
      }

      onSent();
      onClose();
    } catch (error: any) {
      logger.error('Failed to send request', { error, correlationId });
      const errorMessage = error?.response?.data?.message || 'Failed to send request. Please try again.';
      toast.error(formatApiError(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-white rounded-3xl border-none shadow-2xl overflow-y-auto max-h-[90vh] p-0">
        <div className={cn(
          "p-6 text-white sticky top-0 z-10",
          isBiotech ? "bg-gradient-to-r from-cyan-600 to-teal-700" : "bg-gradient-to-r from-blue-600 to-indigo-700"
        )}>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            {isBiotech ? <Cpu className="h-6 w-6" /> : <Stethoscope className="h-6 w-6" />}
            {isBiotech ? 'Technical Consultation Order' : 'Consultation & Workflow Request'}
          </DialogTitle>
          <DialogDescription className={isBiotech ? "text-cyan-50 mt-1" : "text-blue-100 mt-1"}>
            {isBiotech
              ? `Schedule a meeting with Biotech Specialist ${recipient.displayName}`
              : `Initiate a professional workflow with ${recipient.displayName}`}
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Avatar className="h-14 w-14 border-2 border-white shadow-md">
              <AvatarImage src={recipient.avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                {recipient.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-gray-900">{recipient.displayName}</h4>
              <p className="text-sm text-gray-500">{recipient.specialty || 'Healthcare Professional'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setMode('in_app')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${mode === 'in_app' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                In-App Workflow
              </button>
              <button
                onClick={() => setMode('email')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${mode === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Email Invitation
              </button>
            </div>

            {mode === 'email' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label className="text-sm font-bold text-gray-700 ml-1">Recipient Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 rounded-xl border-slate-200 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700 ml-1">Select Service</Label>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Discussion / Consultation</SelectItem>
                  {availableServices.map((service: any) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.price} {service.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedServiceId !== 'custom' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-600 uppercase font-black tracking-widest">
                        Service Fee Structure
                      </div>
                      <div className="text-sm font-bold text-emerald-900">
                        {price} {currency}
                      </div>
                    </div>
                  </div>

                  {/* Payment Section for Providers */}
                  <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                        <Landmark className="h-3 w-3" /> Payment & Settlement
                      </h5>
                      {providerSettings?.requireUpfrontPayment && (
                        <div className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                          <Info className="h-3 w-3" /> Upfront Required
                        </div>
                      )}
                    </div>

                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="bg-white border-indigo-200 h-9 text-xs font-bold">
                        <SelectValue placeholder="Select Payment Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {providerSettings?.methods && providerSettings.methods.length > 0 ? (
                          providerSettings.methods.map((m: any, idx: number) => (
                            <SelectItem key={`${m.type}-${idx}`} value={m.type} className="text-xs">
                              <div className="flex items-center gap-2">
                                {m.type === 'bank_transfer' ? <Landmark className="h-3 w-3" /> :
                                  m.type === 'crypto' ? <Coins className="h-3 w-3" /> :
                                    m.type === 'facility_payment' ? <Banknote className="h-3 w-3" /> :
                                      <CreditCard className="h-3 w-3" />}
                                {m.label || m.type}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="manual" className="text-xs">Direct/Offline Settlement</SelectItem>
                        )}
                      </SelectContent>
                    </Select>

                    {providerSettings?.methods?.find((m: any) => m.type === paymentMethod)?.instructions && (
                      <div className="p-3 bg-white/80 rounded-xl text-[11px] text-indigo-700 leading-relaxed border border-indigo-50 italic">
                        {providerSettings.methods.find((m: any) => m.type === paymentMethod)?.instructions}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700 ml-1">Message / Instructions</Label>
              <Textarea
                placeholder="Include any specific details or questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="rounded-2xl border-slate-200 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12 font-bold">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={submitting}
            className="flex-1 rounded-xl h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {mode === 'email' ? 'Send Invitation' : 'Send Workflow Request'}
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
