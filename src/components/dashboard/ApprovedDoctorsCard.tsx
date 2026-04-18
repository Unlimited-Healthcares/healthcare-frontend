import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Star,
  ExternalLink,
  Users,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
// ApprovedProvider type not needed directly here
import { useApprovedProviders } from '@/hooks/useApprovedProviders';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ApprovedDoctorsCardProps {
  className?: string;
}

export const ApprovedDoctorsCard: React.FC<ApprovedDoctorsCardProps> = ({ className }) => {
  const navigate = useNavigate();
  const { doctors, loading, error, refetch } = useApprovedProviders();

  const handleViewAll = () => {
    navigate('/me/doctors');
  };

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

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            <span className="text-sm md:text-base font-semibold text-gray-800">Health Care Practitioners</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-gray-600">Loading approved doctors...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            <span className="text-sm md:text-base font-semibold text-gray-800">Health Care Practitioners</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Doctors</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            <span className="text-sm md:text-base font-semibold text-gray-800">Health Care Practitioners</span>
            <Badge variant="secondary" className="ml-2 text-xs px-2 py-1">
              {doctors.length}
            </Badge>
          </div>
          {doctors.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="text-blue-600 hover:text-blue-700 text-xs md:text-sm"
            >
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {doctors.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Doctors Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't been approved by any doctors yet. Send requests to doctors to get started.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/discovery')}
            >
              Find Practitioners
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {doctors.map((doctorProvider) => {
              const doctor = doctorProvider.provider;
              if (!doctor) return null;

              return (
                <div
                  key={doctorProvider.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={handleViewAll}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleViewAll();
                    }
                  }}
                  aria-label={`View details for Dr. ${doctor.profile.firstName} ${doctor.profile.lastName}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                        {doctor.profile.avatar ? (
                          <img
                            src={doctor.profile.avatar}
                            alt={`${doctor.profile.firstName} ${doctor.profile.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="text-blue-600 font-semibold text-sm leading-none text-center uppercase tracking-wide whitespace-nowrap">
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
                        <h4 className="font-semibold text-gray-900">
                          Dr. {doctor.profile.firstName} {doctor.profile.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{doctor.profile.specialization || 'General Practice'}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(doctorProvider.status)}>
                      {doctorProvider.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Approved on {formatDate(doctorProvider.approvedAt)}</span>
                    </div>

                    {doctor.profile.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{doctor.profile.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{doctor.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">0.0</span>
                      <span className="text-xs text-gray-500">(0 reviews)</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
