import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Fingerprint, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';

interface ClinicalSecurityGateProps {
    onUnlock: () => void;
    onCancel: () => void;
}

export const ClinicalSecurityGate: React.FC<ClinicalSecurityGateProps> = ({ onUnlock, onCancel }) => {
    const { user } = useAuth();
    const isAmbulanceService = user?.roles?.includes('ambulance_service');
    // In a real app, this would be fetched from the active dispatch state
    // For now, we gate based on a simulation of team composition
    const [teamHasProfessional, setTeamHasProfessional] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const performIdentityVerification = async () => {
        if (isAmbulanceService && !teamHasProfessional) {
            setError("Access Denied: Your current team composition (No Doctor/Nurse) does not permit viewing clinical history.");
            return;
        }
        setIsAuthenticating(true);
        setError(null);

        // Simulated unlock for non-native platforms (Browsers)
        if (!Capacitor.isNativePlatform()) {
            setTimeout(() => {
                onUnlock();
                setIsAuthenticating(false);
                toast.success("Identity Verified: Medical Data Decrypted", {
                    style: { background: '#10b981', color: 'white', border: 'none' }
                });
            }, 1800);
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

            // PRIMARY GOAL: Unlock the UI
            await NativeBiometric.verifyIdentity({
                reason: "Accessing sensitive patient clinical records",
                title: "Clinical Identification",
                subtitle: "Authorized Practitioner Verification Required",
                description: "Confirm your identity to decrypt patient data.",
                negativeButtonText: "Cancel",
            });

            // If we got here, identity is verified
            onUnlock();
            toast.success("Security Authorized", { duration: 2000 });
        } catch (err: any) {
            console.error('Clinical Auth Error:', err);
            // Don't show "canceled" as an error
            if (err.message?.toLowerCase().includes('cancel') || err.message?.toLowerCase().includes('user canceled')) {
                setError(null);
            } else {
                setError(err.message || "Identity verification failed. Access Denied.");
            }
        } finally {
            setIsAuthenticating(false);
        }
    };

    // Auto-prompt on mount for seamless clinical workflow
    React.useEffect(() => {
        performIdentityVerification();
    }, []);

    return (
        <div className="p-8 md:p-14 flex flex-col items-center justify-center text-center space-y-8 min-h-[450px] bg-white relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute inset-0 bg-blue-50/30 -z-10" />
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 animate-pulse" />

            {/* Shield Iconography */}
            <div className="relative">
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-blue-100 rounded-[40px] rotate-12 blur-sm"
                />
                <div className="relative w-24 h-24 bg-white rounded-[32px] border border-blue-50 shadow-premium flex items-center justify-center">
                    <Lock className="w-12 h-12 text-blue-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 border-4 border-white shadow-lg">
                    <ShieldCheck className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Clinical Vault</h3>
                <div className="flex flex-col gap-1">
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Authorized Access Only</p>
                    {isAmbulanceService && (
                        <div className={`mt-2 px-4 py-2 rounded-xl flex items-center justify-center gap-2 border ${teamHasProfessional ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase">Team Qualification: {teamHasProfessional ? 'Certified (Expert Present)' : 'Restricted (Transport Only)'}</span>
                        </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto italic mt-2">
                        "Access is restricted to the assigned Clinical Practitioner. System will now validate your identity and patient relationship."
                    </p>
                </div>
            </div>

            <div className="w-full max-w-sm space-y-4 pt-4">
                <AnimatePresence mode="wait">
                    {error ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-left mb-4"
                        >
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-rose-700 leading-snug">{error}</p>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <Button
                    onClick={performIdentityVerification}
                    disabled={isAuthenticating}
                    className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-[24px] shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50"
                >
                    {isAuthenticating ? (
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="animate-pulse tracking-widest text-sm uppercase">Verifying Hub...</span>
                            </div>
                            <span className="text-[8px] opacity-60 font-medium uppercase tracking-[0.2em]">Patient Assignment Handshake</span>
                        </div>
                    ) : (
                        <>
                            <Fingerprint className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="tracking-tighter">DECRYPT RECORDS</span>
                        </>
                    )}
                </Button>

                <button
                    onClick={onCancel}
                    className="w-full py-4 text-slate-400 hover:text-slate-600 font-black uppercase text-[10px] tracking-[0.3em] transition-colors"
                >
                    Cancel Session
                </button>
            </div>

            <div className="pt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">End-to-End Clinical Encryption Active</span>
                </div>
                <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Unlimited Healthcare Security protocol v2.4</p>
            </div>
        </div>
    );
};
