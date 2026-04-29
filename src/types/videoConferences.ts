export interface VideoConference {
  id: string;
  title: string;
  description?: string;
  type: ConferenceType;
  status: ConferenceStatus;
  appointmentId?: string;
  centerId?: string;
  hostId: string;
  hostName: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  maxParticipants: number;
  currentParticipants: number;
  isRecordingEnabled: boolean;
  isRecording: boolean;
  meetingPassword?: string;
  waitingRoomEnabled: boolean;
  autoAdmitParticipants: boolean;
  muteParticipantsOnEntry: boolean;
  provider: 'webrtc' | 'zoom' | 'teams' | 'meet';
  meetingUrl?: string;
  recordingUrl?: string;
  participants: VideoConferenceParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoConferenceParticipant {
  id: string;
  conferenceId: string;
  userId: string;
  userName: string;
  userRole: string;
  joinedAt?: string;
  leftAt?: string;
  isHost: boolean;
  isCoHost: boolean;
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

export interface CreateVideoConferenceDto {
  title: string;
  description?: string;
  type: ConferenceType;
  appointmentId?: string;
  centerId?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  maxParticipants?: number;
  isRecordingEnabled?: boolean;
  meetingPassword?: string;
  waitingRoomEnabled?: boolean;
  autoAdmitParticipants?: boolean;
  muteParticipantsOnEntry?: boolean;
  provider?: 'webrtc' | 'zoom' | 'teams' | 'meet';
  participantIds?: string[];
}

export interface GetConferencesDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: ConferenceStatus;
  type?: ConferenceType;
  centerId?: string;
  hostId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'scheduledStartTime' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ConferenceSettingsUpdate {
  isCameraEnabled?: boolean;
  isMicrophoneEnabled?: boolean;
  isScreenSharing?: boolean;
}

export interface VideoConferenceKPIs {
  totalConferences: number;
  totalConferencesChange: number;
  activeConferences: number;
  activeConferencesChange: number;
  scheduledConferences: number;
  scheduledConferencesChange: number;
  totalParticipants: number;
  totalParticipantsChange: number;
  averageDuration: number;
  averageDurationChange: number;
  recordingRate: number;
  recordingRateChange: number;
}

export interface VideoConferenceFilters {
  search?: string;
  status?: ConferenceStatus;
  type?: ConferenceType;
  centerId?: string;
  hostId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  view?: 'list' | 'grid' | 'calendar';
}

export interface VideoConferencePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VideoConferenceResponse {
  conferences: VideoConference[];
  pagination: VideoConferencePagination;
  kpis?: VideoConferenceKPIs;
}

export interface ConferenceRecording {
  id: string;
  conferenceId: string;
  fileName: string;
  fileSize: number;
  duration: number;
  startTime: string;
  endTime: string;
  downloadUrl: string;
  createdAt: string;
}

export type ConferenceType = 
  | 'consultation'
  | 'meeting'
  | 'emergency'
  | 'group_session'
  | 'training'
  | 'presentation'
  | 'webinar';

export type ConferenceStatus = 
  | 'scheduled'
  | 'active'
  | 'ended'
  | 'cancelled'
  | 'paused';

export interface VideoConferenceWebSocketEvents {
  conference_joined: (data: { conferenceId: string; participant: VideoConferenceParticipant }) => void;
  conference_left: (data: { conferenceId: string; participantId: string }) => void;
  conference_started: (data: { conferenceId: string; startedBy: string }) => void;
  conference_ended: (data: { conferenceId: string; endedBy: string }) => void;
  participant_joined: (data: { conferenceId: string; participant: VideoConferenceParticipant }) => void;
  participant_left: (data: { conferenceId: string; participantId: string }) => void;
  participant_mute_changed: (data: { conferenceId: string; participantId: string; isMuted: boolean }) => void;
  participant_video_changed: (data: { conferenceId: string; participantId: string; isVideoEnabled: boolean }) => void;
  screen_share_started: (data: { conferenceId: string; participantId: string }) => void;
  screen_share_stopped: (data: { conferenceId: string; participantId: string }) => void;
  recording_started: (data: { conferenceId: string; startedBy: string }) => void;
  recording_stopped: (data: { conferenceId: string; stoppedBy: string }) => void;
  recording_requested: (data: { conferenceId: string; requesterName: string }) => void;
  recording_status_changed: (data: { conferenceId: string; isRecording: boolean }) => void;
  chat_message: (data: { conferenceId: string; participantId: string; message: string; timestamp: string }) => void;
  hand_raised: (data: { conferenceId: string; participantId: string; isRaised: boolean }) => void;
}
