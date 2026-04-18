import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import {
    Phone,
    DollarSign,
    Check,
    X,
    Calendar,
    MapPin,
    Video,
    MessageSquare,
    Stethoscope,
    Activity,
    ClipboardList,
    Heart,
    FileText,
    Pill,
    Send,
    Star,
    ArrowLeftRight,
    Building,
    Microscope
} from 'lucide-react';
import { discoveryService } from '@/services/discoveryService';
import { Request } from '@/types/discovery';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface IncomingWorkflowProposalsProps {
    className?: string;
}

export const IncomingWorkflowProposals = ({ className }: IncomingWorkflowProposalsProps) => {
    const { user } = useAuth();
    const [offers, setOffers] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOffer, setSelectedOffer] = useState<Request | null>(null);
    const [action, setAction] = useState<'approve' | 'decline' | 'complete' | null>(null);
    const [viewType, setViewType] = useState<'pending' | 'accepted'>('pending');

    // Form states
    const [declineReason, setDeclineReason] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [isOnline, setIsOnline] = useState('online');
    const [address, setAddress] = useState('');
    const [comments, setComments] = useState('');

    const fetchOffers = async () => {
        setIsLoading(true);
        try {
            // Fetch multiple interactive types
            const types = [
                'service_quote',
                'consultation_request',
                'appointment_proposal',
                'treatment_proposal',
                'call_request',
                'care_task',
                'medical_report_proposal',
                'prescription_proposal',
                'referral',
                'transfer_patient',
                'service_interest',
                'lab_order'
            ];

            const userSpecialty = user?.profile?.specialization || '';

            const promises = types.map(type =>
                discoveryService.getReceivedRequests({
                    type: type as any,
                    status: viewType,
                    specialty: type === 'service_interest' ? userSpecialty : undefined
                }).catch(() => ({ requests: [] }))
            );

            const results = await Promise.all(promises);
            const allRequests = results.flatMap(res => res.requests || []);
            setOffers(allRequests);
        } catch (error) {
            console.error("Failed to fetch proposals:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, [viewType]);

    const handleRespond = async () => {
        if (!selectedOffer || !action) return;

        try {
            if (action === 'decline') {
                if (!declineReason) {
                    toast.error("Please provide a reason for declining");
                    return;
                }
                await discoveryService.respondToRequest(
                    selectedOffer.id,
                    'reject',
                    declineReason
                );
                toast.success("Proposal declined");
            } else if (action === 'complete') {
                await discoveryService.respondToRequest(
                    selectedOffer.id,
                    'approve', // Using approve but with a 'closed' or complete message in metadata if possible
                    `Worklow marked as COMPLETED.`
                );
                toast.success("Workflow marked as completed!");
            } else {
                if (!appointmentDate || !appointmentTime || (isOnline === 'physical' && !address)) {
                    toast.error("Please fill in all mandatory fields");
                    return;
                }

                await discoveryService.respondToRequest(
                    selectedOffer.id,
                    'approve',
                    `I've accepted this proposal and scheduled the workflow.`,
                    {
                        appointmentDate,
                        appointmentTime,
                        isOnline: isOnline === 'online',
                        address: isOnline === 'physical' ? address : 'Online',
                        comments
                    }
                );
                toast.success("Proposal accepted and workflow scheduled!");
            }

            setSelectedOffer(null);
            setAction(null);
            setDeclineReason('');
            fetchOffers();
        } catch (error) {
            toast.error("Failed to process your response");
        }
    };

    const getIcon = (type: string): React.ReactNode => {
        switch (type) {
            case 'service_quote': return <DollarSign className="h-5 w-5" />;
            case 'appointment_proposal': return <Calendar className="h-5 w-5" />;
            case 'treatment_proposal': return <Activity className="h-5 w-5" />;
            case 'call_request': return <Phone className="h-5 w-5" />;
            case 'consultation_request': return <Stethoscope className="h-5 w-5" />;
            case 'care_task': return <ClipboardList className="h-5 w-5" />;
            case 'medical_report_proposal': return <FileText className="h-5 w-5" />;
            case 'prescription_proposal': return <Pill className="h-5 w-5" />;
            case 'referral': return <Send className="h-5 w-5" />;
            case 'transfer_patient': return <ArrowLeftRight className="h-5 w-5" />;
            case 'service_interest': return <Star className="h-5 w-5 text-amber-500" />;
            case 'lab_order': return <Activity className="h-5 w-5 text-emerald-500" />;
            case 'radiology_order': return <Microscope className="h-5 w-5 text-purple-500" />;
            default: return <Activity className="h-5 w-5" />;
        }
    };

    const getTitle = (offer: Request) => {
        const type = offer.requestType;
        if (type === 'service_interest') return `Service Interest: ${offer.metadata?.specialty || 'General'}`;
        if (type === 'lab_order') return `Lab Investigation Request`;
        const name = offer.metadata?.serviceName || offer.metadata?.title || 'Interaction';
        return `${name} Proposal`;
    };

    if (offers.length === 0 && !isLoading) return null;

    return (
        <div className={cn("space-y-6 animate-in fade-in duration-700 font-sans", className)}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg shadow-teal-100 ring-4 ring-teal-50">
                            <Heart className="h-5 w-5 text-white animate-pulse" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-900 via-teal-800 to-slate-800">
                            Interactive Workflows
                        </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest pl-12">
                        Manage clinical proposals & interactions
                    </p>
                </div>

                <div className="flex bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-2xl gap-1.5 border border-slate-200/50 shadow-inner w-full sm:w-auto">
                    <button
                        onClick={() => setViewType('pending')}
                        className={cn(
                            "flex-1 sm:flex-none px-5 py-2 text-xs font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
                            viewType === 'pending'
                                ? 'bg-white shadow-md text-teal-600 ring-1 ring-teal-50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                        )}
                    >
                        Pending
                        {viewType === 'pending' && offers.length > 0 && (
                            <Badge className="bg-teal-600 text-white border-0 h-5 px-1.5 text-[10px] min-w-[20px] justify-center">
                                {offers.length}
                            </Badge>
                        )}
                    </button>
                    <button
                        onClick={() => setViewType('accepted')}
                        className={cn(
                            "flex-1 sm:flex-none px-5 py-2 text-xs font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
                            viewType === 'accepted'
                                ? 'bg-white shadow-md text-teal-600 ring-1 ring-teal-50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                        )}
                    >
                        Active
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
                {isLoading ? (
                    Array(2).fill(0).map((_, i) => (
                        <Card key={i} className="animate-pulse h-[180px] rounded-[32px] border-none bg-slate-100" />
                    ))
                ) : (
                    offers.map((offer) => (
                        <Card key={offer.id} className="group relative border border-teal-100/50 bg-white hover:bg-teal-50/10 rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-teal-100/30 hover:-translate-y-1">
                            {/* Decorative gradient corner */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-50/50 via-teal-50/10 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />

                            <CardContent className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 flex items-center justify-center text-teal-600 shadow-inner group-hover:scale-110 transition-transform duration-500 ring-1 ring-teal-100/50">
                                            {getIcon(offer.requestType)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-base leading-tight group-hover:text-teal-900 transition-colors uppercase tracking-tight">
                                                {getTitle(offer)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <Badge variant="outline" className="text-[9px] font-black bg-blue-50 text-blue-600 border-blue-100 px-1.5 tracking-widest uppercase">
                                                    {offer.requestType.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    by {offer.sender?.profile?.displayName || 'Professional'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {offer.metadata && typeof offer.metadata.price === 'number' && (
                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Quote</p>
                                            <p className="text-sm font-black text-teal-600">
                                                {offer.metadata.price.toLocaleString()} <span className="text-[10px]">USD</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-slate-100/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 mb-6 group-hover:bg-white transition-colors duration-500">
                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-medium">
                                        {offer.message || "No specific message provided with this proposal."}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    {viewType === 'pending' ? (
                                        <>
                                            <Button
                                                size="lg"
                                                className={cn(
                                                    "flex-1 gap-3 rounded-2xl shadow-lg ring-2 ring-teal-50 font-black text-xs uppercase tracking-wider h-12",
                                                    offer.requestType === 'service_interest'
                                                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-100"
                                                        : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100"
                                                )}
                                                onClick={() => {
                                                    setSelectedOffer(offer);
                                                    setAction('approve');
                                                }}
                                            >
                                                {offer.requestType === 'service_interest' ? (
                                                    <><Send className="h-4 w-4" /> Send Proposal</>
                                                ) : (
                                                    <><Check className="h-4 w-4" /> Accept Proposal</>
                                                )}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="rounded-2xl border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all h-12 w-12 shrink-0 group/decline"
                                                onClick={() => {
                                                    setSelectedOffer(offer);
                                                    setAction('decline');
                                                }}
                                            >
                                                <X className="h-5 w-5 group-hover/decline:rotate-90 transition-transform" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="w-full bg-slate-900 hover:bg-black text-white gap-3 rounded-2xl shadow-xl shadow-slate-200 font-black text-xs uppercase tracking-wider h-12"
                                            onClick={() => {
                                                setSelectedOffer(offer);
                                                setAction('complete');
                                            }}
                                        >
                                            <ClipboardList className="h-4 w-4" />
                                            Complete Workflow
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Response Dialog */}
            <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {action === 'approve' ? (
                                <><Check className="h-5 w-5 text-teal-600" /> Accept Proposal</>
                            ) : (
                                <><X className="h-5 w-5 text-red-600" /> Decline Proposal</>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {action === 'approve'
                                ? "Complete the workflow by scheduling this interaction."
                                : "Please tell us why you are declining this proposal."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-6">
                        {action === 'decline' ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-red-500" />
                                    Reason for Declining
                                </Label>
                                <div className="relative">
                                    <Textarea
                                        placeholder="Please provide a brief reason for declining this proposal..."
                                        className="rounded-2xl min-h-[120px] border-gray-200 focus:border-red-500 focus:ring-red-500/20 transition-all text-sm py-3"
                                        value={declineReason}
                                        onChange={(e) => setDeclineReason(e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-teal-600" />
                                            Preferred Date *
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                className="rounded-2xl h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all text-sm px-4"
                                                value={appointmentDate}
                                                onChange={(e) => setAppointmentDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-teal-600" />
                                            Preferred Time *
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="time"
                                                className="rounded-2xl h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all text-sm px-4"
                                                value={appointmentTime}
                                                onChange={(e) => setAppointmentTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50 space-y-4">
                                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <ArrowLeftRight className="h-4 w-4 text-teal-600" />
                                        How would you like to interact?
                                    </Label>
                                    <RadioGroup value={isOnline} onValueChange={setIsOnline} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                        <div className="flex items-center space-x-3 group cursor-pointer">
                                            <RadioGroupItem value="online" id="online" className="border-teal-300 text-teal-600" />
                                            <Label htmlFor="online" className="flex items-center gap-2 font-medium text-gray-600 group-hover:text-teal-600 cursor-pointer transition-colors">
                                                <div className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-100 transition-all group-hover:border-teal-200 group-hover:shadow-teal-100">
                                                    <Video className="h-4 w-4 text-teal-600" />
                                                </div>
                                                Online Consultation
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 group cursor-pointer">
                                            <RadioGroupItem value="physical" id="physical" className="border-teal-300 text-teal-600" />
                                            <Label htmlFor="physical" className="flex items-center gap-2 font-medium text-gray-600 group-hover:text-teal-600 cursor-pointer transition-colors">
                                                <div className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-100 transition-all group-hover:border-teal-200 group-hover:shadow-teal-100">
                                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                Physical Visit
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {isOnline === 'physical' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-emerald-600" />
                                            Location / Address *
                                        </Label>
                                        <Input
                                            placeholder="Enter the full physical address for this interaction..."
                                            className="rounded-2xl h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all text-sm px-4"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-teal-600" />
                                        Additional Notes
                                    </Label>
                                    <Textarea
                                        placeholder="Any specific instructions, preparational steps, or notes for the patient?"
                                        className="rounded-2xl min-h-[100px] border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all text-sm py-3"
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-3 sm:gap-2 pt-2 pb-2">
                        <Button
                            variant="ghost"
                            className="rounded-2xl h-12 px-6 font-bold text-gray-500 hover:bg-gray-100 transition-all"
                            onClick={() => setSelectedOffer(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={cn(
                                "rounded-2xl h-12 px-10 font-bold transition-all shadow-lg active:scale-95",
                                action === 'approve'
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100 hover:shadow-teal-200'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-100 hover:shadow-red-200'
                            )}
                            onClick={handleRespond}
                        >
                            {action === 'approve' ? 'Schedule & Continue' : 'Submit Decline'}
                            <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
