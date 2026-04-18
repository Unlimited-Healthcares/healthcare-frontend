import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { HealthcareCenter, CenterService } from '@/types/healthcare-centers';
import { useCenterDetails, useCenterTypeInfo } from '@/hooks/useHealthcareCenters';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Import specific booking flows
import MedicalBooking from './MedicalBooking';
import EmergencyBooking from './EmergencyBooking';
import SupportBooking from './SupportBooking';
import SpecializedBooking from './SpecializedBooking';

interface BookingFlowProps {
  center: HealthcareCenter;
  services: CenterService[];
}

const BookingFlow: React.FC<BookingFlowProps> = ({ center, services }) => {
  const { getServiceType } = useCenterTypeInfo();
  const serviceType = getServiceType(center);

  const renderBookingFlow = () => {
    switch (serviceType) {
      case 'medical':
        return <MedicalBooking center={center} services={services} />;
      case 'emergency':
        return <EmergencyBooking center={center} services={services} />;
      case 'support':
        return <SupportBooking center={center} services={services} />;
      case 'specialized':
        return <SpecializedBooking center={center} services={services} />;
      default:
        return <MedicalBooking center={center} services={services} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderBookingFlow()}
      </div>
    </div>
  );
};

// Main booking page component
const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { center, services, loading: centerLoading, error } = useCenterDetails(id || '');

  if (centerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Center Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The center you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/centers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Centers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/centers/${center.id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Center
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
              <p className="text-gray-600">{center.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Flow */}
      <BookingFlow center={center} services={services} />
    </div>
  );
};

export default BookingPage;
