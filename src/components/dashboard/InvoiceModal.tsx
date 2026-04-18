import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    CreditCard,
    Plus,
    Trash2,
    Download,
    FileText,
    User,
    Calendar,
    ArrowRight,
    Printer,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientName?: string;
    patientId?: string;
    appointmentId?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
    isOpen,
    onClose,
    patientName = "Selected Patient",
    patientId = "anonymous",
    appointmentId
}) => {
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: 'General Consultation', quantity: 1, price: 50.00 }
    ]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState<'edit' | 'preview' | 'success'>('edit');

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulate network delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Trigger Notification and Email Simulation
            await notificationService.createNotification({
                userId: patientId,
                title: 'Healthcare Invoice Generated',
                message: `An invoice for clinical services ($${total.toFixed(2)}) has been generated and electronically dispatched to your email.`,
                type: 'payment',
                deliveryMethod: 'all', // Ensures email is triggered
                data: { appointmentId, total, status: 'dispatched' }
            });

            setIsGenerating(false);
            setStep('success');
            toast.success("Invoice generated and dispatched successfully");
        } catch (error) {
            toast.error("Failed to synchronize financial data");
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] md:max-w-4xl bg-white rounded-[32px] md:rounded-[40px] border-none shadow-2xl p-0 overflow-hidden outline-none z-[200]">
                <div className="flex flex-col h-[85dvh] md:h-[80vh]">
                    {/* Header */}
                    <div className="p-6 md:p-10 pb-0 flex items-center justify-between bg-white border-b border-gray-50">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Invoice Protocol</h2>
                            </div>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">Financial Reconciliation Registry</p>
                        </div>
                        {/* Removed manual close button as DialogContent provides one */}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {step === 'edit' && (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6 md:space-y-10"
                                >
                                    {/* Patient & Metadata */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="bg-slate-50/50 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-inner">
                                            <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Recipient Entity</Label>
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary font-bold">
                                                    <User className="h-5 w-5 md:h-6 md:w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm md:text-base font-black text-slate-900 uppercase truncate max-w-[150px] md:max-w-none">{patientName}</p>
                                                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active Patient Account</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/50 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-inner">
                                            <Label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Temporal Signature</Label>
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 font-bold">
                                                    <Calendar className="h-5 w-5 md:h-6 md:w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm md:text-base font-black text-slate-900 uppercase">{new Date().toLocaleDateString()}</p>
                                                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tight">System Clock Sync</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line Items */}
                                    <div className="space-y-4 md:space-y-6">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Service Line Items</h3>
                                            <Button
                                                onClick={addItem}
                                                variant="outline"
                                                className="rounded-xl h-9 md:h-10 border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-2"
                                            >
                                                <Plus className="h-3 w-3" /> <span className="hidden xs:inline">Add Item</span>
                                            </Button>
                                        </div>

                                        <div className="space-y-3 md:space-y-4">
                                            {items.map((item, index) => (
                                                <div key={item.id} className="grid grid-cols-12 gap-3 md:gap-4 items-end bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm relative">
                                                    <div className="col-span-12 md:col-span-6 space-y-1.5">
                                                        <Label className="text-[9px] font-black text-slate-400 uppercase px-1">Description</Label>
                                                        <Input
                                                            value={item.description}
                                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                            className="h-10 md:h-12 rounded-xl bg-slate-50 border-none px-3 md:px-4 font-bold text-slate-900 text-sm"
                                                            placeholder="Type service name..."
                                                        />
                                                    </div>
                                                    <div className="col-span-4 md:col-span-2 space-y-1.5">
                                                        <Label className="text-[9px] font-black text-slate-400 uppercase px-1">Qty</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                                                            className="h-10 md:h-12 rounded-xl bg-slate-50 border-none px-2 font-bold text-slate-900 text-center text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-5 md:col-span-3 space-y-1.5">
                                                        <Label className="text-[9px] font-black text-slate-400 uppercase px-1">Price ($)</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                                                            className="h-10 md:h-12 rounded-xl bg-slate-50 border-none px-3 font-bold text-slate-900 text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-3 md:col-span-1 flex items-center justify-end pb-1">
                                                        <Button
                                                            onClick={() => removeItem(item.id)}
                                                            variant="ghost"
                                                            className="h-10 w-10 p-0 rounded-xl text-red-300 hover:text-red-500 hover:bg-red-50"
                                                            disabled={items.length === 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="flex justify-end pt-4 md:pt-6">
                                        <div className="w-full md:w-80 space-y-3 bg-slate-900 rounded-[28px] md:rounded-[32px] p-6 md:p-8 text-white shadow-xl">
                                            <div className="flex justify-between text-slate-400">
                                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                                                <span className="font-bold text-sm md:text-base">${subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-400">
                                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">VAT (5%)</span>
                                                <span className="font-bold text-sm md:text-base">${tax.toFixed(2)}</span>
                                            </div>
                                            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Total Due</span>
                                                <span className="text-xl md:text-2xl font-black text-emerald-400">${total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-10 md:py-20 text-center space-y-6 md:space-y-8"
                                >
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-500 rounded-[32px] md:rounded-[48px] flex items-center justify-center mx-auto shadow-2xl relative">
                                        <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">Invoice Synchronized</h3>
                                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px]">Digital reconciliation buffered and ready</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 md:pt-8">
                                        <Button className="h-14 md:h-16 px-8 md:px-10 rounded-[20px] md:rounded-[24px] bg-slate-900 text-white font-black uppercase text-[10px] md:text-xs tracking-widest shadow-premium gap-3">
                                            <Download className="h-4 w-4 md:h-5 md:w-5" /> Download PDF
                                        </Button>
                                        <Button variant="outline" className="h-14 md:h-16 px-8 md:px-10 rounded-[20px] md:rounded-[24px] font-black uppercase text-[10px] md:text-xs tracking-widest gap-3">
                                            <Printer className="h-4 w-4 md:h-5 md:w-5" /> Print Copy
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    {step === 'edit' && (
                        <div className="p-6 md:p-10 bg-white border-t border-gray-50">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || items.some(i => !i.description || i.price <= 0)}
                                className="w-full h-16 md:h-20 rounded-[24px] md:rounded-[32px] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs md:text-sm tracking-widest shadow-premium disabled:opacity-50 flex items-center justify-center gap-4 transition-all"
                            >
                                {isGenerating ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 md:h-5 md:w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="text-[10px] md:text-xs">Syncing Financial Node...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Finalize & Generate Invoice</span>
                                        <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
