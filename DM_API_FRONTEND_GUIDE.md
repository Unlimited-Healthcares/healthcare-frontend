# 📡 DM Chat API - Frontend Integration Guide

## 🎯 Overview

The backend now automatically sets `room.name` to the other participant's display name at request time. Each user sees their own personalized room name.

---

## 📞 API Endpoint

### **Create or Find Direct Message Room**

```http
POST /api/chat/rooms
```

**Authentication**: Required (Bearer token in header)

---

## 📥 Request

### **Headers**
```typescript
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### **Request Body**
```typescript
{
  type: 'direct',
  participantIds: ['OTHER_USER_ID'],  // Only pass the other user's ID
  maxParticipants: 2,
  isEncrypted: true
}
```

### **TypeScript Interface**
```typescript
interface CreateRoomRequest {
  type: 'direct' | 'group' | 'consultation' | 'emergency' | 'support';
  participantIds: string[];  // Array of other participant user IDs
  maxParticipants?: number;  // Optional, defaults to 2 for direct
  isEncrypted?: boolean;     // Optional, defaults to true
}
```

---

## 📤 Response

### **Success Response (200 OK)**

```json
{
  "room": {
    "id": "3b5698b7-9727-4249-bf81-df7bcad94c3f",
    "name": "Dr. Jane Smith",  // ✅ Other participant's name (set by backend)
    "type": "direct",
    "participants": [
      {
        "id": "57c25ab2-bce4-4a10-9510-7fdd58fa3169",
        "userId": "559a8433-7e57-4f83-942f-f48168ec38e9",
        "role": "participant",
        "isActive": true,
        "user": {
          "id": "559a8433-7e57-4f83-942f-f48168ec38e9",
          "email": "john.patient@example.com",
          "profile": {
            "firstName": "John",
            "lastName": "Patient",
            "displayName": "John Patient",
            "avatar": "https://example.com/john-avatar.jpg"
          }
        }
      },
      {
        "id": "00920550-c44d-4431-b741-872252022f10",
        "userId": "8975286a-60db-43b3-a449-cb8dcc384383",
        "role": "admin",
        "isActive": true,
        "user": {
          "id": "8975286a-60db-43b3-a449-cb8dcc384383",
          "email": "jane.doctor@example.com",
          "profile": {
            "firstName": "Dr. Jane",
            "lastName": "Smith",
            "displayName": "Dr. Jane Smith",  // ✅ This is what room.name contains
            "avatar": "https://example.com/jane-avatar.jpg"
          }
        }
      }
    ],
    "messages": [],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "action": "created",  // or "found"
  "message": "Room created successfully"
}
```

### **Error Response (400/401/403)**

```json
{
  "error": "Error message",
  "statusCode": 400,
  "message": "Validation failed (uuid is expected)"
}
```

---

## 💻 Frontend Implementation

### **TypeScript Interfaces**

```typescript
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string | null;
}

interface ChatUser {
  id: string;
  email: string;
  profile: UserProfile;
}

interface ChatParticipant {
  id: string;
  userId: string;
  role: 'admin' | 'moderator' | 'participant' | 'observer';
  isActive: boolean;
  user: ChatUser;
}

interface ChatRoom {
  id: string;
  name: string | null;  // ✅ Already contains other user's name for direct messages
  type: 'direct' | 'group' | 'consultation' | 'emergency' | 'support';
  participants: ChatParticipant[];
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

interface ChatRoomResponse {
  room: ChatRoom;
  action: 'created' | 'found';
  message: string;
}
```

---

## 🔧 Code Example

### **Service Function**

```typescript
// services/chatService.ts

interface CreateRoomParams {
  otherUserId: string;
  currentUserId: string;
}

async createOrFindDirectMessage({ 
  otherUserId, 
  currentUserId 
}: CreateRoomParams): Promise<ChatRoom> {
  try {
    // Make API call
    const response = await fetch('/api/chat/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        type: 'direct',
        participantIds: [otherUserId],  // Only pass other user
        maxParticipants: 2,
        isEncrypted: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatRoomResponse = await response.json();

    // ✅ CRITICAL: Extract from response.room
    const room = data.room;
    const roomId = data.room.id;
    const roomName = data.room.name;  // ✅ Already contains other user's name
    const action = data.action;  // 'created' or 'found'

    console.log('✅ Room created/found:', {
      roomId,
      roomName,  // ← Use this directly!
      action,
      participants: room.participants.length
    });

    return room;
    
  } catch (error) {
    console.error('❌ Error creating/finding room:', error);
    throw error;
  }
}
```

---

## 🎨 Frontend Usage

### **Option 1: Use `room.name` directly (Simplest)**

```typescript
// ✅ EASIEST: Backend already sets room.name
const ChatRoomItem: React.FC<{ room: ChatRoom }> = ({ room }) => {
  return (
    <div onClick={() => handleSelectRoom(room.id)}>
      <h3>{room.name || 'Direct Message'}</h3>  {/* ✅ Use directly */}
    </div>
  );
};
```

### **Option 2: Fallback function for edge cases**

```typescript
// utils/chatDisplayUtils.ts

import { ChatRoom } from '@/types/chat';

/**
 * Get display name for a chat room
 * @param room - The chat room object
 * @param currentUserId - ID of the current logged-in user
 * @returns Display name for the room
 */
export function getRoomDisplayName(
  room: ChatRoom, 
  currentUserId: string
): string {
  // For direct messages, backend sets room.name to other user's name
  if (room.type === 'direct' && room.name) {
    return room.name;  // ✅ Use the backend-set name
  }
  
  // For non-direct chats, use room name or fallback
  if (room.name) {
    return room.name;
  }
  
  // Fallback: find other user's name from participants
  if (room.type === 'direct') {
    const otherParticipant = room.participants?.find(
      (participant) => participant.userId !== currentUserId
    );
    
    if (otherParticipant?.user?.profile) {
      const profile = otherParticipant.user.profile;
      return profile.displayName || 
             `${profile.firstName} ${profile.lastName}`.trim() ||
             'Unknown User';
    }
  }
  
  return 'Group Chat';
}

/**
 * Get avatar URL for a chat room
 * @param room - The chat room object
 * @param currentUserId - ID of the current logged-in user
 * @returns Avatar URL or null
 */
export function getRoomAvatar(
  room: ChatRoom, 
  currentUserId: string
): string | null {
  if (room.type !== 'direct') {
    return null;  // Groups don't have single avatars
  }
  
  // Find the other user's avatar
  const otherParticipant = room.participants?.find(
    (participant) => participant.userId !== currentUserId
  );
  
  return otherParticipant?.user?.profile?.avatar || null;
}
```

### **Usage in Component**

```typescript
// components/ChatRoomList.tsx

import { getRoomDisplayName, getRoomAvatar } from '@/utils/chatDisplayUtils';

const ChatRoomItem: React.FC<{ room: ChatRoom; currentUserId: string }> = ({ 
  room, 
  currentUserId 
}) => {
  const displayName = getRoomDisplayName(room, currentUserId);
  const avatar = getRoomAvatar(room, currentUserId);
  
  return (
    <div className="chat-room-item p-4 hover:bg-gray-100">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img 
            src={avatar} 
            alt={displayName}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-500" />
          </div>
        )}
        <div>
          <h3 className="font-medium">{displayName}</h3>
          <p className="text-sm text-gray-500">{room.type}</p>
        </div>
      </div>
    </div>
  );
};
```

---

## 🧪 Testing Example

### **Test Scenario: John (Patient) creates DM with Jane (Doctor)**

#### **Request** (from John's perspective)
```typescript
POST /api/chat/rooms
{
  "type": "direct",
  "participantIds": ["8975286a-60db-43b3-a449-cb8dcc384383"],  // Jane's ID
  "maxParticipants": 2,
  "isEncrypted": true
}
```

#### **Response** (John sees)
```json
{
  "room": {
    "id": "abc123",
    "name": "Dr. Jane Smith",  // ✅ John sees Jane's name
    "type": "direct",
    ...
  }
}
```

#### **Same Room** (Jane sees when she fetches it)
```json
{
  "room": {
    "id": "abc123",
    "name": "John Patient",  // ✅ Jane sees John's name
    "type": "direct",
    ...
  }
}
```

Each user gets their own personalized `room.name`! 🎉

---

## 🔑 Key Points

1. ✅ **Backend sets `room.name`** - No frontend computation needed
2. ✅ **Personalized per user** - Each user sees other participant's name
3. ✅ **Extract from `response.room`** - Not `response.id`
4. ✅ **Use `room.name` directly** - Simplest approach
5. ✅ **Fallback included** - For edge cases in `chatDisplayUtils.ts`

---

## 📋 Quick Reference

### **Make API Call**
```typescript
POST /api/chat/rooms
Body: { type: 'direct', participantIds: [otherUserId], ... }
```

### **Extract Response**
```typescript
const room = response.room;  // ✅ Not response
const name = response.room.name;  // ✅ Use this!
```

### **Display in UI**
```typescript
<h3>{room.name || 'Direct Message'}</h3>  // ✅ Simple!
```

---

## ✅ Verification Checklist

- [ ] API call includes `participantIds` array with other user's ID
- [ ] Response contains `room.name` with other user's display name
- [ ] Frontend extracts from `response.room` (not `response`)
- [ ] Display shows correct name: John sees "Dr. Jane Smith", Jane sees "John Patient"
- [ ] Avatar displays correctly
- [ ] Works with both new rooms and existing rooms

---

Ready to use! 🚀

