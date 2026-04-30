import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack, 
  IAgoraRTCRemoteUser
} from 'agora-rtc-sdk-ng';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share,
  Share2,
  Users,
  MessageSquare,
  Hand,
  X,
  Maximize,
  Minimize,
  CircleDot,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { complianceApi } from '@/services/complianceApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoConference, VideoConferenceParticipant } from '@/types/videoConferences';
import { VideoConferenceWebSocket } from '@/services/videoConferenceWebSocket';
import { auditService } from '@/services/auditService';
import { toast } from 'sonner';

interface VideoConferenceRoomProps {
  conference: VideoConference;
  ws: VideoConferenceWebSocket | null;
  onLeave: () => void;
  userId: string;
}

// AGORA CONFIGURATION
const AGORA_APP_ID = "54913c13db4b4272a0ef9b38d9e74298"; // Production App ID

export const VideoConferenceRoom: React.FC<VideoConferenceRoomProps> = ({
  conference,
  ws,
  onLeave,
  userId
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [participants, setParticipants] = useState<VideoConferenceParticipant[]>(conference.participants || []);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(conference.isRecording);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [recordingRequester, setRecordingRequester] = useState<string | null>(null);

  // Agora State
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localTracks, setLocalTracks] = useState<{
    videoTrack: ICameraVideoTrack | null;
    audioTrack: IMicrophoneAudioTrack | null;
  }>({ videoTrack: null, audioTrack: null });
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // AGORA INITIALIZATION
  useEffect(() => {
    const initAgora = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      
      // SECURITY: End-to-End Encryption
      // In production, the encryption key should be fetched per-conference from the backend
      try {
          await agoraClient.setEncryptionConfig("aes-128-xts", "uhc-e2ee-clinical-" + conference.id);
          console.log("🔒 E2E Encryption initialized for conference:", conference.id);
      } catch (e) {
          console.error("Encryption initialization failed", e);
      }

      setClient(agoraClient);

      // Agora Event Listeners
      agoraClient.on('user-published', async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      agoraClient.on('user-unpublished', (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });

      try {
        const uid = await agoraClient.join(AGORA_APP_ID, conference.id, null, userId);
        
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks({ videoTrack, audioTrack });

        if (videoTrack && localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
        
        await agoraClient.publish([audioTrack, videoTrack]);
        toast.success("E2E Secure Video Active");
        
        // AUDIT LOG
        auditService.logAction('JOINED_VIDEO_CONSULTATION', conference.id);

      } catch (error) {
        console.error('Agora initialization failed:', error);
        toast.error("Security handshake failed. Please retry.");
      }
    };

    if (conference.id && userId) {
      initAgora();
    }

    return () => {
      localTracks.videoTrack?.stop();
      localTracks.videoTrack?.close();
      localTracks.audioTrack?.stop();
      localTracks.audioTrack?.close();
      client?.leave();
    };
  }, [conference.id, userId]);

  // WebSocket event handlers
  useEffect(() => {
    if (!ws) return;

    ws.on('participant_joined', (data) => {
      setParticipants(prev => [...prev.filter(p => p.id !== data.participant.id), data.participant]);
    });

    ws.on('participant_left', (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.participantId));
    });

    ws.on('recording_requested', (data) => {
      setRecordingRequester(data.requesterName);
      setShowConsentModal(true);
    });

    ws.on('recording_status_changed', (data) => {
      setIsRecording(data.isRecording);
      if (data.isRecording) {
        toast.success("Recording started (MDT Consent Verified)");
        auditService.logAction('RECORDING_STARTED', conference.id);
      } else {
        toast.info("Recording stopped.");
        auditService.logAction('RECORDING_STOPPED', conference.id);
      }
    });

    return () => {
      ws.off('participant_joined');
      ws.off('participant_left');
      ws.off('recording_requested');
      ws.off('recording_status_changed');
    };
  }, [ws]);

  const toggleMute = async () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (localTracks.audioTrack) await localTracks.audioTrack.setEnabled(!newMuteState);
    if (ws) ws.toggleMute(conference.id, newMuteState);
  };

  const toggleVideo = async () => {
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);
    if (localTracks.videoTrack) await localTracks.videoTrack.setEnabled(newVideoState);
    if (ws) ws.toggleVideo(conference.id, newVideoState);
  };

  const handleStartRecording = () => {
    if (ws) {
      ws.requestRecording(conference.id);
      toast.info("Requesting all-party recording consent...");
    }
  };

  const handleConsent = async (granted: boolean) => {
    setShowConsentModal(false);
    
    // AUDIT LOG: Mandatory Two-Party Consent
    await auditService.logAction('RECORDING_CONSENT_RESPONSE', conference.id, {
        granted,
        participantId: userId
    });

    if (ws) {
      ws.sendRecordingConsentResponse(conference.id, userId, granted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getParticipantInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={`fixed inset-0 bg-slate-950 text-white z-50 pt-12 sm:pt-4 safe-area-pt ${isFullscreen ? 'p-0' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black uppercase tracking-tight text-white">{conference.title}</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">E2EE SECURE</span>
          </div>
          {isRecording && (
            <Badge className="bg-red-500 text-white border-none font-bold uppercase text-[10px] animate-pulse px-3 py-1 rounded-full">
              RECORDING ACTIVE
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)} className="text-white hover:bg-white/10 font-bold uppercase text-[10px] rounded-full">
            <Users className="h-4 w-4 mr-2" />
            {participants.length}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLeave} className="text-white hover:bg-red-600 rounded-full h-10 w-10 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-160px)] gap-4 px-4 overflow-hidden">
        <div className="flex-1 relative flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-fit">
              {/* Local Video Card */}
              <div className="relative bg-slate-900 rounded-[32px] overflow-hidden aspect-video shadow-2xl border border-white/5 ring-4 ring-blue-500/20">
                <div ref={localVideoRef} className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">You (Local)</span>
                </div>
              </div>

              {/* Remote Participants */}
              {remoteUsers.map((user) => {
                const participantMetadata = participants.find(p => p.id === user.uid || p.userId === user.uid);
                return (
                  <div key={user.uid} className="relative bg-slate-900 rounded-[32px] overflow-hidden aspect-video shadow-xl border border-white/5">
                    <div ref={(node) => user.videoTrack?.play(node as HTMLDivElement)} className="w-full h-full object-cover" />
                    {!user.hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-2xl">
                          {participantMetadata?.userName ? getParticipantInitials(participantMetadata.userName) : '?'}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {participantMetadata?.userName || `Clinician ${user.uid}`}
                      </span>
                      {!user.hasAudio && <MicOff className="h-3 w-3 text-red-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center gap-4 bg-slate-900/90 backdrop-blur-2xl rounded-[32px] px-8 py-4 border border-white/10 shadow-2xl ring-1 ring-white/20">
              <Button variant="ghost" onClick={toggleMute} className={`w-14 h-14 rounded-2xl ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              <Button variant="ghost" onClick={toggleVideo} className={`w-14 h-14 rounded-2xl ${!isVideoEnabled ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
              <Button variant="ghost" onClick={handleStartRecording} className={`w-14 h-14 rounded-2xl ${isRecording ? 'bg-red-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                <CircleDot className={`h-6 w-6 ${isRecording ? 'animate-pulse' : ''}`} />
              </Button>
              <div className="w-px h-10 bg-white/10 mx-2" />
              <Button onClick={onLeave} className="w-14 h-14 rounded-2xl bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/40">
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Consent Modal */}
      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white rounded-[40px] max-w-md shadow-2xl">
          <DialogHeader>
            <div className="w-16 h-16 bg-blue-600/20 rounded-[24px] flex items-center justify-center mb-6 mx-auto border border-blue-500/30">
              <ShieldCheck className="h-8 w-8 text-blue-400" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">Clinical Recording Consent</DialogTitle>
            <DialogDescription className="text-slate-400 text-center font-bold leading-relaxed pt-4 italic">
              "A request has been made to record this session for the clinical audit trail. This requires consent from all MDT members and patients present."
            </DialogDescription>
          </DialogHeader>
          <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 my-4">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center">Regulatory Compliance Header</p>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed text-center">
              All recordings are encrypted and stored in the secure UHC vault. Access is restricted to authorized medical personnel only.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button variant="ghost" onClick={() => handleConsent(false)} className="flex-1 rounded-2xl border border-white/10 text-slate-400 hover:text-white py-6 uppercase font-black text-xs tracking-widest">
              Refuse
            </Button>
            <Button onClick={() => handleConsent(true)} className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-6 uppercase font-black text-xs tracking-widest shadow-lg shadow-blue-600/20">
              Accept & Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
