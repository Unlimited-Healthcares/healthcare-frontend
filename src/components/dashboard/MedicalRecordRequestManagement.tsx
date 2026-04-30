import { useState, useEffect } from 'react';
import { Card, CardContent} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building, 
  Filter,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface MedicalRecordRequestManagementProps {
  centerId: string;
}

interface MedicalRecordRequest {
  id: string;
  patientId: string;
  patientName: string;
  fromCenterId: string;
  fromCenterName: string;
  toCenterId: string;
  toCenterName: string;
  purpose: string;
  requestedAccessLevel: string;
  requestedDurationDays: number;
  specificRecords: Record<string, unknown>;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requestDate: string;
}

interface RequestData {
  incoming: MedicalRecordRequest[];
  outgoing: MedicalRecordRequest[];
}

import medicalRecordService from '@/services/medicalRecordService';

export function MedicalRecordRequestManagement({ centerId }: MedicalRecordRequestManagementProps) {
  const [activeTab, setActiveTab] = useState('incoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<RequestData>({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const [incoming, outgoing] = await Promise.all([
          medicalRecordService.listMedicalRecordRequests({ center_id: centerId, direction: 'incoming' }),
          medicalRecordService.listMedicalRecordRequests({ center_id: centerId, direction: 'outgoing' })
        ]);
        
        const mapRequest = (r: any): MedicalRecordRequest => ({
          id: r.id,
          patientId: r.patient_id,
          patientName: r.patient_name || 'Unknown Patient',
          fromCenterId: r.from_center_id,
          fromCenterName: r.from_center_name || 'N/A',
          toCenterId: r.to_center_id,
          toCenterName: r.to_center_name || 'N/A',
          purpose: r.purpose || 'Not specified',
          requestedAccessLevel: r.requested_access_level || 'read',
          requestedDurationDays: r.requested_duration_days || 0,
          specificRecords: r.specific_records || {},
          status: r.status,
          requestDate: r.created_at || r.requestDate
        });

        setRequests({
          incoming: (incoming as any[]).map(mapRequest),
          outgoing: (outgoing as any[]).map(mapRequest)
        });
      } catch (error) {
        console.error('Failed to fetch medical record requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [centerId]);

  const handleApproveRequest = async (requestId: string) => {
    toast.success('Request approved successfully');
    console.log('Approving request:', requestId);
  };

  const handleRejectRequest = async (requestId: string) => {
    toast.success('Request rejected');
    console.log('Rejecting request:', requestId);
  };

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
      case 'expired': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filterRequests = (requestList: MedicalRecordRequest[]) => {
    if (!searchTerm) return requestList;
    return requestList.filter(request => 
      request.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.fromCenterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.toCenterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600 mx-auto"></div>
          <p className="mt-2">Loading requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Incoming ({requests.incoming.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Outgoing ({requests.outgoing.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-4">
          <div className="space-y-3">
            {filterRequests(requests.incoming).map(request => (
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
                          Duration: {request.requestedDurationDays} days
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Access: {request.requestedAccessLevel}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm"><strong>Purpose:</strong> {request.purpose}</p>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filterRequests(requests.incoming).length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No incoming requests found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="outgoing" className="mt-4">
          <div className="space-y-3">
            {filterRequests(requests.outgoing).map(request => (
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
                          To: {request.toCenterName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Requested: {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Duration: {request.requestedDurationDays} days
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Access: {request.requestedAccessLevel}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm"><strong>Purpose:</strong> {request.purpose}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filterRequests(requests.outgoing).length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No outgoing requests found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
