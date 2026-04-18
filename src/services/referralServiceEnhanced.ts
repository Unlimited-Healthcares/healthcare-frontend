import { supabase } from '@/lib/supabase-client';
import type { Database } from '@/integrations/supabase/types';

type Referrals = Database['public']['Tables']['referrals'];

export interface Referral {
  id: string;
  from_center_id: string;
  to_center_id: string;
  patient_id: string;
  reason: string;
  priority?: string | null;
  status: string;
  notes?: string | null;
  attachments?: string | null;
  created_at: string;
  updated_at: string;
  completed_date?: string | null;
  expected_completion_date?: string | null;
  has_shared_records?: boolean | null;
  is_facility_referral?: boolean | null;
  patient_consent_date?: string | null;
  receiving_doctor?: string | null;
  receiving_staff_id?: string | null;
  referral_type?: string | null;
  referring_doctor?: string | null;
  referring_staff_id?: string | null;
  scheduled_date?: string | null;
}

export interface CreateReferralData {
  from_center_id: string;
  to_center_id: string;
  patient_id: string;
  reason: string;
  priority?: string | null;
  notes?: string | null;
}

export interface UpdateReferralData {
  status?: string;
  notes?: string | null;
  priority?: string | null;
}

export const referralServiceEnhanced = {
  /**
   * Get referrals for a center
   */
  async getReferrals(centerId: string, filters?: {
    status?: string;
    direction?: 'incoming' | 'outgoing';
    patient_id?: string;
  }): Promise<Referral[]> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return [];
      }
      
      let query = supabase.from('referrals').select('*');
      
      if (filters?.direction === 'incoming') {
        query = query.eq('to_center_id', centerId);
      } else if (filters?.direction === 'outgoing') {
        query = query.eq('from_center_id', centerId);
      } else {
        // Get both incoming and outgoing
        query = query.or(`from_center_id.eq.${centerId},to_center_id.eq.${centerId}`);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.patient_id) {
        query = query.eq('patient_id', filters.patient_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }
  },

  /**
   * Create a new referral
   */
  async createReferral(referralData: CreateReferralData): Promise<Referral | null> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return null;
      }
      
      const { data, error } = await supabase
        .from('referrals')
        .insert({
          from_center_id: referralData.from_center_id,
          to_center_id: referralData.to_center_id,
          patient_id: referralData.patient_id,
          reason: referralData.reason,
          priority: referralData.priority,
          notes: referralData.notes,
          status: 'pending'
        } as Referrals['Insert'])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating referral:', error);
      return null;
    }
  },

  /**
   * Update referral status
   */
  async updateReferralStatus(referralId: string, status: string, notes?: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return false;
      }
      
      const { error: updateError } = await supabase
        .from('referrals')
        .update({ 
          status, 
          notes: notes ? `${notes}\n\nStatus updated to ${status} on ${new Date().toLocaleString()}` : null 
        } as Referrals['Update'])
        .eq('id', referralId);

      if (updateError) throw updateError;

      // Note: Referral history logging removed as table doesn't exist in schema

      return true;
    } catch (error) {
      console.error('Error updating referral status:', error);
      return false;
    }
  },

  /**
   * Get referral by ID
   */
  async getReferralById(referralId: string): Promise<Referral | null> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return null;
      }
      
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', referralId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching referral:', error);
      return null;
    }
  },

  /**
   * Get referral statistics
   */
  async getReferralStats(centerId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return {
          total: 0,
          pending: 0,
          accepted: 0,
          rejected: 0,
          completed: 0,
          cancelled: 0
        };
      }
      
      const { data, error } = await supabase
        .from('referrals')
        .select('status')
        .or(`from_center_id.eq.${centerId},to_center_id.eq.${centerId}`);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((r: any) => r.status === 'pending').length || 0,
        accepted: data?.filter((r: any) => r.status === 'accepted').length || 0,
        rejected: data?.filter((r: any) => r.status === 'rejected').length || 0,
        completed: data?.filter((r: any) => r.status === 'completed').length || 0,
        cancelled: data?.filter((r: any) => r.status === 'cancelled').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        completed: 0,
        cancelled: 0
      };
    }
  },

  /**
   * Upload referral attachment
   */
  async uploadAttachment(referralId: string, file: File): Promise<string | null> {
    try {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return null;
      }
      
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `referrals/${referralId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('referral-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('referral-attachments')
        .getPublicUrl(filePath);

      // Update referral with attachment
      const { error: dbError } = await supabase
        .from('referrals')
        .update({
          attachments: urlData.publicUrl
        } as Referrals['Update'])
        .eq('id', referralId);

      if (dbError) throw dbError;
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return null;
    }
  },

  /**
   * Get referral history (removed - table doesn't exist in schema)
   */
  async getReferralHistory(referralId: string): Promise<any[]> {
    console.warn(`Referral history functionality removed - table not available in schema for referral ${referralId}`);
    return [];
  }
};
