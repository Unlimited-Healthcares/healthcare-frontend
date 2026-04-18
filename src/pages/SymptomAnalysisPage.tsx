import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Bot,
  User,
  Send,
  Loader2,
  Brain,
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
  Truck,
  Activity,
  RotateCcw,
  Heart,
  Thermometer,
  Zap,
  Clock,
  CheckCircle2,
  Info,
  ArrowRight,
  Building2,
  PlusCircle,
  Sparkles,
  ListChecks,
  Flag,
  Pill,
  MessageSquare,
  Calendar,
  ChevronRight,
  Phone,
  ShoppingBag,
  Search,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import symptomAnalysisService, {
  TriageResult,
  TriageLevel,
  StartSessionPayload,
} from '@/services/symptomAnalysisService';
import apiClient from '@/services/apiClient';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface PatientContext {
  age: string;
  sex: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
  existingConditions: string;
  currentMedications: string;
}

type AppPhase = 'onboarding' | 'chat' | 'result';

// ─── Triage-to-Route Mapping ──────────────────────────────────────────────────
// Each triage level maps to 3 possible next-step routes.
// The ROUTES are:
//   1. SELF_CARE/PHARMACY  → /discovery?service=pharmacy  (patient handles it themselves)
//   2. NURSE CHAT          → /chat                         (chat with a duty nurse)
//   3. BOOK DOCTOR         → /centers                      (book an appointment at a center)
//   EMERGENCY              → /emergency                    (escalate immediately)

const TRIAGE_CONFIG: Record<TriageLevel, {
  label: string;
  sublabel: string;
  headerGradient: string;
  badgeColor: string;
  icon: React.ReactNode;
  routes: Array<{
    key: string;
    primary: boolean;
    icon: React.ReactNode;
    label: string;
    description: string;
    buttonLabel: string;
    buttonClass: string;
    path: string;
  }>;
}> = {
  SELF_CARE: {
    label: 'Self-Care Recommended',
    sublabel: 'Your symptoms appear manageable at home or with a pharmacy visit.',
    headerGradient: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    icon: <Heart className="h-6 w-6" />,
    routes: [
      {
        key: 'pharmacy',
        primary: true,
        icon: <Pill className="h-5 w-5" />,
        label: 'Visit a Pharmacy',
        description: 'Pick up OTC medication or get pharmacist advice — no appointment needed.',
        buttonLabel: 'Find Pharmacy',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100',
        path: '/discovery?service=pharmacy',
      },
      {
        key: 'nurse',
        primary: false,
        icon: <MessageSquare className="h-5 w-5" />,
        label: 'Chat with a Nurse',
        description: 'Speak with a duty nurse if you want professional reassurance before self-treating.',
        buttonLabel: 'Message Nurse',
        buttonClass: 'bg-white border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50',
        path: '/chat',
      },
      {
        key: 'doctor',
        primary: false,
        icon: <Stethoscope className="h-5 w-5" />,
        label: 'Book a Doctor (Optional)',
        description: 'If symptoms persist beyond 48 hours, book a non-urgent GP consultation.',
        buttonLabel: 'Book Appointment',
        buttonClass: 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50',
        path: '/centers',
      },
    ],
  },
  GP_CONSULT: {
    label: 'Doctor Consultation Advised',
    sublabel: 'Book a GP or tele-consult within the next 24–72 hours.',
    headerGradient: 'from-blue-500 to-cyan-600',
    badgeColor: 'bg-blue-100 text-blue-800',
    icon: <Stethoscope className="h-6 w-6" />,
    routes: [
      {
        key: 'doctor',
        primary: true,
        icon: <Calendar className="h-5 w-5" />,
        label: 'Book a Doctor Appointment',
        description: 'Select a healthcare center and book a consultation at your convenience.',
        buttonLabel: 'Book Now',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100',
        path: '/centers',
      },
      {
        key: 'nurse',
        primary: false,
        icon: <MessageSquare className="h-5 w-5" />,
        label: 'Chat with a Nurse First',
        description: 'Get advice from a duty nurse; they can help escalate or narrow your needs.',
        buttonLabel: 'Chat with Nurse',
        buttonClass: 'bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50',
        path: '/chat',
      },
      {
        key: 'pharmacy',
        primary: false,
        icon: <Pill className="h-5 w-5" />,
        label: 'Pharmacy for Symptom Relief',
        description: 'Manage symptoms with OTC medication while waiting for your appointment.',
        buttonLabel: 'Find Pharmacy',
        buttonClass: 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50',
        path: '/discovery?service=pharmacy',
      },
    ],
  },
  URGENT_CLINIC: {
    label: 'Urgent Care Required Today',
    sublabel: 'You need to see a clinician today or tomorrow — do not delay.',
    headerGradient: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-100 text-amber-800',
    icon: <Building2 className="h-6 w-6" />,
    routes: [
      {
        key: 'urgent',
        primary: true,
        icon: <Calendar className="h-5 w-5" />,
        label: 'Book Urgent Appointment — Today',
        description: 'Find a center with same-day or next-day availability. Show them this triage result.',
        buttonLabel: 'Book Urgent Slot',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-100',
        path: '/centers',
      },
      {
        key: 'nurse',
        primary: false,
        icon: <Phone className="h-5 w-5" />,
        label: 'Speak with a Nurse Now',
        description: 'A duty nurse can advise while you travel, or escalate to emergency if needed.',
        buttonLabel: 'Contact Nurse',
        buttonClass: 'bg-white border-2 border-amber-200 text-amber-700 hover:bg-amber-50',
        path: '/chat',
      },
      {
        key: 'emergency',
        primary: false,
        icon: <Truck className="h-5 w-5" />,
        label: 'Call Emergency if Worsening',
        description: 'If symptoms worsen suddenly — chest pain, difficulty breathing — call 999.',
        buttonLabel: 'Emergency Dashboard',
        buttonClass: 'bg-red-50 border-2 border-red-200 text-red-700 hover:bg-red-100',
        path: '/emergency',
      },
    ],
  },
  EMERGENCY: {
    label: '🚨 Seek Emergency Care NOW',
    sublabel: 'Call emergency services (999 / 112) IMMEDIATELY. Do not drive yourself.',
    headerGradient: 'from-red-600 to-rose-700',
    badgeColor: 'bg-red-100 text-red-800',
    icon: <Truck className="h-6 w-6" />,
    routes: [
      {
        key: 'call999',
        primary: true,
        icon: <Phone className="h-5 w-5" />,
        label: 'Call 999 / 112 Now',
        description: 'Describe your symptoms to the dispatcher. Request an ambulance immediately.',
        buttonLabel: 'Call Emergency Services',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 animate-pulse',
        path: 'tel:999',
      },
      {
        key: 'emergency-dash',
        primary: false,
        icon: <Truck className="h-5 w-5" />,
        label: 'Emergency Dashboard',
        description: 'Alert your registered emergency contacts and medical team via the app.',
        buttonLabel: 'Open Emergency Dashboard',
        buttonClass: 'bg-white border-2 border-red-200 text-red-700 hover:bg-red-50',
        path: '/emergency',
      },
      {
        key: 'nurse-emergency',
        primary: false,
        icon: <MessageSquare className="h-5 w-5" />,
        label: 'Nurse Support While Waiting',
        description: 'Have someone chat with our duty nurse for continuous guidance until help arrives.',
        buttonLabel: 'Chat with Nurse',
        buttonClass: 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50',
        path: '/chat',
      },
    ],
  },
};

const LIKELIHOOD_COLORS: Record<string, string> = {
  High: 'bg-red-100 text-red-700 border border-red-200',
  Moderate: 'bg-amber-100 text-amber-700 border border-amber-200',
  Low: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const QUICK_SYMPTOMS = [
  { label: 'Chest Pain', icon: <Heart className="h-3.5 w-3.5" /> },
  { label: 'Headache', icon: <Brain className="h-3.5 w-3.5" /> },
  { label: 'Fever', icon: <Thermometer className="h-3.5 w-3.5" /> },
  { label: 'Shortness of Breath', icon: <Activity className="h-3.5 w-3.5" /> },
  { label: 'Stomach Pain', icon: <Zap className="h-3.5 w-3.5" /> },
  { label: 'Fatigue', icon: <Clock className="h-3.5 w-3.5" /> },
];

// ─── Typing Animation ─────────────────────────────────────────────────────────

const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 rounded-full bg-violet-400"
        style={{ animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }}
      />
    ))}
  </div>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isUser ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-gradient-to-br from-violet-600 to-purple-700 text-white'}`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${isUser ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'}`}>
          {msg.isTyping ? <TypingDots /> : <p className="whitespace-pre-wrap">{msg.content}</p>}
        </div>
        <span className="text-[10px] text-slate-400 font-medium px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

// ─── Triage Gateway Result ────────────────────────────────────────────────────

const TriageGateway: React.FC<{
  result: TriageResult;
  onReset: () => void;
}> = ({ result, onReset }) => {
  const navigate = useNavigate();
  const cfg = TRIAGE_CONFIG[result.triageLevel];

  const handleRoute = (path: string) => {
    if (path.startsWith('tel:')) {
      window.location.href = path;
    } else {
      navigate(path);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* ── Level Banner ── */}
      <div className={`rounded-3xl overflow-hidden shadow-xl`}>
        <div className={`bg-gradient-to-r ${cfg.headerGradient} px-6 py-5 text-white`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              {cfg.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-0.5">Triage Assessment Complete</p>
              <h2 className="text-xl font-black leading-tight">{cfg.label}</h2>
              <p className="text-sm text-white/80 font-medium mt-1 leading-relaxed">{cfg.sublabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-Route Gateway ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-slate-400" />
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Your Next Steps</h3>
          <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">Choose a path</span>
        </div>
        <div className="divide-y divide-slate-50">
          {cfg.routes.map((route) => (
            <div key={route.key} className={`p-5 flex items-start gap-4 transition-colors ${route.primary ? 'bg-slate-50/60' : 'hover:bg-slate-50/30'}`}>
              {/* Step indicator */}
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${route.primary ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                {route.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-0.5">
                  <p className="font-black text-slate-800 text-sm truncate">{route.label}</p>
                  {route.primary && (
                    <span className="w-fit text-[8px] sm:text-[9px] font-black bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Recommended</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2 md:line-clamp-none">{route.description}</p>
                <button
                  onClick={() => handleRoute(route.path)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 shadow-sm w-full sm:w-auto ${route.buttonClass}`}
                >
                  <span className="truncate">{route.buttonLabel}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Possible Conditions ── */}
      {result.possibleConditions?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-slate-400" />
            <h3 className="font-black text-slate-700 text-xs uppercase tracking-wider">Possible Conditions Considered</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {result.possibleConditions.map((cond, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{cond.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cond.description}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${LIKELIHOOD_COLORS[cond.likelihood] || LIKELIHOOD_COLORS['Low']}`}>
                  {cond.likelihood}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions & Red Flags side by side ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {result.recommendedActions?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-blue-400" />
              <h3 className="font-black text-slate-700 text-xs uppercase tracking-wider">Actions</h3>
            </div>
            <ul className="px-4 py-3 space-y-2.5">
              {result.recommendedActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.redFlags?.length > 0 && (
          <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-red-100 flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-400" />
              <h3 className="font-black text-red-700 text-xs uppercase tracking-wider">Red Flags</h3>
            </div>
            <ul className="px-4 py-3 space-y-2.5">
              {result.redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-700 leading-relaxed font-medium">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Recommended Specialist ── */}
      {result.recommendedSpecialist && (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 shadow-sm overflow-hidden p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm text-violet-600">
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-0.5 sm:mb-1">Recommended Specialist</p>
              <h4 className="font-black text-slate-800 text-sm sm:text-base truncate">{result.recommendedSpecialist}</h4>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 block sm:hidden">Consultation with a {result.recommendedSpecialist.toLowerCase()} is advised.</p>
          <div className="hidden sm:block flex-1 min-w-0">
            <p className="text-xs text-slate-500">Based on your symptoms, a consultation with a {result.recommendedSpecialist.toLowerCase()} is advised.</p>
          </div>
          <Button
            onClick={() => navigate(`/discovery?specialty=${encodeURIComponent(result.recommendedSpecialist || '')}`)}
            className="w-full sm:w-auto rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold gap-2 px-6 h-11 sm:h-10 shadow-md shadow-violet-200 shrink-0"
          >
            <Search className="h-4 w-4" />
            <span className="truncate">Find {result.recommendedSpecialist}</span>
          </Button>
        </div>
      )}

      {/* ── Reset ── */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 h-11 border-2 border-slate-200 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-colors"
      >
        <RotateCcw className="h-4 w-4" /> Start New Symptom Check
      </button>

      {/* ── Disclaimer ── */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">{result.disclaimer}</p>
      </div>
    </div>
  );
};

// ─── "Skip Triage" Banner ─────────────────────────────────────────────────────

const SkipTriageBanner: React.FC = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl px-5 py-4 flex items-start gap-4 mb-6">
      <Info className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm">Already know what you need?</p>
        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
          AI Triage is <span className="text-white font-bold">optional</span>. Skip it and go straight to booking if you have a follow-up appointment or know your provider.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => navigate('/centers')}
            className="text-xs font-black px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" /> Book Appointment
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="text-xs font-black px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Chat with Nurse
          </button>
          <button
            onClick={() => navigate('/discovery?service=pharmacy')}
            className="text-xs font-black px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Find Pharmacy
          </button>
        </div>
      </div>
      <button onClick={() => setDismissed(true)} className="text-slate-500 hover:text-slate-300 shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const SymptomAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<AppPhase>('onboarding');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [patientCtx, setPatientCtx] = useState<PatientContext>({ age: '', sex: '', existingConditions: '', currentMedications: '' });
  const [initialSymptom, setInitialSymptom] = useState('');
  const [isAiEnabled, setIsAiEnabled] = useState<boolean>(true);
  const [checkingConfig, setCheckingConfig] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await apiClient.get('/system/settings');
        if (res.data?.success) {
          setIsAiEnabled(res.data.data.aiAssistanceEnabled !== false);
        }
      } catch (error) {
        console.error("Failed to check AI config:", error);
      } finally {
        setCheckingConfig(false);
      }
    };
    checkConfig();
  }, []);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const msg: ChatMessage = { id: `${Date.now()}-${Math.random()}`, role, content, timestamp: new Date() };
    setMessages((prev) => prev.filter((m) => !m.isTyping).concat(msg));
  }, []);

  const addTypingIndicator = useCallback(() => {
    setMessages((prev) => [...prev.filter(m => !m.isTyping), {
      id: 'typing', role: 'assistant', content: '', timestamp: new Date(), isTyping: true,
    }]);
  }, []);

  // ─── Start Session ──────────────────────────────────────────────────────────
  const handleStartSession = async () => {
    if (!initialSymptom.trim()) { toast.error('Please describe your symptoms to get started.'); return; }
    setIsLoading(true);
    setPhase('chat');
    const payload: StartSessionPayload = {
      initialSymptoms: initialSymptom,
      age: patientCtx.age || undefined,
      sex: (patientCtx.sex as any) || undefined,
      existingConditions: patientCtx.existingConditions ? patientCtx.existingConditions.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      currentMedications: patientCtx.currentMedications ? patientCtx.currentMedications.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    };
    addMessage('user', initialSymptom);
    addTypingIndicator();
    try {
      const res = await symptomAnalysisService.startSession(payload);
      setSessionId(res.sessionId);
      addMessage('assistant', res.message);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err: any) {
      setMessages([]);
      setPhase('onboarding');
      toast.error(err?.response?.data?.message || 'Failed to start session. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Continue Session ───────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !sessionId || isLoading) return;
    setInputValue('');
    addMessage('user', text);
    addTypingIndicator();
    setIsLoading(true);
    try {
      const res = await symptomAnalysisService.continueSession(sessionId, text);
      if (res.message) addMessage('assistant', res.message);
      if (res.triageResult) setTriageResult(res.triageResult);
      if (res.isComplete) setPhase('result');
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => !m.isTyping));
      toast.error(err?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  // ─── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = async () => {
    if (sessionId) { try { await symptomAnalysisService.abandonSession(sessionId); } catch { /* ignore */ } }
    setPhase('onboarding');
    setSessionId(null);
    setMessages([]);
    setTriageResult(null);
    setInitialSymptom('');
    setPatientCtx({ age: '', sex: '', existingConditions: '', currentMedications: '' });
    setInputValue('');
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-blue-50/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">

            {/* ── Header ── */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-200">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-slate-900">Smart Triage Assistant</h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-widest">
                      <Sparkles className="h-3 w-3" /> AI · Gemini 2.5 Flash
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Your digital triage nurse — describes symptoms, gets routed to the right care.
                  </p>
                </div>
              </div>

              {/* Safety bar */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  <span className="font-black">For life-threatening emergencies, call 999 / 112 immediately.</span>{' '}
                  This tool does not diagnose. It routes you to the appropriate level of care — just like a triage nurse at a clinic.
                </p>
              </div>
            </div>

            {!isAiEnabled && !checkingConfig ? (
              <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-12 text-center space-y-6 max-w-2xl mx-auto my-12 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                  <Zap className="h-10 w-10 opacity-20" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">AI Services Offline</h2>
                  <p className="text-slate-500 font-medium"> The Smart Triage Assistant is currently undergoing maintenance or has been disabled by the administrator. Please use the links below to find care manually.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <Button onClick={() => navigate('/centers')} className="rounded-2xl h-14 bg-slate-900 font-black uppercase text-xs tracking-widest">Book Appointment</Button>
                  <Button onClick={() => navigate('/chat')} variant="outline" className="rounded-2xl h-14 border-slate-200 font-black uppercase text-xs tracking-widest">Chat with Nurse</Button>
                </div>
              </div>
            ) : checkingConfig ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Neural Assets...</p>
              </div>
            ) : (
              <>
                {/* ══ PHASE 1: ONBOARDING ══════════════════════════════════════════ */}
                {phase === 'onboarding' && (
                  <>
                    <SkipTriageBanner />
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                      {/* Left: Symptom Input */}
                      <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
                          <h2 className="text-lg font-black text-slate-900 mb-1">What's bothering you today?</h2>
                          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                            Describe your main symptom(s) freely. The AI will ask follow-up questions — just like a triage nurse taking your vitals.
                          </p>
                          <textarea
                            id="initial-symptom-input"
                            value={initialSymptom}
                            onChange={(e) => setInitialSymptom(e.target.value)}
                            placeholder="E.g. I have a sharp chest pain that started 2 hours ago, gets worse when I breathe in, and I feel slightly short of breath..."
                            className="w-full min-h-[100px] bg-slate-50 rounded-2xl p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-violet-400 focus:outline-none transition-all resize-none border border-slate-100 font-medium leading-relaxed"
                          />
                          <div className="mt-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quick Select</p>
                            <div className="flex flex-wrap gap-2">
                              {QUICK_SYMPTOMS.map((s) => (
                                <button
                                  key={s.label}
                                  onClick={() => setInitialSymptom(s.label)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 ${initialSymptom === s.label ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'}`}
                                >
                                  {s.icon} {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          id="start-symptom-analysis"
                          onClick={handleStartSession}
                          disabled={isLoading || !initialSymptom.trim()}
                          className="w-full h-14 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-black rounded-2xl shadow-lg shadow-violet-200 flex items-center justify-center gap-3 text-base transition-all disabled:opacity-50"
                        >
                          {isLoading
                            ? <><Loader2 className="h-5 w-5 animate-spin" /> Starting...</>
                            : <><Brain className="h-5 w-5" /> Begin Triage Assessment <ArrowRight className="h-5 w-5" /></>}
                        </Button>
                      </div>

                      {/* Right: Context + How it works */}
                      <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck className="h-5 w-5 text-blue-500" />
                            <h3 className="font-black text-slate-800">Patient Context <span className="text-slate-400 font-medium text-xs">(optional)</span></h3>
                          </div>
                          <p className="text-xs text-slate-500 mb-4 leading-relaxed">Helps the AI give a more accurate assessment — like a nurse asking your vitals.</p>
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Age</label>
                              <Input id="patient-age" placeholder="e.g. 35" value={patientCtx.age} onChange={(e) => setPatientCtx(p => ({ ...p, age: e.target.value }))} className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm" />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Biological Sex</label>
                              <div className="grid grid-cols-2 gap-2">
                                {(['male', 'female', 'other', 'prefer_not_to_say'] as const).map((s) => (
                                  <button key={s} onClick={() => setPatientCtx(p => ({ ...p, sex: s }))} className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${patientCtx.sex === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                                    {s === 'prefer_not_to_say' ? 'Prefer not' : s.charAt(0).toUpperCase() + s.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Existing Conditions</label>
                              <Input id="existing-conditions" placeholder="e.g. Asthma, Hypertension" value={patientCtx.existingConditions} onChange={(e) => setPatientCtx(p => ({ ...p, existingConditions: e.target.value }))} className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm" />
                              <p className="text-[10px] text-slate-400 mt-1">Separate with commas</p>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Current Medications</label>
                              <Input id="current-medications" placeholder="e.g. Metformin, Lisinopril" value={patientCtx.currentMedications} onChange={(e) => setPatientCtx(p => ({ ...p, currentMedications: e.target.value }))} className="h-10 bg-slate-50 border-slate-200 rounded-xl text-sm" />
                              <p className="text-[10px] text-slate-400 mt-1">Separate with commas</p>
                            </div>
                          </div>
                        </div>

                        {/* How it works */}
                        <div className="bg-violet-50 rounded-2xl border border-violet-100 p-4 space-y-3">
                          <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest">How It Works</p>
                          {[
                            { step: '1', text: 'You describe symptoms (free text)' },
                            { step: '2', text: 'AI asks follow-up questions like a triage nurse' },
                            { step: '3', text: 'After 4–6 exchanges it risk-stratifies your case' },
                            { step: '4', text: 'It routes you: Self-care → Nurse → Book Doctor → Emergency' },
                          ].map((s) => (
                            <div key={s.step} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 text-[10px] font-black">{s.step}</div>
                              <p className="text-xs text-violet-800 font-medium leading-relaxed">{s.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ══ PHASE 2 & 3: CHAT + RESULT ═══════════════════════════════════ */}
                {(phase === 'chat' || phase === 'result') && (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Chat column */}
                    <div className="lg:col-span-3 flex flex-col">
                      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col" style={{ height: '540px' }}>
                        {/* Chat header */}
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-violet-50 to-purple-50">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm">MedAssist AI · Triage Nurse</p>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] text-slate-400 font-medium">Gemini 2.5 Flash · Active Session</p>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center gap-1.5 h-8 px-3 rounded-xl">
                            <RotateCcw className="h-3.5 w-3.5" /> New
                          </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-slate-50/50">
                          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
                          <div ref={chatBottomRef} />
                        </div>

                        {/* Input */}
                        {phase === 'chat' && (
                          <div className="px-4 py-4 bg-white border-t border-slate-100 shrink-0">
                            <div className="flex items-center gap-2">
                              <Input
                                ref={inputRef}
                                id="symptom-chat-input"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Answer the AI's questions or add more details..."
                                disabled={isLoading}
                                className="flex-1 h-11 bg-slate-50 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-400"
                              />
                              <Button
                                id="send-chat-message"
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputValue.trim()}
                                className="h-11 w-11 p-0 shrink-0 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl text-white shadow-md shadow-violet-200 disabled:opacity-40"
                              >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                              </Button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-2 text-center">
                              Enter to send · The AI asks follow-ups like a triage nurse
                            </p>
                          </div>
                        )}
                        {phase === 'result' && (
                          <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-100 shrink-0 flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <p className="text-sm font-black text-emerald-700">Triage Complete — See your care pathway →</p>
                          </div>
                        )}
                      </div>

                      {phase === 'chat' && (
                        <div className="mt-4 bg-blue-50 rounded-2xl border border-blue-100 px-4 py-3 flex items-center gap-3">
                          <Activity className="h-4 w-4 text-blue-500 shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-blue-700 font-medium mb-1.5">Building your triage profile...</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (messages.filter(m => m.role === 'user').length / 6) * 100)}%` }} />
                              </div>
                              <span className="text-[10px] font-black text-blue-500">{messages.filter(m => m.role === 'user').length}/6+ exchanges</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Result / Sidebar column */}
                    <div className="lg:col-span-2">
                      {phase === 'result' && triageResult ? (
                        <TriageGateway result={triageResult} onReset={handleReset} />
                      ) : (
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Where you'll be routed</p>
                          {[
                            { icon: <Heart className="h-5 w-5" />, color: 'bg-emerald-100 text-emerald-600', level: 'Self-Care', sub: 'Rest + OTC pharmacy visit' },
                            { icon: <MessageSquare className="h-5 w-5" />, color: 'bg-blue-100 text-blue-600', level: 'Chat with Nurse', sub: 'No appointment needed' },
                            { icon: <Calendar className="h-5 w-5" />, color: 'bg-amber-100 text-amber-600', level: 'Book a Doctor', sub: 'Urgent or scheduled slots' },
                            { icon: <Truck className="h-5 w-5" />, color: 'bg-red-100 text-red-600', level: 'Emergency', sub: 'Call 999 · Ambulance dispatched' },
                          ].map((r, i) => (
                            <div key={i} className="flex items-center gap-3 mb-4 last:mb-0">
                              <div className={`w-10 h-10 rounded-2xl ${r.color} flex items-center justify-center shrink-0`}>{r.icon}</div>
                              <div>
                                <p className="font-black text-slate-800 text-sm">{r.level}</p>
                                <p className="text-xs text-slate-500">{r.sub}</p>
                              </div>
                            </div>
                          ))}
                          <div className="mt-6 pt-5 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Skip triage</p>
                            <div className="space-y-2">
                              <button onClick={() => window.location.href = '/centers'} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors">
                                <Calendar className="h-4 w-4 text-slate-400" /> Book Appointment Directly
                              </button>
                              <button onClick={() => window.location.href = '/chat'} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors">
                                <MessageSquare className="h-4 w-4 text-slate-400" /> Go to Nurse Chat
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SymptomAnalysisPage;
