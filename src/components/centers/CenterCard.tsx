import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, ArrowRight, Users, Stethoscope, Send } from 'lucide-react';
import { HealthcareCenter } from '@/types/healthcare-centers';
import { useCenterTypeInfo } from '@/hooks/useHealthcareCenters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface CenterCardProps {
  center: HealthcareCenter;
  showDistance?: boolean;
  distance?: number;
  onClick?: () => void;
  onSendRequest?: (center: HealthcareCenter) => void;
}

const CenterCard: React.FC<CenterCardProps> = ({
  center,
  showDistance = false,
  distance,
  onClick,
  onSendRequest
}) => {
  const { getCenterTypeLabel, getServiceType } = useCenterTypeInfo();
  const serviceType = getServiceType(center);

  const formatDistance = (dist: number) => {
    const numDist = Number(dist);
    if (isNaN(numDist)) return 'Unknown distance';
    if (numDist < 1) {
      return `${Math.round(numDist * 1000)}m`;
    }
    return `${numDist.toFixed(1)}km`;
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return <Stethoscope className="w-4 h-4" />;
      case 'emergency':
        return <div className="w-4 h-4 bg-red-500 rounded-full" />;
      case 'support':
        return <Users className="w-4 h-4" />;
      case 'specialized':
        return <div className="w-4 h-4 bg-blue-500 rounded-full" />;
      default:
        return <Stethoscope className="w-4 h-4" />;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'medical':
        return 'bg-green-100 text-green-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'support':
        return 'bg-blue-100 text-blue-800';
      case 'specialized':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {/* Center Image */}
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
          <img
            src={(() => {
              const types: { [key: string]: string } = {
                'Hospital': '/images/patient-care.png',
                'Pharmacy': '/images/vaccination.png',
                'Diagnostic': '/images/vision-test.png',
                'Clinic': '/images/physical-exam.png'
              };
              return types[center.type] || '/images/physical-exam.png';
            })()}
            alt={center.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Status Badge */}
        <Badge
          className={`absolute top-3 right-3 ${center.isActive
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
            }`}
        >
          {center.isActive ? 'Open' : 'Closed'}
        </Badge>

        {/* Service Type Badge */}
        <Badge
          className={`absolute top-3 left-3 ${getServiceTypeColor(serviceType)}`}
        >
          {getServiceTypeIcon(serviceType)}
          <span className="ml-1 capitalize">{serviceType}</span>
        </Badge>
      </div>

      <CardContent className="p-6">
        {/* Center Name and Type */}
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
            {center.name}
          </h3>
          <p className="text-sm text-gray-600">
            {getCenterTypeLabel(center.type)}
          </p>
        </div>

        {/* Rating (Mock - replace with real data when available) */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">4.8</span>
        </div>

        {/* Location */}
        <div className="flex items-start mb-3">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 line-clamp-2">
              {center.address}
            </p>
            {center.city && center.state && (
              <p className="text-xs text-gray-500 mt-1">
                {center.city}, {center.state}
              </p>
            )}
            {showDistance && distance !== undefined && (
              <p className="text-xs text-teal-600 font-medium mt-1">
                {formatDistance(distance)} away
              </p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        {center.phone && (
          <div className="flex items-center mb-3">
            <Phone className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{center.phone}</span>
          </div>
        )}

        {/* Hours */}
        {center.hours && (
          <div className="flex items-center mb-4">
            <Clock className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{center.hours}</span>
          </div>
        )}

        {/* Specialties (Mock - replace with real data when available) */}
        <div className="flex flex-wrap gap-1 mb-4">
          {['Emergency Care', 'Surgery', 'Cardiology'].slice(0, 3).map((specialty, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
          {3 < 3 && (
            <Badge variant="secondary" className="text-xs">
              +1 more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-1">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 group-hover:border-teal-500 group-hover:text-teal-600 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <Link to={`/centers/${center.id}`}>
            Details
          </Link>
        </Button>
        {onSendRequest && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSendRequest(center);
            }}
            variant="outline"
            size="sm"
            className="flex-1 group-hover:border-blue-500 group-hover:text-blue-600 text-xs"
          >
            <Send className="w-3 h-3 mr-1" />
            Request
          </Button>
        )}
        <Button
          asChild
          size="sm"
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <Link to={`/centers/${center.id}/book`}>
            Book
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CenterCard;
