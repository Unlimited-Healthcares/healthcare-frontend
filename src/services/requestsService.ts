import apiClient from './apiClient';

export interface CreateRequestData {
    recipientId?: string;
    requestType: string;
    message: string;
    metadata?: Record<string, any>;
}

export const requestsService = {
    createRequest: (data: CreateRequestData) => apiClient.post('/requests', data),
    getReceivedRequests: (params?: any) => apiClient.get('/requests/received', { params }),
    getSentRequests: (params?: any) => apiClient.get('/requests/sent', { params }),
    respondToRequest: (id: string, action: 'approve' | 'reject', message?: string, metadata?: any) =>
        apiClient.patch(`/requests/${id}/respond`, { action, message, metadata }),
};
