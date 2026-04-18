import { apiClient } from '@/lib/api-client';
import {
  Appointment,
  AppointmentListResponse,
  AppointmentKPIs,
  AppointmentAnalytics,
  AppointmentFilters,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentTypesResponse,
  ProviderAvailabilityResponse,
  AvailableSlotsResponse
} from '@/types/appointments';

export class AppointmentService {
  private apiClient = apiClient;

  // Get all appointments with filters
  async getAppointments(filters: AppointmentFilters = {}): Promise<AppointmentListResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Filter out invalid parameters
      const validParams = ['page', 'limit', 'status', 'centerId', 'providerId', 'patientId', 'dateFrom', 'dateTo'];

      Object.entries(filters).forEach(([key, value]) => {
        if (validParams.includes(key) && value !== undefined && value !== null && value !== '') {
          // Convert status values to valid enum values
          if (key === 'status' && value === 'all') {
            // Don't add status filter for 'all'
            return;
          }
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
      console.log('🌐 AppointmentService.getAppointments →', { endpoint, filters });
      const rawResponse = await this.apiClient.get<any>(endpoint);
      const isArray = Array.isArray(rawResponse);
      console.log('📥 AppointmentService.getAppointments response meta:', {
        isArray,
        hasData: !!rawResponse,
        dataLen: isArray ? (rawResponse as any[]).length : Array.isArray(rawResponse?.data) ? rawResponse.data.length : 'n/a',
        pagination: rawResponse?.pagination
      });

      if (!rawResponse) {
        throw new Error('No response received from server');
      }

      const currentPage = Number(filters.page ?? 1);
      const currentLimit = Number(filters.limit ?? 20);

      const normalized: AppointmentListResponse = isArray
        ? {
          data: rawResponse as any[],
          pagination: {
            page: currentPage,
            limit: currentLimit,
            total: (rawResponse as any[]).length,
            totalPages: 1
          }
        }
        : {
          data: rawResponse.data || [],
          pagination: rawResponse.pagination || {
            page: currentPage,
            limit: currentLimit,
            total: (rawResponse.data || []).length,
            totalPages: 1
          }
        };

      return normalized;
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      throw error;
    }
  }

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<Appointment> {
    return this.apiClient.get<Appointment>(`/appointments/${id}`);
  }

  // Get current user's appointments (for patients - filters by patientId)
  async getMyAppointments(filters: Partial<AppointmentFilters> = {}): Promise<AppointmentListResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Filter out invalid parameters
      const validParams = ['page', 'limit', 'status', 'centerId', 'providerId', 'patientId', 'dateFrom', 'dateTo'];

      Object.entries(filters).forEach(([key, value]) => {
        if (validParams.includes(key) && value !== undefined && value !== null && value !== '') {
          // Convert status values to valid enum values
          if (key === 'status' && value === 'all') {
            // Don't add status filter for 'all'
            return;
          }
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';

      console.log('🔍 Fetching user appointments from:', endpoint);
      const rawResponse = await this.apiClient.get<any>(endpoint);
      const isArray = Array.isArray(rawResponse);

      if (!rawResponse) {
        throw new Error('No response received from server');
      }

      const currentPage = Number(filters.page ?? 1);
      const currentLimit = Number(filters.limit ?? 20);

      const normalized: AppointmentListResponse = isArray
        ? {
          data: rawResponse as any[],
          pagination: {
            page: currentPage,
            limit: currentLimit,
            total: (rawResponse as any[]).length,
            totalPages: 1
          }
        }
        : {
          data: rawResponse.data || [],
          pagination: rawResponse.pagination || {
            page: currentPage,
            limit: currentLimit,
            total: (rawResponse.data || []).length,
            totalPages: 1
          }
        };

      return normalized;
    } catch (error) {
      console.error('❌ Error fetching user appointments:', error);
      throw error;
    }
  }

  // Create new appointment
  async createAppointment(appointmentData: CreateAppointmentDto): Promise<Appointment> {
    return this.apiClient.post<Appointment>('/appointments', appointmentData);
  }

  // Update appointment
  async updateAppointment(id: string, updateData: UpdateAppointmentDto): Promise<Appointment> {
    return this.apiClient.patch<Appointment>(`/appointments/${id}`, updateData);
  }

  // Confirm appointment
  async confirmAppointment(id: string, confirmedAt?: string, message?: string): Promise<Appointment> {
    const data = {
      status: 'confirmed' as const,
      confirmedAt: confirmedAt || new Date().toISOString(),
      approvalMessage: message // Optional message sent to patient email
    };
    return this.apiClient.patch<Appointment>(`/appointments/${id}/confirm`, data);
  }

  // Complete appointment
  async completeAppointment(id: string, completionNotes?: string): Promise<Appointment> {
    const data = {
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      completionNotes
    };
    return this.apiClient.patch<Appointment>(`/appointments/${id}/complete`, data);
  }

  // Cancel appointment
  async cancelAppointment(id: string, reason?: string, cancelledBy?: string): Promise<Appointment> {
    const data = {
      reason: reason || 'Appointment cancelled',
      cancelledBy: cancelledBy || 'user'
    };
    return this.apiClient.patch<Appointment>(`/appointments/${id}/cancel`, data);
  }

  // Delete appointment
  async deleteAppointment(id: string): Promise<void> {
    try {
      const result = await this.apiClient.delete<void>(`/appointments/${id}`);
      // Handle both empty responses and JSON responses
      return result;
    } catch (error) {
      console.error('❌ Error deleting appointment:', error);
      throw error;
    }
  }

  // Get appointment types by center
  async getAppointmentTypes(centerId: string): Promise<AppointmentTypesResponse> {
    return this.apiClient.get<AppointmentTypesResponse>(`/appointments/types/center/${centerId}`);
  }

  // Get provider availability
  async getProviderAvailability(providerId: string): Promise<ProviderAvailabilityResponse> {
    return this.apiClient.get<ProviderAvailabilityResponse>(`/appointments/availability/provider/${providerId}`);
  }

  // Get available slots
  async getAvailableSlots(providerId: string, date: string): Promise<AvailableSlotsResponse> {
    const queryParams = new URLSearchParams({ date });
    return this.apiClient.get<AvailableSlotsResponse>(`/appointments/slots/provider/${providerId}?${queryParams.toString()}`);
  }

  // Get appointment analytics
  async getAppointmentAnalytics(centerId: string): Promise<AppointmentAnalytics> {
    return this.apiClient.get<AppointmentAnalytics>(`/appointments/analytics/${centerId}`);
  }

  // Helper method to calculate KPIs from appointments data
  calculateKPIs(appointments: Appointment[]): AppointmentKPIs {
    // Handle case where appointments is undefined or null
    if (!appointments || !Array.isArray(appointments)) {
      return {
        totalAppointments: 0,
        confirmedToday: 0,
        pendingConfirmation: 0,
        cancellationRate: 0,
        averageWaitTime: 0,
        uniquePatients: 0,
        totalAppointmentsChange: 0,
        confirmedTodayChange: 0,
        pendingConfirmationChange: 0,
        cancellationRateChange: 0,
        averageWaitTimeChange: 0,
        uniquePatientsChange: 0
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter appointments for current month
    const currentMonthAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= thisMonth && aptDate < now;
    });

    // Filter appointments for today
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= today && aptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });

    // Calculate metrics
    const totalAppointments = currentMonthAppointments.length;
    const confirmedToday = todayAppointments.filter(apt => apt.status === 'confirmed').length;
    const pendingConfirmation = currentMonthAppointments.filter(apt => apt.status === 'scheduled').length;
    const cancelledAppointments = currentMonthAppointments.filter(apt => apt.status === 'cancelled').length;
    const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

    // Calculate average wait time (simplified)
    const averageWaitTime = 12; // Mock data

    // Calculate unique patients
    const uniquePatients = new Set(currentMonthAppointments.map(apt => apt.patientId)).size;

    // Mock percentage changes
    return {
      totalAppointments,
      confirmedToday,
      pendingConfirmation,
      cancellationRate,
      averageWaitTime,
      uniquePatients,
      totalAppointmentsChange: 12,
      confirmedTodayChange: 8,
      pendingConfirmationChange: -15,
      cancellationRateChange: -2,
      averageWaitTimeChange: -8,
      uniquePatientsChange: 18
    };
  }

  // Download appointment as ICS
  async downloadICS(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiClient.getBaseUrl()}/appointments/${id}/ics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to download calendar file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointment-${id}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('❌ Error downloading ICS:', error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService();