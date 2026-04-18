import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthRecordsApi } from '@/services/healthRecordsApi';
import { 
  SearchFilters, 
  CreateRecordRequest, 
  UpdateRecordRequest, 
  UploadFileRequest,
  CreateShareRequest,
  RespondToShareRequest,
  UseHealthRecordsParams,
} from '@/types/health-records';

// Main health records query
export const useHealthRecords = (params?: UseHealthRecordsParams) => {
  return useQuery({
    queryKey: ['health-records', JSON.stringify(params || {})],
    queryFn: () => healthRecordsApi.getMedicalRecords(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

// Single health record query
export const useHealthRecord = (id: string) => {
  return useQuery({
    queryKey: ['health-record', id],
    queryFn: () => healthRecordsApi.getMedicalRecordById(id),
    enabled: !!id,
  });
};

// Create health record mutation
export const useCreateHealthRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRecordRequest) => healthRecordsApi.createMedicalRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
    },
  });
};

// Update health record mutation
export const useUpdateHealthRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateRecordRequest) => healthRecordsApi.updateMedicalRecord(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
      queryClient.invalidateQueries({ queryKey: ['health-record', data.id] });
    },
  });
};

// Delete health record mutation
export const useDeleteHealthRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => healthRecordsApi.deleteMedicalRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
    },
  });
};

// Categories query
export const useCategories = () => {
  return useQuery({
    queryKey: ['health-record-categories'],
    queryFn: () => healthRecordsApi.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Category hierarchy query
export const useCategoryHierarchy = () => {
  return useQuery({
    queryKey: ['health-record-category-hierarchy'],
    queryFn: () => healthRecordsApi.getCategoryHierarchy(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Tags query
export const useTags = () => {
  return useQuery({
    queryKey: ['health-record-tags'],
    queryFn: () => healthRecordsApi.getTags(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// File upload mutation
export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UploadFileRequest) => healthRecordsApi.uploadFile(data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['health-record', variables.recordId] });
    },
  });
};

// Get record files query
export const useRecordFiles = (recordId: string) => {
  return useQuery({
    queryKey: ['health-record-files', recordId],
    queryFn: () => healthRecordsApi.getRecordFiles(recordId),
    enabled: !!recordId,
  });
};

// Delete file mutation
export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (fileId: string) => healthRecordsApi.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-record-files'] });
    },
  });
};

// Record versions query
export const useRecordVersions = (recordId: string) => {
  return useQuery({
    queryKey: ['health-record-versions', recordId],
    queryFn: () => healthRecordsApi.getRecordVersions(recordId),
    enabled: !!recordId,
  });
};

// Revert to version mutation
export const useRevertToVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ recordId, versionNumber }: { recordId: string; versionNumber: number }) => 
      healthRecordsApi.revertToVersion(recordId, versionNumber),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['health-record', data.id] });
      queryClient.invalidateQueries({ queryKey: ['health-record-versions', data.id] });
    },
  });
};

// Share requests query
export const useShareRequests = (centerId?: string) => {
  return useQuery({
    queryKey: ['share-requests', centerId || ''],
    queryFn: () => healthRecordsApi.getShareRequests(centerId),
  });
};

// Active shares query
export const useActiveShares = (recordId?: string) => {
  return useQuery({
    queryKey: ['active-shares', recordId || ''],
    queryFn: () => healthRecordsApi.getActiveShares(recordId),
  });
};

// Create share request mutation
export const useCreateShareRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateShareRequest) => healthRecordsApi.createShareRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-requests'] });
    },
  });
};

// Respond to share request mutation
export const useRespondToShareRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RespondToShareRequest) => healthRecordsApi.respondToShareRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-requests'] });
      queryClient.invalidateQueries({ queryKey: ['active-shares'] });
    },
  });
};

// Search records query
export const useSearchRecords = (query: string, filters?: SearchFilters) => {
  return useQuery({
    queryKey: ['search-records', query, JSON.stringify(filters || {})],
    queryFn: () => healthRecordsApi.searchRecords(query, filters),
    enabled: query.length > 2,
  });
};

// Dashboard stats query
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['health-records-dashboard-stats'],
    queryFn: async () => {
      try {
        return await healthRecordsApi.getDashboardStats();
      } catch (err: any) {
        // Gracefully handle 404 for environments where stats endpoint isn't available
        if (err?.status === 404) {
          return { totalRecords: 0, sharedRecords: 0, pendingRequests: 0, recentActivity: 0 } as any;
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// File URL query
export const useFileUrl = (fileId: string) => {
  return useQuery({
    queryKey: ['file-url', fileId],
    queryFn: () => healthRecordsApi.getFileUrl(fileId),
    enabled: !!fileId,
  });
};

// Convert DICOM mutation
export const useConvertDicom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ recordId, fileId }: { recordId: string; fileId: string }) => 
      healthRecordsApi.convertDicomToJpeg(recordId, fileId),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['health-record-files', variables.recordId] });
    },
  });
};
