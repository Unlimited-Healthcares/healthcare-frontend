import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket';
import { notificationService } from '@/services/notificationService';
import {
  Notification,
  NotificationKPIs,
  NotificationFilters,
  NotificationPreference,
  AlertData,
  SystemNotification
} from '@/types/notifications';
import { NotificationHeader } from '@/components/notifications/NotificationHeader';
import { NotificationKPIs as NotificationKPIsComponent } from '@/components/notifications/NotificationKPIs';
import { NotificationFilters as NotificationFiltersComponent } from '@/components/notifications/NotificationFilters';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationSidebar } from '@/components/notifications/NotificationSidebar';
import { SchedulingCalendar } from '@/components/dashboard/SchedulingCalendar';
import { toast } from 'sonner';

const NotificationsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [kpis, setKpis] = useState<NotificationKPIs>({
    totalNotifications: 0,
    totalNotificationsChange: 0,
    unreadNotifications: 0,
    unreadNotificationsChange: 0,
    criticalNotifications: 0,
    criticalNotificationsChange: 0,
    todayNotifications: 0,
    todayNotificationsChange: 0,
    deliveryRate: 0,
    deliveryRateChange: 0,
    averageResponseTime: 0,
    averageResponseTimeChange: 0
  });
  const [, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const [filters, setFilters] = useState<NotificationFilters>(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');
    const view = (viewParam === 'calendar' || viewParam === 'grid' || viewParam === 'list')
      ? viewParam
      : 'list';

    return {
      page: 1,
      limit: 20,
      view
    };
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket handlers
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setKpis(prev => ({
      ...prev,
      totalNotifications: prev.totalNotifications + 1,
      unreadNotifications: prev.unreadNotifications + 1
    }));
    toast.success(`New ${notification.type} notification received`);
  }, []);

  const handleUrgentAlert = useCallback((alert: AlertData) => {
    toast.error(`URGENT: ${alert.title}`, {
      description: alert.message,
      duration: 10000
    });
    setKpis(prev => ({
      ...prev,
      criticalNotifications: prev.criticalNotifications + 1
    }));
  }, []);

  const handleSystemNotification = useCallback((notification: SystemNotification) => {
    toast.info(`System: ${notification.title}`, {
      description: notification.message
    });
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
    if (connected) {
      toast.success('Connected to real-time notifications');
    } else {
      toast.warning('Disconnected from real-time notifications');
    }
  }, []);

  // WebSocket integration
  const token = localStorage.getItem('authToken') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') || '';
  useNotificationWebSocket({
    token,
    userId: user?.id || '',
    onNotification: handleNewNotification,
    onUrgentAlert: handleUrgentAlert,
    onSystemNotification: handleSystemNotification,
    onConnectionChange: handleConnectionChange
  });

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [notificationsData, unreadData, kpisData, preferencesData] = await Promise.all([
        notificationService.getNotifications(filters),
        notificationService.getUnreadCount(),
        notificationService.getNotificationKPIs(),
        notificationService.getNotificationPreferences()
      ]);

      setNotifications(notificationsData.notifications || []);
      setKpis(kpisData);
      setPreferences(preferencesData);

      setPagination({
        page: notificationsData.page || 1,
        limit: notificationsData.limit || 20,
        total: notificationsData.total || 0,
        totalPages: notificationsData.totalPages || 0
      });

      // Update KPIs with real unread count
      setKpis(prev => ({
        ...prev,
        unreadNotifications: unreadData.count || 0
      }));

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle view change
  const handleViewChange = (view: 'list' | 'calendar' | 'grid') => {
    setFilters(prev => ({ ...prev, view }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n)
      );
      setKpis(prev => ({
        ...prev,
        unreadNotifications: Math.max(0, prev.unreadNotifications - 1)
      }));
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setKpis(prev => ({
        ...prev,
        unreadNotifications: 0
      }));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      if (deletedNotification && !deletedNotification.isRead) {
        setKpis(prev => ({
          ...prev,
          unreadNotifications: Math.max(0, prev.unreadNotifications - 1)
        }));
      }

      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));

      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  // Delete all notifications
  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setKpis(prev => ({
        ...prev,
        totalNotifications: 0,
        unreadNotifications: 0,
        criticalNotifications: 0,
        todayNotifications: 0
      }));
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0
      }));
      toast.success('All notifications deleted');
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      toast.error('Failed to delete all notifications');
    }
  };

  // Export notifications
  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon');
  };

  // Open preferences
  const handleOpenPreferences = () => {
    // TODO: Implement preferences modal
    toast.info('Preferences modal coming soon');
  };

  // Send test notification
  const handleSendTestNotification = async (type: string) => {
    try {
      await notificationService.sendTestNotification(type);
      toast.success(`Test ${type} notification sent`);
      // Refresh notifications to show the test notification
      loadDashboardData();
    } catch (err) {
      console.error('Error sending test notification:', err);
      toast.error('Failed to send test notification');
    }
  };

  const userRole = profile?.role || 'patient';

  if (loading && notifications.length === 0) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 pb-28 md:pb-0">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Header */}
            <NotificationHeader
              onViewChange={handleViewChange}
              currentView={filters.view || 'list'}
              unreadCount={kpis.unreadNotifications}
              onMarkAllRead={handleMarkAllAsRead}
              onDeleteAll={handleDeleteAll}
              onOpenPreferences={handleOpenPreferences}
              isConnected={isConnected}
            />

            {/* KPIs */}
            <NotificationKPIsComponent kpis={kpis} loading={loading} />

            {/* Main Content */}
            {filters.view === 'calendar' ? (
              <SchedulingCalendar />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Filters */}
                  <NotificationFiltersComponent
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onExport={handleExport}
                    onOpenPreferences={handleOpenPreferences}
                    unreadCount={kpis.unreadNotifications}
                  />

                  {/* Notifications List */}
                  <NotificationList
                    notifications={notifications}
                    loading={loading}
                    error={error}
                    pagination={pagination}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    onPageChange={handlePageChange}
                  />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <NotificationSidebar
                    userRole={userRole}
                    onOpenPreferences={handleOpenPreferences}
                    onSendTestNotification={handleSendTestNotification}
                    onMarkAllRead={handleMarkAllAsRead}
                    unreadCount={kpis.unreadNotifications}
                    recentNotifications={notifications.slice(0, 5)}
                    typeCounts={kpis.typeCounts}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default NotificationsPage;
