import React, { useState, useEffect } from 'react';
import { Building2, Search, MapPin, RefreshCw, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CenterList from '@/components/centers/CenterList';
import { centerToHealthcareCenter } from '@/utils/centerTypeAdapter';
import { RequestModal } from '@/components/requests/RequestModal';
import { discoveryService } from '@/services/discoveryService';
import { Center, CenterSearchParams, CenterSearchResponse, CENTER_TYPES } from '@/types/discovery';
import { toast } from 'react-hot-toast';
import { LocationServices } from '@/components/location/LocationServices';

const CentersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<CenterSearchParams>({
    type: '',
    location: '',
    radius: 25,
    page: 1,
    limit: 20
  });

  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Perform search
  const performSearch = async (params: CenterSearchParams, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const response: CenterSearchResponse = await discoveryService.searchCenters(params);

      if (append) {
        setCenters(prev => [...prev, ...response.centers]);
      } else {
        setCenters(response.centers);
      }
      setTotalResults(response.total);
      setHasMore(response.page < response.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    const newParams = { ...searchParams, page: 1 };
    setSearchParams(newParams);
    performSearch(newParams);
  };

  // Handle load more
  const handleLoadMore = () => {
    const newParams = { ...searchParams, page: (searchParams.page || 1) + 1 };
    setSearchParams(newParams);
    performSearch(newParams, true);
  };

  // Handle view details
  const handleViewDetails = (centerId: string) => {
    window.open(`/centers/${centerId}`, '_blank');
  };

  // Handle center click (for CenterList integration)
  const handleCenterClick = (center: any) => {
    handleViewDetails(center.id);
  };

  // Handle send request
  const handleSendRequest = (center: any) => {
    // Convert HealthcareCenter back to Center for the modal
    const centerData: Center = {
      id: center.id,
      publicId: center.displayId,
      name: center.name,
      type: center.type,
      address: center.address,
      city: center.city,
      state: center.state,
      zipCode: center.postalCode,
      latitude: center.latitude,
      longitude: center.longitude,
      generalLocation: {
        city: center.city || '',
        state: center.state || '',
        country: center.country || ''
      },
      hours: center.hours,
      phone: center.phone,
      email: center.email,
      isActive: center.isActive,
      createdAt: center.createdAt
    };
    setSelectedCenter(centerData);
    setShowRequestModal(true);
  };

  const handleRequestModalClose = () => {
    setShowRequestModal(false);
    setSelectedCenter(null);
  };

  const handleRequestSent = () => {
    toast.success('Request sent successfully!');
    handleRequestModalClose();
  };

  // Filter centers by search term
  const filteredCenters = centers.filter(center =>
    searchTerm === '' ||
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (center.type && center.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (center.city && center.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    center.services?.some(service =>
      service.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Initial search on component mount
  useEffect(() => {
    performSearch(searchParams);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Healthcare Centers
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Find hospitals and healthcare facilities in your area.
          </p>
        </div>

        {/* Search Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
              Search Centers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="center-type">Center Type</Label>
                <Select
                  value={searchParams.type || 'all'}
                  onValueChange={(value) => setSearchParams({ ...searchParams, type: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {CENTER_TYPES.map(type => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type === 'Ambulance' ? 'Ambulance Drivers / Medical Transport Teams' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="City, State or ZIP"
                    value={searchParams.location || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius">Radius: {searchParams.radius} miles</Label>
                <Select
                  value={searchParams.radius?.toString() || '25'}
                  onValueChange={(value) => setSearchParams({ ...searchParams, radius: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 miles</SelectItem>
                    <SelectItem value="10">10 miles</SelectItem>
                    <SelectItem value="25">25 miles</SelectItem>
                    <SelectItem value="50">50 miles</SelectItem>
                    <SelectItem value="100">100 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search centers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-4">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Search className="h-4 w-4" />
                {loading ? 'Searching...' : 'Search'}
              </Button>

              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <Button
                  variant={showNearby ? "default" : "outline"}
                  onClick={() => setShowNearby(!showNearby)}
                  className="text-sm"
                >
                  <MapPin className="h-4 w-4 mr-1 sm:mr-2" />
                  {showNearby ? 'Hide' : 'Show'} Nearby
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                  className="text-sm"
                >
                  <Navigation className="h-4 w-4 mr-1 sm:mr-2" />
                  {showMap ? 'Hide' : 'Show'} Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Services with GPS */}
        {showNearby && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <LocationServices onSelectCenter={(center) => {
              setSelectedCenter(center as any);
              // You could also auto-open details or scroll
            }} />
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredCenters.length} center{filteredCenters.length !== 1 ? 's' : ''} found
              </h2>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Searching for centers...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={handleSearch} variant="outline">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {!loading && !error && filteredCenters.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Centers Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any centers matching your search criteria.
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Try adjusting your search filters or expanding your search radius.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Grid */}
          {!loading && !error && filteredCenters.length > 0 && (
            <CenterList
              centers={filteredCenters.map(centerToHealthcareCenter)}
              loading={loading}
              error={error}
              onCenterClick={handleCenterClick}
              onSendRequest={handleSendRequest}
              showDistance={false}
              viewMode="grid"
              hideControls={true}
            />
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Centers'
                )}
              </Button>
            </div>
          )}

          {/* Results Summary */}
          {!loading && !error && filteredCenters.length > 0 && (
            <div className="text-center text-gray-600">
              <p>
                Showing {filteredCenters.length} of {totalResults} results
                {searchParams.page && searchParams.page > 1 && ` (Page ${searchParams.page})`}
              </p>
            </div>
          )}
        </div>
        {showRequestModal && selectedCenter && (
          <RequestModal
            isOpen={showRequestModal}
            onClose={handleRequestModalClose}
            recipient={selectedCenter}
            onSend={handleRequestSent}
          />
        )}
      </div>
    </div>
  );
};

export default CentersPage;
