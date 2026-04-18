# 🚀 Frontend Quick Reference - DM Room Name API

## 📞 API Call

```typescript
// Create or find direct message room
POST /api/chat/rooms
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "type": "direct",
  "participantIds": ["OTHER_USER_ID"],
  "maxParticipants": 2,
  "isEncrypted": true
}
```

## 📥 Response Structure

```typescript
{
  "room": {
    "id": "uuid",
    "name": "Dr. Jane Smith",  // ✅ Backend sets this automatically
    "type": "direct",
    "participants": [...],
    "messages": []
  },
  "action": "created",  // or "found"
  "message": "Room created successfully"
}
```

## 💻 Usage

### **Simple Approach (Recommended)**
```typescript
// ✅ Use room.name directly
const displayName = room.name || 'Direct Message';
```

### **With Fallback Helper**
```typescript
import { getDMDisplayName } from '@/utils/chatDisplayUtils';

// ✅ Already updated to prioritize room.name
const displayName = getDMDisplayName(room, currentUserId);
```

## ✅ Key Points

1. ✅ **Backend sets `room.name`** - No computation needed
2. ✅ **Personalized per user** - Each sees other's name
3. ✅ **Extract from `response.room`** - Not `response` directly
4. ✅ **Works automatically** - Just use `room.name`

## 📋 Example Flow

```typescript
// 1. Create/find room
const response = await createOrFindDirectMessage(otherUserId);

// 2. Extract room
const room = response.room;

// 3. Display name (backend already set it!)
<h3>{room.name}</h3>  // ✅ Shows "Dr. Jane Smith"
```

Done! The backend handles everything. 🎉

