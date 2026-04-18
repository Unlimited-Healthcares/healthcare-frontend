import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { patientService } from '@/services/patientService';
import { toast } from 'sonner';
import { UserPlus, Save, X } from 'lucide-react';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePatientModal = ({ isOpen, onClose, onSuccess }: CreatePatientModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    bloodType: '',
    insuranceProvider: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await patientService.createPatient(formData);
      if (result) {
        toast.success("Patient record created successfully!");
        onSuccess();
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          gender: '',
          dateOfBirth: '',
          phone: '',
          email: '',
          bloodType: '',
          insuranceProvider: '',
        });
      } else {
        toast.error("Failed to create patient record");
      }
    } catch (error) {
      console.error("Create patient failed:", error);
      toast.error("An error occurred while creating the patient record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[100dvh] sm:h-auto sm:max-h-[92vh] border-none shadow-2xl rounded-none sm:rounded-[2rem] p-0 flex flex-col overflow-hidden bg-white">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black">Register New Patient</DialogTitle>
                <DialogDescription className="text-blue-100">Create a clinical record for a new patient.</DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-xl">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 pb-32 sm:pb-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">First Name *</Label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all h-12"
                placeholder="e.g. John"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Last Name *</Label>
              <Input
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all h-12"
                placeholder="e.g. Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Gender</Label>
              <Select onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v }))}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-12">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className="rounded-xl border-slate-100 bg-slate-50 h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Phone Number</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="rounded-xl border-slate-100 bg-slate-50 h-12"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Blood Type</Label>
              <Select onValueChange={(v) => setFormData(prev => ({ ...prev, bloodType: v }))}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-12">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address (Optional)</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="rounded-xl border-slate-100 bg-slate-50 h-12"
              placeholder="patient@example.com"
            />
          </div>

          <div className="shrink-0 p-4 sm:p-8 bg-white/80 backdrop-blur-md border-t flex gap-4 z-50">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-14 rounded-xl font-bold">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-100">
              {loading ? "Registering..." : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Record
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
