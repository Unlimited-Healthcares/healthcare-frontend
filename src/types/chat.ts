// User Profile Types (Enhanced Backend Response)
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string | null;
}

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

// Chat Room Types
export enum ChatRoomType {
  DIRECT = 'direct',
  GROUP = 'group',
  CONSULTATION = 'consultation',
  EMERGENCY = 'emergency',
  SUPPORT = 'support'
}

// Message Types
export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  SYSTEM = 'system',
  VIDEO_CALL_START = 'video_call_start',
  VIDEO_CALL_END = 'video_call_end'
}

// Participant Roles
export enum ParticipantRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  PARTICIPANT = 'participant',
  OBSERVER = 'observer'
}

// Delivery Status
export enum DeliveryStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read'
}

// Chat Room Interface
export interface ChatRoom {
  id: string;                           // UUID - Primary key
  name?: string;                        // Room name (optional for direct chats)
  type: ChatRoomType;                   // Room type
  isActive: boolean;                    // Is room active
  appointmentId?: string;               // UUID - Associated appointment
  centerId?: string;                    // UUID - Associated healthcare center
  createdBy: string;                    // UUID - Creator user ID
  maxParticipants: number;              // Maximum participants allowed
  isEncrypted: boolean;                 // Is room encrypted
  autoDeleteAfterDays: number;          // Auto-delete messages after days
  roomSettings: Record<string, unknown>; // Room configuration
  createdAt: Date;                      // Creation timestamp
  updatedAt: Date;                      // Last update timestamp
  participants: ChatParticipant[];      // Room participants
  messages: ChatMessage[];              // Room messages
  lastMessage?: ChatMessage;            // Last message in room
  unreadCount?: number;                 // Unread message count
}

// Chat Message Interface
export interface ChatMessage {
  id: string;                           // UUID - Primary key
  roomId: string;                       // UUID - Room ID
  senderId: string;                     // UUID - Sender user ID
  senderName?: string;                  // Sender display name (legacy)
  senderAvatar?: string;                // Sender avatar URL (legacy)
  messageType: MessageType;             // Message type
  content?: string;                     // Message content (text)
  fileUrl?: string;                     // File URL (for file messages)
  fileName?: string;                    // File name
  fileSize?: number;                    // File size in bytes
  fileType?: string;                    // File MIME type
  replyToMessageId?: string;            // UUID - Reply to message ID
  isEdited: boolean;                    // Is message edited
  editedAt?: Date;                      // Edit timestamp
  isDeleted: boolean;                   // Is message deleted
  deletedAt?: Date;                     // Delete timestamp
  deliveryStatus: DeliveryStatus;       // Delivery status
  metadata: Record<string, unknown>;    // Message metadata
  createdAt: Date;                      // Creation timestamp
  reactions: ChatMessageReaction[];     // Message reactions
  sender?: User;                        // Enhanced: Complete sender user object with profile
}

// Chat Participant Interface
export interface ChatParticipant {
  id: string;                           // UUID - Primary key
  roomId: string;                       // UUID - Room ID
  userId: string;                       // UUID - User ID
  userName?: string;                    // User display name (legacy)
  userAvatar?: string;                  // User avatar URL (legacy)
  role: ParticipantRole;                // Participant role
  joinedAt: Date;                       // Join timestamp
  leftAt?: Date;                        // Leave timestamp
  isActive: boolean;                    // Is participant active
  permissions: ChatPermissions;         // Participant permissions
  participantSettings: Record<string, unknown>; // Participant settings
  user?: User;                          // Enhanced: Complete user object with profile
}

export interface ChatPermissions {
  can_send_messages: boolean;           // Can send messages
  can_send_files: boolean;              // Can send files
  can_start_video: boolean;             // Can start video calls
  can_moderate?: boolean;               // Can moderate room
  can_invite_users?: boolean;           // Can invite users
}

// Chat Message Reaction Interface
export interface ChatMessageReaction {
  id: string;                           // UUID - Primary key
  messageId: string;                    // UUID - Message ID
  userId: string;                       // UUID - User ID
  reaction: string;                     // Reaction emoji/text
  createdAt: Date;                      // Creation timestamp
}

// API Request/Response Types
export interface CreateChatRoomDto {
  name?: string;                        // Optional: Room name
  type: ChatRoomType;                   // Required: Room type
  appointmentId?: string;               // Optional: Associated appointment ID
  centerId?: string;                    // Optional: Associated center ID
  maxParticipants?: number;             // Optional: Max participants (default: 10)
  isEncrypted?: boolean;                // Optional: Is encrypted (default: true)
  autoDeleteAfterDays?: number;         // Optional: Auto-delete days (default: 90)
  roomSettings?: {
    allowFileSharing?: boolean;
    allowVideoCalls?: boolean;
    requireApproval?: boolean;
  }; // Optional: Room settings
  participantIds: string[];             // Required: Initial participant IDs
}

export interface SendMessageDto {
  content: string;                      // Required: Message content
  messageType?: MessageType;            // Optional: Message type (default: 'text')
  fileUrl?: string;                     // Optional: File URL
  fileName?: string;                    // Optional: File name
  fileSize?: number;                    // Optional: File size in bytes
  fileType?: string;                    // Optional: File MIME type
  replyToMessageId?: string;            // Optional: Reply to message ID
  messageMetadata?: Record<string, unknown>; // Optional: Message metadata
}

export interface RoomFilters {
  page?: number;                        // Page number (default: 1)
  limit?: number;                       // Items per page (default: 20)
  type?: ChatRoomType;                  // Filter by room type
  centerId?: string;                    // Filter by center
  isActive?: boolean;                   // Filter by active status
}

export interface MessageFilters {
  page?: number;                        // Page number (default: 1)
  limit?: number;                       // Items per page (default: 50)
  messageType?: MessageType;            // Filter by message type
  dateFrom?: string;                    // Filter from date
  dateTo?: string;                      // Filter to date
}

export interface ChatRoomListResponse {
  data: ChatRoom[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChatMessageListResponse {
  data: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChatKPIs {
  totalRooms: number;
  activeRooms: number;
  totalMessages: number;
  unreadMessages: number;
  onlineUsers: number;
  emergencyRooms: number;
  totalRoomsChange: number;
  activeRoomsChange: number;
  totalMessagesChange: number;
  unreadMessagesChange: number;
  onlineUsersChange: number;
  emergencyRoomsChange: number;
}

// WebSocket Event Types
export interface WebSocketMessage {
  type: 'message_received' | 'message_updated' | 'message_deleted' |
  'room_created' | 'participant_added' | 'participant_removed' |
  'user_typing' | 'video_call_started' | 'video_call_ended';
  data: any;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface VideoCallEvent {
  roomId: string;
  callerId: string;
  callerName: string;
  callId?: string;
}

// Chat Participant Suggestion Interface
export interface ChatParticipantSuggestion {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  category?: 'patient' | 'doctor' | 'center' | 'staff';
}
