import { Database } from "@/integrations/supabase/types";
import type { GenericObject } from "@/types/common";

// Database table types
export type MedicalRecordRequest = Database["public"]["Tables"]["medical_record_requests"]["Row"];
export type MedicalRecordShare = Database["public"]["Tables"]["medical_record_shares"]["Row"];
export type MedicalRecordAccessLog = Database["public"]["Tables"]["medical_record_access_logs"]["Row"];
export type MedicalRecord = Database["public"]["Tables"]["medical_records"]["Row"];

// Extended types with joined data
export interface MedicalRecordRequestWithDetails extends Omit<MedicalRecordRequest, 'patient_id' | 'from_center_id' | 'to_center_id'> {
  patient_id: string;
  patient_name: string;
  from_center_id: string;
  from_center_name: string;
  to_center_id: string;
  to_center_name: string;
}

export interface MedicalRecordShareWithDetails extends Omit<MedicalRecordShare, 'patient_id' | 'from_center_id' | 'to_center_id'> {
  patient_id: string;
  patient_name: string;
  from_center_id: string;
  from_center_name: string;
  to_center_id: string;
  to_center_name: string;
}

export interface MedicalRecordAccessLogWithDetails extends MedicalRecordAccessLog {
  access_time: string;
  access_type: string;
  accessed_by_name: string;
  center_name: string;
  record_details: GenericObject;
}

// Request status type
export type MedicalRecordRequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled';

// Access level type
export type MedicalRecordAccessLevel = 'read' | 'download';

// Access type
export type MedicalRecordAccessType = 'view' | 'download' | 'print';

// Patient preferences
export interface MedicalRecordSharingPreferences {
  auto_approve_trusted: boolean;
  trusted_centers: string[];
  default_access_duration_days: number;
  notify_on_access: boolean;
}

// Request form data
export interface MedicalRecordRequestFormData {
  patient_id: string;
  from_center_id: string;
  to_center_id: string;
  purpose: string;
  access_duration_days: number;
  specific_records: GenericObject | null; // null means all records
  notes?: string;
}

// Response data
export interface MedicalRecordRequestResponseData {
  request_id: string;
  status: MedicalRecordRequestStatus;
  response_notes?: string;
  data_scope?: GenericObject;
  access_level?: MedicalRecordAccessLevel;
}

// Service function return types
export interface MedicalRecordRequestResponse {
  success: boolean;
  message: string;
  request_id?: string;
}

export interface MedicalRecordRequestApprovalResponse {
  success: boolean;
  message: string;
  share_id?: string;
  expiry_date?: string;
}

// Query parameters
export interface MedicalRecordRequestQueryParams {
  center_id: string;
  status?: MedicalRecordRequestStatus;
  direction?: 'incoming' | 'outgoing' | 'all';
  limit?: number;
  offset?: number;
}

export interface MedicalRecordShareQueryParams {
  center_id: string;
  direction?: 'incoming' | 'outgoing' | 'all';
  limit?: number;
  offset?: number;
}

export interface MedicalRecordAccessLogQueryParams {
  patient_id: string;
  limit?: number;
  offset?: number;
}

// Data scope types
export interface AllRecordsScope {
  all: true;
}

export interface SpecificRecordsScope {
  record_ids: string[];
  record_types?: string[];
  date_range?: {
    start: string;
    end: string;
  };
} 