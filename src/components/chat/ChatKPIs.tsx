import React from 'react';
import { 
  MessageSquare, 
  Users, 
  AlertTriangle, 
  Eye, 
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ChatKPIs as ChatKPIsType } from '@/types/chat';

interface ChatKPIsProps {
  kpis: ChatKPIsType;
  loading?: boolean;
}

const ChatKPIs: React.FC<ChatKPIsProps> = ({ kpis, loading = false }) => {
  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">
          {Math.abs(change)}%
        </span>
      </div>
    );
  };

  const kpiCards = [
    {
      title: 'Total Rooms',
      value: kpis.totalRooms,
      change: kpis.totalRoomsChange,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Rooms',
      value: kpis.activeRooms,
      change: kpis.activeRoomsChange,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Messages',
      value: kpis.totalMessages,
      change: kpis.totalMessagesChange,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Unread Messages',
      value: kpis.unreadMessages,
      change: kpis.unreadMessagesChange,
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Online Users',
      value: kpis.onlineUsers,
      change: kpis.onlineUsersChange,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Emergency Rooms',
      value: kpis.emergencyRooms,
      change: kpis.emergencyRoomsChange,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-10 sm:w-12"></div>
                </div>
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    {kpi.title}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {kpi.value.toLocaleString()}
                    </span>
                    <span className="hidden sm:flex">{formatChange(kpi.change)}</span>
                  </div>
                </div>
                <div className={`p-1.5 sm:p-2 rounded-lg ${kpi.bgColor} flex-shrink-0`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ChatKPIs;
