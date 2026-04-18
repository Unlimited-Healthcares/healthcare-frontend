import React, { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { medicalReportsService } from '@/services/medicalReportsService';
import {
  MedicalReport,
  MedicalReportFilters,
  MedicalReportKPIs,
  MedicalReportAnalytics,
  MedicalReportQuickStats
} from '@/types/medical-reports';
import { MedicalReportsHeader } from '@/components/medical-reports/MedicalReportsHeader';
import { MedicalReportsKPIs } from '@/components/medical-reports/MedicalReportsKPIs';
import { MedicalReportsFilters } from '@/components/medical-reports/MedicalReportsFilters';
import { MedicalReportsList } from '@/components/medical-reports/MedicalReportsList';
import { MedicalReportsAnalytics } from '@/components/medical-reports/MedicalReportsAnalytics';
import { MedicalReportsQuickStats } from '@/components/medical-reports/MedicalReportsQuickStats';
import { EnhancedMedicalReportGenerator } from '@/components/dashboard/EnhancedMedicalReportGenerator';
import { toast } from 'sonner';

const MedicalReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [kpis, setKpis] = useState<MedicalReportKPIs | null>(null);
  const [analytics, setAnalytics] = useState<MedicalReportAnalytics | null>(null);
  const [quickStats, setQuickStats] = useState<MedicalReportQuickStats | null>(null);
  const [filters, setFilters] = useState<MedicalReportFilters>({
    page: 1,
    limit: 10,
    sortBy: 'generatedDate',
    sortOrder: 'desc'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Load medical reports data
  const loadMedicalReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading medical reports with filters:', filters);

      // Use getMyMedicalReports for patients, getMedicalReports for staff/admin
      const isPatient = user?.roles?.includes('patient');

      // For patients, add their patientId to the filters
      const filtersWithPatientId = isPatient && user?.id
        ? { ...filters, patientId: user.id }
        : filters;

      const response = isPatient
        ? await medicalReportsService.getMyMedicalReports(filtersWithPatientId)
        : await medicalReportsService.getMedicalReports(filtersWithPatientId);

      console.log('📡 API Response:', response);

      // Check if response is valid
      if (!response) {
        throw new Error('No response received from server');
      }

      // Set reports with fallback to empty array
      const reportsData = response.data || [];

      // Fetch shared reports
      let sharedData: MedicalReport[] = [];
      try {
        sharedData = await medicalReportsService.getSharedWithMe();
      } catch (err) {
        console.error('Failed to load shared reports:', err);
      }

      // Merge and set reports (showing shared ones clearly)
      const combinedReports = [...reportsData, ...sharedData.map(r => ({ ...r, isShared: true }))];
      setReports(combinedReports);

      // Set pagination with fallback
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: combinedReports.length,
        totalPages: 1
      });

      // Calculate KPIs from reports data
      const calculatedKPIs = medicalReportsService.calculateKPIs(reportsData);
      setKpis(calculatedKPIs);

    } catch (err) {
      console.error('Failed to load medical reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load medical reports');

      // Set mock data for demonstration
      const mockReports: MedicalReport[] = [
        {
          id: '1',
          patientId: 'PT001',
          patientName: 'John Doe',
          reportType: 'general',
          title: 'Annual Checkup Report',
          diagnosis: 'Patient is in good health with no significant findings.',
          treatment: 'Continue current lifestyle and diet.',
          recommendations: 'Schedule follow-up in 6 months.',
          doctorId: 'DOC001',
          doctorName: 'Dr. Alice Johnson',
          centerId: 'CENTER001',
          centerName: 'City General Hospital',
          centerType: 'Hospital',
          centerAddress: '123 Medical Center Drive',
          centerContact: '+1 (555) 123-4567',
          centerEmail: 'info@citygeneral.com',
          generatedDate: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          status: 'active',
          priority: 'normal',
          isSensitive: false,
          isShareable: true,
          patientConsent: true,
          version: 1
        },
        {
          id: '2',
          patientId: 'PT002',
          patientName: 'Jane Smith',
          reportType: 'lab',
          title: 'Blood Test Results',
          diagnosis: 'Normal blood chemistry with slight elevation in cholesterol.',
          treatment: 'Diet modification and regular exercise recommended.',
          recommendations: 'Follow up in 3 months for cholesterol recheck.',
          doctorId: 'DOC002',
          doctorName: 'Dr. Bob Wilson',
          centerId: 'CENTER002',
          centerName: 'Central Medical Clinic',
          centerType: 'Clinic',
          centerAddress: '456 Health Street',
          centerContact: '+1 (555) 987-6543',
          centerEmail: 'contact@centralmedical.com',
          generatedDate: '2024-01-14T14:20:00Z',
          updatedAt: '2024-01-14T14:20:00Z',
          status: 'active',
          priority: 'normal',
          isSensitive: false,
          isShareable: true,
          patientConsent: true,
          version: 1
        },
        {
          id: '3',
          patientId: 'PT003',
          patientName: 'Mike Johnson',
          reportType: 'radiology',
          title: 'Chest X-Ray Report',
          diagnosis: 'Clear lung fields with no acute findings.',
          treatment: 'No treatment required.',
          recommendations: 'Continue monitoring if symptoms persist.',
          doctorId: 'DOC003',
          doctorName: 'Dr. Sarah Davis',
          centerId: 'CENTER001',
          centerName: 'City General Hospital',
          centerType: 'Hospital',
          centerAddress: '123 Medical Center Drive',
          centerContact: '+1 (555) 123-4567',
          centerEmail: 'info@citygeneral.com',
          generatedDate: '2024-01-13T09:15:00Z',
          updatedAt: '2024-01-13T09:15:00Z',
          status: 'active',
          priority: 'normal',
          isSensitive: false,
          isShareable: true,
          patientConsent: true,
          version: 1
        }
      ];

      setReports(mockReports);
      setPagination({
        page: 1,
        limit: 10,
        total: mockReports.length,
        totalPages: 1
      });

      const mockKPIs = medicalReportsService.calculateKPIs(mockReports);
      setKpis(mockKPIs);

    } finally {
      setLoading(false);
    }
  }, [filters, user?.id, user?.roles]);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData = await medicalReportsService.getMedicalReportAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      // Set mock analytics data
      setAnalytics({
        centerId: 'CENTER001',
        period: 'monthly',
        metrics: {
          totalReports: 1247,
          reportsByType: {
            general: 456,
            lab: 298,
            radiology: 187,
            surgical: 156,
            consultation: 98,
            specialist: 52
          },
          reportsByStatus: {
            active: 1098,
            archived: 123,
            pending: 21,
            draft: 5
          },
          reportsByPriority: {
            normal: 850,
            high: 200,
            urgent: 100,
            low: 50
          },
          averageProcessingTime: 2.5,
          referralRate: 18.8
        },
        byDoctor: [
          { doctorId: 'DOC001', doctorName: 'Dr. Alice Johnson', totalReports: 456, averageProcessingTime: 2.1 },
          { doctorId: 'DOC002', doctorName: 'Dr. Bob Wilson', totalReports: 298, averageProcessingTime: 2.8 },
          { doctorId: 'DOC003', doctorName: 'Dr. Sarah Davis', totalReports: 187, averageProcessingTime: 2.3 }
        ],
        byDate: [
          { date: '2024-01-01', totalReports: 45, completedReports: 42 },
          { date: '2024-01-02', totalReports: 52, completedReports: 48 },
          { date: '2024-01-03', totalReports: 38, completedReports: 35 }
        ],
        trends: [
          { period: 'Jan 2024', medicalRecords: 200, referrals: 25, appointments: 75 },
          { period: 'Feb 2024', medicalRecords: 250, referrals: 30, appointments: 85 },
          { period: 'Mar 2024', medicalRecords: 300, referrals: 35, appointments: 95 },
          { period: 'Apr 2024', medicalRecords: 280, referrals: 28, appointments: 90 },
          { period: 'May 2024', medicalRecords: 320, referrals: 40, appointments: 100 },
          { period: 'Jun 2024', medicalRecords: 350, referrals: 45, appointments: 110 }
        ],
        categories: [
          { category: 'Diagnostic', count: 456, percentage: 36.6, color: '#14b8a6' },
          { category: 'Radiology', count: 298, percentage: 23.9, color: '#8b5cf6' },
          { category: 'Cardiology', count: 187, percentage: 15.0, color: '#10b981' },
          { category: 'General Medicine', count: 156, percentage: 12.5, color: '#ef4444' },
          { category: 'Emergency', count: 98, percentage: 7.9, color: '#f97316' },
          { category: 'Other', count: 52, percentage: 4.1, color: '#6b7280' }
        ],
        recordTypes: [
          { category: 'Lab Results', count: 456, percentage: 36.6, color: '#14b8a6' },
          { category: 'Imaging', count: 298, percentage: 23.9, color: '#8b5cf6' },
          { category: 'Consultation', count: 234, percentage: 18.8, color: '#10b981' },
          { category: 'Prescription', count: 156, percentage: 12.5, color: '#ef4444' },
          { category: 'Procedure', count: 103, percentage: 8.2, color: '#f97316' }
        ],
        priorityDistribution: [
          { priority: 'NORMAL', count: 850, color: '#6b7280' },
          { priority: 'HIGH', count: 200, color: '#3b82f6' },
          { priority: 'URGENT', count: 100, color: '#f97316' },
          { priority: 'LOW', count: 50, color: '#ef4444' }
        ],
        statusDistribution: [
          { status: 'ACTIVE', count: 1098, percentage: 88.1, color: '#10b981' },
          { status: 'ARCHIVED', count: 123, percentage: 9.9, color: '#6b7280' },
          { status: 'PENDING', count: 21, percentage: 1.7, color: '#f97316' },
          { status: 'DRAFT', count: 5, percentage: 0.4, color: '#3b82f6' }
        ]
      });
    }
  }, []);

  // Load quick stats
  const loadQuickStats = useCallback(async () => {
    try {
      const stats = await medicalReportsService.getQuickStats();
      setQuickStats(stats);
    } catch (err) {
      console.error('Failed to load quick stats:', err);
      setQuickStats({
        pendingReferrals: 45,
        scheduledAppointments: 123,
        urgentRecords: 89
      });
    }
  }, []);

  // Load data on component mount and when filters change
  useEffect(() => {
    loadMedicalReports();
  }, [loadMedicalReports]);

  useEffect(() => {
    loadAnalytics();
    loadQuickStats();
  }, [loadAnalytics, loadQuickStats]);

  // Handle search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      search: query || undefined,
      page: 1
    }));
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: MedicalReportFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'generatedDate',
      sortOrder: 'desc'
    });
    setSearchQuery('');
  }, []);

  // Handle report actions
  const handleViewReport = useCallback((report: MedicalReport) => {
    console.log('View report:', report);
    toast.info(`Viewing report: ${report.title}`);
  }, []);

  const handleEditReport = useCallback((report: MedicalReport) => {
    console.log('Edit report:', report);
    toast.info(`Editing report: ${report.title}`);
  }, []);

  const handleDeleteReport = useCallback((report: MedicalReport) => {
    console.log('Delete report:', report);
    toast.success(`Deleted report: ${report.title}`);
    // In a real app, you would call the delete API here
  }, []);

  const handleShareReport = useCallback((report: MedicalReport) => {
    console.log('Share report:', report);
    toast.success(`Shared report: ${report.title}`);
  }, []);

  const handleExportReport = useCallback((report: MedicalReport) => {
    console.log('Export report:', report);
    toast.success(`Exported report: ${report.title}`);
  }, []);

  const handleGenerateReport = useCallback(() => {
    setShowGenerateModal(true);
  }, []);

  const handleExportAnalytics = useCallback(() => {
    console.log('Export analytics');
    toast.success('Analytics exported successfully');
  }, []);

  const isFiltered = Object.values(filters).some(value =>
    value !== undefined && value !== null && value !== '' &&
    !(Array.isArray(value) && value.length === 0)
  ) && !(filters.search === searchQuery && filters.page === 1 && filters.limit === 10);

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6 pb-28 md:pb-0">
        {/* Page Header */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-premium">Clinical Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Generate, view, and analyze medical reports
          </p>
        </div>

        {/* Header with Search and Actions */}
        <MedicalReportsHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onGenerateReport={handleGenerateReport}
          onExportAnalytics={handleExportAnalytics}
          onFilterToggle={() => setShowFilters(!showFilters)}
          totalReports={pagination.total}
          isFiltered={isFiltered}
        />

        {/* KPIs */}
        {kpis && <MedicalReportsKPIs kpis={kpis} loading={loading} />}

        {/* Quick Stats */}
        {quickStats && <MedicalReportsQuickStats quickStats={quickStats} loading={loading} />}

        {/* Filters */}
        <MedicalReportsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isVisible={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
        />

        {/* Analytics Charts */}
        {analytics && <MedicalReportsAnalytics analytics={analytics} loading={loading} />}

        {/* Reports List */}
        <MedicalReportsList
          reports={reports}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onViewReport={handleViewReport}
          onEditReport={handleEditReport}
          onDeleteReport={handleDeleteReport}
          onShareReport={handleShareReport}
          onExportReport={handleExportReport}
          onGenerateReport={handleGenerateReport}
          loading={loading}
          error={error}
        />
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-background rounded-lg w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 border-b sticky top-0 bg-background z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">Generate Medical Report</h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <EnhancedMedicalReportGenerator />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default MedicalReportsPage;
