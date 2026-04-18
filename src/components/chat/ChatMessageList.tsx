import React, { useEffect, useRef } from 'react';
import { 
  MoreVertical, 
  Reply, 
  Edit, 
  Trash2, 
  Heart,
  Download,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatMessage, MessageType, DeliveryStatus } from '@/types/chat';
import { getSenderDisplayName, getSenderAvatar, getAvatarUrl } from '@/utils/chatDisplayUtils';

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (message: ChatMessage) => void;
  onReact: (message: ChatMessage, reaction: string) => void;
  onDownloadFile: (message: ChatMessage) => void;
  loading?: boolean;
  error?: string | null;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onDownloadFile,
  loading = false,
  error = null
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use a small timeout to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatMessageTime = (date: Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMinutes = (now.getTime() - messageDate.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getDeliveryStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.SENT:
        return <div className="h-2 w-2 bg-gray-400 rounded-full"></div>;
      case DeliveryStatus.DELIVERED:
        return <div className="h-2 w-2 bg-blue-500 rounded-full"></div>;
      case DeliveryStatus.READ:
        return <div className="h-2 w-2 bg-green-500 rounded-full"></div>;
      default:
        return <div className="h-2 w-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const isMessageEditable = (message: ChatMessage) => {
    const created = new Date(message.createdAt).getTime();
    const ageMs = Date.now() - created;
    return ageMs <= 3 * 60 * 1000; // 3 minutes
  };

  const getMessageTypeIcon = (messageType: MessageType) => {
    switch (messageType) {
      case MessageType.FILE:
        return '📎';
      case MessageType.IMAGE:
        return '🖼️';
      case MessageType.VIDEO:
        return '🎥';
      case MessageType.AUDIO:
        return '🎵';
      case MessageType.VIDEO_CALL_START:
        return '📹';
      case MessageType.VIDEO_CALL_END:
        return '📹';
      default:
        return '';
    }
  };

  const renderMessageContent = (message: ChatMessage) => {
    switch (message.messageType) {
      case MessageType.FILE:
        return (
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <div className="text-2xl">{getMessageTypeIcon(message.messageType)}</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{message.fileName}</div>
              <div className="text-xs text-gray-500">
                {(message.fileSize || 0 / 1024).toFixed(1)} KB
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownloadFile(message)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      
      case MessageType.IMAGE:
        return (
          <div className="space-y-2">
            <img
              src={message.fileUrl}
              alt={message.fileName}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            {message.content && (
              <div className="text-sm">{message.content}</div>
            )}
          </div>
        );
      
      case MessageType.VIDEO:
        return (
          <div className="space-y-2">
            <div className="relative max-w-xs">
              <video
                src={message.fileUrl}
                controls
                className="w-full rounded-lg"
                poster={message.fileUrl}
              />
            </div>
            {message.content && (
              <div className="text-sm">{message.content}</div>
            )}
          </div>
        );
      
      case MessageType.AUDIO:
        return (
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <Button variant="ghost" size="sm">
              <Play className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="text-sm font-medium">{message.fileName}</div>
              <div className="text-xs text-gray-500">
                {(message.fileSize || 0 / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        );
      
      case MessageType.VIDEO_CALL_START:
        return (
          <div className="flex items-center space-x-2 p-3 bg-blue-100 rounded-lg">
            <div className="text-2xl">📹</div>
            <div className="text-sm font-medium text-blue-800">
              Video call started
            </div>
          </div>
        );
      
      case MessageType.VIDEO_CALL_END:
        return (
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <div className="text-2xl">📹</div>
            <div className="text-sm font-medium text-gray-600">
              Video call ended
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-sm whitespace-pre-wrap">
            {message.content}
          </div>
        );
    }
  };

  const handleEditClick = (message: ChatMessage) => {
    onEdit(message);
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex space-x-3 animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error loading messages</div>
          <div className="text-sm text-gray-500">{error}</div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return <div className="flex-1"></div>;
  }

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.senderId === currentUserId;

        return (
          <div
            key={message.id}
            className={`flex space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            {/* Avatar: show only for other user's messages */}
            {!isCurrentUser && (
              <div className="flex-shrink-0">
                <img
                  src={getAvatarUrl(getSenderAvatar(message), getSenderDisplayName(message))}
                  alt={getSenderDisplayName(message)}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </div>
            )}

            {/* Message Content */}
            <div className={`flex-1 max-w-xs lg:max-w-md ${isCurrentUser ? 'text-right' : ''}`}>
              {/* Time and status (no usernames) */}
              <div className={`flex items-center mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                <span className="text-xs text-gray-500">
                  {formatMessageTime(message.createdAt)}
                </span>
                {isCurrentUser && (
                  <div className="flex items-center space-x-1 ml-2">
                    {getDeliveryStatusIcon(message.deliveryStatus)}
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`inline-block p-3 rounded-lg ${
                  isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                } ${isMessageEditable(message) ? 'ring-1 ring-green-300' : 'ring-1 ring-gray-200'}`}
                title={isMessageEditable(message) ? 'Editable for 3 minutes' : 'Editing disabled after 3 minutes'}
              >
                <div>
                  {renderMessageContent(message)}
                  {message.isEdited && (
                    <div className="text-xs opacity-70 mt-1">(edited)</div>
                  )}
                </div>
              </div>

              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className={`flex flex-wrap gap-1 mt-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                  {message.reactions.map((reaction) => (
                    <Badge
                      key={reaction.id}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-gray-200"
                      onClick={() => onReact(message, reaction.reaction)}
                    >
                      {reaction.reaction}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Message Actions */}
              <div className={`flex items-center space-x-1 mt-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isCurrentUser ? 'end' : 'start'}>
                      <DropdownMenuItem onClick={() => onReply(message)}>
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </DropdownMenuItem>
                    {isCurrentUser && isMessageEditable(message) && (
                        <>
                          <DropdownMenuItem onClick={() => handleEditClick(message)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(message)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => onReact(message, '❤️')}>
                        <Heart className="h-4 w-4 mr-2" />
                        React
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
