import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase, safeRealtimeSubscription } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name?: string;
  avatar?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  message_type: string;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ChatRoom {
  id: string;
  name?: string;
  type: string;
  is_active: boolean;
  appointment_id?: string;
  participants: Array<{
    user_id: string;
    role: string;
    user?: {
      name: string;
      avatar?: string;
    };
  }>;
}

interface RealTimeChatProps {
  roomId?: string;
  appointmentId?: string;
  centerId: string;
}

export function RealTimeChat({ roomId, appointmentId, centerId }: RealTimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initializeChat = useCallback(async () => {
    try {
      let chatRoomId = roomId;

      // If no roomId provided but appointmentId exists, find or create room
      if (!chatRoomId && appointmentId) {
        const { data: existingRoom } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('appointment_id', appointmentId)
          .single();

        if (existingRoom) {
          chatRoomId = existingRoom.id;
        } else {
          // Create new room for appointment
          const { data: newRoom, error } = await supabase
            .from('chat_rooms')
            .insert({
              type: 'consultation',
              appointment_id: appointmentId,
              center_id: centerId,
              name: `Appointment Chat`,
              created_by: currentUser?.id
            })
            .select()
            .single();

          if (error) throw error;
          chatRoomId = newRoom.id;
        }
      }

      if (chatRoomId) {
        await loadRoom(chatRoomId);
        await loadMessages(chatRoomId);
        setupRealtimeSubscription(chatRoomId);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [roomId, appointmentId, centerId, currentUser?.id]);

  useEffect(() => {
    initializeChat();
    getCurrentUser();
  }, [initializeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadRoom = async (chatRoomId: string) => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        chat_participants (
          user_id,
          role
        )
      `)
      .eq('id', chatRoomId)
      .single();

    if (error) throw error;
    
    // Map the data to match our ChatRoom interface
    const roomData: ChatRoom = {
      ...data,
      name: data.name || undefined,
      is_active: data.is_active ?? true, // Default to true if null
      appointment_id: data.appointment_id || undefined,
      participants: data.chat_participants?.map((p: { user_id: string | null; role: string | null }) => ({
        user_id: p.user_id || '',
        role: p.role || '',
        user: {
          name: 'User', // Simplified for now to avoid relation issues
          avatar: undefined
        }
      })) || []
    };
    
    setRoom(roomData);
  };

  const loadMessages = async (chatRoomId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', chatRoomId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Transform the data to match ChatMessage interface
    const transformedMessages: ChatMessage[] = (data || []).map(msg => ({
      id: msg.id,
      content: msg.content || '',
      sender_id: msg.sender_id || '',
      message_type: msg.message_type || 'text',
      created_at: msg.created_at || new Date().toISOString(),
      sender: {
        id: msg.sender_id || '',
        name: 'User' // Simplified for now to avoid relation issues
      }
    }));
    
    setMessages(transformedMessages);
  };

  const setupRealtimeSubscription = (chatRoomId: string) => {
    // Use safe subscription to prevent WebSocket errors during migration
    return safeRealtimeSubscription('chat_messages', (payload) => {
      // Only process messages for the current chat room
      if (payload.new && payload.new.room_id === chatRoomId) {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      }
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !room || !currentUser) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: room.id,
          sender_id: currentUser.id,
          content: newMessage,
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div>Loading chat...</div>
        </CardContent>
      </Card>
    );
  }

  if (!room) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div>Chat room not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{room.name || 'Chat'}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 p-3">
        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-3">
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUser?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {message.sender?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon" className="h-9 w-9">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
