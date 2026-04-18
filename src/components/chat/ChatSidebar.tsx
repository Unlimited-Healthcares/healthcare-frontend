import React from 'react';
import { 
  Plus, 
  Video, 
  Phone, 
  Settings, 
  Archive,
  Star,
  MessageSquare,
  Users,
  AlertTriangle,
  Headphones,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnreadCountBadge } from '@/components/ui/unread-count-badge';
import { ChatRoom, ChatRoomType } from '@/types/chat';
import { getDMDisplayName } from '@/utils/chatDisplayUtils';
import { useAuth } from '@/hooks/useAuth';

interface ChatSidebarProps {
  onCreateRoom: () => void;
  onStartVideoCall: () => void;
  onStartAudioCall: () => void;
  onViewArchived: () => void;
  onViewStarred: () => void;
  recentRooms: ChatRoom[];
  onRoomSelect: (room: ChatRoom) => void;
  selectedRoomId?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onCreateRoom,
  onStartVideoCall,
  onStartAudioCall,
  onViewArchived,
  onViewStarred,
  recentRooms,
  onRoomSelect,
  selectedRoomId
}) => {
  const { user, profile } = useAuth();
  const getRoomIcon = (type: ChatRoomType) => {
    switch (type) {
      case ChatRoomType.DIRECT:
        return <User className="h-4 w-4" />;
      case ChatRoomType.GROUP:
        return <Users className="h-4 w-4" />;
      case ChatRoomType.CONSULTATION:
        return <MessageSquare className="h-4 w-4" />;
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
        return 'text-blue-600';
      case ChatRoomType.GROUP:
        return 'text-green-600';
      case ChatRoomType.CONSULTATION:
        return 'text-purple-600';
      case ChatRoomType.EMERGENCY:
        return 'text-red-600';
      case ChatRoomType.SUPPORT:
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const quickActions = [
    {
      title: 'New Room',
      icon: Plus,
      onClick: onCreateRoom,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Video Call',
      icon: Video,
      onClick: onStartVideoCall,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Audio Call',
      icon: Phone,
      onClick: onStartAudioCall,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Settings',
      icon: Settings,
      onClick: () => console.log('Settings clicked'),
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ];

  const roomCategories = [
    {
      title: 'Recent',
      rooms: recentRooms.slice(0, 5),
      icon: MessageSquare
    },
    {
      title: 'Emergency',
      rooms: recentRooms.filter(room => room.type === ChatRoomType.EMERGENCY),
      icon: AlertTriangle
    },
    {
      title: 'Consultations',
      rooms: recentRooms.filter(room => room.type === ChatRoomType.CONSULTATION),
      icon: MessageSquare
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-10 px-3"
                onClick={action.onClick}
              >
                <div className={`p-1 rounded mr-3 ${action.bgColor}`}>
                  <Icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <span className="text-sm">{action.title}</span>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Room Categories */}
      {roomCategories.map((category, categoryIndex) => {
        if (category.rooms.length === 0) return null;
        
        const Icon = category.icon;
        return (
          <Card key={categoryIndex}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center">
                <Icon className="h-4 w-4 mr-2" />
                {category.title}
                <Badge variant="secondary" className="ml-auto">
                  {category.rooms.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {category.rooms.map((room) => (
                <div
                  key={room.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedRoomId === room.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onRoomSelect(room)}
                >
                  <div className={`${getRoomTypeColor(room.type)}`}>
                    {getRoomIcon(room.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {getDMDisplayName(room, user?.id || '', profile?.name)}
                    </div>
                  </div>
                  <UnreadCountBadge count={room.unreadCount || 0} size="md" />
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Additional Actions */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 px-3"
            onClick={onViewStarred}
          >
            <Star className="h-4 w-4 mr-3 text-yellow-500" />
            <span className="text-sm">Starred Messages</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start h-10 px-3"
            onClick={onViewArchived}
          >
            <Archive className="h-4 w-4 mr-3 text-gray-500" />
            <span className="text-sm">Archived Rooms</span>
          </Button>
        </CardContent>
      </Card>

      {/* Online Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-900">Online Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">You're online</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Last seen: Just now
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSidebar;
