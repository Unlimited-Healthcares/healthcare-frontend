import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_IO_PATH, buildNamespaceUrl, shouldForceWebsocketOnly } from '@/lib/websocket-utils';
import { Notification, AlertData, SystemNotification } from '@/types/notifications';

interface UseNotificationWebSocketProps {
  token: string;
  userId: string;
  onNotification: (notification: Notification) => void;
  onUrgentAlert: (alert: AlertData) => void;
  onSystemNotification: (notification: SystemNotification) => void;
  onConnectionChange: (connected: boolean) => void;
}

const playNotificationSound = (isUrgent: boolean = false) => {
  try {
    const audio = new Audio(
      isUrgent
        ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' // Urgent
        : 'https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3' // Normal
    );
    audio.volume = 0.5;
    audio.play().catch(e => console.warn('Audio play failed (possibly blocked by browser):', e));
  } catch (err) {
    console.error('Failed to play sound:', err);
  }
};

export const useNotificationWebSocket = ({
  token,
  userId,
  onNotification,
  onUrgentAlert,
  onSystemNotification,
  onConnectionChange
}: UseNotificationWebSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const wsUrl = buildNamespaceUrl('/notifications');
    const options: Parameters<typeof io>[1] = {
      path: SOCKET_IO_PATH,
      transports: ['websocket', 'polling']
    };
    socketRef.current = io(wsUrl, options);

    socketRef.current.on('connect', () => {
      console.log('Connected to notification WebSocket');
      authenticate();
    });

    socketRef.current.on('authenticated', (data) => {
      console.log('🔐 Notification WebSocket authenticated:', data);
      onConnectionChange(true);
    });

    socketRef.current.on('notification', (notification: Notification) => {
      console.log('New notification received:', notification);
      playNotificationSound();
      onNotification(notification);
    });

    socketRef.current.on('urgent_alert', (alert: AlertData) => {
      console.log('Urgent alert received:', alert);
      playNotificationSound(true); // Urgent sound
      onUrgentAlert(alert);
    });

    socketRef.current.on('system_notification', (notification: SystemNotification) => {
      console.log('System notification received:', notification);
      playNotificationSound();
      onSystemNotification(notification);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from notification WebSocket');
      onConnectionChange(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      onConnectionChange(false);
    });
  }, [token, userId, onNotification, onUrgentAlert, onSystemNotification, onConnectionChange]);

  const authenticate = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('authenticate', {
        userId,
        token
      });
    }
  }, [userId, token]);

  const joinCenter = useCallback((centerId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_center', { centerId });
    }
  }, []);

  const leaveCenter = useCallback((centerId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_center', { centerId });
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (token && userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, userId, connect, disconnect]);

  return {
    connect,
    disconnect,
    joinCenter,
    leaveCenter,
    isConnected: socketRef.current?.connected || false
  };
};
