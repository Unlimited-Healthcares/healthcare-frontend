import type { Database } from './database.types';

// Database table types
export type CenterService = Database['public']['Tables']['center_services']['Row'];
export type CenterFile = Database['public']['Tables']['center_files']['Row'];

// Extended types with non-nullable booleans for UI
export type CenterServiceUI = Omit<CenterService, 'is_available' | 'requires_appointment' | 'created_at' | 'updated_at'> & {
  is_available: boolean;
  requires_appointment: boolean;
  created_at: string;
  updated_at: string;
};

// Extended types with additional properties
export type CenterFileWithDetails = Omit<CenterFile, 'is_public' | 'created_at' | 'updated_at'> & {
  is_public: boolean;
  created_at: string;
  updated_at: string;
  uploaded_by_name: string;
  patient_name?: string;
};

// Form data types
export interface CenterServiceFormData {
  name: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
  currency?: string;
  is_available: boolean;
  requires_appointment: boolean;
  category?: string;
}

export interface CenterFileFormData {
  file: File;
  patient_id?: string;
  category: string;
  description?: string;
  tags?: string[];
  is_public: boolean;
}

// Query params types
export interface CenterServiceQueryParams {
  center_id: string;
  category?: string;
  is_available?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CenterFileQueryParams {
  center_id: string;
  patient_id?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Response types
export interface CenterServiceResponse {
  success: boolean;
  message: string;
  service_id?: string;
}

export interface CenterFileResponse {
  success: boolean;
  message: string;
  file_id?: string;
  file_path?: string;
}

// Service categories
export const SERVICE_CATEGORIES = [
  'Consultation',
  'Diagnostic',
  'Treatment',
  'Surgery',
  'Preventive',
  'Rehabilitation',
  'Radiology',
  'Pharmacy',
  'Emergency',
  'Maternity',
  'Pediatric',
  'Geriatric',
  'Psychiatric',
  'Other'
];

// File categories
export const FILE_CATEGORIES = [
  'Medical Report',
  'Test Result',
  'Prescription',
  'Radiology Image',
  'Consent Form',
  'Insurance Document',
  'Administrative',
  'Practice Document',
  'Educational',
  'Discharge Summary',
  'Referral Document',
  'Other'
]; 