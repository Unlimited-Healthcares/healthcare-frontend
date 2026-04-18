import {
  Notification,
  NotificationResponse,
  NotificationKPIs,
  NotificationPreference,
  CreateNotificationDto,
  GetNotificationsDto,
  UpdateNotificationPreferencesDto
} from '@/types/notifications';

import { apiClient } from '@/lib/api-client';

class NotificationService {
  // Notification Management
  async getNotifications(filters: GetNotificationsDto = {}): Promise<NotificationResponse> {
    // Strip frontend-only or currently unsupported parameters to prevent backend validation errors
    const { dateFrom, dateTo, ...apiFilters } = filters as any;
    const cleanFilters = { ...apiFilters };
    delete cleanFilters.view; // Frontend only view state

    const response = await apiClient.get<any>('/notifications', { params: cleanFilters });
    return response?.data || response;
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get<any>('/notifications/unread-count');
    return response?.data || response;
  }

  async createNotification(notificationData: CreateNotificationDto): Promise<Notification> {
    const response = await apiClient.post<any>('/notifications', notificationData);
    return response?.data || response;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.put<any>(`/notifications/${notificationId}/read`, null);
    return response?.data || response;
  }

  async markAllAsRead(): Promise<boolean> {
    const response = await apiClient.put<any>('/notifications/mark-all-read', null);
    return response?.success || !!response;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    const response = await apiClient.delete<any>(`/notifications/${notificationId}`);
    return response?.success || !!response;
  }

  async deleteAllNotifications(): Promise<boolean> {
    const response = await apiClient.delete<any>('/notifications/clear-all');
    return response?.success || !!response;
  }

  // Preferences Management
  async getNotificationPreferences(): Promise<NotificationPreference> {
    const response = await apiClient.get<any>('/notifications/preferences');
    return response?.data || response;
  }

  async updateNotificationPreferences(preferences: UpdateNotificationPreferencesDto): Promise<NotificationPreference> {
    const response = await apiClient.put<any>('/notifications/preferences', preferences);
    return response?.data || response;
  }

  // Testing
  async sendTestNotification(type: string): Promise<boolean> {
    const response = await apiClient.post<any>(`/notifications/test/${type}`, null);
    return response?.success || !!response;
  }

  // Analytics and KPIs
  async getNotificationKPIs(): Promise<NotificationKPIs> {
    const response = await apiClient.get<any>('/notifications/kpis');
    return response?.data || response;
  }

  // Utility methods
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'appointment': return '📅';
      case 'medical_record': return '📋';
      case 'system': return '⚙️';
      case 'referral': return '🔄';
      case 'payment': return '💳';
      case 'test_result': return '🧪';
      case 'message': return '💬';
      case 'emergency': return '🚨';
      default: return '🔔';
    }
  }

  getNotificationColor(type: string, isUrgent: boolean): string {
    if (isUrgent) return '#ff4444';
    switch (type) {
      case 'emergency': return '#ff4444';
      case 'appointment': return '#4CAF50';
      case 'medical_record': return '#2196F3';
      case 'system': return '#9C27B0';
      case 'referral': return '#FF9800';
      case 'payment': return '#795548';
      case 'test_result': return '#00BCD4';
      case 'message': return '#607D8B';
      default: return '#757575';
    }
  }

  formatTimeAgo(dateInput: Date | string): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // Safety check for invalid dates
    if (!date || isNaN(date.getTime())) {
      return 'just now';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'less than a minute ago';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `about ${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `about ${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}

export const notificationService = new NotificationService();