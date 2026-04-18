import { apiClient } from '@/lib/api-client';

export interface DoctorProfile {
  firstName: string;
  lastName: string;
  specialization?: string;
  phone?: string;
  avatar?: string;
}

export interface Doctor {
  id: string;
  publicId?: string;
  email: string;
  roles?: string[];
  profile: DoctorProfile;
}

export interface Center {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  centerType?: string;
  hours?: string;
  description?: string;
}

export interface ApprovedProvider {
  id: string;
  patientId: string;
  providerId: string;
  providerType: 'doctor' | 'center';
  status: 'approved' | 'pending' | 'rejected';
  approvedAt: string;
  provider: Doctor | null;
  center: Center | null;
}

export interface ApprovedProvidersResponse {
  providers: ApprovedProvider[];
  total: number;
}

export interface ApprovedProvidersCountResponse {
  total: number;
  doctors: number;
  centers: number;
}

export class ApprovedProvidersService {
  private apiClient = apiClient;

  // Get all approved providers for a patient
  async getApprovedProviders(patientId: string): Promise<ApprovedProvidersResponse> {
    try {
      console.log('🔍 Fetching approved providers for patient:', patientId);
      const response = await this.apiClient.get<ApprovedProvidersResponse>(`/patients/${patientId}/approved-providers`);
      return response;
    } catch (error: any) {
      console.error('❌ Error fetching approved providers:', error);
      
      // Handle specific error cases
      if (error.message?.includes('404')) {
        // Patient record doesn't exist in the backend database
        // This is a backend setup issue - return empty state gracefully
        console.warn('⚠️ Patient record not found. This may indicate a backend setup issue. Returning empty providers list.');
        return {
          providers: [],
          total: 0
        };
      } else if (error.message?.includes('401')) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.message?.includes('403')) {
        throw new Error('Access denied. You do not have permission to view this data.');
      } else {
        throw new Error('Failed to load approved providers. Please try again later.');
      }
    }
  }

  // Get approved doctors for a patient (filtered from main response)
  async getApprovedDoctors(patientId: string): Promise<ApprovedProvider[]> {
    try {
      const response = await this.getApprovedProviders(patientId);
      return response.providers.filter(provider => provider.providerType === 'doctor');
    } catch (error) {
      console.error('❌ Error fetching approved doctors:', error);
      throw error;
    }
  }

  // Get approved centers for a patient (filtered from main response)
  async getApprovedCenters(patientId: string): Promise<ApprovedProvider[]> {
    try {
      const response = await this.getApprovedProviders(patientId);
      return response.providers.filter(provider => provider.providerType === 'center');
    } catch (error) {
      console.error('❌ Error fetching approved centers:', error);
      throw error;
    }
  }

  // Get approved connections count for dashboard stats
  async getApprovedConnectionsCount(patientId: string): Promise<ApprovedProvidersCountResponse> {
    try {
      console.log('🔍 Fetching approved connections count for patient:', patientId);
      const response = await this.apiClient.get<ApprovedProvidersCountResponse>(`/patients/${patientId}/approved-providers/count`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching approved connections count:', error);
      throw error;
    }
  }
}

export const approvedProvidersService = new ApprovedProvidersService();
