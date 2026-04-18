import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface AnalyticsEvent {
  user_id?: string;
  center_id?: string;
  event_type: string;
  event_category: string;
  event_data?: Json;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  page_url?: string;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackEvent(eventData: Omit<AnalyticsEvent, 'session_id'>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const event: AnalyticsEvent = {
        ...eventData,
        user_id: user?.id || undefined,
        session_id: this.sessionId,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase.rpc('track_analytics_event', {
        p_user_id: event.user_id || "",
        p_center_id: event.center_id || "",
        p_event_type: event.event_type,
        p_event_category: event.event_category,
        p_event_data: event.event_data,
        p_session_id: event.session_id,
        p_ip_address: null, // IP will be captured server-side
        p_user_agent: event.user_agent,
        p_page_url: event.page_url
      });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error: unknown) {
      console.error('Analytics service error:', error);
    }
  }

  // Convenience methods for common events
  async trackPageView(page: string, centerId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'page_view',
      event_category: 'navigation',
      center_id: centerId,
      event_data: { page }
    });
  }

  async trackUserAction(action: string, target: string, centerId?: string, additionalData?: Json): Promise<void> {
    const eventData: Json = additionalData && typeof additionalData === 'object' && !Array.isArray(additionalData)
      ? { target, ...additionalData }
      : { target, additionalData };
      
    await this.trackEvent({
      event_type: action,
      event_category: 'user_action',
      center_id: centerId,
      event_data: eventData
    });
  }

  async trackAppointmentEvent(action: string, appointmentId: string, centerId?: string): Promise<void> {
    await this.trackEvent({
      event_type: `appointment_${action}`,
      event_category: 'appointment',
      center_id: centerId,
      event_data: { appointment_id: appointmentId }
    });
  }

  async trackMedicalRecordEvent(action: string, recordId: string, centerId?: string): Promise<void> {
    await this.trackEvent({
      event_type: `record_${action}`,
      event_category: 'medical_record',
      center_id: centerId,
      event_data: { record_id: recordId }
    });
  }

  async trackError(error: string, context?: string, centerId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'error',
      event_category: 'error',
      center_id: centerId,
      event_data: { error, context }
    });
  }

  async recordMetric(metricName: string, value: number, unit?: string, tags?: Json, centerId?: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('record_metric', {
        p_metric_name: metricName,
        p_metric_type: 'gauge',
        p_metric_value: value,
        p_metric_unit: unit,
        p_tags: tags,
        p_center_id: centerId
      });

      if (error) {
        console.error('Metric recording error:', error);
      }
    } catch (error: unknown) {
      console.error('Metric service error:', error);
    }
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();
