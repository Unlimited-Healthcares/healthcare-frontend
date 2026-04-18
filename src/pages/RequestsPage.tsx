import React, { useState, useEffect } from 'react';
import { Inbox, Send, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { RequestCard } from '@/components/requests/RequestCard';
import { discoveryService } from '@/services/discoveryService';
import { Request } from '@/types/discovery';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);
  const [sentRequests, setSentRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Pagination state
  const [receivedCurrentPage, setReceivedCurrentPage] = useState(1);
  const [sentCurrentPage, setSentCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load requests
  const loadRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load received and sent requests separately to handle individual failures
      const receivedPromise = discoveryService.getReceivedRequests({ status: statusFilter === 'all' ? undefined : statusFilter })
        .catch(err => {
          console.error('Failed to load received requests:', err);
          toast.error('Failed to load received requests');
          return { requests: [] };
        });

      const sentPromise = discoveryService.getSentRequests({ status: statusFilter === 'all' ? undefined : statusFilter })
        .catch(err => {
          console.error('Failed to load sent requests:', err);
          toast.error('Failed to load sent requests');
          return { requests: [] };
        });

      const [receivedResponse, sentResponse] = await Promise.all([receivedPromise, sentPromise]);

      setReceivedRequests(receivedResponse.requests || []);
      setSentRequests(sentResponse.requests || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load requests';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle request actions
  const handleApprove = async (requestId: string, message?: string, metadata?: Record<string, any>) => {
    try {
      // Find the request to check its type
      const request = [...receivedRequests, ...sentRequests].find(req => req.id === requestId);
      const isPatientRequest = request?.requestType === 'patient_request';
      const centerIdFromMetadata =
        request && request.metadata && typeof request.metadata === 'object'
          ? ((request.metadata as any).centerId || (request.metadata as any).center_id)
          : undefined;

      await discoveryService.respondToRequest(requestId, 'approve', message, metadata);

      if (isPatientRequest) {
        // Handle patient request approval redirect
        const userRole = user?.roles?.[0] || 'patient';

        if (userRole === 'center' || userRole === 'admin') {
          // Center user - redirect to center patients page
          toast.success('🎉 Patient request approved! Redirecting to patients page...', {
            duration: 3000,
          });
          setTimeout(() => {
            navigate('/center/patients');
          }, 2500);
        } else if (userRole === 'doctor' || userRole === 'nurse' || userRole === 'staff') {
          // Individual provider - redirect to personal patients page
          toast.success('🎉 Patient request approved! Redirecting to your patients page...', {
            duration: 3000,
          });
          setTimeout(() => {
            navigate('/me/patients');
          }, 2500);
        } else {
          // Fallback for other roles
          toast.success('Patient request approved successfully!');
        }
      } else {
        toast.success('Request approved successfully!');
      }

      loadRequests(); // Refresh the list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve request';
      toast.error(errorMessage);
    }
  };

  const handleReject = async (requestId: string, message?: string) => {
    try {
      await discoveryService.respondToRequest(requestId, 'reject', message);
      toast.success('Request rejected');
      loadRequests(); // Refresh the list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject request';
      toast.error(errorMessage);
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await discoveryService.cancelRequest(requestId);
      toast.success('Request cancelled');
      loadRequests(); // Refresh the list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel request';
      toast.error(errorMessage);
    }
  };

  const handleConfirm = async (requestId: string) => {
    try {
      await discoveryService.confirmRequest(requestId);
      toast.success('🎉 Appointment confirmed! See you then.');
      loadRequests();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm appointment';
      toast.error(errorMessage);
    }
  };

  const handleDeclineResponse = async (requestId: string) => {
    try {
      await discoveryService.declineResponse(requestId);
      toast.success('Proposed schedule declined');
      loadRequests();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to decline schedule';
      toast.error(errorMessage);
    }
  };

  const handleViewProfile = (userId: string) => {
    window.open(`/profile/${userId}`, '_blank');
  };

  // Filter requests
  const filterRequests = (requests: Request[]) => {
    return requests.filter(request => {
      const matchesSearch = searchTerm === '' ||
        request.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.sender?.publicId && request.sender.publicId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.recipient?.publicId && request.recipient.publicId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'all' || request.requestType === typeFilter;

      return matchesSearch && matchesType;
    });
  };

  const filteredReceivedRequests = filterRequests(receivedRequests);
  const filteredSentRequests = filterRequests(sentRequests);

  // Pagination logic
  const getPaginatedRequests = (requests: Request[], currentPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return requests.slice(startIndex, endIndex);
  };

  const getTotalPages = (requests: Request[]) => {
    return Math.ceil(requests.length / itemsPerPage);
  };

  // Paginated requests
  const paginatedReceivedRequests = getPaginatedRequests(filteredReceivedRequests, receivedCurrentPage);
  const paginatedSentRequests = getPaginatedRequests(filteredSentRequests, sentCurrentPage);

  // Total pages
  const receivedTotalPages = getTotalPages(filteredReceivedRequests);
  const sentTotalPages = getTotalPages(filteredSentRequests);

  // Handle page changes
  const handleReceivedPageChange = (page: number) => {
    setReceivedCurrentPage(page);
  };

  const handleSentPageChange = (page: number) => {
    setSentCurrentPage(page);
  };

  // Load requests on component mount and when filters change
  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setReceivedCurrentPage(1);
    setSentCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  // Get request counts
  const receivedCount = receivedRequests.length;
  const sentCount = sentRequests.length;
  const pendingReceivedCount = receivedRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connection Requests
          </h1>
          <p className="text-gray-600">
            Manage your professional connections and collaboration requests.
          </p>
        </div>

        {/* Summary Stats - Hidden on mobile */}
        <div className="mb-6 hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{receivedCount}</div>
              <div className="text-sm text-gray-600">Total Received</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingReceivedCount}</div>
              <div className="text-sm text-gray-600">Pending Approval</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{sentCount}</div>
              <div className="text-sm text-gray-600">Total Sent</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, message, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full min-w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full min-w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="connection">Connection</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="patient_request">Patient Request</SelectItem>
                    <SelectItem value="staff_invitation">Staff Invitation</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="consultation_request">Consultation Request</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={loadRequests}
                  disabled={loading}
                  className="flex-shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Received
              {pendingReceivedCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingReceivedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-6">
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading received requests...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-red-600 mb-4">{error}</p>
                      <Button onClick={loadRequests} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredReceivedRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Received Requests
                      </h3>
                      <p className="text-gray-600">
                        You don't have any received requests at the moment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {paginatedReceivedRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onCancel={handleCancel}
                      onConfirm={handleConfirm}
                      onDeclineResponse={handleDeclineResponse}
                      onViewProfile={handleViewProfile}
                      isReceived={true}
                    />
                  ))}

                  {/* Pagination for Received Requests */}
                  {receivedTotalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={receivedCurrentPage}
                        totalPages={receivedTotalPages}
                        onPageChange={handleReceivedPageChange}
                        className="mb-4"
                      />

                      {/* Results Summary */}
                      <div className="text-center text-gray-600">
                        <p>
                          Showing {paginatedReceivedRequests.length} of {filteredReceivedRequests.length} received requests
                          {receivedCurrentPage > 1 && ` (Page ${receivedCurrentPage} of ${receivedTotalPages})`}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading sent requests...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-red-600 mb-4">{error}</p>
                      <Button onClick={loadRequests} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredSentRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Sent Requests
                      </h3>
                      <p className="text-gray-600">
                        You haven't sent any requests yet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {paginatedSentRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onCancel={handleCancel}
                      onConfirm={handleConfirm}
                      onDeclineResponse={handleDeclineResponse}
                      onViewProfile={handleViewProfile}
                      isReceived={false}
                    />
                  ))}

                  {/* Pagination for Sent Requests */}
                  {sentTotalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={sentCurrentPage}
                        totalPages={sentTotalPages}
                        onPageChange={handleSentPageChange}
                        className="mb-4"
                      />

                      {/* Results Summary */}
                      <div className="text-center text-gray-600">
                        <p>
                          Showing {paginatedSentRequests.length} of {filteredSentRequests.length} sent requests
                          {sentCurrentPage > 1 && ` (Page ${sentCurrentPage} of ${sentTotalPages})`}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RequestsPage;
