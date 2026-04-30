import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    FileText,
    Clock,
    Search,
    Plus,
    ArrowUpRight,
    TrendingUp,
    ShieldAlert,
    Calendar,
    Activity,
    Phone
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import { ServiceManagement } from './ServiceManagement';
import { FacilityManagement } from './FacilityManagement';
import { mortuaryService, MortuaryRecord, MortuaryStatus } from '@/services/mortuaryService';

import { EnterpriseHeader } from './EnterpriseHeader';
import { useCenterProfile } from '@/hooks/useCenterProfile';
import { QuickActions } from './QuickActions';
import { useQuickActionHandler } from '@/hooks/useQuickActionHandler';
import { IncomingWorkflowProposals } from './IncomingWorkflowProposals';
import { RemainsManagementModal } from './RemainsManagementModal';
import { useAuth } from '@/hooks/useAuth';
import { MortuaryIntakeManager } from './MortuaryIntakeManager';
import { DigitalDeathCertificate } from './DigitalDeathCertificate';


interface MortuaryDashboardProps {
    centerId: string;
    centerType?: string;
    centerName?: string;
}

export function MortuaryDashboard({ centerId, centerName = "Mortuary Department" }: MortuaryDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const { profile, loading: loadingProfile } = useCenterProfile(centerId);
    const { user } = useAuth();
    const { handleQuickAction } = useQuickActionHandler();
    const isAttendant = user?.roles?.includes('mortuary') && !user?.roles?.includes('center');
    const [selectedRemain, setSelectedRemain] = useState<any>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [records, setRecords] = useState<MortuaryRecord[]>([]);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Intake Form State
    const [intakeFormData, setIntakeFormData] = useState({
        deceasedName: '',
        intakeDate: new Date().toISOString().split('T')[0],
        unit: '',
        status: MortuaryStatus.STORED,
        representativeName: '',
        representativePhone: '',
        notes: ''
    });
    const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);

    useEffect(() => {
        if (centerId) {
            fetchRecords();
        }
    }, [centerId]);

    const fetchRecords = async () => {
        setIsLoadingRecords(true);
        try {
            const data = await mortuaryService.getRecords(centerId);
            setRecords(data);
        } catch (error) {
            console.error('Failed to fetch mortuary records:', error);
        } finally {
            setIsLoadingRecords(false);
        }
    };

    const handleManage = (remain: any) => {
        setSelectedRemain(remain);
        setIsManageModalOpen(true);
    };

    const handleIntakeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!intakeFormData.deceasedName) return toast.error('Please enter deceased name');

        setIsSubmittingIntake(true);
        try {
            await mortuaryService.createRecord({
                ...intakeFormData,
                centerId
            });
            toast.success('New intake record created successfully');
            setIntakeFormData({
                deceasedName: '',
                intakeDate: new Date().toISOString().split('T')[0],
                unit: '',
                status: MortuaryStatus.STORED,
                representativeName: '',
                representativePhone: '',
                notes: ''
            });
            fetchRecords();
            setActiveTab('overview');
        } catch (error) {
            console.error('Failed to create intake:', error);
            toast.error('Failed to save intake manifest');
        } finally {
            setIsSubmittingIntake(false);
        }
    };

    const getStatusStyles = (status: MortuaryStatus) => {
        switch (status) {
            case MortuaryStatus.RELEASED:
                return 'bg-slate-100 text-slate-600';
            case MortuaryStatus.STORED:
                return 'bg-emerald-100 text-emerald-700';
            case MortuaryStatus.PENDING_RELEASE:
                return 'bg-amber-100 text-amber-700';
            case MortuaryStatus.PENDING_AUTOPSY:
                return 'bg-blue-100 text-blue-700';
            case MortuaryStatus.LEGAL_HOLD:
                return 'bg-rose-100 text-rose-700 border border-rose-200';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const stats = {
        totalRemains: records.filter(r => r.status !== MortuaryStatus.RELEASED).length,
        monthlyIntake: records.filter(r => {
            const intakeDate = new Date(r.intakeDate);
            const now = new Date();
            return intakeDate.getMonth() === now.getMonth() && intakeDate.getFullYear() === now.getFullYear();
        }).length,
        pendingRelease: records.filter(r => r.status === MortuaryStatus.PENDING_RELEASE).length,
        pendingAutopsy: records.filter(r => r.status === MortuaryStatus.PENDING_AUTOPSY).length,
        capacity: profile?.locationMetadata?.mortuaryCapacity || 60,
        releasedThisMonth: records.filter(r => r.status === MortuaryStatus.RELEASED).length
    };

    const dynamicIntakeData = Array.from({ length: 4 }, (_, i) => {
        const weekNum = i + 1;
        const count = records.filter(r => {
            const date = new Date(r.intakeDate);
            const day = date.getDate();
            return day > i * 7 && day <= weekNum * 7;
        }).length;
        return { name: `Week ${weekNum}`, count };
    });

    const dynamicStatusData = [
        { name: 'Occupied', value: stats.totalRemains, color: '#4f46e5' },
        { name: 'Available', value: Math.max(0, stats.capacity - stats.totalRemains), color: '#e2e8f0' },
    ];

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.deceasedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 pb-32 px-4 md:px-0 md:pb-12">
            <EnterpriseHeader profile={profile} isLoading={loadingProfile} />

            <div className="-mt-6 space-y-4">
                <QuickActions user={user} onAction={handleQuickAction} />
                {!isAttendant && <IncomingWorkflowProposals />}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm rounded-2xl bg-indigo-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-600">Current Occupancy</CardTitle>
                        <PieChart width={16} height={16}>
                            <Pie data={dynamicStatusData} dataKey="value" innerRadius={4} outerRadius={8} fill="#8884d8" />
                        </PieChart>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRemains}/{stats.capacity}</div>
                        <p className="text-xs text-indigo-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {Math.round((stats.totalRemains / stats.capacity) * 100)}% Capacity utilized
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-amber-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600">Pending Release</CardTitle>
                        <Clock className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingRelease}</div>
                        <p className="text-xs text-amber-600 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Awaiting authorization
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-rose-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-rose-600">Pending Autopsy</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingAutopsy}</div>
                        <p className="text-xs text-rose-600 flex items-center mt-1">
                            <Activity className="h-3 w-3 mr-1" />
                            Active coroner cases
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-teal-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-teal-600">Monthly Intake</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.monthlyIntake}</div>
                        <p className="text-xs text-teal-600 flex items-center mt-1">
                            <Plus className="h-3 w-3 mr-1" />
                            In {format(new Date(), 'MMMM')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl flex flex-wrap h-auto gap-1">
                    <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="inventory" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Current Inventory</TabsTrigger>
                    <TabsTrigger value="intake" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Log Intake</TabsTrigger>
                    {!isAttendant && (
                        <>
                            <TabsTrigger value="records" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Documentation</TabsTrigger>
                            <TabsTrigger value="services" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Services</TabsTrigger>
                            <TabsTrigger value="management" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Management</TabsTrigger>
                        </>
                    )}
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Intake Statistics</CardTitle>
                                <CardDescription>Numbers of entries processed per week</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dynamicIntakeData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="count" fill="#1e293b" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Storage Allocation</CardTitle>
                                <CardDescription>Current capacity distribution</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center pt-8">
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dynamicStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {dynamicStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                        <span className="text-sm text-gray-600">Occupied ({stats.totalRemains})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                                        <span className="text-sm text-gray-600">Available ({Math.max(0, stats.capacity - stats.totalRemains)})</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                    <Card className="border-none shadow-premium rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Registry of Remains</CardTitle>
                                <CardDescription>Current secure storage manifest</CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or ID..."
                                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-[240px]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value={MortuaryStatus.STORED}>Stored</option>
                                    <option value={MortuaryStatus.PENDING_RELEASE}>Pending Release</option>
                                    <option value={MortuaryStatus.PENDING_AUTOPSY}>Pending Autopsy</option>
                                    <option value={MortuaryStatus.LEGAL_HOLD}>Legal Hold</option>
                                    <option value={MortuaryStatus.RELEASED}>Released</option>
                                </select>
                                <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Entry ID</th>
                                            <th className="px-6 py-4 font-bold">Subject Name</th>
                                            <th className="px-6 py-4 font-bold">Intake Date</th>
                                            <th className="px-6 py-4 font-bold">Unit / Bin</th>
                                            <th className="px-6 py-4 font-bold">Status</th>
                                            <th className="px-6 py-4 font-bold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredRecords.length > 0 ? filteredRecords.map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{row.id.substring(0, 8).toUpperCase()}</td>
                                                <td className="px-6 py-4 font-bold text-slate-900">{row.deceasedName}</td>
                                                <td className="px-6 py-4 text-slate-500">{format(new Date(row.intakeDate), 'MMM dd, yyyy')}</td>
                                                <td className="px-6 py-4 font-medium text-slate-700">{row.unit}</td>
                                                <td className="px-6 py-4">
                                                    <Badge className={cn(getStatusStyles(row.status), "border-none font-bold flex items-center gap-1 w-fit")}>
                                                        {row.status}
                                                        {row.signedManifestUrl && <FileText className="h-3 w-3" />}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                        onClick={() => handleManage(row)}
                                                    >
                                                        Manage
                                                    </Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                                    No remains currently registered in this facility.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="intake" className="space-y-4">
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-900 text-white rounded-t-2xl">
                            <CardTitle className="text-2xl font-bold">Manual Intake Manifest</CardTitle>
                            <CardDescription className="text-slate-400">Record a new entry into the mortuary system</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 md:p-8">
                            <form onSubmit={handleIntakeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deceased Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                            placeholder="Full legal name"
                                            value={intakeFormData.deceasedName}
                                            onChange={(e) => setIntakeFormData({ ...intakeFormData, deceasedName: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Intake Date</label>
                                            <input
                                                type="date"
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                value={intakeFormData.intakeDate}
                                                onChange={(e) => setIntakeFormData({ ...intakeFormData, intakeDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Storage Unit</label>
                                            <input
                                                type="text"
                                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                placeholder="e.g. C-04"
                                                value={intakeFormData.unit}
                                                onChange={(e) => setIntakeFormData({ ...intakeFormData, unit: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Notes</label>
                                        <textarea
                                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none min-h-[120px]"
                                            placeholder="Physical description, items found, special handling..."
                                            value={intakeFormData.notes}
                                            onChange={(e) => setIntakeFormData({ ...intakeFormData, notes: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 space-y-6">
                                        <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Representative Information
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Representative Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 rounded-lg bg-white border border-indigo-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                    placeholder="Next of kin name"
                                                    value={intakeFormData.representativeName}
                                                    onChange={(e) => setIntakeFormData({ ...intakeFormData, representativeName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Contact Number</label>
                                                <input
                                                    type="tel"
                                                    className="w-full p-3 rounded-lg bg-white border border-indigo-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                                    placeholder="+1 (555) 000-0000"
                                                    value={intakeFormData.representativePhone}
                                                    onChange={(e) => setIntakeFormData({ ...intakeFormData, representativePhone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isSubmittingIntake}
                                            className="w-full p-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-lg shadow-xl shadow-slate-200 transition-all hover:scale-[1.02]"
                                        >
                                            {isSubmittingIntake ? 'Creating Record...' : 'Finalize Intake Manifest'}
                                        </Button>
                                        <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest">
                                            SECURE MANIFEST SYSTEM · ISO-9001 COMPLIANT
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="records" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="border-none shadow-premium rounded-2xl bg-white p-6 space-y-4 hover:shadow-xl transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Death Certificates</h4>
                                <p className="text-sm text-slate-500">Manage and issue official documentation for verification.</p>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-bold text-indigo-600">{records.filter(r => r.status === MortuaryStatus.PENDING_RELEASE).length} Actions Needed</span>
                                <ArrowUpRight className="h-4 w-4 text-indigo-400" />
                            </div>
                        </Card>
                        <Card className="border-none shadow-premium rounded-2xl bg-white p-6 space-y-4 hover:shadow-xl transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Coroner Reports</h4>
                                <p className="text-sm text-slate-500">Access and file specialized autopsy and investigative data.</p>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-bold text-rose-600">{records.filter(r => r.status === MortuaryStatus.PENDING_AUTOPSY).length} Active Cases</span>
                                <ArrowUpRight className="h-4 w-4 text-rose-400" />
                            </div>
                        </Card>
                        <Card className="border-none shadow-premium rounded-2xl bg-white p-6 space-y-4 hover:shadow-xl transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Custody Chain</h4>
                                <p className="text-sm text-slate-500">View detailed audit logs of all remains handling and access.</p>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-bold text-amber-600">Full Audit History</span>
                                <ArrowUpRight className="h-4 w-4 text-amber-400" />
                            </div>
                        </Card>
                    </div>

                    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                        <CardHeader className="border-b border-slate-50 pb-4">
                            <CardTitle className="text-lg font-bold">Recent Documentation Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {records.filter(r => r.signedManifestUrl || r.status === MortuaryStatus.RELEASED).map((record) => (
                                    <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-slate-100 rounded-lg">
                                                <FileText className="h-5 w-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{record.deceasedName}</p>
                                                <p className="text-xs text-slate-500">
                                                    {record.status === MortuaryStatus.RELEASED ? 'Final Release Form' : 'Storage Manifest'} · {record.id.substring(0, 8).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50">
                                            View Document
                                        </Button>
                                    </div>
                                ))}
                                {records.filter(r => r.signedManifestUrl || r.status === MortuaryStatus.RELEASED).length === 0 && (
                                    <div className="p-12 text-center text-slate-400 italic">
                                        No documented activity recorded yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="services">
                    <ServiceManagement centerId={centerId} />
                </TabsContent>



                <TabsContent value="management">
                    <FacilityManagement centerId={centerId} />
                </TabsContent>
            </Tabs>

            <RemainsManagementModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                remain={selectedRemain}
                isAttendant={isAttendant}
            />

            {selectedRemain && (
                <div className="mt-12 space-y-12 border-t border-slate-100 pt-12">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-slate-50/50">
                        <CardHeader>
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Active Management: {selectedRemain.deceasedName}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-12">
                            <MortuaryIntakeManager remain={selectedRemain} />
                            <div className="border-t border-slate-100 pt-12">
                                <h4 className="text-lg font-black uppercase tracking-tight mb-6">Legal & Documentation</h4>
                                <DigitalDeathCertificate record={selectedRemain} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
