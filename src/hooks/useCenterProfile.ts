import { useState, useEffect } from 'react';
import { CenterProfile } from '@/types/profile';
import { profileApi } from '@/services/profileApi';

export function useCenterProfile(centerId: string | null) {
    const [profile, setProfile] = useState<CenterProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!centerId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await profileApi.getCenterById(centerId);
                setProfile(data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching center profile:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [centerId]);

    return { profile, loading, error, setProfile };
}
