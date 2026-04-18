import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { chatWebSocketService } from '@/services/chatWebSocketService';
import { participantProfileService } from '@/services/participantProfileService';
import {
  ChatRoom,
  ChatMessage,
  ChatKPIs as ChatKPIsType,
  RoomFilters,
  MessageFilters,
  CreateChatRoomDto,
  SendMessageDto,
  MessageType,
  ChatRoomType
} from '@/types/chat';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatKPIs from '@/components/chat/ChatKPIs';
import ChatRoomList from '@/components/chat/ChatRoomList';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import CreateRoomModal from '@/components/chat/CreateRoomModal';
import RoomSettingsModal from '@/components/chat/RoomSettingsModal';
import IncomingCallModal from '@/components/chat/IncomingCallModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getDMDisplayName, getDMAvatar, getAvatarUrl } from '@/utils/chatDisplayUtils';
import {
  PlusIcon,
  VideoCameraIcon,
  PhoneIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArchiveBoxIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ChatPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // State management
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [kpis, setKpis] = useState<ChatKPIsType>({
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
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [roomForSettings, setRoomForSettings] = useState<ChatRoom | null>(null);
  const [remoteTypingUsers, setRemoteTypingUsers] = useState<Record<string, { userId: string; roomId: string; expiresAt: number }>>({});
  const [remoteTypingText, setRemoteTypingText] = useState<string>('');
  const [userNameCache, setUserNameCache] = useState<Record<string, string>>({});

  // Call state
  const [incomingCall, setIncomingCall] = useState<{
    isOpen: boolean;
    callerName: string;
    callerAvatar?: string | null;
    callType: 'video' | 'audio';
    roomId: string;
  }>({
    isOpen: false,
    callerName: '',
    callType: 'video',
    roomId: ''
  });

  // Mobile-specific state
  const [showArchived, setShowArchived] = useState(false);
  const [archivedRooms, setArchivedRooms] = useState<ChatRoom[]>([]);
  // Initialize mobile state immediately to prevent layout flicker
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Refs for auto-scroll
  const mobileMessagesContainerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLTextAreaElement>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [roomFilters] = useState<RoomFilters>({
    page: 1,
    limit: 20,
    type: undefined,
    isActive: true
  });

  const [messageFilters] = useState<MessageFilters>({
    page: 1,
    limit: 50
  });

  // Load chat rooms
  const loadChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: RoomFilters = {
        ...roomFilters,
        type: selectedRoomType !== 'all' ? selectedRoomType as ChatRoomType : undefined,
        isActive: true // Only load active (non-archived) rooms
      };

      const response = await chatService.getUserChatRooms(filters);

      // Enhance DM room participants with full user.profile data
      const enhancedRooms = await Promise.all(
        (response.data || []).map(async (room) => {
          if (room.type === ChatRoomType.DIRECT && user?.id) {
            const other = room.participants.find(p => p.userId !== user.id);
            if (other) {
              // If participant doesn't have full user.profile data, fetch it
              if (!other.user?.profile) {
                try {
                  const profile = await participantProfileService.getParticipantProfile(other.userId);
                  if (profile) {
                    // Construct full user.profile structure for participant
                    const enhancedParticipant = {
                      ...other,
                      userName: profile.name,
                      userAvatar: profile.avatar,
                      user: {
                        id: other.userId,
                        email: profile.email || '',
                        profile: {
                          id: profile.id || other.userId,
                          firstName: profile.name?.split(' ')[0] || '',
                          lastName: profile.name?.split(' ').slice(1).join(' ') || '',
                          displayName: profile.name || '',
                          avatar: profile.avatar || null
                        }
                      }
                    };

                    return {
                      ...room,
                      participants: room.participants.map(p =>
                        p.userId === other.userId ? enhancedParticipant : p
                      )
                    } as ChatRoom;
                  }
                } catch (err) {
                  console.error('Failed to load profile for participant:', err);
                  // Fallback: keep existing participant data
                  return room;
                }
              }
            }
          }
          return room;
        })
      );

      // Filter out any rooms that might have isActive: false (safety check)
      const activeRooms = enhancedRooms.filter(room => room.isActive !== false);
      setRooms(activeRooms);

      // Calculate KPIs using only active rooms
      const allMessages = activeRooms.flatMap(room => room.messages || []);
      const calculatedKPIs = chatService.calculateKPIs(activeRooms, allMessages);
      setKpis(calculatedKPIs);

    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setError('Failed to load chat rooms');
      toast.error('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  }, [roomFilters, selectedRoomType]);

  // Load room messages
  const loadRoomMessages = useCallback(async (roomId: string) => {
    try {
      setMessagesLoading(true);
      const response = await chatService.getRoomMessages(roomId, messageFilters);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading room messages:', error);
      if (error instanceof Error && error.message.includes('not a participant')) {
        toast.error('You are not a participant in this room');
        setSelectedRoom(null);
      } else {
        toast.error('Failed to load messages');
      }
    } finally {
      setMessagesLoading(false);
    }
  }, [messageFilters]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (user?.id) {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsReconnecting(true);
        setConnectionError(null);

        chatWebSocketService.connect(user.id, token)
          .then(() => {
            setIsConnected(true);
            setIsReconnecting(false);
            setConnectionError(null);
            console.log('✅ Connected to chat WebSocket');
          })
          .catch((error) => {
            console.error('❌ Failed to connect to chat WebSocket:', error);
            setIsConnected(false);
            setIsReconnecting(false);
            setConnectionError('Real-time chat unavailable - using HTTP fallback');
            // Don't show toast error - connection status will be shown in header
          });
      }
    }

    return () => {
      chatWebSocketService.disconnect();
    };
  }, [user?.id]);

  // WebSocket event handlers for connection status
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsReconnecting(false);
    };

    const handleReconnectionError = () => {
      setIsReconnecting(false);
      setConnectionError('Reconnection failed');
    };

    const handleReconnectionFailed = () => {
      setIsReconnecting(false);
      setConnectionError('Connection lost - messages will still be sent via HTTP');
    };

    const handleConnectionTimeout = () => {
      setIsReconnecting(false);
      setConnectionError('Real-time connection timeout - using HTTP fallback');
    };

    // Subscribe to connection events
    chatWebSocketService.on('connected', handleConnected);
    chatWebSocketService.on('disconnected', handleDisconnected);
    chatWebSocketService.on('reconnected', handleConnected);
    chatWebSocketService.on('reconnection_error', handleReconnectionError);
    chatWebSocketService.on('reconnection_failed', handleReconnectionFailed);
    chatWebSocketService.on('connection_timeout', handleConnectionTimeout);

    return () => {
      chatWebSocketService.off('connected', handleConnected);
      chatWebSocketService.off('disconnected', handleDisconnected);
      chatWebSocketService.off('reconnected', handleConnected);
      chatWebSocketService.off('reconnection_error', handleReconnectionError);
      chatWebSocketService.off('reconnection_failed', handleReconnectionFailed);
      chatWebSocketService.off('connection_timeout', handleConnectionTimeout);
    };
  }, []);

  // Handle incoming typing events
  useEffect(() => {
    const handleTypingEvent = (data: { roomId: string; userId: string; isTyping: boolean }) => {
      if (!data || !data.roomId || !data.userId) return;
      // Ignore own typing
      if (data.userId === user?.id) return;
      if (!selectedRoom || data.roomId !== selectedRoom.id) return;
      if (data.isTyping) {
        setRemoteTypingUsers(prev => ({
          ...prev,
          [data.userId]: { userId: data.userId, roomId: data.roomId, expiresAt: Date.now() + 3000 }
        }));
        // Ensure display name is available for group chats
        if (selectedRoom.type !== ChatRoomType.DIRECT) {
          const participant = selectedRoom.participants.find(p => p.userId === data.userId);
          const existingName = participant?.userName || userNameCache[data.userId];
          if (!existingName) {
            participantProfileService
              .getParticipantProfile(data.userId)
              .then(profile => {
                const displayName = profile?.name || '';
                if (displayName) {
                  setUserNameCache(prev => ({ ...prev, [data.userId]: displayName }));
                }
              })
              .catch(() => { });
          }
        }
      } else {
        setRemoteTypingUsers(prev => {
          const copy = { ...prev };
          delete copy[data.userId];
          return copy;
        });
      }
    };

    chatWebSocketService.on('user_typing', handleTypingEvent);

    const interval = setInterval(() => {
      // Expire indicators after 3s
      setRemoteTypingUsers(prev => {
        const now = Date.now();
        const next = { ...prev };
        Object.values(next).forEach(v => { if (v.expiresAt <= now) { delete next[v.userId]; } });
        return next;
      });
    }, 1000);

    return () => {
      chatWebSocketService.off('user_typing', handleTypingEvent);
      clearInterval(interval);
    };
  }, [selectedRoom, user?.id]);

  // Compute remote typing text whenever typing users or cache/room changes
  useEffect(() => {
    if (!selectedRoom) {
      setRemoteTypingText('');
      return;
    }
    const ids = Object.keys(remoteTypingUsers);
    if (ids.length === 0) {
      setRemoteTypingText('');
      return;
    }
    if (selectedRoom.type === ChatRoomType.DIRECT) {
      setRemoteTypingText('typing...');
      return;
    }
    const names = ids
      .map(id => selectedRoom.participants.find(p => p.userId === id)?.userName || userNameCache[id])
      .filter((n): n is string => Boolean(n));
    if (names.length === 0) {
      setRemoteTypingText('typing...');
      return;
    }
    const display = names.length > 2 ? `${names[0]}, ${names[1]} and others` : names.join(', ');
    setRemoteTypingText(`${display} ${names.length > 1 ? 'are' : 'is'} typing...`);
  }, [remoteTypingUsers, selectedRoom, userNameCache]);

  // Auto-scroll to bottom when messages change or keyboard opens (mobile view)
  useEffect(() => {
    if (!mobileMessagesContainerRef.current) return;

    const scrollToBottom = () => {
      const container = mobileMessagesContainerRef.current;
      if (container) {
        // Use requestAnimationFrame for smooth scrolling after DOM updates
        requestAnimationFrame(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        });
      }
    };

    // Scroll when messages change
    scrollToBottom();

    // Also scroll when keyboard height changes (keyboard appears/disappears)
    if (keyboardHeight > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, keyboardHeight, remoteTypingText]);

  // Detect mobile device and keyboard height
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleKeyboardChange = () => {
      if (isMobile) {
        const initialHeight = window.innerHeight;
        const currentHeight = window.innerHeight;
        const heightDifference = initialHeight - currentHeight;

        // If height decreased significantly, keyboard is likely open
        if (heightDifference > 150) {
          setKeyboardHeight(heightDifference);
        } else {
          setKeyboardHeight(0);
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', handleKeyboardChange);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', handleKeyboardChange);
    };
  }, [isMobile]);

  // Load archived rooms - only rooms that were explicitly archived by users
  const loadArchivedRooms = useCallback(async () => {
    try {
      const filters: RoomFilters = {
        ...roomFilters,
        type: selectedRoomType !== 'all' ? selectedRoomType as ChatRoomType : undefined,
        isActive: false // Only load rooms that were explicitly archived by users
      };

      const response = await chatService.getUserChatRooms(filters);
      setArchivedRooms(response.data || []);
    } catch (error) {
      console.error('Error loading archived rooms:', error);
    }
  }, [roomFilters, selectedRoomType]);

  // Load initial data
  useEffect(() => {
    loadChatRooms();
    loadArchivedRooms();
  }, [loadChatRooms, loadArchivedRooms]);

  // Load messages when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadRoomMessages(selectedRoom.id);
      // Join room via WebSocket only if connected
      if (chatWebSocketService.getConnectionStatus()) {
        chatWebSocketService.joinRoom(selectedRoom.id);
      } else {
        console.warn('⚠️ WebSocket not connected, skipping joinRoom');
      }
    }
  }, [selectedRoom, loadRoomMessages]);

  // WebSocket event handlers - memoized to prevent stale closures
  const handleMessageReceived = useCallback(async (message: ChatMessage) => {
    console.log('📨 Real-time message received:', message);

    // Enhance the message with sender profile information
    try {
      const profile = await participantProfileService.getParticipantProfile(message.senderId);
      const enhancedMessage = {
        ...message,
        senderName: profile?.name || message.senderName,
        senderAvatar: profile?.avatar || message.senderAvatar
      };

      // Only add to messages if it's for the currently selected room
      setMessages(prev => {
        // Check if message already exists (prevent duplicates)
        const exists = prev.some(msg => msg.id === enhancedMessage.id);
        if (exists) {
          console.log('⚠️ Duplicate message detected, skipping');
          return prev;
        }

        // Only add if it's for the selected room
        if (selectedRoom && message.roomId === selectedRoom.id) {
          return [...prev, enhancedMessage];
        }
        return prev;
      });

      // Always update room's last message and unread count
      setRooms(prev => prev.map(room => {
        if (room.id === message.roomId) {
          // Only increment unread if not the currently selected room OR if not sent by current user
          const shouldIncrementUnread = !selectedRoom || selectedRoom.id !== message.roomId;
          return {
            ...room,
            lastMessage: enhancedMessage,
            unreadCount: shouldIncrementUnread ? (room.unreadCount || 0) + 1 : room.unreadCount
          };
        }
        return room;
      }));

      toast.success(`New message from ${enhancedMessage.senderName || 'User'}`, {
        duration: 2000,
      });
    } catch (error) {
      console.warn('⚠️ Failed to enhance WebSocket message with profile:', error);
      // Fallback to original message
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === message.id);
        if (exists || (selectedRoom && message.roomId !== selectedRoom.id)) {
          return prev;
        }
        return [...prev, message];
      });

      setRooms(prev => prev.map(room => {
        if (room.id === message.roomId) {
          const shouldIncrementUnread = !selectedRoom || selectedRoom.id !== message.roomId;
          return {
            ...room,
            lastMessage: message,
            unreadCount: shouldIncrementUnread ? (room.unreadCount || 0) + 1 : room.unreadCount
          };
        }
        return room;
      }));
    }
  }, [selectedRoom]);

  const handleMessageUpdated = useCallback((message: ChatMessage) => {
    console.log('✏️ Real-time message updated:', message);
    setMessages(prev => prev.map(msg =>
      msg.id === message.id ? message : msg
    ));

    // Update in rooms list too
    setRooms(prev => prev.map(room =>
      room.id === message.roomId && room.lastMessage?.id === message.id
        ? { ...room, lastMessage: message }
        : room
    ));
  }, []);

  const handleMessageDeleted = useCallback((data: { messageId: string; roomId: string }) => {
    console.log('🗑️ Real-time message deleted:', data);
    setMessages(prev => prev.filter(msg => msg.id !== data.messageId));

    // Update rooms list if it was the last message
    setRooms(prev => prev.map(room =>
      room.id === data.roomId && room.lastMessage?.id === data.messageId
        ? { ...room, lastMessage: undefined }
        : room
    ));
  }, []);

  const handleRoomCreated = useCallback(async (room: ChatRoom) => {
    console.log('🏠 Real-time room created:', {
      roomId: room.id,
      type: room.type,
      participantsCount: room.participants?.length,
      participants: room.participants?.map(p => ({
        id: p.id,
        userId: p.userId,
        userName: p.userName,
        hasUser: !!p.user,
        hasUserProfile: !!p.user?.profile
      }))
    });

    let enhancedRoom = room;
    if (room.type === ChatRoomType.DIRECT && user?.id) {
      // Ensure we have all participants loaded
      if (!room.participants || room.participants.length === 0) {
        console.warn('⚠️ Room has no participants, reloading...');
        try {
          const loadedRoom = await chatService.getChatRoomById(room.id);
          enhancedRoom = loadedRoom;
        } catch (err) {
          console.error('Failed to reload room:', err);
        }
      }

      const other = (enhancedRoom.participants || []).find(p => p.userId !== user.id);
      if (other) {
        console.log('🔍 Found other participant:', {
          userId: other.userId,
          userName: other.userName,
          hasUserObject: !!other.user
        });

        try {
          const profile = await participantProfileService.getParticipantProfile(other.userId);
          if (profile) {
            console.log('✅ Loaded profile for other participant:', {
              name: profile.name,
              email: profile.email
            });

            // Construct the full user object with profile for new display logic
            const updatedName = profile.name;
            const updatedAvatar = profile.avatar;

            // Update the participant with the full user object structure
            enhancedRoom = {
              ...enhancedRoom,
              participants: enhancedRoom.participants.map(p =>
                p.userId === other.userId
                  ? {
                    ...p,
                    userName: updatedName,
                    userAvatar: updatedAvatar,
                    // Add the full user object structure for new display logic
                    user: {
                      id: other.userId,
                      email: profile.email || '',
                      profile: {
                        id: profile.id || other.userId,
                        firstName: profile.name?.split(' ')[0] || '',
                        lastName: profile.name?.split(' ').slice(1).join(' ') || '',
                        displayName: profile.name || '',
                        avatar: profile.avatar || null
                      }
                    }
                  }
                  : p
              )
            } as ChatRoom;

            console.log('✅ Enhanced room with profile:', {
              participantsCount: enhancedRoom.participants.length,
              hasProfileData: enhancedRoom.participants.some(p => p.user?.profile)
            });
          }
        } catch (err) {
          console.error('❌ Failed to load profile:', err);
          enhancedRoom = { ...enhancedRoom, name: other.userName || enhancedRoom.name } as ChatRoom;
        }
      } else {
        console.warn('⚠️ Could not find other participant');
      }
    }

    setRooms(prev => {
      // Check if room already exists
      const exists = prev.some(r => r.id === enhancedRoom.id);
      if (exists) return prev;

      // Only add room if it's active (not archived)
      if (enhancedRoom.isActive) {
        return [enhancedRoom, ...prev];
      }

      return prev;
    });

    toast.success(`New chat room: "${getDMDisplayName(enhancedRoom, user?.id || '', profile?.name)}"`);
  }, [user?.id]);

  const handleParticipantAdded = useCallback((data: { roomId: string; participant: any }) => {
    console.log('👤 Real-time participant added:', data);
    setRooms(prev => prev.map(room =>
      room.id === data.roomId
        ? { ...room, participants: [...room.participants, data.participant] }
        : room
    ));

    // Update selected room if applicable
    setSelectedRoom(prev =>
      prev && prev.id === data.roomId
        ? { ...prev, participants: [...prev.participants, data.participant] }
        : prev
    );
  }, []);

  const handleParticipantRemoved = useCallback((data: { roomId: string; participantId: string }) => {
    console.log('👤 Real-time participant removed:', data);
    setRooms(prev => prev.map(room =>
      room.id === data.roomId
        ? { ...room, participants: room.participants.filter(p => p.id !== data.participantId) }
        : room
    ));

    // Update selected room if applicable
    setSelectedRoom(prev =>
      prev && prev.id === data.roomId
        ? { ...prev, participants: prev.participants.filter(p => p.id !== data.participantId) }
        : prev
    );
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    chatWebSocketService.on('new_message', handleMessageReceived);
    chatWebSocketService.on('message_sent', handleMessageReceived);
    chatWebSocketService.on('message_received', handleMessageReceived);
    chatWebSocketService.on('message_updated', handleMessageUpdated);
    chatWebSocketService.on('message_edited', handleMessageUpdated);
    chatWebSocketService.on('message_edit_error', (data: any) => {
      const msg = typeof data?.message === 'string' ? data.message : '';
      if (msg.includes('3 minute')) {
        toast.error('Message can only be edited within 3 minutes of sending');
      }
    });
    chatWebSocketService.on('message_deleted', handleMessageDeleted);
    chatWebSocketService.on('room_created', handleRoomCreated);
    chatWebSocketService.on('participant_added', handleParticipantAdded);
    chatWebSocketService.on('participant_removed', handleParticipantRemoved);

    // Call signaling
    chatWebSocketService.on('incoming_video_call', async (data: any) => {
      if (data.callerId === user?.id) return; // Ignore own calls

      console.log('📞 Incoming video call:', data);
      try {
        const callerProfile = await participantProfileService.getParticipantProfile(data.callerId);
        setIncomingCall({
          isOpen: true,
          callerName: callerProfile?.name || 'Unknown Caller',
          callerAvatar: callerProfile?.avatar,
          callType: 'video',
          roomId: data.roomId
        });
      } catch (err) {
        setIncomingCall({
          isOpen: true,
          callerName: 'Someone',
          callType: 'video',
          roomId: data.roomId
        });
      }
    });

    chatWebSocketService.on('incoming_audio_call', async (data: any) => {
      if (data.callerId === user?.id) return;

      console.log('📞 Incoming audio call:', data);
      try {
        const callerProfile = await participantProfileService.getParticipantProfile(data.callerId);
        setIncomingCall({
          isOpen: true,
          callerName: callerProfile?.name || 'Unknown Caller',
          callerAvatar: callerProfile?.avatar,
          callType: 'audio',
          roomId: data.roomId
        });
      } catch (err) {
        setIncomingCall({
          isOpen: true,
          callerName: 'Someone',
          callType: 'audio',
          roomId: data.roomId
        });
      }
    });

    return () => {
      chatWebSocketService.off('new_message', handleMessageReceived);
      chatWebSocketService.off('message_sent', handleMessageReceived);
      chatWebSocketService.off('message_received', handleMessageReceived);
      chatWebSocketService.off('message_updated', handleMessageUpdated);
      chatWebSocketService.off('message_edited', handleMessageUpdated);
      chatWebSocketService.off('message_edit_error');
      chatWebSocketService.off('message_deleted', handleMessageDeleted);
      chatWebSocketService.off('room_created', handleRoomCreated);
      chatWebSocketService.off('participant_added', handleParticipantAdded);
      chatWebSocketService.off('participant_removed', handleParticipantRemoved);
      chatWebSocketService.off('incoming_video_call');
      chatWebSocketService.off('incoming_audio_call');
    };
  }, [handleMessageReceived, handleMessageUpdated, handleMessageDeleted, handleRoomCreated, handleParticipantAdded, handleParticipantRemoved, user?.id]);

  // Event handlers
  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    // Mark messages as read
    if (room.unreadCount && room.unreadCount > 0) {
      setRooms(prev => prev.map(r =>
        r.id === room.id ? { ...r, unreadCount: 0 } : r
      ));
    }

    // On mobile, switch to chat view when room is selected
    if (isMobile) {
      setMobileView('chat');
    }
  };

  const handleSendMessage = async (content: string, messageType: MessageType = MessageType.TEXT) => {
    if (!selectedRoom || !content.trim()) return;

    try {
      const messageData: SendMessageDto = {
        content: content.trim(),
        messageType
      };

      // Send via API and optimistically append the returned message so sender sees it immediately
      const sent = await chatService.sendMessage(selectedRoom.id, messageData);

      // Ensure room match then add if not duplicate
      if (sent && sent.roomId === selectedRoom.id) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === sent.id);
          if (exists) return prev;
          return [...prev, sent];
        });
        setRooms(prev => prev.map(r => r.id === selectedRoom.id ? { ...r, lastMessage: sent } : r));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleSendFile = async (file: File) => {
    if (!selectedRoom) return;

    try {
      // Upload file first
      const fileUrl = await chatService.uploadFile(file);

      const messageData: SendMessageDto = {
        content: file.name,
        messageType: file.type.startsWith('image/') ? MessageType.IMAGE :
          file.type.startsWith('video/') ? MessageType.VIDEO :
            file.type.startsWith('audio/') ? MessageType.AUDIO : MessageType.FILE,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };

      await chatService.sendMessage(selectedRoom.id, messageData);
      toast.success('File sent successfully');

    } catch (error) {
      console.error('Error sending file:', error);
      toast.error('Failed to send file');
    }
  };

  // Handle opening existing room by ID
  const handleOpenExistingRoom = async (roomId: string) => {
    // Find the room in the current rooms list
    const existingRoom = rooms.find(room => room.id === roomId);
    if (existingRoom) {
      handleRoomSelect(existingRoom);
      return;
    }
    // Load from server and enrich if necessary
    try {
      console.log('Room not found in current list, attempting to load:', roomId);
      const { data } = await chatService.getUserChatRooms({ page: 1, limit: 50, isActive: true });
      const loaded = (data as any[]).find((r) => r.id === roomId) as ChatRoom | undefined;
      if (loaded) {
        setRooms((prev) => [loaded, ...prev]);
        handleRoomSelect(loaded);
      } else {
        toast.info('Room loaded but not found in recent list');
      }
    } catch (err) {
      console.error('Failed to load room by id', err);
    }
  };

  const handleCreateRoom = async (room: any) => {
    try {
      console.log('✅ Room created safely:', room);

      setShowCreateModal(false);

      // Delay to ensure list is updated from server if possible, 
      // but we'll manually add it to state first for immediate feedback
      setRooms(prev => {
        const exists = prev.some(r => r.id === room.id);
        if (exists) return prev;
        return [room, ...prev];
      });

      // Auto-select the room
      handleRoomSelect(room);

      toast.success('Chat room created successfully');

      // Secondary background reload to ensure all metadata is synced
      loadChatRooms();
    } catch (error) {
      console.error('Error handling created room:', error);
      toast.error('Failed to initialize chat room');
    }
  };

  const handleRoomSettings = (room?: ChatRoom) => {
    const targetRoom = room || selectedRoom;
    if (targetRoom) {
      setRoomForSettings(targetRoom);
      setShowSettingsModal(true);
    } else {
      toast.info('Select a room to see settings');
    }
  };

  const handleLeaveRoom = async (room: ChatRoom) => {
    try {
      // Find the current user's participant ID
      const currentUserParticipant = room.participants.find(p => p.userId === user?.id);
      if (currentUserParticipant) {
        await chatService.removeParticipant(room.id, currentUserParticipant.id);
        setRooms(prev => prev.filter(r => r.id !== room.id));
        if (selectedRoom?.id === room.id) {
          setSelectedRoom(null);
        }
        toast.success('Left room successfully');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
    }
  };

  const handleMessageReply = () => {
    // TODO: Implement message reply functionality
    toast.info('Message reply coming soon');
  };

  const handleMessageEdit = async (message: ChatMessage) => {
    try {
      // Switch input into edit mode
      setEditingState({
        isEditing: true,
        messageId: message.id,
        originalContent: message.content || ''
      });
    } catch (error) {
      console.error('Error preparing edit:', error);
    }
  };

  const handleMessageDelete = async (message: ChatMessage) => {
    try {
      await chatService.deleteMessage(message.id);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  // Local edit state for ChatInput integration
  const [editingState, setEditingState] = useState<{ isEditing: boolean; messageId: string | null; originalContent: string } | null>(null);

  const handleSaveEditFromInput = async (newContent: string) => {
    if (!editingState?.isEditing || !editingState.messageId) return;
    try {
      const updated = await chatService.editMessage(editingState.messageId, newContent);
      // Optimistically update in local list
      setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, content: updated.content, isEdited: true } : m));
      toast.success('Message updated');
    } catch (error) {
      console.error('Error editing message:', error);
      const anyErr: any = error as any;
      if (anyErr?.status === 403 || anyErr?.statusCode === 403 || anyErr?.message?.includes('3 minute')) {
        toast.error('Message can only be edited within 3 minutes of sending');
      } else {
        toast.error('Failed to edit message');
      }
    } finally {
      setEditingState({ isEditing: false, messageId: null, originalContent: '' });
    }
  };

  const handleCancelEditFromInput = () => {
    setEditingState({ isEditing: false, messageId: null, originalContent: '' });
  };

  const handleMessageReact = async (message: ChatMessage, reaction: string) => {
    try {
      await chatService.addReaction(message.id, reaction);
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const handleDownloadFile = (message: ChatMessage) => {
    if (message.fileUrl) {
      window.open(message.fileUrl, '_blank');
    }
  };

  const handleStartVideoCall = () => {
    if (selectedRoom) {
      chatWebSocketService.startVideoCall(selectedRoom.id);
      toast.info('Starting video call...');
    } else {
      toast.error('Please select a room first');
    }
  };

  const handleStartAudioCall = () => {
    if (selectedRoom) {
      chatWebSocketService.startAudioCall(selectedRoom.id);
      toast.info('Starting audio call...');
    } else {
      toast.error('Please select a room first');
    }
  };

  const handleAcceptCall = () => {
    const roomId = incomingCall.roomId;
    setIncomingCall(prev => ({ ...prev, isOpen: false }));
    toast.success('Joining call...');
    navigate(`/teleconsult/${roomId}`);
  };

  const handleDeclineCall = () => {
    setIncomingCall(prev => ({ ...prev, isOpen: false }));
    toast.info('Call declined');
  };

  const handleTyping = (isTyping: boolean) => {
    if (selectedRoom) {
      chatWebSocketService.sendTypingIndicator(selectedRoom.id, isTyping);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(room => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      room.name?.toLowerCase().includes(query) ||
      room.participants.some(p =>
        p.userName?.toLowerCase().includes(query) ||
        p.userId.toLowerCase().includes(query)
      ) ||
      room.lastMessage?.content?.toLowerCase().includes(query)
    );
  });

  const handleRoomTypeChange = (type: string) => {
    setSelectedRoomType(type);
  };

  const handleViewArchived = () => {
    toast.info('Archived rooms coming soon');
  };

  const handleViewStarred = () => {
    toast.info('Starred messages coming soon');
  };

  const handleReconnectWebSocket = async () => {
    if (user?.id) {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsReconnecting(true);
        setConnectionError(null);

        try {
          await chatWebSocketService.reconnect();
          toast.success('WebSocket reconnected successfully');
        } catch (error) {
          console.error('Failed to reconnect WebSocket:', error);
          toast.error('Failed to reconnect - using HTTP fallback');
        }
      }
    }
  };

  // Mobile-specific handlers
  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
  };

  const handleBackToList = () => {
    setMobileView('list');
    setSelectedRoom(null);
  };

  // Archive functionality will be implemented when backend supports it
  // const handleArchiveRoom = async (room: ChatRoom) => {
  //   try {
  //     await chatService.archiveRoom(room.id);
  //     setRooms(prev => prev.filter(r => r.id !== room.id));
  //     setArchivedRooms(prev => [...prev, { ...room, isActive: false }]);
  //     toast.success('Room archived');
  //   } catch (error) {
  //     console.error('Error archiving room:', error);
  //     toast.error('Failed to archive room');
  //   }
  // };

  // const handleUnarchiveRoom = async (room: ChatRoom) => {
  //   try {
  //     await chatService.unarchiveRoom(room.id);
  //     setArchivedRooms(prev => prev.filter(r => r.id !== room.id));
  //     setRooms(prev => [...prev, { ...room, isActive: true }]);
  //     toast.success('Room unarchived');
  //   } catch (error) {
  //     console.error('Error unarchiving room:', error);
  //     toast.error('Failed to unarchive room');
  //   }
  // };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {isMobile ? (
        mobileView === 'list' ? (
          // Mobile Chat List View
          <div className="flex flex-col min-h-[calc(100vh-130px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
            {/* Mobile Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-blue-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">💬</span>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chats</h1>
                </div>
                <div className="flex items-center space-x-2">
                  {!isConnected && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Offline" />
                  )}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-blue-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm placeholder-gray-500"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {/* Archived Section */}
              {archivedRooms.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl mb-3 shadow-sm">
                  <button
                    onClick={handleToggleArchived}
                    className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-white/40 transition-colors duration-200 rounded-2xl"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mr-3">
                        <ArchiveBoxIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-semibold">Archived Chats</span>
                      <span className="ml-2 text-xs text-white bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 rounded-full font-medium">
                        {archivedRooms.length}
                      </span>
                    </div>
                    {showArchived ? (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {showArchived && (
                    <div className="border-t border-gray-200/50 px-2 py-2">
                      {archivedRooms.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => handleRoomSelect(room)}
                          className="px-3 py-3 flex items-center hover:bg-white/30 cursor-pointer rounded-xl transition-colors duration-200"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mr-3 shadow-sm">
                            <span className="text-gray-600 font-bold text-sm">
                              {room.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {getDMDisplayName(room, user?.id || '', profile?.name)}
                              </p>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {room.lastMessage?.createdAt ?
                                  new Date(room.lastMessage.createdAt).toLocaleDateString() : ''
                                }
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate mt-1">
                              {room.lastMessage?.content || ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active Chat Rooms */}
              <div className="space-y-2">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomSelect(room)}
                    className={`px-3 py-4 flex items-center cursor-pointer rounded-2xl transition-all duration-200 shadow-sm ${selectedRoom?.id === room.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                      : 'bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:shadow-md'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-sm ${selectedRoom?.id === room.id
                      ? 'bg-white/20'
                      : 'bg-gradient-to-br from-blue-400 to-purple-500'
                      }`}>
                      <span className={`font-bold text-sm ${selectedRoom?.id === room.id ? 'text-white' : 'text-white'
                        }`}>
                        {room.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>

                    {/* Unread indicator */}
                    {room.unreadCount && room.unreadCount > 0 && selectedRoom?.id !== room.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-xs text-white font-bold">
                          {room.unreadCount > 9 ? '9+' : room.unreadCount}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold truncate ${selectedRoom?.id === room.id ? 'text-white' : 'text-gray-800'
                          }`}>
                          {getDMDisplayName(room, user?.id || '', profile?.name)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${selectedRoom?.id === room.id
                          ? 'text-white/80 bg-white/20'
                          : 'text-gray-500 bg-gray-100'
                          }`}>
                          {room.lastMessage?.createdAt ?
                            new Date(room.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''
                          }
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-1 ${selectedRoom?.id === room.id ? 'text-white/90' : 'text-gray-600'
                        }`}>
                        {room.lastMessage?.content || ''}
                      </p>
                    </div>
                  </div>
                ))}

                {filteredRooms.length === 0 && !loading && (
                  <div className="px-4 py-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">💬</span>
                    </div>
                    <p className="text-gray-600 font-medium">No chats found</p>
                    <p className="text-sm text-gray-500 mt-1">Start a new conversation</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Bottom Quick Actions */}
            <div className="bg-white/90 backdrop-blur-md border-t border-blue-100 px-4 pt-4 pb-20 sticky bottom-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20">
              <div className="flex items-center justify-around">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-1 shadow-md">
                    <PlusIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium">New Room</span>
                </button>

                <button
                  onClick={handleStartVideoCall}
                  className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-1 shadow-md">
                    <VideoCameraIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium">Video</span>
                </button>

                <button
                  onClick={handleStartAudioCall}
                  className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-1 shadow-md">
                    <PhoneIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium">Audio</span>
                </button>

                <button
                  onClick={() => handleRoomSettings()}
                  className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-1 shadow-md">
                    <Cog6ToothIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium">Settings</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Mobile Chat Conversation View
          <div className="flex flex-col min-h-[calc(100vh-130px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
            {/* Chat Header */}
            <div className="bg-white/90 backdrop-blur-md border-b border-blue-100 px-4 py-4 sticky top-0 z-20 shadow-sm">
              <div className="flex items-center">
                <button
                  onClick={handleBackToList}
                  className="p-2 text-gray-600 hover:text-gray-900 mr-3 bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                    <img
                      src={selectedRoom ? getAvatarUrl(getDMAvatar(selectedRoom, user?.id || ''), getDMDisplayName(selectedRoom, user?.id || '', profile?.name)) : '/default-avatar.png'}
                      alt={selectedRoom ? getDMDisplayName(selectedRoom, user?.id || '', profile?.name) : 'Unknown User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                      {selectedRoom ? getDMDisplayName(selectedRoom, user?.id || '', profile?.name) : 'Unknown User'}
                    </h2>
                    <p className="text-xs text-gray-500 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleStartVideoCall}
                    className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleStartAudioCall}
                    className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-md"
                  >
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRoomSettings()}
                    className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Container - Scrollable */}
            <div ref={mobileMessagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 pb-20">
              {selectedRoom ? (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isCurrentUser = message.senderId === user?.id;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                          {/* Message Bubble */}
                          <div
                            className={`px-4 py-3 rounded-3xl shadow-sm ${isCurrentUser
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-lg'
                              : 'bg-white text-gray-900 rounded-bl-lg border border-gray-200 shadow-sm'
                              }`}
                          >
                            <p className="text-sm break-words leading-relaxed">{message.content}</p>
                            {message.isEdited && (
                              <p className="text-xs opacity-70 mt-1">(edited)</p>
                            )}
                          </div>

                          {/* Time */}
                          <div className={`text-xs text-gray-500 mt-2 px-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {remoteTypingText && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 px-4 py-3 rounded-3xl rounded-bl-lg shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{remoteTypingText}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">💬</span>
                    </div>
                    <p className="text-gray-600 font-medium">No room selected</p>
                    <p className="text-sm text-gray-500 mt-1">Choose a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Message Input at Bottom */}
            {selectedRoom && (
              <div
                className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-[150] pb-20 sm:pb-safe"
                style={{ bottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px' }}
              >
                <div className="flex items-end space-x-3">
                  {/* Attachment button */}
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.onchange = (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || []);
                        files.forEach(file => handleSendFile(file));
                      };
                      input.click();
                    }}
                    className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 rounded-full transition-all duration-200 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>

                  {/* Text input */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={mobileInputRef}
                      onFocus={(e) => {
                        // Ensure input is visible when keyboard opens
                        setTimeout(() => {
                          e.target.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        }, 300);
                      }}
                      placeholder={`Message ${getDMDisplayName(selectedRoom, user?.id || '', profile?.name)}...`}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 shadow-sm placeholder-gray-500"
                      rows={1}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          const content = (e.target as HTMLTextAreaElement).value.trim();
                          if (content) {
                            handleSendMessage(content);
                            (e.target as HTMLTextAreaElement).value = '';
                            (e.target as HTMLTextAreaElement).style.height = 'auto';
                          }
                        }
                      }}
                      onChange={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                        handleTyping(!!target.value.trim());
                      }}
                    />
                  </div>

                  {/* Send button */}
                  <button
                    onClick={() => {
                      const content = mobileInputRef.current?.value.trim();
                      if (content) {
                        handleSendMessage(content);
                        if (mobileInputRef.current) {
                          mobileInputRef.current.value = '';
                          mobileInputRef.current.style.height = 'auto';
                        }
                      }
                    }}
                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        // Desktop layout (existing)
        <div className="space-y-6">
          {/* Header */}
          <ChatHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedRoomType={selectedRoomType}
            onRoomTypeChange={handleRoomTypeChange}
            onCreateRoom={() => setShowCreateModal(true)}
            onStartVideoCall={handleStartVideoCall}
            onStartAudioCall={handleStartAudioCall}
            onReconnectWebSocket={handleReconnectWebSocket}
            totalRooms={rooms.length}
            unreadCount={rooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0)}
            isConnected={isConnected}
            isReconnecting={isReconnecting}
            connectionError={connectionError}
          />

          {/* KPIs - Hidden on mobile */}
          <ChatKPIs kpis={kpis} loading={loading} />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Rooms List - Takes up 3 columns */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Rooms List */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat Rooms</h2>
                  <ChatRoomList
                    rooms={filteredRooms}
                    selectedRoomId={selectedRoom?.id}
                    onRoomSelect={handleRoomSelect}
                    onRoomSettings={handleRoomSettings}
                    onLeaveRoom={handleLeaveRoom}
                    loading={loading}
                    error={error}
                    searchQuery={searchQuery}
                  />
                </div>

                {/* Messages */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedRoom ? getDMDisplayName(selectedRoom, user?.id || '', profile?.name) : 'Select a Room'}
                  </h2>
                  {selectedRoom ? (
                    <div className="border border-gray-200 rounded-lg h-96 flex flex-col">
                      <ChatMessageList
                        messages={messages}
                        currentUserId={user?.id || ''}
                        onReply={handleMessageReply}
                        onEdit={handleMessageEdit}
                        onDelete={handleMessageDelete}
                        onReact={handleMessageReact}
                        onDownloadFile={handleDownloadFile}
                        loading={messagesLoading}
                      />
                      <ChatInput
                        onSendMessage={handleSendMessage}
                        onSendFile={handleSendFile}
                        onStartVideoCall={handleStartVideoCall}
                        onStartAudioCall={handleStartAudioCall}
                        onTyping={handleTyping}
                        disabled={false}
                        placeholder={`Message ${getDMDisplayName(selectedRoom, user?.id || '', profile?.name)}...`}
                        editMode={{
                          isEditing: Boolean(editingState?.isEditing),
                          originalMessageId: editingState?.messageId || null,
                          originalContent: editingState?.originalContent || '',
                          onSaveEdit: handleSaveEditFromInput,
                          onCancelEdit: handleCancelEditFromInput
                        }}
                        remoteTypingText={remoteTypingText}
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg h-96 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-6xl mb-4">💬</div>
                        <div className="text-lg mb-2">Select a chat room to start messaging</div>
                        <div className="text-sm mb-4">Choose from the list on the left or create a new room</div>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Create New Room
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Takes up 1 column */}
            <div className="lg:col-span-1">
              <ChatSidebar
                onCreateRoom={() => setShowCreateModal(true)}
                onStartVideoCall={handleStartVideoCall}
                onStartAudioCall={handleStartAudioCall}
                onViewArchived={handleViewArchived}
                onViewStarred={handleViewStarred}
                recentRooms={rooms.slice(0, 5)}
                onRoomSelect={handleRoomSelect}
                selectedRoomId={selectedRoom?.id}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
        onOpenExistingRoom={handleOpenExistingRoom}
        loading={false}
        centerId={undefined}
      />

      {/* Room Settings Modal */}
      <RoomSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        room={roomForSettings}
        onUpdateRoom={(updated) => {
          setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
          if (selectedRoom?.id === updated.id) setSelectedRoom(updated);
        }}
        onDeleteRoom={(roomId) => {
          setRooms(prev => prev.filter(r => r.id !== roomId));
          if (selectedRoom?.id === roomId) setSelectedRoom(null);
        }}
        onArchiveRoom={(roomId) => {
          setRooms(prev => prev.filter(r => r.id !== roomId));
          loadArchivedRooms(); // Refresh archived list
        }}
      />

      {/* Incoming Call Modal */}
      <IncomingCallModal
        isOpen={incomingCall.isOpen}
        callerName={incomingCall.callerName}
        callerAvatar={incomingCall.callerAvatar}
        callType={incomingCall.callType}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />
    </DashboardLayout>
  );
};

export default ChatPage;
