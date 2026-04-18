# WebSocket CORS Fix - Backend Configuration Required

## 🔴 Problem Summary

The frontend at `http://217.21.78.192:3001` cannot connect to the Socket.IO WebSocket server at `https://api.unlimtedhealth.com` due to missing CORS headers.

**Error:** `CORS header 'Access-Control-Allow-Origin' missing`

---

## ✅ Solution: Backend CORS Configuration

The Socket.IO server needs to explicitly allow the frontend origin. Choose the configuration based on your backend framework:

---

### Option 1: Node.js + Express + Socket.IO

Update your Socket.IO server initialization:

```javascript
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://217.21.78.192:3001",        // Frontend staging/dev
      "http://localhost:3001",             // Local development
      "https://unlimtedhealth.com",       // Production frontend
      "https://www.unlimtedhealth.com"    // Production frontend (www)
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  },
  transports: ['websocket', 'polling'],  // Allow both transports
  allowEIO3: true,
  path: "/socket.io/"                    // Ensure path matches frontend
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);
  
  // Authentication handler
  socket.on("authenticate", async (data) => {
    const { userId, token } = data;
    
    // Your authentication logic here
    try {
      // Verify token...
      socket.emit("authenticated", { success: true, userId });
    } catch (error) {
      socket.emit("error", { message: "Authentication failed" });
      socket.disconnect();
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 User disconnected:", socket.id, reason);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server listening on port 3000");
});
```

---

### Option 2: NestJS + Socket.IO

Update your `main.ts` and WebSocket Gateway:

**main.ts:**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for HTTP endpoints
  app.enableCors({
    origin: [
      'http://217.21.78.192:3001',
      'http://localhost:3001',
      'https://unlimtedhealth.com',
      'https://www.unlimtedhealth.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3000);
  console.log('🚀 Application is running on: http://localhost:3000');
}
bootstrap();
```

**Your WebSocket Gateway (e.g., chat.gateway.ts):**

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: [
      'http://217.21.78.192:3001',
      'http://localhost:3001',
      'https://unlimtedhealth.com',
      'https://www.unlimtedhealth.com',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log('✅ Client connected:', client.id);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('🔌 Client disconnected:', client.id);
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; token: string }
  ) {
    try {
      // Your authentication logic here
      // Verify token...
      
      client.emit('authenticated', { success: true, userId: data.userId });
    } catch (error) {
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  // Other message handlers...
}
```

---

### Option 3: Nginx Reverse Proxy Configuration

If you're using Nginx in front of your Socket.IO server, you also need to configure CORS headers in Nginx:

**nginx.conf or site configuration:**

```nginx
server {
    listen 443 ssl;
    server_name api.unlimtedhealth.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.unlimtedhealth.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.unlimtedhealth.com/privkey.pem;

    # Regular API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO WebSocket routes - CRITICAL CONFIGURATION
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        
        # WebSocket upgrade headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for Socket.IO
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Origin, Content-Type, Accept, Authorization' always;
        add_header Access-Control-Allow-Credentials 'true' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin $http_origin;
            add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
            add_header Access-Control-Allow-Headers 'Origin, Content-Type, Accept, Authorization';
            add_header Access-Control-Allow-Credentials 'true';
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
        
        # Timeout settings for long-polling
        proxy_read_timeout 86400;
        proxy_connect_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

After updating Nginx, restart it:

```bash
sudo nginx -t                    # Test configuration
sudo systemctl restart nginx     # Restart Nginx
```

---

## 🧪 Testing After Fix

Once backend is configured, test the connection:

1. **Open browser console** at `http://217.21.78.192:3001`
2. **Navigate to the chat page**
3. **Check console logs** - you should see:
   ```
   🔌 Connecting to WebSocket: https://api.unlimtedhealth.com/chat
   ✅ Connected to chat server
   🔐 WebSocket authenticated: {...}
   ```

4. **No more CORS errors** - the `xhr poll error` messages should be gone

---

## 🔍 Verification Commands

Check if Socket.IO endpoint is accessible:

```bash
# Test basic connectivity
curl -v https://api.unlimtedhealth.com/socket.io/

# Should return Socket.IO handshake response like:
# {"sid":"...","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000}
```

Check Nginx logs for CORS issues:

```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## 📋 Checklist for Backend Developer

- [ ] Add CORS configuration to Socket.IO server
- [ ] Include all frontend origins (dev + production)
- [ ] Set `credentials: true` in CORS config
- [ ] Configure Nginx proxy if applicable
- [ ] Test Socket.IO endpoint accessibility
- [ ] Verify WebSocket handshake works
- [ ] Check authentication flow
- [ ] Monitor server logs for connection attempts

---

## 🚨 Common Pitfalls

1. **Forgetting wildcard doesn't work with credentials:**
   ```javascript
   // ❌ WRONG - wildcard with credentials
   cors: {
     origin: "*",
     credentials: true  // This won't work together
   }
   
   // ✅ CORRECT - specific origins
   cors: {
     origin: ["http://217.21.78.192:3001", ...],
     credentials: true
   }
   ```

2. **Path mismatch:**
   - Frontend uses: `path: '/socket.io/'`
   - Backend must match: `path: '/socket.io/'`

3. **Protocol mismatch:**
   - Frontend: `http://217.21.78.192:3001`
   - Backend: `https://api.unlimtedhealth.com`
   - This is OK if CORS is properly configured

4. **Nginx not passing WebSocket upgrade:**
   - Must include `proxy_set_header Upgrade $http_upgrade;`
   - Must include `proxy_set_header Connection "Upgrade";`

---

## 📞 Support

If issues persist after implementing these fixes:

1. Check backend server logs
2. Check Nginx error logs
3. Verify firewall rules allow WebSocket connections
4. Test with browser DevTools Network tab (WS filter)
5. Confirm Socket.IO versions match (client and server)

---

**Priority:** 🔴 HIGH - This blocks all real-time chat features

**Estimated Fix Time:** 10-15 minutes

**Testing Required:** Yes - Full chat functionality test after deployment

---

**Related Documentation:**
- See `WEBSOCKET_REALTIME_FIX.md` for frontend fixes (already completed ✅)

