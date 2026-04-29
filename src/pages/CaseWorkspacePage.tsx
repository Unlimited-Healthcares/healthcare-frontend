import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CaseWorkspace } from '@/components/clinical/CaseWorkspace';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const CaseWorkspacePage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto h-full">
            {id ? (
              <CaseWorkspace workspaceId={id} />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-white rounded-[40px] shadow-sm border border-slate-100">
                <p className="text-slate-400 font-bold uppercase tracking-widest">No Workspace Selected</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CaseWorkspacePage;
