import { useState, useEffect, useCallback } from 'react';
import { backendNotificationService, BackendNotification, NotificationFilters } from '@/services/backendNotificationService';
import { useAuth } from './useAuth';

export interface UseBackendNotificationsReturn {
  notifications: BackendNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

export function useBackendNotifications(filters?: NotificationFilters): UseBackendNotificationsReturn {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await backendNotificationService.getNotifications(filters);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, filters]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      const count = await backendNotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
      // Don't set error for unread count as it's less critical
    }
  }, [profile?.id]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    await fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await backendNotificationService.markAsRead(notificationId);
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        // Refresh unread count
        await fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [fetchUnreadCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const success = await backendNotificationService.markAllAsRead();
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        // Refresh unread count
        await fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [fetchUnreadCount]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const success = await backendNotificationService.deleteNotification(notificationId);
      if (success) {
        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Refresh unread count
        await fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [fetchUnreadCount]);

  // Initial fetch
  useEffect(() => {
    if (profile?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [profile?.id, fetchNotifications, fetchUnreadCount]);

  // Set up polling for unread count (every 30 seconds)
  useEffect(() => {
    if (!profile?.id) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [profile?.id, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
