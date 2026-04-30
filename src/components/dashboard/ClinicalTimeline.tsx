import React from 'react';
import { motion } from 'framer-motion';
import { 
    Stethoscope, 
    FlaskConical, 
    Image as ImageIcon, 
    Pill, 
    Cpu, 
    Video, 
    Heart, 
    Activity,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { clinicalService } from '@/services/clinicalService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface TimelineEvent {
    id: string;
    type: 'triage' | 'consultation' | 'lab' | 'imaging' | 'meds' | 'devices' | 'mdt' | 'end_of_life';
    title: string;
    description: string;
    timestamp: string;
    status: 'completed' | 'active' | 'pending';
    practitioner?: string;
}

interface ClinicalTimelineProps {
    events?: TimelineEvent[];
    className?: string;
}

const eventConfigs = {
    triage: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    consultation: { icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    lab: { icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    imaging: { icon: ImageIcon, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    meds: { icon: Pill, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    devices: { icon: Cpu, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
    mdt: { icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    end_of_life: { icon: Heart, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
};

export const ClinicalTimeline: React.FC<ClinicalTimelineProps> = ({ className }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [events, setEvents] = React.useState<TimelineEvent[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const response = await clinicalService.getEncounters({ limit: 5 });
                if (response.data?.success) {
                    const data = response.data.data;
                    const mappedEvents: TimelineEvent[] = data.map((e: any) => ({
                        id: e.id,
                        type: e.type || 'consultation',
                        title: e.title || 'Clinical Encounter',
                        description: e.summary || 'Summary pending documentation.',
                        timestamp: new Date(e.createdAt).toLocaleDateString(),
                        status: e.status === 'finished' ? 'completed' : 'active',
                        practitioner: e.practitionerName || 'Clinical Staff'
                    }));
                    setEvents(mappedEvents);
                }
            } catch (error) {
                console.error('Failed to fetch timeline:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeline();
    }, []);

    return (
        <div className={cn("space-y-6 sm:space-y-8 relative", className)}>
            <div className="absolute left-4 sm:left-6 top-2 bottom-2 w-0.5 bg-slate-100" />
            
            {loading ? (
                <div className="py-12 flex justify-center">
                    <LoadingSpinner size="sm" />
                </div>
            ) : events.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No clinical events recorded</p>
                    <p className="text-[10px] text-slate-300 mt-1">Start a patient encounter to begin the journey.</p>
                </div>
            ) : (
                events.map((event, index) => {
                    const config = eventConfigs[event.type] || eventConfigs.consultation;
                    const Icon = config.icon;
                    
                    return (
                        <motion.div 
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(`/clinical/workspace/${event.id}`)}
                            className="relative pl-10 sm:pl-16 group cursor-pointer"
                        >
                            {/* Timeline Node */}
                            <div className={cn(
                                "absolute left-0.5 sm:left-2.5 top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110",
                                event.status === 'completed' ? "bg-emerald-500" :
                                event.status === 'active' ? "bg-blue-500 animate-pulse" : "bg-slate-200"
                            )}>
                                {event.status === 'completed' ? (
                                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                ) : event.status === 'active' ? (
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                ) : (
                                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-slate-400" />
                                )}
                            </div>

                            {/* Event Content */}
                            <div className={cn(
                                "p-3 sm:p-5 rounded-[24px] border shadow-sm transition-all group-hover:shadow-md",
                                config.bg, config.border
                            )}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className={cn("p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white shadow-sm", config.color)}>
                                            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <h4 className="font-black text-[10px] sm:text-sm uppercase tracking-tight text-slate-900 leading-tight whitespace-normal">{event.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/50 rounded-full border border-white/20 w-fit">
                                        <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tight whitespace-normal">{event.timestamp}</span>
                                    </div>
                                </div>
                                
                                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                                    {event.description}
                                </p>
                                
                                <div className="flex items-center justify-between pt-3 border-t border-white/30">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center">
                                            <ImageIcon className="h-3 w-3 text-slate-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {event.practitioner || 'System Generated'}
                                        </span>
                                    </div>
                                    {event.status === 'active' && (
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" />
                                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Ongoing</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })
            )}
        </div>
    );
};
