import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Settings,
    Wrench,
    ShieldAlert,
    HelpCircle,
    GraduationCap,
    ShoppingCart,
    FileText,
    RefreshCw,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Construction
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type BiotechWorkflowType =
    | 'installation'
    | 'maintenance'
    | 'safety'
    | 'support'
    | 'training'
    | 'procurement'
    | 'documentation'
    | 'upgrades';

interface BiotechWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: BiotechWorkflowType;
    patient?: { id: string; name: string };
}

export const BiotechWorkflowModal: React.FC<BiotechWorkflowModalProps> = ({
    isOpen,
    onClose,
    type,
    patient
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [equipmentName, setEquipmentName] = useState('');
    const [notes, setNotes] = useState('');

    const getWorkflowConfig = () => {
        switch (type) {
            case 'installation':
                return {
                    title: 'Equipment Installation & Setup',
                    description: 'Commissioning and configuring new clinical technology.',
                    icon: Construction,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50'
                };
            case 'maintenance':
                return {
                    title: 'Maintenance & Repair',
                    description: 'Logging service requests and equipment restoration.',
                    icon: Wrench,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50'
                };
            case 'safety':
                return {
                    title: 'Safety & Risk Management',
                    description: 'Conducting safety audits and risk assessments.',
                    icon: ShieldAlert,
                    color: 'text-rose-600',
                    bgColor: 'bg-rose-50'
                };
            case 'support':
                return {
                    title: 'Technical Support',
                    description: 'Providing technical assistance to clinical staff.',
                    icon: HelpCircle,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50'
                };
            case 'training':
                return {
                    title: 'Equipment Training',
                    description: 'Planning and logging staff training sessions.',
                    icon: GraduationCap,
                    color: 'text-emerald-600',
                    bgColor: 'bg-emerald-50'
                };
            case 'procurement':
                return {
                    title: 'Procurement & Planning',
                    description: 'Technology selection and technology planning.',
                    icon: ShoppingCart,
                    color: 'text-indigo-600',
                    bgColor: 'bg-indigo-50'
                };
            case 'documentation':
                return {
                    title: 'Documentation & Records',
                    description: 'Managing technical manuals and compliance logs.',
                    icon: FileText,
                    color: 'text-slate-600',
                    bgColor: 'bg-slate-50'
                };
            case 'upgrades':
                return {
                    title: 'Upgrades & Integration',
                    description: 'System software updates and network integration.',
                    icon: RefreshCw,
                    color: 'text-teal-600',
                    bgColor: 'bg-teal-50'
                };
            default:
                return {
                    title: 'Biotech Task',
                    description: 'Engineering workflow interaction.',
                    icon: Settings,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50'
                };
        }
    };

    const config = getWorkflowConfig();

    const handleSubmit = async () => {
        if (!equipmentName.trim()) {
            toast.error("Equipment name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`${config.title} logged successfully!`);
            onClose();
        } catch (error) {
            toast.error("Failed to log engineering task");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[40px] border-none shadow-2xl h-[90vh] sm:h-auto flex flex-col">
                <div className={cn("p-6 sm:p-8 shrink-0", config.bgColor)}>
                    <DialogHeader>
                        <div className="flex items-center gap-4 mb-2">
                            <div className={cn("p-3 rounded-2xl bg-white shadow-sm", config.color)}>
                                <config.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight">{config.title}</DialogTitle>
                                <DialogDescription className="font-medium text-slate-600">
                                    {config.description}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Equipment Name / ID</Label>
                            <Input
                                placeholder="e.g., MRI-04, Ventilator-B"
                                className="rounded-xl border-slate-200 h-12 focus:ring-2 focus:ring-blue-500 font-medium"
                                value={equipmentName}
                                onChange={(e) => setEquipmentName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Department / Unit</Label>
                            <Input
                                placeholder="e.g., Radiology, ICU"
                                className="rounded-xl border-slate-200 h-12 focus:ring-2 focus:ring-blue-500 font-medium"
                            />
                        </div>
                    </div>

                    {/* Workflow Specific content */}
                    {type === 'maintenance' && (
                        <div className="space-y-4 pt-2">
                            <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Work Details</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-14 rounded-xl justify-start gap-3 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                    <div className="text-left">
                                        <div className="text-xs font-black uppercase text-slate-400">Type</div>
                                        <div className="font-bold">Routine Service</div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="h-14 rounded-xl justify-start gap-3 border-slate-100 hover:border-rose-500 hover:bg-rose-50 transition-all">
                                    <AlertCircle className="h-5 w-5 text-rose-600" />
                                    <div className="text-left">
                                        <div className="text-xs font-black uppercase text-slate-400">Type</div>
                                        <div className="font-bold">Emergency Repair</div>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Technical Notes / Observations</Label>
                        <Textarea
                            placeholder="Provide detailed technical notes regarding the work performed..."
                            className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Status Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <div>
                                <p className="font-bold text-slate-900">System Functional</p>
                                <p className="text-xs text-slate-500">Mark equipment as operational after work.</p>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-xl h-8 text-[10px] font-black uppercase bg-white">Toggle</Button>
                    </div>
                </div>

                <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 shrink-0">
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold translate-y-0 active:translate-y-1 transition-all">
                            Cancel
                        </Button>
                        <Button
                            className={cn("rounded-xl px-8 font-black uppercase tracking-wider transition-all shadow-lg", config.color.replace('text', 'bg'), "hover:" + config.color.replace('text', 'bg'))}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Logging...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirm Log
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};
