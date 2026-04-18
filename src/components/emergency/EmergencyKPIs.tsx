import React from 'react';
import { 
  AlertTriangle, 
  Zap, 
  Truck, 
  Activity, 
  Clock, 
  Shield,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmergencyKPIs as KPIType } from '@/types/emergency';

interface EmergencyKPIsProps {
  kpis: KPIType;
  loading?: boolean;
}

export const EmergencyKPIs: React.FC<EmergencyKPIsProps> = ({ kpis, loading = false }) => {
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
      title: 'Active Alerts',
      value: kpis.activeAlerts,
      change: kpis.activeAlertsChange,
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-l-red-500'
    },
    {
      title: 'Critical Alerts',
      value: kpis.criticalAlerts,
      change: kpis.criticalAlertsChange,
      icon: Zap,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      borderColor: 'border-l-orange-500'
    },
    {
      title: 'Pending Ambulances',
      value: kpis.pendingAmbulances,
      change: kpis.pendingAmbulancesChange,
      icon: Truck,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-l-yellow-500'
    },
    {
      title: 'Dispatched',
      value: kpis.dispatchedAmbulances,
      change: kpis.dispatchedAmbulancesChange,
      icon: Activity,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-blue-500'
    },
    {
      title: 'Avg Response',
      value: `${kpis.averageResponseTime}m`,
      change: kpis.averageResponseTimeChange,
      icon: Clock,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-l-green-500'
    },
    {
      title: 'Viral Reports',
      value: kpis.viralReports,
      change: kpis.viralReportsChange,
      icon: Shield,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-l-purple-500'
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
                  <div className="hidden sm:flex items-center gap-1">
                    {getTrendIcon(card.change)}
                    <span className={`text-xs sm:text-sm font-medium ${getTrendColor(card.change)} truncate`}>
                      {formatPercentage(card.change)} vs last hour
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
