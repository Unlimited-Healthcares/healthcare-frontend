import { supabase } from '@/lib/supabase-client';
import type { Database } from '@/integrations/supabase/types';

type Notifications = Database['public']['Tables']['notifications'];
type NotificationPreferencesTable = Database['public']['Tables']['notification_preferences'];


export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  category?: string;
  is_read: boolean | null;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  appointment: string;
  medical_record_access: string;
  medical_record_request: string;
  message: string;
  record_share_expiring: string;
  referral: string;
  system: string;
  test_result: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const enhancedNotificationService = {
  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string, filters?: {
    is_read?: boolean;
    type?: string;
    category?: string;
    limit?: number;
  }): Promise<Notification[]> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return [];
      }
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(notification => ({
        ...notification,
        category: notification.related_type || 'general',
        is_read: notification.is_read ?? false
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Create a new notification
   */
  async createNotification(notificationData: CreateNotificationData): Promise<Notification | null> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return null;
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          type: notificationData.type || 'info',
          category: notificationData.category || 'general',
          is_read: false
        } as Notifications['Insert'])
        .select()
        .single();

      if (error) throw error;
      return data ? {
        ...data,
        category: data.related_type || 'general',
        is_read: data.is_read ?? false
      } : null;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as Notifications['Update'])
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as Notifications['Update'])
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  /**
   * Get notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return 0;
      }
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Get notification preferences for a user
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return null;
      }
      
      const { data: patientData, error: patientError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (patientError && patientError.code !== 'PGRST116') {
        throw patientError;
      }

      if (!patientData) {
        // Create default preferences if none exist
        const defaultPreferences: Omit<NotificationPreferences, 'id' | 'created_at' | 'updated_at'> = {
          user_id: userId,
          appointment: 'email',
          medical_record_access: 'email',
          medical_record_request: 'email',
          message: 'email',
          record_share_expiring: 'email',
          referral: 'email',
          system: 'email',
          test_result: 'email',
          email_verified: false
        };

        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert(defaultPreferences as NotificationPreferencesTable['Insert'])
          .select()
          .single();

        if (createError) throw createError;
        return newPrefs;
      }

      return patientData;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      
      const { error: updateError } = await supabase
        .from('notification_preferences')
        .update(preferences as NotificationPreferencesTable['Update'])
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  },

  /**
   * Notify patient when their medical record is accessed
   */
  async notifyMedicalRecordAccess(patientId: string, accessedBy: string, recordType: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      
      // Get patient's user ID
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('profile_id, name')
        .eq('id', patientId)
        .single();

      if (patientError || !patientData) {
        console.error('Error fetching patient data:', patientError);
        return false;
      }

      // Create notification
      const notification = await this.createNotification({
        user_id: patientData?.profile_id || '',
        title: 'Medical Record Accessed',
        message: `Your ${recordType} was accessed by ${accessedBy}`,
        type: 'info',
        category: 'medical_records',
        metadata: {
          patient_id: patientId,
          accessed_by: accessedBy,
          record_type: recordType
        }
      });

      return notification !== null;
    } catch (error: unknown) {
      console.error('Error notifying medical record access:', error);
      return false;
    }
  },

  /**
   * Send appointment reminder notification
   */
  async sendAppointmentReminder(appointmentId: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      
      // Get appointment details
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(profile_id, name),
          center:healthcare_centers(name)
        `)
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointmentData) {
        console.error('Error fetching appointment data:', appointmentError);
        return false;
      }

      const appointmentDate = new Date((appointmentData as any).appointment_date);
      const formattedDate = appointmentDate.toLocaleDateString();
      const formattedTime = appointmentDate.toLocaleTimeString();

      // Create notification
      const notification = await this.createNotification({
        user_id: (appointmentData as any).patient?.profile_id || '',
        title: 'Appointment Reminder',
        message: `You have an appointment with ${(appointmentData as any).doctor} at ${(appointmentData as any).center?.name} on ${formattedDate} at ${formattedTime}`,
        type: 'info',
        category: 'appointments',
        metadata: {
          appointment_id: appointmentId,
          doctor: (appointmentData as any).doctor,
          center_name: (appointmentData as any).center?.name,
          appointment_date: (appointmentData as any).appointment_date
        }
      });

      return notification !== null;
    } catch (error: unknown) {
      console.error('Error sending appointment reminder:', error);
      return false;
    }
  }
};

export default enhancedNotificationService;
