import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { videoConferenceService } from '@/services/videoConferenceService';
import { VideoConferenceWebSocket } from '@/services/videoConferenceWebSocket';
import { VideoConference } from '@/types/videoConferences';
import { VideoConferenceRoom } from '@/components/videoConferences/VideoConferenceRoom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const TeleconsultPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [conference, setConference] = useState<VideoConference | null>(null);
    const [loading, setLoading] = useState(true);
    const [ws, setWs] = useState<VideoConferenceWebSocket | null>(null);

    const loadConference = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            // In a real scenario, we might need to find or create a conference for this appointment ID
            // For now, we'll try to get it, if not found we might create one for the appointment
            let conf: VideoConference;
            try {
                conf = await videoConferenceService.getConferenceDetails(id);
            } catch (e) {
                // If not found, create a conference for this appointment
                conf = await videoConferenceService.createVideoConference({
                    title: `Consultation - ${id}`,
                    type: 'consultation',
                    appointmentId: id,
                    scheduledStartTime: new Date().toISOString(),
                    scheduledEndTime: new Date(Date.now() + 30 * 60000).toISOString(),
                    participantIds: [] // Host will be added automatically
                });
            }
            setConference(conf);
        } catch (error) {
            console.error('Failed to load conference:', error);
            toast.error('Failed to join the video consultation');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadConference();
    }, [loadConference]);

    useEffect(() => {
        if (conference && user?.id) {
            const token = localStorage.getItem('authToken') ||
                localStorage.getItem('access_token') ||
                localStorage.getItem('accessToken');
            if (token) {
                const videoWS = new VideoConferenceWebSocket(token, user.id);
                videoWS.connect()
                    .then(() => {
                        videoWS.joinConference(conference.id);
                        setWs(videoWS);
                    })
                    .catch(e => console.error('WS connection failed:', e));

                return () => {
                    videoWS.disconnect();
                };
            }
        }
    }, [conference, user?.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
                <p className="text-lg font-medium">Preparing your consultation room...</p>
            </div>
        );
    }

    if (!conference || !user) {
        return null;
    }

    return (
        <ProtectedRoute>
            <VideoConferenceRoom
                conference={conference}
                ws={ws}
                userId={user.id}
                onLeave={() => navigate('/dashboard')}
            />
        </ProtectedRoute>
    );
};

export default TeleconsultPage;
