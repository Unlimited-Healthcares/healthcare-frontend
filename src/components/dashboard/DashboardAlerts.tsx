import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Bell, Zap, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
    source: string;
}

interface DashboardAlertsProps {
    alerts?: Alert[];
    className?: string;
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ alerts = [], className }) => {
    // Demo alerts if none provided
    const displayAlerts = alerts.length > 0 ? alerts : [
        { id: '1', type: 'critical', message: 'SOS Triggered: Patient location relayed to ER team.', timestamp: 'Just now', source: 'Emergency System' },
        { id: '2', type: 'warning', message: 'Pending MDT Consultation: 10 participants waiting.', timestamp: '5m ago', source: 'MDT Manager' },
        { id: '3', type: 'info', message: 'New DICOM Imaging uploaded for Patient ID: 4521', timestamp: '12m ago', source: 'Radiology Dept' },
    ] as Alert[];

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Clinical Alerts</h3>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">3 Active</span>
            </div>
            
            <AnimatePresence>
                {displayAlerts.map((alert, index) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "p-4 rounded-2xl border flex gap-4 transition-all hover:scale-[1.02] cursor-pointer shadow-sm",
                            alert.type === 'critical' ? "bg-red-50 border-red-100 text-red-900" :
                            alert.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-900" :
                            "bg-blue-50 border-blue-100 text-blue-900"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            alert.type === 'critical' ? "bg-red-600 text-white shadow-lg shadow-red-200" :
                            alert.type === 'warning' ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
                        )}>
                            {alert.type === 'critical' ? <ShieldAlert className="h-5 w-5" /> : 
                             alert.type === 'warning' ? <Zap className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{alert.source}</span>
                                <span className="text-[9px] font-bold opacity-60 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {alert.timestamp}
                                </span>
                            </div>
                            <p className="text-xs font-black leading-snug truncate sm:whitespace-normal">
                                {alert.message}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
