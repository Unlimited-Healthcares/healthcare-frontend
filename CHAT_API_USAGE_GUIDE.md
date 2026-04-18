# 📞 Chat API Usage Guide

## Overview
This guide shows how to call the chat API endpoints and handle responses, especially for Direct Messages (DMs).

---

## 🔐 Authentication

All chat endpoints require authentication via Bearer token.

```javascript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

---

## 📋 Endpoint: Create or Find Direct Message

### **Endpoint**
```
POST /chat/rooms
```

### **Request**

```javascript
const createDMRoom = async (otherUserId) => {
  try {
    const response = await fetch('https://api.unlimtedhealth.com/api/chat/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'direct',
        participantIds: [otherUserId], // Only pass other user ID
        maxParticipants: 2,
        isEncrypted: true
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating DM room:', error);
    throw error;
  }
};
```

### **API Response**

```json
{
  "room": {
    "id": "5109b1e9-9358-4c41-8235-fa52bbeb25fa",
    "name": "Dr. Jane Smith",  // ← Backend sets this to other participant's name
    "type": "direct",
    "isActive": true,
    "appointmentId": null,
    "centerId": null,
    "createdBy": "559a8433-7e57-4f83-942f-f48168ec38e9",
    "maxParticipants": 2,
    "isEncrypted": true,
    "autoDeleteAfterDays": 1825,
    "roomSettings": {
      "allowFileSharing": true,
      "allowVideoCalls": true,
      "requireApproval": false
    },
    "createdAt": "2025-01-28T06:03:32.024Z",
    "updatedAt": "2025-01-28T06:03:32.024Z",
    "participants": [
      {
        "id": "5253723d-9652-48bc-adaa-0ebd1ae73497",
        "userId": "559a8433-7e57-4f83-942f-f48168ec38e9",
        "role": "participant",
        "joinedAt": "2025-01-28T06:03:32.024Z",
        "leftAt": null,
        "isActive": true,
        "permissions": {
          "can_send_files": true,
          "can_start_video": true,
          "can_send_messages": true
        },
        "participantSettings": {},
        "user": {
          "id": "559a8433-7e57-4f83-942f-f48168ec38e9",
          "email": "cyberkrypt9@gmail.com",
          "profile": {
            "id": "profile-uuid-1",
            "firstName": "John",
            "lastName": "Patient",
            "displayName": "John Patient",
            "avatar": null
          }
        }
      },
      {
        "id": "00920550-c44d-4431-b741-872252022f10",
        "userId": "8975286a-60db-43b3-a449-cb8dcc384383",
        "role": "admin",
        "joinedAt": "2025-01-28T06:03:32.024Z",
        "leftAt": null,
        "isActive": true,
        "permissions": {
          "can_send_files": true,
          "can_start_video": true,
          "can_send_messages": true
        },
        "participantSettings": {},
        "user": {
          "id": "8975286a-60db-43b3-a449-cb8dcc384383",
          "email": "chukwuebuka.nwafor321@gmail.com",
          "profile": {
            "id": "profile-uuid-2",
            "firstName": "Jane",
            "lastName": "Smith",
            "displayName": "Dr. Jane Smith",
            "avatar": "https://..."
          }
        }
      }
    ],
    "messages": []
  },
  "action": "found",  // 'created' or 'found'
  "message": "Existing room found"
}
```

### **Key Points**

1. **Nested Structure**: Response has `room` object containing all data
2. **Room Name**: `room.name` is set by backend to other participant's display name
3. **Action Field**: 
   - `"created"` = new room created
   - `"found"` = existing room returned
4. **Participants**: Always 2 for DMs, each with full user/profile data

---

## 📋 Endpoint: Get User's Chat Rooms

### **Endpoint**
```
GET /chat/rooms?page=1&limit=20
```

### **Request**

```javascript
const getMyChatRooms = async (page = 1, limit = 20) => {
  try {
    const response = await fetch(
      `https://api.unlimtedhealth.com/api/chat/rooms?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    throw error;
  }
};
```

### **API Response**

```json
{
  "data": [
    {
      "id": "5109b1e9-9358-4c41-8235-fa52bbeb25fa",
      "name": "Dr. Jane Smith",  // ← Personal display name
      "type": "direct",
      "isActive": true,
      "participants": [
        // Same participant structure as above
      ],
      "updatedAt": "2025-01-28T06:03:32.024Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

---

## 📋 Endpoint: Get Room Messages

### **Endpoint**
```
GET /chat/rooms/{roomId}/messages?page=1&limit=50
```

### **Request**

```javascript
const getRoomMessages = async (roomId, page = 1, limit = 50) => {
  try {
    const response = await fetch(
      `https://api.unlimtedhealth.com/api/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};
```

### **API Response**

```json
{
  "data": [
    {
      "id": "message-uuid",
      "roomId": "5109b1e9-9358-4c41-8235-fa52bbeb25fa",
      "senderId": "559a8433-7e57-4f83-942f-f48168ec38e9",
      "content": "Hello Dr. Smith!",
      "messageType": "text",
      "isEdited": false,
      "isDeleted": false,
      "deliveryStatus": "sent",
      "createdAt": "2025-01-28T06:05:00.000Z",
      "reactions": [],
      "sender": {
        "id": "559a8433-7e57-4f83-942f-f48168ec38e9",
        "email": "cyberkrypt9@gmail.com",
        "profile": {
          "id": "profile-uuid-1",
          "firstName": "John",
          "lastName": "Patient",
          "displayName": "John Patient",
          "avatar": null
        }
      }
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

---

## 🎯 Complete Frontend Implementation Example

### **1. Create or Find DM**

```typescript
interface ChatRoomResponse {
  room: {
    id: string;
    name: string;  // ← Personalized name (other participant's name)
    type: 'direct' | 'group' | 'consultation' | 'emergency' | 'support';
    participants: Array<{
      userId: string;
      user: {
        id: string;
        email: string;
        profile: {
          displayName: string;
          firstName: string;
          lastName: string;
          avatar: string | null;
        };
      };
    }>;
  };
  action: 'created' | 'found';
  message: string;
}

async function createOrFindDM(otherUserId: string, currentUserId: string) {
  const response = await fetch('https://api.unlimtedhealth.com/api/chat/rooms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'direct',
      participantIds: [otherUserId],
      maxParticipants: 2,
      isEncrypted: true
    })
  });

  const data: ChatRoomResponse = await response.json();
  
  // Extract the room
  const room = data.room;
  
  // Use the personalized room name
  console.log('Room name:', room.name); // "Dr. Jane Smith"
  
  return room;
}
```

### **2. Display in Chat List**

```tsx
const ChatRoomItem = ({ room, currentUserId }: { room: any, currentUserId: string }) => {
  // Use room.name directly - backend sets it correctly
  const displayName = room.name; // e.g., "Dr. Jane Smith"
  
  return (
    <div className="chat-room-item">
      <h3>{displayName}</h3>
      <p className="type">{room.type}</p>
    </div>
  );
};
```

### **3. Display Messages**

```tsx
const MessageItem = ({ message }: { message: any }) => {
  // Use sender profile data
  const senderName = message.sender?.profile?.displayName || 'Unknown';
  const senderAvatar = message.sender?.profile?.avatar || null;
  
  return (
    <div className="message">
      <img src={senderAvatar || '/default-avatar.png'} alt={senderName} />
      <div>
        <div className="sender-name">{senderName}</div>
        <div className="content">{message.content}</div>
      </div>
    </div>
  );
};
```

---

## ✨ Key Implementation Notes

### ✅ DO:

1. **Use `room.name` directly** for DM display names
   ```typescript
   const displayName = room.name; // Already personalized
   ```

2. **Extract room from response**
   ```typescript
   const room = response.room;
   const roomId = response.room.id;
   ```

3. **Use participant data for additional info**
   ```typescript
   room.participants.forEach(p => {
     console.log(p.user.profile.displayName);
     console.log(p.user.profile.avatar);
   });
   ```

### ❌ DON'T:

1. Don't use response.root properties
   ```typescript
   // ❌ WRONG
   const roomId = response.id; // undefined
   
   // ✅ CORRECT
   const roomId = response.room.id;
   ```

2. Don't try to compute DM display names manually
   ```typescript
   // ❌ WRONG - unnecessary
   const displayName = getDMDisplayName(room, currentUserId);
   
   // ✅ CORRECT - use room.name
   const displayName = room.name;
   ```

---

## 🧪 Testing with cURL

### Create/Find DM
```bash
TOKEN=$(curl -s -X POST https://api.unlimtedhealth.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cyberkrypt9@gmail.com","password":"Test123Test123!"}' | jq -r '.access_token')

curl -X POST https://api.unlimtedhealth.com/api/chat/rooms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "direct",
    "participantIds": ["8975286a-60db-43b3-a449-cb8dcc384383"],
    "maxParticipants": 2,
    "isEncrypted": true
  }' | jq '{action: .action, roomName: .room.name, roomId: .room.id, participantsCount: (.room.participants | length)}'
```

### Get Chat Rooms
```bash
curl -X GET "https://api.unlimtedhealth.com/api/chat/rooms?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0] | {name, type, id}'
```

### Get Messages
```bash
curl -X GET "https://api.unlimtedhealth.com/api/chat/rooms/ROOM_ID/messages?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0] | {content, sender: .sender.profile.displayName}'
```

---

## 📊 Summary

- **Backend sets `room.name`** to other participant's display name
- **Use `response.room`** to access room data
- **Participants array** includes full user/profile data
- **Action field** indicates if room was created or found
- **Simple display**: Just use `room.name` in your components!

