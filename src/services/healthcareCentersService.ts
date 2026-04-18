import apiClient from './apiClient';
import {
  HealthcareCenter,
  CenterService,
  CenterStaff,
  Appointment,
  TimeSlot,
  CenterFilters,
  AppointmentFilters,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CreateCenterServiceDto,
  PaginatedResponse
} from '@/types/healthcare-centers';

// Center Discovery API
export const healthcareCentersService = {
  // Get all centers (admin only)
  async getAllCenters(): Promise<HealthcareCenter[]> {
    const response = await apiClient.get<HealthcareCenter[]>('/centers');
    return response.data;
  },

  // Get center types
  async getCenterTypes(): Promise<Array<{ value: string; label: string }>> {
    const response = await apiClient.get<Array<{ value: string; label: string }>>('/centers/types');
    return response.data;
  },

  // Get centers by type
  async getCentersByType(type: string): Promise<HealthcareCenter[]> {
    const response = await apiClient.get<HealthcareCenter[]>(`/centers/types/${type}`);
    return response.data;
  },

  // Get specific center type endpoints
  async getHospitals(): Promise<HealthcareCenter[]> {
    const response = await apiClient.get<HealthcareCenter[]>('/centers/hospital');
    return response.data;
  },

  async getEyeClinics(): Promise<HealthcareCenter[]> {
    const response = await apiClient.get<HealthcareCenter[]>('/centers/eye-clinics');
    return response.data;
  },

  async getMaternityCenters(): Promise<HealthcareCenter[]> {
    const response = await apiClient.get<HealthcareCenter[]>('/centers/maternity');
    return response.data;
  },

  async getVirologyCenters(): Promise<HealthcareCenter[]> {
    const response = await apiClient.get<HealthcareCenter[]>('/centers/virology');
    return response.data;
  },

  async getPsychiatricCenters(): Promise<HealthcareCenter[]> {
    const response = await apiClient.get<HealthcareCenter[]>('/centers/psychiatric');
    return response.data;
  },

  async getCareHomes(): Promise<HealthcareCenter[]> {
    const response = await apiClient.get<HealthcareCenter[]>('/centers/care-homes');
    return response.data;
  },

  async getHospiceCenters(): Promise<HealthcareCenter[]> {
    const response = await apiClient.get<HealthcareCenter[]>('/centers/hospice');
    return response.data;
  },

  async getFuneralServices(): Promise<HealthcareCenter[]> {
    const response = await apiClient.get<HealthcareCenter[]>('/centers/funeral');
    return response.data;
  },

  // Get center by ID
  async getCenterById(id: string): Promise<HealthcareCenter> {
    const response = await apiClient.get<HealthcareCenter>(`/centers/${id}`);
    return response.data;
  },

  // Get centers by user ID
  async getCentersByUser(userId: string): Promise<HealthcareCenter[]> {
    const response = await apiClient.get(`/centers/user/${userId}`);
    const data = response.data as any;
    // Normalize: backend may return a single center object or an array; ensure array
    const centersRaw = Array.isArray(data) ? data : (data ? [data] : []);
    // Normalize IDs in case backend uses centerId
    const centers = centersRaw.map((c: any) => ({
      ...c,
      id: c?.id || c?.centerId,
    })) as HealthcareCenter[];
    return centers;
  },

  // Get staff for a specific center
  async getCenterStaff(centerId: string): Promise<CenterStaff[]> {
    const response = await apiClient.get<CenterStaff[]>(`/centers/${centerId}/staff`);
    return response.data;
  },

  // Get center services
  async getCenterServices(centerId: string): Promise<CenterService[]> {
    const response = await apiClient.get<CenterService[]>(`/centers/${centerId}/services`);
    return response.data;
  },

  // Get service by ID
  async getServiceById(serviceId: string): Promise<CenterService> {
    const response = await apiClient.get<CenterService>(`/centers/services/${serviceId}`);
    return response.data;
  },

  // Create center service
  async createCenterService(centerId: string, serviceData: CreateCenterServiceDto): Promise<CenterService> {
    const response = await apiClient.post<CenterService>(`/centers/${centerId}/services`, serviceData);
    return response.data;
  },

  // (duplicate removed)

  // Add staff member to center
  async addStaffMember(centerId: string, staffData: { userId: string; role: string }): Promise<CenterStaff> {
    const response = await apiClient.post<CenterStaff>(`/centers/${centerId}/staff`, staffData);
    return response.data;
  },

  // Remove staff member from center
  async removeStaffMember(centerId: string, staffId: string): Promise<void> {
    await apiClient.delete(`/centers/${centerId}/staff/${staffId}`);
  }
};

// Appointment Management API
export const appointmentService = {
  // Get available time slots
  async getAvailableSlots(providerId: string, date: string): Promise<{ date: string; providerId: string; slots: TimeSlot[] }> {
    const response = await apiClient.get<{ date: string; providerId: string; slots: TimeSlot[] }>(
      `/appointments/slots/provider/${providerId}?date=${date}`
    );
    return response.data;
  },

  // Create appointment
  async createAppointment(appointmentData: CreateAppointmentDto): Promise<Appointment> {
    const response = await apiClient.post<Appointment>('/appointments', appointmentData);
    return response.data;
  },

  // Get appointments with filters
  async getAppointments(filters: AppointmentFilters = {}): Promise<PaginatedResponse<Appointment>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    const response = await apiClient.get<PaginatedResponse<Appointment>>(`/appointments?${params}`);

    // Ensure response has the expected structure with fallbacks
    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    };
  },

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  // Update appointment
  async updateAppointment(id: string, updateData: UpdateAppointmentDto): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(`/appointments/${id}`, updateData);
    return response.data;
  },

  // Confirm appointment
  async confirmAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(`/appointments/${id}/confirm`);
    return response.data;
  },

  // Cancel appointment
  async cancelAppointment(id: string, reason: string, cancelledBy: string): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(`/appointments/${id}/cancel`, {
      reason,
      cancelledBy
    });
    return response.data;
  },

  // Complete appointment
  async completeAppointment(id: string, completionData: { notes?: string; metadata?: Record<string, unknown> }): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(`/appointments/${id}/complete`, completionData);
    return response.data;
  },

  // Delete appointment
  async deleteAppointment(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  }
};

// Utility functions for center discovery
export const centerDiscoveryUtils = {
  // Get service type based on center type
  getServiceType(center: HealthcareCenter): 'medical' | 'emergency' | 'support' | 'specialized' {
    switch (center.type) {
      case 'hospital':
      case 'dental':
      case 'eye':
      case 'maternity':
        return 'medical';

      case 'ambulance':
        return 'emergency';

      case 'hospice':
      case 'care-home':
      case 'psychiatric':
        return 'support';

      case 'funeral':
      case 'diagnostic':
      case 'radiology':
      case 'pharmacy':
        return 'specialized';

      default:
        return 'medical';
    }
  },

  // Filter centers based on criteria
  filterCenters(centers: HealthcareCenter[], filters: CenterFilters): HealthcareCenter[] {
    return centers.filter(center => {
      // Type filter
      if (filters.type && center.type !== filters.type) return false;

      // City filter
      if (filters.city && center.city?.toLowerCase() !== filters.city.toLowerCase()) return false;

      // State filter
      if (filters.state && center.state?.toLowerCase() !== filters.state.toLowerCase()) return false;

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          center.name,
          center.address,
          center.city,
          center.state,
          center.type
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchableFields.includes(searchTerm)) return false;
      }

      // Location filter (if coordinates provided)
      if (filters.latitude && filters.longitude && filters.radius) {
        const distance = this.calculateDistance(
          filters.latitude,
          filters.longitude,
          center.latitude || 0,
          center.longitude || 0
        );

        if (distance > filters.radius) return false;
      }

      return true;
    });
  },

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  },

  // Convert degrees to radians
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  },

  // Sort centers by distance
  sortCentersByDistance(centers: HealthcareCenter[], userLat?: number, userLon?: number): HealthcareCenter[] {
    if (!userLat || !userLon) return centers;

    return centers.sort((a, b) => {
      const distanceA = this.calculateDistance(userLat, userLon, a.latitude || 0, a.longitude || 0);
      const distanceB = this.calculateDistance(userLat, userLon, b.latitude || 0, b.longitude || 0);
      return distanceA - distanceB;
    });
  }
};

export default healthcareCentersService;
