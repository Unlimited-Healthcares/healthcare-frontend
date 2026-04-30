import { apiClient } from '@/lib/api-client';

export interface RehabExercise {
  name: string;
  sets: string;
  reps: string;
  videoUrl?: string;
  instructions?: string;
}

export interface RehabPlan {
  id: string;
  patientId: string;
  physioId: string;
  title: string;
  exercises: RehabExercise[];
  completionLogs?: any[];
  status: string;
  createdAt: string;
}

export const rehabService = {
  createPlan: async (data: { patientId: string; title: string; exercises: RehabExercise[] }) => {
    return apiClient.post<RehabPlan>('/clinical/rehab', data);
  },

  getPatientPlans: async (patientId: string) => {
    return apiClient.get<RehabPlan[]>(`/clinical/rehab?patientId=${patientId}`);
  },

  getPlan: async (id: string) => {
    return apiClient.get<RehabPlan>(`/clinical/rehab/${id}`);
  },

  logProgress: async (id: string, log: { exerciseName: string; completed: boolean; notes?: string }) => {
    return apiClient.post<RehabPlan>(`/clinical/rehab/${id}/progress`, log);
  }
};
