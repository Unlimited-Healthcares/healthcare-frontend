import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { GenericObject } from '@/types/common';

interface TrackingMessage {
  type: string;
  data?: GenericObject;
  ambulanceId?: string;
  requestId?: string;
  alertId?: string;
  timestamp?: string;
  message?: string;
}

interface EmergencyTrackingHook {
  isConnected: boolean;
  sendLocationUpdate: (ambulanceId: string, latitude: number, longitude: number) => void;
  sendRequestStatusUpdate: (requestId: string, status: string, data?: GenericObject) => void;
  sendAlertStatusUpdate: (alertId: string, status: string, data?: GenericObject) => void;
  subscribe: (eventType: string, callback: (data: GenericObject) => void) => void;
  unsubscribe: (eventType: string, callback?: (data: GenericObject) => void) => void;
}

export function useEmergencyTracking(): EmergencyTrackingHook {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: GenericObject) => void>>>(new Map());

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const wsUrl = process.env.VITE_EMERGENCY_WS_URL || 'ws://localhost:8080/emergency-tracking';
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('Emergency tracking WebSocket connected');
          setIsConnected(true);
          toast.success('Emergency tracking connected');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
              case 'connection_established':
                console.log('Emergency tracking connection established');
                break;
              case 'ambulance_location_update':
              case 'request_status_update':
              case 'alert_status_update': {
                // Notify subscribers
                const subscribers = subscribersRef.current.get(message.type);
                if (subscribers) {
                  subscribers.forEach(callback => callback(message.data));
                }
                break;
              }
              case 'error':
                console.error('WebSocket error:', message.message);
                toast.error(`Tracking error: ${message.message}`);
                break;
              default:
                console.log('Received message:', message);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        wsRef.current.onclose = () => {
          console.log('Emergency tracking WebSocket disconnected');
          setIsConnected(false);
          toast.info('Emergency tracking disconnected');
          
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
          toast.error('Emergency tracking connection error');
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        toast.error('Failed to connect to emergency tracking');
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: TrackingMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Message not sent:', message);
      toast.warning('Emergency tracking not connected');
    }
  };

  const sendLocationUpdate = (ambulanceId: string, latitude: number, longitude: number) => {
    sendMessage({
      type: 'ambulance_location',
      ambulanceId,
      data: { latitude, longitude }
    });
  };

  const sendRequestStatusUpdate = (requestId: string, status: string, data: GenericObject = {}) => {
    sendMessage({
      type: 'request_status',
      requestId,
      data: { status, ...data }
    });
  };

  const sendAlertStatusUpdate = (alertId: string, status: string, data: GenericObject = {}) => {
    sendMessage({
      type: 'alert_status',
      alertId,
      data: { status, ...data }
    });
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
    unsubscribe
  };
}
