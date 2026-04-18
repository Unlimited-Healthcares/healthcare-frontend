import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Phone,
  MapPin,
  User,
  Clock,
  ChevronRight
} from 'lucide-react';
import { HealthcareCenter, CenterService } from '@/types/healthcare-centers';
import { appointmentService } from '@/services/healthcareCentersService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface EmergencyBookingProps {
  center: HealthcareCenter;
  services: CenterService[];
}

const EmergencyBooking: React.FC<EmergencyBookingProps> = ({ center }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    medicalCondition: '',
    location: '',
    urgency: 'high' as 'low' | 'medium' | 'high' | 'critical',
    contactName: '',
    contactPhone: '',
    relationship: '',
    additionalInfo: ''
  });

  const handleSubmit = async () => {
    if (!formData.patientName || !formData.medicalCondition || !formData.contactPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // For emergency services, we create an immediate appointment
      const appointmentData = {
        patientId: '', // This should come from user context
        centerId: center.id,
        appointmentDate: new Date().toISOString(),
        durationMinutes: 60,
        priority: 'urgent' as const,
        reason: `EMERGENCY: ${formData.medicalCondition}`,
        notes: `Patient: ${formData.patientName}, Age: ${formData.patientAge}, Location: ${formData.location}, Contact: ${formData.contactName} (${formData.contactPhone}), Urgency: ${formData.urgency}`,
        doctor: 'Emergency Team',
        isRecurring: false
      };

      await appointmentService.createAppointment(appointmentData);
      toast.success('Emergency request submitted successfully!');
      navigate(`/centers/${center.id}`);
    } catch (error) {
      toast.error('Failed to submit emergency request');
    } finally {
      setLoading(false);
    }
  };

  const handleCallNow = () => {
    if (center.phone) {
      window.open(`tel:${center.phone}`, '_self');
    } else {
      toast.error('Phone number not available');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Emergency Alert */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-red-800">Emergency Medical Request</h2>
        </div>
        <p className="text-red-700 mb-4">
          This is for emergency medical situations. If this is a life-threatening emergency,
          please contact our ambulance vendors immediately or go to the nearest emergency room.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={handleCallNow}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={!center.phone}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call {center.name} Now
          </Button>
          <Button
            onClick={() => navigate('/centers?type=ambulance')}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Ambulance Drivers / Medical Transport Teams
          </Button>
        </div>
      </motion.div>

      {/* Emergency Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Emergency Request Form
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please provide the following information to help us respond quickly to your emergency.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
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
                <Label htmlFor="patientAge">Patient Age *</Label>
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
              <Label htmlFor="medicalCondition">Medical Condition/Emergency *</Label>
              <Textarea
                id="medicalCondition"
                value={formData.medicalCondition}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalCondition: e.target.value }))}
                placeholder="Describe the medical emergency or condition"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Information
            </h3>

            <div>
              <Label htmlFor="location">Current Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Street address, city, state"
                className="mt-1"
              />
            </div>
          </div>

          {/* Emergency Level */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Emergency Level
            </h3>

            <RadioGroup
              value={formData.urgency}
              onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value as any }))}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="critical" id="critical" />
                  <Label htmlFor="critical" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Critical</Badge>
                      <span>Life-threatening emergency requiring immediate response</span>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">High</Badge>
                      <span>Serious condition requiring urgent medical attention</span>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                      <span>Moderate condition requiring prompt medical care</span>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Low</Badge>
                      <span>Minor condition that can wait for medical attention</span>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Your Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Your full name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Phone Number *</Label>
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
              <Label htmlFor="relationship">Relationship to Patient</Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="Any additional information that might help medical staff"
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
              disabled={loading || !formData.patientName || !formData.medicalCondition || !formData.contactPhone}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Submitting...' : 'Submit Emergency Request'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyBooking;
