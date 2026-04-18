import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    FileText,
    Upload,
    X,
    MapPin,
    User,
    Phone,
    AlertCircle,
    Activity,
    Truck,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Priority } from '@/types/emergency';

interface AmbulanceRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    defaultPatientName?: string;
    defaultPatientPhone?: string;
}

export const AmbulanceRequestDialog: React.FC<AmbulanceRequestDialogProps> = ({
    open,
    onOpenChange,
    onSubmit,
    defaultPatientName = '',
    defaultPatientPhone = ''
}) => {
    const [formData, setFormData] = useState({
        patientName: defaultPatientName,
        patientPhone: defaultPatientPhone,
        pickupAddress: 'Current Location',
        medicalCondition: '',
        priority: Priority.CRITICAL,
        patientAge: '',
        patientGender: '',
        requestType: 'emergency_team', // 'transport_team' | 'emergency_team'
    });

    const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setAttachments([...attachments, {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
            }]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            attachments: attachments.map(a => a.name)
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-orange-600">
                        <FileText className="h-5 w-5" />
                        Ambulance Booking & Clinical Referral
                    </DialogTitle>
                    <DialogDescription>
                        Provide patient details and attach clinical reports for emergency transport.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Service Level</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div
                                onClick={() => setFormData({ ...formData, requestType: 'transport_team' })}
                                className={cn(
                                    "p-3 rounded-2xl border-2 cursor-pointer transition-all",
                                    formData.requestType === 'transport_team'
                                        ? "border-blue-600 bg-blue-50 shadow-md"
                                        : "border-gray-100 bg-white hover:border-blue-200"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className={cn("p-1.5 rounded-lg", formData.requestType === 'transport_team' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500")}>
                                        <Truck className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase">Transport</span>
                                </div>
                                <p className="text-[9px] text-gray-500 font-bold leading-tight uppercase">Basic Life Support. Limited clinical access.</p>
                            </div>

                            <div
                                onClick={() => setFormData({ ...formData, requestType: 'emergency_team' })}
                                className={cn(
                                    "p-3 rounded-2xl border-2 cursor-pointer transition-all",
                                    formData.requestType === 'emergency_team'
                                        ? "border-red-600 bg-red-50 shadow-md"
                                        : "border-gray-100 bg-white hover:border-blue-200"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className={cn("p-1.5 rounded-lg", formData.requestType === 'emergency_team' ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500")}>
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase">Crisis</span>
                                </div>
                                <p className="text-[9px] text-red-600 font-bold leading-tight uppercase">Emergency Experts. Full Clinical access.</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="patientName" className="flex items-center gap-1.5 px-0.5">
                                <User className="h-3.5 w-3.5 text-gray-500" />
                                Patient Full Name
                            </Label>
                            <Input
                                id="patientName"
                                value={formData.patientName}
                                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                placeholder="Name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patientPhone" className="flex items-center gap-1.5 px-0.5">
                                <Phone className="h-3.5 w-3.5 text-gray-500" />
                                Contact Phone
                            </Label>
                            <Input
                                id="patientPhone"
                                value={formData.patientPhone}
                                onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                                placeholder="+234..."
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="patientAge">Age</Label>
                            <Input
                                id="patientAge"
                                type="number"
                                value={formData.patientAge}
                                onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                                placeholder="Years"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patientGender">Gender</Label>
                            <select
                                id="patientGender"
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.patientGender}
                                onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pickupAddress" className="flex items-center gap-1.5 px-0.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                            Pickup Location
                        </Label>
                        <Input
                            id="pickupAddress"
                            value={formData.pickupAddress}
                            onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                            placeholder="e.g. 123 Health Street"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="medicalCondition" className="flex items-center gap-1.5 px-0.5">
                            <AlertCircle className="h-3.5 w-3.5 text-gray-500" />
                            Medical Reason / Clinical Note
                        </Label>
                        <Textarea
                            id="medicalCondition"
                            value={formData.medicalCondition}
                            onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
                            placeholder="Short clinical summary (e.g. Severe chest pain, suspected AMI)"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="flex items-center gap-1.5 px-0.5">
                            <Upload className="h-3.5 w-3.5 text-gray-500" />
                            Clinical Reports & Attachments (PDF/Images)
                        </Label>

                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept=".pdf,image/*"
                            />
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 font-medium">Click or drag files to upload</p>
                            <p className="text-xs text-gray-400 mt-1">Medical records, lab results, prescriptions</p>
                        </div>

                        {attachments.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {attachments.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-white rounded-md border border-blue-200">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-blue-900 truncate">{file.name}</p>
                                                <p className="text-[10px] text-blue-600">{file.size}</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-blue-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => removeAttachment(i)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                            Dispatch Ambulance Now
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
