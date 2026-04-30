import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Truck, ShieldCheck, Clock, MapPin, X, Phone, Lock, Gavel, AlertTriangle } from 'lucide-react';
import { MortuaryStatus } from '@/services/mortuaryService';
import { cn } from '@/lib/utils';

interface RemainsManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    remain: any;
    isAttendant?: boolean;
}

export function RemainsManagementModal({ isOpen, onClose, remain, isAttendant }: RemainsManagementModalProps) {
    if (!remain) return null;

    const isReleased = remain.status === 'Released';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className={cn(
                    "p-6 text-white text-left relative",
                    isReleased ? "bg-slate-800" : 
                    remain.status === MortuaryStatus.LEGAL_HOLD ? "bg-rose-900" : "bg-indigo-600"
                )}>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                {isReleased ? <ShieldCheck className="h-5 w-5" /> : 
                                 remain.status === MortuaryStatus.LEGAL_HOLD ? <Gavel className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                Manage Remains
                            </DialogTitle>
                            <DialogDescription className="text-indigo-100 opacity-90 mt-1">
                                {remain.id} · {remain.deceasedName || remain.name}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Status</p>
                            <div className="flex items-center gap-2">
                                <Badge className={cn("border-none", remain.statusColor)}>
                                    {remain.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Storage Unit</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <MapPin className="h-3 w-3 text-indigo-500" />
                                {remain.unit}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 px-1">Available Actions</h4>
                        <div className="grid gap-2">
                            {isReleased ? (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-3 h-14 rounded-2xl border-gray-100 hover:bg-slate-50 hover:border-slate-200 transition-all"
                                >
                                    <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold">View Release Document</p>
                                        <p className="text-[10px] text-gray-500">Signed manifest MT-DOC-4281</p>
                                    </div>
                                    <ShieldCheck className="ml-auto h-4 w-4 text-emerald-500" />
                                </Button>
                            ) : (
                                <>                                     <Button
                                        variant="outline"
                                        disabled={isAttendant || remain.status === MortuaryStatus.LEGAL_HOLD}
                                        className={cn(
                                            "w-full justify-start gap-3 h-14 rounded-2xl border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group",
                                            (isAttendant || remain.status === MortuaryStatus.LEGAL_HOLD) && "opacity-50 grayscale cursor-not-allowed"
                                        )}
                                    >
                                        <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                            <Truck className="h-4 w-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold">Authorize Release</p>
                                            <p className="text-[10px] text-gray-500">{remain.status === MortuaryStatus.LEGAL_HOLD ? "LOCKED: Legal Hold Active" : "Generate final clearance document"}</p>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start gap-3 h-14 rounded-2xl border-gray-100 hover:bg-rose-50 hover:border-rose-100 transition-all group",
                                            remain.status === MortuaryStatus.LEGAL_HOLD && "bg-rose-50 border-rose-200"
                                        )}
                                    >
                                        <div className="h-8 w-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold">Legal / Coroner Hold</p>
                                            <p className="text-[10px] text-gray-500">{remain.status === MortuaryStatus.LEGAL_HOLD ? "Case under active investigation" : "Flag for coroner or legal hold"}</p>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        disabled={isAttendant}
                                        className={cn(
                                            "w-full justify-start gap-3 h-14 rounded-2xl border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-all group",
                                            isAttendant && "opacity-50 grayscale cursor-not-allowed"
                                        )}
                                    >
                                        <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold">View Certificates</p>
                                            <p className="text-[10px] text-gray-500">Death certificate & Coroner report</p>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-3 h-14 rounded-2xl border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 transition-all group"
                                        onClick={() => window.location.href = `tel:${remain.representativePhone || '555-0199'}`}
                                    >
                                        <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-indigo-900">Call Representative</p>
                                            <p className="text-[10px] text-indigo-600 font-medium">{remain.representativeName || 'Contact Depositor'}</p>
                                        </div>
                                    </Button>

                                </>
                            )}
                        </div>
                    </div>

                    {remain.status === MortuaryStatus.LEGAL_HOLD && (
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-rose-900">ACTIVE LEGAL HOLD</p>
                                <p className="text-[10px] text-rose-700 leading-relaxed mt-0.5">
                                    This case is subject to a legal or coroner's hold. Release is strictly prohibited until a formal clearance is received from the Legal Team or Hospital Administration.
                                </p>
                            </div>
                        </div>
                    )}

                    {remain.hasDoc && isReleased && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-emerald-900">Released & Documented</p>
                                <p className="text-[10px] text-emerald-700 leading-relaxed mt-0.5">
                                    All legal documents have been signed and remains have been formally transferred to authorized representatives.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-0">
                    <Button
                        variant="ghost"
                        className="w-full rounded-2xl h-12 font-bold text-gray-500 hover:bg-gray-100"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
