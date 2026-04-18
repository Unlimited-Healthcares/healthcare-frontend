import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Phone, 
  ChevronRight
} from 'lucide-react';
import { HealthcareCenter, CenterService } from '@/types/healthcare-centers';
import { appointmentService } from '@/services/healthcareCentersService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface SupportBookingProps {
  center: HealthcareCenter;
  services: CenterService[];
}

const SupportBooking: React.FC<SupportBookingProps> = ({ center }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    patientName: '',
    patientAge: '',
    condition: '',
    careNeeds: '',
    specialRequirements: '',
    preferredContactMethod: 'phone' as 'phone' | 'email' | 'in-person',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    additionalInfo: ''
  });

  const supportServices = [
    { id: 'assessment', name: 'Care Needs Assessment', description: 'Evaluation of patient care requirements' },
    { id: 'consultation', name: 'Family Support Consultation', description: 'Counseling and support for family members' },
    { id: 'planning', name: 'Ongoing Care Planning', description: 'Regular care plan updates and coordination' },
    { id: 'crisis', name: 'Crisis Intervention', description: 'Immediate support during difficult times' }
  ];

  const handleSubmit = async () => {
    if (!formData.serviceType || !formData.patientName || !formData.careNeeds) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // For support services, we create a consultation appointment
      const appointmentData = {
        patientId: '', // This should come from user context
        centerId: center.id,
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        durationMinutes: 60,
        priority: 'normal' as const,
        reason: `Support Service: ${supportServices.find(s => s.id === formData.serviceType)?.name}`,
        notes: `Patient: ${formData.patientName}, Age: ${formData.patientAge}, Condition: ${formData.condition}, Care Needs: ${formData.careNeeds}, Special Requirements: ${formData.specialRequirements}, Preferred Contact: ${formData.preferredContactMethod}`,
        doctor: 'Support Team',
        isRecurring: false
      };

      await appointmentService.createAppointment(appointmentData);
      toast.success('Support service request submitted successfully!');
      navigate(`/centers/${center.id}`);
    } catch (error) {
      toast.error('Failed to submit support service request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Support Services Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-800">Support Services Request</h2>
        </div>
        <p className="text-blue-700 mb-4">
          Our support services are designed to provide compassionate care and assistance 
          for patients and families during challenging times. We're here to help with 
          care planning, family support, and ongoing assistance.
        </p>
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Phone className="w-4 h-4" />
          <span>For immediate assistance, call {center.phone || 'our support line'}</span>
        </div>
      </motion.div>

      {/* Support Services Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Support Services Request Form
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please provide the following information to help us understand your needs and provide appropriate support.
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
                {supportServices.map((service) => (
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

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Patient Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name *</Label>
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

            <div>
              <Label htmlFor="condition">Primary Condition/Diagnosis</Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                placeholder="e.g., Dementia, Cancer, Heart Disease, etc."
                className="mt-1"
              />
            </div>
          </div>

          {/* Care Needs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Care Needs Assessment</h3>
            
            <div>
              <Label htmlFor="careNeeds">Care Needs Description *</Label>
              <Textarea
                id="careNeeds"
                value={formData.careNeeds}
                onChange={(e) => setFormData(prev => ({ ...prev, careNeeds: e.target.value }))}
                placeholder="Describe the specific care needs, challenges, or support required"
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <Textarea
                id="specialRequirements"
                value={formData.specialRequirements}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                placeholder="Any special equipment, dietary needs, mobility requirements, or other considerations"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Preferences</h3>
            
            <div>
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select
                value={formData.preferredContactMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContactMethod: value as any }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="in-person">In-Person Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              placeholder="Any other information that would help us provide better support"
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
              disabled={loading || !formData.serviceType || !formData.patientName || !formData.careNeeds}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Submitting...' : 'Submit Support Request'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportBooking;
