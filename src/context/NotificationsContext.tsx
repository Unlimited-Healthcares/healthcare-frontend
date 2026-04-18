import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { useNotificationWebSocket } from "@/hooks/useNotificationWebSocket";
import { useAuth } from "@/hooks/useAuth";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Create context for notifications
const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => { },
  markAsRead: () => { },
  markAllAsRead: () => { },
  clearNotifications: () => { },
});

// Provider component
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notificationsData = useNotifications();
  const { user } = useAuth();
  const token = localStorage.getItem('authToken');

  // Handle incoming real-time notifications
  const handleNotification = useCallback((notification: any) => {
    console.log('Real-time notification received in Context:', notification);
    notificationsData.addNotification({
      title: notification.title,
      message: notification.message,
      type: notification.notificationType || 'system',
      // Pass isUrgent as a custom property if needed, though addNotification handles it internally now
      isUrgent: notification.isUrgent
    } as any);
  }, [notificationsData.addNotification]);

  // Handle urgent alerts (e.g. Emergencies)
  const handleUrgentAlert = useCallback((alert: any) => {
    console.log('Urgent alert received in Context:', alert);
    notificationsData.addNotification({
      title: `🚨 ${alert.title}`,
      message: alert.message,
      type: 'emergency',
      isUrgent: true
    } as any);
  }, [notificationsData.addNotification]);

  // Initialize WebSocket connection
  useNotificationWebSocket({
    token: token || '',
    userId: user?.id || '',
    onNotification: handleNotification,
    onUrgentAlert: handleUrgentAlert,
    onSystemNotification: (sys) => {
      notificationsData.addNotification({
        title: sys.title,
        message: sys.message,
        type: 'system'
      });
    },
    onConnectionChange: (connected) => {
      if (connected) {
        console.log('✅ Real-time notifications active');
      }
    }
  });

  return (
    <NotificationsContext.Provider value={notificationsData}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Hook to use notifications context
// eslint-disable-next-line react-refresh/only-export-components
export const useNotificationsContext = () => useContext(NotificationsContext);
