import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Share,
  Trash2,
  FileText,
  Calendar,
  User,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';
import { MedicalReport, MedicalReportFilters } from '@/types/medical-reports';
import { format } from 'date-fns';

interface MedicalReportsListProps {
  reports: MedicalReport[];
  filters: MedicalReportFilters;
  onFiltersChange: (filters: MedicalReportFilters) => void;
  onViewReport: (report: MedicalReport) => void;
  onEditReport: (report: MedicalReport) => void;
  onDeleteReport: (report: MedicalReport) => void;
  onShareReport: (report: MedicalReport) => void;
  onExportReport: (report: MedicalReport) => void;
  onGenerateReport?: () => void;
  loading?: boolean;
  error?: string | null;
}

export const MedicalReportsList: React.FC<MedicalReportsListProps> = ({
  reports,
  filters,
  onFiltersChange,
  onViewReport,
  onEditReport,
  onDeleteReport,
  onShareReport,
  onExportReport,
  onGenerateReport,
  loading = false,
  error = null
}) => {
  const [deleteReport, setDeleteReport] = React.useState<MedicalReport | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'draft':
        return <FileText className="h-3 w-3" />;
      case 'archived':
        return <Archive className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'general': 'General Wellness Report',
      'lab': 'Diagnostic Results Summary',
      'radiology': 'Imaging & Radiology Report',
      'surgical': 'Surgical Procedure Report',
      'consultation': 'Clinical Consultation Record',
      'specialist': 'Specialist Clinical Examination',
      'emergency': 'Emergency Intervention Report'
    };
    return typeMap[type] || type;
  };

  const handleSort = (column: string) => {
    const currentSortBy = filters.sortBy;
    const currentSortOrder = filters.sortOrder;

    let newSortBy = column as any;
    let newSortOrder: 'asc' | 'desc' = 'asc';

    if (currentSortBy === column) {
      newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    }

    onFiltersChange({
      ...filters,
      sortBy: newSortBy,
      sortOrder: newSortOrder
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical Reports</CardTitle>
          <CardDescription>Loading medical reports...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical Reports</CardTitle>
          <CardDescription>Error loading medical reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Medical Reports</CardTitle>
          <CardDescription>No medical reports found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-full shadow-sm w-fit mx-auto mb-4">
              <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground font-medium mb-6">
              {filters.search || Object.values(filters).some(v => v !== undefined && v !== null && v !== '')
                ? 'No reports match your current filters'
                : 'No medical reports have been created yet'
              }
            </p>
            <Button onClick={onGenerateReport} className="rounded-xl shadow-lg hover:shadow-xl transition-all">
              Generate First Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Medical Reports</CardTitle>
          <CardDescription>
            {reports.length} report{reports.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('patientName')}
                  >
                    <div className="flex items-center gap-2">
                      Patient
                      {filters.sortBy === 'patientName' && (
                        <span className="text-xs">
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('reportType')}
                  >
                    <div className="flex items-center gap-2">
                      Type
                      {filters.sortBy === 'reportType' && (
                        <span className="text-xs">
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      Priority
                      {filters.sortBy === 'priority' && (
                        <span className="text-xs">
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {filters.sortBy === 'status' && (
                        <span className="text-xs">
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('generatedDate')}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {filters.sortBy === 'generatedDate' && (
                        <span className="text-xs">
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.patientName}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {report.patientId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {getReportTypeLabel(report.reportType)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {report.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.doctorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.centerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(report.priority)}
                      >
                        {report.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 w-fit ${getStatusColor(report.status)}`}
                      >
                        {getStatusIcon(report.status)}
                        {report.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(report.generatedDate), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewReport(report)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditReport(report)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onExportReport(report)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onShareReport(report)}>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteReport(report)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteReport} onOpenChange={() => setDeleteReport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medical Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the medical report for {deleteReport?.patientName}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteReport) {
                  onDeleteReport(deleteReport);
                  setDeleteReport(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
