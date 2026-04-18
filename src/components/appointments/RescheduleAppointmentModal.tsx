import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video, Phone, Activity, Shield, AlertCircle, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { appointmentService } from '@/services/appointmentService';
import { Appointment, UpdateAppointmentDto } from '@/types/appointments';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: Appointment;
}

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  appointment
}) => {
  const [formData, setFormData] = useState<Partial<UpdateAppointmentDto>>({
    appointmentDate: appointment.appointmentDate,
    durationMinutes: appointment.durationMinutes,
    reason: appointment.reason,
    notes: appointment.notes
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof UpdateAppointmentDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.appointmentDate) {
      toast.error('Please select a new temporal signature');
      return;
    }

    try {
      setLoading(true);
      await appointmentService.updateAppointment(appointment.id, formData);
      toast.success('Clinical session rescheduled and patient notified.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to reschedule session:', error);
      toast.error('System synchronization conflict');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) { return 'Invalid Date'; }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) { return 'Invalid Time'; }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white border-none shadow-premium rounded-[60px] p-0 overflow-hidden outline-none">
        <DialogTitle className="sr-only">Reschedule Clinical Session</DialogTitle>
        <DialogDescription className="sr-only">Modify session temporal parameters with documented rationale.</DialogDescription>

        <div className="flex flex-col h-auto max-h-[90vh]">
          {/* HEADER */}
          <div className="p-10 pb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Reschedule Session</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-0.5">Clinical Registry Update</p>
            </div>
            <button onClick={onClose} className="p-4 rounded-3xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-inner">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-10 pb-10 space-y-8 overflow-y-auto custom-scrollbar">
            {/* CURRENT SESSION CARD */}
            <div className="bg-slate-50 rounded-[40px] border border-slate-100 p-8 shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="h-16 w-16 rounded-[24px] bg-white shadow-soft flex items-center justify-center font-black text-xl text-primary border border-slate-100">
                  {appointment.doctor?.charAt(0) || 'D'}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Activity className="h-3 w-3" /> Current Protocol Parameters
                  </p>
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">{appointment.doctor}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(appointment.appointmentDate)}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {formatTime(appointment.appointmentDate)}</span>
                    <span className="flex items-center gap-1.5">{getTypeIcon(appointment.type)} {appointment.type || 'In-Person'}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">New Temporal Signature *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
                    <Input
                      type="datetime-local"
                      value={formData.appointmentDate ? new Date(formData.appointmentDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                      className="h-16 rounded-[24px] bg-slate-50/80 border-none pl-14 pr-6 font-black text-slate-900 shadow-inner focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Protocol Duration (Min)</Label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary pointer-events-none" />
                    <Input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value))}
                      className="h-16 rounded-[24px] bg-slate-50/80 border-none pl-14 pr-6 font-black text-slate-900 shadow-inner focus:ring-primary/20"
                      min="15"
                      step="15"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 group flex items-center justify-between">
                  SOAP Rationale / Reason for Reschedule *
                  <Shield className="h-3.5 w-3.5 text-emerald-500 opacity-50" />
                </Label>
                <div className="relative">
                  <Input
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    required
                    placeholder="Document clinical or administrative rationale for rescheduling..."
                    className="h-16 rounded-[24px] bg-slate-50 border-none px-8 font-black text-slate-900 shadow-inner focus:ring-primary/20 placeholder:text-slate-300 placeholder:italic"
                  />
                  {!formData.reason && <AlertCircle className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400 animate-pulse" />}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Supplementary Clinical Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional instructions for the patient regarding this shift..."
                  className="min-h-[120px] rounded-[32px] bg-slate-50 border-none p-6 font-medium italic shadow-inner active:shadow-none focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-50">
                <Button
                  type="submit"
                  disabled={loading || !formData.reason}
                  className="w-full h-16 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-widest shadow-premium transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="sm" /> : (
                    <span className="flex items-center gap-2">
                      Authorize Reschedule Protocol <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
                <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4">
                  Note: Patient will be notified immediately via secure digital document.
                </p>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
