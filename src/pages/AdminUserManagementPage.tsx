import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Filter,
    UserPlus,
    MoreVertical,
    User,
    Mail,
    Shield,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Ban,
    Trash2,
    CheckCircle,
    XCircle,
    UserCircle,
    Activity,
    Stethoscope,
    Users,
    Building2,
    Database
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adminService, AdminUser } from '@/services/adminService';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { ProvisionUserModal } from '@/components/admin/ProvisionUserModal';

const AdminUserManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'all';

    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = {
                search,
                page: pagination.page,
                limit: 10
            };

            if (currentTab === 'providers') filters.role = 'doctor,nurse,practitioner,biotech_engineer';
            if (currentTab === 'patients') filters.role = 'patient';
            if (currentTab === 'centers') filters.role = 'center,hospital,pharmacy,diagnostic';

            const response = await adminService.getUsers(filters);
            setUsers(response.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.pagination?.total || 0,
                totalPages: response.pagination?.totalPages || 1
            }));
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load user directory');
        } finally {
            setLoading(false);
        }
    }, [search, currentTab, pagination.page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const getStatusBadge = (user: AdminUser) => {
        if (user.isBanned) return <Badge variant="destructive" className="rounded-full">Banned</Badge>;
        if (user.isSuspended) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none rounded-full">Suspended</Badge>;
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none rounded-full">Active</Badge>;
    };

    const getKycBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'PENDING': return <Activity className="h-5 w-5 text-amber-500 animate-pulse" />;
            case 'REJECTED': return <XCircle className="h-5 w-5 text-rose-500" />;
            default: return <UserCircle className="h-5 w-5 text-gray-300" />;
        }
    };

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSuspendUser = async (user: AdminUser) => {
        if (!user.isActive) return;

        toast.promise(
            adminService.suspendUser(user.id, 'Administrative suspension', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
            {
                loading: `Suspending access for ${user.name}...`,
                success: () => {
                    fetchUsers();
                    return `Account ${user.name} has been suspended for 7 days.`;
                },
                error: 'Failed to suspend account. Verify admin permissions.'
            }
        );
    };

    const handleActivateUser = async (user: AdminUser) => {
        toast.promise(
            adminService.activateUser(user.id),
            {
                loading: `Restoring access for ${user.name}...`,
                success: () => {
                    fetchUsers();
                    return `Account ${user.name} access has been fully restored.`;
                },
                error: 'Failed to restore account. Verify admin permissions.'
            }
        );
    };

    const handleDeleteUser = async (user: AdminUser) => {
        if (!window.confirm(`Are you absolutely sure you want to PERMANENTLY DELETE ${user.name}? This action is irreversible and will purge all registry data.`)) {
            return;
        }

        toast.promise(
            adminService.deleteUser(user.id),
            {
                loading: `Purging registry data for ${user.name}...`,
                success: () => {
                    fetchUsers();
                    return `Account ${user.name} has been permanently removed from the platform.`;
                },
                error: 'Failed to delete account. Serious governance failure.'
            }
        );
    };

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-2xl border-gray-200 shadow-sm"
                            onClick={() => navigate('/admin')}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="h-4 w-4 text-indigo-600" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Global Governance</span>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">User Directory</h1>
                            <p className="text-gray-500 font-medium italic mt-1 font-serif">Platform-wide oversight of patients and service providers.</p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsAddUserModalOpen(true)}
                        className="rounded-2xl bg-gray-900 hover:bg-black text-white shadow-xl h-14 px-8 font-black uppercase tracking-wider transition-all hover:scale-105"
                    >
                        <UserPlus className="h-5 w-5 mr-3" />
                        Provision Portal Account
                    </Button>
                </div>

                {/* Management Tabs */}
                <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <TabsList className="bg-gray-100/50 p-1.5 rounded-2xl h-14 border border-gray-200/50">
                            <TabsTrigger value="all" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md">
                                <Database className="h-4 w-4" /> All Accounts
                            </TabsTrigger>
                            <TabsTrigger value="providers" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                                <Stethoscope className="h-4 w-4" /> Service Providers
                            </TabsTrigger>
                            <TabsTrigger value="patients" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                                <Users className="h-4 w-4" /> Patients
                            </TabsTrigger>
                            <TabsTrigger value="centers" className="rounded-xl px-6 font-bold gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                                <Building2 className="h-4 w-4" /> Platform Entities
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative group w-full lg:w-96">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <Input
                                placeholder="Search medical registry..."
                                className="pl-14 h-14 rounded-2xl border-gray-100 shadow-sm bg-white font-bold focus:ring-4 focus:ring-indigo-100 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card className="border-none shadow-premium bg-white rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="border-b border-gray-50 bg-gray-50/30 p-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black text-gray-900">
                                        {currentTab === 'providers' ? 'Verified Service Providers' :
                                            currentTab === 'patients' ? 'Global Patient Registry' :
                                                currentTab === 'centers' ? 'Hospital & Center Entities' : 'Core Registry Database'}
                                    </CardTitle>
                                    <CardDescription className="font-medium text-gray-500">
                                        Total registered population: <span className="text-gray-900 font-black">{pagination.total} entries found.</span>
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" className="rounded-xl font-bold gap-2 text-gray-500">
                                    <Filter className="h-4 w-4" /> Advanced Sort
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 hover:bg-transparent border-none">
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400 py-6 pl-8">Account Identity</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Class & Role</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400 text-center">Status</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400">Commission Date</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400 text-center">Security (KYC)</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-400 w-[100px] pr-8"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-96 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                                                        <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Querying Global Registry</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : users.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-96 text-center">
                                                    <p className="text-gray-400 font-bold">No accounts match the current filter criteria.</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((user) => (
                                                <TableRow key={user.id} className="group hover:bg-indigo-50/30 transition-all border-b border-gray-50 last:border-0 h-24">
                                                    <TableCell className="pl-8">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-1 ring-gray-100">
                                                                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-black text-lg">
                                                                    {user.name.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{user.name}</span>
                                                                <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                                                                    <Mail className="h-3.5 w-3.5" />
                                                                    {user.email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1.5">
                                                            {user.roles.map(role => {
                                                                const professionalRoles = ['allied_practitioner', 'doctor', 'nurse', 'biotech_engineer', 'virologist', 'pharmacist', 'diagnostic'];
                                                                const isProfessional = professionalRoles.includes(role);
                                                                return (
                                                                    <span key={role} className="text-[10px] font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                                                        <div className={cn(
                                                                            "w-1.5 h-1.5 rounded-full shadow-sm",
                                                                            role === 'patient' ? "bg-emerald-500" : "bg-indigo-500"
                                                                        )} />
                                                                        {role.replace('_', ' ')}
                                                                        {isProfessional && user.specialization ? ` (${user.specialization})` : ''}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {getStatusBadge(user)}
                                                    </TableCell>
                                                    <TableCell className="text-sm font-bold text-gray-500">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-300" />
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center group-hover:scale-110 transition-transform">
                                                            {getKycBadge(user.kycStatus)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="pr-8">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-md transition-all">
                                                                    <MoreVertical className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 shadow-2xl border-gray-100 border-2">
                                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-3">Security Governance</DropdownMenuLabel>
                                                                <DropdownMenuItem className="rounded-xl cursor-pointer py-3 font-bold gap-3" onClick={() => navigate(`/admin/users/${user.id}`)}>
                                                                    <Shield className="h-4 w-4 text-gray-400" />
                                                                    Audit Full History
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-xl cursor-pointer py-3 font-bold gap-3">
                                                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                                    Verify License
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="my-2 bg-gray-50" />
                                                                {!user.isSuspended && user.isActive ? (
                                                                    <DropdownMenuItem
                                                                        className="rounded-xl cursor-pointer py-3 text-rose-600 font-black gap-3 bg-rose-50/50"
                                                                        onClick={() => handleSuspendUser(user)}
                                                                    >
                                                                        <Ban className="h-4 w-4" />
                                                                        SUSPEND ACCESS
                                                                    </DropdownMenuItem>
                                                                ) : (!user.isActive || user.isSuspended) && (
                                                                    <DropdownMenuItem
                                                                        className="rounded-xl cursor-pointer py-3 text-emerald-600 font-black gap-3 bg-emerald-50/50"
                                                                        onClick={() => handleActivateUser(user)}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" />
                                                                        RESTORE ACCESS
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator className="my-2 bg-gray-50" />
                                                                <DropdownMenuItem
                                                                    className="rounded-xl cursor-pointer py-3 text-rose-600 font-black gap-3 hover:bg-rose-600 hover:text-white transition-all"
                                                                    onClick={() => handleDeleteUser(user)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    TERMINATE ACCOUNT
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 border-t border-gray-50 flex items-center justify-between bg-gray-50/10">
                            <p className="text-sm font-bold text-gray-400 tracking-tight">
                                Showing items <span className="text-gray-900">{(pagination.page - 1) * 10 + 1} - {Math.min(pagination.page * 10, pagination.total)}</span> of <span className="text-gray-900">{pagination.total}</span>
                            </p>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl h-10 w-10 border-gray-200 hover:bg-white hover:text-indigo-600 shadow-sm disabled:opacity-30"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <div className="bg-indigo-600 text-white font-black h-10 px-4 rounded-xl flex items-center justify-center text-xs shadow-lg shadow-indigo-100">
                                    Page {pagination.page}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl h-10 w-10 border-gray-200 hover:bg-white hover:text-indigo-600 shadow-sm disabled:opacity-30"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </Tabs>
            </div>
            <ProvisionUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSuccess={fetchUsers}
            />
        </DashboardLayout>
    );
};

export default AdminUserManagementPage;
