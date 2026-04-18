import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Stethoscope, 
  AlertTriangle, 
  Headphones,
  User,
  MoreVertical,
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UnreadCountBadge } from '@/components/ui/unread-count-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatRoom, ChatRoomType, MessageType } from '@/types/chat';
import { getDMDisplayName } from '@/utils/chatDisplayUtils';
import { useAuth } from '@/hooks/useAuth';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoomId?: string;
  onRoomSelect: (room: ChatRoom) => void;
  onRoomSettings: (room: ChatRoom) => void;
  onLeaveRoom: (room: ChatRoom) => void;
  loading?: boolean;
  error?: string | null;
  searchQuery?: string;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  rooms,
  selectedRoomId,
  onRoomSelect,
  onRoomSettings,
  onLeaveRoom,
  loading = false,
  error = null,
  searchQuery = ''
}) => {
  const { user, profile } = useAuth();
  const getRoomIcon = (type: ChatRoomType) => {
    switch (type) {
      case ChatRoomType.DIRECT:
        return <User className="h-4 w-4" />;
      case ChatRoomType.GROUP:
        return <Users className="h-4 w-4" />;
      case ChatRoomType.CONSULTATION:
        return <Stethoscope className="h-4 w-4" />;
      case ChatRoomType.EMERGENCY:
        return <AlertTriangle className="h-4 w-4" />;
      case ChatRoomType.SUPPORT:
        return <Headphones className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getRoomTypeColor = (type: ChatRoomType) => {
    switch (type) {
      case ChatRoomType.DIRECT:
        return 'bg-blue-100 text-blue-800';
      case ChatRoomType.GROUP:
        return 'bg-green-100 text-green-800';
      case ChatRoomType.CONSULTATION:
        return 'bg-purple-100 text-purple-800';
      case ChatRoomType.EMERGENCY:
        return 'bg-red-100 text-red-800';
      case ChatRoomType.SUPPORT:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Circle className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error loading chat rooms</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {searchQuery.trim() ? (
          <>
            <div className="text-gray-500 mb-2">No rooms found matching "{searchQuery}"</div>
            <div className="text-sm text-gray-400">Try adjusting your search terms</div>
          </>
        ) : (
          <>
            <div className="text-gray-500 mb-2">No chat rooms yet</div>
            <div className="text-sm text-gray-400">Create a new room to start chatting</div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <Card
          key={room.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedRoomId === room.id
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onRoomSelect(room)}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {/* Room Icon */}
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {getRoomIcon(room.type)}
                </div>
              </div>

              {/* Room Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {getDMDisplayName(room, user?.id || '', profile?.name)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <UnreadCountBadge count={room.unreadCount || 0} size="md" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onRoomSettings(room)}>
                          Room Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onLeaveRoom(room)}
                          className="text-red-600"
                        >
                          Leave Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-1">
                  {room.type !== ChatRoomType.DIRECT && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getRoomTypeColor(room.type)}`}
                    >
                      {room.type}
                    </Badge>
                  )}
                </div>

                {/* Last Message */}
                {room.lastMessage && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      {getMessageTypeIcon(room.lastMessage.messageType)}
                      <span className="truncate">
                        {room.lastMessage.content}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getDeliveryStatusIcon(room.lastMessage.deliveryStatus)}
                      <span className="text-xs text-gray-400">
                        {formatLastMessageTime(room.lastMessage.createdAt)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Typing Indicator */}
                {room.participants.some(p => p.isActive) && (
                  <div className="text-xs text-blue-500 mt-1">
                    Someone is typing...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChatRoomList;
