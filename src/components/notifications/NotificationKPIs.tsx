import React from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NotificationKPIs as KPIType } from '@/types/notifications';

interface NotificationKPIsProps {
  kpis: KPIType;
  loading?: boolean;
}

export const NotificationKPIs: React.FC<NotificationKPIsProps> = ({ kpis, loading = false }) => {
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-3 w-3 text-green-500" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-500" />
    );
  };

  const getTrendColor = (value: number) => {
    if (value >= 0) return 'text-green-600';
    if (value < 0 && value > -10) return 'text-blue-600';
    return 'text-red-600';
  };

  const kpiCards = [
    {
      title: 'Total Notifications',
      value: kpis.totalNotifications,
      change: kpis.totalNotificationsChange,
      icon: Bell,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-blue-500',
      subtitle: 'All time'
    },
    {
      title: 'Unread',
      value: kpis.unreadNotifications,
      change: kpis.unreadNotificationsChange,
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-l-red-500',
      subtitle: 'Require attention'
    },
    {
      title: 'Critical',
      value: kpis.criticalNotifications,
      change: kpis.criticalNotificationsChange,
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-l-red-500',
      subtitle: 'Urgent alerts'
    },
    {
      title: 'Today',
      value: kpis.todayNotifications,
      change: kpis.todayNotificationsChange,
      icon: Clock,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-l-green-500',
      subtitle: `This week: ${Math.floor(kpis.todayNotifications * 1.4)}`
    },
    {
      title: 'Delivery Rate',
      value: `${kpis.deliveryRate}%`,
      change: kpis.deliveryRateChange,
      icon: BarChart3,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-l-purple-500',
      subtitle: `Avg: ${kpis.averageResponseTime}s`
    },
    {
      title: 'Response Time',
      value: `${kpis.averageResponseTime}s`,
      change: kpis.averageResponseTimeChange,
      icon: CheckCircle,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      borderColor: 'border-l-teal-500',
      subtitle: 'Average response'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse border-l-4">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 sm:space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-10 sm:w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 sm:w-24 hidden sm:block"></div>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`border-l-4 ${card.borderColor} hover:shadow-lg transition-all duration-200 bg-white`}>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    {card.title}
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 truncate hidden sm:block">
                    {card.subtitle}
                  </p>
                  <div className="hidden sm:flex items-center gap-1">
                    {getTrendIcon(card.change)}
                    <span className={`text-xs sm:text-sm font-medium ${getTrendColor(card.change)} truncate`}>
                      {formatPercentage(card.change)} vs last month
                    </span>
                  </div>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${card.iconBg} flex-shrink-0`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
