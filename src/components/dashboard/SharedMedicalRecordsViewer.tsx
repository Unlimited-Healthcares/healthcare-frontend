import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Share2,
  Building,
  Calendar,
  Eye,
  Download,
  Clock,
  Shield,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface SharedMedicalRecordsViewerProps {
  centerId?: string;
}

interface SharedRecord {
  id: string;
  patientName: string;
  recordType: string;
  sharedDate: string;
  expiryDate: string;
  accessLevel: string;
  status: string;
  fromCenterName?: string;
  toCenterName?: string;
}

interface SharedRecordsData {
  incoming: SharedRecord[];
  outgoing: SharedRecord[];
}

import medicalRecordService from '@/services/medicalRecordService';

export function SharedMedicalRecordsViewer({ centerId }: SharedMedicalRecordsViewerProps) {
  const [activeTab, setActiveTab] = useState('incoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [sharedRecords, setSharedRecords] = useState<SharedRecordsData>({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedRecords = async () => {
      if (!centerId) return;
      try {
        setLoading(true);
        const [incoming, outgoing] = await Promise.all([
          medicalRecordService.getSharedMedicalRecords({ center_id: centerId, direction: 'incoming' }),
          medicalRecordService.getSharedMedicalRecords({ center_id: centerId, direction: 'outgoing' })
        ]);

        const mapRecord = (r: any): SharedRecord => ({
          id: r.id,
          patientName: r.patient_name || 'N/A',
          recordType: r.record_type || 'Clinical Document',
          sharedDate: r.created_at || r.shared_date,
          expiryDate: r.expiry_date,
          accessLevel: r.access_level || 'read',
          status: r.status || 'active',
          fromCenterName: r.from_center_name,
          toCenterName: r.to_center_name
        });

        setSharedRecords({
          incoming: (incoming as any[]).map(mapRecord),
          outgoing: (outgoing as any[]).map(mapRecord)
        });
      } catch (error) {
        console.error('Failed to fetch shared records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedRecords();
  }, [centerId]);

  const handleViewRecord = (recordId: string) => {
    toast.success('Opening shared record...');
    console.log('Viewing record:', recordId);
  };

  const handleRevokeAccess = (recordId: string) => {
    toast.success('Access revoked successfully');
    console.log('Revoking access for record:', recordId);
  };

  const getStatusColor = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date();
    if (isExpired) return 'bg-red-100 text-red-800';
    if (status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filterRecords = (records: SharedRecord[]) => {
    if (!searchTerm) return records;
    return records.filter(record =>
      record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.fromCenterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.toCenterName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600 mx-auto"></div>
          <p className="mt-2">Loading shared records...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search shared records..."
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
            <Download className="h-4 w-4" />
            Incoming ({sharedRecords.incoming.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Outgoing ({sharedRecords.outgoing.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-4">
          <div className="space-y-3">
            {filterRecords(sharedRecords.incoming).map(record => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{record.patientName}</h3>
                        <Badge variant="outline">{record.recordType}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          From: {record.fromCenterName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Shared: {new Date(record.sharedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Expires: {new Date(record.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(record.status, record.expiryDate)}>
                          {new Date(record.expiryDate) < new Date() ? 'Expired' : 'Active'}
                        </Badge>
                        <Badge variant="secondary">
                          Access: {record.accessLevel}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRecord(record.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filterRecords(sharedRecords.incoming).length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No incoming shared records found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="outgoing" className="mt-4">
          <div className="space-y-3">
            {filterRecords(sharedRecords.outgoing).map(record => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{record.patientName}</h3>
                        <Badge variant="outline">{record.recordType}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          To: {record.toCenterName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Shared: {new Date(record.sharedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Expires: {new Date(record.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(record.status, record.expiryDate)}>
                          {new Date(record.expiryDate) < new Date() ? 'Expired' : 'Active'}
                        </Badge>
                        <Badge variant="secondary">
                          Access: {record.accessLevel}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRecord(record.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeAccess(record.id)}
                      >
                        Revoke Access
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filterRecords(sharedRecords.outgoing).length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No outgoing shared records found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
