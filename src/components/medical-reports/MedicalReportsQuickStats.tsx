import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  Calendar,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MedicalReportQuickStats } from '@/types/medical-reports';

interface MedicalReportsQuickStatsProps {
  quickStats: MedicalReportQuickStats;
  loading?: boolean;
}

export const MedicalReportsQuickStats: React.FC<MedicalReportsQuickStatsProps> = ({
  quickStats,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <div className="h-3 sm:h-4 bg-muted rounded w-3/4"></div>
              <div className="h-2 sm:h-3 bg-muted rounded w-1/2 mt-1"></div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="h-6 sm:h-8 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Pending Referrals',
      value: quickStats.pendingReferrals,
      description: 'Require action',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      gradient: 'from-amber-500/10 to-amber-500/0',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Scheduled',
      value: quickStats.scheduledAppointments,
      description: 'Next 7 days',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500/10 to-blue-500/0',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Urgent Records',
      value: quickStats.urgentRecords,
      description: 'High priority',
      icon: AlertCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      gradient: 'from-rose-500/10 to-rose-500/0',
      borderColor: 'border-rose-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className={`premium-card overflow-hidden group cursor-pointer border-t-2 ${stat.borderColor.replace('border-', 'border-t-')}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h3 className={`text-2xl font-black ${stat.color}`}>
                        {(stat.value || 0).toLocaleString()}
                      </h3>
                      {(stat.value || 0) > 0 && (
                        <span className="flex items-center text-[10px] text-green-500 font-bold">
                          <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-2xl ${stat.bgColor} shadow-inner`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-bold">
                        {i}
                      </div>
                    ))}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
