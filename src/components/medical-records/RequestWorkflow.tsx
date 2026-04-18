import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building, 
  User, 
  Calendar,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface MedicalRecordRequest {
  id: string;
  patientId: string;
  patientName: string;
  fromCenterId: string;
  fromCenterName: string;
  toCenterId: string;
  toCenterName: string;
  purpose: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requestDate: string;
  accessDurationDays: number;
  specificRecords: { all: boolean; specific?: string[] };
  [key: string]: unknown;
}

interface ApprovalResponse {
  responseNotes: string;
  dataScope: { all: boolean } | { specific: string[] };
  accessLevel: string;
}

interface NewRequestData {
  patientId: string;
  fromCenterId: string;
  toCenterId: string;
  purpose: string;
  accessDurationDays: number;
  specificRecords: { all: boolean };
}

interface RequestWorkflowProps {
  requests: MedicalRecordRequest[];
  onApprove: (requestId: string, response: ApprovalResponse) => void;
  onReject: (requestId: string, notes: string) => void;
  onCreateRequest: (request: NewRequestData) => void;
  userRole: 'approver' | 'requester';
}

export function RequestWorkflow({ 
  requests, 
  onApprove, 
  onReject, 
  onCreateRequest, 
  userRole 
}: RequestWorkflowProps) {
  const [selectedRequest, setSelectedRequest] = useState<MedicalRecordRequest | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [dataScope, setDataScope] = useState('all');
  const [accessLevel, setAccessLevel] = useState('read');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    patientId: '',
    fromCenterId: '',
    toCenterId: '',
    purpose: '',
    accessDurationDays: 30,
    specificRecords: { all: true }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'denied': return <XCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleApprove = () => {
    if (selectedRequest) {
      onApprove(selectedRequest.id, {
        responseNotes,
        dataScope: dataScope === 'all' ? { all: true } : { specific: [] },
        accessLevel
      });
      setSelectedRequest(null);
      setResponseNotes('');
      toast.success('Request approved successfully');
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      onReject(selectedRequest.id, responseNotes);
      setSelectedRequest(null);
      setResponseNotes('');
      toast.success('Request rejected');
    }
  };

  const handleCreateRequest = () => {
    onCreateRequest(newRequest);
    setNewRequest({
      patientId: '',
      fromCenterId: '',
      toCenterId: '',
      purpose: '',
      accessDurationDays: 30,
      specificRecords: { all: true }
    });
    setShowCreateDialog(false);
    toast.success('Request created successfully');
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Medical Record Requests</h2>
        {userRole === 'requester' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Medical Record Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient ID</Label>
                    <Input
                      value={newRequest.patientId}
                      onChange={(e) => setNewRequest({...newRequest, patientId: e.target.value})}
                      placeholder="Enter patient ID"
                    />
                  </div>
                  <div>
                    <Label>Target Center</Label>
                    <Input
                      value={newRequest.toCenterId}
                      onChange={(e) => setNewRequest({...newRequest, toCenterId: e.target.value})}
                      placeholder="Enter center ID"
                    />
                  </div>
                </div>
                <div>
                  <Label>Purpose</Label>
                  <Textarea
                    value={newRequest.purpose}
                    onChange={(e) => setNewRequest({...newRequest, purpose: e.target.value})}
                    placeholder="Explain why you need access to these records"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Access Duration (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={newRequest.accessDurationDays}
                    onChange={(e) => setNewRequest({...newRequest, accessDurationDays: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRequest}>
                    Create Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.patientName}</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          From: {request.fromCenterName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Requested: {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Duration: {request.accessDurationDays} days
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          To: {request.toCenterName}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm"><strong>Purpose:</strong> {request.purpose}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingRequests.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending requests</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="space-y-3">
            {completedRequests.map(request => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.patientName}</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          From: {request.fromCenterName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Requested: {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {completedRequests.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No completed requests</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p>{selectedRequest.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Requesting Center</Label>
                  <p>{selectedRequest.fromCenterName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Request Date</Label>
                  <p>{new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Access Duration</Label>
                  <p>{selectedRequest.accessDurationDays} days</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Purpose</Label>
                <p className="mt-1 text-sm text-gray-600">{selectedRequest.purpose}</p>
              </div>

              {userRole === 'approver' && (
                <>
                  <div>
                    <Label>Data Scope</Label>
                    <Select value={dataScope} onValueChange={setDataScope}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Records</SelectItem>
                        <SelectItem value="specific">Specific Records</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Access Level</Label>
                    <Select value={accessLevel} onValueChange={setAccessLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="download">Read & Download</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Response Notes</Label>
                    <Textarea
                      value={responseNotes}
                      onChange={(e) => setResponseNotes(e.target.value)}
                      placeholder="Add any notes about this decision..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleReject}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button onClick={handleApprove}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
