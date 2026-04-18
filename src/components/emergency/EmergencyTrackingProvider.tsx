import { createContext, useContext, ReactNode } from 'react';
import { useEmergencyTracking } from '@/hooks/useEmergencyTracking';
import type { GenericObject } from '@/types/common';

interface EmergencyTrackingContextType {
  isConnected: boolean;
  sendLocationUpdate: (ambulanceId: string, latitude: number, longitude: number) => void;
  sendRequestStatusUpdate: (requestId: string, status: string, data?: GenericObject) => void;
  sendAlertStatusUpdate: (alertId: string, status: string, data?: GenericObject) => void;
  subscribe: (eventType: string, callback: (data: GenericObject) => void) => void;
  unsubscribe: (eventType: string, callback?: (data: GenericObject) => void) => void;
}

const EmergencyTrackingContext = createContext<EmergencyTrackingContextType | undefined>(undefined);

interface EmergencyTrackingProviderProps {
  children: ReactNode;
}

export function EmergencyTrackingProvider({ children }: EmergencyTrackingProviderProps) {
  const emergencyTracking = useEmergencyTracking();

  return (
    <EmergencyTrackingContext.Provider value={emergencyTracking}>
      {children}
    </EmergencyTrackingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEmergencyTrackingContext() {
  const context = useContext(EmergencyTrackingContext);
  if (context === undefined) {
    throw new Error('useEmergencyTrackingContext must be used within an EmergencyTrackingProvider');
  }
  return context;
}
