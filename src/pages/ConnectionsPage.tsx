import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { discoveryService } from '@/services/discoveryService';
import { User, Center } from '@/types/discovery';
import {
    Users,
    Search,
    MessageCircle,
    UserCircle,
    Building2,
    MoreVertical,
    Filter,
    RefreshCw,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ConnectionsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [connections, setConnections] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'doctor' | 'center' | 'patient'>('all');

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const data = await discoveryService.getConnections();
            setConnections(data);
        } catch (error) {
            console.error('Failed to fetch connections:', error);
            toast.error('Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (userId: string) => {
        navigate(`/chat?userId=${userId}`);
    };

    const handleViewProfile = (publicId: string) => {
        navigate(`/profile/${publicId}`);
    };

    const filteredConnections = connections.filter(conn => {
        const matchesSearch = conn.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conn.specialty?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'all') return matchesSearch;

        // Check roles for filtering
        const roles = conn.roles || [];
        if (filter === 'doctor') return matchesSearch && roles.includes('doctor');
        if (filter === 'center') return matchesSearch && roles.includes('center');
        if (filter === 'patient') return matchesSearch && roles.includes('patient');

        return matchesSearch;
    });

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50/50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Users className="h-8 w-8 text-blue-600" />
                                My Connections
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Manage and interact with your verified healthcare connections.
                            </p>
                        </div>
                        <Button
                            onClick={fetchConnections}
                            variant="outline"
                            size="sm"
                            className="w-fit"
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>

                    {/* Controls */}
                    <Card className="mb-8 border-none shadow-sm bg-white">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, specialty, or clinic..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-11"
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                    <Button
                                        variant={filter === 'all' ? 'default' : 'outline'}
                                        onClick={() => setFilter('all')}
                                        size="sm"
                                        className="rounded-full px-5"
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={filter === 'doctor' ? 'default' : 'outline'}
                                        onClick={() => setFilter('doctor')}
                                        size="sm"
                                        className="rounded-full px-5"
                                    >
                                        Doctors
                                    </Button>
                                    <Button
                                        variant={filter === 'center' ? 'default' : 'outline'}
                                        onClick={() => setFilter('center')}
                                        size="sm"
                                        className="rounded-full px-5"
                                    >
                                        Centers
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-gray-500 font-medium">Fetching your connections...</p>
                        </div>
                    ) : filteredConnections.length === 0 ? (
                        <Card className="border-dashed border-2 bg-transparent">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Users className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No connections found</h3>
                                <p className="text-gray-500 max-w-sm mt-2">
                                    {searchTerm
                                        ? `No results match "${searchTerm}". Try a different search term.`
                                        : "You haven't established any connections yet."
                                    }
                                </p>
                                {!searchTerm && (
                                    <Button
                                        className="mt-6 bg-blue-600 hover:bg-blue-700"
                                        onClick={() => navigate('/discovery')}
                                    >
                                        Discover Professionals
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredConnections.map((conn) => (
                                <Card key={conn.id} className="group hover:shadow-md transition-all duration-200 border-none shadow-sm overflow-hidden bg-white">
                                    <CardContent className="p-0">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        {conn.avatar ? (
                                                            <img
                                                                src={conn.avatar}
                                                                alt={conn.displayName}
                                                                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-50"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                                                {conn.displayName?.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {conn.displayName}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 font-medium">
                                                            {conn.specialty || 'General Care'}
                                                        </p>
                                                        <div className="flex gap-1 mt-2">
                                                            {conn.roles?.map(role => (
                                                                <Badge key={role} variant="secondary" className="text-[10px] py-0 px-2 bg-gray-100 text-gray-600 border-none uppercase tracking-wider font-bold">
                                                                    {role}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                    <MoreVertical className="h-4 w-4 text-gray-400" />
                                                </Button>
                                            </div>

                                            <div className="mt-6 space-y-3">
                                                {conn.phone && (
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <span>{conn.phone}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span className="truncate">Contact via Chat</span>
                                                </div>
                                                {conn.location && (
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                        <span>{conn.location.city}, {conn.location.country}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/80 p-4 flex gap-2">
                                            <Button
                                                onClick={() => handleSendMessage(conn.id)}
                                                className="flex-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 shadow-none font-bold"
                                                variant="outline"
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Chat
                                            </Button>
                                            <Button
                                                onClick={() => handleViewProfile(conn.publicId || conn.id)}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-bold"
                                            >
                                                Profile
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

// Internal utility for class names
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

export default ConnectionsPage;
