import { apiClient } from '@/lib/api-client';

export const auditService = {
  logAction: async (action: string, recordId?: string, details?: any) => {
    try {
      await apiClient.post('/medical-records/log', {
        action,
        recordId,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Failed to log clinical action:', error);
    }
  },

  getAuditLogs: async (params?: any) => {
    try {
      const response = await apiClient.get<any>('/analytics/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch audit logs:', error);
      throw error;
    }
  }
};
