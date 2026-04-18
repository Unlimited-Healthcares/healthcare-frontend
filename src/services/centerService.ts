import { apiClient } from '@/lib/api-client';

export interface HealthcareCenter {
  id: string;
  displayId: string;
  name: string;
  type: string;
  address: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  hours?: string;
  businessRegistrationNumber?: string;
  businessRegistrationDocUrl?: string;
  locationMetadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CenterListResponse {
  data: HealthcareCenter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CenterService {
  private apiClient = apiClient;

  // Get all centers
  async getCenters(filters: {
    page?: number;
    limit?: number;
    type?: string;
    city?: string;
    state?: string;
    isActive?: boolean;
  } = {}): Promise<CenterListResponse> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/centers?${queryString}` : '/centers';

      console.log('🔍 Fetching centers from:', endpoint);
      const response = await this.apiClient.get<CenterListResponse>(endpoint);

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
      console.error('❌ Error fetching centers:', error);
      throw error;
    }
  }

  // Get center by ID
  async getCenterById(id: string): Promise<HealthcareCenter> {
    try {
      console.log('🔍 Fetching center by ID:', id);
      return await this.apiClient.get<HealthcareCenter>(`/centers/${id}`);
    } catch (error) {
      console.error('❌ Error fetching center:', error);
      throw error;
    }
  }

  // Create new center
  async createCenter(centerData: Partial<HealthcareCenter>): Promise<HealthcareCenter> {
    try {
      console.log('🔍 Creating center:', centerData);
      return await this.apiClient.post<HealthcareCenter>('/centers', centerData);
    } catch (error) {
      console.error('❌ Error creating center:', error);
      throw error;
    }
  }

  // Update center
  async updateCenter(id: string, centerData: Partial<HealthcareCenter>): Promise<HealthcareCenter> {
    try {
      console.log('🔍 Updating center:', id, centerData);
      return await this.apiClient.patch<HealthcareCenter>(`/centers/${id}`, centerData);
    } catch (error) {
      console.error('❌ Error updating center:', error);
      throw error;
    }
  }

  // Delete center
  async deleteCenter(id: string): Promise<void> {
    try {
      console.log('🔍 Deleting center:', id);
      return await this.apiClient.delete<void>(`/centers/${id}`);
    } catch (error) {
      console.error('❌ Error deleting center:', error);
      throw error;
    }
  }
}

export const centerService = new CenterService();