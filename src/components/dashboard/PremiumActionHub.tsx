import React from 'react';
import {
    Stethoscope,
    Truck,
    Activity,
    TestTube,
    Pill,
    ArrowRight,
    Sparkles,
    ShieldAlert,
    CalendarCheck,
    Video,
    CreditCard,
    ShoppingCart,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ActionItem {
    id: string;
    label: string;
    sublabel: string;
    icon: any;
    color: string;
    category: string;
    isLarge?: boolean;
}

export const PremiumActionHub = ({ onAction }: { onAction: (action: string) => void }) => {
    const navigate = useNavigate();

    const actions: ActionItem[] = [
        {
            id: 'search',
            label: 'Search for Medical Service',
            sublabel: 'Find verified doctors, centers, and labs',
            icon: Search,
            color: 'from-blue-600 to-indigo-700',
            category: 'Search for Service'
        },
        {
            id: 'subscriptions',
            label: 'Premium Subscriptions',
            sublabel: 'Insurance, Plans & Memberships',
            icon: CreditCard,
            color: 'from-fuchsia-600 to-indigo-800',
            category: 'Pricing'
        },
        {
            id: 'emergency',
            label: 'Critical Emergency',
            sublabel: 'Ambulance, Paramedics, Red Cross',
            icon: ShieldAlert,
            color: 'from-red-600 to-rose-800',
            category: 'Emergency Assistance'
        },
        {
            id: 'call',
            label: 'Call a Doctor',
            sublabel: 'Instant teleconsultation and chat',
            icon: Video,
            color: 'from-emerald-500 to-teal-700',
            category: 'Call a Doctor'
        },
        {
            id: 'book',
            label: 'Book Consultation',
            sublabel: 'In-person visits and surgeries',
            icon: CalendarCheck,
            color: 'from-slate-700 to-slate-900',
            category: 'Book Appointment'
        },
        {
            id: 'labs',
            label: 'Diagnostics & Labs',
            sublabel: 'Blood tests, Scans, Imaging',
            icon: TestTube,
            color: 'from-amber-500 to-orange-700',
            category: 'Diagnostics'
        },
        {
            id: 'pharmacy',
            label: 'Pharmacy Request',
            sublabel: 'Prescription orders and delivery',
            icon: Pill,
            color: 'from-violet-500 to-purple-700',
            category: 'Pharmacy'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[22px] shadow-xl shadow-orange-100 ring-4 ring-orange-50/50">
                            <Sparkles className="h-6 w-6 text-white animate-pulse" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                            Healthcare <span className="text-blue-600">Service</span> Engine
                        </h2>
                    </div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] ml-16">
                        Verified Clinical Protocols & Workflows
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {actions.map((action, idx) => (
                    <button
                        key={action.id}
                        onClick={() => onAction(action.category)}
                        className={cn(
                            "relative group flex flex-col justify-between p-5 md:p-6 rounded-[28px] md:rounded-[32px] text-white overflow-hidden transition-all duration-700 hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-2 text-left border-none h-full min-h-[160px] md:min-h-[200px]",
                            `bg-gradient-to-br ${action.color} shadow-lg`,
                            idx % 3 === 0 ? "shadow-blue-200/20" : idx % 3 === 1 ? "shadow-rose-200/20" : "shadow-emerald-200/20"
                        )}
                    >
                        {/* Interactive Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

                        {/* Massive Decorative Icon */}
                        <div className="absolute -right-6 -bottom-6 opacity-[0.08] transition-all duration-1000 group-hover:scale-125 group-hover:-rotate-12 group-hover:opacity-[0.15]">
                            <action.icon size={120} className="w-[100px] h-[100px] md:w-[120px] md:h-[120px]" />
                        </div>

                        <div className="relative z-10 w-full">
                            <div className="flex justify-between items-start mb-4 md:mb-6 w-full">
                                <div className="p-3 md:p-3.5 bg-white/15 rounded-2xl md:rounded-3xl backdrop-blur-xl ring-1 ring-white/30 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <action.icon className="h-5 w-5 md:h-6 md:w-6 stroke-[2.5px] drop-shadow-md" />
                                </div>
                                <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-2xl bg-black/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 translate-x-[-10px] group-hover:translate-x-0 transition-transform duration-500" />
                                </div>
                            </div>

                            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter leading-[1] md:leading-[0.9] mb-2 group-hover:tracking-normal transition-all duration-500 italic break-words">
                                {action.label.split(' ').map((word, i) => (
                                    <span key={i} className={cn("inline sm:block", i > 0 && "opacity-90 ml-1 sm:ml-0")}>{word}</span>
                                ))}
                            </h3>
                            <p className="text-white/70 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] leading-relaxed max-w-[90%] md:max-w-[80%]">
                                {action.sublabel}
                            </p>
                        </div>

                        <div className="relative z-10 mt-6 md:mt-8 flex items-center gap-3">
                            <div className="px-3 md:px-4 py-1.5 bg-white/10 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-500">
                                Start Protocol
                            </div>
                            <div className="h-px flex-1 bg-white/20 group-hover:bg-white/40 transition-colors" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
