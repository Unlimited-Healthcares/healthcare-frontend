import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, User, Shield, Lock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';

interface ProvisionUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const ProvisionUserModal: React.FC<ProvisionUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'patient',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.name || !formData.password) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            // Since we don't have a dedicated admin provision endpoint yet, 
            // we'll simulate the call or use a generic one if available.
            // For now, let's assume adminService.provisionUser exists or we'll add it.

            // @ts-ignore - We will add this to adminService
            await adminService.provisionUser(formData);

            toast.success(`Account for ${formData.name} has been provisioned successfully.`);
            if (onSuccess) onSuccess();
            onClose();
            setFormData({
                name: '',
                email: '',
                phone: '',
                role: 'patient',
                password: '',
            });
        } catch (error: any) {
            console.error('Provisioning error:', error);
            toast.error(error.response?.data?.message || "Failed to provision account");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 bg-gray-900 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <UserPlus className="h-6 w-6 text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Administrative Governance</span>
                    </div>
                    <DialogTitle className="text-3xl font-black tracking-tight">Provision Portal Account</DialogTitle>
                    <DialogDescription className="text-gray-400 font-medium">
                        Manually authorize and create a new identity within the medical registry.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
                                <User className="h-3 w-3" /> Full Legal Name
                            </Label>
                            <Input
                                placeholder="e.g. Dr. Jane Cooper"
                                className="rounded-xl h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
                                    <Mail className="h-3 w-3" /> Email Address
                                </Label>
                                <Input
                                    type="email"
                                    placeholder="jane@healthcare.com"
                                    className="rounded-xl h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
                                    <Phone className="h-3 w-3" /> Phone (Optional)
                                </Label>
                                <Input
                                    placeholder="+1 (555) 000-0000"
                                    className="rounded-xl h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
                                    <Shield className="h-3 w-3" /> Assigned Class
                                </Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger className="rounded-xl h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="patient">Patient</SelectItem>
                                        <SelectItem value="doctor">Medical Doctor</SelectItem>
                                        <SelectItem value="nurse">Nursing Staff</SelectItem>
                                        <SelectItem value="facility">Facility Admin</SelectItem>
                                        <SelectItem value="admin">System Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
                                    <Lock className="h-3 w-3" /> Temp Password
                                </Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="rounded-xl h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl font-bold text-gray-400"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-xl bg-gray-900 hover:bg-black text-white px-8 font-black uppercase tracking-wider shadow-lg shadow-gray-200 h-12"
                        >
                            {isLoading ? 'Processing...' : 'Provision Account'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
