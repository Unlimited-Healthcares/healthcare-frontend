import { apiClient } from '@/lib/api-client';

export type DeliveryMethod = 'none' | 'email' | 'push' | 'both';

export interface NotificationPreference {
  id: string;
  userId: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  medicalRecordRequest: DeliveryMethod;
  medicalRecordAccess: DeliveryMethod;
  recordShareExpiring: DeliveryMethod;
  appointment: DeliveryMethod;
  message: DeliveryMethod;
  system: DeliveryMethod;
  referral: DeliveryMethod;
  testResult: DeliveryMethod;
  payment: DeliveryMethod;
  marketing: DeliveryMethod;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
}

export interface UpdateNotificationPreferencesDto {
  medicalRecordRequest?: DeliveryMethod;
  medicalRecordAccess?: DeliveryMethod;
  recordShareExpiring?: DeliveryMethod;
  appointment?: DeliveryMethod;
  message?: DeliveryMethod;
  system?: DeliveryMethod;
  referral?: DeliveryMethod;
  testResult?: DeliveryMethod;
  payment?: DeliveryMethod;
  marketing?: DeliveryMethod;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
}

export const notificationApi = {
  getPreferences: async (): Promise<NotificationPreference> => {
    return apiClient.get<NotificationPreference>('/notifications/preferences');
  },
  
  updatePreferences: async (data: UpdateNotificationPreferencesDto): Promise<NotificationPreference> => {
    return apiClient.put<NotificationPreference>('/notifications/preferences', data);
  }
};
