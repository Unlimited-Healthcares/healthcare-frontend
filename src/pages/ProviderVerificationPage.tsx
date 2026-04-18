import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink,
    Mail,
    Phone,
    User,
    CreditCard,
    ShieldCheck,
    Globe,
    FileText,
    ChevronRight,
    SearchCode,
    Loader2
} from 'lucide-react';
import { PROFESSIONAL_BODIES, ProfessionalBody } from '@/data/professionalBodies';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { adminService } from '@/services/adminService';

// Type for the verification queue item
interface VerificationUser {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    country: string;
    specialization: string;
    practiceNumber: string;
    idType: string;
    idNumber: string;
    idDoc: string; // Base64
    kycStatus: string;
    professionalStatus: string;
    submittedAt: string;
    // New Business/KYC Fields
    businessRegNumber?: string;
    licenseNumber?: string;
    licenseCertificateDoc?: string;
    businessRegDoc?: string;
    isBusiness?: boolean;
    // Internal tracking
    kycSubmissionId?: string;
    profSubmissionId?: string;
    professionalRole?: string;
    licenseDoc?: string;
}

const ProviderVerificationPage: React.FC = () => {
    const [users, setUsers] = useState<VerificationUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<VerificationUser | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Filtered users
    const filteredUsers = users.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.practiceNumber && user.practiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.idNumber && user.idNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const [kycRes, profRes] = await Promise.all([
                adminService.getKycSubmissions('PENDING'),
                adminService.getProfessionalSubmissions('PENDING')
            ]);

            const kycSubmissions = kycRes.data || [];
            const profSubmissions = profRes.data || [];

            // Group by userId for a unified view
            const userGroups: Record<string, Partial<VerificationUser>> = {};

            kycSubmissions.forEach((sub: any) => {
                const userId = sub.userId;
                if (!userGroups[userId]) {
                    userGroups[userId] = {
                        id: userId,
                        firstName: sub.user?.name?.split(' ')[0] || sub.fullName?.split(' ')[0] || 'Unknown',
                        lastName: sub.user?.name?.split(' ').slice(1).join(' ') || sub.fullName?.split(' ').slice(1).join(' ') || 'User',
                        role: sub.user?.roles?.[0] || 'User',
                        country: sub.user?.profile?.location?.country || 'Unknown',
                        kycStatus: sub.status,
                        professionalStatus: 'NONE',
                        submittedAt: sub.submittedAt,
                        idType: sub.idDocType,
                        idNumber: sub.idDocNumber,
                        idDoc: sub.idDocFilePath,
                        kycSubmissionId: sub.id
                    };
                }
            });

            profSubmissions.forEach((sub: any) => {
                const userId = sub.userId;
                if (userGroups[userId]) {
                    userGroups[userId].professionalStatus = sub.status;
                    userGroups[userId].professionalRole = sub.professionalRole;
                    userGroups[userId].specialization = sub.specialization;
                    userGroups[userId].practiceNumber = sub.practiceNumber;
                    userGroups[userId].profSubmissionId = sub.id;
                    userGroups[userId].licenseDoc = sub.licenseFilePath;
                } else {
                    userGroups[userId] = {
                        id: userId,
                        firstName: sub.user?.name?.split(' ')[0] || 'Unknown',
                        lastName: sub.user?.name?.split(' ').slice(1).join(' ') || 'User',
                        role: sub.user?.roles?.[0] || 'User',
                        country: sub.country || 'Unknown',
                        kycStatus: 'NONE',
                        professionalStatus: sub.status,
                        submittedAt: sub.submittedAt,
                        professionalRole: sub.professionalRole,
                        specialization: sub.specialization,
                        practiceNumber: sub.practiceNumber,
                        profSubmissionId: sub.id,
                        licenseDoc: sub.licenseFilePath
                    };
                }
            });

            setUsers(Object.values(userGroups) as VerificationUser[]);
        } catch (error) {
            console.error('Failed to fetch verification queue:', error);
            toast.error('Failed to load verification queue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const findProfessionalBody = (user: VerificationUser): ProfessionalBody | undefined => {
        // Find matching body by country and profession
        return PROFESSIONAL_BODIES.find(body =>
            body.country.toLowerCase() === user.country.toLowerCase() &&
            body.professions.some(p => p.toLowerCase() === user.role.toLowerCase() || p.toLowerCase() === 'doctor')
        );
    };

    const handleVerifyStatus = async (userId: string, type: 'KYC' | 'PROFESSIONAL', status: 'APPROVED' | 'REJECTED') => {
        setIsProcessing(true);
        try {
            const user = users.find(u => u.id === userId);
            if (!user) throw new Error('User not found');

            if (type === 'KYC') {
                if (!(user as any).kycSubmissionId) throw new Error('KYC submission ID missing');
                await adminService.reviewKycSubmission((user as any).kycSubmissionId, status);
            } else {
                if (!(user as any).profSubmissionId) throw new Error('Professional submission ID missing');
                await adminService.reviewProfessionalSubmission((user as any).profSubmissionId, status);
            }

            toast.success(`${type} status updated to ${status}`);
            await fetchQueue(); // Refresh the list
        } catch (error: any) {
            console.error('Review failed:', error);
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Verification Center</h1>
                    <p className="text-gray-500">Manual review of healthcare provider identities and professional licenses</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Verification Queue */}
                <Card className="lg:col-span-1 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
                    <CardHeader className="p-4 border-b bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or ID..."
                                className="pl-9 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <p className="text-gray-400 italic">No pending requests found</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`w-full p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left ${selectedUser?.id === user.id ? 'bg-blue-50 border-r-4 border-blue-600 shadow-sm' : ''}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h4 className="font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</h4>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{new Date(user.submittedAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2 capitalize">{user.role} • {user.country}</p>
                                            <div className="flex gap-1.5 mt-2">
                                                <Badge
                                                    variant={user.kycStatus === 'APPROVED' ? 'default' : user.kycStatus === 'REJECTED' ? 'destructive' : 'outline'}
                                                    className={cn(
                                                        "text-[9px] px-2 py-0 h-4 uppercase font-bold tracking-tighter border-0",
                                                        user.kycStatus === 'PENDING' && "bg-amber-100 text-amber-700 hover:bg-amber-100",
                                                        user.kycStatus === 'APPROVED' && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
                                                    )}
                                                >
                                                    ID: {user.kycStatus}
                                                </Badge>
                                                <Badge
                                                    variant={user.professionalStatus === 'APPROVED' ? 'default' : user.professionalStatus === 'REJECTED' ? 'destructive' : 'outline'}
                                                    className={cn(
                                                        "text-[9px] px-2 py-0 h-4 uppercase font-bold tracking-tighter border-0",
                                                        user.professionalStatus === 'PENDING' && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                                                        user.professionalStatus === 'APPROVED' && "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
                                                    )}
                                                >
                                                    Prof: {user.professionalStatus}
                                                </Badge>
                                            </div>
                                        </div>
                                        <ChevronRight className={`h-4 w-4 mt-1 transition-transform ${selectedUser?.id === user.id ? 'translate-x-1 text-blue-600' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Verification Detail Panel */}
                <div className="lg:col-span-2 space-y-6 overflow-y-auto h-[calc(100vh-250px)] pr-2 custom-scrollbar">
                    {selectedUser ? (
                        <div className="space-y-6">
                            {/* User Summary Header */}
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <ShieldCheck className="h-48 w-48" />
                                </div>
                                <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center relative z-10">
                                    <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center p-1 border border-white/30 shadow-2xl overflow-hidden">
                                        {selectedUser.isBusiness ? <Globe className="h-16 w-16 text-white" /> : <User className="h-16 w-16 text-white" />}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm px-3">{selectedUser.role.toUpperCase()}</Badge>
                                            <Badge className="bg-blue-400/30 text-white border-0 backdrop-blur-sm px-3">
                                                {selectedUser.isBusiness ? 'ORGANIZATION' : 'INDIVIDUAL'}
                                            </Badge>
                                            <Badge className="bg-indigo-400/30 text-white border-0 backdrop-blur-sm px-3">{selectedUser.specialization}</Badge>
                                        </div>
                                        <h2 className="text-4xl font-black mb-2 tracking-tight">{selectedUser.firstName} {selectedUser.lastName}</h2>
                                        <div className="flex items-center justify-center md:justify-start gap-4 text-blue-100 italic">
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <Globe className="h-4 w-4" />
                                                <span>{selectedUser.country}</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-blue-300/50" />
                                            <span>
                                                {selectedUser.isBusiness ? `Reg No: ${selectedUser.businessRegNumber}` : `ID: ${selectedUser.idNumber}`}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Identity Document Verification */}
                                <Card className="shadow-sm border-0 ring-1 ring-gray-100 flex flex-col">
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-gray-50/50">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                {selectedUser.isBusiness ? <Globe className="h-4 w-4 text-blue-600" /> : <CreditCard className="h-4 w-4 text-blue-600" />}
                                            </div>
                                            <CardTitle className="text-sm font-bold">
                                                {selectedUser.isBusiness ? 'Business Registration (KYC)' : 'Government-Issued Identity'}
                                            </CardTitle>
                                        </div>
                                        <Badge variant={selectedUser.kycStatus === 'APPROVED' ? 'default' : selectedUser.kycStatus === 'REJECTED' ? 'destructive' : 'secondary'} className="px-3">
                                            {selectedUser.kycStatus}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                                    {selectedUser.isBusiness ? 'Company Type' : 'ID Type'}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900">{selectedUser.idType}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                                    {selectedUser.isBusiness ? 'Business Reg Number' : 'ID Number'}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 tabular-nums">{selectedUser.idNumber}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-h-[220px] bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 relative group">
                                            <img
                                                src={selectedUser.idDoc}
                                                alt="Government ID"
                                                className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                                                onClick={() => window.open(selectedUser.idDoc)}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Button variant="secondary" size="sm" onClick={() => window.open(selectedUser.idDoc)}>
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    View Full Size
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                                                onClick={() => handleVerifyStatus(selectedUser.id, 'KYC', 'REJECTED')}
                                                disabled={isProcessing || selectedUser.kycStatus === 'REJECTED'}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject {selectedUser.isBusiness ? 'Reg' : 'ID'}
                                            </Button>
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm font-semibold"
                                                onClick={() => handleVerifyStatus(selectedUser.id, 'KYC', 'APPROVED')}
                                                disabled={isProcessing || selectedUser.kycStatus === 'APPROVED'}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve {selectedUser.isBusiness ? 'Business' : 'Identity'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Professional License Verification */}
                                <Card className="shadow-sm border-0 ring-1 ring-gray-100 flex flex-col">
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-indigo-50/50">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <SearchCode className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <CardTitle className="text-sm font-bold">
                                                {selectedUser.isBusiness ? 'Healthcare Facility License' : 'Professional Practice License'}
                                            </CardTitle>
                                        </div>
                                        <Badge variant={selectedUser.professionalStatus === 'APPROVED' ? 'default' : selectedUser.professionalStatus === 'REJECTED' ? 'destructive' : 'secondary'} className="px-3">
                                            {selectedUser.professionalStatus}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-2 text-indigo-200">
                                                    <FileText className="h-12 w-12" />
                                                </div>
                                                <p className="text-[10px] text-indigo-600/70 font-black uppercase tracking-widest mb-1.5">
                                                    {selectedUser.isBusiness ? 'Facility license Number' : 'Official Practice Number'}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-2xl font-black text-indigo-950 tabular-nums">
                                                        {selectedUser.isBusiness ? selectedUser.licenseNumber : selectedUser.practiceNumber}
                                                    </h3>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-indigo-400 hover:text-indigo-600"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(selectedUser.practiceNumber);
                                                            toast.info('License number copied to clipboard');
                                                        }}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {findProfessionalBody(selectedUser) ? (
                                                <div className="space-y-4 pt-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1 lg:h-1 flex-1 bg-gradient-to-r from-indigo-100 to-transparent" />
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Body</span>
                                                        <div className="h-1 lg:h-1 flex-1 bg-gradient-to-l from-indigo-100 to-transparent" />
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h4 className="font-bold text-gray-900 leading-tight">{findProfessionalBody(selectedUser)?.name}</h4>

                                                        <div className="grid grid-cols-1 gap-2">
                                                            {findProfessionalBody(selectedUser)?.website && (
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full justify-start text-xs border-indigo-100 hover:bg-indigo-50 h-9 group"
                                                                    onClick={() => window.open(findProfessionalBody(selectedUser)?.website)}
                                                                >
                                                                    <Globe className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                                                                    <span className="flex-1 text-left truncate">Official Verification Portal</span>
                                                                    <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </Button>
                                                            )}
                                                            <div className="flex items-center gap-2 p-2.5 bg-gray-50/80 rounded-lg border border-gray-100">
                                                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                                <span className="text-xs text-gray-600 font-medium truncate">{findProfessionalBody(selectedUser)?.email}</span>
                                                            </div>
                                                            {findProfessionalBody(selectedUser)?.phone && (
                                                                <div className="flex items-center gap-2 p-2.5 bg-gray-50/80 rounded-lg border border-gray-100">
                                                                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                                    <span className="text-xs text-gray-600 font-medium">{findProfessionalBody(selectedUser)?.phone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 mt-2">
                                                        <div className="flex gap-3">
                                                            <Clock className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                            <div className="text-xs text-amber-800 leading-relaxed">
                                                                <p className="font-bold mb-1">Standard Operating Procedure:</p>
                                                                <ol className="list-decimal list-inside space-y-1 text-amber-900/70">
                                                                    <li>Open the verification portal above</li>
                                                                    <li>Search for <span className="font-black text-amber-900">"{selectedUser.practiceNumber}"</span></li>
                                                                    <li>Match the name with <span className="font-black text-amber-900">"{selectedUser.firstName} {selectedUser.lastName}"</span></li>
                                                                </ol>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500 font-medium">Professional body not found for {selectedUser.country}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Please verify manually via Google</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3 pt-4 mt-auto">
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                                                onClick={() => handleVerifyStatus(selectedUser.id, 'PROFESSIONAL', 'REJECTED')}
                                                disabled={isProcessing || selectedUser.professionalStatus === 'REJECTED'}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Invalid License
                                            </Button>
                                            <Button
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm font-semibold"
                                                onClick={() => handleVerifyStatus(selectedUser.id, 'PROFESSIONAL', 'APPROVED')}
                                                disabled={isProcessing || selectedUser.professionalStatus === 'APPROVED'}
                                            >
                                                <ShieldCheck className="h-4 w-4 mr-2" />
                                                Approve License
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center text-gray-300 shadow-inner">
                                <ShieldCheck className="h-12 w-12" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 leading-tight">Compliance Review Terminal</h3>
                                <p className="text-gray-500 text-sm max-w-[320px] mt-2 font-medium">Please select a pending verification request from the audit queue to begin the identity and license review protocol.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default function VerificationCenter() {
    return (
        <ProtectedRoute>
            <ProviderVerificationPage />
        </ProtectedRoute>
    );
}
