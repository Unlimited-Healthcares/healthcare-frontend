import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Star,
  MessageCircle,
  ArrowLeft,
  Search,
  AlertCircle
} from 'lucide-react';
import { useApprovedProviders } from '@/hooks/useApprovedProviders';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ApprovedDoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { doctors, loading, error, refetch } = useApprovedProviders();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'specialization'>('name');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleBookAppointment = (doctorId: string) => {
    // Navigate to booking page with doctor ID
    navigate(`/appointments?doctorId=${doctorId}`);
  };

  const handleSendMessage = (doctorId: string) => {
    // Navigate to chat page with doctor
    navigate(`/chat?doctorId=${doctorId}`);
  };

  const handleViewProfile = (publicId: string) => {
    // Navigate to doctor's public profile
    navigate(`/profile/${publicId}`);
  };

  // Filter and sort doctors
  const filteredDoctors = doctors
    .filter(doctorProvider => {
      const doctor = doctorProvider.provider;
      if (!doctor) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${doctor.profile.firstName} ${doctor.profile.lastName}`.toLowerCase();
      const specialization = (doctor.profile.specialization || '').toLowerCase();
      
      return fullName.includes(searchLower) || specialization.includes(searchLower);
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.provider?.profile.firstName} ${a.provider?.profile.lastName}`;
        const nameB = `${b.provider?.profile.firstName} ${b.provider?.profile.lastName}`;
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'date') {
        return new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime();
      } else if (sortBy === 'specialization') {
        const specA = a.provider?.profile.specialization || '';
        const specB = b.provider?.profile.specialization || '';
        return specA.localeCompare(specB);
      }
      return 0;
    });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-lg text-gray-600">Loading your approved doctors...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Doctors</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={refetch} disabled={loading}>
                  {loading ? 'Retrying...' : 'Try Again'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Approved Doctors</h1>
              <p className="text-gray-600 mt-1">
                {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} connected with you
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'specialization')}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="date">Sort by Date</option>
                  <option value="specialization">Sort by Specialization</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {doctors.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Approved Doctors Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't been approved by any doctors yet. Send requests to doctors to get started.
                </p>
                <Button onClick={() => navigate('/discovery')}>
                  Find Doctors
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredDoctors.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-6">
                  No doctors match your search criteria. Try adjusting your search.
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Doctors List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctorProvider) => {
              const doctor = doctorProvider.provider;
              if (!doctor) return null;

              return (
                <Card 
                  key={doctorProvider.id} 
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                          {doctor.profile.avatar ? (
                            <img
                              src={doctor.profile.avatar}
                              alt={`${doctor.profile.firstName} ${doctor.profile.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="text-blue-600 font-semibold text-base leading-none text-center uppercase tracking-wide whitespace-nowrap">
                              {(() => {
                                const firstName = doctor.profile.firstName;
                                const lastName = doctor.profile.lastName;
                                const email = doctor.email;
                                
                                if (firstName && lastName) {
                                  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
                                } else if (firstName) {
                                  return firstName.charAt(0);
                                } else if (lastName) {
                                  return lastName.charAt(0);
                                } else if (email) {
                                  return email.charAt(0).toUpperCase();
                                } else {
                                  return 'DR';
                                }
                              })()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Dr. {doctor.profile.firstName} {doctor.profile.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {doctor.profile.specialization || 'General Practice'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(doctorProvider.status)}>
                        {doctorProvider.status}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-xs text-gray-500">(24)</span>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Approved {formatDate(doctorProvider.approvedAt)}</span>
                      </div>

                      {doctor.profile.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{doctor.profile.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{doctor.email}</span>
                      </div>

                      {(doctor.profile as any).bio && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {(doctor.profile as any).bio}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleBookAppointment(doctor.id)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleSendMessage(doctor.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewProfile(doctor.publicId || doctor.id)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApprovedDoctorsPage;

