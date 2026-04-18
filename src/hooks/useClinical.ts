import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicalService } from '@/services/clinicalService';

export const useEncounters = (params?: any) => {
    return useQuery({
        queryKey: ['clinical-encounters', JSON.stringify(params || {})],
        queryFn: () => clinicalService.getEncounters(params),
    });
};

export const useCreateEncounter = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => clinicalService.createEncounter(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinical-encounters'] });
        },
    });
};

export const usePrescriptions = (params?: any) => {
    return useQuery({
        queryKey: ['clinical-prescriptions', JSON.stringify(params || {})],
        queryFn: () => clinicalService.getPrescriptions(params),
    });
};

export const useCreatePrescription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => clinicalService.createPrescription(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinical-prescriptions'] });
        },
    });
};

export const useAdherence = (params?: any) => {
    return useQuery({
        queryKey: ['clinical-adherence', JSON.stringify(params || {})],
        queryFn: () => clinicalService.getAdherence(params),
    });
};

export const useMarkAdherence = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => clinicalService.markAdherence(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinical-adherence'] });
        },
    });
};

export const useWorkList = (params?: any) => {
    return useQuery({
        queryKey: ['clinical-worklist', JSON.stringify(params || {})],
        queryFn: () => clinicalService.getWorkList(params),
    });
};
