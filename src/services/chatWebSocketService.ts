import { io, Socket } from 'socket.io-client';
import { SOCKET_IO_PATH, buildNamespaceUrl, shouldForceWebsocketOnly } from '@/lib/websocket-utils';
import {
  ChatMessage,
  ChatRoom,
  ChatParticipant,
  SendMessageDto,
  TypingIndicator,
  VideoCallEvent,
} from '@/types/chat';

class ChatWebSocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private token: string | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  // Event callbacks
  private eventCallbacks: Map<string, Function[]> = new Map();

  connect(userId: string, token: string): Promise<void> {
    return new Promise((resolve) => {
      this.userId = userId;
      this.token = token;

      // Build absolute namespace URL and correct path
      const wsUrl = buildNamespaceUrl('/chat');
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      const options: Parameters<typeof io>[1] = {
        path: SOCKET_IO_PATH,
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        withCredentials: true, // Enable CORS credentials
        autoConnect: true,
        forceNew: false,
        // Pass auth in query for better handshake
        auth: {
          token: token
        },
        query: {
          userId: userId
        }
      };
      if (shouldForceWebsocketOnly()) {
        options.transports = ['websocket'];
      }
      this.socket = io(wsUrl, options);

      this.socket.on('connect', () => {
        console.log('✅ Connected to chat server');

        // Authenticate after connect as per backend guidelines
        this.socket!.emit('authenticate', {
          userId: userId,
          token: token
        });
      });

      this.socket.on('authenticated', (data) => {
        console.log('🔐 WebSocket authenticated:', data);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.isConnected = false;
        this.emit('connection_error', error);

        // Don't reject immediately - let reconnection attempts handle it
        if (this.reconnectAttempts === 0) {
          console.log('🔄 Will attempt reconnection...');
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from chat server:', reason);
        this.isConnected = false;
        this.emit('disconnected', reason);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected to chat server after', attemptNumber, 'attempts');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('reconnected', attemptNumber);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection error:', error);
        this.reconnectAttempts++;
        this.emit('reconnection_error', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Failed to reconnect to chat server');
        this.isConnected = false;
        this.emit('reconnection_failed');
        // Resolve the promise even if connection fails - app should still work
        resolve();
      });

      // Add connection timeout
      setTimeout(() => {
        if (!this.isConnected) {
          console.warn('⚠️ WebSocket connection timeout - continuing without real-time features');
          this.emit('connection_timeout');
          resolve(); // Don't reject - let the app work without WebSocket
        }
      }, 15000); // 15 second timeout

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Catch-all logger and event aliasing to handle backend naming variations
    this.socket.onAny((event: string, data: any) => {
      try {
        console.log('🛰️ WS event:', event, data);
        // Normalize common variants to our internal events
        if (event === 'new_message' || event === 'message' || event === 'chat_message' || event === 'message_created') {
          this.emit('new_message', data);
          this.emit('message_received', data);
        } else if (event === 'message_sent' || event === 'message:sent') {
          this.emit('message_sent', data);
        } else if (event === 'message_edited' || event === 'edited_message' || event === 'message:update') {
          this.emit('message_updated', data);
          this.emit('message_edited', data);
        } else if (event === 'typing' && data) {
          this.emit('user_typing', data);
        }
      } catch (e) {
        console.error('❌ Error handling onAny WS event:', e);
      }
    });

    // Message events
    this.socket.on('message_received', (data: ChatMessage) => {
      console.log('📨 Message received:', data);
      this.emit('message_received', data);
    });

    this.socket.on('new_message', (data: ChatMessage) => {
      console.log('📨 New message (broadcast):', data);
      this.emit('new_message', data);
    });

    this.socket.on('message_sent', (data: ChatMessage) => {
      console.log('✅ Message sent confirmation:', data);
      this.emit('message_sent', data);
    });

    this.socket.on('message_updated', (data: ChatMessage) => {
      console.log('✏️ Message updated:', data);
      this.emit('message_updated', data);
    });

    this.socket.on('message_edited', (data: ChatMessage) => {
      console.log('✏️ Message edited:', data);
      this.emit('message_updated', data);
      this.emit('message_edited', data);
    });

    this.socket.on('message_deleted', (data: { messageId: string; roomId: string }) => {
      console.log('🗑️ Message deleted:', data);
      this.emit('message_deleted', data);
    });

    // Room events
    this.socket.on('room_created', (data: ChatRoom) => {
      console.log('🏠 Room created:', data);
      this.emit('room_created', data);
    });

    this.socket.on('room_updated', (data: ChatRoom) => {
      console.log('🏠 Room updated:', data);
      this.emit('room_updated', data);
    });

    this.socket.on('participant_added', (data: { roomId: string; participant: ChatParticipant }) => {
      console.log('👤 Participant added:', data);
      this.emit('participant_added', data);
    });

    this.socket.on('participant_removed', (data: { roomId: string; participantId: string }) => {
      console.log('👤 Participant removed:', data);
      this.emit('participant_removed', data);
    });

    this.socket.on('participant_updated', (data: { roomId: string; participant: ChatParticipant }) => {
      console.log('👤 Participant updated:', data);
      this.emit('participant_updated', data);
    });

    // Typing indicators
    this.socket.on('user_typing', (data: TypingIndicator) => {
      console.log('⌨️ User typing:', data);
      this.emit('user_typing', data);
    });

    this.socket.on('user_stopped_typing', (data: TypingIndicator) => {
      console.log('⌨️ User stopped typing:', data);
      this.emit('user_stopped_typing', data);
    });

    // Video call events
    this.socket.on('video_call_started', (data: VideoCallEvent) => {
      console.log('📹 Video call started:', data);
      this.emit('video_call_started', data);
    });

    this.socket.on('video_call_ended', (data: VideoCallEvent) => {
      console.log('📹 Video call ended:', data);
      this.emit('video_call_ended', data);
    });

    this.socket.on('video_call_join_request', (data: VideoCallEvent) => {
      console.log('📹 Video call join request:', data);
      this.emit('video_call_join_request', data);
    });

    // Notification events
    this.socket.on('notification', (data: any) => {
      console.log('🔔 Notification received:', data);
      this.emit('notification', data);
    });

    // Error events
    this.socket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
      this.emit('error', error);
    });

    // Message edit error events
    this.socket.on('message_edit_error', (data: any) => {
      console.error('❌ Message edit error:', data);
      this.emit('message_edit_error', data);
    });
  }

  // Event subscription methods
  on(event: string, callback: Function) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!this.eventCallbacks.has(event)) return;

    if (callback) {
      const callbacks = this.eventCallbacks.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.eventCallbacks.delete(event);
    }
  }

  private emit(event: string, data?: any) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error in event callback:', error);
        }
      });
    }
  }

  // Send message via WebSocket
  sendMessage(roomId: string, messageData: SendMessageDto) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    console.log('📤 Sending message via WebSocket:', roomId, messageData);
    this.socket.emit('send_message', {
      roomId,
      ...messageData
    });
  }

  // Join room
  joinRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot join room:', roomId);
      return false;
    }

    console.log('🚪 Joining room:', roomId);
    this.socket.emit('join_room', { roomId });
    return true;
  }

  // Leave room
  leaveRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot leave room:', roomId);
      return false;
    }

    console.log('🚪 Leaving room:', roomId);
    this.socket.emit('leave_room', { roomId });
    return true;
  }

  // Send typing indicator
  sendTypingIndicator(roomId: string, isTyping: boolean) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot send typing indicator');
      return false;
    }

    console.log('⌨️ Sending typing indicator:', roomId, isTyping);
    const payload = { roomId, userId: this.userId, isTyping } as any;
    // New backend API: separate start/stop events
    if (isTyping) {
      this.socket.emit('typing_start', payload);
    } else {
      this.socket.emit('typing_stop', payload);
    }
    // Backward compatibility (old single event)
    this.socket.emit('typing', { roomId, isTyping });
    return true;
  }

  // Start video call
  startVideoCall(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot start video call');
      return false;
    }

    console.log('📹 Starting video call:', roomId);
    this.socket.emit('start_video_call', { roomId, userId: this.userId });
    return true;
  }

  // Start audio call
  startAudioCall(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot start audio call');
      return false;
    }

    console.log('📞 Starting audio call:', roomId);
    this.socket.emit('start_audio_call', { roomId, userId: this.userId });
    return true;
  }

  // Generic emit for custom events
  emitEvent(event: string, data: any) {
    if (!this.socket || !this.isConnected) {
      console.warn(`⚠️ Socket not connected, cannot emit ${event}`);
      return false;
    }
    this.socket.emit(event, data);
    return true;
  }

  // End video call
  endVideoCall(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot end video call');
      return false;
    }

    console.log('📹 Ending video call:', roomId);
    this.socket.emit('end_video_call', { roomId });
    return true;
  }

  // Join video call
  joinVideoCall(roomId: string, callId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot join video call');
      return false;
    }

    console.log('📹 Joining video call:', roomId, callId);
    this.socket.emit('join_video_call', { roomId, callId });
    return true;
  }

  // Leave video call
  leaveVideoCall(roomId: string, callId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot leave video call');
      return false;
    }

    console.log('📹 Leaving video call:', roomId, callId);
    this.socket.emit('leave_video_call', { roomId, callId });
    return true;
  }

  // Mark messages as read
  markMessagesAsRead(roomId: string, messageIds: string[]) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot mark messages as read');
      return false;
    }

    console.log('👁️ Marking messages as read:', roomId, messageIds);
    this.socket.emit('mark_messages_read', { roomId, messageIds });
    return true;
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from chat server');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.userId = null;
    this.token = null;
    this.eventCallbacks.clear();
  }

  // Reconnect manually
  async reconnect(): Promise<void> {
    if (this.userId && this.token) {
      console.log('🔄 Attempting to reconnect...');
      await this.connect(this.userId, this.token);
    }
  }
}

export const chatWebSocketService = new ChatWebSocketService();
