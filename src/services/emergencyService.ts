
import {
  EmergencyAlert,
  AmbulanceRequest,
  ViralReport,
  EmergencyKPIs,
  AlertFilters,
  AmbulanceRequestFilters,
  ViralReportFilters,
  CreateSOSAlertDto,
  CreateAmbulanceRequestDto,
  CreateViralReportDto,
  EmergencyAlertsResponse,
  AmbulanceRequestsResponse,
  ViralReportsResponse,
  EmergencyContact
} from '@/types/emergency';
import apiClient from '@/services/apiClient';

// Using unified API client for all requests

export const emergencyService = {
  // Emergency Alerts
  sendSOSAlert: async (data: CreateSOSAlertDto): Promise<EmergencyAlert> => {
    const response = await apiClient.post('/emergency/alerts/sos', data);
    return response.data;
  },

  getEmergencyAlerts: async (filters: AlertFilters = {}): Promise<EmergencyAlertsResponse> => {
    const response = await apiClient.get('/emergency/alerts', { params: filters });
    return response.data;
  },

  getEmergencyAlert: async (alertId: string): Promise<EmergencyAlert> => {
    const response = await apiClient.get(`/emergency/alerts/${alertId}`);
    return response.data;
  },

  acknowledgeAlert: async (alertId: string): Promise<EmergencyAlert> => {
    const response = await apiClient.put(`/emergency/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  resolveAlert: async (alertId: string, data: { resolutionNotes?: string }): Promise<EmergencyAlert> => {
    const response = await apiClient.put(`/emergency/alerts/${alertId}/resolve`, data);
    return response.data;
  },

  // Ambulance Services
  requestAmbulance: async (data: CreateAmbulanceRequestDto): Promise<AmbulanceRequest> => {
    const response = await apiClient.post('/emergency/ambulance/request', data);
    return response.data;
  },

  getAmbulanceRequests: async (filters: AmbulanceRequestFilters = {}): Promise<AmbulanceRequestsResponse> => {
    const response = await apiClient.get('/emergency/ambulance/requests', { params: filters });
    return response.data;
  },

  getAmbulanceRequest: async (requestId: string): Promise<AmbulanceRequest> => {
    const response = await apiClient.get(`/emergency/ambulance/requests/${requestId}`);
    return response.data;
  },

  getAvailableAmbulances: async (latitude?: number, longitude?: number): Promise<any[]> => {
    const params: any = {};
    if (latitude !== undefined) params.latitude = latitude;
    if (longitude !== undefined) params.longitude = longitude;

    const response = await apiClient.get('/emergency/ambulance/available', { params });
    return response.data;
  },

  updateRequestStatus: async (requestId: string, data: any): Promise<AmbulanceRequest> => {
    const response = await apiClient.put(`/emergency/ambulance/requests/${requestId}/status`, data);
    return response.data;
  },

  // Viral Reporting
  submitViralReport: async (data: CreateViralReportDto): Promise<ViralReport> => {
    const response = await apiClient.post('/emergency/viral-reporting/reports', data);
    return response.data;
  },

  getViralReports: async (filters: ViralReportFilters = {}): Promise<ViralReportsResponse> => {
    const response = await apiClient.get('/emergency/viral-reporting/reports', { params: filters });
    return response.data;
  },

  getViralReport: async (reportId: string): Promise<ViralReport> => {
    const response = await apiClient.get(`/emergency/viral-reporting/reports/${reportId}`);
    return response.data;
  },

  updateReportStatus: async (reportId: string, data: { status: string; investigationNotes?: string }): Promise<ViralReport> => {
    const response = await apiClient.put(`/emergency/viral-reporting/reports/${reportId}/status`, data);
    return response.data;
  },

  // Emergency KPIs
  getEmergencyKPIs: async (): Promise<EmergencyKPIs> => {
    const response = await apiClient.get('/emergency/kpis');
    return response.data;
  },

  // Dashboard Data (combined endpoint for efficiency)
  getDashboardData: async (): Promise<{
    alerts: EmergencyAlertsResponse;
    ambulanceRequests: AmbulanceRequestsResponse;
    viralReports: ViralReportsResponse;
    kpis: EmergencyKPIs;
  }> => {
    const response = await apiClient.get('/emergency/dashboard');
    return response.data;
  },

  // Location Tracking
  getAmbulanceLocation: async (ambulanceId: string): Promise<any> => {
    const response = await apiClient.get(`/location/history/ambulance/${ambulanceId}`);
    return response.data;
  },

  // Emergency Contacts
  getEmergencyContacts: async (): Promise<EmergencyContact[]> => {
    const response = await apiClient.get('/emergency/alerts/emergency-contacts');
    return response.data;
  },

  addEmergencyContact: async (data: any): Promise<EmergencyContact> => {
    const response = await apiClient.post('/emergency/alerts/emergency-contacts', data);
    return response.data;
  }
};

export default emergencyService;
