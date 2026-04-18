'use client';

import { useState, useEffect } from 'react';
import { FileText, Share2, Settings, Plus, Filter, AlertCircle } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { SharedMedicalRecordsViewer } from './SharedMedicalRecordsViewer';
import { PatientSharingPreferences } from './PatientSharingPreferences';
import { MedicalRecordForm } from '../medical-records/MedicalRecordForm';
import { MedicalRecordViewer } from '../medical-records/MedicalRecordViewer';
import { RequestWorkflow } from '../medical-records/RequestWorkflow';
import { medicalReportsService } from '@/services/medicalReportsService';
import { MedicalReport } from '@/types/medical-reports';

interface MedicalRecordsProps {
  centerId?: string;
  patientId?: string;
  userRole: 'center_staff' | 'patient' | 'doctor' | 'nurse' | 'staff';
  onAction?: (action: string, data?: any) => void;
  hasMedicalStaff?: boolean;
}

interface MedicalRecordData {
  title: string;
  description: string;
  recordType: string;
  category: string;
  tags: string[];
  files?: File[];
  patientId: string;
  centerId?: string;
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

interface MockRecord extends MedicalReport { }

interface MockRequest {
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
  specificRecords: { all: boolean };
  status: 'pending';
  requestDate: string;
  accessDurationDays: number;
  [key: string]: unknown;
}

export function MedicalRecords({
  centerId,
  patientId,
  userRole,
  onAction,
  hasMedicalStaff = true
}: MedicalRecordsProps) {
  const isMedicalStaff = ['center_staff', 'doctor', 'nurse', 'staff', 'admin'].includes(userRole) && hasMedicalStaff;
  const [activeTab, setActiveTab] = useState<string>(!isMedicalStaff ? 'preferences' : 'records');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MockRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<MockRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Effect to load records when patientId changes
  useEffect(() => {
    if (patientId && isMedicalStaff) {
      loadPatientRecords(patientId);
    } else if (!patientId && isMedicalStaff) {
      setRecords([]);
    }
  }, [patientId, isMedicalStaff]);

  const loadPatientRecords = async (pid: string) => {
    setIsLoading(true);
    try {
      const res = await medicalReportsService.getMedicalReports({
        patientId: pid,
        limit: 50
      });
      setRecords(res.data as any || []);
    } catch (error) {
      console.error("Failed to load records", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRecord = async (recordData: MedicalRecordData) => {
    console.log('Creating record:', recordData);
    setShowCreateForm(false);
    if (patientId) loadPatientRecords(patientId);
  };

  const handleApproveRequest = async (requestId: string, response: ApprovalResponse) => {
    console.log('Approving request:', requestId, response);
  };

  const handleRejectRequest = async (requestId: string, notes: string) => {
    console.log('Rejecting request:', requestId, notes);
  };

  const handleCreateRequest = async (request: NewRequestData) => {
    console.log('Creating request:', request);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medical Records Management</h1>
        {isMedicalStaff && (
          <div className="flex gap-3">
            <Button
              onClick={() => onAction && patientId && onAction('Create Care Task', { user: patientId })}
              variant="outline"
              className="border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold"
              disabled={!patientId}
            >
              <FileText className="h-4 w-4 mr-2" />
              Make Recommendation
            </Button>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 font-bold"
              disabled={!patientId}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Record
            </Button>
          </div>
        )}
      </div>

      {showCreateForm && (
        <MedicalRecordForm
          patientId={patientId || ''}
          centerId={centerId}
          onSubmit={handleCreateRecord}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {selectedRecord && (
        <MedicalRecordViewer
          record={{
            ...selectedRecord,
            description: selectedRecord.diagnosis || selectedRecord.notes || '',
            recordType: selectedRecord.reportType,
            category: selectedRecord.category || 'general',
            tags: selectedRecord.tags || [],
            createdAt: selectedRecord.generatedDate,
            updatedAt: selectedRecord.updatedAt,
            createdBy: selectedRecord.doctorName,
            centerId: selectedRecord.centerId,
            patientId: selectedRecord.patientId,
            files: [],
            shares: [],
            accessLogs: []
          } as any}
          canEdit={isMedicalStaff}
          canShare={isMedicalStaff}
          onEdit={() => console.log('Edit record')}
          onShare={() => console.log('Share record')}
        />
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 p-1 rounded-xl">
          {isMedicalStaff && (
            <>
              <TabsTrigger value="records" className="flex items-center rounded-lg">
                <FileText className="h-4 w-4 mr-2" />
                Records
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center rounded-lg">
                <FileText className="h-4 w-4 mr-2" />
                Requests
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="shared" className="flex items-center rounded-lg">
            <Share2 className="h-4 w-4 mr-2" />
            Shared
          </TabsTrigger>
          {!isMedicalStaff && (
            <TabsTrigger value="preferences" className="flex items-center rounded-lg">
              <Settings className="h-4 w-4 mr-2" />
              Prefs
            </TabsTrigger>
          )}
        </TabsList>

        {isMedicalStaff && (
          <TabsContent value="records" className="mt-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search medical records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl"
                  />
                </div>
                <Button variant="outline" className="rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {!hasMedicalStaff ? (
                <div className="text-center py-20 bg-red-50/30 rounded-3xl border-2 border-dashed border-red-100">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Clinical Access Restricted</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1 font-medium">
                    Ambulance teams must have a verified Doctor or Nurse present to access patient clinical history. Please update your team registry in the 'Registry' tab.
                  </p>
                </div>
              ) : !patientId ? (
                <div className="text-center py-20 bg-blue-50/30 rounded-3xl border-2 border-dashed border-blue-100">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Plus className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No Patient Selected</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                    Medical history is protected. Please select a patient from the 'Patients' tab to view their clinical records.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-12">
                  <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-gray-500 font-medium">Fetching medical history securely...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {records.length > 0 ? (
                    records.map(record => (
                      <Card key={record.id} className="cursor-pointer hover:shadow-md transition-shadow rounded-xl border-gray-100">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{record.title}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{record.diagnosis || record.notes}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                <span className="capitalize">{record.reportType.replace(/_/g, ' ')}</span>
                                <span>•</span>
                                <span>{new Date(record.generatedDate).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="font-medium text-blue-600">{record.doctorName}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50 text-blue-600 font-bold"
                              onClick={() => setSelectedRecord(record)}
                            >
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 italic">
                      No medical records found for this criteria.
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {isMedicalStaff && (
          <TabsContent value="requests" className="mt-6">
            <RequestWorkflow
              requests={[]}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onCreateRequest={handleCreateRequest}
              userRole="approver"
            />
          </TabsContent>
        )}

        <TabsContent value="shared" className="mt-6">
          <SharedMedicalRecordsViewer centerId={centerId} />
        </TabsContent>

        {!isMedicalStaff && patientId && (
          <TabsContent value="preferences" className="mt-6">
            <PatientSharingPreferences patientId={patientId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
