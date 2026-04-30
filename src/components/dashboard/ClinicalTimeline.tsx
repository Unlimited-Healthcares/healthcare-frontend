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

export const ClinicalTimeline: React.FC<ClinicalTimelineProps> = ({ events = [], className }) => {
    // If no events provided, show a default sequence for UI demonstration
    const displayEvents = events.length > 0 ? events : [
        { id: '1', type: 'triage', title: 'Initial ER Triage', description: 'Patient presented with acute respiratory distress. Vitals stabilized.', timestamp: '2026-04-29 08:30', status: 'completed', practitioner: 'Nurse Sarah J.' },
        { id: '2', type: 'consultation', title: 'Cardiological Consultation', description: 'Comprehensive physical examination and history review completed.', timestamp: '2026-04-29 09:15', status: 'completed', practitioner: 'Dr. James Wilson' },
        { id: '3', type: 'lab', title: 'Hematology & Biochemistry', description: 'Full blood count, electrolytes, and cardiac enzymes requested.', timestamp: '2026-04-29 10:00', status: 'completed', practitioner: 'Lab Tech. David L.' },
        { id: '4', type: 'imaging', title: 'Chest X-Ray & CT Thorax', description: 'Imaging performed. DICOM records uploaded to Clinical Vault.', timestamp: '2026-04-29 11:30', status: 'completed', practitioner: 'Radiologist Anna K.' },
        { id: '5', type: 'mdt', title: 'Multidisciplinary Team Call', description: 'Video consultation between Cardiology, Pulmonology, and ER teams.', timestamp: '2026-04-29 14:00', status: 'active', practitioner: 'MDT Group' },
        { id: '6', type: 'meds', title: 'Pharmacological Intervention', description: 'IV Antibiotics and Bronchodilators prescribed.', timestamp: 'Pending', status: 'pending' },
    ] as TimelineEvent[];

    return (
        <div className={cn("space-y-8 relative", className)}>
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100" />
            
            {displayEvents.map((event, index) => {
                const config = eventConfigs[event.type];
                const Icon = config.icon;
                
                return (
                    <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-16 group"
                    >
                        {/* Timeline Node */}
                        <div className={cn(
                            "absolute left-2.5 top-0 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 transition-transform group-hover:scale-110",
                            event.status === 'completed' ? "bg-emerald-500" :
                            event.status === 'active' ? "bg-blue-500 animate-pulse" : "bg-slate-200"
                        )}>
                            {event.status === 'completed' ? (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                            ) : event.status === 'active' ? (
                                <Clock className="h-4 w-4 text-white" />
                            ) : (
                                <div className="h-2 w-2 rounded-full bg-slate-400" />
                            )}
                        </div>

                        {/* Event Content */}
                        <div className={cn(
                            "p-5 rounded-[24px] border shadow-sm transition-all group-hover:shadow-md",
                            config.bg, config.border
                        )}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-xl bg-white shadow-sm", config.color)}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">{event.title}</h4>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full border border-white/20">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{event.timestamp}</span>
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
            })}
        </div>
    );
};
