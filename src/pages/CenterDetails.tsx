import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  ArrowLeft,
  Calendar,
  Users,
  Stethoscope,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCenterDetails, useCenterTypeInfo } from '@/hooks/useHealthcareCenters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

const CenterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { center, services, staff, loading, error } = useCenterDetails(id || '');
  const { getCenterTypeLabel, getServiceType } = useCenterTypeInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading center details...</p>
        </div>
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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

  const serviceType = getServiceType(center);

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

  const handleBookAppointment = () => {
    navigate(`/centers/${center.id}/book`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/centers')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Centers
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Center Image */}
            <div className="lg:col-span-1">
              <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg bg-gray-100">
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
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Center Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{center.name}</h1>
                  <p className="text-lg text-gray-600 mb-3">
                    {getCenterTypeLabel(center.type)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={getServiceTypeColor(serviceType)}>
                      {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Center
                    </Badge>
                    <Badge variant={center.isActive ? 'default' : 'destructive'}>
                      {center.isActive ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">4.8 (124 reviews)</span>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {center.address && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">{center.address}</p>
                      {center.city && center.state && (
                        <p className="text-xs text-gray-500">{center.city}, {center.state}</p>
                      )}
                    </div>
                  </div>
                )}

                {center.phone && (
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{center.phone}</p>
                    </div>
                  </div>
                )}

                {center.email && (
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{center.email}</p>
                    </div>
                  </div>
                )}

                {center.hours && (
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Hours</p>
                      <p className="text-sm text-gray-600">{center.hours}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleBookAppointment}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                  size="lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* About Section */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About {center.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {`Welcome to ${center.name}, a leading ${getCenterTypeLabel(center.type).toLowerCase()}
                      providing comprehensive healthcare services. Our state-of-the-art facility is equipped with 
                      modern technology and staffed by experienced healthcare professionals dedicated to delivering 
                      exceptional patient care.`}
                    </p>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        '24/7 Emergency Care',
                        'Modern Equipment',
                        'Experienced Staff',
                        'Insurance Accepted',
                        'Online Booking',
                        'Patient Portal'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Info Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Center Type</p>
                      <p className="text-sm text-gray-600">{getCenterTypeLabel(center.type)}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Status</p>
                      <Badge variant={center.isActive ? 'default' : 'destructive'}>
                        {center.isActive ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Services Available</p>
                      <p className="text-sm text-gray-600">{services.length} services</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Staff Members</p>
                      <p className="text-sm text-gray-600">{staff.length} professionals</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Map Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MapPin className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Map view coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
                <p className="text-sm text-gray-600">
                  Choose from our comprehensive range of healthcare services
                </p>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No services available at this time</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Service information may not be accessible due to permissions or data availability.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                          {service.isEmergencyService && (
                            <Badge variant="destructive" className="text-xs">
                              Emergency
                            </Badge>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {service.durationMinutes && (
                              <span>{service.durationMinutes} min</span>
                            )}
                            {service.basePrice && (
                              <span>${service.basePrice}</span>
                            )}
                          </div>
                          <Button size="sm" variant="outline">
                            Book Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Team</CardTitle>
                <p className="text-sm text-gray-600">
                  Meet our experienced healthcare professionals
                </p>
              </CardHeader>
              <CardContent>
                {staff.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No staff information available</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Staff details may not be accessible due to permissions or data availability.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.filter(member => member && member.id).map((member) => {
                      // Safe access to profile data with fallbacks
                      const profile = member.user?.profile;
                      const displayName = profile?.displayName ||
                        (profile?.firstName && profile?.lastName
                          ? `${profile.firstName} ${profile.lastName}`
                          : member.user?.email || 'Unknown Staff Member');
                      const specialization = profile?.specialization;
                      const experience = profile?.experience;

                      return (
                        <div key={member.id} className="text-center">
                          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {displayName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 capitalize">
                            {member.role}
                          </p>
                          {specialization && (
                            <p className="text-xs text-gray-500 mb-2">
                              {specialization}
                            </p>
                          )}
                          {experience && (
                            <p className="text-xs text-gray-500">
                              {experience}
                            </p>
                          )}
                          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                            <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Registry Contact</p>
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                              <Phone className="h-3 w-3 text-indigo-500" />
                              <span>{center.phone || 'Central Registry'}</span>
                            </div>
                            {center.email && (
                              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                                <Mail className="h-3 w-3 text-indigo-500" />
                                <span className="truncate max-w-[150px]">{center.email}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 w-full rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold"
                            onClick={() => {
                              navigate(`/discovery?type=center&id=${center.id}&action=contact_secretary`);
                              toast.info("Routing through the Hospital Patient Management Secretary...");
                            }}
                          >
                            Contact Secretary
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Reviews</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">4.8 out of 5 (124 reviews)</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock Reviews */}
                  {[
                    {
                      name: 'Sarah Johnson',
                      rating: 5,
                      date: '2 days ago',
                      comment: 'Excellent service and very professional staff. The doctor was thorough and explained everything clearly.'
                    },
                    {
                      name: 'Michael Chen',
                      rating: 5,
                      date: '1 week ago',
                      comment: 'Great facility with modern equipment. The appointment was on time and the staff was very helpful.'
                    },
                    {
                      name: 'Emily Davis',
                      rating: 4,
                      date: '2 weeks ago',
                      comment: 'Good experience overall. The waiting time was a bit long but the care was worth it.'
                    }
                  ].map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{review.name}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CenterDetails;
