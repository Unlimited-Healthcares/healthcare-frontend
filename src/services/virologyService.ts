
import apiClient from './apiClient';
import { ViralReport, ViralReportFilters, ViralReportsResponse } from '@/types/emergency';

export interface PathogenAlert {
    id: string;
    name: string;
    strain: string;
    time: string;
    threat: 'Low' | 'Moderate' | 'High' | 'Critical';
    status: string;
}

export interface VirologyStats {
    activeSamples: number;
    sequencesCompleted: number;
    safetyStatus: string;
    incubationTemp: number;
}

export const virologyService = {
    getStats: async (centerId: string): Promise<VirologyStats> => {
        // In a real scenario, this would be a dedicated endpoint
        // For now, we simulate with a template that can be integrated later
        return {
            activeSamples: 24,
            sequencesCompleted: 142,
            safetyStatus: 'BSL-3',
            incubationTemp: 37.0
        };
    },

    getPathogenAlerts: async (filters: ViralReportFilters = {}): Promise<PathogenAlert[]> => {
        try {
            const response = await apiClient.get<ViralReportsResponse>('/emergency/viral-reporting/reports', { params: filters });
            const reports = response.data.data;

            return reports.map(report => ({
                id: report.id,
                name: report.diseaseType,
                strain: report.metadata?.strain as string || 'General',
                time: new Date(report.createdAt).toLocaleTimeString(),
                threat: (report.metadata?.threatLevel as any) || 'Low',
                status: report.status
            }));
        } catch (error) {
            console.error('Failed to fetch pathogen alerts:', error);
            // Fallback to minimal data if service fails
            return [];
        }
    },

    getRecentSequences: async (centerId: string): Promise<any[]> => {
        // Fetch sequencing records from medical-records category 'virology-sequencing'
        const response = await apiClient.get('/medical-records/search', {
            params: {
                category: 'virology-sequencing',
                centerId
            }
        });
        return response.data.data || [];
    }
};

export default virologyService;
