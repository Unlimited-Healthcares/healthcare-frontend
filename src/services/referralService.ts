import axios from 'axios';

import { API_BASE_URL as CONFIG_API_BASE_URL } from '@/config/api';

// NOTE: Using fallback from config
const API_BASE_URL = CONFIG_API_BASE_URL;

// Referral Status
export enum ReferralStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  IN_PROGRESS = 'in_progress',
  CANCELLED = 'cancelled'
}

// Referral Priority
export enum ReferralPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Referral Type
export enum ReferralType {
  SPECIALIST = 'specialist',
  DIAGNOSTIC = 'diagnostic',
  PROCEDURE = 'procedure',
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  SECOND_OPINION = 'second_opinion',
  TRANSFER = 'transfer'
}

// Document Type
export enum DocumentType {
  REPORT = 'report',
  LAB_RESULT = 'lab_result',
  IMAGING = 'imaging',
  PRESCRIPTION = 'prescription',
  CLINICAL_NOTE = 'clinical_note',
  CONSENT_FORM = 'consent_form',
  OTHER = 'other'
}

// Medication Information
export interface MedicationInfo {
  name: string;
  dosage: string;
  frequency: string;
  [key: string]: unknown;
}

// Allergy Information
export interface AllergyInfo {
  allergen: string;
  reaction: string;
  severity: string;
  [key: string]: unknown;
}

// Create Referral Request
export interface CreateReferralDto {
  patientId: string;
  referringCenterId: string;
  receivingCenterId: string;
  receivingProviderId?: string;
  referralType: ReferralType;
  priority?: ReferralPriority;
  reason: string;
  clinicalNotes?: string;
  diagnosis?: string;
  instructions?: string;
  scheduledDate?: Date;
  expirationDate?: Date;
  medications?: MedicationInfo[];
  allergies?: AllergyInfo[];
  medicalHistory?: string;
  metadata?: Record<string, unknown>;
  // Legacy property for backward compatibility
  fromCenterId?: string;
}

// Update Referral Request
export interface UpdateReferralDto extends Partial<CreateReferralDto> {
  status?: ReferralStatus;
  responseNotes?: string;
  respondedDate?: Date;
}

// Create Referral Document Request
export interface CreateReferralDocumentDto {
  referralId: string;
  name: string;
  documentType: DocumentType;
  description?: string;
}

// Referral Query Parameters
export interface ReferralQueryParams {
  patientId?: string;
  referringCenterId?: string;
  receivingCenterId?: string;
  status?: ReferralStatus;
  startDate?: string;
  endDate?: string;
}

// Referral Entity
export interface Referral {
  id: string;
  patientId: string;
  referringProviderId: string;
  referringCenterId: string;
  receivingCenterId: string;
  receivingProviderId?: string;
  referralType: ReferralType;
  status: ReferralStatus;
  priority: ReferralPriority;
  reason: string;
  clinicalNotes?: string;
  diagnosis?: string;
  instructions?: string;
  scheduledDate?: Date;
  expirationDate?: Date;
  metadata: Record<string, unknown>;
  medications: MedicationInfo[];
  allergies: AllergyInfo[];
  medicalHistory?: string;
  respondedDate?: Date;
  responseNotes?: string;
  respondedById?: string;
  createdAt: Date;
  updatedAt: Date;
  patient: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  referringProvider: {
    id: string;
    name: string;
    email: string;
    specialization?: string;
  };
  receivingProvider?: {
    id: string;
    name: string;
    email: string;
    specialization?: string;
  };
  respondedBy?: {
    id: string;
    name: string;
    email: string;
  };
  documents: ReferralDocument[];
  // Legacy properties for backward compatibility
  from_center_id?: string;
  to_center_id?: string;
  patient_id?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  expected_completion_date?: Date;
  completed_date?: Date;
  scheduled_date?: Date;
  referral_type?: ReferralType;
}

// Referral Document Entity
export interface ReferralDocument {
  id: string;
  referralId: string;
  name: string;
  documentType: DocumentType;
  description?: string;
  filePath: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  // Legacy properties for backward compatibility
  file_type?: string;
  file_name?: string;
  file_size?: number;
  created_at?: Date;
  is_shared?: boolean;
  file_url?: string;
}

// Referral Status History
export interface ReferralStatusHistory {
  id: string;
  referralId: string;
  status: ReferralStatus;
  notes?: string;
  changedAt: Date;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
  // Legacy properties for backward compatibility
  created_at?: Date;
  created_by?: string;
}

// Referral with Details (includes related data)
export interface ReferralWithDetails extends Referral {
  statusHistory: ReferralStatusHistory[];
  documents: ReferralDocument[];
  facilityResources?: FacilityResource[];
}

// Facility Resource
export interface FacilityResource {
  id?: string;
  resourceType: string;
  resourceId?: string;
  details?: {
    description?: string;
    quantity?: string | number;
    [key: string]: unknown;
  };
  // Legacy properties for backward compatibility
  name?: string;
  type?: string;
  description?: string;
  capacity?: number;
  available?: boolean;
  centerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Referral Analytics Response
export interface ReferralAnalytics {
  totalReferrals: number;
  referralsByStatus: Array<{
    status: string;
    count: number;
  }>;
  referralsByType: Array<{
    type: string;
    count: number;
  }>;
  inboundVsOutbound: {
    inbound: number;
    outbound: number;
  };
  timeRange: {
    startDate?: Date;
    endDate?: Date;
  };
}

// Analytics Data for dashboard components
export interface AnalyticsData {
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    count: number;
  }>;
  averageCompletionTime: number;
  successRate: number;
  totalReferrals: number;
  referralsByStatus: Array<{
    status: string;
    count: number;
  }>;
  referralsByType: Array<{
    type: string;
    count: number;
  }>;
  inboundVsOutbound: {
    inbound: number;
    outbound: number;
  };
  timeRange: {
    startDate?: Date;
    endDate?: Date;
  };
}

// Dashboard Summary Data
export interface ReferralDashboardSummary {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  rejectedReferrals: number;
  urgentReferrals: number;
  avgResponseTime: number;
  referralTypes: Record<string, number>;
  statusDistribution: Record<string, number>;
  inboundOutboundRatio: number;
  recentActivity: Referral[];
  upcomingDeadlines: Referral[];
}

// Analytics Query
export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
}

// Create API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const referralService = {
  // Referral Management
  createReferral: async (data: CreateReferralDto): Promise<{ data: Referral; error?: string }> => {
    try {
      const response = await apiClient.post('/referrals', data);
      return { data: response.data };
    } catch (error: any) {
      return { data: {} as Referral, error: error.response?.data?.message || error.message };
    }
  },

  getReferrals: async (params: ReferralQueryParams = {}): Promise<Referral[]> => {
    const response = await apiClient.get('/referrals', { params });
    return response.data;
  },

  getReferralById: async (id: string): Promise<{ data: Referral; error?: string }> => {
    try {
      const response = await apiClient.get(`/referrals/${id}`);
      return { data: response.data };
    } catch (error: any) {
      return { data: {} as Referral, error: error.response?.data?.message || error.message };
    }
  },

  updateReferral: async (id: string, data: UpdateReferralDto): Promise<Referral> => {
    const response = await apiClient.patch(`/referrals/${id}`, data);
    return response.data;
  },

  deleteReferral: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/referrals/${id}`);
    return response.status === 200;
  },

  // Document Management
  getReferralDocuments: async (referralId: string): Promise<{ data: ReferralDocument[]; error?: string }> => {
    try {
      const response = await apiClient.get(`/referrals/${referralId}/documents`);
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: error.response?.data?.message || error.message };
    }
  },

  addReferralDocument: async (referralId: string, file: File, documentData: CreateReferralDocumentDto): Promise<ReferralDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', documentData.name);
    formData.append('documentType', documentData.documentType);
    if (documentData.description) {
      formData.append('description', documentData.description);
    }

    const response = await apiClient.post(`/referrals/${referralId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  downloadDocument: async (documentId: string): Promise<Blob> => {
    const response = await apiClient.get(`/referrals/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<boolean> => {
    const response = await apiClient.delete(`/referrals/documents/${documentId}`);
    return response.status === 200;
  },

  // Analytics
  getReferralAnalytics: async (centerId: string, params: AnalyticsQuery = {}): Promise<{ data: ReferralAnalytics; error?: string }> => {
    try {
      const response = await apiClient.get(`/referrals/analytics/${centerId}`, { params });
      return { data: response.data };
    } catch (error: any) {
      return { data: {} as ReferralAnalytics, error: error.response?.data?.message || error.message };
    }
  },

  getReferralDashboardSummary: async (centerId: string, params: AnalyticsQuery = {}): Promise<ReferralDashboardSummary> => {
    const response = await apiClient.get(`/referrals/dashboard-summary/${centerId}`, { params });
    return response.data;
  },

  // Additional methods for facility referrals
  createFacilityReferral: async (data: CreateReferralDto): Promise<{ data: Referral; error?: string }> => {
    try {
      const response = await apiClient.post('/referrals/facility', data);
      return { data: response.data };
    } catch (error: any) {
      return { data: {} as Referral, error: error.response?.data?.message || error.message };
    }
  },

  getReferralsForCenter: async (centerId: string, params: ReferralQueryParams = {}): Promise<{ data: Referral[]; error?: string }> => {
    try {
      const response = await apiClient.get(`/referrals/center/${centerId}`, { params });
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: error.response?.data?.message || error.message };
    }
  },

  getFacilityReferralsForCenter: async (centerId: string, params: ReferralQueryParams = {}): Promise<{ data: Referral[]; error?: string }> => {
    try {
      const response = await apiClient.get(`/referrals/facility/center/${centerId}`, { params });
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: error.response?.data?.message || error.message };
    }
  },

  getFacilityResources: async (centerId: string): Promise<{ data: FacilityResource[]; error?: string }> => {
    try {
      const response = await apiClient.get(`/referrals/facility/resources/${centerId}`);
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: error.response?.data?.message || error.message };
    }
  },

  getReferralStatusHistory: async (referralId: string): Promise<{ data: ReferralStatusHistory[]; error?: string }> => {
    try {
      const response = await apiClient.get(`/referrals/${referralId}/status-history`);
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: error.response?.data?.message || error.message };
    }
  },

  updateReferralStatus: async (data: { referralId: string; status: ReferralStatus; notes?: string; completedDate?: string }): Promise<{ error?: string }> => {
    try {
      await apiClient.patch(`/referrals/${data.referralId}/status`, {
        status: data.status,
        notes: data.notes,
        completedDate: data.completedDate
      });
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  },

  uploadReferralDocument: async (data: { referralId: string; file: File; documentData: CreateReferralDocumentDto }): Promise<{ error?: string }> => {
    try {
      await referralService.addReferralDocument(data.referralId, data.file, data.documentData);
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  },
};

export default referralService;