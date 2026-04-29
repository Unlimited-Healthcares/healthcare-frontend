import { apiClient } from '@/lib/api-client';

export interface ClinicalWorkspace {
  id: string;
  title: string;
  description: string;
  patientId: string;
  encounterId?: string;
  chatRoomId: string;
  fileBucketId?: string;
  dicomStudyId?: string;
  status: 'active' | 'archived' | 'closed';
  createdAt: string;
  logs: any[];
}

export const workspaceService = {
  createWorkspace: async (data: any) => {
    const response = await apiClient.post('/clinical/workspaces', data) as any;
    return response.data || response;
  },

  getWorkspacesForPatient: async (patientId: string) => {
    const response = await apiClient.get(`/clinical/workspaces/patient/${patientId}`) as any;
    return response.data || response;
  },

  getWorkspace: async (id: string) => {
    const response = await apiClient.get(`/clinical/workspaces/${id}`) as any;
    return response.data || response;
  },

  addLogEntry: async (workspaceId: string, content: string) => {
    const response = await apiClient.post(`/clinical/workspaces/${workspaceId}/logs`, { content }) as any;
    return response.data || response;
  },

  getLogs: async (workspaceId: string) => {
    const response = await apiClient.get(`/clinical/workspaces/${workspaceId}/logs`) as any;
    return response.data || response;
  },

  addParticipant: async (workspaceId: string, userId: string) => {
    const response = await apiClient.post(`/clinical/workspaces/${workspaceId}/participants`, { userId }) as any;
    return response.data || response;
  }
};
