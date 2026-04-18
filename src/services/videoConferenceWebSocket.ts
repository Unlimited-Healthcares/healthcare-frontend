import { io, Socket } from 'socket.io-client';
import { SOCKET_IO_PATH, buildNamespaceUrl, shouldForceWebsocketOnly } from '@/lib/websocket-utils';
import { VideoConferenceWebSocketEvents } from '@/types/videoConferences';

export class VideoConferenceWebSocket {
  private socket: Socket | null = null;
  private token: string;
  private userId: string;
  private eventHandlers: Partial<VideoConferenceWebSocketEvents> = {};

  constructor(token: string, userId: string) {
    this.token = token;
    this.userId = userId;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = buildNamespaceUrl('/video-conference');
      const options: Parameters<typeof io>[1] = {
        path: SOCKET_IO_PATH,
        transports: ['websocket', 'polling']
      };
      this.socket = io(wsUrl, options);

      this.socket.on('connect', () => {
        console.log('Connected to video conference WebSocket');
        this.authenticate();
      });

      this.socket.on('authenticated', (data) => {
        console.log('🔐 Video conference WebSocket authenticated:', data);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from video conference WebSocket:', reason);
      });

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Conference Events
    this.socket.on('conference_joined', (data) => {
      this.eventHandlers.conference_joined?.(data);
    });

    this.socket.on('conference_left', (data) => {
      this.eventHandlers.conference_left?.(data);
    });

    this.socket.on('conference_started', (data) => {
      this.eventHandlers.conference_started?.(data);
    });

    this.socket.on('conference_ended', (data) => {
      this.eventHandlers.conference_ended?.(data);
    });

    // Participant Events
    this.socket.on('participant_joined', (data) => {
      this.eventHandlers.participant_joined?.(data);
    });

    this.socket.on('participant_left', (data) => {
      this.eventHandlers.participant_left?.(data);
    });

    this.socket.on('participant_mute_changed', (data) => {
      this.eventHandlers.participant_mute_changed?.(data);
    });

    this.socket.on('participant_video_changed', (data) => {
      this.eventHandlers.participant_video_changed?.(data);
    });

    // Media Events
    this.socket.on('screen_share_started', (data) => {
      this.eventHandlers.screen_share_started?.(data);
    });

    this.socket.on('screen_share_stopped', (data) => {
      this.eventHandlers.screen_share_stopped?.(data);
    });

    // Recording Events
    this.socket.on('recording_started', (data) => {
      this.eventHandlers.recording_started?.(data);
    });

    this.socket.on('recording_stopped', (data) => {
      this.eventHandlers.recording_stopped?.(data);
    });

    // Chat Events
    this.socket.on('chat_message', (data) => {
      this.eventHandlers.chat_message?.(data);
    });

    // Hand Raise Events
    this.socket.on('hand_raised', (data) => {
      this.eventHandlers.hand_raised?.(data);
    });
  }

  private authenticate() {
    if (this.socket) {
      this.socket.emit('authenticate', {
        userId: this.userId,
        token: this.token
      });
    }
  }

  // Event subscription methods
  on<K extends keyof VideoConferenceWebSocketEvents>(
    event: K,
    handler: VideoConferenceWebSocketEvents[K]
  ) {
    this.eventHandlers[event] = handler;
  }

  off<K extends keyof VideoConferenceWebSocketEvents>(event: K) {
    delete this.eventHandlers[event];
  }

  // Conference Actions
  joinConference(conferenceId: string, password?: string) {
    if (this.socket) {
      this.socket.emit('join_conference', { conferenceId, userId: this.userId, password });
    }
  }

  leaveConference(conferenceId: string) {
    if (this.socket) {
      this.socket.emit('leave_conference', { conferenceId, userId: this.userId });
    }
  }

  startConference(conferenceId: string) {
    if (this.socket) {
      this.socket.emit('start_conference', { conferenceId, userId: this.userId });
    }
  }

  endConference(conferenceId: string) {
    if (this.socket) {
      this.socket.emit('end_conference', { conferenceId, userId: this.userId });
    }
  }

  // Media Controls
  toggleMute(conferenceId: string, isMuted: boolean) {
    if (this.socket) {
      this.socket.emit('toggle_mute', { conferenceId, userId: this.userId, isMuted });
    }
  }

  toggleVideo(conferenceId: string, isVideoEnabled: boolean) {
    if (this.socket) {
      this.socket.emit('toggle_video', { conferenceId, userId: this.userId, isVideoEnabled });
    }
  }

  startScreenShare(conferenceId: string) {
    if (this.socket) {
      this.socket.emit('screen_share_start', { conferenceId, userId: this.userId });
    }
  }

  stopScreenShare(conferenceId: string) {
    if (this.socket) {
      this.socket.emit('screen_share_stop', { conferenceId, userId: this.userId });
    }
  }

  // Recording Controls
  startRecording(conferenceId: string) {
    if (this.socket) {
      this.socket.emit('recording_start', { conferenceId, userId: this.userId });
    }
  }

  stopRecording(conferenceId: string) {
    if (this.socket) {
      this.socket.emit('recording_stop', { conferenceId, userId: this.userId });
    }
  }

  // Chat
  sendChatMessage(conferenceId: string, message: string, messageType: string = 'text') {
    if (this.socket) {
      this.socket.emit('chat_message', {
        conferenceId,
        userId: this.userId,
        message,
        messageType
      });
    }
  }

  // Hand Raise
  raiseHand(conferenceId: string, isRaised: boolean) {
    if (this.socket) {
      this.socket.emit('raise_hand', { conferenceId, userId: this.userId, isRaised });
    }
  }

  // Participant Management
  muteParticipant(conferenceId: string, participantId: string, isMuted: boolean) {
    if (this.socket) {
      this.socket.emit('mute_participant', {
        conferenceId,
        userId: this.userId,
        participantId,
        isMuted
      });
    }
  }

  removeParticipant(conferenceId: string, participantId: string) {
    if (this.socket) {
      this.socket.emit('remove_participant', {
        conferenceId,
        userId: this.userId,
        participantId
      });
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
