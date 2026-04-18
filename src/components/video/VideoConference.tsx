
import { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff, 
  Phone, 
  Users, 
  Settings,
  Circle,
  StopCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Participant {
  id: string;
  userId: string;
  userName: string;
  role: 'host' | 'co_host' | 'participant' | 'observer';
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
}

interface VideoConferenceProps {
  conferenceId: string;
  title: string;
  participants: Participant[];
  currentUserId: string;
  isHost: boolean;
  isRecording: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onToggleRecording?: () => void;
  onLeaveCall: () => void;
}

export function VideoConference({
  title,
  participants,
  currentUserId,
  isHost,
  isRecording,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
  onToggleRecording,
  onLeaveCall,
}: VideoConferenceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const currentParticipant = participants.find(p => p.userId === currentUserId);

  useEffect(() => {
    // Initialize local video stream
    if (localVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error('Error accessing media devices:', err));
    }
  }, []);

  const handleToggleMic = () => {
    setIsMuted(!isMuted);
    onToggleMic();
  };

  const handleToggleCamera = () => {
    setIsVideoOn(!isVideoOn);
    onToggleCamera();
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    onToggleScreenShare();
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'host':
        return 'bg-purple-100 text-purple-800';
      case 'co_host':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">{title}</h1>
          {isRecording && (
            <Badge className="bg-red-600 text-white flex items-center space-x-1">
              <Circle className="h-3 w-3" />
              <span>REC</span>
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <Users className="h-4 w-4 mr-2" />
                {participants.length}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Participants ({participants.length})</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {participant.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{participant.userName}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRoleColor(participant.role)}>
                            {participant.role.replace('_', ' ')}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${getConnectionQualityColor(participant.connectionQuality)}`} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {participant.isMicrophoneEnabled ? (
                        <Mic className="h-4 w-4 text-green-600" />
                      ) : (
                        <MicOff className="h-4 w-4 text-red-600" />
                      )}
                      {participant.isCameraEnabled ? (
                        <Video className="h-4 w-4 text-green-600" />
                      ) : (
                        <VideoOff className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
          {/* Local Video */}
          <Card className="relative overflow-hidden bg-gray-800">
            <CardContent className="p-0 h-full">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl">
                      {currentParticipant?.userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                  You
                </span>
                {!isMuted ? (
                  <Mic className="h-4 w-4 text-green-400" />
                ) : (
                  <MicOff className="h-4 w-4 text-red-400" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Remote Participants */}
          {participants
            .filter(p => p.userId !== currentUserId)
            .map((participant) => (
              <Card key={participant.id} className="relative overflow-hidden bg-gray-800">
                <CardContent className="p-0 h-full">
                  {participant.isCameraEnabled ? (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-white">Video Stream</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl">
                          {participant.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                    <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                      {participant.userName}
                    </span>
                    {participant.isMicrophoneEnabled ? (
                      <Mic className="h-4 w-4 text-green-400" />
                    ) : (
                      <MicOff className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getConnectionQualityColor(participant.connectionQuality)}`} />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center p-6 bg-gray-800">
        <div className="flex items-center space-x-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={handleToggleMic}
            className="rounded-full"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoOn ? "secondary" : "destructive"}
            size="lg"
            onClick={handleToggleCamera}
            className="rounded-full"
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            onClick={handleToggleScreenShare}
            className="rounded-full"
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </Button>

          {isHost && onToggleRecording && (
            <Button
              variant={isRecording ? "destructive" : "secondary"}
              size="lg"
              onClick={onToggleRecording}
              className="rounded-full"
            >
              {isRecording ? <StopCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </Button>
          )}

          <Button variant="ghost" size="lg" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2">
            {isHost ? (
              <Button
                variant="destructive"
                size="lg"
                onClick={onEndCall}
                className="rounded-full"
              >
                <Phone className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="lg"
                onClick={onLeaveCall}
                className="rounded-full"
              >
                <Phone className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
