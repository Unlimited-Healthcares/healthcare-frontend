import React from 'react';
import {
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { ReferralDashboardSummary } from '../../services/referralService';

interface ReferralKPIsProps {
  summary: ReferralDashboardSummary;
  loading?: boolean;
}

const ReferralKPIs: React.FC<ReferralKPIsProps> = ({ summary, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-24"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-14 sm:w-20"></div>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const kpiData = [
    {
      title: 'Total Referrals',
      value: summary.totalReferrals,
      subtitle: 'All time',
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      trend: null
    },
    {
      title: 'Pending Approval',
      value: summary.pendingReferrals,
      subtitle: 'Awaiting review',
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      trend: null
    },
    {
      title: 'Critical Referrals',
      value: summary.urgentReferrals,
      subtitle: 'Require immediate attention',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      trend: null
    },
    {
      title: 'Completion Rate',
      value: summary.totalReferrals > 0
        ? `${((summary.completedReferrals / summary.totalReferrals) * 100).toFixed(1)}%`
        : '0.0%',
      subtitle: `Avg: ${summary.avgResponseTime.toFixed(1)} days`,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      trend: 'up'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
      {kpiData.map((kpi, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1 truncate">{kpi.title}</p>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <p className={`text-lg sm:text-xl md:text-2xl font-bold ${kpi.color}`}>
                  {kpi.value}
                </p>
                {kpi.trend && (
                  <div className={`hidden sm:flex items-center ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.trend === 'up' ? (
                      <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{kpi.subtitle}</p>
            </div>
            <div className={`p-2 sm:p-2.5 md:p-3 rounded-full ${kpi.iconBg} flex-shrink-0`}>
              <kpi.icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${kpi.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReferralKPIs;
