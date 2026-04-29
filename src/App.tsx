import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import SplashScreen from '@/pages/SplashScreen'
import OnboardingScreen from '@/pages/OnboardingScreen'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { App as CapApp } from '@capacitor/app'
import { Preferences } from '@capacitor/preferences'
import { toast as sonnerToast } from 'sonner'
import { toast as hotToast } from 'react-hot-toast'
import { BiometricLock } from '@/components/auth/BiometricLock'
import { AnimatePresence } from 'framer-motion'
import MaintenanceBanner from '@/components/common/MaintenanceBanner'
import UnderMaintenancePage from '@/components/common/UnderMaintenancePage'
import apiClient from '@/services/apiClient'

// Lazy load pages for code splitting
import Auth from '@/pages/Auth'
import Home from '@/pages/Home'
import Dashboard from '@/pages/Dashboard'
const ProfilePageNew = lazy(() => import('@/pages/ProfilePageNew'))
const AppointmentsPage = lazy(() => import('@/pages/AppointmentsPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const ChatPage = lazy(() => import('@/pages/ChatPage'))
const CenterDetails = lazy(() => import('@/pages/CenterDetails'))
const HealthRecords = lazy(() => import('@/pages/HealthRecords'))
const BloodDonationPage = lazy(() => import('@/pages/BloodDonationPage'))
const MedicalReportsPage = lazy(() => import('@/pages/MedicalReportsPage'))
const ReferralDashboardPage = lazy(() => import('@/pages/ReferralDashboardPage'))
const ReferralDetailsPage = lazy(() => import('@/pages/ReferralDetailsPage'))
const ReviewDashboardPage = lazy(() => import('@/pages/ReviewDashboardPage'))
const VideoConferencesPage = lazy(() => import('@/pages/VideoConferencesPage'))
const EmergencyDashboardPage = lazy(() => import('@/pages/EmergencyDashboardPage'))
const DiscoveryPage = lazy(() => import('@/pages/DiscoveryPage'))
const CentersPage = lazy(() => import('@/pages/CentersPage'))
const RequestsPage = lazy(() => import('@/pages/RequestsPage'))
const InvitationsPage = lazy(() => import('@/pages/InvitationsPage'))
const InvitePage = lazy(() => import('@/pages/InvitePage'))
const PublicProfilePage = lazy(() => import('@/pages/PublicProfilePage'))
const BookingPage = lazy(() => import('@/components/booking/BookingFlow'))
const CenterStaffListPage = lazy(() => import('@/pages/CenterStaffListPage'))
const PatientsPage = lazy(() => import('@/pages/PatientsPage'))
const ApprovedDoctorsPage = lazy(() => import('@/pages/ApprovedDoctorsPage'))
const ApprovedCentersPage = lazy(() => import('@/pages/ApprovedCentersPage'))
const VerifyReportPage = lazy(() => import('@/pages/VerifyReportPage'))
const KycVerificationPage = lazy(() => import('@/pages/KycVerificationPage'))
const DicomViewerPage = lazy(() => import('@/pages/DicomViewerPage'))
const ProviderVerificationPage = lazy(() => import('@/pages/ProviderVerificationPage'))
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'))
const AdminUserManagementPage = lazy(() => import('@/pages/AdminUserManagementPage'))
const AdminSettingsPage = lazy(() => import('@/pages/AdminSettingsPage'))
const AdminAuditPage = lazy(() => import('@/pages/AdminAuditPage'))
const AdminFinancePage = lazy(() => import('@/pages/AdminFinancePage'))
const DonorRewardsPage = lazy(() => import('@/pages/DonorRewardsPage'))
const UserSecurityPage = lazy(() => import('@/pages/UserSecurityPage'))
const TeleconsultPage = lazy(() => import('@/pages/TeleconsultPage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const WalletPage = lazy(() => import('@/pages/WalletPage'))
const CommunityPage = lazy(() => import('@/pages/CommunityPage'))
const VoluntaryServicePage = lazy(() => import('@/pages/VoluntaryServicePage'))
const SupportPage = lazy(() => import('@/pages/SupportPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const SymptomAnalysisPage = lazy(() => import('@/pages/SymptomAnalysisPage'))
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'))
const PaymentCallback = lazy(() => import('@/pages/PaymentCallback'))
const CalendarPage = lazy(() => import('@/pages/CalendarPage'))
const MedicalVolunteerVerificationPage = lazy(() => import('@/pages/MedicalVolunteerVerificationPage'))
const ConnectionsPage = lazy(() => import('@/pages/ConnectionsPage'))
const ClinicalWorkflow = lazy(() => import('@/pages/ClinicalWorkflow'))
const PatientClinicalDashboard = lazy(() => import('@/pages/PatientClinicalDashboard'))
const CaseWorkspacePage = lazy(() => import('@/pages/CaseWorkspacePage'))

const ONBOARDING_KEY = 'uhc_onboarding_complete'

function App() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  useIdleTimer(5 * 60 * 1000) // 5 minutes session timeout
  const lastBackPress = useRef<number>(0);

  // Dismiss all hot toasts on route change
  useEffect(() => {
    hotToast.dismiss();
  }, [location.pathname]);

  // Splash + onboarding flow (App only)
  const isNative = Capacitor.isNativePlatform()
  const [showSplash, setShowSplash] = useState(isNative)
  const [showOnboarding, setShowOnboarding] = useState(
    () => isNative && !localStorage.getItem(ONBOARDING_KEY)
  )
  const [isAppLocked, setIsAppLocked] = useState(false);

  useEffect(() => {
    if (isNative) {
      Preferences.get({ key: 'uhc_biometric_enabled' }).then(({ value }) => {
        if (value === 'true') setIsAppLocked(true);
      });
    }
  }, [isNative]);

  const handleSplashComplete = () => setShowSplash(false)

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  // Track if OTA check has already run in this session
  const otaChecked = useRef(false);
  const [maintenance, setMaintenance] = useState<{ enabled: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/system/settings');
        if (response.data.success) {
          setMaintenance({
            enabled: response.data.data.maintenanceMode,
            message: response.data.data.maintenanceMessage
          });
        }
      } catch (error) {
        console.error('Failed to fetch system settings', error);
      }
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      CapacitorUpdater.notifyAppReady();
    }

    // Initial OTA check is now handled in SplashScreen.tsx for a smoother 'Check on Launch' experience.
    const listener = CapApp.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        if (Capacitor.isNativePlatform()) {
          const { value } = await Preferences.get({ key: 'uhc_biometric_enabled' });
          if (value === 'true') setIsAppLocked(true);
        }
      }
    });

    // Enhanced Back Button Handling
    let backListener: any;
    if (Capacitor.isNativePlatform()) {
      backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
        const path = window.location.pathname;

        // If we are on the dashboard or root, handle exit protection
        if (path === '/dashboard' || path === '/' || !canGoBack) {
          const now = Date.now();
          if (now - lastBackPress.current < 2000) {
            CapApp.exitApp();
          } else {
            lastBackPress.current = now;
            sonnerToast.info("Press back again to exit", {
              duration: 2000,
              position: 'bottom-center',
              className: 'bg-slate-900 text-white border-none rounded-full px-6'
            });
          }
        } else {
          // Normal back navigation
          window.history.back();
        }
      });
    }

    return () => {
      listener.then(l => l.remove());
      if (backListener) backListener.then((l: any) => l.remove());
    };
  }, []);

  // Show splash first on every launch
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Show onboarding only on first launch (before auth)
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />
  }

  // Strict Maintenance Mode Blocking
  const isAdmin = user?.roles?.includes('admin');
  const isAuthPage = location.pathname.startsWith('/auth');
  const isHome = location.pathname === '/';

  if (maintenance?.enabled && !isAdmin && !isAuthPage && !isHome && !loading) {
    return (
      <UnderMaintenancePage
        message={maintenance.message}
        onRefresh={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <MaintenanceBanner maintenanceData={maintenance} />
      <AnimatePresence>
        {isAppLocked && (
          <BiometricLock onUnlock={() => setIsAppLocked(false)} />
        )}
      </AnimatePresence>
      <Suspense fallback={null}>
        <Routes>
          {/* Landing Page - Primary Entry Point */}
          <Route
            path="/"
            element={
              loading ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"></div>
                  <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                  <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
                  <div className="relative z-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                    <div className="relative">
                      <div className="h-20 w-20 border-4 border-blue-100 rounded-full"></div>
                      <div className="absolute top-0 left-0 h-20 w-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl animate-pulse flex items-center justify-center shadow-lg shadow-blue-200">
                          <img
                            src="/images/logo/logo-new.png"
                            alt="UHC"
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">Unlimited Healthcare</h2>
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] ml-1">Secure Authorization</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Home />
              )
            }
          />

          <Route
            path="/home"
            element={<Home />}
          />

          {/* Public routes */}
          <Route
            path="/auth"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />
            }
          />
          <Route
            path="/auth/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />
            }
          />
          <Route
            path="/auth/register"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfilePageNew />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          {/* Center admin pages */}
          <Route
            path="/center/staff"
            element={
              <ProtectedRoute>
                <CenterStaffListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/center/patients"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PatientsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/me/patients"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PatientsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/video-conferences"
            element={
              <ProtectedRoute>
                <VideoConferencesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teleconsult/:id"
            element={
              <ProtectedRoute>
                <TeleconsultPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/centers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CentersPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/centers/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CenterDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/centers/:id/book"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BookingPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />


          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <HealthRecords />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <WalletPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kyc-verification"
            element={
              <ProtectedRoute>
                <KycVerificationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/blood-donation"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BloodDonationPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical-reports"
            element={
              <ProtectedRoute>
                <MedicalReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <ReferralDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/referrals/:id"
            element={
              <ProtectedRoute>
                <ReferralDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <ReviewDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/emergency"
            element={
              <ProtectedRoute>
                <EmergencyDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dicom-viewer"
            element={
              <ProtectedRoute>
                <DicomViewerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/voluntary-service"
            element={
              <ProtectedRoute>
                <VoluntaryServicePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/volunteer/medical-verify"
            element={
              <ProtectedRoute>
                <MedicalVolunteerVerificationPage />
              </ProtectedRoute>
            }
          />

          {/* Discovery System Routes */}
          <Route
            path="/discovery"
            element={
              <ProtectedRoute>
                <DiscoveryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/:publicId"
            element={
              <ProtectedRoute>
                <PublicProfilePage />
              </ProtectedRoute>
            }
          />



          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <RequestsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invitations"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <InvitationsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Public invite acceptance route (no auth) */}
          <Route
            path="/invite/:token"
            element={
              <InvitePage />
            }
          />

          <Route
            path="/verify/report/:code"
            element={
              <VerifyReportPage />
            }
          />


          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PricingPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/callback"
            element={
              <ProtectedRoute>
                <PaymentCallback />
              </ProtectedRoute>
            }
          />

          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/symptom-analysis"
            element={
              <ProtectedRoute>
                <SymptomAnalysisPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/security"
            element={
              <ProtectedRoute>
                <UserSecurityPage />
              </ProtectedRoute>
            }
          />

          {/* Patient Provider Routes */}
          <Route
            path="/me/doctors"
            element={
              <ProtectedRoute>
                <ApprovedDoctorsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/me/centers"
            element={
              <ProtectedRoute>
                <ApprovedCentersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clinical/workflow"
            element={
              <ProtectedRoute>
                <ClinicalWorkflow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinical/me"
            element={
              <ProtectedRoute>
                <PatientClinicalDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clinical/workspace/:id"
            element={
              <ProtectedRoute>
                <CaseWorkspacePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clinical/teleconsult/:id"
            element={
              <ProtectedRoute>
                <TeleconsultPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/verification"
            element={
              <ProtectedRoute>
                <ProviderVerificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute>
                <AdminAuditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <ProtectedRoute>
                <AdminFinancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/rewards"
            element={
              <ProtectedRoute>
                <DonorRewardsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/connections"
            element={
              <ProtectedRoute>
                <ConnectionsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
            }
          />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
