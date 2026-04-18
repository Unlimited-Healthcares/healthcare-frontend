import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { healthcareCentersService } from '@/services/healthcareCentersService';
import { toast } from 'sonner';

type StaffRow = {
  id: string;
  userId: string;
  centerId: string;
  role: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    displayId?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      displayName?: string;
      specialization?: string;
    };
  };
};

interface CenterStaffListProps {
  centerId: string;
  centerPhone?: string;
  centerEmail?: string;
}

export const CenterStaffList: React.FC<CenterStaffListProps> = ({ centerId, centerPhone, centerEmail }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = useMemo(() => user?.roles?.includes('center') || user?.roles?.includes('admin'), [user?.roles]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch staff list with user details already included
      const staff = await healthcareCentersService.getCenterStaff(centerId);
      console.log('🔍 Raw API response from getCenterStaff:', staff);
      console.log('🔍 Staff count:', (staff || []).length);
      console.log('🔍 Each staff member structure:', (staff || []).map(s => ({
        id: s.id,
        userId: s.userId,
        role: s.role,
        hasUser: !!s.user,
        user: s.user,
        userProfile: s.user?.profile
      })));
      setRows(staff || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (centerId) {
      load();
    }
  }, [centerId]);

  const fullName = (r: StaffRow) => {
    console.log('🔍 fullName called for staff member:', {
      id: r.id,
      userId: r.userId,
      role: r.role,
      hasUser: !!r.user,
      user: r.user,
      profile: r.user?.profile
    });

    const p = r.user?.profile;
    if (p?.displayName) {
      console.log('✅ Using displayName:', p.displayName);
      return p.displayName;
    }
    if (p?.firstName || p?.lastName) {
      const name = `${p?.firstName || ''} ${p?.lastName || ''}`.trim();
      console.log('✅ Using firstName/lastName:', name);
      return name;
    }
    if (r.user?.email) {
      const emailName = r.user.email.split('@')[0];
      console.log('✅ Using email name:', emailName);
      return emailName;
    }
    console.log('⚠️ Falling back to Staff Member (role)');
    return `Staff Member (${r.role})`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Center Staff</CardTitle>
          <div className="flex items-center gap-2">
            {canManage && (
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="ml-2">{loading ? 'Refreshing…' : 'Refresh'}</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-gray-600">No staff yet.</div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={''} />
                    <AvatarFallback>{fullName(r).slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{fullName(r)}</div>
                    <div className="text-xs text-gray-600">{r.user?.email || 'No email available'}</div>
                    {(centerPhone || centerEmail) && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-indigo-700 uppercase">Registry:</span>
                        <span className="text-[9px] text-gray-500">{centerPhone || centerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {r.role === 'owner' ? (
                    <Badge variant="default" className="capitalize bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
                      <Crown className="h-3 w-3 mr-1" />
                      Owner
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="capitalize">{r.role}</Badge>
                  )}
                  {r.user?.profile?.specialization && (
                    <span className="text-xs text-gray-700">{r.user.profile.specialization}</span>
                  )}
                  <Button
                    variant="link"
                    className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 p-0 h-auto"
                    onClick={() => {
                      toast.info(`Routing request to the Hospital Registry Secretary...`);
                    }}
                  >
                    Contact Secretary
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CenterStaffList;


