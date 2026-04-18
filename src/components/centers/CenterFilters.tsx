import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { CenterFilters } from '@/types/healthcare-centers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CenterFiltersProps {
  filters: CenterFilters;
  centerTypes: Array<{ value: string; label: string }>;
  onFiltersChange: (filters: Partial<CenterFilters>) => void;
  onClearFilters: () => void;
  onSearch: (searchTerm: string) => void;
  onLocationFilter: (city?: string, state?: string) => void;
  loading?: boolean;
}

const CenterFilters: React.FC<CenterFiltersProps> = ({
  filters,
  centerTypes,
  onFiltersChange,
  onClearFilters,
  onSearch,
  onLocationFilter,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({ type: type === 'all' ? undefined : type });
  };

  const handleDistanceChange = (distance: string) => {
    const distanceValue = distance === 'any' ? undefined : parseInt(distance);
    onFiltersChange({ radius: distanceValue });
  };

  const handleAvailabilityChange = (availability: string) => {
    // This would be implemented based on center hours/availability
    console.log('Availability filter:', availability);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.city) count++;
    if (filters.state) count++;
    if (filters.radius) count++;
    if (filters.search) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by name, location, or specialty..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4 py-3 text-base"
          disabled={loading}
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.type || 'all'}
          onValueChange={handleTypeChange}
          disabled={loading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Center Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {centerTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.radius?.toString() || 'any'}
          onValueChange={handleDistanceChange}
          disabled={loading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Distance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Distance</SelectItem>
            <SelectItem value="5">Within 5km</SelectItem>
            <SelectItem value="10">Within 10km</SelectItem>
            <SelectItem value="25">Within 25km</SelectItem>
            <SelectItem value="50">Within 50km</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value="any"
          onValueChange={handleAvailabilityChange}
          disabled={loading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Time</SelectItem>
            <SelectItem value="now">Available Now</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.type && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {centerTypes.find(t => t.value === filters.type)?.label}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ type: undefined })}
              />
            </Badge>
          )}
          {filters.city && (
            <Badge variant="secondary" className="flex items-center gap-1">
              City: {filters.city}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onLocationFilter(undefined, filters.state)}
              />
            </Badge>
          )}
          {filters.state && (
            <Badge variant="secondary" className="flex items-center gap-1">
              State: {filters.state}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onLocationFilter(filters.city, undefined)}
              />
            </Badge>
          )}
          {filters.radius && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Within {filters.radius}km
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ radius: undefined })}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  City
                </label>
                <Input
                  placeholder="Enter city"
                  value={filters.city || ''}
                  onChange={(e) => onLocationFilter(e.target.value, filters.state)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  State
                </label>
                <Input
                  placeholder="Enter state"
                  value={filters.state || ''}
                  onChange={(e) => onLocationFilter(filters.city, e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Services
              </label>
              <div className="flex flex-wrap gap-2">
                {['Emergency Care', 'Surgery', 'Cardiology', 'Pediatrics', 'General Dentistry', 'Eye Exams'].map((service) => (
                  <Badge
                    key={service}
                    variant="outline"
                    className="cursor-pointer hover:bg-teal-50 hover:border-teal-300"
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specialty Chips */}
      <div className="flex flex-wrap gap-2">
        {['Emergency Care', 'Surgery', 'Cardiology', 'Pediatrics', 'General Dentistry', 'Eye Exams'].map((specialty) => (
          <Badge
            key={specialty}
            variant="outline"
            className="cursor-pointer hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors"
          >
            {specialty}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CenterFilters;
