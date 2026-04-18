import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  Star,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
// ApprovedProvider type imported where needed via hook return; unused import removed
import { useApprovedProviders } from '@/hooks/useApprovedProviders';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ApprovedCentersCardProps {
  className?: string;
}

export const ApprovedCentersCard: React.FC<ApprovedCentersCardProps> = ({ className }) => {
  const navigate = useNavigate();
  const { centers, loading, error, refetch } = useApprovedProviders();

  const handleViewAll = () => {
    navigate('/me/centers');
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

  const getCenterTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'hospital':
        return 'bg-red-100 text-red-800';
      case 'pharmacy':
        return 'bg-green-100 text-green-800';
      case 'diagnostic':
        return 'bg-purple-100 text-purple-800';
      case 'dental':
        return 'bg-teal-100 text-teal-800';
      case 'eye':
        return 'bg-indigo-100 text-indigo-800';
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
            <Building2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            <span className="text-sm md:text-base font-semibold text-gray-800">Approved Centers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-gray-600">Loading approved centers...</span>
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
            <Building2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            <span className="text-sm md:text-base font-semibold text-gray-800">Approved Centers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Centers</h3>
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
            <Building2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            <span className="text-sm md:text-base font-semibold text-gray-800">Approved Centers</span>
            <Badge variant="secondary" className="ml-2 text-xs px-2 py-1">
              {centers.length}
            </Badge>
          </div>
          {centers.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="text-green-600 hover:text-green-700 text-xs md:text-sm"
            >
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {centers.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Centers Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't been approved by any healthcare centers yet. Send requests to centers to get started.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/discovery')}
            >
              Find Centers
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {centers.map((centerProvider) => {
              const center = centerProvider.center;
              if (!center) return null;

              return (
                <div
                  key={centerProvider.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={handleViewAll}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleViewAll();
                    }
                  }}
                  aria-label={`View details for ${center.name}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{center.name}</h4>
                        <div className="flex items-center space-x-2">
                          {center.centerType && (
                            <Badge className={getCenterTypeColor(center.centerType)}>
                              {center.centerType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(centerProvider.status)}>
                      {centerProvider.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{center.address}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Approved on {formatDate(centerProvider.approvedAt)}</span>
                    </div>

                    {center.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{center.phone}</span>
                      </div>
                    )}

                    {center.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{center.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">0.0</span>
                      <span className="text-xs text-gray-500">(0 reviews)</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Details
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
