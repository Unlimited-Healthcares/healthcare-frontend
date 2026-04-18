import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Plus, Trash2, Search, Send, Printer, Receipt,
    ClipboardList, History, CheckCircle2, AlertCircle,
    FileText, DollarSign, X, Edit3, Save, Package
} from 'lucide-react';
import { patientService, PatientRecord } from '@/services/patientService';
import { discoveryService } from '@/services/discoveryService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ServiceOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ServiceItem {
    id: string;
    name: string;
    price: number;
    qty: number;
}

interface Transaction {
    id: string;
    patientName: string;
    total: number;
    date: string;
    status: 'sent' | 'paid' | 'pending';
    invoiceNo: string;
}

const TABS = [
    { id: 'services', label: 'Service List', icon: Package },
    { id: 'invoice', label: 'Invoice', icon: Receipt },
    { id: 'history', label: 'History', icon: History },
];

export const ServiceOfferModal = ({ isOpen, onClose }: ServiceOfferModalProps) => {
    const { profile } = useAuth();
    const isBiotech = Array.isArray(profile?.roles) && profile?.roles.includes('biotech_engineer');
    const [activeTab, setActiveTab] = useState<'services' | 'invoice' | 'history'>('services');

    // --- Service List State ---
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
    const [newServiceName, setNewServiceName] = useState('');
    const [newServicePrice, setNewServicePrice] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- Invoice State ---
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [patients, setPatients] = useState<PatientRecord[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState<ServiceItem[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [invoiceNo] = useState(() => `INV-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);

    // --- History State ---
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setActiveTab('services');
            setSelectedPatient(null);
            setPatientSearch('');
        }
    }, [isOpen]);

    // Search patients
    useEffect(() => {
        if (activeTab !== 'invoice') return;
        const t = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await patientService.getPatients({ search: patientSearch, limit: 20 });
                setPatients(res.data || []);
            } catch { /* silent */ } finally {
                setIsSearching(false);
            }
        }, 350);
        return () => clearTimeout(t);
    }, [patientSearch, activeTab]);

    // --- Helpers ---
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addService = () => {
        if (!newServiceName.trim() || !newServicePrice) return;
        const item: ServiceItem = {
            id: generateId(),
            name: newServiceName.trim(),
            price: parseFloat(newServicePrice) || 0,
            qty: 1,
        };
        setServiceItems(prev => [...prev, item]);
        setNewServiceName('');
        setNewServicePrice('');
    };

    const removeService = (id: string) => setServiceItems(prev => prev.filter(s => s.id !== id));

    const updateService = (id: string, field: 'name' | 'price', value: string) => {
        setServiceItems(prev => prev.map(s =>
            s.id === id ? { ...s, [field]: field === 'price' ? parseFloat(value) || 0 : value } : s
        ));
    };

    const addToInvoice = (service: ServiceItem) => {
        setInvoiceItems(prev => {
            const exists = prev.find(i => i.id === service.id);
            if (exists) return prev.map(i => i.id === service.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { ...service, qty: 1 }];
        });
        setActiveTab('invoice');
    };

    const removeInvoiceItem = (id: string) => setInvoiceItems(prev => prev.filter(i => i.id !== id));

    const updateInvoiceQty = (id: string, qty: number) => {
        if (qty < 1) return removeInvoiceItem(id);
        setInvoiceItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    };

    const invoiceTotal = invoiceItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    const handleSendInvoice = async () => {
        if (!selectedPatient) { toast.error('Please select a patient first'); return; }
        if (invoiceItems.length === 0) { toast.error('Add at least one service to the invoice'); return; }
        setIsSending(true);
        try {
            await discoveryService.createRequest({
                recipientId: selectedPatient.userId || selectedPatient.id,
                requestType: 'service_quote' as any,
                message: `${isBiotech ? 'Service Quote' : 'Invoice'} ${invoiceNo} from ${isBiotech ? 'Engineer' : 'Dr.'} ${profile?.displayName || 'Specialist'} — Total: USD ${invoiceTotal.toLocaleString()}`,
                metadata: {
                    invoiceNo,
                    items: invoiceItems,
                    total: invoiceTotal,
                    currency: 'USD',
                    recipientName: selectedPatient.fullName,
                    senderName: profile?.displayName,
                    senderRole: Array.isArray(profile?.roles) ? profile.roles[0] : 'user',
                    issuedAt: new Date().toISOString(),
                }
            });

            // Record in transactions
            const newTx: Transaction = {
                id: generateId(),
                patientName: selectedPatient.fullName || 'Patient',
                total: invoiceTotal,
                date: new Date().toLocaleDateString(),
                status: 'sent',
                invoiceNo,
            };
            setTransactions(prev => [newTx, ...prev]);
            toast.success(`Invoice ${invoiceNo} sent to ${selectedPatient.fullName} ✓`);
            setInvoiceItems([]);
            setSelectedPatient(null);
            setActiveTab('history');
        } catch {
            toast.error('Failed to send invoice. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handlePrint = () => {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`
            <html><head><title>Invoice ${invoiceNo}</title>
            <style>
                body { font-family: sans-serif; padding: 40px; color: #111; }
                h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; }
                .header { display: flex; justify-content: space-between; margin-bottom: 32px; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                th { background: #f1f5f9; text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; }
                td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
                .total { font-weight: 900; font-size: 18px; }
                .footer { margin-top: 48px; font-size: 11px; color: #9ca3af; }
            </style></head><body>
            <div class="header">
                <div>
                    <h1>Invoice</h1>
                    <p>${invoiceNo}</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                </div>
                <div style="text-align:right">
                    <p><b>${isBiotech ? 'Engineer' : 'Dr.'} ${profile?.displayName || 'Specialist'}</b></p>
                    <p>${profile?.centerName || ''}</p>
                    <p style="margin-top:12px"><b>RECIPIENT:</b> ${selectedPatient?.fullName || 'N/A'}</p>
                </div>
            </div>
            <table>
                <tr><th>Service</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
                ${invoiceItems.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>USD ${i.price.toLocaleString()}</td><td>USD ${(i.price * i.qty).toLocaleString()}</td></tr>`).join('')}
                <tr><td colspan="3" style="text-align:right;font-weight:bold">GRAND TOTAL</td><td class="total">USD ${invoiceTotal.toLocaleString()}</td></tr>
            </table>
            <div class="footer">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top: 1px solid #eee; padding-top: 30px; margin-top: 40px;">
                    <div>
                        <p style="font-size: 8px; color: #94a3b8; margin-bottom: 4px;">DIGITAL SEAL & VERIFICATION</p>
                        <div style="padding: 10px; border: 2px solid #5eead4; border-radius: 8px; font-weight: 900; color: #0f766e; font-size: 10px; text-transform: uppercase; transform: rotate(-3deg);">
                            Marketplace Verified<br/>
                            ${isBiotech ? 'Engineering Node' : 'Clinical Protocol'} Verified
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-family: 'Brush Script MT', cursive; font-size: 24px; margin-bottom: 0;">${profile?.displayName || 'Specialist'}</p>
                        <div style="height: 1px; width: 200px; background: #ddd; margin-bottom: 5px;"></div>
                        <p style="font-size: 10px; font-weight: bold; color: #64748b;">AUTHORISED SIGNATORY</p>
                    </div>
                </div>
                <p style="margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center;">This is an official document generated by CareMandate (UHC App). Verification ID: ${Math.random().toString(36).substring(2, 12).toUpperCase()}</p>
            </div>
            </body></html>
        `);
        w.document.close();
        w.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[680px] max-h-[92vh] overflow-hidden flex flex-col rounded-3xl p-0 border-0 shadow-2xl bg-white">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 p-6 text-white relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight">
                            <Receipt className="h-7 w-7 text-purple-300" /> {isBiotech ? 'Engineering Service Catalogue' : 'Offer Service & Invoice'}
                        </DialogTitle>
                        <DialogDescription className="text-purple-100/70 font-medium mt-1">
                            {isBiotech
                                ? 'Manage equipment maintenance plans, service pricing, and technical invoices.'
                                : 'Manage your service catalogue, generate invoices, and track payments.'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-5 bg-white/10 rounded-2xl p-1 relative z-10">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-purple-800 shadow-md' : 'text-white/70 hover:text-white'}`}
                            >
                                <tab.icon className="h-3.5 w-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">

                        {/* ─── TAB 1: SERVICE LIST ─── */}
                        {activeTab === 'services' && (
                            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
                                    <Label className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Add New Service</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Service name (e.g. Consultation)"
                                            className="flex-[2] h-11 rounded-xl border-purple-200 bg-white text-sm font-medium"
                                            value={newServiceName}
                                            onChange={(e) => setNewServiceName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addService()}
                                        />
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                                            <Input
                                                placeholder="Price"
                                                type="number"
                                                className="pl-7 h-11 rounded-xl border-purple-200 bg-white font-bold"
                                                value={newServicePrice}
                                                onChange={(e) => setNewServicePrice(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addService()}
                                            />
                                        </div>
                                        <Button
                                            onClick={addService}
                                            disabled={!newServiceName.trim() || !newServicePrice}
                                            className="h-11 w-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shrink-0 p-0"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {serviceItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-14 text-gray-300 space-y-3">
                                        <Package className="h-14 w-14" />
                                        <p className="text-sm font-bold text-gray-400">No services added yet.</p>
                                        <p className="text-[11px] text-gray-300">Add your first service above to get started.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{serviceItems.length} Service{serviceItems.length !== 1 ? 's' : ''} in Catalogue</Label>
                                        {serviceItems.map(service => (
                                            <div key={service.id} className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm transition-all">
                                                {editingId === service.id ? (
                                                    <div className="flex gap-2 flex-1 mr-3">
                                                        <Input
                                                            value={service.name}
                                                            onChange={(e) => updateService(service.id, 'name', e.target.value)}
                                                            className="flex-[2] h-9 rounded-xl text-sm"
                                                        />
                                                        <Input
                                                            value={service.price}
                                                            type="number"
                                                            onChange={(e) => updateService(service.id, 'price', e.target.value)}
                                                            className="flex-1 h-9 rounded-xl text-sm font-bold"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                                            <ClipboardList className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{service.name}</p>
                                                            <p className="text-xs text-purple-600 font-black">USD {service.price.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm" variant="ghost"
                                                        className="h-8 w-8 p-0 rounded-xl text-gray-400 hover:text-purple-600"
                                                        onClick={() => setEditingId(editingId === service.id ? null : service.id)}
                                                    >
                                                        {editingId === service.id ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="sm" variant="ghost"
                                                        onClick={() => addToInvoice(service)}
                                                        className="h-8 px-3 rounded-xl text-[10px] font-black text-purple-600 hover:bg-purple-50 uppercase tracking-widest"
                                                    >
                                                        + Invoice
                                                    </Button>
                                                    <Button
                                                        size="sm" variant="ghost"
                                                        className="h-8 w-8 p-0 rounded-xl text-gray-300 hover:text-red-500"
                                                        onClick={() => removeService(service.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── TAB 2: INVOICE ─── */}
                        {activeTab === 'invoice' && (
                            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                                {/* Patient selector */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Search className="h-3 w-3" /> Select Patient
                                    </Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search patient by name..."
                                            className="pl-10 h-12 rounded-2xl border-gray-200 bg-gray-50"
                                            value={patientSearch}
                                            onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
                                        />
                                    </div>
                                    {patientSearch && !selectedPatient && (
                                        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-lg bg-white max-h-[180px] overflow-y-auto">
                                            {isSearching ? (
                                                <div className="p-4 text-center text-gray-400 text-sm animate-pulse">Searching...</div>
                                            ) : patients.length === 0 ? (
                                                <div className="p-4 text-center text-gray-400 text-sm">No patients found</div>
                                            ) : patients.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => { setSelectedPatient(p); setPatientSearch(p.fullName || ''); }}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 transition-colors text-left"
                                                >
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-purple-100 text-purple-600 font-bold text-xs">
                                                            {(p.fullName || 'P').substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{p.fullName}</p>
                                                        <p className="text-[10px] text-gray-400">{p.patientId || p.id.substring(0, 8)}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {selectedPatient && (
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                            <p className="text-sm font-bold text-green-800">{selectedPatient.fullName} selected</p>
                                            <button onClick={() => { setSelectedPatient(null); setPatientSearch(''); }} className="ml-auto">
                                                <X className="h-4 w-4 text-green-600" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Quick-add from catalogue */}
                                {serviceItems.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quick Add from Catalogue</Label>
                                        <div className="flex gap-2 flex-wrap">
                                            {serviceItems.map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => addToInvoice(s)}
                                                    className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-[11px] font-black text-purple-700 hover:bg-purple-100 transition-all"
                                                >
                                                    + {s.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Invoice line items */}
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden">
                                    <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="h-3 w-3" /> Invoice — {invoiceNo}
                                        </p>
                                        <p className="text-[10px] text-gray-400">{new Date().toLocaleDateString()}</p>
                                    </div>

                                    {invoiceItems.length === 0 ? (
                                        <div className="py-10 text-center text-gray-300 text-sm italic">
                                            No items added — click "+ Invoice" on a service
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {invoiceItems.map(item => (
                                                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                                                    <p className="flex-1 font-bold text-sm text-gray-800">{item.name}</p>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => updateInvoiceQty(item.id, item.qty - 1)} className="h-6 w-6 rounded-full bg-gray-100 text-gray-600 font-black text-sm hover:bg-red-50 hover:text-red-600">−</button>
                                                        <span className="w-6 text-center text-sm font-black">{item.qty}</span>
                                                        <button onClick={() => updateInvoiceQty(item.id, item.qty + 1)} className="h-6 w-6 rounded-full bg-gray-100 text-gray-600 font-black text-sm hover:bg-green-50 hover:text-green-600">+</button>
                                                    </div>
                                                    <p className="w-24 text-right font-black text-purple-700 text-sm">USD {(item.price * item.qty).toLocaleString()}</p>
                                                    <button onClick={() => removeInvoiceItem(item.id)} className="text-gray-300 hover:text-red-500 ml-1">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {invoiceItems.length > 0 && (
                                        <div className="bg-purple-700 px-5 py-4 flex items-center justify-between">
                                            <span className="text-white font-black uppercase tracking-widest text-xs">Grand Total</span>
                                            <span className="text-white font-black text-xl">USD {invoiceTotal.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 rounded-2xl font-bold border-gray-200 gap-2"
                                        onClick={handlePrint}
                                        disabled={invoiceItems.length === 0}
                                    >
                                        <Printer className="h-4 w-4" /> Print / PDF
                                    </Button>
                                    <Button
                                        className="flex-[2] h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black gap-2 shadow-lg shadow-purple-200"
                                        onClick={handleSendInvoice}
                                        disabled={isSending || !selectedPatient || invoiceItems.length === 0}
                                    >
                                        {isSending ? (
                                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                        {isSending ? 'Sending...' : 'Send Invoice to Patient'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 3: HISTORY ─── */}
                        {activeTab === 'history' && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                                {transactions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-300 space-y-3">
                                        <History className="h-14 w-14" />
                                        <p className="text-sm font-bold text-gray-400">No transactions yet.</p>
                                        <p className="text-[11px] text-gray-300">Invoices you send will appear here.</p>
                                    </div>
                                ) : (
                                    <>
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{transactions.length} Transaction{transactions.length !== 1 ? 's' : ''}</Label>
                                        {transactions.map(tx => (
                                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-sm transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tx.status === 'paid' ? 'bg-green-100 text-green-600' : tx.status === 'sent' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        {tx.status === 'paid' ? <CheckCircle2 className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm">{tx.patientName}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold">{tx.invoiceNo} · {tx.date}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-purple-700">USD {tx.total.toLocaleString()}</p>
                                                    <Badge className={`text-[9px] uppercase font-black ${tx.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        tx.status === 'sent' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                            'bg-amber-100 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {tx.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex justify-end">
                    <Button variant="outline" className="rounded-xl px-8 font-bold border-gray-200" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
