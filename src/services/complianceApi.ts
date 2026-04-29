import apiClient from './apiClient';

export interface ConsentRecord {
  id: string;
  consentType: string;
  consentGiven: boolean;
  consentDate: string;
  ipAddress: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
}

export interface UserActivityResponse {
  logs: AuditLog[];
  total: number;
}

export const complianceApi = {
  getConsents: async () => {
    const response = await apiClient.get<ConsentRecord[]>('/compliance/consents');
    return response.data;
  },

  recordConsent: async (data: { consentType: string; consentGiven: boolean }) => {
    const response = await apiClient.post('/compliance/consent', data);
    return response.data;
  },

  requestDataDeletion: async (reason?: string) => {
    const response = await apiClient.post('/compliance/data-deletion', { reason });
    return response.data;
  },

  exportData: async () => {
    const response = await apiClient.get('/compliance/data-export');
    return response.data;
  },
  
  getUserActivity: async () => {
    const response = await apiClient.get<UserActivityResponse>('/compliance/activity');
    return response.data;
  },

  logAction: async (action: string, entityType: string, details: Record<string, any> = {}) => {
    try {
      const response = await apiClient.post('/compliance/log', {
        action,
        entityType,
        details,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to log compliance action:', error);
    }
  }
};
