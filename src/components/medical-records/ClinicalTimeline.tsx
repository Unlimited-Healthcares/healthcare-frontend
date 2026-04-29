import React from 'react';
import { motion } from 'framer-motion';
import { 
    Clock, 
    Stethoscope, 
    FlaskConical, 
    FileText, 
    Pill, 
    Zap, 
    Users, 
    Heart, 
    Activity,
    ChevronRight,
    MapPin,
    Phone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
    id: string;
    type: 'triage' | 'consultation' | 'lab' | 'imaging' | 'meds' | 'devices' | 'mdt' | 'eol' | 'emergency';
    title: string;
    description: string;
    date: string;
    status?: 'completed' | 'pending' | 'critical';
    practitioner?: string;
    location?: string;
    metadata?: any;
}

interface ClinicalTimelineProps {
    events: TimelineEvent[];
    className?: string;
}

const EVENT_CONFIG = {
    triage: { icon: Activity, color: 'bg-blue-500', label: 'Triage' },
    consultation: { icon: Stethoscope, color: 'bg-indigo-500', label: 'Consultation' },
    lab: { icon: FlaskConical, color: 'bg-amber-500', label: 'Laboratory' },
    imaging: { icon: Zap, color: 'bg-purple-500', label: 'Imaging' },
    meds: { icon: Pill, color: 'bg-emerald-500', label: 'Medications' },
    devices: { icon: FileText, color: 'bg-slate-500', label: 'Devices' },
    mdt: { icon: Users, color: 'bg-cyan-500', label: 'MDT Call' },
    eol: { icon: Heart, color: 'bg-rose-500', label: 'End of Life' },
    emergency: { icon: MapPin, color: 'bg-red-600', label: 'EMERGENCY' }
};

export const ClinicalTimeline: React.FC<ClinicalTimelineProps> = ({ events, className }) => {
    // Sort events by date descending
    const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className={cn("space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent", className)}>
            {sortedEvents.map((event, index) => {
                const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.consultation;
                const Icon = config.icon;

                return (
                    <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                        {/* Icon */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 bg-white">
                           <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", config.color)}>
                                <Icon className="h-4 w-4" />
                           </div>
                        </div>

                        {/* Content Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-primary/20">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest border-none px-0", config.color.replace('bg-', 'text-'))}>
                                    {config.label}
                                </Badge>
                                <time className="text-[10px] font-bold text-slate-400 uppercase">
                                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </time>
                            </div>

                            <h3 className="text-sm font-black text-slate-900 mb-1">{event.title}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{event.description}</p>

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                                {event.practitioner && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Users className="h-3 w-3 text-slate-500" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600">{event.practitioner}</span>
                                    </div>
                                )}
                                {event.location && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                            <MapPin className="h-3 w-3 text-slate-500" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600">{event.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            {sortedEvents.length === 0 && (
                <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                        <Clock className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Clinical Timeline Synchronized</p>
                </div>
            )}
        </div>
    );
};
