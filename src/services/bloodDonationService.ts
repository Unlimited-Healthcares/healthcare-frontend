import apiClient from './apiClient';
import {
  BloodDonor,
  BloodDonationRequest,
  BloodDonation,
  BloodInventory,
  CreateBloodDonorDto,
  CreateBloodDonationRequestDto,
  CreateBloodDonationDto,
  DonorFilters,
  RequestFilters,
  BloodDonationApiResponse,
  PaginatedResponse,
  BloodDonationAnalytics,
  BloodType,
} from '../types/blood-donation';

// Blood Donor Management
export const bloodDonationService = {
  // Donor Management
  registerDonor: async (data: CreateBloodDonorDto): Promise<BloodDonationApiResponse<BloodDonor>> => {
    const response = await apiClient.post('/blood-donation/donors/register', data);
    return response.data;
  },

  getMyDonorProfile: async (): Promise<BloodDonationApiResponse<BloodDonor>> => {
    const response = await apiClient.get('/blood-donation/donors/me');
    return response.data;
  },

  getAllDonors: async (filters: DonorFilters = {}): Promise<PaginatedResponse<BloodDonor>> => {
    const response = await apiClient.get('/blood-donation/donors', { params: filters });
    return response.data;
  },

  getEligibleDonors: async (bloodType: string, limit: number = 10): Promise<BloodDonationApiResponse<BloodDonor[]>> => {
    const response = await apiClient.get(`/blood-donation/donors/eligible/${bloodType}`, { 
      params: { limit } 
    });
    return response.data;
  },

  // Blood Donation Requests
  createBloodRequest: async (data: CreateBloodDonationRequestDto): Promise<BloodDonationApiResponse<BloodDonationRequest>> => {
    const response = await apiClient.post('/blood-donation/requests', data);
    return response.data;
  },

  getAllBloodRequests: async (filters: RequestFilters = {}): Promise<PaginatedResponse<BloodDonationRequest>> => {
    const response = await apiClient.get('/blood-donation/requests', { params: filters });
    return response.data;
  },

  getUrgentRequests: async (): Promise<BloodDonationApiResponse<BloodDonationRequest[]>> => {
    const response = await apiClient.get('/blood-donation/requests/urgent');
    return response.data;
  },

  approveBloodRequest: async (requestId: string): Promise<BloodDonationApiResponse<BloodDonationRequest>> => {
    const response = await apiClient.patch(`/blood-donation/requests/${requestId}/approve`);
    return response.data;
  },

  cancelBloodRequest: async (requestId: string): Promise<BloodDonationApiResponse<BloodDonationRequest>> => {
    const response = await apiClient.patch(`/blood-donation/requests/${requestId}/cancel`);
    return response.data;
  },

  fulfillBloodRequest: async (requestId: string): Promise<BloodDonationApiResponse<BloodDonationRequest>> => {
    const response = await apiClient.patch(`/blood-donation/requests/${requestId}/fulfill`);
    return response.data;
  },

  // Blood Inventory Management
  getBloodInventory: async (centerId?: string, bloodType?: string): Promise<BloodDonationApiResponse<BloodInventory[]>> => {
    const params: any = {};
    if (centerId) params.centerId = centerId;
    if (bloodType) params.bloodType = bloodType;
    
    const response = await apiClient.get('/blood-donation/inventory', { params });
    return response.data;
  },

  getCenterInventory: async (centerId: string): Promise<BloodDonationApiResponse<BloodInventory[]>> => {
    const response = await apiClient.get(`/blood-donation/inventory/center/${centerId}`);
    return response.data;
  },

  getLowInventoryAlerts: async (): Promise<BloodDonationApiResponse<BloodInventory[]>> => {
    const response = await apiClient.get('/blood-donation/inventory/low-alerts');
    return response.data;
  },

  checkBloodAvailability: async (centerId: string, bloodType: string, units: number): Promise<BloodDonationApiResponse<{ available: boolean; units: number }>> => {
    const response = await apiClient.get(`/blood-donation/inventory/availability/${centerId}/${bloodType}/${units}`);
    return response.data;
  },

  reserveBloodUnits: async (centerId: string, bloodType: string, units: number): Promise<BloodDonationApiResponse<BloodInventory>> => {
    const response = await apiClient.patch(`/blood-donation/inventory/reserve/${centerId}/${bloodType}/${units}`);
    return response.data;
  },

  // Blood Donation Management
  createBloodDonation: async (data: CreateBloodDonationDto): Promise<BloodDonationApiResponse<BloodDonation>> => {
    const response = await apiClient.post('/blood-donation/donations', data);
    return response.data;
  },

  getAllDonations: async (): Promise<BloodDonationApiResponse<BloodDonation[]>> => {
    const response = await apiClient.get('/blood-donation/donations');
    return response.data;
  },

  getMyDonations: async (): Promise<BloodDonationApiResponse<BloodDonation[]>> => {
    const response = await apiClient.get('/blood-donation/donations/my-donations');
    return response.data;
  },

  completeDonation: async (donationId: string): Promise<BloodDonationApiResponse<BloodDonation>> => {
    const response = await apiClient.patch(`/blood-donation/donations/${donationId}/complete`);
    return response.data;
  },

  cancelDonation: async (donationId: string): Promise<BloodDonationApiResponse<BloodDonation>> => {
    const response = await apiClient.patch(`/blood-donation/donations/${donationId}/cancel`);
    return response.data;
  },

  // Analytics and Dashboard Data
  getBloodDonationAnalytics: async (centerId?: string): Promise<BloodDonationApiResponse<BloodDonationAnalytics>> => {
    const params = centerId ? { centerId } : {};
    const response = await apiClient.get('/blood-donation/analytics', { params });
    return response.data;
  },

  getDonationTrends: async (months: number = 6): Promise<BloodDonationApiResponse<{ month: string; donations: number; requests: number }[]>> => {
    const response = await apiClient.get('/blood-donation/analytics/trends', { 
      params: { months } 
    });
    return response.data;
  },

  getInventoryDistribution: async (centerId?: string): Promise<BloodDonationApiResponse<{ bloodType: BloodType; availableUnits: number }[]>> => {
    const params = centerId ? { centerId } : {};
    const response = await apiClient.get('/blood-donation/analytics/inventory-distribution', { params });
    return response.data;
  },
};

export default bloodDonationService;
