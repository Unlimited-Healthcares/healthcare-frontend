// Medical Reports Types
export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  reportType: 'general' | 'lab' | 'radiology' | 'surgical' | 'consultation' | 'specialist' | 'emergency' | 'psychiatric';
  title: string;
  diagnosis: string;
  treatment?: string;
  prescription?: string;
  recommendations?: string;
  notes?: string;
  followUpDate?: string;
  bloodType?: string;
  allergies?: string;
  doctorId: string;
  doctorName: string;
  centerId: string;
  centerName: string;
  centerType: string;
  centerAddress: string;
  centerContact?: string;
  centerEmail?: string;
  generatedDate: string;
  updatedAt: string;
  status: 'draft' | 'pending' | 'active' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isSensitive: boolean;
  isShareable: boolean;
  patientConsent: boolean;
  pdfUrl?: string;
  verificationCode?: string;
  fileAttachments?: string[];
  tags?: string[];
  category?: string;
  version: number;
  previousVersionId?: string;
  metadata?: Record<string, unknown>;
}

export interface MedicalReportFilters {
  search?: string;
  reportType?: string;
  status?: 'draft' | 'pending' | 'active' | 'archived';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  dateFrom?: string;
  dateTo?: string;
  patientId?: string;
  doctorId?: string;
  centerId?: string;
  category?: string;
  tags?: string[];
  isSensitive?: boolean;
  isShareable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'generatedDate' | 'updatedAt' | 'priority' | 'patientName' | 'reportType' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface MedicalReportKPIs {
  totalReports: number;
  newReports: number;
  totalReferrals: number;
  appointments: number;
  // Percentage changes vs last period
  totalReportsChange: number;
  newReportsChange: number;
  totalReferralsChange: number;
  appointmentsChange: number;
}

export interface MedicalReportAnalytics {
  centerId: string;
  period: string;
  metrics: {
    totalReports: number;
    reportsByType: Record<string, number>;
    reportsByStatus: Record<string, number>;
    reportsByPriority: Record<string, number>;
    averageProcessingTime: number;
    referralRate: number;
  };
  byDoctor: Array<{
    doctorId: string;
    doctorName: string;
    totalReports: number;
    averageProcessingTime: number;
  }>;
  byDate: Array<{
    date: string;
    totalReports: number;
    completedReports: number;
  }>;
  trends: Array<{
    period: string;
    medicalRecords: number;
    referrals: number;
    appointments: number;
  }>;
  categories: Array<{
    category: string;
    count: number;
    percentage: number;
    color?: string;
  }>;
  recordTypes: Array<{
    category: string;
    count: number;
    percentage: number;
    color?: string;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    color?: string;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
    color?: string;
  }>;
}

export interface CreateMedicalReportDto {
  patientId: string;
  reportType?: string;
  recordType?: string;
  title: string;
  diagnosis: string;
  treatment?: string;
  prescription?: string;
  recommendations?: string;
  notes?: string;
  followUpDate?: string;
  bloodType?: string;
  allergies?: string;
  medications?: string;
  followUp?: string;
  centerId: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  isSensitive?: boolean;
  isShareable?: boolean;
  patientConsent?: boolean;
  tags?: string[];
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMedicalReportDto {
  title?: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  recommendations?: string;
  notes?: string;
  followUpDate?: string;
  bloodType?: string;
  allergies?: string;
  status?: 'draft' | 'pending' | 'active' | 'archived';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  isSensitive?: boolean;
  isShareable?: boolean;
  tags?: string[];
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface MedicalReportTemplate {
  id: string;
  name: string;
  reportType: string;
  centerType: string;
  content: {
    diagnosis?: string;
    treatment?: string;
    recommendations?: string;
    notes?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalReportExport {
  id: string;
  reportId: string;
  format: 'pdf' | 'docx' | 'html' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  createdAt: string;
  requestedBy: string;
}

export interface MedicalReportShare {
  id: string;
  reportId: string;
  patientId: string;
  fromCenterId: string;
  toCenterId: string;
  sharedBy: string;
  sharedAt: string;
  expiresAt?: string;
  accessLevel: 'read' | 'download' | 'print';
  status: 'active' | 'expired' | 'revoked';
  notes?: string;
}

export interface MedicalReportAccessLog {
  id: string;
  reportId: string;
  accessedBy: string;
  accessType: 'view' | 'download' | 'print' | 'share';
  accessedAt: string;
  ipAddress?: string;
  userAgent?: string;
  centerId: string;
  notes?: string;
}

export interface MedicalReportComment {
  id: string;
  reportId: string;
  comment: string;
  commentedBy: string;
  commentedByName: string;
  commentedAt: string;
  isInternal: boolean;
  parentCommentId?: string;
  replies?: MedicalReportComment[];
}

export interface MedicalReportVersion {
  id: string;
  reportId: string;
  version: number;
  changes: string;
  changedBy: string;
  changedAt: string;
  data: Partial<MedicalReport>;
}

export interface MedicalReportCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalReportTag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationMeta;
}

export interface MedicalReportListResponse {
  data: MedicalReport[];
  pagination: PaginationMeta;
}

export interface MedicalReportTemplatesResponse {
  data: MedicalReportTemplate[];
  pagination: PaginationMeta;
}

export interface MedicalReportCategoriesResponse {
  data: MedicalReportCategory[];
  pagination: PaginationMeta;
}

export interface MedicalReportTagsResponse {
  data: MedicalReportTag[];
  pagination: PaginationMeta;
}

export interface MedicalReportExportsResponse {
  data: MedicalReportExport[];
  pagination: PaginationMeta;
}

export interface MedicalReportSharesResponse {
  data: MedicalReportShare[];
  pagination: PaginationMeta;
}

export interface MedicalReportAccessLogsResponse {
  data: MedicalReportAccessLog[];
  pagination: PaginationMeta;
}

export interface MedicalReportCommentsResponse {
  data: MedicalReportComment[];
  pagination: PaginationMeta;
}

export interface MedicalReportVersionsResponse {
  data: MedicalReportVersion[];
  pagination: PaginationMeta;
}

// Quick stats for dashboard cards
export interface MedicalReportQuickStats {
  pendingReferrals: number;
  scheduledAppointments: number;
  urgentRecords: number;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TrendDataPoint {
  period: string;
  medicalRecords: number;
  referrals: number;
  appointments: number;
}

export interface CategoryDataPoint {
  category: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface PriorityDataPoint {
  priority: string;
  count: number;
  color?: string;
}

export interface StatusDataPoint {
  status: string;
  count: number;
  percentage: number;
  color?: string;
}
