import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  Users,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  XCircle,
  Ban,
  Building2,
  Calendar,
  Activity,
  User,
  Zap,
  Server,
  Download,
  Share2,
  PieChart as ChartIcon,
  Search,
  CreditCard,
  MessageSquare,
  FileText,
  Bell,
  AlertCircle,
  Trash2,
  Settings,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickActions } from "./QuickActions";
import { useQuickActionHandler } from "@/hooks/useQuickActionHandler";
import { useAuth } from "@/hooks/useAuth";
import { IncomingWorkflowProposals } from "./IncomingWorkflowProposals";
import { useEffect, useCallback } from "react";
import { adminService, AdminUser } from "@/services/adminService";
import { toast } from "sonner";
import { ProvisionUserModal } from "../admin/ProvisionUserModal";
import { AdminUserManagement } from "./AdminUserManagement";
import { HospitalPerformanceHub } from "./HospitalPerformanceHub";
import { AdminComplianceAudit } from "./AdminComplianceAudit";

// Dashboard state interfaces
interface DashboardSummary {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalCenters: number;
    pendingVerifications: number;
    growth: number;
  };
  charts: {
    revenueData: any[];
    centerTypeData: any[];
    appointmentData: any[];
  };
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchUsers, setSearchUsers] = useState("");
  const [searchCenters, setSearchCenters] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [centerTypeFilter, setCenterTypeFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Tab sync with URL
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'overview');
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, usersRes, centersRes, healthRes, ledgerRes] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getUsers({ limit: 10 }),
        adminService.getUsers({ role: 'center,hospital,pharmacy,diagnostic', limit: 10 }),
        adminService.getSystemHealth().catch(() => ({ success: false })),
        adminService.getGlobalLedger(5).catch(() => ({ success: false }))
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (centersRes.success) setCenters(centersRes.data);
      if (healthRes.success) setSystemHealth(healthRes.data);
      if (ledgerRes.success) setLedger(ledgerRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Filter users based on search and filters (from local state fetched from API)
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
      user.id.toLowerCase().includes(searchUsers.toLowerCase());

    const matchesRole = roleFilter === "all" || user.roles.some(r => r === roleFilter);
    // Note: status filter might need mapping if roles vs account status
    return matchesSearch && matchesRole;
  });

  const [centers, setCenters] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);

  // Status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Pending</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">Inactive</Badge>;
      case "flagged":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Flagged</Badge>;
      case "investigating":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Investigating</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Role badge component
  const getRoleBadge = (role: string, specialization?: string) => {
    const professionalRoles = ['allied_practitioner', 'doctor', 'nurse', 'biotech_engineer', 'virologist', 'pharmacist', 'diagnostic'];
    const isProfessional = professionalRoles.includes(role.toLowerCase());

    let label = role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');
    if (isProfessional && specialization) {
      label += ` (${specialization})`;
    }

    switch (role.toLowerCase()) {
      case "patient":
        return <Badge key={role} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{label}</Badge>;
      case "doctor":
        return <Badge key={role} variant="outline" className="bg-green-50 text-green-700 border-green-200">{label}</Badge>;
      case "nurse":
        return <Badge key={role} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">{label}</Badge>;
      case "allied_practitioner":
        return <Badge key={role} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">{label}</Badge>;
      case "facility":
        return <Badge key={role} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Facility</Badge>;
      case "admin":
        return <Badge key={role} variant="outline" className="bg-red-50 text-red-700 border-red-200">Admin</Badge>;
      default:
        return <Badge key={role} variant="outline">{label}</Badge>;
    }
  };

  // Report type badge component
  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case "abuse":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Abuse</Badge>;
      case "misinformation":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Misinformation</Badge>;
      case "fraud":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Fraud</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const { handleQuickAction } = useQuickActionHandler();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>

      <QuickActions className="mb-6" onAction={handleQuickAction} user={user} />
      <IncomingWorkflowProposals className="mb-6" />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="mb-4 sm:mb-6 flex flex-wrap gap-2">
           <TabsTrigger value="overview" className="flex-1 sm:flex-none">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex-1 sm:flex-none">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 sm:flex-none">
            <Users className="h-4 w-4 mr-2" />
            Governance
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex-1 sm:flex-none">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="centers" className="flex-1 sm:flex-none">
            <Building2 className="h-4 w-4 mr-2" />
            Healthcare Centers
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 sm:flex-none">
            <Bell className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 sm:flex-none">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{summary?.stats.totalUsers || 0}</div>
                  <div className="p-2 bg-green-50 rounded-full text-green-600">
                    <Users size={20} />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center">
                  <span className="font-medium text-green-500">+{summary?.stats.growth || 0}%</span>
                  <span className="ml-1 text-gray-400">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Healthcare Centers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{summary?.stats.totalCenters || 0}</div>
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                    <Building2 size={20} />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center">
                  <span className="font-medium text-gray-400">0.0%</span>
                  <span className="ml-1 text-gray-400">growth trend</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {summary?.charts.appointmentData.reduce((acc: number, curr: any) => acc + curr.appointments, 0) || 0}
                  </div>
                  <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                    <Calendar size={20} />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center">
                  <span className="font-medium text-purple-500">Live</span>
                  <span className="ml-1 text-gray-400">registry feed</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    ${summary?.charts.revenueData.reduce((acc: number, curr: any) => acc + curr.revenue, 0).toLocaleString() || 0}
                  </div>
                  <div className="p-2 bg-orange-50 rounded-full text-orange-600">
                    <CreditCard size={20} />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center">
                  <span className="font-medium text-orange-500">Settled</span>
                  <span className="ml-1 text-gray-400">via Binance/Paystack</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{summary?.stats.pendingVerifications || 0}</div>
                  <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
                    <AlertCircle size={20} />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center">
                  <span className="font-medium text-yellow-600">Verifications</span>
                  <span className="ml-1 text-gray-400">awaiting review</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">Annual Revenue</CardTitle>
              <CardDescription className="text-sm">
                Financial performance over the past year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={summary?.charts.revenueData || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number | string) => [`$${Number(value)}`, 'Revenue']} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* System Health and Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Health Panel */}
            <Card className="lg:col-span-1 border-none bg-slate-900 text-white shadow-premium rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pb-2 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Server className="h-5 w-5 text-indigo-400" />
                    Infrastructure
                  </CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 font-black uppercase text-[10px]">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em] mb-1">Status</p>
                    <p className="font-bold text-emerald-400">OPTIMAL</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em] mb-1">Uptime</p>
                    <p className="font-bold">99.98%</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Gateway Latency</span>
                    <span className="font-black">24ms</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Registry Sync</span>
                    <span className="font-black">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions / Ledger Section */}
            <Card className="lg:col-span-2 border-none shadow-premium bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-gray-50/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-indigo-600" />
                      Global Registry Ledger
                    </CardTitle>
                    <CardDescription className="font-medium">Recent cryptographic events across the network.</CardDescription>
                  </div>
                  <Button variant="ghost" className="rounded-xl font-bold gap-2 text-indigo-600" onClick={() => navigate('/admin/finance')}>
                    Full Ledger <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableBody>
                      {ledger.length > 0 ? (
                        ledger.map((item, idx) => (
                          <TableRow key={idx} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0 h-16">
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                  <Zap className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-gray-900">{item.description || 'System Update'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono text-[10px] font-bold text-gray-400">{item.transactionId?.substring(0, 12)}...</TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex flex-col items-end">
                                <span className={cn("font-black", item.type === 'DEBIT' ? "text-rose-600" : "text-emerald-600")}>
                                  {item.type === 'DEBIT' ? '-' : '+'}${item.amount || '0.00'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold">{new Date(item.createdAt).toLocaleTimeString()}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-32 text-center text-gray-400 font-medium italic">
                            Syncing ledger data from planetary clusters...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="min-h-[400px]">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg sm:text-xl">Appointments</CardTitle>
                <CardDescription className="text-sm">
                  Monthly appointment statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary?.charts.appointmentData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" name="Completed" fill="#4ade80" />
                      <Bar dataKey="cancelled" name="Cancelled" fill="#f87171" />
                      <Bar dataKey="scheduled" name="Scheduled" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[400px]">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg sm:text-xl">Healthcare Center Types</CardTitle>
                <CardDescription className="text-sm">
                  Distribution of center categories
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                <div className="h-[250px] sm:h-[300px] w-full max-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={summary?.charts.centerTypeData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props) => {
                          const n = (props as any)?.name as string | undefined;
                          const p = (props as any)?.percent as number | undefined;
                          return `${n ?? ''}: ${Math.round((p ?? 0) * 100)}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(summary?.charts.centerTypeData || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number | string) => [`${value}`, 'Count']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
              <CardDescription className="text-sm">
                Latest system activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] sm:h-[400px]">
                <div className="space-y-4">
                  <div className="text-center py-6 text-muted-foreground italic">
                    No recent activity to display.
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
            <HospitalPerformanceHub />
        </TabsContent>

        <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <AdminUserManagement />
        </TabsContent>

        <TabsContent value="compliance">
            <AdminComplianceAudit />
        </TabsContent>

        <TabsContent value="centers" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl">Healthcare Centers</CardTitle>
                  <CardDescription className="text-sm">
                    View and manage healthcare facilities
                  </CardDescription>
                </div>
                <Button className="w-full sm:w-auto">Add New Center</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search centers..."
                      className="pl-8 w-full"
                      value={searchCenters}
                      onChange={(e) => setSearchCenters(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Select value={centerTypeFilter} onValueChange={setCenterTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="hospital">Hospitals</SelectItem>
                        <SelectItem value="pharmacy">Pharmacies</SelectItem>
                        <SelectItem value="diagnostics">Diagnostics</SelectItem>
                        <SelectItem value="ophthalmology">Eye Care</SelectItem>
                        <SelectItem value="dental">Dental</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by verification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="unverified">Unverified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Center</TableHead>
                        <TableHead className="min-w-[100px]">ID</TableHead>
                        <TableHead className="min-w-[100px]">Type</TableHead>
                        <TableHead className="min-w-[150px]">Location</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[80px]">Verified</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {centers.length > 0 ? (
                        centers.map((center) => (
                          <TableRow key={center.id} className="group hover:bg-blue-50/30 transition-colors">
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border shadow-sm">
                                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                    {center.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-gray-900">{center.name}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">Registry ID: {center.id.substring(0, 8)}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{center.id.substring(0, 8)}...</TableCell>
                            <TableCell className="capitalize font-bold text-gray-600">{center.roles?.[0] || 'Entity'}</TableCell>
                            <TableCell className="text-gray-500 font-medium italic">Global Cloud Region</TableCell>
                            <TableCell>{getStatusBadge(center.isActive ? 'active' : 'inactive')}</TableCell>
                            <TableCell className="text-center">
                              {center.kycStatus === 'APPROVED' ? (
                                <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-rose-500 mx-auto" />
                              )}
                            </TableCell>
                            <TableCell className="pr-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl p-2 shadow-2xl">
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-4">Entity Governance</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => navigate(`/admin/users/${center.id}`)} className="rounded-xl font-bold cursor-pointer">
                                    Audit Metrics
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-xl font-bold cursor-pointer">
                                    Update License
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-48 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Building2 className="h-8 w-8 text-gray-200" />
                              <p className="text-gray-400 font-bold tracking-tight">No centers found in live registry.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing {centers.length} centers
              </div>
              <div className="flex gap-2 order-1 sm:order-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl">Reports & Compliance</CardTitle>
                  <CardDescription className="text-sm">
                    Manage user reports and compliance issues
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="abuse">Abuse</SelectItem>
                      <SelectItem value="misinformation">Misinformation</SelectItem>
                      <SelectItem value="fraud">Fraud</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={reportStatusFilter} onValueChange={setReportStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Report ID</TableHead>
                        <TableHead className="min-w-[100px]">Type</TableHead>
                        <TableHead className="min-w-[200px]">Subject</TableHead>
                        <TableHead className="min-w-[150px]">Reported Entity</TableHead>
                        <TableHead className="min-w-[100px]">Date</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.length > 0 ? (
                        reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-mono text-xs">{report.id}</TableCell>
                            <TableCell>{getReportTypeBadge(report.type)}</TableCell>
                            <TableCell>{report.subject}</TableCell>
                            <TableCell>{report.entity}</TableCell>
                            <TableCell>{report.date}</TableCell>
                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Contact Reporter</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Add Comment
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Activity className="h-4 w-4 mr-2" />
                                    Change Status
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Report
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No reports found matching your filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="min-h-[400px]">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg sm:text-xl">User Verification Rate</CardTitle>
                <CardDescription className="text-sm">
                  User identity verification performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: 'Jan', rate: 72 },
                        { month: 'Feb', rate: 75 },
                        { month: 'Mar', rate: 78 },
                        { month: 'Apr', rate: 77 },
                        { month: 'May', rate: 82 },
                        { month: 'Jun', rate: 87 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: number | string) => [`${Number(value)}%`, 'Verification Rate']} />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#8884d8"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[400px]">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg sm:text-xl">Compliance Issues</CardTitle>
                <CardDescription className="text-sm">
                  Monthly compliance issues by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Jan', abuse: 5, fraud: 2, misinformation: 7 },
                        { name: 'Feb', abuse: 7, fraud: 1, misinformation: 5 },
                        { name: 'Mar', abuse: 4, fraud: 3, misinformation: 6 },
                        { name: 'Apr', abuse: 6, fraud: 4, misinformation: 3 },
                        { name: 'May', abuse: 3, fraud: 5, misinformation: 8 },
                        { name: 'Jun', abuse: 2, fraud: 2, misinformation: 4 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="abuse" name="Abuse" fill="#ff8042" />
                      <Bar dataKey="fraud" name="Fraud" fill="#fc5c65" />
                      <Bar dataKey="misinformation" name="Misinformation" fill="#f7b731" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="border-none shadow-premium rounded-3xl bg-white overflow-hidden">
            <div className="p-12 text-center space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto">
                <Settings className="h-10 w-10 text-slate-400" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Platform Configuration</h3>
                <p className="text-slate-500">Access advanced system settings, security protocols, and integration management.</p>
              </div>
              <Button
                onClick={() => navigate('/admin/settings')}
                className="bg-slate-900 hover:bg-black text-white px-8 py-6 rounded-2xl font-bold text-lg group shadow-xl transition-all"
              >
                Open Settings Panel
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        </TabsContent>

      </Tabs>
      <ProvisionUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div >
  );
};
