import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Download, 
    Send, 
    CheckCircle2, 
    Clock, 
    CreditCard, 
    Receipt,
    Activity,
    ShieldCheck,
    Printer,
    Mail,
    ChevronRight,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BillableItem {
    id: string;
    description: string;
    category: 'Consultation' | 'Laboratory' | 'Imaging' | 'Pharmacy' | 'Ward';
    quantity: number;
    unitPrice: number;
    tax?: number;
}

export function ClinicalInvoiceGenerator({ patientId }: { patientId: string }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [items, setItems] = useState<BillableItem[]>([
        { id: '1', description: 'Emergency MDT Consultation', category: 'Consultation', quantity: 1, unitPrice: 25000 },
        { id: '2', description: 'Stat Lactate & Blood Cultures', category: 'Laboratory', quantity: 1, unitPrice: 12500 },
        { id: '3', description: 'Chest X-Ray (AP View)', category: 'Imaging', quantity: 1, unitPrice: 8000 },
        { id: '4', description: 'Amoxicillin 500mg (14 Units)', category: 'Pharmacy', quantity: 1, unitPrice: 4500 },
    ]);

    const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const tax = subtotal * 0.075; // 7.5% VAT
    const total = subtotal + tax;

    const handleGenerateInvoice = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            toast.success("Invoice Generated", {
                description: "Digital invoice #INV-2026-8841 has been dispatched to the patient portal."
            });
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Financial Dispatch Node</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Automated Billing & Revenue Cycle</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-10 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2">
                        <Search className="h-4 w-4" /> Audit Ledger
                    </Button>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] tracking-widest px-4 py-1.5 uppercase">Sync: Active</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Invoice Preview */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
                        <div className="p-12 border-b border-slate-50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50" />
                            <div className="relative flex justify-between items-start">
                                <div>
                                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Clinical Invoice</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">#INV-2026-8841 · April 30, 2026</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility Code</p>
                                    <p className="text-sm font-black text-slate-900">UHC-HQ-01</p>
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-12">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                        <th className="text-center pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                        <th className="text-right pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {items.map((item) => (
                                        <tr key={item.id} className="group">
                                            <td className="py-6">
                                                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.description}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Item ID: {item.id}</p>
                                            </td>
                                            <td className="py-6 text-center">
                                                <Badge className="bg-slate-50 text-slate-500 border-none font-black text-[8px] uppercase">{item.category}</Badge>
                                            </td>
                                            <td className="py-6 text-right">
                                                <span className="text-sm font-black text-slate-900">₦{item.unitPrice.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-12 flex justify-end">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                                        <span>Subtotal</span>
                                        <span>₦{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                                        <span>VAT (7.5%)</span>
                                        <span>₦{tax.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-slate-100 my-4" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-slate-900 uppercase">Total Amount</span>
                                        <span className="text-2xl font-black text-emerald-600">₦{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <div className="p-8 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified for Insurance Dispatch</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900">
                                    <Printer className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900">
                                    <Mail className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Dispatch Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="py-8">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-indigo-400" /> Revenue Controls
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6">
                            <div className="space-y-4">
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Payment Status</span>
                                        <Badge className="bg-amber-500 text-white border-none text-[8px] font-black uppercase">Unpaid</Badge>
                                    </div>
                                    <p className="text-lg font-black group-hover:text-indigo-400 transition-colors">Dispatch to Patient</p>
                                    <p className="text-[9px] font-bold text-white/40 mt-1 uppercase leading-relaxed">Sends immediate notification to patient mobile app and email.</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Claim Routing</span>
                                        <Badge className="bg-indigo-500 text-white border-none text-[8px] font-black uppercase">Standard</Badge>
                                    </div>
                                    <p className="text-lg font-black group-hover:text-indigo-400 transition-colors">Forward to Insurance</p>
                                    <p className="text-[9px] font-bold text-white/40 mt-1 uppercase leading-relaxed">Routes bill to AXA Mansard (Primary) for pre-authorization.</p>
                                </div>
                            </div>

                            <Button 
                                onClick={handleGenerateInvoice}
                                disabled={isGenerating}
                                className="w-full h-16 bg-white text-black hover:bg-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 shadow-2xl shadow-indigo-900/20"
                            >
                                <Send className={cn("h-5 w-5", isGenerating && "animate-pulse")} />
                                {isGenerating ? "Finalizing Transaction..." : "Finalize & Dispatch"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Activity className="h-4 w-4 text-indigo-500" /> Revenue Lifecycle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {[
                                    { step: 'Bill Compiled', time: '10:42 AM', done: true },
                                    { step: 'Compliance Review', time: '10:45 AM', done: true },
                                    { step: 'Ready for Dispatch', time: 'Now', done: false },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            step.done ? "bg-emerald-500" : "bg-slate-200 animate-pulse"
                                        )} />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase text-slate-900">{step.step}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{step.time}</p>
                                        </div>
                                        {step.done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
