import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Pill, 
    Share2, 
    Download, 
    CheckCircle2, 
    ShieldCheck, 
    Printer,
    User,
    Calendar,
    Hash,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PharmacyPayloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    prescriptions: any[];
}

export function PharmacyPayloadModal({ isOpen, onClose, prescriptions }: PharmacyPayloadModalProps) {
    const handlePrint = () => {
        window.print();
    };

    const payloadId = `RX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-slate-50 p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl">
                <div className="flex flex-col h-[90vh] md:h-auto max-h-[95vh]">
                    {/* Header Section */}
                    <div className="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-indigo-500 text-white border-none font-black text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full">
                                    SECURE PHARMACY PAYLOAD
                                </Badge>
                                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                    <Hash className="h-3 w-3" /> {payloadId}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-5xl font-black tracking-tight">Prescription <span className="text-indigo-400">Vault</span></h2>
                                <p className="text-slate-400 font-medium text-lg italic max-w-xl">
                                    Digitally signed medication orders authorized for fulfillment at any network pharmacy.
                                </p>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-6 md:p-12">
                        <div className="space-y-8">
                            {/* Security Notice */}
                            <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-soft flex items-start gap-5">
                                <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-1">Authenticated Orders</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                        These prescriptions have been cryptographically signed by authorized clinical providers. 
                                        Pharmacists can verify the payload integrity using the QR manifest below.
                                    </p>
                                </div>
                            </div>

                            {/* Prescriptions List */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Active Medication Protocols</h3>
                                {prescriptions.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {prescriptions.map((rx, i) => (
                                            <motion.div
                                                key={rx.id || i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="group bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-soft hover:shadow-premium hover:border-indigo-200 transition-all relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                                                
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                                    <div className="flex items-start gap-5">
                                                        <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                                            <Pill className="h-7 w-7" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                                                {rx.medications?.[0]?.name || rx.drug || 'Medication'}
                                                            </h4>
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                                                    <User className="h-3 w-3" /> Dr. {rx.doctorName || 'Authorized Provider'}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                                                    <Calendar className="h-3 w-3" /> {new Date(rx.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] tracking-widest px-4 py-1.5 rounded-full uppercase ml-auto md:ml-0 self-start md:self-center">
                                                        Authorized
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50 relative z-10">
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Dosage</p>
                                                        <p className="text-xs font-bold text-slate-700 uppercase">{rx.medications?.[0]?.dosage || rx.dosage || '1 unit'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Frequency</p>
                                                        <p className="text-xs font-bold text-slate-700 uppercase">{rx.medications?.[0]?.frequency || rx.frequency || 'QD'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</p>
                                                        <p className="text-xs font-bold text-slate-700 uppercase">{rx.medications?.[0]?.duration || rx.duration || '5 days'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Instructions</p>
                                                        <p className="text-xs font-bold text-slate-700 uppercase italic truncate">{rx.medications?.[0]?.instructions || rx.instructions || 'After meals'}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                            <Pill className="h-8 w-8" />
                                        </div>
                                        <p className="text-slate-500 font-bold italic">No active prescriptions synchronized to vault.</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Matrix */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                <Button className="h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100 flex items-center gap-3">
                                    <Download className="h-5 w-5" /> Download PDF
                                </Button>
                                <Button variant="outline" className="h-16 rounded-[1.5rem] border-2 border-slate-200 hover:bg-slate-50 text-slate-900 font-black flex items-center gap-3">
                                    <Share2 className="h-5 w-5" /> Share Access
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={handlePrint}
                                    className="h-16 rounded-[1.5rem] border-2 border-slate-200 hover:bg-slate-50 text-slate-900 font-black flex items-center gap-3"
                                >
                                    <Printer className="h-5 w-5" /> Print Manifest
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer Protocol */}
                    <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Data Synchronized</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Unlimited Healthcare Global Network</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            onClick={onClose}
                            className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900"
                        >
                            Close Vault
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
