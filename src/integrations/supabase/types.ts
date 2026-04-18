export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action_description: string
          action_type: string
          admin_user_id: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          success: boolean | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          admin_user_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          success?: boolean | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          admin_user_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          success?: boolean | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          ai_model: string | null
          confidence_score: number | null
          content: string
          created_at: string
          id: string
          message_data: Json | null
          message_type: string
          processing_time_ms: number | null
          session_id: string
          tokens_used: number | null
        }
        Insert: {
          ai_model?: string | null
          confidence_score?: number | null
          content: string
          created_at?: string
          id?: string
          message_data?: Json | null
          message_type: string
          processing_time_ms?: number | null
          session_id: string
          tokens_used?: number | null
        }
        Update: {
          ai_model?: string | null
          confidence_score?: number | null
          content?: string
          created_at?: string
          id?: string
          message_data?: Json | null
          message_type?: string
          processing_time_ms?: number | null
          session_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          session_type: string
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          session_type?: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          session_type?: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          priority_score: number | null
          recommendation_data: Json
          recommendation_type: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          priority_score?: number | null
          recommendation_data: Json
          recommendation_type: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          priority_score?: number | null
          recommendation_data?: Json
          recommendation_type?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ambulance_requests: {
        Row: {
          acknowledged_at: string | null
          actual_arrival: string | null
          ambulance_id: string | null
          arrived_at: string | null
          completed_at: string | null
          created_at: string | null
          destination_address: string | null
          destination_latitude: number | null
          destination_longitude: number | null
          dispatched_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          estimated_arrival: string | null
          id: string
          insurance_info: Json | null
          medical_condition: string
          medical_history: Json | null
          metadata: Json | null
          patient_age: number | null
          patient_gender: string | null
          patient_name: string
          patient_phone: string
          pickup_address: string
          pickup_latitude: number
          pickup_longitude: number
          priority: string | null
          request_number: string
          requested_by: string
          special_requirements: string | null
          status: string | null
          symptoms: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          actual_arrival?: string | null
          ambulance_id?: string | null
          arrived_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          destination_address?: string | null
          destination_latitude?: number | null
          destination_longitude?: number | null
          dispatched_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          estimated_arrival?: string | null
          id?: string
          insurance_info?: Json | null
          medical_condition: string
          medical_history?: Json | null
          metadata?: Json | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name: string
          patient_phone: string
          pickup_address: string
          pickup_latitude: number
          pickup_longitude: number
          priority?: string | null
          request_number: string
          requested_by: string
          special_requirements?: string | null
          status?: string | null
          symptoms?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          actual_arrival?: string | null
          ambulance_id?: string | null
          arrived_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          destination_address?: string | null
          destination_latitude?: number | null
          destination_longitude?: number | null
          dispatched_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          estimated_arrival?: string | null
          id?: string
          insurance_info?: Json | null
          medical_condition?: string
          medical_history?: Json | null
          metadata?: Json | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string
          patient_phone?: string
          pickup_address?: string
          pickup_latitude?: number
          pickup_longitude?: number
          priority?: string | null
          request_number?: string
          requested_by?: string
          special_requirements?: string | null
          status?: string | null
          symptoms?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ambulance_requests_ambulance"
            columns: ["ambulance_id"]
            isOneToOne: false
            referencedRelation: "ambulances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ambulance_requests_user"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ambulances: {
        Row: {
          base_station_id: string | null
          contact_number: string
          created_at: string | null
          crew_members: Json | null
          current_latitude: number | null
          current_longitude: number | null
          equipment_list: Json | null
          id: string
          is_active: boolean | null
          last_location_update: string | null
          last_maintenance: string | null
          license_plate: string
          next_maintenance: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          vehicle_number: string
        }
        Insert: {
          base_station_id?: string | null
          contact_number: string
          created_at?: string | null
          crew_members?: Json | null
          current_latitude?: number | null
          current_longitude?: number | null
          equipment_list?: Json | null
          id?: string
          is_active?: boolean | null
          last_location_update?: string | null
          last_maintenance?: string | null
          license_plate: string
          next_maintenance?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          vehicle_number: string
        }
        Update: {
          base_station_id?: string | null
          contact_number?: string
          created_at?: string | null
          crew_members?: Json | null
          current_latitude?: number | null
          current_longitude?: number | null
          equipment_list?: Json | null
          id?: string
          is_active?: boolean | null
          last_location_update?: string | null
          last_maintenance?: string | null
          license_plate?: string
          next_maintenance?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          vehicle_number?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          browser_name: string | null
          center_id: string | null
          created_at: string | null
          device_type: string | null
          event_category: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          os_name: string | null
          page_url: string | null
          referrer_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser_name?: string | null
          center_id?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          os_name?: string | null
          page_url?: string | null
          referrer_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser_name?: string | null
          center_id?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          os_name?: string | null
          page_url?: string | null
          referrer_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          api_key_hash: string
          api_key_prefix: string
          center_id: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          permissions: Json
          rate_limit_per_day: number | null
          rate_limit_per_hour: number | null
          rate_limit_per_minute: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          api_key_hash: string
          api_key_prefix: string
          center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          permissions?: Json
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          api_key_hash?: string
          api_key_prefix?: string
          center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          permissions?: Json
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          method: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          center_id: string
          created_at: string
          doctor: string
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          center_id: string
          created_at?: string
          doctor: string
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          center_id?: string
          created_at?: string
          doctor?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_donation_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          fulfilled_at: string | null
          id: string
          medical_condition: string | null
          needed_by: string
          notes: string | null
          patient_age: number | null
          patient_name: string | null
          priority: Database["public"]["Enums"]["request_priority"] | null
          request_number: string
          requesting_center_id: string
          special_requirements: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          units_fulfilled: number | null
          units_needed: number
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          fulfilled_at?: string | null
          id?: string
          medical_condition?: string | null
          needed_by: string
          notes?: string | null
          patient_age?: number | null
          patient_name?: string | null
          priority?: Database["public"]["Enums"]["request_priority"] | null
          request_number: string
          requesting_center_id: string
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          units_fulfilled?: number | null
          units_needed?: number
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          blood_type?: Database["public"]["Enums"]["blood_type"]
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          fulfilled_at?: string | null
          id?: string
          medical_condition?: string | null
          needed_by?: string
          notes?: string | null
          patient_age?: number | null
          patient_name?: string | null
          priority?: Database["public"]["Enums"]["request_priority"] | null
          request_number?: string
          requesting_center_id?: string
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          units_fulfilled?: number | null
          units_needed?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_donation_requests_requesting_center_id_fkey"
            columns: ["requesting_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_donations: {
        Row: {
          blood_bank_center_id: string
          blood_type: Database["public"]["Enums"]["blood_type"]
          compensation_amount: number | null
          created_at: string | null
          created_by: string
          donation_date: string | null
          donation_number: string
          donor_id: string
          expiry_date: string | null
          id: string
          payment_reference: string | null
          payment_status: string | null
          post_donation_vitals: Json | null
          pre_donation_vitals: Json | null
          request_id: string | null
          screening_results: Json | null
          staff_notes: string | null
          status: Database["public"]["Enums"]["donation_status"] | null
          updated_at: string | null
          volume_ml: number | null
        }
        Insert: {
          blood_bank_center_id: string
          blood_type: Database["public"]["Enums"]["blood_type"]
          compensation_amount?: number | null
          created_at?: string | null
          created_by: string
          donation_date?: string | null
          donation_number: string
          donor_id: string
          expiry_date?: string | null
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          post_donation_vitals?: Json | null
          pre_donation_vitals?: Json | null
          request_id?: string | null
          screening_results?: Json | null
          staff_notes?: string | null
          status?: Database["public"]["Enums"]["donation_status"] | null
          updated_at?: string | null
          volume_ml?: number | null
        }
        Update: {
          blood_bank_center_id?: string
          blood_type?: Database["public"]["Enums"]["blood_type"]
          compensation_amount?: number | null
          created_at?: string | null
          created_by?: string
          donation_date?: string | null
          donation_number?: string
          donor_id?: string
          expiry_date?: string | null
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          post_donation_vitals?: Json | null
          pre_donation_vitals?: Json | null
          request_id?: string | null
          screening_results?: Json | null
          staff_notes?: string | null
          status?: Database["public"]["Enums"]["donation_status"] | null
          updated_at?: string | null
          volume_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_donations_blood_bank_center_id_fkey"
            columns: ["blood_bank_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "blood_donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_donations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_donation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_donors: {
        Row: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at: string | null
          date_of_birth: string
          donor_number: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          height_cm: number | null
          id: string
          last_donation_date: string | null
          medical_conditions: Json | null
          medications: Json | null
          next_eligible_date: string | null
          notes: string | null
          status: Database["public"]["Enums"]["donor_status"] | null
          total_donations: number | null
          total_reward_points: number | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          blood_type: Database["public"]["Enums"]["blood_type"]
          created_at?: string | null
          date_of_birth: string
          donor_number: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          height_cm?: number | null
          id?: string
          last_donation_date?: string | null
          medical_conditions?: Json | null
          medications?: Json | null
          next_eligible_date?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["donor_status"] | null
          total_donations?: number | null
          total_reward_points?: number | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          blood_type?: Database["public"]["Enums"]["blood_type"]
          created_at?: string | null
          date_of_birth?: string
          donor_number?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          height_cm?: number | null
          id?: string
          last_donation_date?: string | null
          medical_conditions?: Json | null
          medications?: Json | null
          next_eligible_date?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["donor_status"] | null
          total_donations?: number | null
          total_reward_points?: number | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      blood_inventory: {
        Row: {
          available_units: number | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          center_id: string
          expired_units: number | null
          id: string
          last_updated: string | null
          minimum_threshold: number | null
          reserved_units: number | null
          total_units: number | null
        }
        Insert: {
          available_units?: number | null
          blood_type: Database["public"]["Enums"]["blood_type"]
          center_id: string
          expired_units?: number | null
          id?: string
          last_updated?: string | null
          minimum_threshold?: number | null
          reserved_units?: number | null
          total_units?: number | null
        }
        Update: {
          available_units?: number | null
          blood_type?: Database["public"]["Enums"]["blood_type"]
          center_id?: string
          expired_units?: number | null
          id?: string
          last_updated?: string | null
          minimum_threshold?: number | null
          reserved_units?: number | null
          total_units?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_inventory_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_type_compatibility: {
        Row: {
          compatibility_level: number
          created_at: string | null
          donor_blood_type: Database["public"]["Enums"]["blood_type"]
          id: string
          recipient_blood_type: Database["public"]["Enums"]["blood_type"]
        }
        Insert: {
          compatibility_level?: number
          created_at?: string | null
          donor_blood_type: Database["public"]["Enums"]["blood_type"]
          id?: string
          recipient_blood_type: Database["public"]["Enums"]["blood_type"]
        }
        Update: {
          compatibility_level?: number
          created_at?: string | null
          donor_blood_type?: Database["public"]["Enums"]["blood_type"]
          id?: string
          recipient_blood_type?: Database["public"]["Enums"]["blood_type"]
        }
        Relationships: []
      }
      center_files: {
        Row: {
          category: string
          center_id: string
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_public: boolean | null
          patient_id: string | null
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          category: string
          center_id: string
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_public?: boolean | null
          patient_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          category?: string
          center_id?: string
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_public?: boolean | null
          patient_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_files_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_files_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "center_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      center_performance_metrics: {
        Row: {
          average_rating: number | null
          cancelled_appointments: number | null
          center_id: string
          completed_appointments: number | null
          compliance_score: number | null
          created_at: string
          id: string
          metadata: Json | null
          metric_period: string
          patient_satisfaction_score: number | null
          response_time_hours: number | null
          revenue_generated: number | null
          staff_utilization_rate: number | null
          total_appointments: number | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          cancelled_appointments?: number | null
          center_id: string
          completed_appointments?: number | null
          compliance_score?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_period: string
          patient_satisfaction_score?: number | null
          response_time_hours?: number | null
          revenue_generated?: number | null
          staff_utilization_rate?: number | null
          total_appointments?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          cancelled_appointments?: number | null
          center_id?: string
          completed_appointments?: number | null
          compliance_score?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_period?: string
          patient_satisfaction_score?: number | null
          response_time_hours?: number | null
          revenue_generated?: number | null
          staff_utilization_rate?: number | null
          total_appointments?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_performance_metrics_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      center_services: {
        Row: {
          category: string | null
          center_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_available: boolean | null
          name: string
          price: number | null
          requires_appointment: boolean | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          center_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_available?: boolean | null
          name: string
          price?: number | null
          requires_appointment?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          center_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_available?: boolean | null
          name?: string
          price?: number | null
          requires_appointment?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_services_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      center_staff: {
        Row: {
          center_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          center_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          center_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_staff_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      center_verification_requests: {
        Row: {
          center_id: string
          compliance_checklist: Json | null
          compliance_score: number | null
          created_at: string
          id: string
          metadata: Json | null
          next_review_date: string | null
          rejection_reason: string | null
          request_type: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          submitted_at: string
          updated_at: string
          verification_documents: Json | null
        }
        Insert: {
          center_id: string
          compliance_checklist?: Json | null
          compliance_score?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          next_review_date?: string | null
          rejection_reason?: string | null
          request_type?: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          verification_documents?: Json | null
        }
        Update: {
          center_id?: string
          compliance_checklist?: Json | null
          compliance_score?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          next_review_date?: string | null
          rejection_reason?: string | null
          request_type?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          verification_documents?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "center_verification_requests_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      centers: {
        Row: {
          center_type: string
          compliance_score: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_compliance_check: string | null
          logo: string | null
          name: string
          updated_at: string | null
          verification_date: string | null
          verification_status: string | null
        }
        Insert: {
          center_type: string
          compliance_score?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_compliance_check?: string | null
          logo?: string | null
          name: string
          updated_at?: string | null
          verification_date?: string | null
          verification_status?: string | null
        }
        Update: {
          center_type?: string
          compliance_score?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_compliance_check?: string | null
          logo?: string | null
          name?: string
          updated_at?: string | null
          verification_date?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_edited: boolean | null
          message_type: string | null
          metadata: Json | null
          reply_to_id: string | null
          room_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_read_at: string | null
          left_at: string | null
          role: string | null
          room_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          role?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          role?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          appointment_id: string | null
          center_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_traces: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_type: string
          created_at: string | null
          exposure_date: string
          exposure_details: string | null
          exposure_duration_minutes: number | null
          exposure_location: string | null
          follow_up_completed: boolean | null
          follow_up_required: boolean | null
          id: string
          mask_worn_by_case: boolean | null
          mask_worn_by_contact: boolean | null
          notes: string | null
          notified_at: string | null
          outdoor_exposure: boolean | null
          quarantine_end_date: string | null
          quarantine_start_date: string | null
          risk_level: string | null
          test_recommended: boolean | null
          test_scheduled_date: string | null
          updated_at: string | null
          viral_report_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_type: string
          created_at?: string | null
          exposure_date: string
          exposure_details?: string | null
          exposure_duration_minutes?: number | null
          exposure_location?: string | null
          follow_up_completed?: boolean | null
          follow_up_required?: boolean | null
          id?: string
          mask_worn_by_case?: boolean | null
          mask_worn_by_contact?: boolean | null
          notes?: string | null
          notified_at?: string | null
          outdoor_exposure?: boolean | null
          quarantine_end_date?: string | null
          quarantine_start_date?: string | null
          risk_level?: string | null
          test_recommended?: boolean | null
          test_scheduled_date?: string | null
          updated_at?: string | null
          viral_report_id: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_type?: string
          created_at?: string | null
          exposure_date?: string
          exposure_details?: string | null
          exposure_duration_minutes?: number | null
          exposure_location?: string | null
          follow_up_completed?: boolean | null
          follow_up_required?: boolean | null
          id?: string
          mask_worn_by_case?: boolean | null
          mask_worn_by_contact?: boolean | null
          notes?: string | null
          notified_at?: string | null
          outdoor_exposure?: boolean | null
          quarantine_end_date?: string | null
          quarantine_start_date?: string | null
          risk_level?: string | null
          test_recommended?: boolean | null
          test_scheduled_date?: string | null
          updated_at?: string | null
          viral_report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_contact_traces_report"
            columns: ["viral_report_id"]
            isOneToOne: false
            referencedRelation: "viral_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_appointments: {
        Row: {
          appointment_date: string
          center_id: string
          created_at: string | null
          donor_id: string
          duration_minutes: number | null
          id: string
          notes: string | null
          pre_screening_completed: boolean | null
          staff_assigned: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          center_id: string
          created_at?: string | null
          donor_id: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          pre_screening_completed?: boolean | null
          staff_assigned?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          center_id?: string
          created_at?: string | null
          donor_id?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          pre_screening_completed?: boolean | null
          staff_assigned?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_appointments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_appointments_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "blood_donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_rewards: {
        Row: {
          created_at: string | null
          description: string | null
          donation_id: string | null
          donor_id: string
          expires_at: string | null
          id: string
          points_earned: number
          points_redeemed: number | null
          reward_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          donation_id?: string | null
          donor_id: string
          expires_at?: string | null
          id?: string
          points_earned: number
          points_redeemed?: number | null
          reward_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          donation_id?: string | null
          donor_id?: string
          expires_at?: string | null
          id?: string
          points_earned?: number
          points_redeemed?: number | null
          reward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_rewards_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "blood_donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_rewards_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "blood_donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_verification: {
        Row: {
          created_at: string | null
          documents: Json | null
          donor_id: string
          expires_at: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          updated_at: string | null
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          documents?: Json | null
          donor_id: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string | null
          verification_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          documents?: Json | null
          donor_id?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string | null
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_verification_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "blood_donors"
            referencedColumns: ["id"]
          },
        ]
      }
      drug_interactions: {
        Row: {
          clinical_effects: string | null
          created_at: string
          description: string
          drug_a: string
          drug_b: string
          id: string
          interaction_type: string
          management_recommendations: string | null
          severity_level: number
          source: string | null
          updated_at: string
        }
        Insert: {
          clinical_effects?: string | null
          created_at?: string
          description: string
          drug_a: string
          drug_b: string
          id?: string
          interaction_type: string
          management_recommendations?: string | null
          severity_level: number
          source?: string | null
          updated_at?: string
        }
        Update: {
          clinical_effects?: string | null
          created_at?: string
          description?: string
          drug_a?: string
          drug_b?: string
          id?: string
          interaction_type?: string
          management_recommendations?: string | null
          severity_level?: number
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          address: string | null
          alert_number: string
          contact_number: string
          created_at: string | null
          description: string | null
          emergency_contacts: Json | null
          id: string
          is_test_alert: boolean | null
          latitude: number
          longitude: number
          medical_info: Json | null
          metadata: Json | null
          patient_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          responder_ids: Json | null
          response_time_minutes: number | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          address?: string | null
          alert_number: string
          contact_number: string
          created_at?: string | null
          description?: string | null
          emergency_contacts?: Json | null
          id?: string
          is_test_alert?: boolean | null
          latitude: number
          longitude: number
          medical_info?: Json | null
          metadata?: Json | null
          patient_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          responder_ids?: Json | null
          response_time_minutes?: number | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          address?: string | null
          alert_number?: string
          contact_number?: string
          created_at?: string | null
          description?: string | null
          emergency_contacts?: Json | null
          id?: string
          is_test_alert?: boolean | null
          latitude?: number
          longitude?: number
          medical_info?: Json | null
          metadata?: Json | null
          patient_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          responder_ids?: Json | null
          response_time_minutes?: number | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_emergency_alerts_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          contact_address: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_medical_contact: boolean | null
          is_primary: boolean | null
          notes: string | null
          notification_preferences: Json | null
          relationship: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_address?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_medical_contact?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          notification_preferences?: Json | null
          relationship: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_address?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_medical_contact?: boolean | null
          is_primary?: boolean | null
          notes?: string | null
          notification_preferences?: Json | null
          relationship?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_emergency_contacts_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_categories: {
        Row: {
          category_code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          parent_category_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "equipment_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_images: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          equipment_id: string
          file_size: number | null
          id: string
          image_type: string | null
          image_url: string
          is_primary: boolean | null
          mime_type: string | null
          title: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          equipment_id: string
          file_size?: number | null
          id?: string
          image_type?: string | null
          image_url: string
          is_primary?: boolean | null
          mime_type?: string | null
          title?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          equipment_id?: string
          file_size?: number | null
          id?: string
          image_type?: string | null
          image_url?: string
          is_primary?: boolean | null
          mime_type?: string | null
          title?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_images_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_items"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_items: {
        Row: {
          availability_status: string | null
          category_id: string
          certification_info: Json | null
          condition: string | null
          created_at: string | null
          current_value: number | null
          description: string | null
          dimensions: Json | null
          id: string
          is_active: boolean | null
          is_for_sale: boolean | null
          is_rentable: boolean | null
          last_maintenance_date: string | null
          location_center_id: string | null
          maintenance_schedule: string | null
          manufacturer: string | null
          maximum_rental_days: number | null
          minimum_rental_days: number | null
          model_number: string | null
          name: string
          next_maintenance_date: string | null
          operating_instructions: string | null
          power_requirements: string | null
          purchase_date: string | null
          purchase_price: number | null
          rental_price_daily: number | null
          rental_price_monthly: number | null
          rental_price_weekly: number | null
          safety_notes: string | null
          sale_price: number | null
          serial_number: string | null
          tags: string[] | null
          updated_at: string | null
          vendor_id: string
          warranty_expiry_date: string | null
          weight_kg: number | null
        }
        Insert: {
          availability_status?: string | null
          category_id: string
          certification_info?: Json | null
          condition?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_active?: boolean | null
          is_for_sale?: boolean | null
          is_rentable?: boolean | null
          last_maintenance_date?: string | null
          location_center_id?: string | null
          maintenance_schedule?: string | null
          manufacturer?: string | null
          maximum_rental_days?: number | null
          minimum_rental_days?: number | null
          model_number?: string | null
          name: string
          next_maintenance_date?: string | null
          operating_instructions?: string | null
          power_requirements?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          rental_price_daily?: number | null
          rental_price_monthly?: number | null
          rental_price_weekly?: number | null
          safety_notes?: string | null
          sale_price?: number | null
          serial_number?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vendor_id: string
          warranty_expiry_date?: string | null
          weight_kg?: number | null
        }
        Update: {
          availability_status?: string | null
          category_id?: string
          certification_info?: Json | null
          condition?: string | null
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          is_active?: boolean | null
          is_for_sale?: boolean | null
          is_rentable?: boolean | null
          last_maintenance_date?: string | null
          location_center_id?: string | null
          maintenance_schedule?: string | null
          manufacturer?: string | null
          maximum_rental_days?: number | null
          minimum_rental_days?: number | null
          model_number?: string | null
          name?: string
          next_maintenance_date?: string | null
          operating_instructions?: string | null
          power_requirements?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          rental_price_daily?: number | null
          rental_price_monthly?: number | null
          rental_price_weekly?: number | null
          safety_notes?: string | null
          sale_price?: number | null
          serial_number?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vendor_id?: string
          warranty_expiry_date?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "equipment_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "equipment_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_maintenance_schedules: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          completed_date: string | null
          completion_notes: string | null
          created_at: string | null
          equipment_id: string
          estimated_cost: number | null
          frequency_days: number
          id: string
          last_maintenance_date: string | null
          maintenance_notes: string | null
          maintenance_provider: string | null
          maintenance_type: string
          next_maintenance_date: string
          next_schedule_generated: boolean | null
          priority: string | null
          reminder_sent: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          equipment_id: string
          estimated_cost?: number | null
          frequency_days: number
          id?: string
          last_maintenance_date?: string | null
          maintenance_notes?: string | null
          maintenance_provider?: string | null
          maintenance_type: string
          next_maintenance_date: string
          next_schedule_generated?: boolean | null
          priority?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          equipment_id?: string
          estimated_cost?: number | null
          frequency_days?: number
          id?: string
          last_maintenance_date?: string | null
          maintenance_notes?: string | null
          maintenance_provider?: string | null
          maintenance_type?: string
          next_maintenance_date?: string
          next_schedule_generated?: boolean | null
          priority?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_maintenance_schedules_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_items"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          approved_at: string | null
          approved_by: string | null
          buyer_center_id: string
          cancelled_at: string | null
          cancelled_reason: string | null
          created_at: string | null
          delivery_address: string
          delivery_contact: Json | null
          discount_amount: number | null
          expected_delivery_date: string | null
          final_amount: number
          id: string
          order_number: string
          order_status: string | null
          ordered_by: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          quantity: number | null
          sales_listing_id: string
          shipping_cost: number | null
          special_instructions: string | null
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          buyer_center_id: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
          created_at?: string | null
          delivery_address: string
          delivery_contact?: Json | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          final_amount: number
          id?: string
          order_number: string
          order_status?: string | null
          ordered_by: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          quantity?: number | null
          sales_listing_id: string
          shipping_cost?: number | null
          special_instructions?: string | null
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          buyer_center_id?: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
          created_at?: string | null
          delivery_address?: string
          delivery_contact?: Json | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          final_amount?: number
          id?: string
          order_number?: string
          order_status?: string | null
          ordered_by?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          quantity?: number | null
          sales_listing_id?: string
          shipping_cost?: number | null
          special_instructions?: string | null
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_purchase_orders_sales_listing_id_fkey"
            columns: ["sales_listing_id"]
            isOneToOne: false
            referencedRelation: "equipment_sales_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_rental_agreements: {
        Row: {
          agreement_document_url: string | null
          agreement_number: string
          agreement_status: string | null
          auto_renewal: boolean | null
          cancellation_policy: string | null
          created_at: string | null
          damage_policy: string | null
          deposit_terms: string | null
          effective_date: string | null
          expiry_date: string | null
          id: string
          insurance_requirements: string | null
          late_return_policy: string | null
          liability_terms: string | null
          maintenance_responsibility: string | null
          rental_request_id: string
          renter_signature_date: string | null
          signed_by_renter: string | null
          signed_by_vendor: string | null
          terms_and_conditions: string
          updated_at: string | null
          vendor_signature_date: string | null
        }
        Insert: {
          agreement_document_url?: string | null
          agreement_number: string
          agreement_status?: string | null
          auto_renewal?: boolean | null
          cancellation_policy?: string | null
          created_at?: string | null
          damage_policy?: string | null
          deposit_terms?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          insurance_requirements?: string | null
          late_return_policy?: string | null
          liability_terms?: string | null
          maintenance_responsibility?: string | null
          rental_request_id: string
          renter_signature_date?: string | null
          signed_by_renter?: string | null
          signed_by_vendor?: string | null
          terms_and_conditions: string
          updated_at?: string | null
          vendor_signature_date?: string | null
        }
        Update: {
          agreement_document_url?: string | null
          agreement_number?: string
          agreement_status?: string | null
          auto_renewal?: boolean | null
          cancellation_policy?: string | null
          created_at?: string | null
          damage_policy?: string | null
          deposit_terms?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          insurance_requirements?: string | null
          late_return_policy?: string | null
          liability_terms?: string | null
          maintenance_responsibility?: string | null
          rental_request_id?: string
          renter_signature_date?: string | null
          signed_by_renter?: string | null
          signed_by_vendor?: string | null
          terms_and_conditions?: string
          updated_at?: string | null
          vendor_signature_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_rental_agreements_rental_request_id_fkey"
            columns: ["rental_request_id"]
            isOneToOne: false
            referencedRelation: "equipment_rental_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_rental_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          delivery_address: string | null
          delivery_required: boolean | null
          deposit_amount: number | null
          emergency_contact: Json | null
          end_date: string
          equipment_id: string
          id: string
          insurance_info: Json | null
          purpose: string | null
          rejected_reason: string | null
          rental_duration_days: number
          renter_center_id: string
          request_number: string
          requested_by: string
          setup_required: boolean | null
          special_requirements: string | null
          start_date: string
          status: string | null
          total_cost: number | null
          training_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          delivery_address?: string | null
          delivery_required?: boolean | null
          deposit_amount?: number | null
          emergency_contact?: Json | null
          end_date: string
          equipment_id: string
          id?: string
          insurance_info?: Json | null
          purpose?: string | null
          rejected_reason?: string | null
          rental_duration_days: number
          renter_center_id: string
          request_number: string
          requested_by: string
          setup_required?: boolean | null
          special_requirements?: string | null
          start_date: string
          status?: string | null
          total_cost?: number | null
          training_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          delivery_address?: string | null
          delivery_required?: boolean | null
          deposit_amount?: number | null
          emergency_contact?: Json | null
          end_date?: string
          equipment_id?: string
          id?: string
          insurance_info?: Json | null
          purpose?: string | null
          rejected_reason?: string | null
          rental_duration_days?: number
          renter_center_id?: string
          request_number?: string
          requested_by?: string
          setup_required?: boolean | null
          special_requirements?: string | null
          start_date?: string
          status?: string | null
          total_cost?: number | null
          training_required?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_rental_requests_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_items"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_sales_listings: {
        Row: {
          bulk_discount_available: boolean | null
          bulk_pricing: Json | null
          created_at: string | null
          created_by: string
          delivery_included: boolean | null
          equipment_id: string
          featured: boolean | null
          id: string
          inquiries_count: number | null
          installation_included: boolean | null
          listing_description: string | null
          listing_expiry_date: string | null
          listing_status: string | null
          listing_title: string
          minimum_price: number | null
          negotiable: boolean | null
          payment_terms: string | null
          sale_price: number
          shipping_cost: number | null
          training_included: boolean | null
          updated_at: string | null
          views_count: number | null
          warranty_duration_months: number | null
          warranty_included: boolean | null
        }
        Insert: {
          bulk_discount_available?: boolean | null
          bulk_pricing?: Json | null
          created_at?: string | null
          created_by: string
          delivery_included?: boolean | null
          equipment_id: string
          featured?: boolean | null
          id?: string
          inquiries_count?: number | null
          installation_included?: boolean | null
          listing_description?: string | null
          listing_expiry_date?: string | null
          listing_status?: string | null
          listing_title: string
          minimum_price?: number | null
          negotiable?: boolean | null
          payment_terms?: string | null
          sale_price: number
          shipping_cost?: number | null
          training_included?: boolean | null
          updated_at?: string | null
          views_count?: number | null
          warranty_duration_months?: number | null
          warranty_included?: boolean | null
        }
        Update: {
          bulk_discount_available?: boolean | null
          bulk_pricing?: Json | null
          created_at?: string | null
          created_by?: string
          delivery_included?: boolean | null
          equipment_id?: string
          featured?: boolean | null
          id?: string
          inquiries_count?: number | null
          installation_included?: boolean | null
          listing_description?: string | null
          listing_expiry_date?: string | null
          listing_status?: string | null
          listing_title?: string
          minimum_price?: number | null
          negotiable?: boolean | null
          payment_terms?: string | null
          sale_price?: number
          shipping_cost?: number | null
          training_included?: boolean | null
          updated_at?: string | null
          views_count?: number | null
          warranty_duration_months?: number | null
          warranty_included?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_sales_listings_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_items"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_specifications: {
        Row: {
          created_at: string | null
          display_order: number | null
          equipment_id: string
          id: string
          is_critical: boolean | null
          spec_category: string | null
          spec_name: string
          spec_unit: string | null
          spec_value: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          equipment_id: string
          id?: string
          is_critical?: boolean | null
          spec_category?: string | null
          spec_name: string
          spec_unit?: string | null
          spec_value: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          equipment_id?: string
          id?: string
          is_critical?: boolean | null
          spec_category?: string | null
          spec_name?: string
          spec_unit?: string | null
          spec_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_specifications_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_items"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          fee_amount: number | null
          id: string
          metadata: Json | null
          payee_id: string | null
          payer_id: string | null
          payment_gateway_id: string | null
          payment_gateway_response: Json | null
          payment_method: string | null
          processed_at: string | null
          reference_id: string
          reference_type: string
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          settled_at: string | null
          transaction_number: string
          transaction_status: string | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          fee_amount?: number | null
          id?: string
          metadata?: Json | null
          payee_id?: string | null
          payer_id?: string | null
          payment_gateway_id?: string | null
          payment_gateway_response?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          reference_id: string
          reference_type: string
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          settled_at?: string | null
          transaction_number: string
          transaction_status?: string | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          fee_amount?: number | null
          id?: string
          metadata?: Json | null
          payee_id?: string | null
          payer_id?: string | null
          payment_gateway_id?: string | null
          payment_gateway_response?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          reference_id?: string
          reference_type?: string
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          settled_at?: string | null
          transaction_number?: string
          transaction_status?: string | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment_vendors: {
        Row: {
          address: string | null
          business_hours: Json | null
          business_license: string | null
          company_name: string
          contact_person: string | null
          created_at: string | null
          description: string | null
          email: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          phone: string | null
          rating_average: number | null
          specialties: string[] | null
          tax_id: string | null
          total_ratings: number | null
          updated_at: string | null
          verification_date: string | null
          verification_status: string | null
          verified_by: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          business_license?: string | null
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          phone?: string | null
          rating_average?: number | null
          specialties?: string[] | null
          tax_id?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          business_license?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          phone?: string | null
          rating_average?: number | null
          specialties?: string[] | null
          tax_id?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      equipment_warranties: {
        Row: {
          claim_process: string | null
          claims_count: number | null
          contact_info: Json | null
          coverage_details: string | null
          created_at: string | null
          document_url: string | null
          end_date: string
          equipment_id: string
          id: string
          is_renewable: boolean | null
          is_transferable: boolean | null
          last_claim_date: string | null
          purchase_order_id: string | null
          renewal_cost: number | null
          start_date: string
          status: string | null
          terms_and_conditions: string | null
          updated_at: string | null
          warranty_number: string | null
          warranty_provider: string | null
          warranty_type: string
        }
        Insert: {
          claim_process?: string | null
          claims_count?: number | null
          contact_info?: Json | null
          coverage_details?: string | null
          created_at?: string | null
          document_url?: string | null
          end_date: string
          equipment_id: string
          id?: string
          is_renewable?: boolean | null
          is_transferable?: boolean | null
          last_claim_date?: string | null
          purchase_order_id?: string | null
          renewal_cost?: number | null
          start_date: string
          status?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          warranty_number?: string | null
          warranty_provider?: string | null
          warranty_type: string
        }
        Update: {
          claim_process?: string | null
          claims_count?: number | null
          contact_info?: Json | null
          coverage_details?: string | null
          created_at?: string | null
          document_url?: string | null
          end_date?: string
          equipment_id?: string
          id?: string
          is_renewable?: boolean | null
          is_transferable?: boolean | null
          last_claim_date?: string | null
          purchase_order_id?: string | null
          renewal_cost?: number | null
          start_date?: string
          status?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          warranty_number?: string | null
          warranty_provider?: string | null
          warranty_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_warranties_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_warranties_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "equipment_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_referral_resources: {
        Row: {
          created_at: string
          created_by: string | null
          details: Json | null
          id: string
          referral_id: string
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          details?: Json | null
          id?: string
          referral_id: string
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          details?: Json | null
          id?: string
          referral_id?: string
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_referral_resources_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      health_risk_assessments: {
        Row: {
          assessment_type: string
          created_at: string
          id: string
          input_data: Json
          next_assessment_due: string | null
          overall_risk_level: string | null
          recommendations: Json | null
          risk_scores: Json
          user_id: string
        }
        Insert: {
          assessment_type: string
          created_at?: string
          id?: string
          input_data: Json
          next_assessment_due?: string | null
          overall_risk_level?: string | null
          recommendations?: Json | null
          risk_scores: Json
          user_id: string
        }
        Update: {
          assessment_type?: string
          created_at?: string
          id?: string
          input_data?: Json
          next_assessment_due?: string | null
          overall_risk_level?: string | null
          recommendations?: Json | null
          risk_scores?: Json
          user_id?: string
        }
        Relationships: []
      }
      health_trends: {
        Row: {
          created_at: string
          data_source: string | null
          id: string
          metric_name: string
          metric_unit: string
          metric_value: number
          notes: string | null
          recorded_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          id?: string
          metric_name: string
          metric_unit: string
          metric_value: number
          notes?: string | null
          recorded_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_source?: string | null
          id?: string
          metric_name?: string
          metric_unit?: string
          metric_value?: number
          notes?: string | null
          recorded_date?: string
          user_id?: string
        }
        Relationships: []
      }
      healthcare_centers: {
        Row: {
          address: string
          created_at: string
          display_id: string | null
          email: string | null
          hours: string | null
          id: string
          image_url: string | null
          name: string
          phone: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          display_id?: string | null
          email?: string | null
          hours?: string | null
          id?: string
          image_url?: string | null
          name: string
          phone?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          display_id?: string | null
          email?: string | null
          hours?: string | null
          id?: string
          image_url?: string | null
          name?: string
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      medical_analyses: {
        Row: {
          analysis_result: Json
          analysis_type: string
          confidence_level: number | null
          created_at: string
          id: string
          input_data: Json
          reviewed_by: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_result: Json
          analysis_type: string
          confidence_level?: number | null
          created_at?: string
          id?: string
          input_data: Json
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_result?: Json
          analysis_type?: string
          confidence_level?: number | null
          created_at?: string
          id?: string
          input_data?: Json
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_images: {
        Row: {
          ai_analysis_result: Json | null
          analysis_status: string | null
          file_path: string
          file_size: number | null
          human_review_result: Json | null
          id: string
          image_type: string
          metadata: Json | null
          patient_id: string | null
          processed_at: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          ai_analysis_result?: Json | null
          analysis_status?: string | null
          file_path: string
          file_size?: number | null
          human_review_result?: Json | null
          id?: string
          image_type: string
          metadata?: Json | null
          patient_id?: string | null
          processed_at?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          ai_analysis_result?: Json | null
          analysis_status?: string | null
          file_path?: string
          file_size?: number | null
          human_review_result?: Json | null
          id?: string
          image_type?: string
          metadata?: Json | null
          patient_id?: string | null
          processed_at?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_images_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          keywords: string[] | null
          metadata: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          metadata?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          metadata?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      medical_record_access_logs: {
        Row: {
          access_details: Json | null
          access_time: string | null
          access_type: string
          accessed_by_id: string | null
          id: string
          ip_address: string | null
          share_id: string | null
          user_agent: string | null
        }
        Insert: {
          access_details?: Json | null
          access_time?: string | null
          access_type: string
          accessed_by_id?: string | null
          id?: string
          ip_address?: string | null
          share_id?: string | null
          user_agent?: string | null
        }
        Update: {
          access_details?: Json | null
          access_time?: string | null
          access_type?: string
          accessed_by_id?: string | null
          id?: string
          ip_address?: string | null
          share_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_access_logs_accessed_by_id_fkey"
            columns: ["accessed_by_id"]
            isOneToOne: false
            referencedRelation: "center_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_access_logs_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "medical_record_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_record_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_category_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_category_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "medical_record_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_record_files: {
        Row: {
          created_at: string | null
          created_by: string
          encryption_key_id: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_encrypted: boolean | null
          metadata: Json | null
          mime_type: string | null
          original_file_name: string
          record_id: string
          thumbnail_path: string | null
          updated_at: string | null
          upload_status: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          encryption_key_id?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_encrypted?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          original_file_name: string
          record_id: string
          thumbnail_path?: string | null
          updated_at?: string | null
          upload_status?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          encryption_key_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_encrypted?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          original_file_name?: string
          record_id?: string
          thumbnail_path?: string | null
          updated_at?: string | null
          upload_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_files_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_record_requests: {
        Row: {
          access_duration_days: number | null
          created_at: string | null
          from_center_id: string
          id: string
          notes: string | null
          patient_id: string
          purpose: string
          request_date: string | null
          request_expiry: string | null
          specific_records: Json | null
          status: string
          to_center_id: string
          updated_at: string | null
        }
        Insert: {
          access_duration_days?: number | null
          created_at?: string | null
          from_center_id: string
          id?: string
          notes?: string | null
          patient_id: string
          purpose: string
          request_date?: string | null
          request_expiry?: string | null
          specific_records?: Json | null
          status?: string
          to_center_id: string
          updated_at?: string | null
        }
        Update: {
          access_duration_days?: number | null
          created_at?: string | null
          from_center_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          purpose?: string
          request_date?: string | null
          request_expiry?: string | null
          specific_records?: Json | null
          status?: string
          to_center_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_requests_from_center_id_fkey"
            columns: ["from_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_requests_to_center_id_fkey"
            columns: ["to_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_record_shares: {
        Row: {
          access_level: string
          created_at: string | null
          data_scope: Json
          expiry_date: string
          from_center_id: string
          id: string
          patient_id: string
          request_id: string | null
          share_date: string | null
          to_center_id: string
          updated_at: string | null
        }
        Insert: {
          access_level?: string
          created_at?: string | null
          data_scope: Json
          expiry_date: string
          from_center_id: string
          id?: string
          patient_id: string
          request_id?: string | null
          share_date?: string | null
          to_center_id: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string
          created_at?: string | null
          data_scope?: Json
          expiry_date?: string
          from_center_id?: string
          id?: string
          patient_id?: string
          request_id?: string | null
          share_date?: string | null
          to_center_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_shares_from_center_id_fkey"
            columns: ["from_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_shares_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_shares_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "medical_record_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_shares_to_center_id_fkey"
            columns: ["to_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_record_versions: {
        Row: {
          changes_summary: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          previous_data: Json | null
          record_id: string
          record_type: string
          title: string
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          previous_data?: Json | null
          record_id: string
          record_type: string
          title: string
          version_number: number
        }
        Update: {
          changes_summary?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          previous_data?: Json | null
          record_id?: string
          record_type?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_versions_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          file_url: string | null
          id: string
          is_latest_version: boolean | null
          metadata: Json | null
          parent_record_id: string | null
          patient_id: string
          record_type: string
          tags: string[] | null
          title: string
          updated_at: string
          version: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          file_url?: string | null
          id?: string
          is_latest_version?: boolean | null
          metadata?: Json | null
          parent_record_id?: string | null
          patient_id: string
          record_type: string
          tags?: string[] | null
          title: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          file_url?: string | null
          id?: string
          is_latest_version?: boolean | null
          metadata?: Json | null
          parent_record_id?: string | null
          patient_id?: string
          record_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_parent_record_id_fkey"
            columns: ["parent_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_report_files: {
        Row: {
          center_id: string | null
          created_at: string
          created_by: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          is_shared: boolean | null
          patient_consent: boolean | null
          patient_id: string
          report_id: string
        }
        Insert: {
          center_id?: string | null
          created_at?: string
          created_by: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          is_shared?: boolean | null
          patient_consent?: boolean | null
          patient_id: string
          report_id: string
        }
        Update: {
          center_id?: string | null
          created_at?: string
          created_by?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          is_shared?: boolean | null
          patient_consent?: boolean | null
          patient_id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_report_files_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          appointment: string
          created_at: string
          email_verified: boolean
          id: string
          medical_record_access: string
          medical_record_request: string
          message: string
          record_share_expiring: string
          referral: string
          system: string
          test_result: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment?: string
          created_at?: string
          email_verified?: boolean
          id?: string
          medical_record_access?: string
          medical_record_request?: string
          message?: string
          record_share_expiring?: string
          referral?: string
          system?: string
          test_result?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment?: string
          created_at?: string
          email_verified?: boolean
          id?: string
          medical_record_access?: string
          medical_record_request?: string
          message?: string
          record_share_expiring?: string
          referral?: string
          system?: string
          test_result?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          delivery_method: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          is_urgent: boolean | null
          message: string
          read_at: string | null
          related_id: string | null
          related_type: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          delivery_method?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          is_urgent?: boolean | null
          message: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          delivery_method?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          is_urgent?: boolean | null
          message?: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          age: number
          created_at: string
          gender: string
          id: string
          last_visit: string | null
          medical_record_sharing_preferences: Json | null
          name: string
          patient_id: string
          profile_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          age: number
          created_at?: string
          gender: string
          id?: string
          last_visit?: string | null
          medical_record_sharing_preferences?: Json | null
          name: string
          patient_id: string
          profile_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          age?: number
          created_at?: string
          gender?: string
          id?: string
          last_visit?: string | null
          medical_record_sharing_preferences?: Json | null
          name?: string
          patient_id?: string
          profile_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_id: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_id?: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_id?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          comments: string | null
          created_at: string
          feedback_type: string
          id: string
          rating: number | null
          recommendation_id: string
          user_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          feedback_type: string
          id?: string
          rating?: number | null
          recommendation_id: string
          user_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          feedback_type?: string
          id?: string
          rating?: number | null
          recommendation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_feedback_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ai_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_documents: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          is_shared: boolean | null
          referral_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          is_shared?: boolean | null
          referral_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          is_shared?: boolean | null
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_documents_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_status_history: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          referral_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          referral_id: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          referral_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_status_history_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_date: string | null
          created_at: string
          expected_completion_date: string | null
          from_center_id: string
          has_shared_records: boolean | null
          id: string
          is_facility_referral: boolean | null
          notes: string | null
          patient_consent_date: string | null
          patient_id: string
          priority: string | null
          reason: string
          receiving_doctor: string | null
          receiving_staff_id: string | null
          referral_type: string | null
          referring_doctor: string | null
          referring_staff_id: string | null
          scheduled_date: string | null
          status: string
          to_center_id: string
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          expected_completion_date?: string | null
          from_center_id: string
          has_shared_records?: boolean | null
          id?: string
          is_facility_referral?: boolean | null
          notes?: string | null
          patient_consent_date?: string | null
          patient_id: string
          priority?: string | null
          reason: string
          receiving_doctor?: string | null
          receiving_staff_id?: string | null
          referral_type?: string | null
          referring_doctor?: string | null
          referring_staff_id?: string | null
          scheduled_date?: string | null
          status: string
          to_center_id: string
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          expected_completion_date?: string | null
          from_center_id?: string
          has_shared_records?: boolean | null
          id?: string
          is_facility_referral?: boolean | null
          notes?: string | null
          patient_consent_date?: string | null
          patient_id?: string
          priority?: string | null
          reason?: string
          receiving_doctor?: string | null
          receiving_staff_id?: string | null
          referral_type?: string | null
          referring_doctor?: string | null
          referring_staff_id?: string | null
          scheduled_date?: string | null
          status?: string
          to_center_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_from_center_id_fkey"
            columns: ["from_center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_receiving_staff_id_fkey"
            columns: ["receiving_staff_id"]
            isOneToOne: false
            referencedRelation: "center_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referring_staff_id_fkey"
            columns: ["referring_staff_id"]
            isOneToOne: false
            referencedRelation: "center_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_to_center_id_fkey"
            columns: ["to_center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      review_analytics: {
        Row: {
          average_cleanliness_rating: number | null
          average_overall_rating: number | null
          average_staff_rating: number | null
          average_treatment_rating: number | null
          average_wait_time_rating: number | null
          center_id: string
          created_at: string | null
          five_star_count: number | null
          four_star_count: number | null
          id: string
          one_star_count: number | null
          period: string
          response_rate: number | null
          reviews_with_responses: number | null
          three_star_count: number | null
          total_reviews: number | null
          two_star_count: number | null
          updated_at: string | null
        }
        Insert: {
          average_cleanliness_rating?: number | null
          average_overall_rating?: number | null
          average_staff_rating?: number | null
          average_treatment_rating?: number | null
          average_wait_time_rating?: number | null
          center_id: string
          created_at?: string | null
          five_star_count?: number | null
          four_star_count?: number | null
          id?: string
          one_star_count?: number | null
          period: string
          response_rate?: number | null
          reviews_with_responses?: number | null
          three_star_count?: number | null
          total_reviews?: number | null
          two_star_count?: number | null
          updated_at?: string | null
        }
        Update: {
          average_cleanliness_rating?: number | null
          average_overall_rating?: number | null
          average_staff_rating?: number | null
          average_treatment_rating?: number | null
          average_wait_time_rating?: number | null
          center_id?: string
          created_at?: string | null
          five_star_count?: number | null
          four_star_count?: number | null
          id?: string
          one_star_count?: number | null
          period?: string
          response_rate?: number | null
          reviews_with_responses?: number | null
          three_star_count?: number | null
          total_reviews?: number | null
          two_star_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_analytics_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          responded_by: string
          review_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          responded_by: string
          review_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          responded_by?: string
          review_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          appointment_id: string | null
          center_id: string
          cleanliness_rating: number | null
          content: string | null
          created_at: string | null
          edited_at: string | null
          helpful_votes: number | null
          id: string
          is_anonymous: boolean | null
          is_edited: boolean | null
          is_verified: boolean | null
          moderated_by: string | null
          moderation_notes: string | null
          overall_rating: number
          patient_id: string
          photos: Json | null
          staff_rating: number | null
          status: string | null
          title: string | null
          total_votes: number | null
          treatment_rating: number | null
          updated_at: string | null
          wait_time_rating: number | null
        }
        Insert: {
          appointment_id?: string | null
          center_id: string
          cleanliness_rating?: number | null
          content?: string | null
          created_at?: string | null
          edited_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_edited?: boolean | null
          is_verified?: boolean | null
          moderated_by?: string | null
          moderation_notes?: string | null
          overall_rating: number
          patient_id: string
          photos?: Json | null
          staff_rating?: number | null
          status?: string | null
          title?: string | null
          total_votes?: number | null
          treatment_rating?: number | null
          updated_at?: string | null
          wait_time_rating?: number | null
        }
        Update: {
          appointment_id?: string | null
          center_id?: string
          cleanliness_rating?: number | null
          content?: string | null
          created_at?: string | null
          edited_at?: string | null
          helpful_votes?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_edited?: boolean | null
          is_verified?: boolean | null
          moderated_by?: string | null
          moderation_notes?: string | null
          overall_rating?: number
          patient_id?: string
          photos?: Json | null
          staff_rating?: number | null
          status?: string | null
          title?: string | null
          total_votes?: number | null
          treatment_rating?: number | null
          updated_at?: string | null
          wait_time_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          search_criteria: Json
          search_name: string
          search_type: string
          shared_with: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          search_criteria: Json
          search_name: string
          search_type: string
          shared_with?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          search_criteria?: Json
          search_name?: string
          search_type?: string
          shared_with?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      search_index: {
        Row: {
          center_id: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          keywords: string[] | null
          metadata: Json | null
          searchable_content: string
          updated_at: string | null
        }
        Insert: {
          center_id?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          keywords?: string[] | null
          metadata?: Json | null
          searchable_content: string
          updated_at?: string | null
        }
        Update: {
          center_id?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          keywords?: string[] | null
          metadata?: Json | null
          searchable_content?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_index_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_checker_results: {
        Row: {
          analysis_result: Json
          created_at: string
          follow_up_required: boolean | null
          id: string
          recommendations: string | null
          session_id: string | null
          suggested_conditions: Json | null
          symptoms: Json
          urgency_level: string
          user_id: string
        }
        Insert: {
          analysis_result: Json
          created_at?: string
          follow_up_required?: boolean | null
          id?: string
          recommendations?: string | null
          session_id?: string | null
          suggested_conditions?: Json | null
          symptoms: Json
          urgency_level: string
          user_id: string
        }
        Update: {
          analysis_result?: Json
          created_at?: string
          follow_up_required?: boolean | null
          id?: string
          recommendations?: string | null
          session_id?: string | null
          suggested_conditions?: Json | null
          symptoms?: Json
          urgency_level?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_checker_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configurations: {
        Row: {
          config_key: string
          config_type: string
          config_value: Json
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_type: string
          config_value: Json
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_type?: string
          config_value?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          center_id: string | null
          id: string
          metric_name: string
          metric_type: string
          metric_unit: string | null
          metric_value: number
          recorded_at: string | null
          tags: Json | null
        }
        Insert: {
          center_id?: string | null
          id?: string
          metric_name: string
          metric_type: string
          metric_unit?: string | null
          metric_value: number
          recorded_at?: string | null
          tags?: Json | null
        }
        Update: {
          center_id?: string | null
          id?: string
          metric_name?: string
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string | null
          tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "system_metrics_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_description: string | null
          activity_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_health_profiles: {
        Row: {
          age: number | null
          allergies: string[] | null
          blood_type: string | null
          chronic_conditions: string[] | null
          created_at: string
          current_medications: Json | null
          family_history: Json | null
          gender: string | null
          height_cm: number | null
          id: string
          last_checkup: string | null
          lifestyle_factors: Json | null
          patient_id: string | null
          risk_factors: Json | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string
          current_medications?: Json | null
          family_history?: Json | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          last_checkup?: string | null
          lifestyle_factors?: Json | null
          patient_id?: string | null
          risk_factors?: Json | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string
          current_medications?: Json | null
          family_history?: Json | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          last_checkup?: string | null
          lifestyle_factors?: Json | null
          patient_id?: string | null
          risk_factors?: Json | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_health_profiles_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_management: {
        Row: {
          account_status: string | null
          created_at: string
          id: string
          last_login: string | null
          login_count: number | null
          managed_by: string | null
          notes: string | null
          suspended_until: string | null
          suspension_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string | null
          created_at?: string
          id?: string
          last_login?: string | null
          login_count?: number | null
          managed_by?: string | null
          notes?: string | null
          suspended_until?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string | null
          created_at?: string
          id?: string
          last_login?: string | null
          login_count?: number | null
          managed_by?: string | null
          notes?: string | null
          suspended_until?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_ratings: {
        Row: {
          cons: string | null
          created_at: string | null
          helpful_votes: number | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          pros: string | null
          rated_by: string
          rating: number
          rating_categories: Json | null
          review_text: string | null
          review_title: string | null
          status: string | null
          total_votes: number | null
          transaction_reference: string | null
          transaction_type: string | null
          updated_at: string | null
          vendor_id: string
          verified_purchase: boolean | null
          would_recommend: boolean | null
        }
        Insert: {
          cons?: string | null
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          pros?: string | null
          rated_by: string
          rating: number
          rating_categories?: Json | null
          review_text?: string | null
          review_title?: string | null
          status?: string | null
          total_votes?: number | null
          transaction_reference?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vendor_id: string
          verified_purchase?: boolean | null
          would_recommend?: boolean | null
        }
        Update: {
          cons?: string | null
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          pros?: string | null
          rated_by?: string
          rating?: number
          rating_categories?: Json | null
          review_text?: string | null
          review_title?: string | null
          status?: string | null
          total_votes?: number | null
          transaction_reference?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vendor_id?: string
          verified_purchase?: boolean | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_ratings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "equipment_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      viral_reports: {
        Row: {
          affected_count: number | null
          contact_information: Json | null
          created_at: string | null
          description: string | null
          disease_type: string
          exposure_date: string | null
          health_authority_notified: boolean | null
          healthcare_facility_visited: string | null
          id: string
          investigated_by: string | null
          investigation_notes: string | null
          is_anonymous: boolean | null
          location_address: string | null
          location_latitude: number | null
          location_longitude: number | null
          metadata: Json | null
          notification_sent_at: string | null
          onset_date: string | null
          preventive_measures: Json | null
          public_health_actions: Json | null
          report_number: string
          reported_by: string | null
          risk_factors: Json | null
          status: string | null
          symptoms: Json
          test_results: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          affected_count?: number | null
          contact_information?: Json | null
          created_at?: string | null
          description?: string | null
          disease_type: string
          exposure_date?: string | null
          health_authority_notified?: boolean | null
          healthcare_facility_visited?: string | null
          id?: string
          investigated_by?: string | null
          investigation_notes?: string | null
          is_anonymous?: boolean | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          metadata?: Json | null
          notification_sent_at?: string | null
          onset_date?: string | null
          preventive_measures?: Json | null
          public_health_actions?: Json | null
          report_number: string
          reported_by?: string | null
          risk_factors?: Json | null
          status?: string | null
          symptoms: Json
          test_results?: Json | null
          type: string
          updated_at?: string | null
        }
        Update: {
          affected_count?: number | null
          contact_information?: Json | null
          created_at?: string | null
          description?: string | null
          disease_type?: string
          exposure_date?: string | null
          health_authority_notified?: boolean | null
          healthcare_facility_visited?: string | null
          id?: string
          investigated_by?: string | null
          investigation_notes?: string | null
          is_anonymous?: boolean | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          metadata?: Json | null
          notification_sent_at?: string | null
          onset_date?: string | null
          preventive_measures?: Json | null
          public_health_actions?: Json | null
          report_number?: string
          reported_by?: string | null
          risk_factors?: Json | null
          status?: string | null
          symptoms?: Json
          test_results?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_viral_reports_user"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          delivered_at: string | null
          delivery_duration_ms: number | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_headers: Json | null
          response_status: number | null
          retry_attempt: number | null
          succeeded: boolean | null
          webhook_id: string | null
        }
        Insert: {
          delivered_at?: string | null
          delivery_duration_ms?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          retry_attempt?: number | null
          succeeded?: boolean | null
          webhook_id?: string | null
        }
        Update: {
          delivered_at?: string | null
          delivery_duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          retry_attempt?: number | null
          succeeded?: boolean | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          center_id: string | null
          created_at: string | null
          created_by: string | null
          event_types: string[]
          failed_calls: number | null
          headers: Json | null
          id: string
          is_active: boolean | null
          last_error_at: string | null
          last_error_message: string | null
          last_success_at: string | null
          last_triggered_at: string | null
          name: string
          retry_count: number | null
          secret_token: string | null
          successful_calls: number | null
          timeout_seconds: number | null
          total_calls: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          event_types: string[]
          failed_calls?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          name: string
          retry_count?: number | null
          secret_token?: string | null
          successful_calls?: number | null
          timeout_seconds?: number | null
          total_calls?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          center_id?: string | null
          created_at?: string | null
          created_by?: string | null
          event_types?: string[]
          failed_calls?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_error_at?: string | null
          last_error_message?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          name?: string
          retry_count?: number | null
          secret_token?: string | null
          successful_calls?: number | null
          timeout_seconds?: number | null
          total_calls?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      referral_analytics: {
        Row: {
          avg_processing_time_hours: number | null
          count: number | null
          from_center_id: string | null
          is_facility_referral: boolean | null
          month: string | null
          status: string | null
          to_center_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_from_center_id_fkey"
            columns: ["from_center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_to_center_id_fkey"
            columns: ["to_center_id"]
            isOneToOne: false
            referencedRelation: "healthcare_centers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
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
          patient_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          category: string
          description: string
          tags: string[]
          is_public: boolean
          uploaded_by: string
          uploaded_by_name: string
          patient_name: string
          created_at: string
          updated_at: string
        }[]
      }
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
          request_expiry: string
          access_duration_days: number
          specific_records: Json
          notes: string
          created_at: string
          updated_at: string
        }[]
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
          category: string | null
          center_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_available: boolean | null
          name: string
          price: number | null
          requires_appointment: boolean | null
          updated_at: string | null
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
          request_id: string
          created_at: string
          updated_at: string
        }[]
      }
      get_patient_medical_record_access_logs: {
        Args: { p_patient_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          id: string
          access_time: string
          access_type: string
          accessed_by_name: string
          center_name: string
          record_details: Json
          ip_address: string
          user_agent: string
        }[]
      }
      get_referral_analytics: {
        Args: { center_id: string }
        Returns: Json
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
      record_metric: {
        Args: {
          p_metric_name: string
          p_metric_type: string
          p_metric_value: number
          p_metric_unit?: string
          p_tags?: Json
          p_center_id?: string
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
      track_analytics_event: {
        Args: {
          p_user_id: string
          p_center_id: string
          p_event_type: string
          p_event_category: string
          p_event_data?: Json
          p_session_id?: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_page_url?: string
        }
        Returns: string
      }
      update_center_performance_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      donation_status: "scheduled" | "completed" | "cancelled" | "rejected"
      donor_status:
        | "eligible"
        | "temporarily_deferred"
        | "permanently_deferred"
        | "suspended"
      facility_referral_type:
        | "equipment_transfer"
        | "staff_transfer"
        | "capacity_sharing"
        | "specialized_service"
        | "emergency_support"
        | "consultation"
      request_priority: "low" | "medium" | "high" | "critical"
      request_status:
        | "pending"
        | "approved"
        | "fulfilled"
        | "cancelled"
        | "expired"
      verification_status: "pending" | "verified" | "rejected" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      blood_type: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      donation_status: ["scheduled", "completed", "cancelled", "rejected"],
      donor_status: [
        "eligible",
        "temporarily_deferred",
        "permanently_deferred",
        "suspended",
      ],
      facility_referral_type: [
        "equipment_transfer",
        "staff_transfer",
        "capacity_sharing",
        "specialized_service",
        "emergency_support",
        "consultation",
      ],
      request_priority: ["low", "medium", "high", "critical"],
      request_status: [
        "pending",
        "approved",
        "fulfilled",
        "cancelled",
        "expired",
      ],
      verification_status: ["pending", "verified", "rejected", "expired"],
    },
  },
} as const
