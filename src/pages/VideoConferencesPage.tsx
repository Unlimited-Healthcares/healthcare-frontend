import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { videoConferenceService } from '@/services/videoConferenceService';
import { VideoConferenceWebSocket } from '@/services/videoConferenceWebSocket';
import {
  VideoConference,
  VideoConferenceFilters,
  VideoConferenceKPIs,
  CreateVideoConferenceDto
} from '@/types/videoConferences';
import { VideoConferenceHeader } from '@/components/videoConferences/VideoConferenceHeader';
import { VideoConferenceKPIs as VideoConferenceKPIsComponent } from '@/components/videoConferences/VideoConferenceKPIs';
import { VideoConferenceFilters as VideoConferenceFiltersComponent } from '@/components/videoConferences/VideoConferenceFilters';
import { VideoConferenceList } from '@/components/videoConferences/VideoConferenceList';
import { VideoConferenceGrid } from '@/components/videoConferences/VideoConferenceGrid';
import { VideoConferenceCalendar } from '@/components/videoConferences/VideoConferenceCalendar';
import { CreateVideoConferenceModal } from '@/components/videoConferences/CreateVideoConferenceModal';
import { toast } from 'sonner';

const VideoConferencesPage: React.FC = () => {
  const { user, profile } = useAuth();

  // State management
  const [conferences, setConferences] = useState<VideoConference[]>([]);
  const [kpis, setKpis] = useState<VideoConferenceKPIs>({
    totalConferences: 0,
    totalConferencesChange: 0,
    activeConferences: 0,
    activeConferencesChange: 0,
    scheduledConferences: 0,
    scheduledConferencesChange: 0,
    totalParticipants: 0,
    totalParticipantsChange: 0,
    averageDuration: 0,
    averageDurationChange: 0,
    recordingRate: 0,
    recordingRateChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<VideoConferenceWebSocket | null>(null);

  // Filters and pagination
  const [filters, setFilters] = useState<VideoConferenceFilters>({
    page: 1,
    limit: 20,
    view: 'list'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editingConference, setEditingConference] = useState<VideoConference | null>(null);

  // Load conferences and KPIs
  const loadConferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await videoConferenceService.getVideoConferences(filters);
      setConferences(response.conferences || []);
      setPagination(response.pagination);

      if (response.kpis) {
        setKpis(response.kpis);
      }
    } catch (err) {
      console.error('Error loading conferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conferences');
      toast.error('Failed to load conferences');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (!user?.id) return;

    // Try all possible token storage keys to ensure compatibility with useAuth
    const token = localStorage.getItem('authToken') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('accessToken');

    if (!token) {
      console.warn('⚠️ No authentication token found for WebSocket initialization');
      return;
    }

    const videoConferenceWS = new VideoConferenceWebSocket(token, user.id);

    videoConferenceWS.on('conference_started', (data) => {
      console.log('Conference started:', data);
      loadConferences(); // Refresh the list
      toast.success('Conference started successfully');
    });

    videoConferenceWS.on('conference_ended', (data) => {
      console.log('Conference ended:', data);
      loadConferences(); // Refresh the list
      toast.info('Conference ended');
    });

    videoConferenceWS.on('participant_joined', (data) => {
      console.log('Participant joined:', data);
      loadConferences(); // Refresh the list
    });

    videoConferenceWS.on('participant_left', (data) => {
      console.log('Participant left:', data);
      loadConferences(); // Refresh the list
    });

    videoConferenceWS.connect()
      .then(() => {
        setIsConnected(true);
        setWs(videoConferenceWS);
      })
      .catch((error) => {
        console.error('WebSocket connection failed:', error);
        setIsConnected(false);
      });
  }, [user?.id, loadConferences]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadConferences();
  }, [loadConferences]);

  // Initialize WebSocket on mount
  useEffect(() => {
    initializeWebSocket();

    return () => {
      if (ws) {
        ws.disconnect();
      }
    };
  }, [initializeWebSocket]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<VideoConferenceFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle view change
  const handleViewChange = (view: 'list' | 'calendar' | 'grid') => {
    handleFilterChange({ view });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    handleFilterChange({ page });
  };

  // Create or Update conference
  const handleCreateOrUpdateConference = async (conferenceData: CreateVideoConferenceDto) => {
    try {
      setCreateLoading(true);
      if (editingConference) {
        await videoConferenceService.updateConference(editingConference.id, conferenceData);
        toast.success('Conference updated successfully');
      } else {
        await videoConferenceService.createVideoConference(conferenceData);
        toast.success('Conference created successfully');
      }
      setEditingConference(null);
      setShowCreateModal(false);
      loadConferences(); // Refresh to get updated list and KPIs
    } catch (err) {
      console.error('Error saving conference:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save conference');
    } finally {
      setCreateLoading(false);
    }
  };

  // Join conference
  const handleJoinConference = async (conferenceId: string) => {
    try {
      await videoConferenceService.joinConference(conferenceId);
      if (ws) {
        ws.joinConference(conferenceId);
      }
      toast.success('Joining conference...');
      // TODO: Navigate to conference room or open conference modal
    } catch (err) {
      console.error('Error joining conference:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to join conference');
    }
  };

  // Start conference
  const handleStartConference = async (conferenceId: string) => {
    try {
      await videoConferenceService.startConference(conferenceId);
      if (ws) {
        ws.startConference(conferenceId);
      }
      toast.success('Conference started successfully');
      loadConferences();
    } catch (err) {
      console.error('Error starting conference:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to start conference');
    }
  };

  // End conference
  const handleEndConference = async (conferenceId: string) => {
    try {
      await videoConferenceService.endConference(conferenceId);
      if (ws) {
        ws.endConference(conferenceId);
      }
      toast.success('Conference ended successfully');
      loadConferences();
    } catch (err) {
      console.error('Error ending conference:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to end conference');
    }
  };

  // Edit conference
  const handleEditConference = (conference: VideoConference) => {
    setEditingConference(conference);
    setShowCreateModal(true);
  };

  // Delete conference
  const handleDeleteConference = async (conferenceId: string) => {
    if (!confirm('Are you sure you want to delete this conference?')) return;

    try {
      await videoConferenceService.deleteConference(conferenceId);
      setConferences(prev => prev.filter(c => c.id !== conferenceId));
      toast.success('Conference deleted successfully');
      loadConferences();
    } catch (err) {
      console.error('Error deleting conference:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete conference');
    }
  };

  // Export conferences
  const handleExport = async () => {
    try {
      const blob = await videoConferenceService.exportConferences(filters, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-conferences-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Conferences exported successfully');
    } catch (err) {
      console.error('Error exporting conferences:', err);
      toast.error('Failed to export conferences');
    }
  };

  // Normalize the user's role for the UI components
  const rawRole = (profile?.role || user?.roles?.[0] || 'patient').toLowerCase();
  const userRole =
    rawRole.includes('admin') ? 'admin' :
      rawRole.includes('doctor') ? 'doctor' :
        rawRole.includes('center') || rawRole.includes('staff') || rawRole.includes('provider') ? 'center' :
          'patient';

  if (loading && conferences.length === 0) {
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
        <div className="min-h-screen bg-gray-50 pb-28 md:pb-0">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
            {/* Header */}
            <VideoConferenceHeader
              onViewChange={handleViewChange}
              currentView={(filters.view || 'list') as 'list' | 'calendar' | 'grid'}
              isConnected={isConnected}
            />

            {/* KPIs */}
            <VideoConferenceKPIsComponent
              kpis={kpis}
              loading={loading}
            />

            {/* Filters */}
            <VideoConferenceFiltersComponent
              filters={filters}
              onFilterChange={handleFilterChange}
              onExport={handleExport}
              onCreateConference={() => {
                setEditingConference(null);
                setShowCreateModal(true);
              }}
            />

            {/* Conferences Toggleable Views */}
            <div className="mt-8">
              {filters.view === 'grid' ? (
                <VideoConferenceGrid
                  conferences={conferences}
                  loading={loading}
                  onJoin={handleJoinConference}
                  onStart={handleStartConference}
                  onEnd={handleEndConference}
                  onEdit={handleEditConference}
                  onDelete={handleDeleteConference}
                />
              ) : filters.view === 'calendar' ? (
                <VideoConferenceCalendar
                  conferences={conferences}
                  loading={loading}
                  onJoin={handleJoinConference}
                  onStart={handleStartConference}
                />
              ) : (
                <VideoConferenceList
                  conferences={conferences}
                  loading={loading}
                  error={error}
                  pagination={pagination}
                  userRole={userRole}
                  onJoin={handleJoinConference}
                  onStart={handleStartConference}
                  onEnd={handleEndConference}
                  onEdit={handleEditConference}
                  onDelete={handleDeleteConference}
                  onPageChange={handlePageChange}
                />
              )}
            </div>

            {/* Create Conference Modal */}
            <CreateVideoConferenceModal
              isOpen={showCreateModal}
              initialData={editingConference}
              onClose={() => {
                setShowCreateModal(false);
                setEditingConference(null);
              }}
              onSubmit={handleCreateOrUpdateConference}
              loading={createLoading}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default VideoConferencesPage;
