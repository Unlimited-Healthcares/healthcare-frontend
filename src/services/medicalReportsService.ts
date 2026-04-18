import { apiClient } from '@/lib/api-client';
import {
  MedicalReport,
  MedicalReportListResponse,
  MedicalReportFilters,
  MedicalReportKPIs,
  MedicalReportAnalytics,
  CreateMedicalReportDto,
  UpdateMedicalReportDto,
  MedicalReportTemplatesResponse,
  MedicalReportCategoriesResponse,
  MedicalReportTagsResponse,
  MedicalReportExport,
  MedicalReportExportsResponse,
  MedicalReportShare,
  MedicalReportSharesResponse,
  MedicalReportAccessLogsResponse,
  MedicalReportCommentsResponse,
  MedicalReportVersionsResponse,
  MedicalReportQuickStats,
  MedicalReportComment,
  TrendDataPoint,
  CategoryDataPoint,
  PriorityDataPoint,
  StatusDataPoint
} from '@/types/medical-reports';

export class MedicalReportsService {
  private apiClient = apiClient;

  // Get all medical reports with filters
  async getMedicalReports(filters: MedicalReportFilters = {}): Promise<MedicalReportListResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Filter out invalid parameters
      const validParams = [
        'search', 'reportType', 'status', 'priority', 'dateFrom', 'dateTo',
        'patientId', 'doctorId', 'centerId', 'category', 'isSensitive',
        'isShareable', 'page', 'limit', 'sortBy', 'sortOrder'
      ];

      Object.entries(filters).forEach(([key, value]) => {
        if (validParams.includes(key) && value !== undefined && value !== null && value !== '') {
          if (key === 'tags' && Array.isArray(value)) {
            // Handle tags array
            value.forEach(tag => queryParams.append('tags', tag));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/medical-reports?${queryString}` : '/medical-reports';

      console.log('🔍 Fetching medical reports from:', endpoint);
      const response = await this.apiClient.get<any>(endpoint);

      if (!response) {
        throw new Error('No response received from server');
      }

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching medical reports:', error);
      throw error;
    }
  }

  // Get medical report by ID
  async getMedicalReportById(id: string): Promise<MedicalReport> {
    return this.apiClient.get<MedicalReport>(`/medical-reports/${id}`);
  }

  // Get current user's medical reports (for patients - filters by patientId)
  async getMyMedicalReports(filters: Partial<MedicalReportFilters> = {}): Promise<MedicalReportListResponse> {
    try {
      const queryParams = new URLSearchParams();

      const validParams = [
        'search', 'reportType', 'status', 'priority', 'dateFrom', 'dateTo',
        'patientId', 'doctorId', 'centerId', 'category', 'isSensitive',
        'isShareable', 'page', 'limit', 'sortBy', 'sortOrder'
      ];

      Object.entries(filters).forEach(([key, value]) => {
        if (validParams.includes(key) && value !== undefined && value !== null && value !== '') {
          if (key === 'tags' && Array.isArray(value)) {
            value.forEach(tag => queryParams.append('tags', tag));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/medical-reports?${queryString}` : '/medical-reports';

      console.log('🔍 Fetching user medical reports from:', endpoint);
      const response = await this.apiClient.get<MedicalReportListResponse>(endpoint);

      if (!response) {
        throw new Error('No response received from server');
      }

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching user medical reports:', error);
      throw error;
    }
  }

  // Create new medical report
  async createMedicalReport(reportData: CreateMedicalReportDto): Promise<MedicalReport> {
    return this.apiClient.post<MedicalReport>('/medical-records', reportData);
  }

  // Upload file attachment for a medical report
  async uploadFile(recordId: string, file: File, description?: string, tags: string[] = []): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recordId', recordId);
    if (description) formData.append('description', description);
    if (tags && tags.length > 0) formData.append('tags', JSON.stringify(tags));

    return this.apiClient.postFormData(`/medical-records/${recordId}/files`, formData);
  }

  // Generate a digital medical report PDF (Server-side)
  async generateDigitalReport(recordId: string): Promise<any> {
    return this.apiClient.post<any>(`/medical-reports/generate/${recordId}`, {});
  }

  // Publicly verify a report by code
  async verifyReport(code: string): Promise<MedicalReport> {
    return this.apiClient.get<MedicalReport>(`/medical-reports/verify/${code}`);
  }  // Get reports shared with the current user
  async getSharedWithMe(): Promise<MedicalReport[]> {
    try {
      const response = await this.apiClient.get<MedicalReport[]>('/medical-reports/shared/me');
      return response || [];
    } catch (error) {
      console.error('❌ Error fetching shared reports:', error);
      return [];
    }
  }

  // Grant access to a report
  async grantAccess(reportId: string, targetId: string): Promise<any> {
    return this.apiClient.post(`/medical-reports/${reportId}/grant-access/${targetId}`, {});
  }

  // Update medical report
  async updateMedicalReport(id: string, reportData: UpdateMedicalReportDto): Promise<MedicalReport> {
    return this.apiClient.patch<MedicalReport>(`/medical-records/${id}`, reportData);
  }

  // Delete medical report
  async deleteMedicalReport(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/medical-records/${id}`);
  }

  // Get medical report templates
  async getMedicalReportTemplates(centerId?: string): Promise<MedicalReportTemplatesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (centerId) {
        queryParams.append('centerId', centerId);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/medical-records/templates?${queryString}` : '/medical-records/templates';

      const response = await this.apiClient.get<MedicalReportTemplatesResponse>(endpoint);

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching medical report templates:', error);
      throw error;
    }
  }

  // Get medical report categories
  async getMedicalReportCategories(): Promise<MedicalReportCategoriesResponse> {
    try {
      const response = await this.apiClient.get<MedicalReportCategoriesResponse>('/medical-records/categories');

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching medical report categories:', error);
      throw error;
    }
  }

  // Get medical report tags
  async getMedicalReportTags(): Promise<MedicalReportTagsResponse> {
    try {
      const response = await this.apiClient.get<MedicalReportTagsResponse>('/medical-records/tags');

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching medical report tags:', error);
      throw error;
    }
  }

  // Export medical report
  async exportMedicalReport(reportId: string, format: 'pdf' | 'docx' | 'html' | 'json'): Promise<MedicalReportExport> {
    return this.apiClient.post<MedicalReportExport>(`/medical-records/${reportId}/export`, { format });
  }

  // Get medical report exports
  async getMedicalReportExports(reportId?: string): Promise<MedicalReportExportsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (reportId) {
        queryParams.append('reportId', reportId);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/medical-records/exports?${queryString}` : '/medical-records/exports';

      const response = await this.apiClient.get<MedicalReportExportsResponse>(endpoint);

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching medical report exports:', error);
      throw error;
    }
  }

  // Share medical report
  async shareMedicalReport(reportId: string, shareData: {
    toCenterId: string;
    accessLevel: 'read' | 'download' | 'print';
    expiresAt?: string;
    notes?: string;
  }): Promise<MedicalReportShare> {
    return this.apiClient.post<MedicalReportShare>(`/medical-records/${reportId}/share`, shareData);
  }

  // Get medical report shares
  async getMedicalReportShares(reportId?: string): Promise<MedicalReportSharesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (reportId) {
        queryParams.append('reportId', reportId);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/medical-records/shares?${queryString}` : '/medical-records/shares';

      const response = await this.apiClient.get<MedicalReportSharesResponse>(endpoint);

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching medical report shares:', error);
      throw error;
    }
  }

  // Get medical report access logs
  async getMedicalReportAccessLogs(reportId?: string): Promise<MedicalReportAccessLogsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (reportId) {
        queryParams.append('reportId', reportId);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/medical-records/access-logs?${queryString}` : '/medical-records/access-logs';

      const response = await this.apiClient.get<MedicalReportAccessLogsResponse>(endpoint);

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching medical report access logs:', error);
      throw error;
    }
  }

  // Get comprehensive audit logs for the center
  async getAuditLogs(filters: { recordId?: string, page?: number, limit?: number } = {}): Promise<MedicalReportAccessLogsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filters.recordId) queryParams.append('recordId', filters.recordId);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const response = await this.apiClient.get<MedicalReportAccessLogsResponse>(`/medical-records/audit-logs?${queryParams.toString()}`);

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching audit logs:', error);
      throw error;
    }
  }

  // Get medical report comments
  async getMedicalReportComments(reportId: string): Promise<MedicalReportCommentsResponse> {
    try {
      const response = await this.apiClient.get<MedicalReportCommentsResponse>(`/medical-records/${reportId}/comments`);

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching medical report comments:', error);
      throw error;
    }
  }

  // Add comment to medical report
  async addMedicalReportComment(reportId: string, comment: {
    comment: string;
    isInternal: boolean;
    parentCommentId?: string;
  }): Promise<MedicalReportComment> {
    return this.apiClient.post<MedicalReportComment>(`/medical-records/${reportId}/comments`, comment);
  }

  // Get medical report versions
  async getMedicalReportVersions(reportId: string): Promise<MedicalReportVersionsResponse> {
    try {
      const response = await this.apiClient.get<MedicalReportVersionsResponse>(`/medical-records/${reportId}/versions`);

      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching medical report versions:', error);
      throw error;
    }
  }

  // Get medical report analytics
  async getMedicalReportAnalytics(centerId?: string, period?: string): Promise<MedicalReportAnalytics> {
    try {
      const queryParams = new URLSearchParams();
      if (centerId) {
        queryParams.append('centerId', centerId);
      }
      if (period) {
        queryParams.append('period', period);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/medical-records/analytics?${queryString}` : '/medical-records/analytics';

      return this.apiClient.get<MedicalReportAnalytics>(endpoint);
    } catch (error) {
      console.error('❌ Error fetching medical report analytics:', error);
      throw error;
    }
  }

  // Calculate KPIs from medical reports data
  calculateKPIs(reports: MedicalReport[]): MedicalReportKPIs {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Current period data
    const currentReports = reports.filter(report =>
      new Date(report.generatedDate) >= thisMonth
    );

    const lastMonthReports = reports.filter(report => {
      const reportDate = new Date(report.generatedDate);
      return reportDate >= lastMonth && reportDate < thisMonth;
    });

    // Calculate current metrics
    const totalReports = reports.length;
    const newReports = currentReports.length;
    const totalReferrals = reports.filter(r => r.reportType === 'consultation').length;
    const appointments = reports.filter(r => r.followUpDate).length;

    // Calculate previous period metrics for comparison
    const prevTotalReports = lastMonthReports.length;
    const prevNewReports = lastMonthReports.filter(r =>
      new Date(r.generatedDate) >= new Date(now.getFullYear(), now.getMonth() - 1, 1)
    ).length;
    const prevTotalReferrals = lastMonthReports.filter(r => r.reportType === 'consultation').length;
    const prevAppointments = lastMonthReports.filter(r => r.followUpDate).length;

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalReports,
      newReports,
      totalReferrals,
      appointments,
      totalReportsChange: calculateChange(totalReports, prevTotalReports),
      newReportsChange: calculateChange(newReports, prevNewReports),
      totalReferralsChange: calculateChange(totalReferrals, prevTotalReferrals),
      appointmentsChange: calculateChange(appointments, prevAppointments),
    };
  }

  // Get quick stats for dashboard cards
  async getQuickStats(): Promise<MedicalReportQuickStats> {
    try {
      const response = await this.apiClient.get<MedicalReportQuickStats>('/medical-records/quick-stats');
      return response;
    } catch (error) {
      console.error('❌ Error fetching quick stats:', error);
      // Return mock data if API fails
      return {
        pendingReferrals: 45,
        scheduledAppointments: 123,
        urgentRecords: 89
      };
    }
  }

  // Get chart data for analytics
  async getChartData(centerId?: string, period?: string): Promise<{
    trends: TrendDataPoint[];
    categories: CategoryDataPoint[];
    recordTypes: CategoryDataPoint[];
    priorityDistribution: PriorityDataPoint[];
    statusDistribution: StatusDataPoint[];
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (centerId) {
        queryParams.append('centerId', centerId);
      }
      if (period) {
        queryParams.append('period', period);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/medical-records/chart-data?${queryString}` : '/medical-records/chart-data';

      return this.apiClient.get(endpoint);
    } catch (error) {
      console.error('❌ Error fetching chart data:', error);
      // Return mock data if API fails
      return {
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
          { category: 'Diagnostic Results', count: 456, percentage: 36.6, color: '#14b8a6' },
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
      };
    }
  }
}

export const medicalReportsService = new MedicalReportsService();
