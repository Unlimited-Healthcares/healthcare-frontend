export interface Database {
  public: {
    Tables: {
      medical_record_requests: {
        Row: {
          id: string
          patient_id: string
          from_center_id: string
          to_center_id: string
          request_date: string
          status: 'pending' | 'approved' | 'denied' | 'cancelled'
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
          status?: 'pending' | 'approved' | 'denied' | 'cancelled'
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
          status?: 'pending' | 'approved' | 'denied' | 'cancelled'
          purpose?: string
          request_expiry?: string | null
          access_duration_days?: number
          specific_records?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_requests_from_center_id_fkey"
            columns: ["from_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_requests_to_center_id_fkey"
            columns: ["to_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          }
        ]
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
          access_level: 'read' | 'download'
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
          access_level?: 'read' | 'download'
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
          access_level?: 'read' | 'download'
          data_scope?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_shares_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "medical_record_requests"
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
            foreignKeyName: "medical_record_shares_from_center_id_fkey"
            columns: ["from_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_shares_to_center_id_fkey"
            columns: ["to_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          }
        ]
      }
      
      medical_record_access_logs: {
        Row: {
          id: string
          share_id: string
          accessed_by_id: string
          access_time: string
          access_type: 'view' | 'download' | 'print'
          access_details: Json | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          share_id: string
          accessed_by_id: string
          access_time?: string
          access_type: 'view' | 'download' | 'print'
          access_details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          share_id?: string
          accessed_by_id?: string
          access_time?: string
          access_type?: 'view' | 'download' | 'print'
          access_details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_access_logs_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "medical_record_shares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_access_logs_accessed_by_id_fkey"
            columns: ["accessed_by_id"]
            isOneToOne: false
            referencedRelation: "center_staff"
            referencedColumns: ["id"]
          }
        ]
      }
      
      patients: {
        Row: {
          medical_record_sharing_preferences: Json
        }
        Insert: {
          medical_record_sharing_preferences?: Json
        }
        Update: {
          medical_record_sharing_preferences?: Json
        }
      }
      
      medical_records: {
        Row: {
          is_shareable: boolean
          sharing_restrictions: Json | null
        }
        Insert: {
          is_shareable?: boolean
          sharing_restrictions?: Json | null
        }
        Update: {
          is_shareable?: boolean
          sharing_restrictions?: Json | null
        }
      }
    }
  }
} 