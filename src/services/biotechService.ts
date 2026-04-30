import apiClient from './apiClient';

export interface Equipment {
    id: string;
    name: string;
    serialNumber: string;
    type: string;
    status: 'online' | 'offline' | 'faulty';
    lastCalibration: string;
    location: string;
    centerId: string;
    metadata?: any;
}

export interface MaintenanceTicket {
    id: string;
    ticketNumber: string;
    equipmentId: string;
    equipment?: Equipment;
    issueDescription: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    reportedBy: string;
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    resolutionNotes?: string;
}

export const biotechService = {
    getEquipment: async (centerId?: string): Promise<Equipment[]> => {
        const response = await apiClient.get('/biotech/equipment', { params: { centerId } });
        return response.data;
    },

    updateEquipmentStatus: async (id: string, status: string, metadata?: any): Promise<Equipment> => {
        const response = await apiClient.put(`/biotech/equipment/${id}/status`, { status, metadata });
        return response.data;
    },

    getTickets: async (centerId?: string): Promise<MaintenanceTicket[]> => {
        const response = await apiClient.get('/biotech/tickets', { params: { centerId } });
        return response.data;
    },

    createTicket: async (data: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> => {
        const response = await apiClient.post('/biotech/tickets', data);
        return response.data;
    },

    resolveTicket: async (id: string, status: string, notes?: string): Promise<MaintenanceTicket> => {
        const response = await apiClient.put(`/biotech/tickets/${id}/resolve`, { status, notes });
        return response.data;
    }
};

export default biotechService;
