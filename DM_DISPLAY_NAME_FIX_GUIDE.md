# 🔧 DM Display Name Fix - Complete Guide

## 🚨 Issues Identified

### Issue 1: Backend Missing User/Profile Relations
**Problem**: Participants array doesn't include user and profile data  
**Location**: Backend `src/chat/services/chat.service.ts`

### Issue 2: Frontend Room ID Extraction
**Problem**: Frontend getting `undefined` for room ID, causing API errors  
**Location**: Frontend chat service/component

---

## ✅ Backend Fix (ALREADY APPLIED)

### **Changes in: `src/chat/services/chat.service.ts`**

All three locations have been updated to use QueryBuilder for explicit control:

#### **Fix 1: Existing Active Room (Lines 73-80)**
```typescript
const roomWithDetails = await manager.getRepository(ChatRoom)
  .createQueryBuilder('room')
  .where('room.id = :id', { id: existingActive.id })
  .leftJoinAndSelect('room.participants', 'participant')
  .leftJoinAndSelect('participant.user', 'user')
  .leftJoinAndSelect('user.profile', 'profile')
  .leftJoinAndSelect('room.messages', 'messages')
  .getOne();
```

#### **Fix 2: Archived Room Reactivation (Lines 115-122)**
```typescript
const roomWithDetails = await manager.getRepository(ChatRoom)
  .createQueryBuilder('room')
  .where('room.id = :id', { id: existingArchived.id })
  .leftJoinAndSelect('room.participants', 'participant')
  .leftJoinAndSelect('participant.user', 'user')
  .leftJoinAndSelect('user.profile', 'profile')
  .leftJoinAndSelect('room.messages', 'messages')
  .getOne();
```

#### **Fix 3: New Room Creation (Lines 162-169)**
```typescript
const roomWithDetails = await manager.getRepository(ChatRoom)
  .createQueryBuilder('room')
  .where('room.id = :id', { id: savedRoom.id })
  .leftJoinAndSelect('room.participants', 'participant')
  .leftJoinAndSelect('participant.user', 'user')
  .leftJoinAndSelect('user.profile', 'profile')
  .leftJoinAndSelect('room.messages', 'messages')
  .getOne();
```

### **Expected API Response After Backend Fix**

```json
{
  "room": {
    "id": "3b5698b7-9727-4249-bf81-df7bcad94c3f",
    "name": null,
    "type": "direct",
    "participants": [
      {
        "id": "57c25ab2-bce4-4a10-9510-7fdd58fa3169",
        "userId": "559a8433-7e57-4f83-942f-f48168ec38e9",
        "role": "participant",
        "isActive": true,
        "user": {
          "id": "559a8433-7e57-4f83-942f-f48168ec38e9",
          "email": "patient@example.com",
          "profile": {
            "firstName": "John",
            "lastName": "Patient",
            "displayName": "John Patient",
            "avatar": "https://example.com/avatar.jpg"
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
          "email": "doctor@example.com",
          "profile": {
            "firstName": "Dr. Jane",
            "lastName": "Smith",
            "displayName": "Dr. Jane Smith",
            "avatar": "https://example.com/avatar2.jpg"
          }
        }
      }
    ],
    "messages": []
  },
  "action": "created",
  "message": "Room created successfully"
}
```

---

## 🎯 Frontend Fixes Required

### **Fix 1: Correct Room ID Extraction**

**WRONG** ❌:
```typescript
// This gets undefined because 'id' is not at the root level
const roomId = response.id;
const name = response.name;
```

**CORRECT** ✅:
```typescript
// Extract from the nested 'room' object
const room = response.room;
const roomId = response.room.id;
const roomType = response.room.type;
```

### **Fix 2: Extract Display Name for DM**

**Complete Function:**
```typescript
/**
 * Get the other user's display name for a direct message
 * @param room - The chat room object
 * @param currentUserId - ID of the current logged-in user
 * @returns The other user's display name
 */
function getDMDisplayName(room: any, currentUserId: string): string {
  // For non-direct chats, use the room name
  if (room.type !== 'direct') {
    return room.name || 'Group Chat';
  }
  
  // Find the participant who is NOT the current user
  const otherParticipant = room.participants?.find(
    (participant: any) => participant.userId !== currentUserId
  );
  
  // Check if user and profile exist
  if (!otherParticipant?.user?.profile) {
    return 'Unknown User';
  }
  
  const profile = otherParticipant.user.profile;
  
  // Use displayName first, then fallback to firstName + lastName
  return profile.displayName || 
         `${profile.firstName} ${profile.lastName}`.trim() ||
         'Unknown User';
}

/**
 * Get the other user's avatar for a direct message
 * @param room - The chat room object
 * @param currentUserId - ID of the current logged-in user
 * @returns The other user's avatar URL or null
 */
function getDMAvatar(room: any, currentUserId: string): string | null {
  if (room.type !== 'direct') {
    return null;
  }
  
  const otherParticipant = room.participants?.find(
    (participant: any) => participant.userId !== currentUserId
  );
  
  return otherParticipant?.user?.profile?.avatar || null;
}
```

### **Fix 3: Update Chat Room Component**

```typescript
interface ChatRoomItemProps {
  room: any;
  currentUserId: string;
  onSelectRoom: (roomId: string) => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ room, currentUserId, onSelectRoom }) => {
  const displayName = getDMDisplayName(room, currentUserId);
  const avatar = getDMAvatar(room, currentUserId);
  
  return (
    <div 
      onClick={() => onSelectRoom(room.id)} 
      className="chat-room-item p-4 hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <img 
          src={avatar || '/default-avatar.png'} 
          alt={displayName}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{displayName}</h3>
          <p className="text-sm text-gray-500">{room.type}</p>
        </div>
      </div>
    </div>
  );
};
```

### **Fix 4: Update Chat Service to Extract Room Correctly**

```typescript
// Before creating/fetching a room
async createOrFindDirectMessage(otherUserId: string, currentUserId: string) {
  try {
    const response = await this.apiClient.post('/chat/rooms', {
      type: 'direct',
      participantIds: [otherUserId], // Only pass other user
      maxParticipants: 2,
      isEncrypted: true,
    });

    console.log('✅ API Response received:', response);

    // ✅ CORRECT: Extract from response.room
    const room = response.room;
    const roomId = response.room.id;
    const action = response.action; // 'created' or 'found'
    
    console.log('✅ Room ID:', roomId);
    console.log('✅ Action:', action);
    console.log('✅ Participants:', room.participants);

    // ✅ Now you can use the room with full participant data
    return {
      ...room,
      // Add helper methods
      getOtherUser: (currentUserId: string) => {
        return room.participants.find(p => p.userId !== currentUserId);
      }
    };
    
  } catch (error) {
    console.error('❌ Error creating room:', error);
    throw error;
  }
}
```

### **Fix 5: Update Messages Display**

```typescript
interface MessageItemProps {
  message: any;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  // Check if sender data is available
  const senderName = message.sender?.profile?.displayName || 
                     `${message.sender?.profile?.firstName} ${message.sender?.profile?.lastName}`.trim() ||
                     'Unknown User';
  
  const senderAvatar = message.sender?.profile?.avatar || null;
  
  return (
    <div className="message-item flex gap-2 p-2">
      <img 
        src={senderAvatar || '/default-avatar.png'} 
        alt={senderName}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-1">
        <div className="sender-name text-sm font-medium">{senderName}</div>
        <div className="message-content">{message.content}</div>
        <div className="message-time text-xs text-gray-500">
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
```

---

## 🧪 Testing Checklist

After implementing fixes:

- [ ] Backend returns `participants[].user.profile` with displayName, firstName, lastName, avatar
- [ ] Frontend extracts room ID as `response.room.id` (not `response.id`)
- [ ] Display name shows "Jane Smith" on Samuel's side
- [ ] Display name shows "Samuel Johnson" on Jane's side
- [ ] Avatar images display correctly
- [ ] No more "Unknown User" displays
- [ ] No more API errors about "undefined" room ID
- [ ] Messages show correct sender names and avatars

---

## 📝 TypeScript Interfaces

Add these to your frontend types:

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
  user: ChatUser;  // ✅ Now includes full user object
}

interface ChatRoom {
  id: string;
  name: string | null;
  type: 'direct' | 'group' | 'consultation' | 'emergency' | 'support';
  participants: ChatParticipant[];
  messages: ChatMessage[];
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

## 🚨 Common Errors & Solutions

### Error: "Validation failed (uuid is expected)"
**Cause**: Room ID is `undefined`  
**Solution**: Use `response.room.id` instead of `response.id`

### Error: "Unknown User" display
**Cause**: Backend not including user/profile relations  
**Solution**: Backend needs to add `'participants.user', 'participants.user.profile'` to relations

### Error: Avatar not showing
**Cause**: Null check missing  
**Solution**: Use `avatar || '/default-avatar.png'` with fallback

---

## 📞 Summary

1. **Backend**: Add user/profile relations to `getChatRoomWithDetails` calls (2 locations)
2. **Frontend**: Extract room as `response.room`, not `response`
3. **Frontend**: Use `getDMDisplayName()` to find the other user
4. **Frontend**: Always check for `user?.profile` existence before accessing
5. **Frontend**: Provide fallback for null avatars

Once both backend and frontend fixes are applied, the DM display names will work correctly! 🎉
