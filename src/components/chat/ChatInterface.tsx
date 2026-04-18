
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  messageType: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system';
  createdAt: string;
  isEdited?: boolean;
  reactions?: Array<{ userId: string; reaction: string }>;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'consultation' | 'emergency' | 'support';
  participants: Array<{
    id: string;
    userId: string;
    role: string;
    userName: string;
  }>;
  lastMessage?: Message;
}

interface ChatInterfaceProps {
  currentUserId: string;
  selectedRoom?: ChatRoom;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
  isLoading?: boolean;
}

export function ChatInterface({
  currentUserId,
  selectedRoom,
  messages,
  onSendMessage,
  onStartVideoCall,
  onStartVoiceCall,
  isLoading = false,
}: ChatInterfaceProps) {
  const [messageText, setMessageText] = useState('');
  const [isTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim() && selectedRoom) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  if (!selectedRoom) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500">
            Choose a chat room from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback>
              {selectedRoom.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{selectedRoom.name}</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onStartVoiceCall && (
            <Button variant="ghost" size="sm" onClick={onStartVoiceCall}>
              <Phone className="h-4 w-4" />
            </Button>
          )}
          {onStartVideoCall && (
            <Button variant="ghost" size="sm" onClick={onStartVideoCall}>
              <Video className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View participants</DropdownMenuItem>
              <DropdownMenuItem>Room settings</DropdownMenuItem>
              <DropdownMenuItem>Search messages</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {message.senderName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isCurrentUser && (
                      <span className="text-xs text-gray-500 font-medium">
                        {message.senderName}
                      </span>
                    )}

                    <Card className={`${isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                      }`}>
                      <CardContent className="p-3">
                        <p className="text-sm">{message.content}</p>
                        {message.isEdited && (
                          <span className="text-xs opacity-70">(edited)</span>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatTime(message.createdAt)}
                      </span>
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex space-x-1">
                          {message.reactions.map((reaction, index) => (
                            <span key={index} className="text-xs">
                              {reaction.reaction}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-2 max-w-[70%]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>...</AvatarFallback>
                </Avatar>
                <Card className="bg-gray-100">
                  <CardContent className="p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 pb-24 sm:pb-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isLoading}
            />
          </div>

          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
