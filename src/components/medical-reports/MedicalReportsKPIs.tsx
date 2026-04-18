import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  TrendingUp,
  Users,
  Calendar,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';
import { MedicalReportKPIs } from '@/types/medical-reports';

interface MedicalReportsKPIsProps {
  kpis: MedicalReportKPIs;
  loading?: boolean;
}

export const MedicalReportsKPIs: React.FC<MedicalReportsKPIsProps> = ({ kpis, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <div className="h-3 sm:h-4 bg-muted rounded w-3/4"></div>
              <div className="h-2 sm:h-3 bg-muted rounded w-1/2 mt-1"></div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="h-6 sm:h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-2 sm:h-3 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const Icon = icon;

    return (
      <div className={`flex items-center gap-1 text-xs sm:text-sm ${color}`}>
        <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
        <span>{Math.abs(change).toFixed(1)}%</span>
        <span className="text-muted-foreground hidden sm:inline">vs last period</span>
      </div>
    );
  };

  const kpiCards = [
    {
      title: 'Total Records',
      value: (kpis.totalReports || 0).toLocaleString(),
      change: kpis.totalReportsChange || 0,
      description: 'Medical records in system',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'New Records',
      value: (kpis.newReports || 0).toLocaleString(),
      change: kpis.newReportsChange || 0,
      description: 'Records added this period',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Referrals',
      value: (kpis.totalReferrals || 0).toLocaleString(),
      change: kpis.totalReferralsChange || 0,
      description: 'Patient referrals',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Appointments',
      value: (kpis.appointments || 0).toLocaleString(),
      change: kpis.appointmentsChange || 0,
      description: 'Total appointments',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="p-3 sm:p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">
                  {kpi.title}
                </CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-lg ${kpi.bgColor} flex-shrink-0`}>
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${kpi.color}`} />
                </div>
              </div>
              <CardDescription className="text-[10px] sm:text-xs truncate">
                {kpi.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
                {kpi.value}
              </div>
              {formatChange(kpi.change)}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
