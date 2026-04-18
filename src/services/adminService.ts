import apiClient from './apiClient';

export interface AdminUserFilters {
    type?: string;
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    roles: string[];
    isActive: boolean;
    isSuspended: boolean;
    isBanned: boolean;
    kycStatus: string;
    createdAt: string;
    lastLogin?: string;
    specialization?: string;
}

class AdminService {
    async getUsers(filters: AdminUserFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) params.append(key, value.toString());
        });
        const response = await apiClient.get(`/admin/users?${params.toString()}`);
        return response.data;
    }

    async getUserStats() {
        const response = await apiClient.get('/admin/users/stats');
        return response.data;
    }

    async getDashboardSummary() {
        const response = await apiClient.get('/admin/users/dashboard-summary');
        return response.data;
    }

    async suspendUser(userId: string, reason: string, until: Date) {
        const response = await apiClient.put(`/admin/users/${userId}/suspend`, {
            suspensionReason: reason,
            suspendedUntil: until.toISOString()
        });
        return response.data;
    }

    async activateUser(userId: string) {
        const response = await apiClient.put(`/admin/users/${userId}/activate`);
        return response.data;
    }

    async reviewKycSubmission(submissionId: string, action: 'APPROVED' | 'REJECTED', notes?: string) {
        const response = await apiClient.put(`/admin/users/kyc/submissions/${submissionId}/review`, {
            action,
            notes
        });
        return response.data;
    }

    async getKycSubmissions(status?: string) {
        const response = await apiClient.get(`/admin/users/kyc/submissions${status ? `?status=${status}` : ''}`);
        return response.data;
    }

    // Professional Verification (Medical Volunteers)
    async getProfessionalSubmissions(status?: string) {
        const response = await apiClient.get(`/medical-volunteer/submissions${status ? `?status=${status}` : ''}`);
        return response.data;
    }

    async reviewProfessionalSubmission(submissionId: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
        const response = await apiClient.put(`/medical-volunteer/submissions/${submissionId}/review`, {
            status,
            notes
        });
        return response.data;
    }

    async getSystemHealth() {
        const response = await apiClient.get('/admin/system/health');
        return response.data;
    }

    async getFinanceStats() {
        const response = await apiClient.get('/admin/system/finance-stats');
        return response.data;
    }

    async getGlobalLedger(limit: number = 50) {
        const response = await apiClient.get(`/admin/system/global-ledger?limit=${limit}`);
        return response.data;
    }

    async getMaintenanceMode() {
        const response = await apiClient.get('/admin/system/maintenance-mode');
        return response.data;
    }

    async updateMaintenanceMode(enabled: boolean, message?: string) {
        const response = await apiClient.put('/admin/system/maintenance-mode', {
            enabled,
            message
        });
        return response.data;
    }

    async getConfigurations() {
        const response = await apiClient.get('/admin/system/configurations');
        return response.data;
    }

    async getConfiguration(key: string) {
        const response = await apiClient.get(`/admin/system/configurations/${key}`);
        return response.data;
    }

    async updateConfiguration(key: string, data: { configValue: any, description?: string, isActive?: boolean }) {
        const response = await apiClient.put(`/admin/system/configurations/${key}`, data);
        return response.data;
    }

    async provisionUser(userData: { name: string; email: string; role: string; password?: string; phone?: string }) {
        const response = await apiClient.post('/admin/users', userData);
        return response.data;
    }

    async deleteUser(userId: string) {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response.data;
    }
}

export const adminService = new AdminService();
export default adminService;
