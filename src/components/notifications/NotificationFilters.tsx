import React from 'react';
import { Search, Filter, Download, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { NotificationFilters as FilterType } from '@/types/notifications';

interface NotificationFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
  onExport: () => void;
  onOpenPreferences: () => void;
  unreadCount: number;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFilterChange,
  onExport,
  onOpenPreferences,
  unreadCount
}) => {
  const [searchQuery, setSearchQuery] = React.useState(filters.search || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onFilterChange({ search: value });
  };

  const handleQuickFilter = (filterType: string) => {
    switch (filterType) {
      case 'unread':
        onFilterChange({ isRead: false });
        break;
      case 'critical':
        onFilterChange({ priority: 'critical' });
        break;
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        onFilterChange({ dateFrom: today, dateTo: today });
        break;
      case 'emergency':
        onFilterChange({ type: 'emergency' });
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFilterChange({
      search: undefined,
      type: undefined,
      isRead: undefined,
      priority: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: 1
    });
  };

  const hasActiveFilters = filters.search || filters.type || filters.isRead !== undefined || filters.priority || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 overflow-hidden">
      {/* Filters Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <Badge variant="destructive" className="ml-2">
            {unreadCount} unread
          </Badge>
        </div>
      </div>

      {/* Search and Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search title, message..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={onOpenPreferences}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden xs:inline">Preferences</span>
            <span className="xs:hidden">Prefs</span>
          </Button>
          <Button
            variant="outline"
            onClick={onExport}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={filters.isRead === false ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('unread')}
          className={`flex items-center gap-2 ${filters.isRead === false ? 'bg-red-600 hover:bg-red-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          <Bell className="h-4 w-4" />
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filters.priority === 'critical' ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('critical')}
          className={`flex items-center gap-2 ${filters.priority === 'critical' ? 'bg-orange-600 hover:bg-orange-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Critical Alerts
        </Button>
        <Button
          variant={filters.dateFrom ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('today')}
          className={`flex items-center gap-2 ${filters.dateFrom ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Today's Notifications
        </Button>
        <Button
          variant={filters.type === 'emergency' ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickFilter('emergency')}
          className={`flex items-center gap-2 ${filters.type === 'emergency' ? 'bg-red-600 hover:bg-red-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Emergency Only
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Type Filter */}
        <div className="min-w-[150px]">
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => onFilterChange({ type: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="appointment_scheduled">Appointment Scheduled</SelectItem>
              <SelectItem value="request_received">Request Received</SelectItem>
              <SelectItem value="request_approved">Request Approved</SelectItem>
              <SelectItem value="medical_record">Medical Record</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="test_result">Test Result</SelectItem>
              <SelectItem value="message">Message</SelectItem>
              <SelectItem value="chat_message">Chat Message</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Read Status Filter */}
        <div className="min-w-[150px]">
          <Select
            value={filters.isRead === undefined ? 'all' : filters.isRead.toString()}
            onValueChange={(value) => onFilterChange({ isRead: value === 'all' ? undefined : value === 'true' })}
          >
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="false">Unread</SelectItem>
              <SelectItem value="true">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="min-w-[150px]">
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) => onFilterChange({ priority: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
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
          {filters.type && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
              Type: {filters.type}
              <button
                onClick={() => onFilterChange({ type: undefined })}
                className="ml-1 hover:text-green-600"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.isRead !== undefined && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800">
              Status: {filters.isRead ? 'Read' : 'Unread'}
              <button
                onClick={() => onFilterChange({ isRead: undefined })}
                className="ml-1 hover:text-orange-600"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-800">
              Priority: {filters.priority}
              <button
                onClick={() => onFilterChange({ priority: undefined })}
                className="ml-1 hover:text-red-600"
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
