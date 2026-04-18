import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { MedicalReportAnalytics } from '@/types/medical-reports';
import { TrendingUp, Activity, PieChart as PieIcon, ListFilter, AlertCircle } from 'lucide-react';

interface MedicalReportsAnalyticsProps {
  analytics: MedicalReportAnalytics;
  loading?: boolean;
}

export const MedicalReportsAnalytics: React.FC<MedicalReportsAnalyticsProps> = ({
  analytics,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const COLORS = {
    medicalRecords: 'hsl(var(--primary))',
    referrals: 'hsl(var(--secondary))',
    appointments: 'hsl(var(--success))',
    diagnostic: '#14b8a6',
    radiology: '#8b5cf6',
    cardiology: '#10b981',
    general: '#ef4444',
    emergency: '#f97316',
    other: '#6b7280',
    normal: '#22c55e',
    high: '#3b82f6',
    urgent: '#f97316',
    low: '#64748b',
    active: 'hsl(var(--success))',
    archived: '#64748b',
    pending: '#f59e0b',
    draft: '#94a3b8'
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Trends Over Time Chart */}
      <motion.div variants={itemVariants}>
        <Card className="premium-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trends Over Time
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Medical records, referrals, and appointments activity
              </CardDescription>
            </div>
            <div className="hidden sm:flex gap-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Records
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span> Referrals
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full mt-4">
              {analytics.trends?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.trends}>
                    <defs>
                      <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.medicalRecords} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={COLORS.medicalRecords} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.referrals} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={COLORS.referrals} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-medium)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="medicalRecords"
                      stroke={COLORS.medicalRecords}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRecords)"
                      name="Records"
                    />
                    <Area
                      type="monotone"
                      dataKey="referrals"
                      stroke={COLORS.referrals}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorReferrals)"
                      name="Referrals"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl border-muted">
                  <Activity className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">No trend data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Records by Category Chart */}
        <motion.div variants={itemVariants}>
          <Card className="premium-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <PieIcon className="w-5 h-5 text-secondary" />
                Records by Category
              </CardTitle>
              <CardDescription>Distribution across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 mt-2">
                {analytics.categories?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        animationBegin={200}
                        animationDuration={1500}
                      >
                        {analytics.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[entry.category as keyof typeof COLORS] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'background',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: 'var(--shadow-soft)'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl border-muted">
                    <PieIcon className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">No category data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Record Types Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="premium-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <ListFilter className="w-5 h-5 text-primary" />
                Record Types
              </CardTitle>
              <CardDescription>Most frequent record formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {analytics.recordTypes?.length > 0 ? (
                  analytics.recordTypes.map((type, index) => (
                    <div key={index} className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: type.color || COLORS[type.category as keyof typeof COLORS] || '#8884d8' }}
                        />
                        <span className="text-sm font-medium">{type.category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${type.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                            style={{ backgroundColor: type.color || COLORS[type.category as keyof typeof COLORS] }}
                          />
                        </div>
                        <div className="text-right min-w-[3rem]">
                          <div className="text-sm font-bold">{type.count}</div>
                          <div className="text-[10px] text-muted-foreground">{type.percentage}%</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                    <p className="text-sm italic opacity-50">No volume data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution Chart */}
        <motion.div variants={itemVariants}>
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gradient-premium">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Priority Distribution
              </CardTitle>
              <CardDescription>Report urgency levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {analytics.priorityDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.priorityDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="priority" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-medium)' }}
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      />
                      <Bar
                        dataKey="count"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        animationBegin={400}
                        animationDuration={1500}
                      >
                        {analytics.priorityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.priority.toLowerCase() as keyof typeof COLORS] || COLORS.high} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl border-muted text-muted-foreground italic text-sm">
                    No priority data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="premium-card bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Current Status Summary</CardTitle>
              <CardDescription>Overview of record workflow states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {(analytics.statusDistribution || []).map((status, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: status.color || COLORS[status.status.toLowerCase() as keyof typeof COLORS] || '#8884d8' }}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{status.status}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold">{status.count}</div>
                      <div className="text-xs text-primary font-medium">{status.percentage}%</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
