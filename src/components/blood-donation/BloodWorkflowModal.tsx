import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Droplets,
    Heart,
    Users,
    MapPin,
    AlertCircle,
    X,
    MessageCircle,
    CheckCircle2,
    Activity,
    Navigation,
    ShieldCheck,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BloodWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type WorkflowMode = 'request' | 'donate';

export const BloodWorkflowModal = ({ isOpen, onClose }: BloodWorkflowModalProps) => {
    const [mode, setMode] = useState<WorkflowMode>('request');
    const [bloodType, setBloodType] = useState('');
    const [units, setUnits] = useState('1');
    const [urgency, setUrgency] = useState('Critical');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [hivStatus, setHivStatus] = useState<string>('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const urgencies = ['Critical', 'Urgent', 'Standard'];

    const handleBroadcast = async () => {
        if (!bloodType || !location || (mode === 'donate' && !hivStatus)) {
            toast.error("Please fill in all essential clinical information.");
            return;
        }

        if (mode === 'donate' && hivStatus !== 'Negative') {
            toast.error("Donation requires a confirmed Negative HIV status for clinical safety.");
            return;
        }

        setIsBroadcasting(true);

        // Simulating community-wide broadcast
        setTimeout(() => {
            setIsBroadcasting(false);
            toast.success(
                mode === 'request'
                    ? `BLOOD REQUEST BROADCASTED: The entire UHC community within your proximity has been alerted for ${bloodType} units.`
                    : `DONATION ALERT SENT: The UHC community has been notified that you are ready to donate ${bloodType} blood.`
            );
            onClose();
        }, 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-3xl p-0 border-0 shadow-2xl overflow-hidden bg-white z-[155] fixed top-10 sm:top-[50%] translate-y-0 sm:translate-y-[-50%] max-h-[90vh] flex flex-col">
                {/* Header Section */}
                <div className={cn(
                    "p-8 text-white relative transition-colors duration-500",
                    mode === 'request'
                        ? "bg-gradient-to-br from-red-600 via-rose-700 to-red-900"
                        : "bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900"
                )}>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Droplets className="h-32 w-32" />
                    </div>

                    <div className="relative z-10 flex items-center gap-4 mb-4">
                        <button
                            onClick={onClose}
                            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 group"
                        >
                            <ArrowLeft className="h-6 w-6 text-white group-active:scale-90 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Back</span>
                        </button>
                    </div>

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-white">
                            {mode === 'request' ? <AlertCircle className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
                            {mode === 'request' ? "Request Blood Alert" : "Donate Blood Alert"}
                        </DialogTitle>
                        <DialogDescription className="text-white/80 font-medium mt-1">
                            {mode === 'request'
                                ? "Notify the UHC community and nearest donors for an urgent blood requirement."
                                : "Broadcast your availability to donate blood to the community and emergency responders."}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Mode Toggle */}
                    <div className="mt-8 flex p-1 bg-white/10 backdrop-blur-md rounded-2xl relative z-10 border border-white/20">
                        <button
                            onClick={() => setMode('request')}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                                mode === 'request' ? "bg-white text-red-700 shadow-xl" : "text-white hover:bg-white/5"
                            )}
                        >
                            <Droplets className="h-4 w-4" />
                            Request Blood
                        </button>
                        <button
                            onClick={() => setMode('donate')}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                                mode === 'donate' ? "bg-white text-emerald-700 shadow-xl" : "text-white hover:bg-white/5"
                            )}
                        >
                            <Heart className="h-4 w-4" />
                            Donate Blood
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto scrolling-touch bg-white">
                    {/* Clinical Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Essential Clinical Info</span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Blood Group (ABO/Rh)</Label>
                                <Select onValueChange={setBloodType} value={bloodType}>
                                    <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                        <SelectValue placeholder="Select Blood Group" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[160]">
                                        {bloodGroups.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Units {mode === 'request' ? 'Required' : 'Available'} (Pints)</Label>
                                <Input
                                    type="number"
                                    className="rounded-xl h-11 border-slate-200"
                                    value={units}
                                    onChange={(e) => setUnits(e.target.value)}
                                    placeholder="e.g. 2"
                                />
                            </div>
                            {mode === 'request' ? (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">Urgency Level</Label>
                                    <Select onValueChange={setUrgency} value={urgency}>
                                        <SelectTrigger className={cn(
                                            "rounded-xl h-11 border-slate-200 font-bold",
                                            urgency === 'Critical' ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50"
                                        )}>
                                            <SelectValue placeholder="Urgency" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[160]">
                                            {urgencies.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700">HIV Status</Label>
                                    <Select onValueChange={setHivStatus} value={hivStatus}>
                                        <SelectTrigger className={cn(
                                            "rounded-xl h-11 border-slate-200 font-bold",
                                            hivStatus === 'Negative' ? "text-emerald-600 bg-emerald-50" : hivStatus === 'Positive' ? "text-red-600 bg-red-50" : ""
                                        )}>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[160]">
                                            <SelectItem value="Negative">Negative</SelectItem>
                                            <SelectItem value="Positive">Positive</SelectItem>
                                            <SelectItem value="Unknown">Unknown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Proximity & Location */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Navigation className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Community Reach (Proximity)</span>
                        </div>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                                className="pl-11 h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                placeholder="State your Current City / Neighborhood"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                            <Users className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-blue-800 uppercase tracking-tight">Community Alert Scope</p>
                                <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                                    Your {mode} will be broadcasted to all doctors and community users within a 50km radius and pinned to their dashboards.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reasons/Notes */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700">Clinical Reasoning / Case Overview</Label>
                        <textarea
                            className="w-full rounded-xl border-2 border-slate-100 p-3 text-sm focus:border-blue-500 transition-all font-medium bg-slate-50/50"
                            rows={3}
                            placeholder="State the clinical reason for the request or donor health status..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Safety Buffer for Mobile */}
                    <div className="h-32 pointer-events-none" />
                </div>

                <DialogFooter className="p-6 pb-24 sm:pb-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="ghost"
                        className="rounded-xl h-12 px-6 font-bold text-slate-500 hover:bg-slate-200 flex-1 flex items-center justify-center gap-2"
                        onClick={onClose}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        BACK
                    </Button>
                    <Button
                        disabled={isBroadcasting}
                        className={cn(
                            "rounded-xl h-12 px-8 font-black uppercase tracking-widest shadow-xl flex-[2] transition-all duration-500 active:scale-95 group",
                            mode === 'request'
                                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                        )}
                        onClick={handleBroadcast}
                    >
                        {isBroadcasting ? (
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 animate-spin" />
                                BROADCASTING...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                {mode === 'request' ? <AlertCircle className="h-5 w-5 group-hover:scale-110 transition-transform" /> : <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                                {mode === 'request' ? "BroadCast Blood Request" : "Send Donation Alert"}
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
