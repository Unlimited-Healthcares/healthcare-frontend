import { ChatRoom, ChatMessage } from '@/types/chat';

/**
 * Get the display name for a Direct Message room
 * @param room - The chat room
 * @param currentUserId - The current user's ID
 * @returns The display name for the DM
 */
export const getDMDisplayName = (
  room: ChatRoom,
  currentUserId: string,
  _currentUserDisplayName?: string
): string => {
  // For non-direct chats, use room name
  if (room.type !== 'direct') {
    return room.name || 'Group Chat';
  }
  
  // ✅ CRITICAL: For direct messages, NEVER use room.name from database
  // Each user sees the OTHER participant's name (personalized per user)
  // The database stores ONE room name, so both users would see the same name
  
  // Find the other participant who is NOT the current user
  const otherParticipant = room.participants?.find(
    participant => participant.userId !== currentUserId
  );

  // If we found the other participant with full user/profile data
  if (otherParticipant?.user?.profile) {
    const profile = otherParticipant.user.profile;
    
    // Use displayName, or fallback to firstName + lastName
    const result = profile.displayName || 
           `${profile.firstName} ${profile.lastName}`.trim();
    
    if (result) {
      return result;
    }
  }
  
  // If no profile data, try legacy userName field
  if (otherParticipant?.userName) {
    return otherParticipant.userName;
  }
  
  // Last resort: use room.name (but this will be the same for both users)
  if (room.name && room.name !== 'Direct Chat' && room.name !== 'Unknown User') {
    return room.name;
  }
  
  // Ultimate fallback
  return 'Unknown User';
};

/**
 * Get the avatar URL for a Direct Message room
 * @param room - The chat room
 * @param currentUserId - The current user's ID
 * @returns The avatar URL or null
 */
export const getDMAvatar = (room: ChatRoom, currentUserId: string): string | null => {
  if (room.type !== 'direct') {
    return null; // Use group avatar logic
  }
  
  const otherParticipant = room.participants.find(
    participant => participant.userId !== currentUserId
  );
  
  // Use new profile avatar, fallback to legacy userAvatar
  return otherParticipant?.user?.profile?.avatar || otherParticipant?.userAvatar || null;
};

/**
 * Get the display name for a message sender
 * @param message - The chat message
 * @returns The sender's display name
 */
export const getSenderDisplayName = (message: ChatMessage): string => {
  if (!message.sender?.profile) {
    // Fallback to legacy senderName if available
    return message.senderName || 'Unknown User';
  }
  
  return message.sender.profile.displayName || 
         `${message.sender.profile.firstName} ${message.sender.profile.lastName}`.trim();
};

/**
 * Get the avatar URL for a message sender
 * @param message - The chat message
 * @returns The sender's avatar URL or null
 */
export const getSenderAvatar = (message: ChatMessage): string | null => {
  // Use new sender profile avatar, fallback to legacy senderAvatar
  return message.sender?.profile?.avatar || message.senderAvatar || null;
};

/**
 * Get the initials for a user (for avatar fallback)
 * @param displayName - The user's display name
 * @returns The initials (e.g., "John Doe" -> "JD")
 */
export const getUserInitials = (displayName: string): string => {
  return displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get a default avatar URL
 * @param displayName - The user's display name
 * @returns A default avatar URL with initials
 */
export const getDefaultAvatar = (displayName: string): string => {
  const initials = getUserInitials(displayName);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=ffffff&size=40`;
};

/**
 * Get the complete avatar URL (with fallback to default)
 * @param avatarUrl - The user's avatar URL
 * @param displayName - The user's display name
 * @returns The avatar URL or default avatar
 */
export const getAvatarUrl = (avatarUrl: string | null | undefined, displayName: string): string => {
  return avatarUrl || getDefaultAvatar(displayName);
};
