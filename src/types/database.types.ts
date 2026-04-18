export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      centers: {
        Row: {
          id: string
          name: string
          center_type: string
          logo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          center_type: string
          logo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          center_type?: string
          logo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      center_staff: {
        Row: {
          id: string
          center_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          center_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          center_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          profile_id: string
          patient_id: string
          name: string
          age: number | null
          gender: string | null
          last_visit: string | null
          status: string | null
          created_at: string
          updated_at: string
          medical_record_sharing_preferences: Json | null
        }
        Insert: {
          id?: string
          profile_id: string
          patient_id: string
          name: string
          age?: number | null
          gender?: string | null
          last_visit?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
          medical_record_sharing_preferences?: Json | null
        }
        Update: {
          id?: string
          profile_id?: string
          patient_id?: string
          name?: string
          age?: number | null
          gender?: string | null
          last_visit?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
          medical_record_sharing_preferences?: Json | null
        }
      }
      medical_records: {
        Row: {
          id: string
          patient_id: string
          center_id: string
          diagnosis: string | null
          treatment: string | null
          recommendations: string | null
          doctor_name: string | null
          created_at: string
          updated_at: string
          is_shareable: boolean
          sharing_restrictions: Json | null
          record_type: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          center_id: string
          diagnosis?: string | null
          treatment?: string | null
          recommendations?: string | null
          doctor_name?: string | null
          created_at?: string
          updated_at?: string
          is_shareable?: boolean
          sharing_restrictions?: Json | null
          record_type?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          center_id?: string
          diagnosis?: string | null
          treatment?: string | null
          recommendations?: string | null
          doctor_name?: string | null
          created_at?: string
          updated_at?: string
          is_shareable?: boolean
          sharing_restrictions?: Json | null
          record_type?: string | null
        }
      }
      medical_record_requests: {
        Row: {
          id: string
          patient_id: string
          from_center_id: string
          to_center_id: string
          request_date: string
          status: string
          purpose: string
          request_expiry: string | null
          access_duration_days: number
          specific_records: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          from_center_id: string
          to_center_id: string
          request_date?: string
          status?: string
          purpose: string
          request_expiry?: string | null
          access_duration_days?: number
          specific_records?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          from_center_id?: string
          to_center_id?: string
          request_date?: string
          status?: string
          purpose?: string
          request_expiry?: string | null
          access_duration_days?: number
          specific_records?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medical_record_shares: {
        Row: {
          id: string
          request_id: string | null
          patient_id: string
          from_center_id: string
          to_center_id: string
          share_date: string
          expiry_date: string
          access_level: string
          data_scope: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id?: string | null
          patient_id: string
          from_center_id: string
          to_center_id: string
          share_date?: string
          expiry_date: string
          access_level?: string
          data_scope: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string | null
          patient_id?: string
          from_center_id?: string
          to_center_id?: string
          share_date?: string
          expiry_date?: string
          access_level?: string
          data_scope?: Json
          created_at?: string
          updated_at?: string
        }
      }
      medical_record_access_logs: {
        Row: {
          id: string
          share_id: string
          accessed_by_id: string
          access_time: string
          access_type: string
          access_details: Json | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          share_id: string
          accessed_by_id: string
          access_time?: string
          access_type: string
          access_details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          share_id?: string
          accessed_by_id?: string
          access_time?: string
          access_type?: string
          access_details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          center_id: string | null
          title: string
          message: string
          type: string
          reference_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          center_id?: string | null
          title: string
          message: string
          type: string
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          center_id?: string | null
          title?: string
          message?: string
          type?: string
          reference_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      center_services: {
        Row: {
          id: string
          center_id: string
          name: string
          description: string | null
          duration_minutes: number | null
          price: number | null
          is_available: boolean
          requires_appointment: boolean
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          center_id: string
          name: string
          description?: string | null
          duration_minutes?: number | null
          price?: number | null
          is_available?: boolean
          requires_appointment?: boolean
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          center_id?: string
          name?: string
          description?: string | null
          duration_minutes?: number | null
          price?: number | null
          is_available?: boolean
          requires_appointment?: boolean
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      center_files: {
        Row: {
          id: string
          center_id: string
          patient_id: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          category: string
          description: string | null
          tags: string[] | null
          is_public: boolean
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          center_id: string
          patient_id?: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          category: string
          description?: string | null
          tags?: string[] | null
          is_public?: boolean
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          center_id?: string
          patient_id?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          category?: string
          description?: string | null
          tags?: string[] | null
          is_public?: boolean
          uploaded_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_center_medical_record_requests: {
        Args: {
          p_center_id: string
          p_status?: string
          p_direction?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          patient_id: string
          patient_name: string
          from_center_id: string
          from_center_name: string
          to_center_id: string
          to_center_name: string
          request_date: string
          status: string
          purpose: string
          request_expiry: string | null
          access_duration_days: number
          specific_records: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }[]
      }
      get_center_shared_medical_records: {
        Args: {
          p_center_id: string
          p_direction?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          patient_id: string
          patient_name: string
          from_center_id: string
          from_center_name: string
          to_center_id: string
          to_center_name: string
          share_date: string
          expiry_date: string
          access_level: string
          data_scope: Json
          request_id: string | null
          created_at: string
          updated_at: string
        }[]
      }
      get_patient_medical_record_access_logs: {
        Args: {
          p_patient_id: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          access_time: string
          access_type: string
          accessed_by_name: string
          center_name: string
          record_details: Json
          ip_address: string | null
          user_agent: string | null
        }[]
      }
      log_medical_record_access: {
        Args: {
          p_share_id: string
          p_staff_id: string
          p_access_type: string
          p_access_details?: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
      respond_to_medical_record_request: {
        Args: {
          p_request_id: string
          p_status: string
          p_response_notes?: string
          p_data_scope?: Json
          p_access_level?: string
        }
        Returns: Json
      }
      get_center_services: {
        Args: {
          p_center_id: string
          p_category?: string
          p_is_available?: boolean
          p_search?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          center_id: string
          name: string
          description: string | null
          duration_minutes: number | null
          price: number | null
          is_available: boolean
          requires_appointment: boolean
          category: string | null
          created_at: string
          updated_at: string
        }[]
      }
      get_center_files: {
        Args: {
          p_center_id: string
          p_patient_id?: string
          p_category?: string
          p_search?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          center_id: string
          patient_id: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          category: string
          description: string | null
          tags: string[] | null
          is_public: boolean
          uploaded_by: string
          uploaded_by_name: string
          patient_name: string | null
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 