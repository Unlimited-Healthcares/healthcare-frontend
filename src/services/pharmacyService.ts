import apiClient from './apiClient';

export interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    stockLevel: number;
    minThreshold: number;
    status: 'ok' | 'low' | 'out_of_stock';
    batchNumber?: string;
    expiryDate?: string;
    category?: string;
    unitPrice?: number;
    centerId: string;
    createdAt: string;
    updatedAt: string;
}

export const pharmacyService = {
    getInventory: async (centerId?: string): Promise<InventoryItem[]> => {
        const response = await apiClient.get('/pharmacy/inventory', {
            params: { centerId }
        });
        return response.data;
    },

    createItem: async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
        const response = await apiClient.post('/pharmacy/inventory', data);
        return response.data;
    },

    updateStock: async (id: string, adjustment: number): Promise<InventoryItem> => {
        const response = await apiClient.put(`/pharmacy/inventory/${id}/stock`, { adjustment });
        return response.data;
    },

    getPendingPrescriptions: async (filters: any = {}): Promise<any[]> => {
        const response = await apiClient.get('/clinical/prescriptions', {
            params: { ...filters, status: 'pending' }
        });
        return response.data;
    },

    verifyPrescription: async (id: string, verificationData: { status: string; notes?: string }): Promise<any> => {
        const response = await apiClient.post(`/clinical/prescriptions/${id}/verify`, verificationData);
        return response.data;
    }
};
