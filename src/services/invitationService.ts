import apiClient from './apiClient';

export interface Invitation {
    id: string;
    email: string;
    invitationType: 'staff_invitation' | 'doctor_invitation' | 'patient_invitation' | 'collaboration_invitation';
    role: string;
    status: 'pending' | 'accepted' | 'declined';
    token: string;
    centerId?: string;
    senderId: string;
    expiresAt: string;
    createdAt: string;
}

export interface CreateInvitationDto {
    email: string;
    invitationType: string;
    role: string;
    centerId?: string;
    message?: string;
    metadata?: Record<string, any>;
}

export const invitationService = {
    async createInvitation(invitationData: CreateInvitationDto): Promise<Invitation> {
        const response = await apiClient.post<Invitation>('/invitations', invitationData);
        return response.data;
    },

    async getInvitationsByCenter(centerId: string, page = 1, limit = 10): Promise<{
        invitations: Invitation[];
        total: number;
        page: number;
        hasMore: boolean;
    }> {
        const response = await apiClient.get(`/invitations/center/${centerId}?page=${page}&limit=${limit}`);
        return response.data;
    },

    async getPendingInvitations(): Promise<Invitation[]> {
        const response = await apiClient.get<Invitation[]>('/invitations/pending');
        return response.data;
    },

    async declineInvitation(token: string): Promise<void> {
        await apiClient.post(`/invitations/decline/${token}`);
    }
};

export default invitationService;
