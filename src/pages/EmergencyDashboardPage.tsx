import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { emergencyService } from '@/services/emergencyService';
import {
  EmergencyAlert,
  AmbulanceRequest,
  ViralReport,
  EmergencyKPIs,
  AlertFilters,
  AmbulanceRequestFilters,
  ViralReportFilters,
  CreateSOSAlertDto,
  CreateAmbulanceRequestDto,
  CreateViralReportDto,
  AlertType,
  Priority,
  ViralReportType,
  AmbulanceTeamMember
} from '@/types/emergency';
import { EmergencyHeader, EmergencyQuickActions } from '@/components/emergency/EmergencyHeader';
import { EmergencyKPIs as EmergencyKPIsComponent } from '@/components/emergency/EmergencyKPIs';
import { EmergencyFilters } from '@/components/emergency/EmergencyFilters';
import { EmergencyList } from '@/components/emergency/EmergencyList';
import { EmergencySidebar } from '@/components/emergency/EmergencySidebar';
import { EmergencyContactManager } from '@/components/emergency/EmergencyContactManager';
import { AmbulanceRequestDialog } from '@/components/emergency/AmbulanceRequestDialog';
import { toast } from 'sonner';

const EmergencyDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();

  // State management
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [ambulanceRequests, setAmbulanceRequests] = useState<AmbulanceRequest[]>([]);
  const [viralReports, setViralReports] = useState<ViralReport[]>([]);
  const [kpis, setKpis] = useState<EmergencyKPIs>({
    activeAlerts: 0,
    activeAlertsChange: 0,
    criticalAlerts: 0,
    criticalAlertsChange: 0,
    pendingAmbulances: 0,
    pendingAmbulancesChange: 0,
    dispatchedAmbulances: 0,
    dispatchedAmbulancesChange: 0,
    averageResponseTime: 0,
    averageResponseTimeChange: 0,
    viralReports: 0,
    viralReportsChange: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isConnected, setIsConnected] = useState(true);
  const [ambulanceDialogOpen, setAmbulanceDialogOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'alerts' | 'ambulances' | 'reports'>('alerts');
  const [alertFilters, setAlertFilters] = useState<AlertFilters>({});
  const [ambulanceFilters, setAmbulanceFilters] = useState<AmbulanceRequestFilters>({});
  const [reportFilters, setReportFilters] = useState<ViralReportFilters>({});

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [alertsResponse, ambulanceResponse, reportsResponse, kpisResponse] = await Promise.all([
        emergencyService.getEmergencyAlerts({
          ...alertFilters,
          page: pagination.page,
          limit: pagination.limit
        }),
        emergencyService.getAmbulanceRequests({
          ...ambulanceFilters,
          page: pagination.page,
          limit: pagination.limit
        }),
        emergencyService.getViralReports({
          ...reportFilters,
          page: pagination.page,
          limit: pagination.limit
        }),
        emergencyService.getEmergencyKPIs()
      ]);

      setAlerts(alertsResponse.data);
      setAmbulanceRequests(ambulanceResponse.data);
      setViralReports(reportsResponse.data);
      setKpis(kpisResponse);

      // Update pagination
      const currentResponse = activeTab === 'alerts' ? alertsResponse :
        activeTab === 'ambulances' ? ambulanceResponse :
          reportsResponse;
      setPagination(currentResponse.pagination);

      setLastUpdated(new Date().toLocaleTimeString());
      setIsConnected(true);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load emergency data');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [alertFilters, ambulanceFilters, reportFilters, pagination.page, pagination.limit, activeTab]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle SOS Alert
  const handleSOSAlert = async () => {
    try {
      // Get current location
      const position = await getCurrentPosition();

      const sosData: CreateSOSAlertDto = {
        type: AlertType.MEDICAL_EMERGENCY,
        description: 'Emergency assistance needed',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: 'Current Location',
        contactNumber: (profile?.phoneNumber as string) || '+1234567890',
        isTestAlert: false
      };

      await emergencyService.sendSOSAlert(sosData);
      toast.success('SOS alert sent successfully!');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error sending SOS alert:', error);
      toast.error('Failed to send SOS alert');
    }
  };

  // Handle Ambulance Request
  const handleAmbulanceRequest = async () => {
    setAmbulanceDialogOpen(true);
  };

  const submitAmbulanceRequest = async (formData: any) => {
    try {
      const position = await getCurrentPosition();

      const ambulanceData: CreateAmbulanceRequestDto = {
        patientName: formData.patientName || user?.name || 'Emergency Patient',
        patientPhone: formData.patientPhone || (profile?.phoneNumber as string) || '+1234567890',
        pickupLatitude: position.coords.latitude,
        pickupLongitude: position.coords.longitude,
        pickupAddress: formData.pickupAddress || 'Current Location',
        medicalCondition: formData.medicalCondition || 'Medical emergency requiring immediate transport',
        priority: formData.priority || Priority.CRITICAL,
        metadata: {
          attachments: formData.attachments,
          patientAge: formData.patientAge,
          patientGender: formData.patientGender
        }
      };

      await emergencyService.requestAmbulance(ambulanceData);
      toast.success('Ambulance requested successfully!');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error requesting ambulance:', error);
      toast.error('Failed to request ambulance');
    }
  };

  // Handle Viral Report
  const handleViralReport = async () => {
    try {
      const reportData: CreateViralReportDto = {
        type: ViralReportType.SYMPTOM_REPORT,
        isAnonymous: false,
        diseaseType: 'General Symptoms',
        symptoms: ['Fever', 'Cough', 'Fatigue'],
        affectedCount: 1,
        description: 'Self-reported symptoms',
        contactInformation: {
          name: user?.name,
          phone: profile?.phoneNumber as string,
          email: user?.email
        }
      };

      await emergencyService.submitViralReport(reportData);
      toast.success('Viral report submitted successfully!');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error submitting viral report:', error);
      toast.error('Failed to submit viral report');
    }
  };

  // Get current position
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to default coordinates (New York)
          resolve({
            coords: {
              latitude: 40.7128,
              longitude: -74.0060,
              accuracy: 0,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          } as GeolocationPosition);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  // Handle filter changes
  const handleFilterChange = (filters: any) => {
    if (activeTab === 'alerts') {
      setAlertFilters(filters);
    } else if (activeTab === 'ambulances') {
      setAmbulanceFilters(filters);
    } else if (activeTab === 'reports') {
      setReportFilters(filters);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle tab change
  const handleTabChange = (tab: 'alerts' | 'ambulances' | 'reports') => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Handle alert actions
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await emergencyService.acknowledgeAlert(alertId);
      toast.success('Alert acknowledged');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await emergencyService.resolveAlert(alertId, { resolutionNotes: 'Resolved via dashboard' });
      toast.success('Alert resolved');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  // Handle ambulance actions
  const handleDispatchAmbulance = async (requestId: string, team?: AmbulanceTeamMember[]) => {
    try {
      await emergencyService.updateRequestStatus(requestId, {
        status: 'dispatched',
        notes: team ? `Team dispatched: ${team.length} personnel. ${team.map(m => `${m.role}: ${m.name}`).join(', ')}` : undefined
      });
      // In a real app, we'd also save the teamPersonnel separately, 
      // but for now we'll put it in notes or metadata if the API supports it.
      toast.success('Ambulance dispatched with team details');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error dispatching ambulance:', error);
      toast.error('Failed to dispatch ambulance');
    }
  };

  const handleUpdateAmbulanceStatus = async (requestId: string, status: string, metadata?: any) => {
    try {
      await emergencyService.updateRequestStatus(requestId, { status, ...metadata });
      toast.success(`Ambulance status updated to ${status}`);
      loadDashboardData();
    } catch (error: any) {
      console.error('Error updating ambulance status:', error);
      toast.error('Failed to update ambulance status');
    }
  };

  const handleCancelAmbulance = async (requestId: string) => {
    try {
      await emergencyService.updateRequestStatus(requestId, { status: 'cancelled' });
      toast.success('Ambulance request cancelled');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error cancelling ambulance request:', error);
      toast.error('Failed to cancel request');
    }
  };

  // Handle report actions
  const handleReviewReport = async (reportId: string) => {
    try {
      await emergencyService.updateReportStatus(reportId, { status: 'under_review' });
      toast.success('Report moved to review');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error reviewing report:', error);
      toast.error('Failed to review report');
    }
  };

  const handleVerifyReport = async (reportId: string) => {
    try {
      await emergencyService.updateReportStatus(reportId, { status: 'verified' });
      toast.success('Report verified');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error verifying report:', error);
      toast.error('Failed to verify report');
    }
  };

  // Handle quick actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'sos':
        handleSOSAlert();
        break;
      case 'ambulance':
        handleAmbulanceRequest();
        break;
      case 'report':
        handleViralReport();
        break;
      default:
        break;
    }
  };

  // Handle export
  const handleExport = () => {
    try {
      const dataToExport = activeTab === 'alerts' ? alerts :
        activeTab === 'ambulances' ? ambulanceRequests :
          viralReports;

      if (dataToExport.length === 0) {
        toast.error(`No ${activeTab} data to export`);
        return;
      }

      // Simple CSV conversion
      const headers = Object.keys(dataToExport[0]).join(',');
      const rows = dataToExport.map(item => {
        return Object.values(item).map(val => {
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',');
      });

      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `emergency_${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${activeTab.toUpperCase()} data exported as CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadDashboardData();
  };

  const userRole = profile?.role || 'patient';

  if (loading && alerts.length === 0) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Header */}
            <EmergencyHeader
              onRefresh={handleRefresh}
              lastUpdated={lastUpdated}
              isConnected={isConnected}
            />

            {/* Quick Actions */}
            <EmergencyQuickActions
              onSOSAlert={handleSOSAlert}
              onAmbulanceRequest={handleAmbulanceRequest}
            />

            {/* KPIs */}
            <EmergencyKPIsComponent kpis={kpis} loading={loading} />

            {/* Emergency Contacts Management */}
            <div className="mb-8">
              <EmergencyContactManager onContactAdded={loadDashboardData} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Filters */}
                <EmergencyFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  onFilterChange={handleFilterChange}
                  onExport={handleExport}
                  alertFilters={alertFilters}
                  ambulanceFilters={ambulanceFilters}
                  reportFilters={reportFilters}
                />

                {/* Emergency List */}
                <EmergencyList
                  activeTab={activeTab}
                  alerts={alerts}
                  ambulanceRequests={ambulanceRequests}
                  viralReports={viralReports}
                  loading={loading}
                  error={error}
                  pagination={pagination}
                  userRole={userRole}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onResolveAlert={handleResolveAlert}
                  onDispatchAmbulance={handleDispatchAmbulance}
                  onUpdateAmbulanceStatus={handleUpdateAmbulanceStatus}
                  onReviewReport={handleReviewReport}
                  onVerifyReport={handleVerifyReport}
                  onCancelAmbulance={handleCancelAmbulance}
                  onPageChange={handlePageChange}
                />
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-1">
                <EmergencySidebar
                  recentAlerts={alerts.slice(0, 3)}
                  recentAmbulanceRequests={ambulanceRequests.slice(0, 3)}
                  recentViralReports={viralReports.slice(0, 3)}
                  onQuickAction={handleQuickAction}
                />
              </div>
            </div>

            {/* Dialogs */}
            <AmbulanceRequestDialog
              open={ambulanceDialogOpen}
              onOpenChange={setAmbulanceDialogOpen}
              onSubmit={submitAmbulanceRequest}
              defaultPatientName={user?.name}
              defaultPatientPhone={profile?.phoneNumber as string}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default EmergencyDashboardPage;
