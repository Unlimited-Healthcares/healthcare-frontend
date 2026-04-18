import React, { useState } from 'react';
import { Search, Plus, Video, Phone, MoreVertical, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChatRoomType } from '@/types/chat';
import ConnectionStatus from './ConnectionStatus';

interface ChatHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRoomType: string;
  onRoomTypeChange: (type: string) => void;
  onCreateRoom: () => void;
  onStartVideoCall: () => void;
  onStartAudioCall: () => void;
  onReconnectWebSocket?: () => void;
  totalRooms: number;
  unreadCount: number;
  isConnected?: boolean;
  isReconnecting?: boolean;
  connectionError?: string | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedRoomType,
  onRoomTypeChange,
  onCreateRoom,
  onStartVideoCall,
  onStartAudioCall,
  onReconnectWebSocket,
  totalRooms,
  unreadCount,
  isConnected = false,
  isReconnecting = false,
  connectionError = null
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const roomTypeOptions = [
    { value: 'all', label: 'All Rooms' },
    { value: ChatRoomType.DIRECT, label: 'Direct Messages' },
    { value: ChatRoomType.GROUP, label: 'Group Chats' },
    { value: ChatRoomType.CONSULTATION, label: 'Consultations' },
    { value: ChatRoomType.EMERGENCY, label: 'Emergency' },
    { value: ChatRoomType.SUPPORT, label: 'Support' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
            {totalRooms} rooms
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="bg-red-100 text-red-800 text-xs sm:text-sm">
              {unreadCount} unread
            </Badge>
          )}
          <ConnectionStatus
            isConnected={isConnected}
            isReconnecting={isReconnecting}
            error={connectionError}
            onReconnect={onReconnectWebSocket}
          />
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateRoom}
            className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Room</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onStartVideoCall}>
                <Video className="h-4 w-4 mr-2" />
                Start Video Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onStartAudioCall}>
                <Phone className="h-4 w-4 mr-2" />
                Start Audio Call
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 sm:h-10 text-sm"
          />
        </div>
        
        <Select value={selectedRoomType} onValueChange={onRoomTypeChange}>
          <SelectTrigger className="w-full sm:w-40 md:w-48 h-9 sm:h-10">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {roomTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Room Type
              </label>
              <Select value={selectedRoomType} onValueChange={onRoomTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Sort By
              </label>
              <Select defaultValue="recent">
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="unread">Unread First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
