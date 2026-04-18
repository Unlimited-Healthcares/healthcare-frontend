// Prefer using profile.id (patientId) directly from auth context.
import { apiClient } from '@/lib/api-client';

export interface PatientRecord {
  id: string;
  userId: string;
  patientId?: string;
  fullName?: string;
  age?: number;
  gender?: string;
  lastVisit?: string | Date;
  status?: string;
  vitals?: {
    heartRate?: number;
    bp?: string;
    temp?: number;
    spO2?: number;
    lastUpdated?: string;
  };
  tasks?: Array<{
    id: string;
    title: string;
    time: string;
    status: 'pending' | 'done';
  }>;
  [key: string]: unknown;
}

class PatientService {
  // Returns the current authenticated user's patient record
  async getCurrentPatient(): Promise<PatientRecord | null> {
    try {
      const response = await apiClient.get<PatientRecord>('/patients/me');
      return response || null;
    } catch (error) {
      console.error('❌ patientService.getCurrentPatient failed:', error);
      return null;
    }
  }

  // Returns all patients (paginated, with search)
  async getPatients(params: { page?: number; limit?: number; search?: string, centerId?: string } = {}): Promise<{ data: PatientRecord[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.centerId) queryParams.append('centerId', params.centerId);

      const queryString = queryParams.toString();
      const url = `/patients${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<{ data: PatientRecord[]; total: number }>(url);
      return response || { data: [], total: 0 };
    } catch (error) {
      console.error('❌ patientService.getPatients failed:', error);
      return { data: [], total: 0 };
    }
  }

  // Returns a specific patient by ID
  async getPatientById(id: string): Promise<PatientRecord | null> {
    try {
      const response = await apiClient.get<PatientRecord>(`/patients/${id}`);
      return response || null;
    } catch (error) {
      console.error('❌ patientService.getPatientById failed:', error);
      return null;
    }
  }

  // Creates a new patient record
  async createPatient(data: Partial<PatientRecord>): Promise<PatientRecord | null> {
    try {
      const response = await apiClient.post<PatientRecord>('/patients', data);
      return response || null;
    } catch (error) {
      console.error('❌ patientService.createPatient failed:', error);
      return null;
    }
  }

  // Returns a patient record by userId
  async getPatientByUserId(userId: string): Promise<PatientRecord | null> {
    try {
      const response = await apiClient.get<PatientRecord>(`/patients?userId=${userId}`);
      // The backend might return a list or a single object. 
      // Based on findByUserId implementation in backend, it's a single object if using /patients/me.
      // But for a doctor, we might need a search.
      return (response as any)?.data?.[0] || response || null;
    } catch (error) {
      console.error('❌ patientService.getPatientByUserId failed:', error);
      return null;
    }
  }
}

export const patientService = new PatientService();
