import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  User,
  Stethoscope,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { HealthcareCenter, CenterService, CreateAppointmentDto, TimeSlot } from '@/types/healthcare-centers';
import { appointmentService } from '@/services/healthcareCentersService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useApprovedProviders } from '@/hooks/useApprovedProviders';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { integrationsService } from '@/services/integrationsService';

interface MedicalBookingProps {
  center: HealthcareCenter;
  services: CenterService[];
}

type BookingStep = 'service' | 'provider' | 'datetime' | 'details' | 'confirmation';

const MedicalBooking: React.FC<MedicalBookingProps> = ({ center, services }) => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { doctors, loading: providersLoading, error: providersError } = useApprovedProviders();
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Form data
  const [formData, setFormData] = useState<Partial<CreateAppointmentDto>>({
    centerId: center.id,
    patientId: profile?.id || '', // Get patientId from profile
    priority: 'normal',
    isRecurring: false
  });

  const steps = [
    { id: 'service', title: 'Select Service', icon: Stethoscope },
    { id: 'provider', title: 'Choose Provider', icon: User },
    { id: 'datetime', title: 'Pick Date & Time', icon: Calendar },
    { id: 'details', title: 'Service Details', icon: CheckCircle },
    { id: 'confirmation', title: 'Confirmation', icon: CheckCircle }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  // Load available time slots when provider and date are selected
  useEffect(() => {
    if (formData.providerId && selectedDate) {
      loadAvailableSlots(formData.providerId, selectedDate);
    }
  }, [formData.providerId, selectedDate]);

  const loadAvailableSlots = async (providerId: string, date: string) => {
    try {
      setLoading(true);
      const slots = await appointmentService.getAvailableSlots(providerId, date);
      setAvailableSlots(slots.slots);
    } catch (error) {
      toast.error('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id as BookingStep);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id as BookingStep);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const selectedService = services.find(s => s.id === formData.appointmentTypeId);
      const amount = selectedService?.basePrice || 0;

      // Create the appointment first
      const appointment = await appointmentService.createAppointment(formData as CreateAppointmentDto);

      if (amount > 0) {
        // Get best payment method from center settings
        const paymentMethod = (center as any).paymentSettings?.methods?.find((m: any) =>
          ['paystack', 'flutterwave'].includes(m.type)
        )?.type || 'paystack';

        // Prepare payment data
        const paymentData = {
          amount: amount, // Major unit (backend handles minor units)
          currency: selectedService?.currency || 'USD',
          patientId: profile?.id || '',
          centerId: center.id,
          description: `Clinical Consultation: ${selectedService?.serviceName}`,
          paymentMethod,
          metadata: {
            appointmentId: appointment.id,
            email: user?.email,
            centerName: center.name,
            callbackUrl: `${window.location.origin}/payment/callback`
          }
        };

        toast.loading('Initializing Consultation Payment...');
        const result = await integrationsService.processPayment(paymentData);

        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return; // Redirect will handle navigation
        } else if (result.status === 'succeeded') {
          toast.success('Consultation booked and payment verified!');
        } else {
          toast.error('Payment failed, but session record was created. Please pay at the clinical facility.');
        }
      } else {
        toast.success('Consultation session scheduled!');
      }

      navigate(`/centers/${center.id}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to book service');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'service':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select a Service</h3>
            {services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Services Available</h3>
                <p className="text-gray-600 max-w-sm mb-6">
                  {center.name} has not listed any medical services yet. Please contact the center directly or check back later.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => navigate(`/centers/${center.id}`)}>
                    View Center Page
                  </Button>
                  <Button variant="default" className="bg-teal-600" onClick={() => navigate('/discovery')}>
                    Find Other Centers
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all ${formData.appointmentTypeId === service.id
                      ? 'ring-2 ring-teal-500 border-teal-500 bg-teal-50'
                      : 'hover:shadow-md hover:border-teal-200'
                      }`}
                    onClick={() => setFormData(prev => ({ ...prev, appointmentTypeId: service.id }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{service.serviceName}</h4>
                        {service.isEmergencyService && (
                          <Badge variant="destructive" className="text-xs">
                            Emergency
                          </Badge>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-2">
                        {service.durationMinutes && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {service.durationMinutes} min
                          </span>
                        )}
                        {service.basePrice && (
                          <span className="font-bold text-teal-700">
                            {service.currency || 'USD'} {service.basePrice}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'provider':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Provider & Time</h3>

            {/* Healthcare Provider Section */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-4 block">Healthcare Provider</Label>

              {providersLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <LoadingSpinner size="md" />
                  <p className="mt-4">Loading providers...</p>
                </div>
              ) : providersError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Providers</h3>
                  <p className="text-gray-600 mb-4">{providersError}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : doctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No providers available</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any approved doctors yet. Find and connect with doctors first.
                  </p>
                  <Button variant="default" onClick={() => navigate('/discovery')}>
                    Find Doctors
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doctorProvider) => {
                    const doctor = doctorProvider.provider;
                    if (!doctor) return null;

                    const doctorName = `Dr. ${doctor.profile.firstName} ${doctor.profile.lastName}`;

                    return (
                      <Card
                        key={doctorProvider.id}
                        className={`cursor-pointer transition-all ${formData.providerId === doctor.id
                          ? 'ring-2 ring-teal-500 border-teal-500 bg-teal-50'
                          : 'hover:shadow-md hover:border-teal-200'
                          }`}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          providerId: doctor.id,
                          doctor: doctorName
                        }))}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              {doctor.profile.avatar ? (
                                <img
                                  src={doctor.profile.avatar}
                                  alt={doctorName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{doctorName}</h4>
                              <p className="text-sm text-gray-600 truncate">
                                {doctor.profile.specialization || 'General Practice'}
                              </p>
                              {doctorProvider.status === 'approved' && (
                                <Badge className="bg-green-100 text-green-800 mt-1 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approved
                                </Badge>
                              )}
                            </div>
                            {formData.providerId === doctor.id && (
                              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Preferred Date */}
            {doctors.length > 0 && formData.providerId && (
              <div className="mt-6">
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        );

      case 'datetime':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Select Date & Time</h3>

            {/* Date Selection */}
            <div>
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <Label>Available Time Slots</Label>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={formData.appointmentDate?.includes(slot.time) ? 'default' : 'outline'}
                        className="h-12"
                        onClick={() => {
                          const dateTime = `${selectedDate}T${slot.time}:00`;
                          setFormData(prev => ({ ...prev, appointmentDate: dateTime }));
                        }}
                        disabled={!slot.available}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No available slots for this date</p>
                )}
              </div>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Service Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reason">Reason for Visit *</Label>
                <Input
                  id="reason"
                  value={formData.reason || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Describe your symptoms or reason for visit"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  value={formData.priority || 'normal'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger className="mt-1">
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
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information you'd like to share"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Recurring Appointment</Label>
              <RadioGroup
                value={formData.isRecurring ? 'yes' : 'no'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isRecurring: value === 'yes' }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">One-time appointment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Recurring appointment</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Confirm Your Service</h3>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-semibold">
                        {formData.appointmentDate ? new Date(formData.appointmentDate).toLocaleDateString() : 'Date not selected'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formData.appointmentDate ? new Date(formData.appointmentDate).toLocaleTimeString() : 'Time not selected'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-semibold">{formData.doctor || 'Provider not selected'}</p>
                      <p className="text-sm text-gray-600">Healthcare Provider</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-semibold">
                        {services.find(s => s.id === formData.appointmentTypeId)?.serviceName || 'Service not selected'}
                      </p>
                      <p className="text-sm text-gray-600">Service Type</p>
                    </div>
                  </div>

                  {formData.reason && (
                    <>
                      <Separator />
                      <div>
                        <p className="font-semibold">Reason for Visit</p>
                        <p className="text-sm text-gray-600">{formData.reason}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStepIndex > index;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive
                    ? 'border-teal-500 bg-teal-500 text-white'
                    : isCompleted
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-teal-600 font-semibold' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${isCompleted ? 'bg-teal-500' : 'bg-gray-300'
                    }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStepIndex === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.appointmentDate || !formData.reason}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {loading ? 'Booking...' : 'Confirm Service'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 'service' && !formData.appointmentTypeId) ||
              (currentStep === 'provider' && !formData.providerId) ||
              (currentStep === 'datetime' && !formData.appointmentDate) ||
              (currentStep === 'details' && !formData.reason)
            }
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MedicalBooking;
