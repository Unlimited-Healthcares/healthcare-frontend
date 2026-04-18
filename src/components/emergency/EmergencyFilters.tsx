import React from 'react';
import { Search, Filter, Download, AlertTriangle, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertType, AlertStatus, RequestStatus, Priority, ReportStatus, ViralReportType } from '@/types/emergency';

interface EmergencyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTab: 'alerts' | 'ambulances' | 'reports';
  onTabChange: (tab: 'alerts' | 'ambulances' | 'reports') => void;
  onFilterChange: (filters: any) => void;
  onExport: () => void;
  alertFilters?: {
    type?: AlertType;
    status?: AlertStatus;
  };
  ambulanceFilters?: {
    status?: RequestStatus;
    priority?: Priority;
  };
  reportFilters?: {
    type?: ViralReportType;
    status?: ReportStatus;
  };
}

export const EmergencyFilters: React.FC<EmergencyFiltersProps> = ({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  onFilterChange,
  onExport,
  alertFilters = {},
  ambulanceFilters = {},
  reportFilters = {}
}) => {
  const tabs = [
    { id: 'alerts', label: 'Active Alerts', icon: AlertTriangle, count: 0 },
    { id: 'ambulances', label: 'Ambulance Requests', icon: Truck, count: 0 },
    { id: 'reports', label: 'Viral Reports', icon: Shield, count: 0 }
  ];

  const handleAlertFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...alertFilters,
      [key]: value === 'all' ? undefined : value
    });
  };

  const handleAmbulanceFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...ambulanceFilters,
      [key]: value === 'all' ? undefined : value
    });
  };

  const handleReportFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...reportFilters,
      [key]: value === 'all' ? undefined : value
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeTab === 'alerts') {
      count += Object.values(alertFilters).filter(v => v !== undefined).length;
    } else if (activeTab === 'ambulances') {
      count += Object.values(ambulanceFilters).filter(v => v !== undefined).length;
    } else if (activeTab === 'reports') {
      count += Object.values(reportFilters).filter(v => v !== undefined).length;
    }
    return count;
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-gray-300 focus:border-teal-500 focus:ring-teal-500 w-full"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 sm:w-auto"
        >
          <Download className="h-4 w-4" />
          <span className="sm:inline">Export</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-4 sm:mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
              <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4">
          {activeTab === 'alerts' && (
            <>
              <Select
                value={alertFilters.type || 'all'}
                onValueChange={(value) => handleAlertFilterChange('type', value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Alert Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sos">SOS</SelectItem>
                  <SelectItem value="medical_emergency">Medical Emergency</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                  <SelectItem value="security_threat">Security Threat</SelectItem>
                  <SelectItem value="panic">Panic</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={alertFilters.status || 'all'}
                onValueChange={(value) => handleAlertFilterChange('status', value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="responding">Responding</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_alarm">False Alarm</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          {activeTab === 'ambulances' && (
            <>
              <Select
                value={ambulanceFilters.status || 'all'}
                onValueChange={(value) => handleAmbulanceFilterChange('status', value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="en_route">En Route</SelectItem>
                  <SelectItem value="on_scene">On Scene</SelectItem>
                  <SelectItem value="transporting">Transporting</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={ambulanceFilters.priority || 'all'}
                onValueChange={(value) => handleAmbulanceFilterChange('priority', value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          {activeTab === 'reports' && (
            <>
              <Select
                value={reportFilters.type || 'all'}
                onValueChange={(value) => handleReportFilterChange('type', value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="outbreak_report">Outbreak Report</SelectItem>
                  <SelectItem value="exposure_report">Exposure Report</SelectItem>
                  <SelectItem value="symptom_report">Symptom Report</SelectItem>
                  <SelectItem value="contact_trace">Contact Trace</SelectItem>
                  <SelectItem value="recovery_report">Recovery Report</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={reportFilters.status || 'all'}
                onValueChange={(value) => handleReportFilterChange('status', value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="investigated">Investigated</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700 w-full sm:w-auto"
            >
              Clear ({getActiveFiltersCount()})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
