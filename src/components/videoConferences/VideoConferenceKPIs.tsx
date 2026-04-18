import React from 'react';
import {
  Video,
  Users,
  Calendar,
  UserCheck,
  BarChart3,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { VideoConferenceKPIs as KPIType } from '@/types/videoConferences';

interface VideoConferenceKPIsProps {
  kpis: KPIType;
  loading?: boolean;
}

export const VideoConferenceKPIs: React.FC<VideoConferenceKPIsProps> = ({ kpis, loading = false }) => {
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
      title: 'Total Conferences',
      value: kpis.totalConferences,
      change: kpis.totalConferencesChange,
      icon: Video,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-blue-500'
    },
    {
      title: 'Active Now',
      value: kpis.activeConferences,
      change: kpis.activeConferencesChange,
      icon: UserCheck,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-l-green-500'
    },
    {
      title: 'Scheduled',
      value: kpis.scheduledConferences,
      change: kpis.scheduledConferencesChange,
      icon: Calendar,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-l-purple-500'
    },
    {
      title: 'Participants',
      value: kpis.totalParticipants,
      change: kpis.totalParticipantsChange,
      icon: Users,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      borderColor: 'border-l-orange-500'
    },
    {
      title: 'Avg Duration',
      value: `${kpis.averageDuration} min`,
      change: kpis.averageDurationChange,
      icon: Clock,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      borderColor: 'border-l-teal-500'
    },
    {
      title: 'Recording Rate',
      value: `${kpis.recordingRate.toFixed(1)}%`,
      change: kpis.recordingRateChange,
      icon: BarChart3,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      borderColor: 'border-l-indigo-500'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="rounded-[2rem] sm:rounded-[2.5rem] border-0 animate-pulse bg-gray-50/50 overflow-hidden">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-2xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-16 sm:w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="rounded-[2rem] sm:rounded-[2.5rem] border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden relative">
            {/* Visual Accent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${card.iconColor.replace('text-', 'bg-')} opacity-40`} />

            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className={`p-2.5 sm:p-3 rounded-2xl ${card.iconBg} transition-colors duration-300 group-hover:scale-110`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${card.iconColor}`} />
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                      {card.title}
                    </p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(card.change)}
                      <span className={`text-[10px] sm:text-xs font-bold ${getTrendColor(card.change)}`}>
                        {formatPercentage(card.change)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1">
                    v.s last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
