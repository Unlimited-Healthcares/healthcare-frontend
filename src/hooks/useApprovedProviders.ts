import { useState, useEffect, useRef } from 'react';
import { approvedProvidersService, ApprovedProvider } from '@/services/approvedProvidersService';
import { useAuth } from '@/hooks/useAuth';

interface UseApprovedProvidersReturn {
  doctors: ApprovedProvider[];
  centers: ApprovedProvider[];
  allProviders: ApprovedProvider[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCount: number;
}

export const useApprovedProviders = (): UseApprovedProvidersReturn => {
  const { profile } = useAuth();
  const [allProviders, setAllProviders] = useState<ApprovedProvider[]>([]);
  // Cache patientId for diagnostics; may be unused depending on UI
  const [, setPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchApprovedProviders = async () => {
    const resolvedPatientId = profile?.id || null;
    if (!resolvedPatientId) {
      setLoading(false);
      setError('Patient profile not found for this account.');
      return;
    }

    if (loading && hasFetched.current) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      hasFetched.current = true;

      // Use profile.id directly as patientId per API guide
      setPatientId(resolvedPatientId);
      try { sessionStorage.setItem('patientId', JSON.stringify(resolvedPatientId)); } catch {}

      const response = await approvedProvidersService.getApprovedProviders(resolvedPatientId);
      setAllProviders(response.providers);
    } catch (err: any) {
      console.error('Failed to fetch approved providers:', err);
      setError(err.message || 'Failed to load approved providers');
      setAllProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id && !hasFetched.current) {
      fetchApprovedProviders();
    } else if (!profile?.id) {
      setLoading(false);
      setError(null);
      setAllProviders([]);
      hasFetched.current = false;
      setPatientId(null);
      try { sessionStorage.removeItem('patientId'); } catch {}
    }
  }, [profile?.id]);

  const refetch = async () => {
    hasFetched.current = false;
    await fetchApprovedProviders();
  };

  // Filter providers by type
  const doctors = allProviders.filter(provider => provider.providerType === 'doctor');
  const centers = allProviders.filter(provider => provider.providerType === 'center');

  return {
    doctors,
    centers,
    allProviders,
    loading,
    error,
    refetch,
    totalCount: allProviders.length
  };
};
