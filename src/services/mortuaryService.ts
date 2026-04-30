import apiClient from './apiClient';
import { ApiResponse } from '@/types/auth';

export enum MortuaryStatus {
    STORED = 'Stored',
    PENDING_RELEASE = 'Pending Release',
    PENDING_AUTOPSY = 'Pending Autopsy',
    RELEASED = 'Released',
    LEGAL_HOLD = 'Legal Hold',
}

export interface MortuaryRecord {
    id: string;
    deceasedName: string;
    intakeDate: string;
    unit: string;
    status: MortuaryStatus;
    representativeName?: string;
    representativePhone?: string;
    notes?: string;
    signedManifestUrl?: string;
    centerId: string;
    createdAt?: string;
    updatedAt?: string;
}

export const mortuaryService = {
    getRecords: async (centerId: string): Promise<MortuaryRecord[]> => {
        const response = await apiClient.get<MortuaryRecord[]>(`/mortuary?centerId=${centerId}`);
        return response.data;
    },

    getRecord: async (id: string): Promise<MortuaryRecord> => {
        const response = await apiClient.get<MortuaryRecord>(`/mortuary/${id}`);
        return response.data;
    },

    createRecord: async (data: Partial<MortuaryRecord>): Promise<MortuaryRecord> => {
        const response = await apiClient.post<MortuaryRecord>('/mortuary', data);
        return response.data;
    },

    updateRecord: async (id: string, data: Partial<MortuaryRecord>): Promise<MortuaryRecord> => {
        const response = await apiClient.patch<MortuaryRecord>(`/mortuary/${id}`, data);
        return response.data;
    },

    deleteRecord: async (id: string): Promise<void> => {
        await apiClient.delete(`/mortuary/${id}`);
    },
};
