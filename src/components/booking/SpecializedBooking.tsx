import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Microscope,
  Camera,
  Pill,
  Heart,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { HealthcareCenter, CenterService } from '@/types/healthcare-centers';
import { appointmentService } from '@/services/healthcareCentersService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface SpecializedBookingProps {
  center: HealthcareCenter;
  services: CenterService[];
}

const SpecializedBooking: React.FC<SpecializedBookingProps> = ({ center }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    customRequirements: '',
    schedulingPreferences: '',
    patientName: '',
    patientAge: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    additionalInfo: ''
  });

  // Get service type icon based on center type
  const getServiceIcon = (centerType: string) => {
    switch (centerType) {
      case 'diagnostic':
        return <Microscope className="w-6 h-6 text-blue-600" />;
      case 'radiology':
        return <Camera className="w-6 h-6 text-green-600" />;
      case 'pharmacy':
        return <Pill className="w-6 h-6 text-purple-600" />;
      case 'funeral':
        return <Heart className="w-6 h-6 text-gray-600" />;
      default:
        return <Calendar className="w-6 h-6 text-teal-600" />;
    }
  };

  // Get service type color based on center type
  const getServiceColor = (centerType: string) => {
    switch (centerType) {
      case 'diagnostic':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'radiology':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'pharmacy':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'funeral':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-teal-50 border-teal-200 text-teal-800';
    }
  };

  const getSpecializedServices = (centerType: string) => {
    switch (centerType) {
      case 'diagnostic':
        return [
          { id: 'blood-tests', name: 'Blood Tests', description: 'Complete blood count, chemistry panel, etc.' },
          { id: 'urine-tests', name: 'Urine Tests', description: 'Urinalysis, culture, etc.' },
          { id: 'stool-tests', name: 'Stool Tests', description: 'Occult blood, parasites, etc.' },
          { id: 'specialized-tests', name: 'Specialized Tests', description: 'Genetic testing, hormone levels, etc.' }
        ];
      case 'radiology':
        return [
          { id: 'x-ray', name: 'X-Ray', description: 'Chest, bone, dental X-rays' },
          { id: 'ct-scan', name: 'CT Scan', description: 'Computed tomography imaging' },
          { id: 'mri', name: 'MRI', description: 'Magnetic resonance imaging' },
          { id: 'ultrasound', name: 'Ultrasound', description: 'Sonography imaging' }
        ];
      case 'pharmacy':
        return [
          { id: 'prescription-filling', name: 'Prescription Filling', description: 'Medication dispensing and pickup' },
          { id: 'consultation', name: 'Medication Consultation', description: 'Pharmacist consultation and advice' },
          { id: 'health-screening', name: 'Health Screening', description: 'Blood pressure, glucose checks' },
          { id: 'immunization', name: 'Immunization', description: 'Vaccines and immunizations' }
        ];
      case 'funeral':
        return [
          { id: 'immediate-arrangements', name: 'Immediate Arrangements', description: 'Urgent funeral planning' },
          { id: 'pre-planning', name: 'Pre-Planning Consultation', description: 'Advance funeral planning' },
          { id: 'memorial-services', name: 'Memorial Services', description: 'Memorial service coordination' },
          { id: 'cremation', name: 'Cremation Services', description: 'Cremation arrangements' }
        ];
      default:
        return [
          { id: 'consultation', name: 'Consultation', description: 'General consultation service' },
          { id: 'assessment', name: 'Assessment', description: 'Professional assessment service' }
        ];
    }
  };

  const specializedServices = getSpecializedServices(center.type);

  const handleSubmit = async () => {
    if (!formData.serviceType || !formData.customRequirements) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // For specialized services, we create a service-specific appointment
      const appointmentData = {
        patientId: '', // This should come from user context
        centerId: center.id,
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        durationMinutes: 60,
        priority: 'normal' as const,
        reason: `Specialized Service: ${specializedServices.find(s => s.id === formData.serviceType)?.name}`,
        notes: `Service: ${specializedServices.find(s => s.id === formData.serviceType)?.name}, Requirements: ${formData.customRequirements}, Preferences: ${formData.schedulingPreferences}, Patient: ${formData.patientName}, Contact: ${formData.contactName} (${formData.contactPhone})`,
        doctor: 'Specialized Team',
        isRecurring: false
      };

      await appointmentService.createAppointment(appointmentData);
      toast.success('Specialized service request submitted successfully!');
      navigate(`/centers/${center.id}`);
    } catch (error) {
      toast.error('Failed to submit specialized service request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Specialized Services Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border rounded-lg p-6 ${getServiceColor(center.type)}`}
      >
        <div className="flex items-center gap-3 mb-4">
          {getServiceIcon(center.type)}
          <h2 className="text-xl font-bold">
            {center.type.charAt(0).toUpperCase() + center.type.slice(1)} Services
          </h2>
        </div>
        <p className="mb-4">
          Our specialized {center.type} services are designed to meet your specific needs
          with professional expertise and personalized care.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" />
          <span>Schedule your appointment or consultation today</span>
        </div>
      </motion.div>

      {/* Specialized Services Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getServiceIcon(center.type)}
            {center.type.charAt(0).toUpperCase() + center.type.slice(1)} Service Request
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please provide the following information to help us prepare for your specialized service.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Type *</h3>
            <RadioGroup
              value={formData.serviceType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
            >
              <div className="space-y-3">
                {specializedServices.map((service) => (
                  <div key={service.id} className="flex items-start space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={service.id} id={service.id} className="mt-1" />
                    <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-semibold">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Custom Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Requirements</h3>

            <div>
              <Label htmlFor="customRequirements">Specific Requirements *</Label>
              <Textarea
                id="customRequirements"
                value={formData.customRequirements}
                onChange={(e) => setFormData(prev => ({ ...prev, customRequirements: e.target.value }))}
                placeholder="Describe your specific requirements, test types needed, or special arrangements"
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="schedulingPreferences">Scheduling Preferences</Label>
              <Textarea
                id="schedulingPreferences"
                value={formData.schedulingPreferences}
                onChange={(e) => setFormData(prev => ({ ...prev, schedulingPreferences: e.target.value }))}
                placeholder="Preferred dates, times, or any scheduling constraints"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Patient Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Full name of the patient"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="patientAge">Patient Age</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={formData.patientAge}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientAge: e.target.value }))}
                  placeholder="Age in years"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Your Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Your full name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail">Email Address</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="your.email@example.com"
                className="mt-1"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="Any other information that would help us provide better service"
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(`/centers/${center.id}`)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.serviceType || !formData.customRequirements}
              className={`${getServiceColor(center.type).includes('blue') ? 'bg-blue-600 hover:bg-blue-700' :
                getServiceColor(center.type).includes('green') ? 'bg-green-600 hover:bg-green-700' :
                  getServiceColor(center.type).includes('purple') ? 'bg-purple-600 hover:bg-purple-700' :
                    'bg-teal-600 hover:bg-teal-700'} text-white`}
            >
              {loading ? 'Submitting...' : 'Submit Service Request'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecializedBooking;
