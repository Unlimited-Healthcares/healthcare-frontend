import apiClient from './apiClient';

export interface CareTask {
    id: string;
    patientId: string;
    assignedToId?: string;
    createdBy: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    dueAt?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCareTaskData {
    patientId: string;
    assignedToId?: string;
    title: string;
    description?: string;
    dueAt?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: Record<string, any>;
}

class CareTaskService {
    async createCareTask(data: CreateCareTaskData): Promise<CareTask> {
        const response = await apiClient.post('/care-tasks', data);
        return response.data;
    }

    async getCareTasks(filters: { patientId?: string; assignedToId?: string; status?: string }): Promise<CareTask[]> {
        const params = new URLSearchParams();
        if (filters.patientId) params.append('patientId', filters.patientId);
        if (filters.assignedToId) params.append('assignedToId', filters.assignedToId);
        if (filters.status) params.append('status', filters.status);
        
        const response = await apiClient.get(`/care-tasks?${params.toString()}`);
        return response.data;
    }

    async updateCareTask(id: string, data: Partial<CareTask>): Promise<CareTask> {
        const response = await apiClient.patch(`/care-tasks/${id}`, data);
        return response.data;
    }

    async deleteCareTask(id: string): Promise<void> {
        await apiClient.delete(`/care-tasks/${id}`);
    }
}

export const careTaskService = new CareTaskService();
