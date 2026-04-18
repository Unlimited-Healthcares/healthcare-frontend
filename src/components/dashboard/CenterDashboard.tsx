import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PatientList } from './PatientList';
import { SchedulingCalendar } from './SchedulingCalendar';
import { MedicalRecords } from './MedicalRecords';
import { MedicalRecordRequestManagement } from './MedicalRecordRequestManagement';
import { ServiceManagement } from './ServiceManagement';

import { FilesManagement } from './FilesManagement';
import { ReferralSystem } from './ReferralSystem';
import { StaffRequestManagement } from '../requests/StaffRequestManagement';
import { FacilityManagement } from './FacilityManagement';
import { DicomViewer } from './DicomViewer';
import { AppointmentsCard } from './AppointmentsCard';
import { HealthRecordsCard } from './HealthRecordsCard';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CenterType } from '@/types/healthcare-centers';
import { EnterpriseHeader } from './EnterpriseHeader';
import { useCenterProfile } from '@/hooks/useCenterProfile';
import { QuickActions } from './QuickActions';
import { useAuth } from '@/hooks/useAuth';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { ClinicalReportModal } from '../clinical/ClinicalReportModal';
import { ClinicalRequestModal } from '../clinical/ClinicalRequestModal';
import {
  Users,
  Calendar,
  FileText,
  Activity,
  Settings,
  Pill,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useEffect } from 'react';
import { patientService } from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';
import { medicalReportsService } from '@/services/medicalReportsService';
import { Button } from '@/components/ui/button';

interface CenterDashboardProps {
  centerId: string;
  centerType?: CenterType;
  centerName?: string;
}

export function CenterDashboard({ centerId, centerType = CenterType.HOSPITAL, centerName = "Healthcare Center" }: CenterDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, profile: userProfile } = useAuth();
  const { profile, loading: loadingProfile } = useCenterProfile(centerId);
  const { trackUserAction } = useAnalytics(centerId || '');

  const individualName = (userProfile as any)?.displayName || (userProfile as any)?.display_name || user?.name || 'Administrator';
  const { handleQuickAction } = useQuickActionHandler();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    trackUserAction('tab_change', 'dashboard', { tab: value });
  };

  // Specialized Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    medicalRecords: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchCenterStats = async () => {
      if (!centerId) return;
      setStatsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const [patientsRes, appointmentsRes, recordsRes] = await Promise.all([
          patientService.getPatients({ centerId, limit: 1 } as any),
          appointmentService.getAppointments({
            centerId,
            dateFrom: today,
            dateTo: today,
            limit: 1
          }),
          medicalReportsService.getMedicalReports({ centerId, limit: 1 })
        ]);

        setStats({
          totalPatients: patientsRes.total || (patientsRes as any).pagination?.total || 0,
          appointmentsToday: (appointmentsRes as any).pagination?.total || (appointmentsRes as any).data?.length || 0,
          medicalRecords: (recordsRes as any).pagination?.total || (recordsRes as any).data?.length || 0
        });
      } catch (error) {
        console.error("Failed to fetch center stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchCenterStats();
  }, [centerId]);

  const onDashboardAction = (action: string, data?: any) => {
    if (action === 'ClinicalReport') {
      setIsReportModalOpen(true);
    } else if (action === 'ClinicalRequest') {
      setIsRequestModalOpen(true);
    } else {
      handleQuickAction(action, data);
    }
  };

  const getStats = () => {
    const baseStats = [
      {
        title: "Total Patients",
        value: statsLoading ? "..." : stats.totalPatients.toString(),
        change: "Real-time",
        icon: Users,
        color: "text-blue-600"
      },
      { title: "System Status", value: "Online", change: "100% uptime", icon: Activity, color: "text-emerald-600" },
    ];

    if (centerType === CenterType.PHARMACY) {
      return [
        ...baseStats,
        { title: "Active Orders", value: "0", change: "0 today", icon: Pill, color: "text-purple-600" },
        { title: "Inventory Status", value: "Optimal", change: "0 items low", icon: Settings, color: "text-amber-600" },
      ];
    }

    return [
      ...baseStats,
      {
        title: "Today's Appointments",
        value: statsLoading ? "..." : stats.appointmentsToday.toString(),
        change: stats.appointmentsToday > 0 ? "Scheduled today" : "No visits",
        icon: Calendar,
        color: "text-indigo-600"
      },
      {
        title: "Medical Records",
        value: statsLoading ? "..." : stats.medicalRecords.toString(),
        change: "Total records",
        icon: FileText,
        color: "text-rose-600"
      },
    ];
  };

  const displayStats = getStats();

  const hasMedicalStaff = profile?.personnels?.some(p =>
    p.role?.toLowerCase().includes('doctor') ||
    p.role?.toLowerCase().includes('nurse') ||
    p.specialization?.toLowerCase().includes('doctor') ||
    p.specialization?.toLowerCase().includes('nurse')
  ) || false;

  return (
    <div className="space-y-6">
      <EnterpriseHeader profile={profile} isLoading={loadingProfile} individualName={individualName} />

      <div className="-mt-6 space-y-4">
        <QuickActions user={user} onAction={onDashboardAction} hasMedicalStaff={hasMedicalStaff} />
        <IncomingWorkflowProposals />

        <ClinicalReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          centerData={profile}
        />

        <ClinicalRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppointmentsCard />
          <HealthRecordsCard />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat: any, i: number) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden relative rounded-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <stat.icon size={80} />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className={`text-xs mt-1 font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-gray-400'}`}>{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-gray-100/50 p-1 rounded-xl flex flex-wrap h-auto gap-1 overflow-hidden">
          <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="patients" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Patients</TabsTrigger>
          {centerType !== CenterType.PHARMACY && (
            <TabsTrigger value="appointments" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Appointments</TabsTrigger>
          )}
          {centerType === CenterType.PHARMACY && (
            <TabsTrigger value="inventory" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Inventory</TabsTrigger>
          )}
          <TabsTrigger value="records" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Records</TabsTrigger>
          <TabsTrigger value="services" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Services</TabsTrigger>
          <TabsTrigger value="pharmacy" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Pharmacy</TabsTrigger>
          <TabsTrigger value="staff" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Registry</TabsTrigger>
          <TabsTrigger value="imaging" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Imaging</TabsTrigger>
          <TabsTrigger value="referrals" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Referrals</TabsTrigger>
          <TabsTrigger value="management" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg">Activities Trend</CardTitle>
                <CardDescription>Metrics for the past 7 days</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-white">
                <CardTitle className="text-lg">Service Utilization</CardTitle>
                <CardDescription>Popular services this month</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="space-y-6">
                  <div className="text-center py-8 text-gray-500 italic text-sm">
                    No service utilization data available.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients">
          <PatientList centerId={centerId} />
        </TabsContent>

        <TabsContent value="appointments">
          <SchedulingCalendar />
        </TabsContent>

        <TabsContent value="records">
          <div className="grid gap-6">
            <MedicalRecords centerId={centerId} userRole="center_staff" onAction={onDashboardAction} hasMedicalStaff={hasMedicalStaff} />
            {hasMedicalStaff && <MedicalRecordRequestManagement centerId={centerId} />}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-6">
            <ServiceManagement centerId={centerId} />
            <FilesManagement centerId={centerId} />
          </div>
        </TabsContent>

        <TabsContent value="pharmacy" className="space-y-4">
          <div className="p-12 text-center text-gray-500 italic bg-white rounded-2xl border border-dashed border-gray-100 min-h-[400px] flex flex-col items-center justify-center gap-4">
            <Pill className="h-12 w-12 text-blue-100" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 not-italic">Hospital Pharmacy Management</h3>
              <p className="text-sm">Dispensing, Inventory & Prescription Fulfilling (Coming Soon)</p>
            </div>
            <Button variant="outline" className="mt-4 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
              Configure Pharmacy Workflow
            </Button>
          </div>
        </TabsContent>



        <TabsContent value="staff">
          <StaffRequestManagement centerId={centerId} centerName={centerName} />
        </TabsContent>

        <TabsContent value="imaging">
          <DicomViewer />
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralSystem centerId={centerId} />
        </TabsContent>

        <TabsContent value="management">
          <FacilityManagement centerId={centerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
