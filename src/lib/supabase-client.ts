import { supabase as generatedSupabase } from '@/integrations/supabase/client';

export const supabase = generatedSupabase;

// Helper function to get current user
export const getCurrentUser = async () => {
  if (!supabase) {
    console.warn('Supabase is not configured - returning null for current user');
    return null;
  }
  
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Supabase auth error:', error);
    return null;
  }
};

// Helper function to get patient ID from user ID
export const getPatientId = async (userId: string) => {
  if (!supabase) {
    console.warn('Supabase is not configured - cannot fetch patient ID');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching patient ID:', error);
      return null;
    }
    return data?.id || null;
  } catch (error) {
    console.error('Supabase query error:', error);
    return null;
  }
};

// Helper function to get center ID from user ID (for staff)
export const getCenterId = async (userId: string) => {
  if (!supabase) {
    console.warn('Supabase is not configured - cannot fetch center ID');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('center_staff')
      .select('center_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching center ID:', error);
      return null;
    }
    return data?.center_id || null;
  } catch (error) {
    console.error('Supabase query error:', error);
    return null;
  }
};

// Helper to determine if current user is patient or staff
export const getUserRole = async (userId: string) => {
  if (!supabase) {
    console.warn('Supabase is not configured - cannot determine user role');
    return null;
  }

  try {
    // Check if user is a patient
    const { data: patientData } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (patientData) {
      return 'patient';
    }

    // Check if user is center staff
    const { data: staffData } = await supabase
      .from('center_staff')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (staffData) {
      return 'center_staff';
    }

    return null;
  } catch (error) {
    console.error('Supabase query error:', error);
    return null;
  }
};

// Safe real-time subscription function that prevents WebSocket errors
export const safeRealtimeSubscription = (table: string, callback: (payload: any) => void) => {
  if (!supabase) {
    console.warn('Supabase is not configured - real-time features disabled');
    return () => {}; // Return empty cleanup function
  }

  try {
    const channel = supabase
      .channel(`safe_${table}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table
        },
        callback
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.warn('Error removing Supabase channel:', error);
      }
    };
  } catch (error) {
    console.error('Error setting up Supabase real-time subscription:', error);
    return () => {}; // Return empty cleanup function
  }
}; 