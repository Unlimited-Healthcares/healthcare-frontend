import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, RefreshCw, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnderMaintenancePageProps {
    message?: string;
    onRefresh?: () => void;
}

const UnderMaintenancePage: React.FC<UnderMaintenancePageProps> = ({
    message = "Our engineers are currently performing scheduled maintenance to improve your experience.",
    onRefresh
}) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-amber-100/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 p-8 md:p-12 relative z-10 border border-slate-100"
            >
                {/* Branding */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-blue-600/30">
                            U
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">UnlimitedHealthCares</span>
                    </div>
                </div>

                {/* Animated Icon Container */}
                <div className="relative flex justify-center mb-10">
                    <div className="absolute inset-0 bg-amber-500/10 rounded-full scale-150 blur-2xl animate-pulse"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-orange-500/40 relative">
                        <Hammer className="h-10 w-10 text-white animate-bounce" />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                    System Under <span className="text-orange-600">Maintenance</span>
                </h1>

                <p className="text-lg text-slate-600 font-medium mb-10 leading-relaxed">
                    {message}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                    >
                        <RefreshCw className="h-5 w-5" />
                        Check Status
                    </button>
                    <a
                        href="mailto:support@unlimitedhealthcares.com"
                        className="flex items-center justify-center gap-2 py-4 px-6 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Mail className="h-5 w-5" />
                        Contact Support
                    </a>
                </div>

                <div className="flex items-center justify-center gap-6 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        <Globe className="h-3.5 w-3.5" />
                        Global Registry Active
                    </div>
                    <div className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                        Staging Ready
                    </div>
                </div>
            </motion.div>

            <footer className="mt-12 text-slate-400 font-bold text-sm tracking-tighter relative z-10">
                &copy; {new Date().getFullYear()} UnlimitedHealthCares. All rights reserved.
            </footer>
        </div>
    );
};

export default UnderMaintenancePage;
