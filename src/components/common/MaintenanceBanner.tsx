import React, { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/services/apiClient';

interface MaintenanceBannerProps {
    maintenanceData?: { enabled: boolean; message: string } | null;
}

const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ maintenanceData }) => {
    const [maintenance, setMaintenance] = useState<{ enabled: boolean; message: string } | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (maintenanceData) {
            setMaintenance(maintenanceData);
            return;
        }

        const fetchSettings = async () => {
            try {
                const response = await apiClient.get('/system/settings');
                if (response.data.success) {
                    setMaintenance({
                        enabled: response.data.data.maintenanceMode,
                        message: response.data.data.maintenanceMessage
                    });
                }
            } catch (error) {
                // Silently fail for system settings fetch to avoid distracting users
                console.error('Failed to fetch system settings', error);
            }
        };

        fetchSettings();

        // Refresh every 5 minutes to stay updated on scheduled maintenance
        const interval = setInterval(fetchSettings, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (!maintenance?.enabled || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gradient-to-r from-[#f59e0b] via-[#ea580c] to-[#f59e0b] text-white relative z-[9999] overflow-hidden shadow-lg border-b border-white/10"
            >
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 bg-white/20 p-2 rounded-xl backdrop-blur-md animate-pulse border border-white/20">
                            <Megaphone className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 leading-tight">System Maintenance</span>
                            <p className="text-xs sm:text-sm font-bold truncate leading-tight mt-0.5">{maintenance.message}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-xl transition-all duration-200 group active:scale-95"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Animated progress bar at the bottom */}
                <div className="h-0.5 w-full bg-white/10 overflow-hidden">
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MaintenanceBanner;
