import React, { useState, useEffect, useRef } from 'react';
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
  Minimize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoConference, VideoConferenceParticipant } from '@/types/videoConferences';
import { VideoConferenceWebSocket } from '@/services/videoConferenceWebSocket';

interface VideoConferenceRoomProps {
  conference: VideoConference;
  ws: VideoConferenceWebSocket | null;
  onLeave: () => void;
  userId: string;
}

export const VideoConferenceRoom: React.FC<VideoConferenceRoomProps> = ({
  conference,
  ws,
  onLeave
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

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // WebRTC setup (simplified for demo)
  useEffect(() => {
    const setupLocalVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    setupLocalVideo();
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    if (!ws) return;

    ws.on('participant_joined', (data) => {
      setParticipants(prev => [...prev, data.participant]);
    });

    ws.on('participant_left', (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.participantId));
    });

    ws.on('participant_mute_changed', (data) => {
      setParticipants(prev =>
        prev.map(p =>
          p.id === data.participantId
            ? { ...p, isMicrophoneEnabled: !data.isMuted }
            : p
        )
      );
    });

    ws.on('participant_video_changed', (data) => {
      setParticipants(prev =>
        prev.map(p =>
          p.id === data.participantId
            ? { ...p, isCameraEnabled: data.isVideoEnabled }
            : p
        )
      );
    });

    ws.on('chat_message', (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    ws.on('hand_raised', (data) => {
      setParticipants(prev =>
        prev.map(p =>
          p.id === data.participantId
            ? { ...p, isHandRaised: data.isRaised }
            : p
        )
      );
    });

    return () => {
      ws.off('participant_joined');
      ws.off('participant_left');
      ws.off('participant_mute_changed');
      ws.off('participant_video_changed');
      ws.off('chat_message');
      ws.off('hand_raised');
    };
  }, [ws]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (ws) {
      ws.toggleMute(conference.id, newMuteState);
    }
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);
    if (ws) {
      ws.toggleVideo(conference.id, newVideoState);
    }
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      if (ws) {
        ws.stopScreenShare(conference.id);
      }
      setIsScreenSharing(false);
    } else {
      if (ws) {
        ws.startScreenShare(conference.id);
      }
      setIsScreenSharing(true);
    }
  };

  const toggleHandRaise = () => {
    const newHandState = !isHandRaised;
    setIsHandRaised(newHandState);
    if (ws) {
      ws.raiseHand(conference.id, newHandState);
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && ws) {
      ws.sendChatMessage(conference.id, chatInput.trim());
      setChatInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendChatMessage();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'reconnecting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`fixed inset-0 bg-black text-white z-50 pt-12 sm:pt-4 safe-area-pt ${isFullscreen ? 'p-0' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{conference.title}</h1>
          <Badge variant="outline" className="text-green-400 border-green-400">
            Live
          </Badge>
          {conference.isRecording && (
            <Badge variant="outline" className="text-red-400 border-red-400 animate-pulse">
              Recording
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-white/20"
          >
            <Users className="h-4 w-4 mr-2" />
            {participants.length}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="text-white hover:bg-white/20"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLeave}
            className="text-white hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)] gap-4">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <span className="text-sm font-medium">You</span>
                {isMuted && <MicOff className="h-4 w-4 text-red-400" />}
                {!isVideoEnabled && <VideoOff className="h-4 w-4 text-red-400" />}
              </div>
            </div>

            {/* Remote Participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                {participant.isCameraEnabled ? (
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {getParticipantInitials(participant.userName)}
                    </div>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <span className="text-sm font-medium">{participant.userName}</span>
                  {participant.isHost && (
                    <Badge variant="outline" className="text-xs">Host</Badge>
                  )}
                  {participant.isHandRaised && (
                    <Hand className="h-4 w-4 text-yellow-400" />
                  )}
                  {!participant.isMicrophoneEnabled && (
                    <MicOff className="h-4 w-4 text-red-400" />
                  )}
                  {!participant.isCameraEnabled && (
                    <VideoOff className="h-4 w-4 text-red-400" />
                  )}
                </div>

                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor(participant.connectionStatus)}`} />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className={`text-white hover:bg-white/20 ${isMuted ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVideo}
                className={`text-white hover:bg-white/20 ${!isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleScreenShare}
                className={`text-white hover:bg-white/20 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                {isScreenSharing ? <Share2 className="h-5 w-5" /> : <Share className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleHandRaise}
                className={`text-white hover:bg-white/20 ${isHandRaised ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
              >
                <Hand className="h-5 w-5" />
              </Button>

              <div className="w-px h-6 bg-white/30 mx-2" />

              <Button
                variant="ghost"
                size="sm"
                onClick={onLeave}
                className="text-white hover:bg-red-600"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`w-80 bg-gray-900 rounded-lg flex flex-col ${showChat || showParticipants ? 'block' : 'hidden'}`}>
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => { setShowParticipants(true); setShowChat(false); }}
              className={`flex-1 py-3 px-4 text-sm font-medium ${showParticipants ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'
                }`}
            >
              Participants ({participants.length})
            </button>
            <button
              onClick={() => { setShowChat(true); setShowParticipants(false); }}
              className={`flex-1 py-3 px-4 text-sm font-medium ${showChat ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'
                }`}
            >
              Chat
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {showParticipants && (
              <div className="p-4 space-y-3 overflow-y-auto h-full">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getParticipantInitials(participant.userName)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{participant.userName}</span>
                        {participant.isHost && (
                          <Badge variant="outline" className="text-xs">Host</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(participant.connectionStatus)}`} />
                        {participant.connectionStatus}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {participant.isHandRaised && (
                        <Hand className="h-4 w-4 text-yellow-400" />
                      )}
                      {!participant.isMicrophoneEnabled && (
                        <MicOff className="h-4 w-4 text-red-400" />
                      )}
                      {!participant.isCameraEnabled && (
                        <VideoOff className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showChat && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.map((message, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-blue-400">{message.userId}:</span>
                      <span className="ml-2">{message.message}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <Button
                      onClick={sendChatMessage}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
