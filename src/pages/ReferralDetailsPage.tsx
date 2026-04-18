import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    MessageSquare,
    Activity,
    Shield,
    Download,
    Share2,
    Plus,
    Lock
} from 'lucide-react';
import {
    Referral,
    ReferralStatus,
    ReferralPriority,
    referralService
} from '@/services/referralService';
import { chatService } from '@/services/chatService';
import { chatWebSocketService } from '@/services/chatWebSocketService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ReferralDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [referral, setReferral] = useState<Referral | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [chatRoom, setChatRoom] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<ReferralStatus | null>(null);

    useEffect(() => {
        if (id) {
            loadReferralData();
        }
    }, [id]);

    useEffect(() => {
        if (chatRoom && user) {
            // Connect and join room
            chatWebSocketService.connect(user.id, localStorage.getItem('access_token') || '');
            chatWebSocketService.joinRoom(chatRoom.id);

            // Listen for messages
            const handleNewMessage = (message: any) => {
                if (message.roomId === chatRoom.id) {
                    setMessages(prev => {
                        // Check if message already exists
                        if (prev.some(m => m.id === message.id)) return prev;
                        return [...prev, message];
                    });
                }
            };

            const handleSystemMessage = (message: any) => {
                if (message.roomId === chatRoom.id) {
                    console.log('System Message:', message.content);
                    // Optionally display system messages in the chat or as a toast
                    toast.info(`System: ${message.content}`);
                }
            };

            chatWebSocketService.on('new_message', handleNewMessage);
            chatWebSocketService.on('system_message', handleSystemMessage);

            return () => {
                chatWebSocketService.leaveRoom(chatRoom.id);
                chatWebSocketService.off('new_message', handleNewMessage);
                chatWebSocketService.off('system_message', handleSystemMessage);
            };
        }
    }, [chatRoom, user]);

    const loadReferralData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const { data, error } = await referralService.getReferralById(id);
            if (error) {
                toast.error('Failed to load referral details');
                return;
            }
            setReferral(data);

            // Load chat if available
            if ((data as any).chatRoomId) {
                const room = await chatService.getChatRoomById((data as any).chatRoomId);
                setChatRoom(room);
                const msgs = await chatService.getRoomMessages(room.id);
                setMessages(msgs.data);
            }
        } catch (error) {
            console.error('Error loading referral:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!referral || !newStatus || !id) return;

        try {
            await referralService.updateReferral(id, {
                status: newStatus,
                responseNotes: statusUpdateNotes
            });
            toast.success(`Referral status updated to ${newStatus}`);
            setIsStatusModalOpen(false);
            setStatusUpdateNotes('');
            loadReferralData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!chatRoom || !user) return;
        try {
            // Send via WebSocket for real-time
            chatWebSocketService.sendMessage(chatRoom.id, { content });
            // The message will be added via the 'new_message' listener
        } catch (error) {
            // Fallback to API if WebSocket fails
            try {
                const newMessage = await chatService.sendMessage(chatRoom.id, { content });
                setMessages(prev => [...prev, newMessage]);
            } catch (apiError) {
                toast.error('Failed to send message');
            }
        }
    };

    const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        setLoading(true);
        try {
            await referralService.addReferralDocument(id, file, {
                referralId: id,
                name: file.name,
                documentType: 'other' as any, // Default to other for quick upload
                description: `Uploaded at ${new Date().toLocaleString()}`
            });
            toast.success('Document uploaded successfully');
            loadReferralData();
        } catch (error) {
            toast.error('Failed to upload document');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: ReferralStatus) => {
        switch (status) {
            case ReferralStatus.PENDING:
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
            case ReferralStatus.ACCEPTED:
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Accepted</Badge>;
            case ReferralStatus.REJECTED:
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
            case ReferralStatus.COMPLETED:
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: ReferralPriority) => {
        switch (priority) {
            case ReferralPriority.LOW:
                return <Badge variant="outline" className="text-gray-600">Low</Badge>;
            case ReferralPriority.NORMAL:
                return <Badge variant="outline" className="text-blue-600 border-blue-200">Normal</Badge>;
            case ReferralPriority.HIGH:
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>;
            case ReferralPriority.URGENT:
                return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 animate-pulse">Urgent</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!referral) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold">Referral Not Found</h2>
                <Button onClick={() => navigate('/referrals')} className="mt-4">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32 md:pb-12">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/referrals')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div className="h-6 w-px bg-gray-200"></div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Referral: {referral.patient.name}
                                </h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-gray-500 font-mono">ID: {referral.id.substring(0, 8)}</span>
                                    <span className="text-gray-300 text-xs">•</span>
                                    <span className="text-xs text-gray-500">{new Date(referral.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusBadge(referral.status)}
                            {getPriorityBadge(referral.priority)}
                            <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="bg-white border shadow-sm w-full justify-start p-1 h-auto">
                                <TabsTrigger value="overview" className="px-6 py-2">Overview</TabsTrigger>
                                <TabsTrigger value="clinical" className="px-6 py-2">Clinical Details</TabsTrigger>
                                <TabsTrigger value="history" className="px-6 py-2">History & Activity</TabsTrigger>
                                <TabsTrigger value="documents" className="px-6 py-2">Documents</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Quick Info Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500 uppercase flex items-center">
                                                <User className="h-4 w-4 mr-2" /> Patient Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center space-x-4">
                                                <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                                                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                                        {referral.patient.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-gray-900">{referral.patient.name}</p>
                                                    <p className="text-sm text-gray-500">{referral.patient.email}</p>
                                                    <p className="text-sm text-gray-500">{referral.patient.phone || 'No phone provided'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-500 uppercase flex items-center">
                                                <Shield className="h-4 w-4 mr-2" /> Referral Context
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Type:</span>
                                                <span className="font-medium text-gray-900 uppercase">{referral.referralType}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Center:</span>
                                                <span className="font-medium text-gray-900">Referring Center</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Destination:</span>
                                                <span className="text-blue-600 font-semibold underline decoration-2 decoration-blue-200 cursor-pointer">Receiving Center</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Activity className="h-5 w-5 mr-2 text-blue-600" /> Referral Reason
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 leading-relaxed bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                            {referral.reason}
                                        </p>

                                        {referral.diagnosis && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Preliminary Diagnosis</h4>
                                                <div className="bg-white border rounded-md p-3 text-sm text-gray-700 shadow-sm italic">
                                                    "{referral.diagnosis}"
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="flex space-x-3">
                                    {referral.status === ReferralStatus.PENDING && (
                                        <>
                                            <Button
                                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                onClick={() => {
                                                    setNewStatus(ReferralStatus.ACCEPTED);
                                                    setIsStatusModalOpen(true);
                                                }}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Accept Referral
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => {
                                                    setNewStatus(ReferralStatus.REJECTED);
                                                    setIsStatusModalOpen(true);
                                                }}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject Referral
                                            </Button>
                                        </>
                                    )}
                                    {referral.status === ReferralStatus.ACCEPTED && (
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            onClick={() => {
                                                setNewStatus(ReferralStatus.COMPLETED);
                                                setIsStatusModalOpen(true);
                                            }}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Mark as Completed
                                        </Button>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="clinical" className="mt-4 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Clinical Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-48 rounded-md border p-4 bg-gray-50">
                                            {referral.clinicalNotes || 'No detailed clinical notes provided.'}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Current Medications</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {referral.medications && referral.medications.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {referral.medications.map((med, i) => (
                                                        <li key={i} className="text-sm flex justify-between items-center p-2 bg-gray-50 rounded border">
                                                            <span className="font-medium text-gray-900">{med.name}</span>
                                                            <span className="text-xs text-gray-500">{med.dosage} - {med.frequency}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No medications listed.</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm flex items-center text-red-700">
                                                <AlertCircle className="h-4 w-4 mr-2" /> Allergies
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {referral.allergies && referral.allergies.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {referral.allergies.map((allergy, i) => (
                                                        <li key={i} className="text-sm flex justify-between items-center p-2 bg-red-50/50 rounded border border-red-100">
                                                            <span className="font-medium text-red-900">{allergy.allergen}</span>
                                                            <Badge variant="outline" className={`text-[10px] ${allergy.severity === 'high' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100'
                                                                }`}>
                                                                {allergy.severity}
                                                            </Badge>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No allergies listed.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="documents" className="mt-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Referral Documents</CardTitle>
                                            <CardDescription>Secure record sharing and clinical findings</CardDescription>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="file"
                                                id="referral-document-upload"
                                                className="hidden"
                                                onChange={handleUploadDocument}
                                            />
                                            <Button
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700"
                                                onClick={() => document.getElementById('referral-document-upload')?.click()}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Upload
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {referral.documents && referral.documents.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {referral.documents.map((doc) => (
                                                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-xl bg-white hover:shadow-md transition-all group">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                <FileText className="h-6 w-6" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">{doc.name || doc.originalFilename}</p>
                                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{doc.documentType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
                                                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">No documents shared with this referral yet.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar / Chat */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="h-[600px] flex flex-col border-2 border-blue-100 shadow-xl overflow-hidden">
                            <CardHeader className="bg-blue-600 text-white p-4">
                                <CardTitle className="text-lg flex items-center">
                                    <MessageSquare className="h-5 w-5 mr-2" />
                                    Internal Communication
                                </CardTitle>
                                <CardDescription className="text-blue-100">
                                    Secure messaging between centers
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 flex flex-col h-full overflow-hidden">
                                {chatRoom ? (
                                    <ChatInterface
                                        currentUserId={user?.id || ''}
                                        selectedRoom={chatRoom}
                                        messages={messages}
                                        onSendMessage={handleSendMessage}
                                    />
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                        <div className="p-4 bg-gray-100 rounded-full">
                                            <Lock className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Secure Consultation</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Messaging will be available once the referral is managed by providers.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Team Involved</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{referral.referringProvider.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-xs">
                                            <p className="font-bold">{referral.referringProvider.name}</p>
                                            <p className="text-gray-500">Referring Provider</p>
                                        </div>
                                    </div>
                                    <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-100">Sender</Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {referral.receivingProvider ? (
                                            <>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{referral.receivingProvider.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-xs">
                                                    <p className="font-bold">{referral.receivingProvider.name}</p>
                                                    <p className="text-gray-500">Receiving Provider</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Avatar className="h-8 w-8 bg-gray-100 italic">
                                                    <AvatarFallback>?</AvatarFallback>
                                                </Avatar>
                                                <div className="text-xs">
                                                    <p className="font-bold text-gray-400">Awaiting Assignee</p>
                                                    <p className="text-gray-400">Target Provider</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">Recipient</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Referral Status</DialogTitle>
                        <DialogDescription>
                            You are changing the status to <span className="font-bold uppercase">{newStatus}</span>.
                            Please add notes for the referring center.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            placeholder="Add response notes, instructions or reasons for this status change..."
                            value={statusUpdateNotes}
                            onChange={(e) => setStatusUpdateNotes(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpdateStatus}
                            className={newStatus === ReferralStatus.REJECTED ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                        >
                            Confirm {newStatus}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReferralDetailsPage;
