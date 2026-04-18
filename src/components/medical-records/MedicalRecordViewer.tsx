
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Download,
  Share,
  Eye,
  Calendar,
  User,
  Building,
  Tag,
  Clock,
  Shield,
  History,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { medicalReportsService } from '@/services/medicalReportsService';

interface MedicalRecord {
  id: string;
  title: string;
  description: string;
  recordType: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  centerId: string;
  patientId: string;
  files: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
  }>;
  shares: Array<{
    id: string;
    toCenterId: string;
    toCenterName: string;
    accessLevel: string;
    expiryDate: string;
    isActive: boolean;
  }>;
  accessLogs: Array<{
    id: string;
    accessedAt: string;
    accessedBy: string;
    accessType: string;
    centerName: string;
  }>;
}

interface MedicalRecordViewerProps {
  record: MedicalRecord;
  canEdit?: boolean;
  canShare?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
}

export function MedicalRecordViewer({
  record,
  canEdit = false,
  canShare = false,
  onEdit,
  onShare
}: MedicalRecordViewerProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      toast.loading('Generating official PDF record...');
      const digitalReport = await medicalReportsService.generateDigitalReport(record.id);

      if (digitalReport?.pdfUrl) {
        window.open(digitalReport.pdfUrl, '_blank');
        toast.success('Medical record downloaded');
      } else {
        toast.error('PDF generation not available for this record type yet');
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF record');
    } finally {
      setIsGenerating(false);
      toast.dismiss();
    }
  };

  const downloadFile = async (fileName: string) => {
    try {
      // Mock download - in real implementation, this would download from storage
      toast.success(`Downloading ${fileName}...`);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'revoked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-black text-gray-900">
                <FileText className="h-6 w-6 text-teal-600" />
                {record.title}
                <Badge className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] uppercase font-black tracking-widest">Verified Health Record</Badge>
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-mono">
                  REF: {record.id.substring(0, 8).toUpperCase()}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(record.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Created by {record.createdBy}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50 gap-2 font-bold"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
              >
                <Download className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
              {canEdit && (
                <Button variant="outline" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {canShare && (
                <Button onClick={onShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {record.recordType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
              <Badge variant="secondary">
                {record.category.replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
              {record.tags.map(tag => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>

            {record.description && (
              <div>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Clinical Description</h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">{record.description}</p>
              </div>
            )}

            {/* Vitals Display (if available in recordData) */}
            {((record as any).recordData?.vitals || (record as any).vitals) && (
              <div className="pt-2">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Clinical Vitals & Triaging
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries((record as any).recordData?.vitals || (record as any).vitals || {}).map(([key, value]) => (
                    (value as any) && (
                      <div key={key} className="bg-white border border-gray-100 shadow-sm p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase font-black text-gray-400 tracking-tight leading-none mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-bold text-gray-900 leading-none">
                          {value as React.ReactNode}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="files">Files ({record.files.length})</TabsTrigger>
          <TabsTrigger value="shares">Shares ({record.shares.length})</TabsTrigger>
          <TabsTrigger value="access">Access Log</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Record Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Record ID:</span>
                      <p className="font-mono text-sm">{record.id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Patient ID:</span>
                      <p className="font-mono text-sm">{record.patientId}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Center ID:</span>
                      <p className="font-mono text-sm">{record.centerId}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 border-b pb-2 mb-3">Timestamps</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                      <span className="text-xs text-gray-500 font-medium">CREATED</span>
                      <p className="text-xs font-bold text-gray-700 font-mono">{new Date(record.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                      <span className="text-xs text-gray-500 font-medium">SYNCHRONIZED</span>
                      <p className="text-xs font-bold text-gray-700 font-mono">{new Date(record.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 mt-4">
                  <h4 className="font-bold text-gray-900 border-b pb-2 mb-3">Sharing & Access Status</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 p-3 rounded-xl min-w-[160px]">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Shield className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase leading-none">Accessibility</p>
                        <p className="text-xs font-bold text-indigo-900 mt-1">Hospital Private</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-3 rounded-xl min-w-[160px]">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Share className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase leading-none">Sharing</p>
                        <p className="text-xs font-bold text-emerald-900 mt-1">{record.shares?.length || 0} Registered Healthcare Centers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardContent className="p-6">
              {record.files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No files attached to this record</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {record.files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.fileName}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{file.fileType.toUpperCase()}</span>
                            <span>•</span>
                            <span>{formatFileSize(file.fileSize)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(file.fileName)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shares">
          <Card>
            <CardContent className="p-6">
              {record.shares.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>This record has not been shared with any centers</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {record.shares.map(share => (
                    <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="font-medium">{share.toCenterName}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Access: {share.accessLevel}</span>
                            <span>•</span>
                            <span>Expires: {new Date(share.expiryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(share.isActive ? 'active' : 'expired')}>
                        {share.isActive ? 'Active' : 'Expired'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardContent className="p-6">
              {record.accessLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No access logs available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {record.accessLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-blue-500" />
                        <div>
                          <p className="font-medium">{log.centerName}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>By: {log.accessedBy}</span>
                            <span>•</span>
                            <span>Action: {log.accessType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.accessedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
