import React, { useState } from 'react';
import { Grid, Map, List, SlidersHorizontal } from 'lucide-react';
import { HealthcareCenter } from '@/types/healthcare-centers';
import CenterCard from './CenterCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CenterListProps {
  centers: HealthcareCenter[];
  loading?: boolean;
  error?: string | null;
  onCenterClick?: (center: HealthcareCenter) => void;
  onSendRequest?: (center: HealthcareCenter) => void;
  showDistance?: boolean;
  userLocation?: { latitude: number; longitude: number };
  viewMode?: 'grid' | 'map';
  hideControls?: boolean;
}

type ViewMode = 'grid' | 'list' | 'map';
type SortOption = 'distance' | 'name' | 'rating' | 'type';

const CenterList: React.FC<CenterListProps> = ({
  centers,
  loading = false,
  error = null,
  onCenterClick,
  onSendRequest,
  showDistance = false,
  userLocation,
  viewMode: externalViewMode = 'grid',
  hideControls = false
}) => {
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  
  // Use external view mode if provided, otherwise use internal state
  const viewMode = externalViewMode || internalViewMode;

  // Helper functions for distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  // Calculate distance for each center if user location is provided
  const centersWithDistance = centers.map(center => {
    let distance: number | undefined;
    
    if (userLocation && center.latitude && center.longitude) {
      distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        center.latitude,
        center.longitude
      );
    }
    
    return { ...center, distance };
  });

  // Sort centers based on selected option
  const sortedCenters = [...centersWithDistance].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        // Mock rating - replace with real data when available
        return 4.8 - 4.8; // Placeholder
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <SlidersHorizontal className="w-12 h-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error Loading Centers</h3>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (centers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Grid className="w-12 h-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-600">No Centers Found</h3>
          <p className="text-sm text-gray-500">
            Try adjusting your search criteria or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header - Only show if controls are not hidden */}
      {!hideControls && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Found {centers.length} healthcare center{centers.length !== 1 ? 's' : ''}
            </h2>
            {showDistance && userLocation && (
              <Badge variant="secondary" className="text-xs">
                Sorted by distance
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={internalViewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInternalViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={internalViewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInternalViewMode('list')}
                className="rounded-none border-x"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={internalViewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInternalViewMode('map')}
                className="rounded-l-none"
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Centers Grid/List */}
      {viewMode === 'map' ? (
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Map className="w-12 h-12 mx-auto mb-2" />
            <p>Map view coming soon</p>
          </div>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {sortedCenters.map((center) => (
            <CenterCard
              key={center.id}
              center={center}
              showDistance={showDistance}
              distance={center.distance}
              onClick={() => onCenterClick?.(center)}
              onSendRequest={onSendRequest}
            />
          ))}
        </div>
      )}

      {/* Load More Button (if pagination is needed) */}
      {centers.length >= 10 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            Load More Centers
          </Button>
        </div>
      )}
    </div>
  );
};

export default CenterList;
