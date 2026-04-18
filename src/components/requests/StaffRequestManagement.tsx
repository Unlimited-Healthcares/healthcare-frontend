import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { discoveryService } from '@/services/discoveryService';
import { Request } from '@/types/discovery';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { invitationService } from '@/services/invitationService';
import { Loader2 } from 'lucide-react';

interface StaffRequestManagementProps {
  centerId: string;
  centerName?: string;
}

export const StaffRequestManagement: React.FC<StaffRequestManagementProps> = ({
  centerId,
  centerName = 'Your Center'
}) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Invite Staff states
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('doctor');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Load requests on component mount
  useEffect(() => {
    loadRequests();
  }, [centerId]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🏥 CENTER LOADING REQUESTS:', {
        centerId,
        centerName,
        timestamp: new Date().toISOString(),
        expectedRequests: 'Staff invitations should appear here'
      });

      const response = await discoveryService.getReceivedRequests({ status: 'pending' });

      console.log('🏥 CENTER RECEIVED REQUESTS:', {
        totalRequests: response.requests?.length || 0,
        requests: response.requests?.map(req => ({
          id: req.id,
          type: req.requestType,
          sender: req.senderName,
          status: req.status,
          position: req.metadata?.position,
          message: req.message?.substring(0, 30) + '...'
        })) || [],
        centerId
      });

      setRequests(response.requests || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load requests';
      setError(errorMessage);
      console.error('❌ CENTER FAILED TO LOAD REQUESTS:', {
        error: err,
        centerId,
        errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, message?: string) => {
    setActionLoading(requestId);

    try {
      console.log('✅ CENTER APPROVING REQUEST:', {
        requestId,
        centerId,
        centerName,
        message,
        expectedOutcome: 'Doctor should be added to center staff'
      });

      await discoveryService.respondToRequest(requestId, 'approve', message);

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'approved' as any }
          : req
      ));

      toast.success('Request approved! Doctor has been added to your staff.');
      setShowResponseDialog(false);
      setSelectedRequest(null);
      setResponseMessage('');

      console.log('✅ CENTER REQUEST APPROVED SUCCESSFULLY:', {
        requestId,
        centerId,
        nextSteps: 'Doctor should now be able to book appointments at this center'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve request';
      console.error('❌ CENTER FAILED TO APPROVE REQUEST:', {
        error: err,
        requestId,
        centerId,
        errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string, message?: string) => {
    setActionLoading(requestId);

    try {
      console.log('❌ CENTER REJECTING REQUEST:', {
        requestId,
        centerId,
        centerName,
        message,
        expectedOutcome: 'Request should be marked as rejected'
      });

      await discoveryService.respondToRequest(requestId, 'reject', message);

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'rejected' as any }
          : req
      ));

      toast.success('Request rejected.');
      setShowResponseDialog(false);
      setSelectedRequest(null);
      setResponseMessage('');

      console.log('❌ CENTER REQUEST REJECTED SUCCESSFULLY:', {
        requestId,
        centerId
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject request';
      console.error('❌ CENTER FAILED TO REJECT REQUEST:', {
        error: err,
        requestId,
        centerId,
        errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleInviteStaff = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsInviting(true);
    try {
      await invitationService.createInvitation({
        email: inviteEmail,
        invitationType: 'staff_invitation',
        role: inviteRole,
        centerId: centerId,
        message: inviteMessage || `You have been invited to join ${centerName} on Unlimited Health.`
      });

      toast.success(`Invitation sent to ${inviteEmail}`);
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteMessage('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send invitation';
      toast.error(errorMessage);
    } finally {
      setIsInviting(false);
    }
  };

  const openResponseDialog = (request: Request) => {
    setSelectedRequest(request);
    setResponseMessage('');
    setShowResponseDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'staff_invitation':
        return 'bg-indigo-100 text-indigo-800';
      case 'connection':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' ||
      request.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.metadata?.position && typeof request.metadata.position === 'string' && request.metadata.position.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.requestType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');
  const approvedRequests = filteredRequests.filter(req => req.status === 'approved');
  const rejectedRequests = filteredRequests.filter(req => req.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Staff Requests
          </h2>
          <p className="text-gray-600">
            Manage staff invitations for {centerName}
          </p>
        </div>
        <Button onClick={loadRequests} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button onClick={() => setShowInviteDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Staff
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, position, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="staff_invitation">Staff Invitations</SelectItem>
                  <SelectItem value="connection">Connections</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quick Stats</Label>
              <div className="flex gap-2 text-sm">
                <Badge variant="outline">{pendingRequests.length} Pending</Badge>
                <Badge variant="outline" className="text-green-600">{approvedRequests.length} Approved</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Debug Information</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>Center ID: {centerId}</p>
            <p>Total Requests: {requests.length}</p>
            <p>Pending: {pendingRequests.length}</p>
            <p>Approved: {approvedRequests.length}</p>
            <p>Rejected: {rejectedRequests.length}</p>
            <p>Check browser console for detailed request flow logs</p>
          </div>
        </CardContent>
      </Card>

      {/* Requests Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Pending Requests
                  </h3>
                  <p className="text-gray-600">
                    New staff requests will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={(request as any).senderAvatar} />
                          <AvatarFallback>
                            {getInitials(request.senderName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.senderName}
                            </h3>
                            <Badge className={getRequestTypeColor(request.requestType)}>
                              {request.requestType === 'staff_invitation' ? 'Staff Invitation' :
                                'Connection Request'}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>

                          {request.metadata?.position && typeof request.metadata.position === 'string' ? (
                            <p className="text-sm text-blue-600 font-medium mb-2">
                              Position: {request.metadata.position}
                            </p>
                          ) : null}

                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {request.message}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </span>
                            <span>•</span>
                            <span>{request.senderEmail}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResponseDialog(request)}
                          disabled={actionLoading === request.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Respond
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {approvedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Approved Requests
                  </h3>
                  <p className="text-gray-600">
                    Approved staff members will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvedRequests.map((request) => (
                <Card key={request.id} className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={(request as any).senderAvatar} />
                        <AvatarFallback>
                          {getInitials(request.senderName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.senderName}
                          </h3>
                          <Badge className="bg-green-100 text-green-800">
                            Approved
                          </Badge>
                        </div>

                        {request.metadata?.position && typeof request.metadata.position === 'string' ? (
                          <p className="text-sm text-green-600 font-medium mb-1">
                            Position: {request.metadata.position}
                          </p>
                        ) : null}

                        <p className="text-sm text-gray-600">
                          Added to staff on {formatDistanceToNow(new Date(request.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="space-y-4">
            {rejectedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Rejected Requests
                  </h3>
                  <p className="text-gray-600">
                    Rejected requests will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              rejectedRequests.map((request) => (
                <Card key={request.id} className="bg-red-50 border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={(request as any).senderAvatar} />
                        <AvatarFallback>
                          {getInitials(request.senderName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.senderName}
                          </h3>
                          <Badge className="bg-red-100 text-red-800">
                            Rejected
                          </Badge>
                        </div>

                        {request.metadata?.position && typeof request.metadata.position === 'string' ? (
                          <p className="text-sm text-red-600 font-medium mb-1">
                            Position: {request.metadata.position}
                          </p>
                        ) : null}

                        <p className="text-sm text-gray-600">
                          Rejected on {formatDistanceToNow(new Date(request.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest && (
                <>
                  {selectedRequest.status === 'pending' ? 'Respond to Request' : 'Request Details'}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={(selectedRequest as any).senderAvatar} />
                  <AvatarFallback>
                    {getInitials(selectedRequest.senderName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedRequest.senderName}</h3>
                  <p className="text-sm text-gray-600">{selectedRequest.senderEmail}</p>
                  {selectedRequest.metadata?.position && typeof selectedRequest.metadata.position === 'string' ? (
                    <p className="text-sm text-blue-600 font-medium">
                      Position: {selectedRequest.metadata.position}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Message</Label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {selectedRequest.message}
                </p>
              </div>

              <div>
                <Label htmlFor="response-message">Response Message (Optional)</Label>
                <Textarea
                  id="response-message"
                  placeholder="Add a personal message..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowResponseDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest.id, responseMessage)}
                  disabled={actionLoading === selectedRequest.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(selectedRequest.id, responseMessage)}
                  disabled={actionLoading === selectedRequest.id}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Staff Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              Invite New Staff
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Professional Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="doctor@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="rounded-xl"
              />
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                They will receive a secure link to create their account.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Designated Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="invite-role" className="rounded-xl">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Medical Doctor</SelectItem>
                  <SelectItem value="staff">Secretary / Receptionist</SelectItem>
                  <SelectItem value="nurse">Nursing Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-message">Personalized Message (Optional)</Label>
              <Textarea
                id="invite-message"
                placeholder="e.g. Welcome to our hospital team!"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="rounded-xl"
                rows={3}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-3">
              <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Staff login details are generated uniquely for each person to ensure
                <span className="font-bold text-gray-700"> bilateral accountability</span> and data access tracking (NHS Standard).
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowInviteDialog(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteStaff}
              disabled={isInviting}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold shadow-lg shadow-blue-100"
            >
              {isInviting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Send Secure Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
