
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'message' | 'system' | 'emergency';
  isRead: boolean;
  isUrgent?: boolean;
  timestamp: Date;
  link?: string;
  sender?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Add notification to the list
  const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
    const isEmergency = notification.type === 'error' || notification.type === 'emergency' || (notification as any).isUrgent;
    
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      isRead: false,
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // 🔊 Play Sound and 📳 Vibrate for notifications
    try {
      const isEmergency = notification.type === 'error' || notification.type === 'emergency' || (notification as any).isUrgent;
      // Use different sounds or just the same beep for now
      // Emergency gets a louder/longer sound if needed, but for now we'll use same beep
      const audio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3');
      audio.play().catch(e => console.warn('Audio play blocked (requires user interaction):', e));
      
      if ('vibrate' in navigator) {
        if (isEmergency) {
          navigator.vibrate([300, 100, 300, 100, 300]);
        } else {
          navigator.vibrate(200);
        }
      }
    } catch (err) {
      console.error('Failed to trigger alert feedback:', err);
    }

    // Show toast for new notification
    toast({
      title: `${isEmergency ? '🚨 ' : ''}${notification.title}`,
      description: notification.message,
      variant: notification.type === 'error' || notification.type === 'emergency' ? 'destructive' : 'default',
    });
  };
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
