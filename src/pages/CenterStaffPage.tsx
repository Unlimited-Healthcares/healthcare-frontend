import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import CenterStaffList from '@/components/dashboard/CenterStaffList';
import { useAuth } from '@/hooks/useAuth';
import { profileApi } from '@/services/profileApi';
import { discoveryService } from '@/services/discoveryService';

export default function CenterStaffPage() {
  const { user, profile } = useAuth();
  const [centerId, setCenterId] = useState<string | null>(null);
  const [resolving, setResolving] = useState<boolean>(true);

  useEffect(() => {
    const resolveCenter = async () => {
      try {
        setResolving(true);
        
        // First try to get center ID from user profile
        const fromProfile = (profile as any)?.center_id || (profile as any)?.centerId;
        console.log('🔍 Profile center ID:', fromProfile);
        if (fromProfile) {
          console.log('✅ Using center ID from profile:', fromProfile);
          setCenterId(fromProfile);
          return;
        }
        
        if (!user?.id) {
          setCenterId(null);
          return;
        }

        // Try to get center by user ID
        try {
          console.log('🔍 Trying to get center by user ID:', user.id);
          const userCenter = await profileApi.getCenterByUserId(user.id);
          console.log('🔍 User center response:', userCenter);
          if (userCenter && userCenter.id) {
            console.log('✅ Using center ID from user center:', userCenter.id);
            setCenterId(userCenter.id);
            return;
          }
        } catch (e) {
          console.warn('Failed to get center by user ID:', e);
        }

        // Fallback: Get a valid center from the discovery service
        try {
          console.log('🔍 Trying to get centers from discovery service...');
          const centers = await discoveryService.searchCenters({
            type: 'hospital',
            page: 1,
            limit: 1
          });
          
          console.log('🔍 Discovery service response:', centers);
          if (centers.centers && centers.centers.length > 0) {
            console.log('✅ Using center ID from discovery service:', centers.centers[0].id);
            setCenterId(centers.centers[0].id);
            return;
          }
        } catch (e) {
          console.warn('Failed to get centers from discovery service:', e);
        }

        // If all else fails, set to null
        setCenterId(null);
      } catch (e) {
        console.error('Error resolving center:', e);
        setCenterId(null);
      } finally {
        setResolving(false);
      }
    };
    resolveCenter();
  }, [user?.id, profile]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {resolving ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Resolving center...</p>
              </div>
            </div>
          ) : centerId ? (
            <CenterStaffList centerId={centerId} />
          ) : (
            <div className="text-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">No Center Found</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Unable to resolve a center for staff management. This could be because:
                </p>
                <ul className="text-sm text-yellow-700 text-left space-y-1 mb-4">
                  <li>• Your profile doesn't have an associated center</li>
                  <li>• No centers are available in the system</li>
                  <li>• You don't have permission to access center staff</li>
                </ul>
                <p className="text-xs text-yellow-600">
                  Please contact your administrator or complete your center profile.
                </p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}


