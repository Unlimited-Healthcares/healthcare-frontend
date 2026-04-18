import React, { useState, useEffect } from 'react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';
import { Loader2, Fingerprint, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface BiometricLockProps {
    onUnlock: () => void;
}

export const BiometricLock: React.FC<BiometricLockProps> = ({ onUnlock }) => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signIn } = useAuth();

    const performBiometricUnlock = async () => {
        setIsAuthenticating(true);
        setError(null);

        // Simulated unlock for non-native platforms (Browsers)
        if (!Capacitor.isNativePlatform()) {
            setTimeout(() => {
                onUnlock();
                setIsAuthenticating(false);
            }, 800);
            return;
        }

        // Small hardware readiness delay
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const res = await NativeBiometric.isAvailable();
            if (!res.isAvailable) {
                console.warn("Biometric isAvailable: false");
                setError("Biometric authentication not supported or not setup on this device");
                return;
            }

            // PRIMARY GOAL: Unlock the UI immediately
            await NativeBiometric.verifyIdentity({
                reason: "Unlock Unlimited Healthcare",
                title: "Authentication Required",
                subtitle: "Confirm your identity to continue",
                description: "Use your fingerprint or face to unlock the app",
                negativeButtonText: "Cancel",
            });

            // If we got here, identity is verified
            onUnlock();

            // SECONDARY GOAL: Background sync (Server re-validation)
            try {
                if (!localStorage.getItem('authToken') && localStorage.getItem('uhc_biometric_enabled') === 'true') {
                    const credentials = await NativeBiometric.getCredentials({
                        server: 'unlimited-healthcare.app'
                    });
                    if (credentials) await signIn(credentials.username, credentials.password);
                }
            } catch (silentErr) {
                console.info('Background vault sync skipped or failed', silentErr);
            }

        } catch (err: any) {
            console.error('Biometric interaction failed:', err);
            // Don't show "canceled" as an error, just stop loading
            if (err.message?.toLowerCase().includes('cancel') || err.message?.toLowerCase().includes('user canceled')) {
                setError(null);
            } else {
                setError(err.message || "Identity verification failed. Please try again.");
            }
        } finally {
            setIsAuthenticating(false);
        }
    };

    // Auto-prompt on mount
    useEffect(() => {
        performBiometricUnlock();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 animate-pulse" />

            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-3xl rotate-6 animate-pulse" />
                    <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl -rotate-6 transition-transform" />
                    <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-3xl border border-blue-50 dark:border-blue-800 shadow-premium flex items-center justify-center">
                        <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">App Locked</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Please authenticate to access your medical data</p>
                </div>

                <div className="py-8">
                    {isAuthenticating ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">Waiting for Biometrics...</span>
                        </div>
                    ) : (
                        <Button
                            onClick={performBiometricUnlock}
                            className="h-16 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-black shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Fingerprint className="w-6 h-6" />
                            UNLOCK NOW
                        </Button>
                    )}
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 p-4 rounded-2xl flex items-start gap-3 text-left"
                        >
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 leading-snug">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pt-12 flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-100 dark:border-slate-800">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encrypted Access</span>
                        </div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] font-medium">Unlimited Healthcare Secure Vault v1.1.15</p>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={() => {
                            // Recovery: Move to auth and clear the hard block
                            localStorage.removeItem('uhc_biometric_enabled');
                            localStorage.removeItem('access_token');
                            window.location.href = '/auth';
                        }}
                        className="h-10 text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-widest"
                    >
                        Use Password Instead
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};
