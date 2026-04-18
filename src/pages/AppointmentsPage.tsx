import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import AppointmentManagement from '@/components/appointments/AppointmentManagement';
import { patientService } from '@/services/patientService';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const AppointmentsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [resolvedPatientId, setResolvedPatientId] = useState<string | undefined>(undefined);
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => {
    const roles = user?.roles || [];
    const profilePatientId = roles.includes('patient') ? (profile as any)?.id : undefined;
    const resolvedProviderId = roles.includes('doctor') ? user?.id : undefined;
    console.log('🧭 AppointmentsPage init (pre-resolve):', {
      roles,
      userId: user?.id,
      profileId: (profile as any)?.id,
      profilePatientId,
      resolvedProviderId
    });

    // Resolve authoritative patientId from backend
    const resolvePatient = async () => {
      if (!roles.includes('patient')) {
        setResolvedPatientId(undefined);
        return;
      }
      try {
        const record = await patientService.getCurrentPatient();
        const id = (record as any)?.id || profilePatientId;
        setResolvedPatientId(id);
        console.log('✅ Resolved patientId:', { from: record ? 'api' : 'profile', id, record });
      } catch (e) {
        setResolvedPatientId(profilePatientId);
        console.warn('⚠️ Failed to resolve patient via API. Falling back to profile.id');
      }
    };
    resolvePatient();
  }, [user?.id, (profile as any)?.id, user?.roles]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 pb-28 md:pb-0">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Service Schedule</h2>
              <Button
                onClick={() => setShowBookModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Service Session
              </Button>
            </div>
            <AppointmentManagement
              patientId={user?.roles?.includes('patient') ? resolvedPatientId : undefined}
              providerId={user?.roles?.includes('doctor') ? user?.id : undefined}
              userRoles={user?.roles || []}
              userId={user?.id}
              showBookModal={showBookModal}
              setShowBookModal={setShowBookModal}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AppointmentsPage;
