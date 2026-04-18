import React, { useState, useEffect } from 'react'; // Refreshed
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Video,
  Phone,
  User,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  ChevronLeft,
  Activity,
  Shield,
  Zap,
  Star,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { appointmentService } from '@/services/appointmentService';
import { CreateAppointmentDto } from '@/types/healthcare-centers';
import { useApprovedProviders } from '@/hooks/useApprovedProviders';
import { useAuth } from '@/hooks/useAuth';
import { integrationsService } from '@/services/integrationsService';
import { discoveryService } from '@/services/discoveryService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { InvoiceModal } from '../dashboard/InvoiceModal';
import toast from 'react-hot-toast';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientId?: string;
  centerId?: string;
}

interface AppointmentTypeOption {
  id: string;
  name: string;
  duration: number;
  color: string;
  dot: string;
  icon: any;
}

const APPOINTMENT_TYPES: AppointmentTypeOption[] = [
  { id: 'consultation', name: 'Clinical Consultation', duration: 60, color: '#3B82F6', dot: 'bg-blue-500', icon: Activity },
  { id: 'follow-up', name: 'Post-Op Follow-up', duration: 30, color: '#10B981', dot: 'bg-emerald-500', icon: Shield },
  { id: 'checkup', name: 'Regular Screening', duration: 45, color: '#8B5CF6', dot: 'bg-purple-500', icon: Star },
  { id: 'emergency', name: 'Urgent Intervention', duration: 120, color: '#EF4444', dot: 'bg-red-500', icon: Zap },
];

const APPOINTMENT_FORMATS = [
  { type: 'in-person', label: 'Physical Visit', icon: MapPin },
  { type: 'video', label: 'Telehealth Link', icon: Video },
  { type: 'phone', label: 'Voice Protocol', icon: Phone },
];

const RECURRENCE_PATTERNS = [
  { value: 'weekly', label: 'Weekly Sync' },
  { value: 'bi-weekly', label: 'Bi-weekly Phase' },
  { value: 'monthly', label: 'Monthly Cycle' },
];

const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = modifier === 'AM' ? '00' : '12';
  else if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
  return `${hours.padStart(2, '0')}:${minutes}`;
};

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patientId,
  centerId
}) => {
  const { profile, user } = useAuth();
  const { doctors, centers, loading: providersLoading, error: providersError } = useApprovedProviders();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userRoles = user?.roles || (profile?.role ? [profile.role] : []);
  const isHealthcareProvider = userRoles.some(r => ['doctor', 'nurse', 'staff', 'center', 'admin'].includes(r));
  const defaultRole = isHealthcareProvider ? 'patient' : 'doctor';

  const [formData, setFormData] = useState<Partial<CreateAppointmentDto>>({
    patientId: patientId || profile?.id || '',
    centerId: centerId || '',
    providerId: '',
    appointmentTypeId: '',
    appointmentDate: '',
    durationMinutes: 30,
    priority: 'normal',
    reason: '',
    notes: '',
    doctor: '',
    isRecurring: false
  });

  const [selectedType, setSelectedType] = useState<string>('consultation');
  const [selectedFormat, setSelectedFormat] = useState<string>('in-person');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>(defaultRole);
  const [searchQuery, setSearchQuery] = useState('');
  const [discoveredProviders, setDiscoveredProviders] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('weekly');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setError(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentStep === 2) handleSearch();
  }, [selectedRole, currentStep, isOpen]);

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      if (selectedRole === 'patient') {
        const { patientService } = await import('@/services/patientService');
        const response = await patientService.getPatients({ search: searchQuery, limit: 20 });
        setDiscoveredProviders(response.data || []);
      } else {
        const response = await discoveryService.searchUsers({ type: selectedRole as any, search: searchQuery, limit: 20 });
        setDiscoveredProviders(response.users || []);
      }
    } catch (err) {
      console.error('Registry exploration failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const canMoveToNextStep = () => {
    if (currentStep === 1) return !!selectedType && !!selectedFormat;
    if (currentStep === 2) return !!selectedProvider && !!selectedDate && !!selectedTime;
    if (currentStep === 3) return !!reason;
    return true;
  };

  const getNextButtonLabel = () => {
    if (loading) return 'Syncing...';
    if (currentStep === 1) return 'Confirm Objective';
    if (currentStep === 2) {
      if (!selectedProvider) return 'Select Personnel';
      if (!selectedDate) return 'Select Date';
      if (!selectedTime) return 'Select Time';
      return 'Commit Protocol';
    }
    if (currentStep === 3) return 'Authorize Session';
    return 'Done';
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const selectedDoctorProvider = doctors.find(d => d.provider?.id === selectedProvider);
      const selectedDoctor = selectedDoctorProvider?.provider;
      const doctorName = selectedDoctor
        ? `Dr. ${selectedDoctor.profile.firstName} ${selectedDoctor.profile.lastName}`
        : 'Medical Specialist';

      const actualPatientId = selectedDoctorProvider?.patientId || formData.patientId || '';
      const time24h = convertTo24Hour(selectedTime);
      const appointmentDateTime = `${selectedDate}T${time24h}:00.000Z`;

      const appointmentData: CreateAppointmentDto = {
        patientId: actualPatientId,
        centerId: selectedCenter || centerId || '',
        appointmentDate: appointmentDateTime,
        durationMinutes: APPOINTMENT_TYPES.find(t => t.id === selectedType)?.duration || 60,
        priority: priority as any,
        reason: reason || 'Standard Consultation',
        notes: notes,
        doctor: doctorName,
        isRecurring: isRecurring,
        providerId: selectedDoctorProvider?.providerId || selectedProvider || ''
      };

      const result = await appointmentService.createAppointment(appointmentData as any);

      // Payment logic placeholder
      if (selectedType === 'consultation' && false) { // Skip payment logic for now unless explicitly needed
        // Payment redirect logic here if required
      }

      toast.success('Clinical session authorized and buffered.');
      setIsSuccess(true);
      setCurrentStep(4);
      onSuccess();
      setTimeout(handleClose, 3000);
    } catch (err) {
      console.error('Session authorization failure:', err);
      setError(err instanceof Error ? err.message : 'System synchronization conflict');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCurrentStep(1);
      setIsSuccess(false);
      setError(null);
    }, 300);
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const renderStep1 = () => (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
      {isHealthcareProvider && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] flex items-start gap-4 mb-4">
          <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
          <div>
            <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Professional Protocol Notice</p>
            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
              Medical Professionals may only utilize this interface to **Reschedule** a medical session or **Rebook** a patient who missed their consultation.
            </p>
          </div>
        </div>
      )}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Objective Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {APPOINTMENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden group ${selectedType === type.id
                ? 'border-primary bg-primary/5 shadow-premium'
                : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${selectedType === type.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                <type.icon className="h-6 w-6" />
              </div>
              <p className="font-black text-slate-900 uppercase text-xs tracking-wider mb-1">{type.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type.duration} Minute Protocol</p>
              {selectedType === type.id && (
                <div className="absolute top-4 right-4 bg-primary rounded-full p-1 shadow-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Channel Protocol</h3>
        <div className="flex flex-wrap gap-4">
          {APPOINTMENT_FORMATS.map((f) => (
            <button
              key={f.type}
              onClick={() => setSelectedFormat(f.type)}
              className={`flex-1 min-w-[140px] p-5 rounded-[24px] border-2 flex items-center justify-center gap-3 transition-all ${selectedFormat === f.type
                ? 'border-primary bg-primary text-white shadow-lg'
                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                }`}
            >
              <f.icon className="h-5 w-5" />
              <span className="font-black text-[10px] uppercase tracking-widest">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => {
    const mockTimeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
    const todayStr = new Date().toISOString().split('T')[0];

    const combinedProviders = [...doctors].filter(p => selectedRole === 'all' || (p.provider?.roles || ['doctor']).includes(selectedRole));
    discoveredProviders.forEach(d => {
      const dId = d.id || d.userId;
      if (!combinedProviders.some(p => p.providerId === dId)) {
        combinedProviders.push({
          id: dId,
          providerId: dId,
          provider: {
            id: dId,
            profile: { firstName: d.firstName || d.fullName?.split(' ')[0], lastName: d.lastName || d.fullName?.split(' ')[1], specialization: d.specialty }
          }
        } as any);
      }
    });

    return (
      <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Temporal Point</Label>
            <Input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-slate-900 shadow-inner focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Temporal Slot</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-slate-900 shadow-inner text-left focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Slot Signature" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-premium">
                {mockTimeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-slate-100">
          <div className="flex-1 space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 group flex items-center justify-between">
              Personnel Selection
              <span className="text-[8px] opacity-60">Network Nodes</span>
            </Label>
            <div className="flex gap-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-12 w-32 md:w-40 rounded-xl bg-slate-50 border-none px-4 font-black text-slate-900 shadow-inner">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-premium">
                  <SelectItem value="doctor">Doctors</SelectItem>
                  <SelectItem value="nurse">Nurses</SelectItem>
                  <SelectItem value="patient">Patients</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-12 rounded-xl bg-slate-50 border-none pl-11 pr-4 font-black text-slate-900 shadow-inner"
                  placeholder="ID scan..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {(providersLoading || isSearching) ? (
              <div className="py-12 flex flex-col items-center justify-center opacity-50"><LoadingSpinner /><p className="mt-4 font-black text-[10px] uppercase tracking-widest">Scanning Network...</p></div>
            ) : combinedProviders.length > 0 ? (
              combinedProviders.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.providerId || p.id)}
                  className={`w-full p-4 md:p-5 rounded-[24px] border-2 flex items-center gap-4 transition-all ${selectedProvider === (p.providerId || p.id)
                    ? 'border-primary bg-primary/5 shadow-premium scale-[0.99] translate-y-0.5'
                    : 'border-slate-50 bg-white hover:border-slate-100 shadow-sm'
                    }`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black transition-colors ${selectedProvider === (p.providerId || p.id) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {p.provider?.profile?.firstName?.charAt(0) || 'P'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-black text-slate-900 uppercase text-[11px] tracking-wider truncate max-w-[150px] sm:max-w-none">
                      {p.provider?.profile?.firstName ? `Dr. ${p.provider.profile.firstName} ${p.provider.profile.lastName}` : ((p as any).name || 'Authenticated Patient')}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{p.provider?.profile?.specialization || 'Clinical Specialist'}</p>
                  </div>
                  {selectedProvider === (p.providerId || p.id) && <CheckCircle className="h-5 w-5 text-primary" />}
                </button>
              ))
            ) : (
              <div className="py-12 text-center font-black text-slate-300 uppercase tracking-[0.2em] text-xs">No Entities Detected</div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderStep3 = () => (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
      <div className="space-y-2">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">SOAP Rationale / Reason</Label>
        <Input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="State clinical objective..."
          className="h-16 rounded-2xl bg-slate-50 border-none px-6 font-black text-slate-900 shadow-inner"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Severity Classification</Label>
        <div className="grid grid-cols-4 gap-3">
          {['low', 'normal', 'high', 'urgent'].map(p => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${priority === p
                ? (p === 'urgent' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 text-white shadow-lg')
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Clinical Supplemental Data</Label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Enter supplementary metadata..."
          className="min-h-[120px] rounded-3xl bg-slate-50 border-none p-6 font-medium italic shadow-inner"
        />
      </div>

      <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
        <input
          type="checkbox"
          id="recurring-toggle"
          checked={isRecurring}
          onChange={e => setIsRecurring(e.target.checked)}
          className="w-6 h-6 rounded-lg border-slate-200 text-primary focus:ring-primary/20"
        />
        <div className="flex-1">
          <Label htmlFor="recurring-toggle" className="font-black text-slate-900 uppercase text-xs tracking-wider cursor-pointer">Temporal Recurrence</Label>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Establish a persistent clinical cycle</p>
        </div>
        {isRecurring && (
          <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
            <SelectTrigger className="w-40 h-12 bg-white border-none rounded-xl shadow-sm px-4 font-black text-[10px] uppercase tracking-widest">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-premium">
              {RECURRENCE_PATTERNS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="py-20 text-center space-y-12">
      {isSuccess ? (
        <>
          <div className="relative inline-block">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              className="w-32 h-32 bg-emerald-500 rounded-[48px] flex items-center justify-center shadow-2xl relative z-10"
            >
              <CheckCircle className="h-16 w-16 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-0 left-0 w-32 h-32 bg-emerald-500 rounded-[48px]"
            />
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-4 leading-none">Session Authorized</h3>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Registry synchronization complete</p>
          </div>
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 text-left">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Signature</p>
                <p className="font-black text-slate-900">{selectedDate} @ {selectedTime}</p>
              </div>
            </div>
            <div
              onClick={() => setIsInvoiceModalOpen(true)}
              className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-emerald-100/50 transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <Shield className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Billing Automated</p>
                  <p className="font-black text-slate-900 leading-none">Generate Digital Invoice</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-32 h-32 bg-red-50 rounded-[48px] flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Authorization Conflict</h3>
            <p className="text-red-500 font-medium italic max-w-sm mx-auto">{error || 'Network node refused authorization protocol.'}</p>
          </div>
          <Button onClick={() => setCurrentStep(1)} className="h-16 px-12 rounded-[24px] bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-premium">
            Retry Protocol
          </Button>
        </>
      )}
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl bg-white border-none shadow-premium sm:rounded-[60px] p-0 overflow-hidden outline-none h-[90dvh] sm:h-auto mb-safe">
        <DialogTitle className="sr-only">Clinical Session Initialization</DialogTitle>
        <DialogDescription className="sr-only">Secure interface for clinical temporal slot authorization.</DialogDescription>

        <div className="flex flex-col h-full md:h-auto max-h-[95vh]">
          {/* HEADER */}
          <div className="p-6 md:p-10 pb-0 flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                {isHealthcareProvider ? 'Reschedule / Rebook' : 'Authorization'}
              </h2>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-0.5">Clinical Session Protocol</p>
            </div>
            <button onClick={handleClose} className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-inner">
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* STEP INDICATOR */}
          {currentStep < 4 && (
            <div className="px-6 md:px-10 mt-6 md:mt-10">
              <div className="flex items-center gap-2 md:gap-4">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex-1">
                    <div className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${s <= currentStep ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-100'}`} />
                    <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-2 transition-colors ${s === currentStep ? 'text-primary' : 'text-slate-300'}`}>
                      {s === 1 ? 'Objective' : s === 2 ? 'Personnel' : 'Rationale'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 md:py-10 pb-32 sm:pb-10 custom-scrollbar">
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </AnimatePresence>
          </div>

          {/* FOOTER */}
          {currentStep < 4 && (
            <div className="p-6 md:p-10 pt-0 pb-10 bg-white">
              <div className="flex flex-col sm:flex-row gap-3">
                {currentStep > 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="h-14 md:h-16 px-6 rounded-2xl md:rounded-[24px] font-black uppercase text-[10px] md:text-xs tracking-widest text-slate-400 order-2 sm:order-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Signature Previous
                  </Button>
                )}
                <Button
                  onClick={currentStep === 3 ? handleSubmit : () => setCurrentStep(prev => prev + 1)}
                  disabled={loading || !canMoveToNextStep()}
                  className="flex-1 h-14 md:h-16 rounded-2xl md:rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] md:text-xs tracking-widest shadow-premium disabled:opacity-50 order-1 sm:order-2"
                >
                  {loading ? <LoadingSpinner size="sm" /> : getNextButtonLabel()}
                  {currentStep < 3 && !loading && <ChevronRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        patientName={formData.patientId || 'Selected Patient'}
      />
    </Dialog>
  );
};
