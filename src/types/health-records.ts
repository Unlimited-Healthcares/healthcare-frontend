// Health Records Types based on API Guide
// Base URL: https://api.unlimtedhealth.com/api

export interface MedicalRecord {
  id: string;
  patientId: string;
  centerId?: string;
  createdBy?: string;
  recordType: 'diagnosis' | 'prescription' | 'diagnostic_result' | 'imaging' | 'consultation' | 'procedure' | 'vaccination' | 'allergy' | 'vital_signs' | 'discharge_summary' | 'referral';
  title: string;
  description?: string;
  recordData?: Record<string, unknown>;
  tags?: string[];
  category?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  followUp?: string;
  medications?: Record<string, unknown> | unknown[];
  status: 'active' | 'draft' | 'archived' | 'deleted';
  version: number;
  parentRecordId?: string;
  isSensitive: boolean;
  isShareable: boolean;
  isLatestVersion: boolean;
  sharingRestrictions?: Record<string, unknown>;
  fileAttachments?: string[];
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  patientName?: string;
  providerId?: string;
  providerName?: string;
  categoryId?: string;
  categoryDetails?: MedicalRecordCategory;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  confidentialityLevel?: 'public' | 'restricted' | 'confidential' | 'secret';
  recordDate?: string;
  files?: MedicalRecordFile[];
  sharedWith?: string[];
  accessLog?: AccessLogEntry[];
}

export interface MedicalRecordFile {
  id: string;
  recordId: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  mimeType?: string;
  isEncrypted: boolean;
  encryptionKeyId?: string;
  thumbnailPath?: string;
  metadata?: Record<string, unknown>;
  uploadStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  url?: string;
  thumbnailUrl?: string;
  isDicom?: boolean;
  dicomMetadata?: Record<string, unknown>;
  uploadedBy?: string;
  uploadedAt?: string;
  tags?: string[];
  description?: string;
}

export interface MedicalRecordCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
  parent?: MedicalRecordCategory;
  children?: MedicalRecordCategory[];
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  color?: string;
  icon?: string;
  recordCount?: number;
}

export interface MedicalRecordVersion {
  id: string;
  recordId: string;
  version: number;
  title: string;
  description?: string;
  changes: string[];
  createdAt: string;
  createdBy: string;
  createdByName: string;
  metadata: Record<string, unknown>;
}

export interface ShareRequest {
  id: string;
  recordId: string;
  recordTitle: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  ownerId: string;
  ownerName: string;
  message?: string;
  permissions: SharePermission[];
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'cancelled';
  expiresAt?: string;
  requestedAt: string;
}

export interface ActiveShare {
  id: string;
  recordId: string;
  recordTitle: string;
  sharedWithId: string;
  sharedWithName: string;
  sharedWithEmail: string;
  permissions: SharePermission[];
  sharedAt: string;
  expiresAt?: string;
  accessCount: number;
  lastAccessedAt?: string;
}

export interface SharePermission {
  type: 'view' | 'download' | 'edit' | 'share' | 'delete';
  granted: boolean;
}

export interface AccessLogEntry {
  id: string;
  recordId: string;
  userId: string;
  userName: string;
  action: 'view' | 'download' | 'edit' | 'share' | 'delete';
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  categoryIds?: string[];
  tags?: string[];
  recordTypes?: string[];
  status?: string[];
  priority?: string[];
  patientId?: string;
  providerId?: string;
  dateFrom?: string;
  dateTo?: string;
  confidentialityLevel?: string[];
  hasFiles?: boolean;
  isShared?: boolean;
  page?: number;
  limit?: number;
}

export interface RecordFilters {
  search?: string;
  category?: string;
  tags?: string[];
  recordType?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  status?: string;
  isSensitive?: boolean;
  isShareable?: boolean;
  priority?: string;
  confidentialityLevel?: string;
}

// API Request/Response Types
export interface CreateRecordRequest {
  patientId: string;
  centerId?: string;
  createdBy?: string;
  recordType: string;
  title: string;
  description?: string;
  recordData?: Record<string, unknown>;
  tags?: string[];
  category?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  followUp?: string;
  medications?: Record<string, unknown> | unknown[];
  isSensitive?: boolean;
  isShareable?: boolean;
  sharingRestrictions?: Record<string, unknown>;
  fileAttachments?: string[];
}

export interface UpdateRecordRequest extends Partial<CreateRecordRequest> {
  id: string;
}

export interface UploadFileRequest {
  recordId: string;
  file: File;
  description?: string;
  tags: string[];
}

export interface CreateShareRequest {
  recordId: string;
  requesterEmail: string;
  message?: string;
  permissions: SharePermission[];
  expiresAt?: string;
}

export interface RespondToShareRequest {
  requestId: string;
  approved: boolean;
  permissions?: SharePermission[];
  expiresAt?: string;
  message?: string;
}

// API Response Types
export interface MedicalRecordsResponse {
  data: MedicalRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchResponse {
  data: MedicalRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Stats and Dashboard Types
export interface HealthRecordStats {
  totalRecords: number;
  sharedRecords: number;
  pendingRequests: number;
  recentActivity: number;
}

export interface DashboardStats {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Component Props Types
export interface RecordCardProps {
  record: MedicalRecord;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
  onDownload: (id: string) => void;
}

export interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: (query: string) => void;
}

export interface CategoryTreeProps {
  categories: MedicalRecordCategory[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string) => void;
}

export interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

// Hook Types
export interface UseHealthRecordsParams {
  page?: number;
  limit?: number;
  filters?: SearchFilters;
}

export interface UseHealthRecordParams {
  id: string;
}

export interface UseSearchRecordsParams {
  query: string;
  filters?: SearchFilters;
}

// Error Types
export interface HealthRecordsError {
  statusCode: number;
  message: string;
  error: string;
}

// Demo Data Types (for development)
export interface DemoData {
  categories: MedicalRecordCategory[];
  files: MedicalRecordFile[];
  records: MedicalRecord[];
  versions: MedicalRecordVersion[];
  shareRequests: ShareRequest[];
  activeShares: ActiveShare[];
}
