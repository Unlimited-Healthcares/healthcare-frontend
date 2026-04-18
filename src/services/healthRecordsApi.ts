import {
  MedicalRecord,
  MedicalRecordFile,
  MedicalRecordCategory,
  MedicalRecordVersion,
  ShareRequest,
  ActiveShare,
  SearchFilters,
  CreateRecordRequest,
  UpdateRecordRequest,
  UploadFileRequest,
  CreateShareRequest,
  RespondToShareRequest,
  MedicalRecordsResponse,
  SearchResponse,
  HealthRecordStats
} from '@/types/health-records';
import { apiClient } from '@/lib/api-client';

// Map frontend filters to backend-supported query params

const mapFiltersToBackend = (filters?: SearchFilters): Record<string, unknown> => {
  if (!filters) return {};
  const mapped: Record<string, unknown> = {};

  if (filters.query) mapped.q = filters.query;
  if (filters.categoryIds && filters.categoryIds.length > 0) mapped.category = filters.categoryIds;
  if (filters.tags && filters.tags.length > 0) mapped.tags = filters.tags;
  if (filters.recordTypes && filters.recordTypes.length > 0) mapped.recordType = filters.recordTypes;
  if (filters.dateFrom) mapped.dateFrom = filters.dateFrom;
  if (filters.dateTo) mapped.dateTo = filters.dateTo;
  if (filters.patientId) mapped.patientId = filters.patientId;
  if (typeof filters.page === 'number') mapped.page = filters.page;
  if (typeof filters.limit === 'number') mapped.limit = filters.limit;

  return mapped;
};

// Normalize list/search responses into a consistent shape
const normalizeListResponse = (
  payload: any,
  page?: number,
  limit?: number
): MedicalRecordsResponse => {
  if (Array.isArray(payload)) {
    const size = payload.length;
    return {
      data: payload,
      pagination: {
        page: page || 1,
        limit: typeof limit === 'number' ? limit : size,
        total: size,
        totalPages: 1
      }
    };
  }

  if (payload && Array.isArray(payload.data)) {
    // Already in expected shape
    return payload as MedicalRecordsResponse;
  }

  if (payload && Array.isArray(payload.results)) {
    const total = typeof payload.total === 'number' ? payload.total : payload.results.length;
    const l = typeof limit === 'number' ? limit : payload.results.length;
    const p = typeof page === 'number' ? page : 1;
    return {
      data: payload.results,
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: l > 0 ? Math.max(1, Math.ceil(total / l)) : 1
      }
    } as MedicalRecordsResponse;
  }

  return {
    data: [],
    pagination: {
      page: page || 1,
      limit: typeof limit === 'number' ? limit : 0,
      total: 0,
      totalPages: 0
    }
  } as MedicalRecordsResponse;
};

export const healthRecordsApi = {
  // Medical Records Management
  async getMedicalRecords(params?: {
    page?: number;
    limit?: number;
    filters?: SearchFilters;
  }): Promise<MedicalRecordsResponse> {
    const page = params?.page;
    const limit = params?.limit;
    const mappedFilters = mapFiltersToBackend(params?.filters);

    const hasSearchSignals = ['q', 'category', 'tags', 'recordType', 'dateFrom', 'dateTo'].some(
      (k) => k in mappedFilters
    );

    const queryObject: Record<string, unknown> = {
      ...(typeof page === 'number' ? { page } : {}),
      ...(typeof limit === 'number' ? { limit } : {}),
      ...mappedFilters
    };

    const basePath = hasSearchSignals ? '/medical-records/search' : '/medical-records';
    const response = await apiClient.get<any>(basePath, { params: queryObject });
    return normalizeListResponse(response, page, limit);
  },

  async getMedicalRecordById(id: string): Promise<MedicalRecord> {
    return apiClient.get<MedicalRecord>(`/medical-records/${id}`);
  },

  async createMedicalRecord(data: CreateRecordRequest): Promise<MedicalRecord> {
    return apiClient.post<MedicalRecord>(`/medical-records`, data);
  },

  async updateMedicalRecord(data: UpdateRecordRequest): Promise<MedicalRecord> {
    return apiClient.patch<MedicalRecord>(`/medical-records/${data.id}`, data);
  },

  async deleteMedicalRecord(id: string): Promise<void> {
    await apiClient.delete(`/medical-records/${id}`);
  },

  // Search Records
  async searchRecords(query: string, filters?: SearchFilters): Promise<SearchResponse> {
    const mappedFilters = mapFiltersToBackend(filters);
    const response = await apiClient.get<any>(`/medical-records/search`, {
      params: { q: query, ...mappedFilters }
    });
    return normalizeListResponse(response) as SearchResponse;
  },

  // File Management
  async uploadFile(data: UploadFileRequest): Promise<MedicalRecordFile> {
    const formData = new FormData();

    formData.append('file', data.file);
    formData.append('recordId', data.recordId);
    if (data.description) formData.append('description', data.description);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));

    return apiClient.post<MedicalRecordFile>(
      `/medical-records/${data.recordId}/files`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  async getRecordFiles(recordId: string): Promise<MedicalRecordFile[]> {
    return apiClient.get<MedicalRecordFile[]>(`/medical-records/${recordId}/files`);
  },

  async getFileUrl(fileId: string): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`/medical-records/files/${fileId}/url`);
  },

  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(`/medical-records/files/${fileId}`);
  },

  async convertDicomToJpeg(recordId: string, fileId: string): Promise<{ success: boolean; jpegUrl?: string }> {
    return apiClient.post<{ success: boolean; jpegUrl?: string }>(
      `/medical-records/${recordId}/files/${fileId}/convert-dicom`,
      null
    );
  },

  // Categories and Tags
  async getCategories(): Promise<MedicalRecordCategory[]> {
    return apiClient.get<MedicalRecordCategory[]>(`/medical-records/categories`);
  },

  async getCategoryHierarchy(): Promise<MedicalRecordCategory[]> {
    return apiClient.get<MedicalRecordCategory[]>(`/medical-records/categories/hierarchy`);
  },

  async getTags(): Promise<string[]> {
    return apiClient.get<string[]>(`/medical-records/tags`);
  },

  // Version Management
  async getRecordVersions(recordId: string): Promise<MedicalRecordVersion[]> {
    return apiClient.get<MedicalRecordVersion[]>(`/medical-records/${recordId}/versions`);
  },

  async getVersionById(versionId: string): Promise<MedicalRecordVersion> {
    return apiClient.get<MedicalRecordVersion>(`/medical-records/versions/${versionId}`);
  },

  async revertToVersion(recordId: string, versionNumber: number): Promise<MedicalRecord> {
    return apiClient.post<MedicalRecord>(`/medical-records/${recordId}/revert/${versionNumber}`, null);
  },

  async compareVersions(versionId1: string, versionId2: string): Promise<{
    differences: Record<string, { old: unknown; new: unknown }>;
  }> {
    return apiClient.get<{ differences: Record<string, { old: unknown; new: unknown }> }>(
      `/medical-records/versions/${versionId1}/compare/${versionId2}`
    );
  },

  // Record Sharing
  async createShareRequest(data: CreateShareRequest): Promise<ShareRequest> {
    return apiClient.post<ShareRequest>(`/medical-records/sharing/requests`, data);
  },

  async getShareRequests(centerId?: string): Promise<ShareRequest[]> {
    const url = centerId
      ? `/medical-records/sharing/requests/center/${centerId}`
      : `/medical-records/sharing/requests`;
    return apiClient.get<ShareRequest[]>(url);
  },

  async respondToShareRequest(data: RespondToShareRequest): Promise<ShareRequest> {
    return apiClient.patch<ShareRequest>(
      `/medical-records/sharing/requests/${data.requestId}/respond`,
      data
    );
  },

  async getActiveShares(recordId?: string): Promise<ActiveShare[]> {
    const url = recordId
      ? `/medical-records/sharing/record/${recordId}/shares`
      : `/medical-records/sharing/shares`;
    return apiClient.get<ActiveShare[]>(url);
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<HealthRecordStats> {
    return apiClient.get<HealthRecordStats>(`/medical-records/dashboard/stats`);
  }
};

export default healthRecordsApi;
