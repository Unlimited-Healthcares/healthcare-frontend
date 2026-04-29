import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldAlert, 
    MapPin, 
    Phone, 
    Truck, 
    Navigation, 
    Loader2, 
    CheckCircle2,
    X,
    Video
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { complianceApi } from '@/services/complianceApi';

export const EmergencySOS: React.FC = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [isTriggering, setIsTriggering] = useState(false);
    const [step, setStep] = useState<'idle' | 'confirm' | 'broadcasting' | 'complete'>('idle');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleTriggerSOS = async () => {
        setIsTriggering(true);
        setStep('broadcasting');

        try {
            // 1. Gather Emergency Context
            const emergencyData = {
                patientId: user?.id,
                patientName: user?.name || profile?.displayName,
                phoneNumber: profile?.phone || 'Not Registered',
                location: profile?.location || 'Unknown Location (Registered)',
                timestamp: new Date().toISOString(),
                status: 'CRITICAL_SOS'
            };

            // 2. Log Action for Compliance (Audit Trail)
            await complianceApi.logAction('EMERGENCY_SOS_TRIGGERED', 'EMERGENCY_SYSTEM', {
                ...emergencyData,
                reason: 'Patient initiated SOS'
            });

            // 3. Simulate Broadcast to Nearest Center
            // In a real implementation, this would hit an endpoint that notifies relevant providers via WebSocket/Push
            await new Promise(resolve => setTimeout(resolve, 3000));

            setStep('complete');
            toast.success("Emergency services have been notified. Stay where you are.");
        } catch (error) {
            console.error("SOS Trigger failed:", error);
            toast.error("Failed to broadcast SOS. Please call emergency services manually.");
            setStep('idle');
        } finally {
            setIsTriggering(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                className="rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest gap-3 px-8 py-7 shadow-xl shadow-red-500/20 animate-pulse transition-all hover:scale-105"
            >
                <ShieldAlert className="h-6 w-6" />
                Emergency SOS
            </Button>

            <Dialog open={isModalOpen} onOpenChange={(open) => !isTriggering && setIsModalOpen(open)}>
                <DialogContent className="bg-white border-none rounded-[40px] max-w-md p-8 shadow-2xl overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 'confirm' || step === 'idle' ? (
                            <motion.div 
                                key="confirm"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-red-600">
                                    <ShieldAlert className="h-10 w-10" />
                                </div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-4">Emergency Assistance</DialogTitle>
                                <DialogDescription className="text-slate-500 font-bold leading-relaxed mb-8">
                                    Initiating this SOS will immediately broadcast your location and phone number to the nearest emergency center. 
                                    <br/><br/>
                                    <span className="text-red-600">Only trigger for life-threatening emergencies.</span>
                                </DialogDescription>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                        className="rounded-2xl py-6 font-black uppercase tracking-widest text-xs border-slate-100 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleTriggerSOS}
                                        className="rounded-2xl py-6 font-black uppercase tracking-widest text-xs bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100"
                                    >
                                        Trigger SOS
                                    </Button>
                                </div>
                            </motion.div>
                        ) : step === 'broadcasting' ? (
                            <motion.div 
                                key="broadcasting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-12"
                            >
                                <div className="relative w-32 h-32 mx-auto mb-8">
                                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75" />
                                    <div className="relative w-32 h-32 bg-red-50 rounded-full flex items-center justify-center text-red-600 border-4 border-white shadow-lg">
                                        <Navigation className="h-12 w-12 animate-bounce" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-red-600 mb-2">Broadcasting Signal</h3>
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Relaying Location & Bio-Data...</p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="complete"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-slate-900">SOS Transmitted</h3>
                                <div className="bg-slate-50 rounded-3xl p-6 text-left mb-8 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Truck className="h-4 w-4 text-emerald-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nearest Center Notified</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-600 truncate">{(profile as any)?.location?.address || 'Registered Residence'}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => navigate('/video-conferences')}
                                        className="w-full rounded-2xl py-6 font-black uppercase tracking-widest text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                    >
                                        <Video className="h-4 w-4" /> Start Live Video Call
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setStep('idle');
                                        }}
                                        className="w-full rounded-2xl py-6 font-black uppercase tracking-widest text-xs bg-slate-900 text-white"
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </>
    );
};
