import { DashboardLayout } from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { profileApi } from "@/services/profileApi";
import { CenterDashboard } from "@/components/dashboard/CenterDashboard";
import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard";
import { NurseDashboard } from "@/components/dashboard/NurseDashboard";
import { HospitalRegistryDashboard } from "@/components/dashboard/StaffDashboard";
import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { PharmacyDashboard } from "@/components/dashboard/PharmacyDashboard";
import { DiagnosticDashboard } from "@/components/dashboard/DiagnosticDashboard";
import { FitnessDashboard } from "@/components/dashboard/FitnessDashboard";
import { AmbulanceDashboard } from "@/components/dashboard/AmbulanceDashboard";
import { MortuaryDashboard } from "@/components/dashboard/MortuaryDashboard";
import { MaternityDashboard } from "@/components/dashboard/MaternityDashboard";
import { VirologyDashboard } from "@/components/dashboard/VirologyDashboard";
import { PsychiatricDashboard } from "@/components/dashboard/PsychiatricDashboard";
import { BiotechDashboard } from "@/components/dashboard/BiotechDashboard";
import { CenterType } from "@/types/healthcare-centers";
import { ProfileCompletionWidget } from "@/components/dashboard/ProfileCompletionWidget";
import { SpecialtyServicesWidget } from "@/components/dashboard/SpecialtyServicesWidget";
import { DollarSign, CheckCircle, AlertCircle, Clock, XCircle, ShieldCheck, Shield, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getLicenseStatus, cn } from "@/lib/utils";

const DashboardHome = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  // License status for professionals
  const primaryRole = user?.roles?.[0] || 'patient';
  const licenseInfo = getLicenseStatus(user?.licenseExpiryDate);
  const isProfessional = ['doctor', 'nurse', 'staff', 'pharmacy', 'diagnostic'].includes(primaryRole);

  const [resolvedCenterId, setResolvedCenterId] = useState<string | null>(null);
  const [centerData, setCenterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isCenterRole = ['center', 'staff', 'pharmacy', 'diagnostic', 'fitness_center', 'ambulance_service', 'mortuary', 'maternity', 'virology', 'psychiatric'].includes(primaryRole);

  useEffect(() => {
    const initCenterId = async () => {
      if (!isCenterRole) return;

      let centerId = (profile as any)?.center_id || (profile as any)?.centerId;

      if (!centerId && user?.id) {
        setIsLoading(true);
        try {
          const center = await profileApi.getCenterByUserId(user.id);
          if (center) {
            setCenterData(center);
            setResolvedCenterId((center as any).id);
          }
        } catch (e) {
          console.error('🧭 Dashboard: failed to fetch center by user id', e);
        } finally {
          setIsLoading(false);
        }
      } else if (centerId && !centerData) {
        setIsLoading(true);
        try {
          const details = await profileApi.getCenterById(centerId);
          setCenterData(details);
          setResolvedCenterId(centerId);
        } catch (e) {
          console.error('🧭 Dashboard: failed to fetch center details', e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    initCenterId();
  }, [primaryRole, profile, user?.id, isCenterRole]);

  const getUserName = () => {
    const display = (profile as any)?.displayName || (profile as any)?.display_name || user?.name || user?.email?.split('@')[0] || 'User';
    return display;
  };

  const userName = getUserName();

  const licenseStatusMessage = (role: string, status: string, expiry?: Date | string) => {
    if (status === 'expired') {
      return `Your practice license has expired. You are not authorized to practice until renewal.`;
    }
    const expiryDate = expiry ? new Date(expiry).toLocaleDateString() : 'Unknown';
    return `Your practice license is expiring soon (Expiry: ${expiryDate}). Please renew to avoid practice disruption.`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Common Header for all dashboards
  const WelcomeHeader = ({ subtitle, roleLabel, badgeColor }: any) => (
    <div className="mb-4 sm:mb-8">
      <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-blue-400 blur-3xl -mr-32 -mt-32"></div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-xl sm:text-2xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-800 truncate">
                  Welcome back, {userName}
                </h1>
                {isCenterRole && (
                  <div className="flex items-center gap-2 mt-1 -mb-1">
                    <Building className="h-4 w-4 text-blue-500" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-tight">
                      {centerData?.name || 'Healthcare Facility'}
                    </span>
                  </div>
                )}
                <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border ${badgeColor} whitespace-nowrap`}>
                  {roleLabel}
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 font-medium line-clamp-2 md:line-clamp-none">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="flex flex-row md:flex-row gap-3 mt-2 md:mt-0">
            {user?.kycStatus === 'NOT_STARTED' && (
              <Button
                variant="outline"
                onClick={() => navigate('/kyc-verification')}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 rounded-xl px-4 sm:px-6 py-4 sm:py-6 h-auto font-bold flex flex-row md:flex-col items-center gap-2 transition-all flex-1 md:flex-none"
              >
                <div className="flex flex-row md:flex-col items-center gap-2">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Verify Identity</span>
                </div>
              </Button>
            )}

            {/* Professional Verification for Doctors/Nurses */}
            {(user?.roles?.includes('doctor') || user?.roles?.includes('nurse')) && user?.professionalStatus === 'NOT_STARTED' && (
              <Button
                variant="outline"
                onClick={() => navigate('/volunteer/medical-verify')}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 rounded-xl px-4 sm:px-6 py-4 sm:py-6 h-auto font-bold flex flex-row md:flex-col items-center gap-2 transition-all flex-1 md:flex-none"
              >
                <div className="flex flex-row md:flex-col items-center gap-2">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Verify Practice License</span>
                </div>
              </Button>
            )}

            {(user?.kycStatus === 'PENDING' || (user?.professionalStatus === 'PENDING' && (user?.roles?.includes('doctor') || user?.roles?.includes('nurse')))) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 sm:px-6 py-3 sm:py-4 flex flex-row md:flex-col items-center justify-center gap-2 flex-1 md:flex-none">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700 animate-pulse" />
                <div className="flex flex-col items-start md:items-center">
                  <span className="text-xs sm:text-sm text-blue-700 font-bold whitespace-nowrap">Verification Pending</span>
                  <span className="text-[8px] sm:text-[10px] text-blue-600 font-medium whitespace-nowrap">Manual review in progress</span>
                </div>
              </div>
            )}

            {user?.kycStatus === 'APPROVED' && user?.professionalStatus === 'APPROVED' && (
              <div className={cn(
                "border rounded-xl px-4 sm:px-6 py-3 sm:py-4 flex flex-row md:flex-col items-center justify-center gap-2 flex-1 md:flex-none",
                licenseInfo.bg,
                licenseInfo.border
              )}>
                {licenseInfo.status === 'expired' ? (
                  <XCircle className={cn("h-4 w-4 sm:h-5 sm:w-5", licenseInfo.text)} />
                ) : licenseInfo.status === 'warning' ? (
                  <AlertCircle className={cn("h-4 w-4 sm:h-5 sm:w-5", licenseInfo.text)} />
                ) : (
                  <CheckCircle className={cn("h-4 w-4 sm:h-5 sm:w-5", licenseInfo.text)} />
                )}
                <div className="flex flex-col items-start md:items-center">
                  <span className={cn("text-xs sm:text-sm font-bold whitespace-nowrap", licenseInfo.text)}>
                    {licenseInfo.message}
                  </span>
                  <span className={cn("text-[8px] sm:text-[10px] font-medium whitespace-nowrap", licenseInfo.text)}>
                    Account Active
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (primaryRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'nurse':
        return <NurseDashboard />;
      case 'staff':
        return <HospitalRegistryDashboard centerName={centerData?.name} />;
      case 'center':
        return (
          <CenterDashboard
            centerId={resolvedCenterId || ''}
            centerType={centerData?.type as CenterType}
            centerName={centerData?.name}
          />
        );
      case 'pharmacy':
        return (
          <PharmacyDashboard
            centerId={resolvedCenterId || ''}
            centerType={centerData?.type}
          />
        );
      case 'diagnostic':
        return (
          <DiagnosticDashboard
            centerId={resolvedCenterId || ''}
            centerType={centerData?.type}
          />
        );
      case 'fitness_center':
        return (
          <FitnessDashboard
            centerId={resolvedCenterId || ''}
            centerType={centerData?.type}
          />
        );
      case 'ambulance_service':
        return (
          <AmbulanceDashboard
            centerId={resolvedCenterId || ''}
            centerType={centerData?.type}
            centerName={centerData?.name}
          />
        );
      case 'mortuary':
        return (
          <MortuaryDashboard
            centerId={resolvedCenterId || ''}
            centerType={centerData?.type}
            centerName={centerData?.name}
          />
        );
      case 'maternity':
        return (
          <MaternityDashboard
            centerId={resolvedCenterId || ''}
            centerType={centerData?.type}
          />
        );
      case 'virology':
        return (
          <VirologyDashboard
            centerId={resolvedCenterId || ''}
            centerType={centerData?.type}
          />
        );
      case 'psychiatric':
        return (
          <PsychiatricDashboard
            centerId={resolvedCenterId || ''}
            centerType={centerData?.type}
          />
        );
      case 'biotech_engineer':
        return <BiotechDashboard />;
      case 'allied_practitioner':
        return <DoctorDashboard />;
      case 'patient':
      default:
        return <PatientDashboard />;
    }
  };

  const getRoleInfo = () => {
    const isProfessionalVerified = user?.professionalStatus === 'APPROVED';
    const isFullyVerified = isProfessionalVerified; // Professional status is key for doctors/nurses

    switch (primaryRole) {
      case 'doctor': {
        const specialty = (profile as any)?.specialization || (user as any)?.specialization;
        const role = specialty || 'Health Care Practitioner';
        if (isProfessionalVerified) {
          return {
            label: licenseInfo.status === 'expired' ? `Expired Practice License (${role})` : `Verified ${role}`,
            color: `${licenseInfo.bg} ${licenseInfo.text} ${licenseInfo.border}`,
            sub: licenseInfo.status === 'expired' ? "Your license has expired. Please renew it immediately." : "Here's your clinical practice overview"
          };
        }
        return {
          label: `Unverified ${role}`,
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          sub: "License verification required to accept appointments."
        };
      }
      case 'nurse': {
        const role = 'Nurse';
        if (isProfessionalVerified) {
          return {
            label: licenseInfo.status === 'expired' ? `Expired Practice License (${role})` : `Registered ${role}`,
            color: `${licenseInfo.bg} ${licenseInfo.text} ${licenseInfo.border}`,
            sub: licenseInfo.status === 'expired' ? "Your license has expired. Please renew it immediately." : "Here's your patient care monitoring"
          };
        }
        return {
          label: 'Unverified Nurse',
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          sub: "License verification required to accept appointments."
        };
      }
      case 'staff': return {
        label: isFullyVerified ? 'Registry Specialist' : 'Unverified Registry',
        color: isFullyVerified ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-amber-100 text-amber-700 border-amber-200',
        sub: "Managing patient admissions and clinical registry"
      };
      case 'center': return { label: 'Center Manager', color: 'bg-purple-100 text-purple-700 border-purple-200', sub: `Managing ${centerData?.name || 'Healthcare Center'}` };
      case 'pharmacy': return {
        label: isFullyVerified ? 'Pharmacist' : 'Unverified Pharmacist',
        color: isFullyVerified ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-amber-100 text-amber-700 border-amber-200',
        sub: "Dispensing health and wellness"
      };
      case 'diagnostic': return {
        label: isFullyVerified ? 'Diagnostic Specialist' : 'Unverified Diagnostic Specialist',
        color: isFullyVerified ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-amber-100 text-amber-700 border-amber-200',
        sub: "Analyzing metrics for better health"
      };
      case 'fitness_center': return { label: 'Fitness Expert', color: 'bg-orange-100 text-orange-700 border-orange-200', sub: "Empowering active lifestyles" };
      case 'ambulance_service': return { label: 'Medical Transport', color: 'bg-red-100 text-red-700 border-red-200', sub: "Emergency transport and logistics" };
      case 'mortuary': return { label: 'Mortuary Service', color: 'bg-zinc-100 text-zinc-700 border-zinc-200', sub: "Funeral and mortuary management" };
      case 'maternity': return { label: 'Maternity Center', color: 'bg-pink-100 text-pink-700 border-pink-200', sub: "Antenatal, delivery and postnatal care" };
      case 'virology': return { label: 'Virology Specialist', color: 'bg-blue-100 text-blue-700 border-blue-200', sub: "Virus research and outbreak monitoring" };
      case 'psychiatric': return { label: 'Psychiatric Specialist', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', sub: "Mental health and psychiatric care" };
      case 'biotech_engineer': return { label: 'Biotech Engineer', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', sub: "System analytics & research monitoring" };
      case 'allied_practitioner': {
        const specialty = (profile as any)?.specialization || (user as any)?.specialization;
        const role = specialty || 'Allied Healthcare Practitioner';
        if (isProfessionalVerified) {
          return {
            label: licenseInfo.status === 'expired' ? `Expired Practice License (${role})` : `Verified ${role}`,
            color: `${licenseInfo.bg} ${licenseInfo.text} ${licenseInfo.border}`,
            sub: licenseInfo.status === 'expired' ? "Your license has expired. Please renew it immediately." : "Clinical practice and patient care overview"
          };
        }
        return {
          label: `Unverified ${role}`,
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          sub: "License verification required to accept clinical requests."
        };
      }
      case 'admin': return { label: 'System Admin', color: 'bg-red-100 text-red-700 border-red-200', sub: "Platform-wide system health and management" };
      default: return { label: 'Healthcare Patient', color: 'bg-green-100 text-green-700 border-green-200', sub: "Review your health journey and access services" };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="container mx-auto pb-32 sm:pb-12 max-w-full">
      <WelcomeHeader
        title={`Welcome back, ${userName}!`}
        subtitle={roleInfo.sub}
        roleLabel={roleInfo.label}
        badgeColor={roleInfo.color}
      />

      {isProfessional && licenseInfo.status !== 'good' && (
        <div className={cn("mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700 shadow-lg", licenseInfo.bg, licenseInfo.border)}>
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-xl text-white shadow-sm", licenseInfo.status === 'expired' ? 'bg-red-500' : 'bg-amber-500')}>
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className={cn("text-base font-black tracking-tight", licenseInfo.text)}>
                PRACTICE LICENSE: {licenseInfo.message.toUpperCase()}
              </p>
              <p className={cn("text-xs opacity-80 font-bold leading-relaxed", licenseInfo.text)}>
                {licenseStatusMessage(primaryRole, licenseInfo.status, user?.licenseExpiryDate)}
              </p>
            </div>
          </div>
          <Button
            size="lg"
            variant="ghost"
            className={cn("h-12 text-sm font-black px-8 rounded-xl hover:bg-white/50 transition-all active:scale-95", licenseInfo.text)}
            onClick={() => navigate('/profile?edit=true')}
          >
            Renew Documentation
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 sm:mb-8">
        <ProfileCompletionWidget />
        <SpecialtyServicesWidget />
      </div>

      <div className="w-full">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardHome />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
