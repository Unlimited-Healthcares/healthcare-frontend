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

import { notificationService } from '@/services/notificationService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ className }) => {
    const [alerts, setAlerts] = React.useState<Alert[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAlerts = async () => {
            try {
                // Specifically request clinical and urgent notification types
                const response = await notificationService.getNotifications({ 
                    limit: 10,
                    // Note: If the backend supports multiple types, we filter here
                });
                
                const notifications = Array.isArray(response) ? response : (response.notifications || []);
                
                // Filter for strictly clinical/urgent events on the frontend to ensure accuracy
                const clinicalTypes = ['emergency', 'test_result', 'medical_record', 'referral', 'appointment'];
                const filteredNotifications = notifications.filter((n: any) => 
                    clinicalTypes.includes(n.type) || n.isUrgent === true
                );

                const mappedAlerts: Alert[] = filteredNotifications.slice(0, 5).map((n: any) => ({
                    id: n.id,
                    type: n.isUrgent || n.type === 'emergency' ? 'critical' : 
                          n.type === 'test_result' ? 'warning' : 'info',
                    message: n.message,
                    timestamp: notificationService.formatTimeAgo(n.createdAt),
                    source: n.title || 'Clinical Alert'
                }));
                setAlerts(mappedAlerts);
            } catch (error) {
                console.error('Failed to fetch alerts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Clinical Alerts</h3>
                {alerts.length > 0 && (
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">
                        {alerts.length} Active
                    </span>
                )}
            </div>
            
            <AnimatePresence>
                {loading ? (
                    <div className="py-4 flex justify-center">
                        <LoadingSpinner size="sm" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="py-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Bell className="h-5 w-5 text-slate-300 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active alerts</p>
                    </div>
                ) : (
                    alerts.map((alert, index) => (
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{alert.source}</span>
                                <span className="text-[9px] font-bold opacity-60 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {alert.timestamp}
                                </span>
                            </div>
                            <p className="text-xs font-black leading-snug whitespace-normal">
                                {alert.message}
                            </p>
                        </div>
                    </motion.div>
                ))
            )}
            </AnimatePresence>
        </div>
    );
};
