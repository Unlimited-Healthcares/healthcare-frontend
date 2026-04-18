import React, { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { appointmentService } from '@/services/appointmentService';
import { centerService } from '@/services/centerService';
import { providerService } from '@/services/providerService';
import { CreateAppointmentDto, AppointmentType } from '@/types/appointments';
import { HealthcareCenter } from '@/services/centerService';
import { HealthcareProvider } from '@/services/providerService';
import { toast } from 'sonner';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<CreateAppointmentDto>>({
    patientId: '',
    centerId: '',
    providerId: '',
    appointmentTypeId: '',
    appointmentDate: '',
    durationMinutes: 30,
    priority: 'normal',
    reason: '',
    patientType: 'new', // Default to new
    notes: '',
    doctor: '',
    isRecurring: false
  });
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [centers, setCenters] = useState<HealthcareCenter[]>([]);
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Load centers and providers when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCenters();
      loadProviders();
    }
  }, [isOpen]);

  // Load appointment types when center is selected
  useEffect(() => {
    if (isOpen && formData.centerId) {
      loadAppointmentTypes();
    }
  }, [isOpen, formData.centerId]);

  // Load providers when center is selected
  useEffect(() => {
    if (isOpen && formData.centerId) {
      loadProviders(formData.centerId);
    }
  }, [isOpen, formData.centerId]);

  const loadCenters = async () => {
    try {
      const response = await centerService.getCenters({ isActive: true });
      setCenters(response.data || []);
    } catch (error) {
      console.error('Failed to load centers:', error);
      toast.error('Failed to load centers');
    }
  };

  const loadProviders = async (centerId?: string) => {
    try {
      const filters: any = { isActive: true };
      if (centerId) {
        filters.centerId = centerId;
      }
      const response = await providerService.getProviders(filters);
      setProviders(response.data || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
      toast.error('Failed to load providers');
    }
  };

  const loadAppointmentTypes = async () => {
    if (!formData.centerId) return;

    try {
      setLoadingTypes(true);
      const response = await appointmentService.getAppointmentTypes(formData.centerId);
      setAppointmentTypes(response.appointmentTypes);
    } catch (error) {
      console.error('Failed to load appointment types:', error);
      toast.error('Failed to load appointment types');
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleInputChange = (field: keyof CreateAppointmentDto, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Auto-populate doctor name when provider is selected
      if (field === 'providerId' && value) {
        const selectedProvider = providers.find(p => p.id === value);
        if (selectedProvider) {
          newData.doctor = `${selectedProvider.firstName} ${selectedProvider.lastName}`;
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.centerId || !formData.providerId || !formData.appointmentDate || !formData.reason || !formData.doctor) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await appointmentService.createAppointment(formData as CreateAppointmentDto);
      toast.success('Appointment created successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      patientId: '',
      centerId: '',
      providerId: '',
      appointmentTypeId: '',
      appointmentDate: '',
      durationMinutes: 30,
      priority: 'normal',
      reason: '',
      patientType: 'new',
      notes: '',
      doctor: '',
      isRecurring: false
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] p-0 border-0 flex flex-col overflow-hidden sm:rounded-[2.5rem]">
        <DialogHeader className="p-6 md:p-8 shrink-0 bg-slate-50 relative">
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-slate-900">
            <Calendar className="h-6 w-6 text-blue-600" />
            Create New Appointment
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-full hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 pb-32 sm:pb-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient ID */}
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID *</Label>
              <Input
                id="patientId"
                value={formData.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
                placeholder="Enter patient ID"
                required
              />
            </div>

            {/* Center */}
            <div className="space-y-2">
              <Label htmlFor="centerId">Healthcare Center *</Label>
              <Select
                value={formData.centerId}
                onValueChange={(value) => handleInputChange('centerId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a center" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name} - {center.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider */}
            <div className="space-y-2">
              <Label htmlFor="providerId">Healthcare Provider *</Label>
              <Select
                value={formData.providerId}
                onValueChange={(value) => handleInputChange('providerId', value)}
                required
                disabled={!formData.centerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.firstName} {provider.lastName} - {provider.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor Name */}
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor Name *</Label>
              <Input
                id="doctor"
                value={formData.doctor}
                onChange={(e) => handleInputChange('doctor', e.target.value)}
                placeholder="Enter doctor name"
                required
              />
            </div>

            {/* Appointment Type */}
            <div className="space-y-2">
              <Label htmlFor="appointmentType">Appointment Type</Label>
              <Select
                value={formData.appointmentTypeId}
                onValueChange={(value) => handleInputChange('appointmentTypeId', value)}
                disabled={loadingTypes}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingTypes ? "Loading..." : "Select type"} />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.durationMinutes} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value) || 30)}
                min="15"
                max="240"
                step="15"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Date */}
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Appointment Date & Time *</Label>
              <Input
                id="appointmentDate"
                type="datetime-local"
                value={formData.appointmentDate}
                onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                required
              />
            </div>

            {/* Patient Type (New/Follow-up) */}
            <div className="space-y-2">
              <Label htmlFor="patientType">Patient Type *</Label>
              <Select
                value={formData.patientType}
                onValueChange={(value) => handleInputChange('patientType', value)}
                required
              >
                <SelectTrigger className={formData.patientType === 'new' ? 'border-orange-200 bg-orange-50/50' : 'border-emerald-200 bg-emerald-50/50'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Patient (First visit for this service)</SelectItem>
                  <SelectItem value="follow-up">Follow-up Patient (Previous visits exist)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-gray-500 italic px-1">
                {formData.patientType === 'new'
                  ? '⚡ Requires consultation fee for this new service.'
                  : '✅ Standard follow-up procedure applies.'}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Enter appointment reason"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or instructions"
              rows={3}
            />
          </div>

          {/* Recurring Appointment */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isRecurring">This is a recurring appointment</Label>
          </div>

          {/* Action Buttons */}
          <div className="shrink-0 p-4 md:p-8 bg-white/80 backdrop-blur-md border-t flex justify-end gap-3 z-50">
            <Button type="button" variant="outline" className="h-12 rounded-xl font-bold px-6" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-lg shadow-blue-100">
              {loading ? 'Creating...' : 'Create Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
