import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, MapPin, SlidersHorizontal } from 'lucide-react';
import { useCenters } from '@/hooks/useHealthcareCenters';
import CenterList from '@/components/centers/CenterList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const Centers: React.FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const {
    filteredCenters,
    loading,
    error,
    updateFilters,
    clearFilters,
    searchCenters
  } = useCenters();

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          // Update filters with user location
          updateFilters({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, [updateFilters]);

  const handleCenterClick = (center: any) => {
    navigate(`/centers/${center.id}`);
  };

  const handleSearch = (searchTerm: string) => {
    searchCenters(searchTerm);
  };


  const handleClearFilters = () => {
    clearFilters();
  };

  // Popular specialties for quick filtering
  const popularSpecialties = [
    'Emergency Care',
    'Surgery', 
    'Cardiology',
    'Pediatrics',
    'General Dentistry',
    'Eye Exams'
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Centers</h1>
          <p className="text-gray-600 mt-1">
            Find and book appointments at nearby healthcare facilities
          </p>
        </div>
        
        {/* View Toggle Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex items-center gap-2"
          >
            <Grid className="w-4 h-4" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Map
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-4">
        {/* Main Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, location, or specialty..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                onChange={(e) => handleSearch(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Center Type:</label>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option>Hospital</option>
              <option>Clinic</option>
              <option>Specialized</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Distance:</label>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option>Any Distance</option>
              <option>Within 5 miles</option>
              <option>Within 10 miles</option>
              <option>Within 25 miles</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Availability:</label>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option>Any Time</option>
              <option>Today</option>
              <option>This Week</option>
              <option>Next Week</option>
            </select>
          </div>
          
          <Button
            onClick={handleClearFilters}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Clear Filters
          </Button>
        </div>

        {/* Specialties */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {popularSpecialties.map((specialty) => (
              <Badge
                key={specialty}
                variant="outline"
                className="cursor-pointer hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors px-3 py-1"
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        <div className="text-sm text-gray-600">
          Active filters: Type: Hospital
        </div>
      </div>

      {/* Results Summary and Sorting */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium text-gray-900">
          Found {filteredCenters.length} healthcare centers
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          Sorted by distance
        </div>
      </div>

      {/* Centers Grid */}
      <CenterList
        centers={filteredCenters}
        loading={loading}
        error={error}
        onCenterClick={handleCenterClick}
        showDistance={!!userLocation}
        userLocation={userLocation || undefined}
        viewMode={viewMode}
        hideControls={true}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <LoadingSpinner />
            <span>Loading centers...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CentersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Centers />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
