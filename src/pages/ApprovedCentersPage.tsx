import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  MessageCircle,
  ArrowLeft,
  Search,
  Clock,
  ExternalLink,
  Navigation,
  AlertCircle
} from 'lucide-react';
import { useApprovedProviders } from '@/hooks/useApprovedProviders';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ApprovedCentersPage: React.FC = () => {
  const navigate = useNavigate();
  const { centers, loading, error, refetch } = useApprovedProviders();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('name');

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

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleViewDetails = (centerId: string) => {
    // Navigate to center details page
    navigate(`/centers/${centerId}`);
  };

  const handleSendMessage = (centerId: string) => {
    // Navigate to chat page with center
    navigate(`/chat?centerId=${centerId}`);
  };

  const handleGetDirections = (address: string) => {
    // Open Google Maps with the address
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  // Filter and sort centers
  const filteredCenters = centers
    .filter(centerProvider => {
      const center = centerProvider.center;
      if (!center) return false;

      const searchLower = searchTerm.toLowerCase();
      const name = (center.name || '').toLowerCase();
      const type = (center.centerType || '').toLowerCase();
      const address = (center.address || '').toLowerCase();

      return name.includes(searchLower) || type.includes(searchLower) || address.includes(searchLower);
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a.center?.name || '';
        const nameB = b.center?.name || '';
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'date') {
        return new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime();
      } else if (sortBy === 'type') {
        const typeA = a.center?.centerType || '';
        const typeB = b.center?.centerType || '';
        return typeA.localeCompare(typeB);
      }
      return 0;
    });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-lg text-gray-600">Loading your approved centers...</span>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Centers</h3>
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
              <h1 className="text-3xl font-bold text-gray-900">My Approved Centers</h1>
              <p className="text-gray-600 mt-1">
                {centers.length} {centers.length === 1 ? 'center' : 'centers'} connected with you
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
                  placeholder="Search by name, type, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'type')}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="date">Sort by Date</option>
                  <option value="type">Sort by Type</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {centers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Approved Centers Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't been approved by any healthcare centers yet. Send requests to centers to get started.
                </p>
                <Button onClick={() => navigate('/discovery')}>
                  Find Centers
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredCenters.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-6">
                  No centers match your search criteria. Try adjusting your search.
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Centers List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map((centerProvider) => {
              const center = centerProvider.center;
              if (!center) return null;

              return (
                <Card
                  key={centerProvider.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {center.name}
                          </h3>
                          {center.centerType && (
                            <Badge className={`${getCenterTypeColor(center.centerType)} mt-1`}>
                              {center.centerType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(centerProvider.status)}>
                        {centerProvider.status}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">4.6</span>
                        <span className="text-xs text-gray-500">(18)</span>
                      </div>
                    </div>

                    {/* Center Information */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Approved {formatDate(centerProvider.approvedAt)}</span>
                      </div>

                      {center.address && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{center.address}</span>
                        </div>
                      )}

                      {center.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{center.phone}</span>
                        </div>
                      )}

                      {center.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{center.email}</span>
                        </div>
                      )}

                      {center.hours && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{center.hours}</span>
                        </div>
                      )}

                      {center.description && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {center.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewDetails(center.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSendMessage(center.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        {center.address && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleGetDirections(center.address)}
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Directions
                          </Button>
                        )}
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

export default ApprovedCentersPage;

