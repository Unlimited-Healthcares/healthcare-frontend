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
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] animate-pulse" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mb-8 animate-bounce">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Initializing Agora</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Securing encryption channels...</p>
                </div>
            </div>
        );
    }

    if (!conference || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6">
                    <Loader2 className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Room Unavailable</h2>
                <p className="text-slate-400 font-bold text-sm max-w-xs mb-8">This consultation room could not be established or you lack the required authorization.</p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="fixed inset-0 bg-black z-[200]">
                <VideoConferenceRoom
                    conference={conference}
                    ws={ws}
                    userId={user.id}
                    onLeave={() => navigate('/dashboard')}
                />
            </div>
        </ProtectedRoute>
    );
};

export default TeleconsultPage;
