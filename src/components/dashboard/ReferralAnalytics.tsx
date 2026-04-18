import { useState, useEffect } from "react";
import { referralService, AnalyticsData } from "@/services/referralService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";

interface ReferralAnalyticsProps {
  centerId: string;
  className?: string;
}


export const ReferralAnalytics: React.FC<ReferralAnalyticsProps> = ({
  centerId,
  className,
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await referralService.getReferralAnalytics(centerId);

        if (error) {
          throw error;
        }

        if (data) {
          // Transform ReferralAnalytics to AnalyticsData format
          const safeReferralsByStatus = data.referralsByStatus || [];
          const transformedData: AnalyticsData = {
            statusBreakdown: safeReferralsByStatus.map(item => ({
              status: item.status,
              count: item.count,
              percentage: data.totalReferrals ? (item.count / data.totalReferrals) * 100 : 0
            })),
            monthlyTrends: [], // Not available in ReferralAnalytics
            averageCompletionTime: 0, // Not available in ReferralAnalytics
            successRate: 0, // Not available in ReferralAnalytics
            totalReferrals: data.totalReferrals || 0,
            referralsByStatus: safeReferralsByStatus,
            referralsByType: data.referralsByType || [],
            inboundVsOutbound: data.inboundVsOutbound || { inbound: 0, outbound: 0 },
            timeRange: data.timeRange || { start: '', end: '' }
          };
          setAnalyticsData(transformedData);
        }
      } catch (err) {
        console.error("Error fetching referral analytics:", err);
        setError("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [centerId]);

  const prepareStatusData = (statusData: Array<{ status: string; count: number; percentage: number }> = []) => {
    return statusData.map(({ status, count }) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  };

  const prepareMonthlyData = (monthlyData: Array<{ month: string; count: number }> = []) => {
    return monthlyData
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(({ month, count }) => {
        const [year, monthNum] = month.split("-");
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const monthName = date.toLocaleString("default", { month: "short" });
        return {
          month: `${monthName} ${year}`,
          count,
        };
      });
  };



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#FFBB28"; // yellow
      case "accepted":
        return "#0088FE"; // blue
      case "in_progress":
        return "#00C49F"; // green
      case "completed":
        return "#82ca9d"; // light green
      case "rejected":
        return "#FF8042"; // orange
      case "cancelled":
        return "#8884d8"; // purple
      default:
        return "#ccc"; // gray
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-10 text-center">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData || analyticsData.totalReferrals === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Referral Analytics</CardTitle>
          <CardDescription>
            Track and analyze your referral activities
          </CardDescription>
        </CardHeader>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            No referral data available yet. Start creating referrals to see analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusData = prepareStatusData(analyticsData.statusBreakdown);
  const monthlyData = prepareMonthlyData(analyticsData.monthlyTrends);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Referral Analytics</CardTitle>
        <CardDescription>
          Track and analyze your referral activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Total Referrals: {analyticsData.totalReferrals}</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{analyticsData.successRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{analyticsData.averageCompletionTime}</p>
                <p className="text-sm text-muted-foreground">Avg. Days to Complete</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Referrals by Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const n = (props as any)?.name as string | undefined;
                      const p = (props as any)?.percent as number | undefined;
                      return `${n ?? ''} (${Math.round((p ?? 0) * 100)}%)`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getStatusColor(entry.name)}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Monthly Referrals</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0088FE" name="Referrals" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralAnalytics; 