import { apiClient } from '@/lib/api-client';

export interface HealthcareProvider {
  id: string;
  displayId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  qualifications: string[];
  centerId: string;
  centerName?: string;
  isActive: boolean;
  profileImage?: string;
  bio?: string;
  languages: string[];
  experience: number;
  consultationFee?: number;
  availability: ProviderAvailability[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxAppointments: number;
  slotDurationMinutes: number;
  bufferTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderListResponse {
  data: HealthcareProvider[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AvailableSlotsResponse {
  providerId: string;
  date: string;
  availableSlots: {
    startTime: string;
    endTime: string;
    duration: number;
    isAvailable: boolean;
  }[];
}

export class ProviderService {
  private apiClient = apiClient;

  // Get all providers
  async getProviders(filters: {
    page?: number;
    limit?: number;
    centerId?: string;
    specialization?: string;
    isActive?: boolean;
  } = {}): Promise<ProviderListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Set default type to doctor for provider search
      queryParams.append('type', 'doctor');
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Map specialization to specialty for API compatibility
          if (key === 'specialization') {
            queryParams.append('specialty', value.toString());
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/users/search?${queryString}`;
      
      console.log('🔍 Fetching providers from:', endpoint);
      const response = await this.apiClient.get<{ users: HealthcareProvider[] }>(endpoint);
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      return {
        data: response.users || [],
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: response.users?.length || 0,
          totalPages: Math.ceil((response.users?.length || 0) / (filters.limit || 10))
        }
      };
    } catch (error) {
      console.error('❌ Error fetching providers:', error);
      throw error;
    }
  }

  // Get provider by ID
  async getProviderById(id: string): Promise<HealthcareProvider> {
    try {
      console.log('🔍 Fetching provider by ID:', id);
      return await this.apiClient.get<HealthcareProvider>(`/users/${id}`);
    } catch (error) {
      console.error('❌ Error fetching provider:', error);
      throw error;
    }
  }

  // Get provider availability
  async getProviderAvailability(providerId: string): Promise<ProviderAvailability[]> {
    try {
      console.log('🔍 Fetching provider availability:', providerId);
      const response = await this.apiClient.get<{ availability: ProviderAvailability[] }>(`/appointments/availability/provider/${providerId}`);
      return response.availability || [];
    } catch (error) {
      console.error('❌ Error fetching provider availability:', error);
      throw error;
    }
  }

  // Get available time slots for a provider
  async getAvailableSlots(providerId: string, date: string, duration: number): Promise<AvailableSlotsResponse> {
    try {
      const queryParams = new URLSearchParams({
        providerId,
        date,
        duration: duration.toString()
      });
      
      const endpoint = `/appointments/slots/available?${queryParams.toString()}`;
      console.log('🔍 Fetching available slots from:', endpoint);
      
      return await this.apiClient.get<AvailableSlotsResponse>(endpoint);
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      throw error;
    }
  }

  // Get provider time slots
  async getProviderSlots(providerId: string, date?: string): Promise<{
    providerId: string;
    timeSlots: {
      id: string;
      startTime: string;
      endTime: string;
      duration: number;
      isBooked: boolean;
      appointmentId: string | null;
    }[];
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (date) {
        queryParams.append('date', date);
      }
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/appointments/slots/provider/${providerId}?${queryString}` : `/appointments/slots/provider/${providerId}`;
      
      console.log('🔍 Fetching provider slots from:', endpoint);
      return await this.apiClient.get(endpoint);
    } catch (error) {
      console.error('❌ Error fetching provider slots:', error);
      throw error;
    }
  }

  // Create provider availability
  async createProviderAvailability(availabilityData: {
    providerId: string;
    centerId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    maxAppointmentsPerSlot: number;
    slotDurationMinutes: number;
    bufferTimeMinutes: number;
  }): Promise<ProviderAvailability> {
    try {
      console.log('🔍 Creating provider availability:', availabilityData);
      return await this.apiClient.post<ProviderAvailability>('/appointments/availability', availabilityData);
    } catch (error) {
      console.error('❌ Error creating provider availability:', error);
      throw error;
    }
  }

  // Update provider availability
  async updateProviderAvailability(availabilityId: string, availabilityData: Partial<ProviderAvailability>): Promise<ProviderAvailability> {
    try {
      console.log('🔍 Updating provider availability:', availabilityId, availabilityData);
      return await this.apiClient.patch<ProviderAvailability>(`/appointments/availability/${availabilityId}`, availabilityData);
    } catch (error) {
      console.error('❌ Error updating provider availability:', error);
      throw error;
    }
  }
}

export const providerService = new ProviderService();
