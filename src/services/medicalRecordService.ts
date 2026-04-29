import { apiClient } from '@/lib/api-client';
import { 
  MedicalRecordRequestFormData,
  MedicalRecordRequestResponse,
  MedicalRecordRequestApprovalResponse,
  MedicalRecordRequestWithDetails,
  MedicalRecordShareWithDetails,
  MedicalRecordAccessLogWithDetails,
  MedicalRecordRequestQueryParams,
  MedicalRecordShareQueryParams,
  MedicalRecordAccessLogQueryParams,
  MedicalRecordRequestResponseData,
  MedicalRecordSharingPreferences
} from '@/types/medical-records';
import { notificationService } from '@/services/notificationService';
import type { GenericObject } from '@/types/common';

interface MedicalRecordSummary {
  patientId: string;
  totalRecords: number;
  recordTypes: Record<string, number>;
  dateRange: {
    earliest: string;
    latest: string;
  };
  providers: string[];
  conditions: string[];
  medications: string[];
  allergies: string[];
}

/**
 * Service for working with medical records sharing system
 */
export const medicalRecordService = {
  /**
   * Request medical records from another center
   */
  async requestMedicalRecords(data: MedicalRecordRequestFormData): Promise<MedicalRecordRequestResponse> {
    try {
      const response = await apiClient.post('/medical-record-requests', data) as any;
      const requestData = response.data;
      const error = response.error;

      if (error) throw error;

      // Create notification for the receiving center
      // Note: Center notifications would need a different approach
      // as the basic notification service only supports user_id

      // Also notify the patient
      // Fetch patient user ID first
      const patientResponse = await apiClient.get(`/patients/${data.patient_id}`) as any;
      const patient = patientResponse.data;

      if (patient) {
        await notificationService.createNotification({
          userId: patient.user_id,
          title: 'Medical Record Request Initiated',
          message: `A request for your medical records has been initiated.`,
          type: 'info'
        });
      }

      return {
        success: true,
        message: 'Medical record request submitted successfully',
        request_id: requestData.id
      };
    } catch (error) {
      console.error('Error requesting medical records:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit medical record request'
      };
    }
  },

  /**
   * Get a specific medical record request by ID
   */
  async getMedicalRecordRequest(requestId: string): Promise<MedicalRecordRequestWithDetails | null> {
    try {
      const response = await apiClient.get(`/medical-record-requests/${requestId}`) as any;
      const { data, error } = response;

      if (error) throw error;

      return data || null;
    } catch (error) {
      console.error('Error getting medical record request:', error);
      return null;
    }
  },

  /**
   * List medical record requests for a center
   */
  async listMedicalRecordRequests(
    params: MedicalRecordRequestQueryParams
  ): Promise<MedicalRecordRequestWithDetails[]> {
    try {
      const { center_id, status, direction = 'all', limit = 100, offset = 0 } = params;

      const response = await apiClient.get(`/medical-record-requests?center_id=${center_id}&status=${status}&direction=${direction}&limit=${limit}&offset=${offset}`) as any;
      const { data, error } = response;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error listing medical record requests:', error);
      return [];
    }
  },

  /**
   * Respond to a medical record request (approve or deny)
   */
  async respondToMedicalRecordRequest(
    data: MedicalRecordRequestResponseData
  ): Promise<MedicalRecordRequestApprovalResponse> {
    try {
      const response = await apiClient.post(`/medical-record-requests/${data.request_id}/respond`, data) as any;
      const { data: responseData, error } = response;

      if (error) throw error;

      return {
        success: true,
        message: responseData.message,
        share_id: responseData.share_id,
        expiry_date: responseData.expiry_date
      };
    } catch (error) {
      console.error('Error responding to medical record request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to respond to medical record request'
      };
    }
  },

  /**
   * Get shared medical records for a center
   */
  async getSharedMedicalRecords(
    params: MedicalRecordShareQueryParams
  ): Promise<MedicalRecordShareWithDetails[]> {
    try {
      const { center_id, direction = 'all', limit = 100, offset = 0 } = params;

      const response = await apiClient.get(`/shared-medical-records?center_id=${center_id}&direction=${direction}&limit=${limit}&offset=${offset}`) as any;
      const { data, error } = response;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting shared medical records:', error);
      return [];
    }
  },

  /**
   * Get medical record access logs
   */
  async getMedicalRecordAccessLogs(
    params: MedicalRecordAccessLogQueryParams
  ): Promise<MedicalRecordAccessLogWithDetails[]> {
    try {
      const { patient_id, limit = 100, offset = 0 } = params;

      const response = await apiClient.get(`/medical-record-access-logs?patient_id=${patient_id}&limit=${limit}&offset=${offset}`) as any;
      const { data, error } = response;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting medical record access logs:', error);
      return [];
    }
  },

  /**
   * Log medical record access
   */
  async logMedicalRecordAccess(
    shareId: string,
    staffId: string,
    accessType: string,
    accessDetails: GenericObject = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<string | null> {
    try {
      const response = await apiClient.post(`/medical-record-access-logs`, {
        share_id: shareId,
        staff_id: staffId,
        access_type: accessType,
        access_details: accessDetails,
        ip_address: ipAddress,
        user_agent: userAgent,
        accessed_at: new Date().toISOString()
      }) as any;
      const { data, error } = response;

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error logging medical record access:', error);
      return null;
    }
  },

  /**
   * Update patient sharing preferences
   */
  async updateSharingPreferences(
    patientId: string,
    preferences: Partial<MedicalRecordSharingPreferences>
  ): Promise<boolean> {
    try {
      const response = await apiClient.put(`/medical-record-sharing-preferences/${patientId}`, preferences) as any;
      const { error } = response;

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating sharing preferences:', error);
      return false;
    }
  },

  /**
   * Get patient sharing preferences
   */
  async getSharingPreferences(patientId: string): Promise<MedicalRecordSharingPreferences | null> {
    try {
      const response = await apiClient.get(`/medical-record-sharing-preferences/${patientId}`) as any;
      const { data, error } = response;

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

      return data;
    } catch (error) {
      console.error('Error getting sharing preferences:', error);
      return null;
    }
  },

  /**
   * Revoke access to shared medical records
   */
  async revokeAccess(shareId: string): Promise<boolean> {
    try {
      const response = await apiClient.put(`/medical-record-shares/${shareId}`, {
        is_revoked: true,
        revoked_at: new Date().toISOString()
      }) as any;
      const { error } = response;

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error revoking access:', error);
      return false;
    }
  },

  /**
   * Generate medical record summary for a patient
   */
  async generateMedicalRecordSummary(patientId: string): Promise<MedicalRecordSummary | null> {
    try {
      const response = await apiClient.get(`/medical-record-summary/${patientId}`) as any;
      const { data, error } = response;

      if (error) throw error;

      return data as MedicalRecordSummary;
    } catch (error) {
      console.error('Error generating medical record summary:', error);
      return null;
    }
  },

  /**
   * Check if a center has access to patient records
   */
  async checkCenterAccess(patientId: string, centerId: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/center-patient-access?patient_id=${patientId}&center_id=${centerId}`) as any;
      const { data, error } = response;

      if (error) throw error;

      return data || false;
    } catch (error) {
      console.error('Error checking center access:', error);
      return false;
    }
  },

  /**
   * Get patient consent status for sharing
   */
  async getPatientConsentStatus(patientId: string, centerId: string): Promise<GenericObject | null> {
    try {
      const response = await apiClient.get(`/patient-consent?patient_id=${patientId}&center_id=${centerId}`) as any;
      const { data, error } = response;

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('Error getting patient consent status:', error);
      return null;
    }
  },

  /**
   * Search for medical records
   */
  async searchRecords(params: { 
    patientId?: string; 
    workspaceId?: string; 
    type?: string; 
    search?: string; 
    limit?: number;
  }): Promise<{ records: any[] }> {
    try {
      const response = await apiClient.get('/medical-records/search', { params }) as any;
      const records = response.data || response || [];
      // Handle both cases: response is array or response has data property
      return { 
        records: Array.isArray(records) ? records : (records.data || []) 
      };
    } catch (error) {
      console.error('Error searching medical records:', error);
      return { records: [] };
    }
  },

  /**
   * Create a new medical record
   */
  async createRecord(data: any): Promise<any> {
    try {
      const response = await apiClient.post('/medical-records', data) as any;
      return response.data || response;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  }
};

export default medicalRecordService; 