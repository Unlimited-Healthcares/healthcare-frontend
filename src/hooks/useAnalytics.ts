import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/services/analyticsService';
import { Json } from '@/types/database.types';

export function useAnalytics(centerId?: string) {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    analytics.trackPageView(location.pathname, centerId);
  }, [location.pathname, centerId]);

  return {
    trackUserAction: (action: string, target: string, additionalData?: Json) =>
      analytics.trackUserAction(action, target, centerId, additionalData),
    
    trackAppointmentEvent: (action: string, appointmentId: string) =>
      analytics.trackAppointmentEvent(action, appointmentId, centerId),
    
    trackMedicalRecordEvent: (action: string, recordId: string) =>
      analytics.trackMedicalRecordEvent(action, recordId, centerId),
    
    trackError: (error: string, context?: string) =>
      analytics.trackError(error, context, centerId),
    
    recordMetric: (metricName: string, value: number, unit?: string, tags?: Json) =>
      analytics.recordMetric(metricName, value, unit, tags, centerId)
  };
}
