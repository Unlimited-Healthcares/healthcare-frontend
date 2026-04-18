import apiClient from './apiClient';

export interface SymptomMessage {
  role: 'user' | 'model';
  parts: string;
  timestamp: string;
}

export interface TriageCondition {
  name: string;
  likelihood: 'High' | 'Moderate' | 'Low';
  description: string;
}

export type TriageLevel = 'SELF_CARE' | 'GP_CONSULT' | 'URGENT_CLINIC' | 'EMERGENCY';

export interface TriageResult {
  triageLevel: TriageLevel;
  possibleConditions: TriageCondition[];
  recommendedSpecialist?: string;
  recommendedActions: string[];
  redFlags: string[];
  disclaimer: string;
}

export interface StartSessionPayload {
  initialSymptoms?: string;
  age?: string;
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  existingConditions?: string[];
  currentMedications?: string[];
}

export interface SessionResponse {
  sessionId: string;
  message: string;
}

export interface ContinueResponse {
  message: string;
  triageResult?: TriageResult;
  isComplete: boolean;
}

export interface SymptomSessionRecord {
  id: string;
  status: 'active' | 'completed' | 'abandoned';
  triageResult?: TriageResult;
  messages: SymptomMessage[];
  createdAt: string;
}

const symptomAnalysisService = {
  startSession: async (payload: StartSessionPayload): Promise<SessionResponse> => {
    const res = await apiClient.post('/ai/symptom/start', payload);
    return res.data;
  },

  continueSession: async (sessionId: string, message: string): Promise<ContinueResponse> => {
    const res = await apiClient.post('/ai/symptom/continue', { sessionId, message });
    return res.data;
  },

  getSession: async (sessionId: string): Promise<SymptomSessionRecord> => {
    const res = await apiClient.get(`/ai/symptom/session/${sessionId}`);
    return res.data;
  },

  getUserSessions: async (): Promise<SymptomSessionRecord[]> => {
    const res = await apiClient.get('/ai/symptom/sessions');
    return res.data;
  },

  abandonSession: async (sessionId: string): Promise<void> => {
    await apiClient.patch(`/ai/symptom/session/${sessionId}/abandon`);
  },
};

export default symptomAnalysisService;
