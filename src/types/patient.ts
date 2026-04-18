export interface PatientBiodata {
  id: string;
  name: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  weight?: number;
  height?: number;
  insurance?: string;
  address?: string;
  phone?: string;
  nextOfKin?: string;
  photo?: string;
  allergies?: string[];
  medicalConditions?: string[];
  email?: string;
}

export interface MedicalReportData {
  patientId: string;
  reportType: string;
  diagnosis: string;
  prescription?: string;
  treatment?: string;
  recommendations?: string;
  notes?: string;
  followUpDate?: string;
  doctorId?: string;
  doctorName?: string;
  centerId?: string;
  centerName?: string;
  centerType?: string;
  centerAddress?: string;
  centerContact?: string;
  centerEmail?: string;
  reportId?: string;
  generatedDate?: string;
  bloodType?: string;
  allergies?: string;
  patientConsent?: boolean;
  pdfUrl?: string;
  verificationCode?: string;
  doctorSignature?: string;
}

export interface MedicalReportFile {
  id: string;
  report_id: string;
  patient_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  created_by: string;
  center_id: string | null;
  is_shared: boolean;
  patient_consent: boolean;
  center_name?: string;
}

export interface ConsentRecord {
  id: string;
  patient_id: string;
  granted_to_center_id: string;
  granted_by_center_id: string | null;
  data_type: 'medical_report' | 'patient_record' | 'file' | 'all';
  specific_id?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  consent_notes?: string;
}
