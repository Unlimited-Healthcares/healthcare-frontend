import { apiClient } from '@/lib/api-client';
import {
  ChatRoom,
  ChatMessage,
  ChatParticipant,
  ChatMessageReaction,
  CreateChatRoomDto,
  SendMessageDto,
  RoomFilters,
  MessageFilters,
  ChatRoomListResponse,
  ChatMessageListResponse,
  ChatKPIs,
  ChatRoomType,
} from '@/types/chat';
import { participantProfileService } from './participantProfileService';

export class ChatService {
  private apiClient = apiClient;

  // Enhanced createChatRoom with duplicate DM prevention
  async createChatRoom(roomData: CreateChatRoomDto): Promise<{ room: ChatRoom; action: 'created' | 'found' }> {
    try {
      console.log('🔍 Creating chat room with backend duplicate prevention:', roomData);

      // Try backend logic first
      const response = await this.apiClient.post<{
        room: ChatRoom;
        action: 'created' | 'found';
        message: string;
      }>('/chat/rooms', roomData);

      console.log('✅ Backend response:', response);
      return {
        room: response.room,
        action: response.action
      };
    } catch (error) {
      console.error('❌ Backend createChatRoom failed, falling back to frontend logic:', error);

      // Fallback to original logic if backend fails
      try {
        const room = await this.createChatRoomLegacy(roomData);
        return {
          room,
          action: 'created'
        };
      } catch (fallbackError) {
        console.error('❌ Fallback createChatRoom also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }

  // Legacy createChatRoom method (renamed for fallback)
  async createChatRoomLegacy(roomData: CreateChatRoomDto): Promise<ChatRoom> {
    try {
      console.log('🔍 Creating chat room (legacy method):', JSON.stringify(roomData, null, 2));
      const response = await this.apiClient.post<any>('/chat/rooms', roomData);

      console.log('✅ API Response received:', JSON.stringify(response, null, 2));
      console.log('📋 API Response structure:', {
        hasData: !!response,
        hasNestedRoom: !!(response as any)?.room,
        id: (response as any)?.room?.id || (response as any)?.id,
        name: (response as any)?.room?.name || (response as any)?.name,
        type: (response as any)?.room?.type || (response as any)?.type,
        participantsCount: ((response as any)?.room?.participants || (response as any)?.participants)?.length,
        participants: ((response as any)?.room?.participants || (response as any)?.participants)?.map((p: any) => ({
          id: p.id,
          userId: p.userId,
          userName: p.userName,
          userAvatar: p.userAvatar,
          hasUserObject: !!p.user,
          userObjectKeys: p.user ? Object.keys(p.user) : [],
          fullParticipantObject: p
        }))
      });

      // Normalize to ChatRoom
      const normalized: ChatRoom = (response as any)?.room || (response as any);
      return normalized;
    } catch (error) {
      console.error('❌ Error creating chat room (legacy):', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async getUserChatRooms(filters: RoomFilters = {}): Promise<ChatRoomListResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Filter out invalid parameters
      const validParams = ['page', 'limit', 'type', 'centerId', 'isActive'];

      Object.entries(filters).forEach(([key, value]) => {
        if (validParams.includes(key) && value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/chat/rooms?${queryString}` : '/chat/rooms';

      console.log('🔍 Fetching chat rooms from:', endpoint);
      const response = await this.apiClient.get<any>(endpoint);

      // Note: GET /chat/rooms currently returns incomplete participant data
      // It only includes the current user's participant. This is a backend issue.
      // WORKAROUND: Use room.name as fallback (it should contain the other participant's name)

      // Ensure response has the expected structure
      if (!response) {
        throw new Error('No response received from server');
      }

      // Handle both API response formats: { data: [], total, page, totalPages } and { data: [], pagination: {} }
      const data = response.data || [];
      const pagination = response.pagination || {
        page: response.page || 1,
        limit: response.limit || 20,
        total: response.total || 0,
        totalPages: response.totalPages || 0
      };

      return {
        data,
        pagination
      };
    } catch (error) {
      console.error('❌ Error fetching chat rooms:', error);
      throw error;
    }
  }

  async getChatRoomById(roomId: string): Promise<ChatRoom> {
    try {
      console.log('🔍 Fetching chat room:', roomId);
      const response = await this.apiClient.get<ChatRoom>(`/chat/rooms/${roomId}`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching chat room:', error);
      throw error;
    }
  }

  async addParticipant(roomId: string, userId: string): Promise<ChatParticipant> {
    try {
      console.log('🔍 Adding participant to room:', roomId, userId);
      const response = await this.apiClient.post<ChatParticipant>(`/chat/rooms/${roomId}/participants`, {
        userId
      });
      return response;
    } catch (error) {
      console.error('❌ Error adding participant:', error);
      throw error;
    }
  }

  async removeParticipant(roomId: string, participantId: string): Promise<void> {
    try {
      console.log('🔍 Removing participant from room:', roomId, participantId);
      await this.apiClient.delete(`/chat/rooms/${roomId}/participants/${participantId}`);
    } catch (error) {
      console.error('❌ Error removing participant:', error);
      throw error;
    }
  }

  async archiveRoom(roomId: string): Promise<void> {
    try {
      console.log('🔍 Archiving chat room:', roomId);
      await this.apiClient.patch(`/chat/rooms/${roomId}`, {
        isActive: false
      });
    } catch (error) {
      console.error('❌ Error archiving room:', error);
      throw error;
    }
  }

  async updateRoom(roomId: string, data: Partial<ChatRoom>): Promise<ChatRoom> {
    try {
      console.log('🔍 Updating chat room:', roomId, data);
      const response = await this.apiClient.patch<ChatRoom>(`/chat/rooms/${roomId}`, data);
      return response;
    } catch (error) {
      console.error('❌ Error updating room:', error);
      throw error;
    }
  }

  // Message Management
  async sendMessage(roomId: string, messageData: SendMessageDto): Promise<ChatMessage> {
    try {
      console.log('🔍 Sending message to room:', roomId, messageData);
      const response = await this.apiClient.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, messageData);
      return response;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  async getRoomMessages(roomId: string, filters: MessageFilters = {}): Promise<ChatMessageListResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Filter out invalid parameters
      const validParams = ['page', 'limit', 'messageType', 'dateFrom', 'dateTo'];

      Object.entries(filters).forEach(([key, value]) => {
        if (validParams.includes(key) && value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/chat/rooms/${roomId}/messages?${queryString}` : `/chat/rooms/${roomId}/messages`;

      console.log('🔍 Fetching room messages from:', endpoint);
      const response = await this.apiClient.get<any>(endpoint);

      // Ensure response has the expected structure
      if (!response) {
        throw new Error('No response received from server');
      }

      // Handle both API response formats: { data: [], total, page, totalPages } and { data: [], pagination: {} }
      const rawMessages = response.data || [];

      // Enhance messages with sender profile information
      const enhancedMessages = await this.enhanceMessagesWithProfiles(rawMessages);

      const pagination = response.pagination || {
        page: response.page || 1,
        limit: response.limit || 50,
        total: response.total || 0,
        totalPages: response.totalPages || 0
      };

      return {
        data: enhancedMessages,
        pagination
      };
    } catch (error) {
      console.error('❌ Error fetching room messages:', error);
      // Handle 403 Forbidden (not a participant)
      if (error instanceof Error && error.message.includes('403')) {
        throw new Error('You are not a participant in this room');
      }
      throw error;
    }
  }

  async editMessage(messageId: string, newContent: string): Promise<ChatMessage> {
    try {
      console.log('🔍 Editing message:', messageId, newContent);
      const response = await this.apiClient.patch<ChatMessage>(`/chat/messages/${messageId}`, {
        content: newContent
      });
      return response;
    } catch (error) {
      console.error('❌ Error editing message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      console.log('🔍 Deleting message:', messageId);
      await this.apiClient.delete(`/chat/messages/${messageId}`);
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      throw error;
    }
  }

  async addReaction(messageId: string, reaction: string): Promise<ChatMessageReaction> {
    try {
      console.log('🔍 Adding reaction to message:', messageId, reaction);
      const response = await this.apiClient.post<ChatMessageReaction>(`/chat/messages/${messageId}/reactions`, {
        reaction
      });
      return response;
    } catch (error) {
      console.error('❌ Error adding reaction:', error);
      throw error;
    }
  }

  async removeReaction(messageId: string, reactionId: string): Promise<void> {
    try {
      console.log('🔍 Removing reaction from message:', messageId, reactionId);
      await this.apiClient.delete(`/chat/messages/${messageId}/reactions/${reactionId}`);
    } catch (error) {
      console.error('❌ Error removing reaction:', error);
      throw error;
    }
  }

  // File Upload
  async uploadFile(file: File): Promise<string> {
    try {
      console.log('🔍 Uploading file:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.apiClient.post<{ url: string }>('/uploads/chat', formData);

      return response.url;
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }

  // Helper method to enhance messages with sender profile information
  private async enhanceMessagesWithProfiles(messages: ChatMessage[]): Promise<ChatMessage[]> {
    try {
      // Get unique sender IDs
      const senderIds = [...new Set(messages.map(msg => msg.senderId))];

      // Fetch profiles for all senders
      const profiles = await participantProfileService.getParticipantProfiles(senderIds);

      // Enhance messages with profile data
      return messages.map(message => {
        const profile = profiles.get(message.senderId);
        if (profile) {
          return {
            ...message,
            senderName: profile.name,
            senderAvatar: profile.avatar
          };
        }
        return message;
      });
    } catch (error) {
      console.warn('⚠️ Failed to enhance messages with profiles:', error);
      // Return original messages if profile enhancement fails
      return messages;
    }
  }

  // Helper method to calculate KPIs from chat data
  calculateKPIs(rooms: ChatRoom[], messages: ChatMessage[]): ChatKPIs {
    // Handle case where data is undefined or null
    if (!rooms || !Array.isArray(rooms) || !messages || !Array.isArray(messages)) {
      return {
        totalRooms: 0,
        activeRooms: 0,
        totalMessages: 0,
        unreadMessages: 0,
        onlineUsers: 0,
        emergencyRooms: 0,
        totalRoomsChange: 0,
        activeRoomsChange: 0,
        totalMessagesChange: 0,
        unreadMessagesChange: 0,
        onlineUsersChange: 0,
        emergencyRoomsChange: 0
      };
    }

    // Calculate metrics
    const totalRooms = rooms.length;
    const activeRooms = rooms.filter(room => room.isActive).length;
    const totalMessages = messages.length;
    const unreadMessages = rooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
    const onlineUsers = rooms.reduce((sum, room) => {
      return sum + room.participants.filter(p => p.isActive).length;
    }, 0);
    const emergencyRooms = rooms.filter(room => room.type === ChatRoomType.EMERGENCY).length;

    // Mock percentage changes (in real implementation, these would be calculated from historical data)
    return {
      totalRooms,
      activeRooms,
      totalMessages,
      unreadMessages,
      onlineUsers,
      emergencyRooms,
      totalRoomsChange: 8,
      activeRoomsChange: 12,
      totalMessagesChange: 25,
      unreadMessagesChange: -15,
      onlineUsersChange: 18,
      emergencyRoomsChange: 0
    };
  }

  // Check for existing Direct Message between two users
  async findExistingDirectMessage(userId1: string, userId2: string): Promise<ChatRoom | null> {
    try {
      console.log('🔍 Checking for existing DM between:', userId1, 'and', userId2);

      // Get all direct message rooms for the current user
      const filters: RoomFilters = {
        type: ChatRoomType.DIRECT,
        isActive: true
      };

      const response = await this.getUserChatRooms(filters);
      const directMessageRooms = response.data || [];

      // Find a room that contains both users
      const existingRoom = directMessageRooms.find((room: any) => {
        if (!room.participants || room.participants.length !== 2) {
          return false;
        }

        const participantIds = room.participants.map((p: any) => p.userId);
        return participantIds.includes(userId1) && participantIds.includes(userId2);
      });

      if (existingRoom) {
        console.log('✅ Found existing DM:', existingRoom.id);
        return existingRoom;
      }

      console.log('ℹ️ No existing DM found');
      return null;
    } catch (error) {
      console.error('❌ Error checking for existing DM:', error);
      return null;
    }
  }

  // Update room settings
  async updateRoomSettings(roomId: string, settings: Record<string, unknown>): Promise<ChatRoom> {
    try {
      console.log('🔍 Updating room settings:', roomId, settings);
      const response = await this.apiClient.patch<ChatRoom>(`/chat/rooms/${roomId}`, {
        roomSettings: settings
      });
      return response;
    } catch (error) {
      console.error('❌ Error updating room settings:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(roomId: string, messageIds: string[]): Promise<void> {
    try {
      console.log('🔍 Marking messages as read:', roomId, messageIds);
      await this.apiClient.post(`/chat/rooms/${roomId}/mark-read`, {
        messageIds
      });
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      throw error;
    }
  }

  // Search messages
  async searchMessages(query: string, roomId?: string): Promise<ChatMessage[]> {
    try {
      console.log('🔍 Searching messages:', query, roomId);
      const params = new URLSearchParams({ q: query });
      if (roomId) {
        params.append('roomId', roomId);
      }

      const response = await this.apiClient.get<ChatMessage[]>(`/chat/messages/search?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ Error searching messages:', error);
      throw error;
    }
  }

  // Get users for chat room creation
  async getUsers(searchQuery?: string, centerId?: string): Promise<any[]> {
    try {
      console.log('🔍 Fetching users:', searchQuery, centerId);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (centerId) {
        params.append('centerId', centerId);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/users?${queryString}` : '/users';

      const response = await this.apiClient.get<any[]>(endpoint);
      return response || [];
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      // Fallback to empty array if users endpoint doesn't exist
      return [];
    }
  }
}

export const chatService = new ChatService();
