import React, { useState, useEffect } from 'react';
import { Search, Globe, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { SearchParams, SPECIALIZATIONS, CENTER_TYPES, COUNTRIES } from '@/types/discovery';

interface SearchFiltersProps {
  params: SearchParams;
  onChange: (params: SearchParams) => void;
  onSearch: () => void;
  userRole: string;
  loading?: boolean;
  compact?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  params,
  onChange,
  onSearch,
  loading = false,
  compact = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (params.specialty) count++;
    if (params.city) count++;
    if (params.state) count++;
    if (params.country) count++;
    if (params.service) count++;
    if (params.experience && params.experience > 0) count++;
    if (params.availability) count++;
    if (params.minPrice) count++;
    if (params.maxPrice) count++;
    setActiveFilters(count);
  }, [params]);

  const handleParamChange = (key: keyof SearchParams, value: any) => {
    // Convert "all" to empty string for specialty field
    const processedValue = key === 'specialty' && value === 'all' ? '' : value;
    onChange({ ...params, [key]: processedValue });
  };

  const clearFilters = () => {
    onChange({
      type: 'doctor',
      specialty: '',
      city: '',
      state: '',
      country: '',
      service: '',
      page: 1,
      limit: 20,
      experience: 0,
      availability: false,
      minPrice: undefined,
      maxPrice: undefined
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const filterContent = (
    <>
      {!compact && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Healthcare Professionals
            </h3>
            <div className="flex items-center gap-2">
              {activeFilters > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {activeFilters} filter{activeFilters !== 1 ? 's' : ''}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Name or Keyword</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search-query"
                placeholder="Search by name, clinic..."
                value={params.search || ''}
                onChange={(e) => handleParamChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-type">Search Type</Label>
            <Select
              value={params.type}
              onValueChange={(value) => handleParamChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[9999] rounded-2xl shadow-2xl border-blue-50">
                <SelectItem value="doctor" className="font-bold py-3 text-blue-800 underline decoration-blue-200 decoration-2 underline-offset-4">Health Care Practitioners</SelectItem>
                <SelectItem value="nurse" className="font-bold py-3 text-cyan-800">Nurses & Caregivers</SelectItem>
                <SelectItem value="practitioner" className="font-bold py-3 text-emerald-800">General Practitioners</SelectItem>
                <SelectItem value="diagnostic" className="font-bold py-3 text-amber-800 italic">Diagnosticians</SelectItem>
                <SelectItem value="maternity" className="font-bold py-3 text-rose-800">Midwives & Maternity</SelectItem>
                <SelectItem value="allied_practitioner" className="font-bold py-3 text-purple-800">Allied Healthcare Practitioners</SelectItem>
                <SelectItem value="biotech_engineer" className="font-bold py-3 text-teal-800">Biotech Specialists / Prosthetics</SelectItem>
                <SelectItem value="patient" className="font-bold py-3 text-orange-800 tracking-widest uppercase">Patients</SelectItem>
                <SelectItem value="center" className="font-bold py-3 text-indigo-800">Healthcare Centers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {params.type !== 'center' && (
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select
                value={params.specialty || 'all'}
                onValueChange={(value) => handleParamChange('specialty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="all">All Specialties</SelectItem>
                  {SPECIALIZATIONS.map(spec => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={params.country || 'all'}
              onValueChange={(value) => handleParamChange('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent className="z-[9999] max-h-80">
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map(country => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {params.type === 'center' && (
            <div className="space-y-2">
              <Label htmlFor="center-type">Center Type</Label>
              <Select
                value={params.specialty || 'all'}
                onValueChange={(value) => handleParamChange('specialty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="all">All Types</SelectItem>
                  {CENTER_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="service">Service</Label>
            <Input
              id="service"
              placeholder="e.g. Surgery, X-Ray..."
              value={params.service || ''}
              onChange={(e) => handleParamChange('service', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="city"
                placeholder="Enter city"
                value={params.city || ''}
                onChange={(e) => handleParamChange('city', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Submit button - Hidden in compact mode as parent drawer usually provides a sticky footer button */}
        {!compact && (
          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-200"
            >
              <Search className="h-5 w-5 mr-3" />
              {loading ? 'Searching...' : 'Initiate Search'}
            </Button>
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={params.state || ''}
                  onChange={(e) => handleParamChange('state', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country-other">Manual Country Entry</Label>
                <Input
                  id="country-other"
                  placeholder="Type country name..."
                  value={params.country || ''}
                  onChange={(e) => handleParamChange('country', e.target.value)}
                />
              </div>

              {params.type !== 'center' && (
                <div className="space-y-2">
                  <Label htmlFor="experience">Min. Experience: {params.experience} years</Label>
                  <Slider
                    id="experience"
                    min={0}
                    max={30}
                    step={1}
                    value={[params.experience || 0]}
                    onValueChange={([value]) => handleParamChange('experience', value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0 years</span>
                    <span>30+ years</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-price">Min Price</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="Min"
                    value={params.minPrice || ''}
                    onChange={(e) => handleParamChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-price">Max Price</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="Max"
                    value={params.maxPrice || ''}
                    onChange={(e) => handleParamChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>

            {params.type !== 'center' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="availability"
                  checked={params.availability || false}
                  onCheckedChange={(checked) => handleParamChange('availability', checked)}
                />
                <Label htmlFor="availability">Show only available professionals</Label>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-start pt-4">
          {activeFilters > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </form>
    </>
  );

  if (compact) {
    return filterContent;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Healthcare Professionals
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFilters > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {activeFilters} filter{activeFilters !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-query-main">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search-query-main"
                  placeholder="Name, clinic..."
                  value={params.search || ''}
                  onChange={(e) => handleParamChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-type">Search Type</Label>
              <Select
                value={params.type}
                onValueChange={(value) => handleParamChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="doctor">Health Care Practitioners</SelectItem>
                  <SelectItem value="nurse">Nurses & Caregivers</SelectItem>
                  <SelectItem value="practitioner">General Practitioners</SelectItem>
                  <SelectItem value="diagnostic">Diagnosticians</SelectItem>
                  <SelectItem value="maternity">Midwives & Maternity</SelectItem>
                  <SelectItem value="allied_practitioner">Allied Healthcare Practitioners</SelectItem>
                  <SelectItem value="biotech_engineer">Biotech Specialists / Prosthetics</SelectItem>
                  <SelectItem value="patient">Patients</SelectItem>
                  <SelectItem value="center">Healthcare Centers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {params.type !== 'center' && (
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={params.specialty || 'all'}
                  onValueChange={(value) => handleParamChange('specialty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="all">All Specialties</SelectItem>
                    {SPECIALIZATIONS.map(spec => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {params.type === 'center' && (
              <div className="space-y-2">
                <Label htmlFor="center-type">Center Type</Label>
                <Select
                  value={params.specialty || 'all'}
                  onValueChange={(value) => handleParamChange('specialty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="all">All Types</SelectItem>
                    {CENTER_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Input
                id="service-main"
                placeholder="e.g. Surgery, X-Ray..."
                value={params.service || ''}
                onChange={(e) => handleParamChange('service', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={params.city || ''}
                  onChange={(e) => handleParamChange('city', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Submit button aligned at far right */}
            <div className="flex items-end justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Initiate Search'}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Enter state"
                    value={params.state || ''}
                    onChange={(e) => handleParamChange('state', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country-other">Manual Country Entry</Label>
                  <Input
                    id="country-other"
                    placeholder="Type country name..."
                    value={params.country || ''}
                    onChange={(e) => handleParamChange('country', e.target.value)}
                  />
                </div>

                {params.type !== 'center' && (
                  <div className="space-y-2">
                    <Label htmlFor="experience">Min. Experience: {params.experience} years</Label>
                    <Slider
                      id="experience"
                      min={0}
                      max={30}
                      step={1}
                      value={[params.experience || 0]}
                      onValueChange={([value]) => handleParamChange('experience', value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>0 years</span>
                      <span>30+ years</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min Price"
                      value={params.minPrice || ''}
                      onChange={(e) => handleParamChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Max Price"
                      value={params.maxPrice || ''}
                      onChange={(e) => handleParamChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </div>

              {params.type !== 'center' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="availability"
                    checked={params.availability || false}
                    onCheckedChange={(checked) => handleParamChange('availability', checked)}
                  />
                  <Label htmlFor="availability">Show only available professionals</Label>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-start pt-4">
            {activeFilters > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
