import apiClient from './apiClient';

export const clinicalService = {
    // Encounters
    createEncounter: (data: unknown) => apiClient.post('/clinical/encounters', data),
    getEncounters: (params?: unknown) => apiClient.get('/clinical/encounters', { params }),
    getEncounter: (id: string) => apiClient.get(`/clinical/encounters/${id}`),
    updateEncounter: (id: string, data: unknown) => apiClient.patch(`/clinical/encounters/${id}`, data),
    completeEncounter: (id: string) => apiClient.post(`/clinical/encounters/${id}/complete`),

    // Prescriptions
    createPrescription: (data: unknown) => apiClient.post('/clinical/prescriptions', data),
    getPrescriptions: (params?: unknown) => apiClient.get('/clinical/prescriptions', { params }),
    refillPrescription: (id: string) => apiClient.post(`/clinical/prescriptions/${id}/refill`),

    // Adherence
    getAdherence: (params?: unknown) => apiClient.get('/clinical/adherence', { params }),
    markAdherence: (id: string) => apiClient.post(`/clinical/adherence/${id}/taken`),

    // Consents
    getConsents: () => apiClient.get('/clinical/consents'),
    signConsent: (data: unknown) => apiClient.post('/clinical/consents', data),

    // Work List (from care-tasks)
    getWorkList: (params?: unknown) => apiClient.get('/care-tasks', { params }),
};
