import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, User, Plus, X, Shield, Star, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { emergencyService } from '@/services/emergencyService';
import { EmergencyContact } from '@/types/emergency';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EmergencyContactManagerProps {
    onContactAdded?: () => void;
}

export const EmergencyContactManager: React.FC<EmergencyContactManagerProps> = ({ onContactAdded }) => {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        relationship: '',
        isPrimary: false,
        isMedicalContact: false
    });

    const loadContacts = async () => {
        try {
            setLoading(true);
            const data = await emergencyService.getEmergencyContacts();
            setContacts(data);
        } catch (error) {
            console.error('Error loading contacts:', error);
            toast.error('Failed to load emergency contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, []);

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.contactName || !formData.contactPhone || !formData.relationship) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            await emergencyService.addEmergencyContact(formData);
            toast.success('Emergency contact added successfully');
            setFormData({
                contactName: '',
                contactPhone: '',
                contactEmail: '',
                relationship: '',
                isPrimary: false,
                isMedicalContact: false
            });
            setIsAdding(false);
            loadContacts();
            if (onContactAdded) {
                onContactAdded();
            }
        } catch (error) {
            console.error('Error adding contact:', error);
            toast.error('Failed to add emergency contact');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-900">Emergency Contacts</h2>
                </div>
                {!isAdding && (
                    <Button
                        onClick={() => setIsAdding(true)}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add New
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="border-red-100 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Add Emergency Contact</CardTitle>
                        <CardDescription>
                            This person will be notified immediately when you trigger an SOS alert.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddContact} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactName">Full Name *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="contactName"
                                            placeholder="e.g. Jane Doe"
                                            className="pl-10"
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactPhone">Phone Number *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="contactPhone"
                                            placeholder="+1..."
                                            className="pl-10"
                                            value={formData.contactPhone}
                                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Email Address (Optional)</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="contactEmail"
                                            type="email"
                                            placeholder="email@example.com"
                                            className="pl-10"
                                            value={formData.contactEmail}
                                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="relationship">Relationship *</Label>
                                    <Input
                                        id="relationship"
                                        placeholder="e.g. Spouse, Parent, Doctor"
                                        value={formData.relationship}
                                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={cn(
                                        "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                        formData.isPrimary ? "bg-red-600 border-red-600" : "border-gray-300 group-hover:border-red-400"
                                    )}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.isPrimary}
                                            onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                                        />
                                        {formData.isPrimary && <Plus className="h-3 w-3 text-white" />}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Set as Primary Contact</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={cn(
                                        "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                        formData.isMedicalContact ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"
                                    )}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.isMedicalContact}
                                            onChange={(e) => setFormData({ ...formData, isMedicalContact: e.target.checked })}
                                        />
                                        {formData.isMedicalContact && <Plus className="h-3 w-3 text-white" />}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Medical Professional</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAdding(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Contact
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
                </div>
            ) : contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.map((contact) => (
                        <Card key={contact.id} className="border-gray-100 hover:border-red-100 transition-all hover:shadow-md">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center",
                                            contact.isPrimary ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                                        )}>
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900">{contact.contactName}</h4>
                                                {contact.isPrimary && (
                                                    <Badge className="bg-red-500 text-white text-[10px] uppercase font-black tracking-widest px-2">
                                                        Primary
                                                    </Badge>
                                                )}
                                                {contact.isMedicalContact && (
                                                    <Star className="h-3 w-3 text-blue-500 fill-blue-500" />
                                                )}
                                            </div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{contact.relationship}</p>
                                            <div className="flex items-center gap-4 pt-1">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                                                    <Phone className="h-3 w-3" />
                                                    {contact.contactPhone}
                                                </div>
                                                {contact.contactEmail && (
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                                                        <Mail className="h-3 w-3" />
                                                        {contact.contactEmail.split('@')[0]}...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No Emergency Contacts</h3>
                    <p className="text-sm text-gray-500 max-w-[280px] mx-auto mt-2">
                        You haven't setup your emergency responders yet. Add someone you trust to be notified in an emergency.
                    </p>
                    <Button
                        onClick={() => setIsAdding(true)}
                        variant="outline"
                        className="mt-6 border-red-200 text-red-600 hover:bg-red-50"
                    >
                        Add Your First Contact
                    </Button>
                </div>
            )}
        </div>
    );
};

const Save = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);
