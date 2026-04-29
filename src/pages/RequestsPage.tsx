import React, { useState, useEffect } from 'react';
import { Inbox, Send, Search, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
    <div className="requests-page-container w-full min-h-screen bg-white md:bg-gray-50/50 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
                <Inbox className="h-7 w-7 md:h-10 md:w-10 text-blue-600" />
                Collaboration <span className="text-blue-600">Requests</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-2 max-w-2xl mx-auto md:mx-0">
                Manage your professional connections and clinical collaboration requests.
              </p>
            </div>
            
            {/* Desktop Quick Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-center min-w-[120px]">
                <div className="text-2xl font-black text-blue-600 leading-none">{receivedCount}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Received</div>
              </div>
              <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-center min-w-[120px]">
                <div className="text-2xl font-black text-emerald-600 leading-none">{sentCount}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Sent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search name or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 md:w-40 h-12 bg-white rounded-xl border-slate-200 shadow-sm text-xs font-bold uppercase tracking-wider min-w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="flex-1 md:w-48 h-12 bg-white rounded-xl border-slate-200 shadow-sm text-xs font-bold uppercase tracking-wider min-w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="connection">Connection</SelectItem>
                <SelectItem value="collaboration">Collaboration</SelectItem>
                <SelectItem value="patient_request">Patient Request</SelectItem>
                <SelectItem value="staff_invitation">Staff Invitation</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={loadRequests}
              disabled={loading}
              className="h-12 w-12 rounded-xl border-slate-200 bg-white hover:bg-slate-50 shadow-sm flex-shrink-0"
            >
              <RefreshCw className={cn("h-5 w-5 text-slate-600", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 p-1.5 rounded-2xl h-14 md:h-16 mb-8 max-w-md mx-auto md:mx-0">
            <TabsTrigger 
              value="received" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-2"
            >
              <Inbox className="h-4 w-4" />
              Received
              {pendingReceivedCount > 0 && (
                <Badge className="ml-1 bg-rose-500 text-white border-none h-5 min-w-5 rounded-full flex items-center justify-center p-0 text-[10px]">
                  {pendingReceivedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="sent" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg transition-all text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-0 outline-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Received Requests...</p>
              </div>
            ) : error ? (
              <Card className="border-rose-100 bg-rose-50/50 rounded-3xl overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Sync Interrupted</h3>
                  <p className="text-slate-600 mb-6 max-w-xs">{error}</p>
                  <Button onClick={loadRequests} variant="outline" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-100 font-bold">
                    Retry Connection
                  </Button>
                </CardContent>
              </Card>
            ) : filteredReceivedRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                <div className="h-24 w-24 bg-white rounded-full shadow-soft flex items-center justify-center mb-6">
                  <Inbox className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Received Requests</h3>
                <p className="text-slate-500 max-w-xs">New professional connection or clinical requests will appear here once received.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
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
                </div>

                {receivedTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-10">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Page {receivedCurrentPage} of {receivedTotalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={receivedCurrentPage === 1}
                        onClick={() => handleReceivedPageChange(receivedCurrentPage - 1)}
                        className="rounded-xl h-10 px-4 font-bold border-slate-200"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={receivedCurrentPage === receivedTotalPages}
                        onClick={() => handleReceivedPageChange(receivedCurrentPage + 1)}
                        className="rounded-xl h-10 px-4 font-bold border-slate-200"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-0 outline-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Outbound Requests...</p>
              </div>
            ) : error ? (
              <Card className="border-rose-100 bg-rose-50/50 rounded-3xl overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Sync Interrupted</h3>
                  <p className="text-slate-600 mb-6 max-w-xs">{error}</p>
                  <Button onClick={loadRequests} variant="outline" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-100 font-bold">
                    Retry Connection
                  </Button>
                </CardContent>
              </Card>
            ) : filteredSentRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                <div className="h-24 w-24 bg-white rounded-full shadow-soft flex items-center justify-center mb-6">
                  <Send className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Sent Requests</h3>
                <p className="text-slate-500 max-w-xs">You haven't sent any collaboration or connection requests yet.</p>
                <Button 
                  onClick={() => navigate('/discovery')} 
                  className="mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-12 font-black uppercase tracking-widest shadow-xl shadow-blue-200"
                >
                  Discover Professionals
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
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
                </div>

                {sentTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-10">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Page {sentCurrentPage} of {sentTotalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={sentCurrentPage === 1}
                        onClick={() => handleSentPageChange(sentCurrentPage - 1)}
                        className="rounded-xl h-10 px-4 font-bold border-slate-200"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={sentCurrentPage === sentTotalPages}
                        onClick={() => handleSentPageChange(sentCurrentPage + 1)}
                        className="rounded-xl h-10 px-4 font-bold border-slate-200"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RequestsPage;
