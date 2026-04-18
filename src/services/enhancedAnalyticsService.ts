import { supabase } from '@/lib/supabase-client';
import type { Database, Json } from '@/integrations/supabase/types';
import { GenericObject } from '@/types/common';

type SystemMetrics = Database['public']['Tables']['system_metrics'];
type AnalyticsEvents = Database['public']['Tables']['analytics_events'];

export interface AnalyticsData {
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    trend: number;
  };
  referrals: {
    total: number;
    incoming: number;
    outgoing: number;
    completed: number;
    trend: number;
  };
  patients: {
    total: number;
    new_this_month: number;
    active: number;
    trend: number;
  };
  medical_records: {
    total: number;
    shared: number;
    requests: number;
    trend: number;
  };
}

export interface ReferralAnalytics {
  month: string | null;
  from_center_id: string | null;
  to_center_id: string | null;
  status: string | null;
  count: number | null;
  is_facility_referral: boolean | null;
  avg_processing_time_hours: number | null;
}

export interface SystemMetric {
  id: string;
  metric_name: string;
  metric_type: string;
  metric_value: number;
  metric_unit?: string | null | undefined;
  tags?: Json | null;
  center_id?: string | null;
  timestamp: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_data: Record<string, any>;
  event_category?: string;
  user_id?: string;
  center_id?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}


export interface AnalyticsSummary {
  totalAppointments: number;
  totalReferrals: number;
  totalPatients: number;
  totalMedicalRecords: number;
  totalMedicalShares: number;
  totalMedicalRequests: number;
  averageResponseTime: number;
  systemUptime: number;
}

export const enhancedAnalyticsService = {
  /**
   * Get dashboard analytics for a center
   */
  async getDashboardAnalytics(centerId: string): Promise<AnalyticsData> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return {
          appointments: { total: 0, completed: 0, cancelled: 0, pending: 0, trend: 0 },
          referrals: { total: 0, incoming: 0, outgoing: 0, completed: 0, trend: 0 },
          patients: { total: 0, new_this_month: 0, active: 0, trend: 0 },
          medical_records: { total: 0, shared: 0, requests: 0, trend: 0 }
        };
      }

      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      // Get appointments data
      const { data: appointments } = await supabase
        .from('appointments')
        .select('status, created_at')
        .eq('center_id', centerId);

      // Get referrals data
      const { data: referrals } = await supabase
        .from('referrals')
        .select('status, created_at, from_center_id, to_center_id')
        .or(`from_center_id.eq.${centerId},to_center_id.eq.${centerId}`);

      // Get patients data
      const { data: patients } = await supabase
        .from('patients')
        .select('created_at, status');

      // Get medical records data
      const { data: medicalRecords } = await supabase
        .from('medical_records')
        .select('created_at')
        .eq('created_by', centerId);

      // Get medical record shares
      const { data: medicalShares } = await supabase
        .from('medical_record_shares')
        .select('created_at')
        .or(`from_center_id.eq.${centerId},to_center_id.eq.${centerId}`);

      // Get medical record requests
      const { data: medicalRequests } = await supabase
        .from('medical_record_requests')
        .select('created_at')
        .or(`from_center_id.eq.${centerId},to_center_id.eq.${centerId}`);

      // Process appointments analytics
      const appointmentsAnalytics = {
        total: appointments?.length || 0,
        completed: appointments?.filter((a: any) => a.status === 'completed').length || 0,
        cancelled: appointments?.filter((a: any) => a.status === 'cancelled').length || 0,
        pending: appointments?.filter((a: any) => a.status === 'scheduled').length || 0,
        trend: 0 // Calculate trend if needed
      };

      // Process referrals analytics
      const referralsAnalytics = {
        total: referrals?.length || 0,
        incoming: referrals?.filter((r: any) => r.to_center_id === centerId).length || 0,
        outgoing: referrals?.filter((r: any) => r.from_center_id === centerId).length || 0,
        completed: referrals?.filter((r: any) => r.status === 'completed').length || 0,
        trend: 0
      };

      // Process patients analytics
      const patientsAnalytics = {
        total: patients?.length || 0,
        new_this_month: patients?.filter((p: any) => 
          new Date(p.created_at) >= currentMonth
        ).length || 0,
        active: patients?.filter((p: any) => p.status === 'active').length || 0,
        trend: 0
      };

      // Process medical records analytics
      const medicalRecordsAnalytics = {
        total: medicalRecords?.length || 0,
        shared: medicalShares?.length || 0,
        requests: medicalRequests?.length || 0,
        trend: 0
      };

      return {
        appointments: appointmentsAnalytics,
        referrals: referralsAnalytics,
        patients: patientsAnalytics,
        medical_records: medicalRecordsAnalytics
      };
    } catch (error: unknown) {
      console.error('Error fetching dashboard analytics:', error);
      // Return default values
      return {
        appointments: { total: 0, completed: 0, cancelled: 0, pending: 0, trend: 0 },
        referrals: { total: 0, incoming: 0, outgoing: 0, completed: 0, trend: 0 },
        patients: { total: 0, new_this_month: 0, active: 0, trend: 0 },
        medical_records: { total: 0, shared: 0, requests: 0, trend: 0 }
      };
    }
  },

  /**
   * Get referral analytics
   */
  async getReferralAnalytics(centerId: string): Promise<ReferralAnalytics[]> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return [];
      }
      const { data, error } = await supabase
        .from('referral_analytics')
        .select('*')
        .or(`from_center_id.eq.${centerId},to_center_id.eq.${centerId}`)
        .order('month', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error('Error fetching referral analytics:', error);
      return [];
    }
  },

  /**
   * Record system metric
   */
  async recordMetric(metric: Omit<SystemMetric, 'id' | 'recorded_at'>): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      const { error } = await supabase
        .from('system_metrics')
        .insert({
          ...metric,
          recorded_at: new Date().toISOString()
        } as SystemMetrics['Insert']);

      if (error) throw error;
      return true;
    } catch (error: unknown) {
      console.error('Error recording metric:', error);
      return false;
    }
  },

  /**
   * Get system metrics
   */
  async getMetrics(centerId?: string, metricName?: string, timeRange?: { start: Date; end: Date }): Promise<SystemMetric[]> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return [];
      }
      let query = supabase.from('system_metrics').select('*');

      if (centerId) {
        query = query.eq('center_id', centerId);
      }

      if (metricName) {
        query = query.eq('metric_name', metricName);
      }

      if (timeRange) {
        query = query
          .gte('recorded_at', timeRange.start.toISOString())
          .lte('recorded_at', timeRange.end.toISOString());
      }

      const { data, error } = await query.order('recorded_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(metric => ({
        ...metric,
        timestamp: metric.recorded_at || new Date().toISOString()
      }));
    } catch (error: unknown) {
      console.error('Error fetching metrics:', error);
      return [];
    }
  },

  /**
   * Track user action for analytics
   */
  async trackUserAction(centerId: string, action: string, category: string, data?: GenericObject): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      const { error } = await supabase.rpc('track_analytics_event', {
        p_user_id: null,
        p_center_id: centerId,
        p_event_type: action,
        p_event_category: category,
        p_event_data: data || null,
        p_session_id: null,
        p_ip_address: null,
        p_user_agent: null,
        p_page_url: null
      } as any);

      if (error) throw error;
      return true;
    } catch (error: unknown) {
      console.error('Error tracking user action:', error);
      return false;
    }
  },

  /**
   * Get analytics summary for a center
   */
  async getAnalyticsSummary(centerId: string): Promise<AnalyticsSummary> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return {
          totalAppointments: 0,
          totalReferrals: 0,
          totalPatients: 0,
          totalMedicalRecords: 0,
          totalMedicalShares: 0,
          totalMedicalRequests: 0,
          averageResponseTime: 0,
          systemUptime: 0
        };
      }
      
      // Fetch appointments count
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('center_id', centerId);

      // Fetch referrals count
      const { data: referrals } = await supabase
        .from('referrals')
        .select('id', { count: 'exact' })
        .eq('from_center_id', centerId);

      // Fetch patients count
      const { data: patients } = await supabase
        .from('patients')
        .select('id', { count: 'exact' })
        .eq('center_id', centerId);

      // Fetch medical records count
      const { data: medicalRecords } = await supabase
        .from('medical_records')
        .select('id', { count: 'exact' })
        .eq('center_id', centerId);

      // Fetch medical shares count
      const { data: medicalShares } = await supabase
        .from('medical_record_shares')
        .select('id', { count: 'exact' })
        .eq('from_center_id', centerId);

      // Fetch medical requests count
      const { data: medicalRequests } = await supabase
        .from('medical_record_requests')
        .select('id', { count: 'exact' })
        .eq('from_center_id', centerId);

      return {
        totalAppointments: appointments?.length || 0,
        totalReferrals: referrals?.length || 0,
        totalPatients: patients?.length || 0,
        totalMedicalRecords: medicalRecords?.length || 0,
        totalMedicalShares: medicalShares?.length || 0,
        totalMedicalRequests: medicalRequests?.length || 0,
        averageResponseTime: 0, // TODO: Calculate from actual data
        systemUptime: 99.9 // TODO: Calculate from actual data
      };
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      return {
        totalAppointments: 0,
        totalReferrals: 0,
        totalPatients: 0,
        totalMedicalRecords: 0,
        totalMedicalShares: 0,
        totalMedicalRequests: 0,
        averageResponseTime: 0,
        systemUptime: 0
      };
    }
  },

  /**
   * Track an analytics event
   */
  async trackEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: eventData.event_type,
          event_data: eventData.event_data,
          event_category: eventData.event_category || 'general',
          user_id: eventData.user_id,
          center_id: eventData.center_id,
          created_at: new Date().toISOString()
        } as AnalyticsEvents['Insert']);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      return false;
    }
  },

  /**
   * Get system metrics
   */
  async getSystemMetrics(metricNames?: string[]): Promise<SystemMetric[]> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return [];
      }
      
      let query = supabase.from('system_metrics').select('*');
      
      if (metricNames && metricNames.length > 0) {
        query = query.in('metric_name', metricNames);
      }
      
      const { data, error } = await query
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []).map(metric => ({
        ...metric,
        timestamp: metric.recorded_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      return [];
    }
  },

  /**
   * Update system metrics
   */
  async updateSystemMetrics(metrics: Omit<SystemMetrics, 'id' | 'timestamp'>[]): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      
      const { error } = await supabase.rpc('track_analytics_event', {
        events: metrics.map(metric => ({
          ...metric,
          timestamp: new Date().toISOString()
        }))
      } as any);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating system metrics:', error);
      return false;
    }
  }
};

export default enhancedAnalyticsService;
