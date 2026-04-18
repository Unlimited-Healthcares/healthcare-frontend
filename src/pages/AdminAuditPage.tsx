import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Search, 
    Filter, 
    Download, 
    User,
    Shield,
    Server,
    AlertTriangle,
    Terminal,
    ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';

interface AuditLog {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'security';
    action: string;
    user: string;
    userId: string;
    ipAddress: string;
    resource: string;
    details: string;
}

const AdminAuditPage: React.FC = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulated audit logs
        const mockLogs: AuditLog[] = [
            {
                id: 'log-001',
                timestamp: new Date().toISOString(),
                level: 'security',
                action: 'Admin Login',
                user: 'System Admin',
                userId: 'user-001',
                ipAddress: '192.168.1.1',
                resource: 'Auth Service',
                details: 'Successful login from Chrome on Windows'
            },
            {
                id: 'log-002',
                timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                level: 'info',
                action: 'Center Verified',
                user: 'Verification Team',
                userId: 'user-005',
                ipAddress: '192.168.1.42',
                resource: 'Center Management',
                details: 'Verified license for City General Hospital'
            },
            {
                id: 'log-003',
                timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                level: 'warning',
                action: 'Failed Login',
                user: 'Unknown',
                userId: 'N/A',
                ipAddress: '45.12.33.21',
                resource: 'Auth Service',
                details: 'Repeated failed login attempts for user doctor@example.com'
            },
            {
                id: 'log-004',
                timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                level: 'error',
                action: 'API Error',
                user: 'System',
                userId: 'system-agent',
                ipAddress: '127.0.0.1',
                resource: 'Payment Gateway',
                details: 'Stripe webhook verification failed'
            },
            {
                id: 'log-005',
                timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
                level: 'info',
                action: 'Settings Updated',
                user: 'Admin User',
                userId: 'user-001',
                ipAddress: '192.168.1.1',
                resource: 'System Configuration',
                details: 'Updated maintenance window schedule'
            }
        ];
        
        setLogs(mockLogs);
        setLoading(false);
    }, []);

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'security': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none"><Shield className="h-3 w-3 mr-1" /> Security</Badge>;
            case 'error': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none"><AlertTriangle className="h-3 w-3 mr-1" /> Error</Badge>;
            case 'warning': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none"><AlertTriangle className="h-3 w-3 mr-1" /> Warning</Badge>;
            default: return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"><Terminal className="h-3 w-3 mr-1" /> Info</Badge>;
        }
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
                            className="rounded-xl"
                            onClick={() => navigate('/admin')}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Security Audit Logs</h1>
                            <p className="text-gray-500 mt-1 font-medium">Record of all administrative and security-sensitive actions.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-xl bg-white border-gray-200 text-gray-700">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Search & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                                placeholder="Search by action, user, or IP address..." 
                                className="pl-12 py-6 rounded-2xl border-gray-100 shadow-sm bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <Card className="border-none shadow-sm bg-indigo-600 text-white rounded-2xl">
                        <CardContent className="p-4 flex flex-col justify-center h-full">
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">System Integrity</p>
                            <h3 className="text-2xl font-bold mt-1">High (99.9%)</h3>
                        </CardContent>
                    </Card>
                </div>

                {/* Logs Table */}
                <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-gray-50">
                        <div className="flex items-center gap-2">
                            <Server className="h-5 w-5 text-blue-600" />
                            <CardTitle>System Activity Feed</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 hover:bg-transparent">
                                    <TableHead className="font-bold text-gray-700 w-[180px]">Timestamp</TableHead>
                                    <TableHead className="font-bold text-gray-700">Level</TableHead>
                                    <TableHead className="font-bold text-gray-700">Action</TableHead>
                                    <TableHead className="font-bold text-gray-700">Actor</TableHead>
                                    <TableHead className="font-bold text-gray-700">IP Address</TableHead>
                                    <TableHead className="font-bold text-gray-700">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center">
                                            <div className="animate-pulse flex flex-col items-center gap-2">
                                                <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                                                <p className="text-sm text-gray-500 font-medium">Fetching logs...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-gray-500 italic">
                                            No audit logs found for the selected period.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                            <TableCell className="text-sm font-medium text-gray-600">
                                                <div className="flex flex-col">
                                                    <span>{format(new Date(log.timestamp), 'MMM dd, yyyy')}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">{format(new Date(log.timestamp), 'HH:mm:ss.ms')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getLevelBadge(log.level)}</TableCell>
                                            <TableCell className="font-bold text-gray-900">{log.action}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold flex items-center gap-1">
                                                        <User className="h-3 w-3 text-gray-400" />
                                                        {log.user}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-mono uppercase">{log.userId}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-mono text-gray-500">{log.ipAddress}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col max-w-[400px]">
                                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-tight mb-1">{log.resource}</span>
                                                    <span className="text-sm text-gray-600 line-clamp-1 group-hover:line-clamp-none transition-all">{log.details}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminAuditPage;
