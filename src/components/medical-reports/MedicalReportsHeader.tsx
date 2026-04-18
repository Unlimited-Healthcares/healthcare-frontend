import React from 'react';
import { Search, Plus, Download, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MedicalReportsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onGenerateReport: () => void;
  onExportAnalytics: () => void;
  onFilterToggle: () => void;
  totalReports: number;
  isFiltered: boolean;
}

export const MedicalReportsHeader: React.FC<MedicalReportsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onGenerateReport,
  onExportAnalytics,
  onFilterToggle,
  totalReports,
  isFiltered
}) => {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Search Row */}
      <div className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reports, patients, doctors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full text-sm"
          />
        </div>
      </div>
      
      {/* Stats & Actions Row */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {totalReports} report{totalReports !== 1 ? 's' : ''}
          </span>
          {isFiltered && (
            <Badge variant="secondary" className="text-xs">
              Filtered
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterToggle}
            className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Filters</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExportAnalytics}
            className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Export Analytics</span>
            <span className="sm:hidden">Export</span>
          </Button>
          
          <Button
            onClick={onGenerateReport}
            size="sm"
            className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Generate Report</span>
            <span className="sm:hidden">Generate</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
