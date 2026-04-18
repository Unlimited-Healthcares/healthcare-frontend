import React from 'react';
import { Search, Filter, Download, Plus, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { VideoConferenceFilters as FilterType } from '@/types/videoConferences';

interface VideoConferenceFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
  onExport: () => void;
  onCreateConference: () => void;
}

export const VideoConferenceFilters: React.FC<VideoConferenceFiltersProps> = ({
  filters,
  onFilterChange,
  onExport,
  onCreateConference
}) => {
  const [searchQuery, setSearchQuery] = React.useState(filters.search || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onFilterChange({ search: value });
  };

  const handleQuickFilter = (filterType: string) => {
    switch (filterType) {
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        onFilterChange({ dateFrom: today, dateTo: today });
        break;
      case 'active':
        onFilterChange({ status: 'active' });
        break;
      case 'scheduled':
        onFilterChange({ status: 'scheduled' });
        break;
      case 'consultation':
        onFilterChange({ type: 'consultation' });
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFilterChange({
      search: undefined,
      status: undefined,
      type: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: 1
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.type || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
      {/* Filters Header */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h3>
      </div>

      {/* Search and Quick Actions */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conferences..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport} className="flex items-center gap-1 sm:gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm flex-1 sm:flex-none">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={onCreateConference} className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm flex-1 sm:flex-none">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>New</span>
            <span className="hidden sm:inline">Conference</span>
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        <Button
          variant={filters.dateFrom ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('today')}
          className={`flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${filters.dateFrom ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          <Video className="h-3 w-3 sm:h-4 sm:w-4" />
          Today
        </Button>
        <Button
          variant={filters.status === 'active' ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('active')}
          className={`flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${filters.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Active
        </Button>
        <Button
          variant={filters.status === 'scheduled' ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('scheduled')}
          className={`flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${filters.status === 'scheduled' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Scheduled
        </Button>
        <Button
          variant={filters.type === 'consultation' ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('consultation')}
          className={`flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${filters.type === 'consultation' ? 'bg-teal-600 hover:bg-teal-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Consultation
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-[10px] sm:text-xs md:text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 whitespace-nowrap flex-shrink-0"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="min-w-[150px]">
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFilterChange({ status: value === 'all' ? undefined : value as 'scheduled' | 'active' | 'ended' | 'cancelled' | 'paused' })}
          >
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="min-w-[150px]">
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => onFilterChange({ type: value === 'all' ? undefined : value as any })}
          >
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="group_session">Group Session</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="presentation">Presentation</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="min-w-[150px]">
          <Select
            value={filters.dateFrom || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                onFilterChange({ dateFrom: undefined, dateTo: undefined });
              } else if (value === 'today') {
                const today = new Date().toISOString().split('T')[0];
                onFilterChange({ dateFrom: today, dateTo: today });
              } else if (value === 'week') {
                const today = new Date();
                const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
                onFilterChange({
                  dateFrom: weekStart.toISOString().split('T')[0],
                  dateTo: weekEnd.toISOString().split('T')[0]
                });
              } else if (value === 'month') {
                const today = new Date();
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                onFilterChange({
                  dateFrom: monthStart.toISOString().split('T')[0],
                  dateTo: monthEnd.toISOString().split('T')[0]
                });
              }
            }}
          >
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
              Search: {filters.search}
              <button
                onClick={() => onFilterChange({ search: undefined })}
                className="ml-1 hover:text-blue-600"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
              Status: {filters.status}
              <button
                onClick={() => onFilterChange({ status: undefined })}
                className="ml-1 hover:text-green-600"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800">
              Type: {filters.type}
              <button
                onClick={() => onFilterChange({ type: undefined })}
                className="ml-1 hover:text-purple-600"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
