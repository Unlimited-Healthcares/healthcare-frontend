import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Activity, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  appointments: {
    total: number;
    today: number;
    thisWeek: number;
    byStatus: { [key: string]: number };
    byDay: Array<{ day: string; count: number }>;
  };
  patients: {
    total: number;
    newThisMonth: number;
    activeThisWeek: number;
  };
  records: {
    total: number;
    createdThisMonth: number;
    accessedThisWeek: number;
  };
  performance: {
    avgResponseTime: number;
    systemUptime: number;
    errorRate: number;
  };
}

export function AnalyticsDashboard({ centerId }: { centerId: string }) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch appointment analytics
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('center_id', centerId);

      // Fetch patient analytics
      const { data: patients } = await supabase
        .from('patients')
        .select('*');

      // Fetch medical records analytics
      const { data: records } = await supabase
        .from('medical_records')
        .select('*');

      // Process data
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const appointmentStats = {
        total: appointments?.length || 0,
        today: appointments?.filter((a: { appointment_date: string }) => 
          new Date(a.appointment_date).toDateString() === now.toDateString()
        ).length || 0,
        thisWeek: appointments?.filter((a: { appointment_date: string }) => 
          new Date(a.appointment_date) >= weekAgo
        ).length || 0,
        byStatus: appointments?.reduce((acc: { [key: string]: number }, a: { status: string }) => {
          acc[a.status] = (acc[a.status] ?? 0) + 1;
          return acc;
        }, {} as { [key: string]: number }) || {},
        byDay: []
      };

      const patientStats = {
        total: patients?.length || 0,
        newThisMonth: patients?.filter((p: { created_at: string }) => 
          new Date(p.created_at) >= monthAgo
        ).length || 0,
        activeThisWeek: patients?.filter((p: { last_visit?: string | null }) => 
          new Date(p.last_visit || 0) >= weekAgo
        ).length || 0
      };

      const recordStats = {
        total: records?.length || 0,
        createdThisMonth: records?.filter((r: { created_at: string }) => 
          new Date(r.created_at) >= monthAgo
        ).length || 0,
        accessedThisWeek: 0 // Would need access logs
      };

      setAnalyticsData({
        appointments: appointmentStats,
        patients: patientStats,
        records: recordStats,
        performance: {
          avgResponseTime: 245,
          systemUptime: 99.8,
          errorRate: 0.2
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData, timeRange]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  if (!analyticsData) {
    return <div>Error loading analytics data</div>;
  }

  const statusColors = {
    scheduled: '#3b82f6',
    confirmed: '#10b981',
    completed: '#8b5cf6',
    cancelled: '#ef4444',
    'no-show': '#f59e0b'
  };

  const statusData = Object.entries(analyticsData.appointments.byStatus).map(([status, count]) => ({
    name: status,
    value: count,
    color: statusColors[status as keyof typeof statusColors] || '#6b7280'
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <Badge
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Badge>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.appointments.total}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.appointments.today} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.patients.total}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.patients.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.records.total}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.records.createdThisMonth} created this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.performance.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.performance.avgResponseTime}ms avg response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointments This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.performance.avgResponseTime}ms</div>
                <div className="text-xs text-green-600">↓ 12% from last week</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.performance.errorRate}%</div>
                <div className="text-xs text-green-600">↓ 5% from last week</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.performance.systemUptime}%</div>
                <div className="text-xs text-muted-foreground">Last 30 days</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
