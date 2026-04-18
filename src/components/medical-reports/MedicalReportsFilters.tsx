import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Calendar } from 'lucide-react';
import { MedicalReportFilters } from '@/types/medical-reports';

interface MedicalReportsFiltersProps {
  filters: MedicalReportFilters;
  onFiltersChange: (filters: MedicalReportFilters) => void;
  onClearFilters: () => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const MedicalReportsFilters: React.FC<MedicalReportsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isVisible,
  onToggle
}) => {
  const handleFilterChange = (key: keyof MedicalReportFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value =>
    value !== undefined && value !== null && value !== '' &&
    !(Array.isArray(value) && value.length === 0)
  ).length - 2; // Subtract page and limit

  const quickFilters = [
    { label: 'Pending', value: 'pending', key: 'status' as keyof MedicalReportFilters },
    { label: 'Urgent', value: 'urgent', key: 'priority' as keyof MedicalReportFilters },
    { label: 'Today', value: new Date().toISOString().split('T')[0], key: 'dateFrom' as keyof MedicalReportFilters },
    { label: 'This Week', value: getWeekDateRange(), key: 'dateFrom' as keyof MedicalReportFilters },
  ];

  const reportTypes = [
    { value: 'general', label: 'General Checkup' },
    { value: 'diagnostic', label: 'Diagnostic Results' },
    { value: 'radiology', label: 'Radiology Report' },
    { value: 'surgical', label: 'Surgical Report' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'specialist', label: 'Specialist Examination' },
    { value: 'emergency', label: 'Emergency Visit' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' }
  ];

  if (!isVisible) {
    return (
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Analytics Filters
            </CardTitle>
            <CardDescription>
              Filter and analyze medical reports data
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Quick Filters */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Quick Filters</Label>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.label}
                  variant={filters[filter.key] === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (filters[filter.key] === filter.value) {
                      handleFilterChange(filter.key, undefined);
                    } else {
                      handleFilterChange(filter.key, filter.value);
                    }
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Time Frame */}
            <div className="space-y-2">
              <Label htmlFor="timeFrame">Time Frame</Label>
              <Select
                value={filters.dateFrom ? 'custom' : 'monthly'}
                onValueChange={(value) => {
                  if (value === 'monthly') {
                    handleFilterChange('dateFrom', undefined);
                    handleFilterChange('dateTo', undefined);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select
                value={filters.reportType || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('reportType', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Records" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Healthcare Center */}
            <div className="space-y-2">
              <Label htmlFor="center">Healthcare Center</Label>
              <Select
                value={filters.centerId || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('centerId', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Centers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Centers</SelectItem>
                  <SelectItem value="center-1">City General Hospital</SelectItem>
                  <SelectItem value="center-2">Central Medical Clinic</SelectItem>
                  <SelectItem value="center-3">Community Wellness Center</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                  className="pr-8"
                />
                <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                  className="pr-8"
                />
                <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={filters.priority || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('priority', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('status', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('category', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="general">General Medicine</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get week date range
function getWeekDateRange() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  return startOfWeek.toISOString().split('T')[0];
}
