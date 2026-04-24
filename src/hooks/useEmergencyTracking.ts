import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_IO_PATH, getSocketBaseUrl } from '@/lib/websocket-utils';
import type { GenericObject } from '@/types/common';
import { useAuth } from '@/hooks/useAuth';

interface EmergencyTrackingHook {
  isConnected: boolean;
  sendLocationUpdate: (ambulanceId: string, latitude: number, longitude: number) => void;
  sendRequestStatusUpdate: (requestId: string, status: string, data?: GenericObject) => void;
  sendAlertStatusUpdate: (alertId: string, status: string, data?: GenericObject) => void;
  subscribe: (eventType: string, callback: (data: GenericObject) => void) => void;
  unsubscribe: (eventType: string, callback?: (data: GenericObject) => void) => void;
  watchRequest: (requestId: string) => void;
  unwatchRequest: (requestId: string) => void;
}

export function useEmergencyTracking(): EmergencyTrackingHook {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const subscribersRef = useRef<Map<string, Set<(data: GenericObject) => void>>>(new Map());

  useEffect(() => {
    const baseUrl = getSocketBaseUrl();
    const socket = io(`${baseUrl}/emergency`, {
      path: SOCKET_IO_PATH,
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (user) {
        socket.emit('authenticate', { userId: user.id });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    const handleEvent = (event: string, data: any) => {
      const subscribers = subscribersRef.current.get(event);
      if (subscribers) {
        subscribers.forEach(callback => callback(data));
      }
    };

    socket.on('ambulance_location_update', (data) => handleEvent('ambulance_location_update', data));
    socket.on('request_status_update', (data) => handleEvent('request_status_update', data));
    socket.on('alert_status_update', (data) => handleEvent('alert_status_update', data));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const watchRequest = useCallback((requestId: string) => {
    socketRef.current?.emit('watch_request', { requestId });
  }, []);

  const unwatchRequest = useCallback((requestId: string) => {
    socketRef.current?.emit('unwatch_request', { requestId });
  }, []);

  const sendLocationUpdate = (ambulanceId: string, latitude: number, longitude: number) => {
    socketRef.current?.emit('ambulance_location', { ambulanceId, data: { latitude, longitude } });
  };

  const sendRequestStatusUpdate = (requestId: string, status: string, data: GenericObject = {}) => {
    socketRef.current?.emit('request_status', { requestId, data: { status, ...data } });
  };

  const sendAlertStatusUpdate = (alertId: string, status: string, data: GenericObject = {}) => {
    socketRef.current?.emit('alert_status', { alertId, data: { status, ...data } });
  };

  const subscribe = (eventType: string, callback: (data: GenericObject) => void) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set());
    }
    subscribersRef.current.get(eventType)!.add(callback);
  };

  const unsubscribe = (eventType: string, callback?: (data: GenericObject) => void) => {
    if (callback) {
      subscribersRef.current.get(eventType)?.delete(callback);
    } else {
      subscribersRef.current.delete(eventType);
    }
  };

  return {
    isConnected,
    sendLocationUpdate,
    sendRequestStatusUpdate,
    sendAlertStatusUpdate,
    subscribe,
    unsubscribe,
    watchRequest,
    unwatchRequest
  };
}

