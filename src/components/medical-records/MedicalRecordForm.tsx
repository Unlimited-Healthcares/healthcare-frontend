import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X, Upload, FileText, Search, User, ClipboardList, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { discoveryService } from '@/services/discoveryService';

interface Patient {
  id: string;
  userId: string;
  email: string;
  roles: string[];
  profile: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
  };
  name: string;
  appointmentCount?: number;
  lastVisit?: string;
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
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
    height?: string;
    oxygenSaturation?: string;
  };
}

interface MedicalRecordFormProps {
  patientId?: string;
  centerId?: string;
  onSubmit: (record: MedicalRecordData) => any | Promise<any>;
  onCancel: () => void;
}

export function MedicalRecordForm({ patientId, centerId, onSubmit, onCancel }: MedicalRecordFormProps) {
  // useAuth profile is not used here; removed to satisfy linter
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recordType: '',
    category: '',
    tags: [] as string[],
    files: [] as File[],
    diagnosis: '',
    treatment: '',
    notes: ''
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRecordId, setCreatedRecordId] = useState<string | null>(null);
  const [localPatientId, setLocalPatientId] = useState(patientId || '');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const recordTypes = [
    'medical_history',
    'diagnostic_results',
    'radiology_results',
    'prescription',
    'consultation_notes',
    'diagnosis',
    'CLINICAL TREATMENT PLAN',
    'surgical_report',
    'discharge_summary'
  ];

  const categories = [
    'general',
    'cardiology',
    'neurology',
    'oncology',
    'pediatrics',
    'surgery',
    'emergency',
    'mental_health',
    'radiology',
    'pathology'
  ];

  // Fetch patients when component mounts or search query changes
  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        // Use the same API pattern as /me/patients route
        const response = await discoveryService.getReceivedRequests({ status: 'approved', page: 1, limit: 100 });

        // Transform approved requests into patient data (same logic as PatientsPage)
        const patientsMap = new Map<string, Patient>();

        (response.requests || []).forEach(request => {
          const sender = request.sender;
          const senderRoles = sender?.roles || [];

          // Only include users with 'patient' role
          if (!senderRoles.includes('patient')) {
            return;
          }

          const patientId = sender?.id || request.senderId;
          const existingPatient = patientsMap.get(patientId);

          if (existingPatient) {
            // If patient already exists, increment appointment count and update last visit
            existingPatient.appointmentCount = (existingPatient.appointmentCount || 0) + 1;
            if (request.respondedAt && new Date(request.respondedAt) > new Date(existingPatient.lastVisit || 0)) {
              existingPatient.lastVisit = request.respondedAt;
            }
          } else {
            // Create new patient entry
            const firstName = sender?.profile?.firstName || '';
            const lastName = sender?.profile?.lastName || '';
            const displayName = sender?.profile?.displayName || sender?.displayName || '';
            const fullName = displayName || `${firstName} ${lastName}`.trim() || 'Unknown Patient';

            patientsMap.set(patientId, {
              id: patientId,
              userId: patientId,
              email: sender?.email || '',
              roles: senderRoles,
              profile: {
                firstName,
                lastName,
                displayName
              },
              name: fullName,
              appointmentCount: 1,
              lastVisit: request.respondedAt
            });
          }
        });

        const allPatients = Array.from(patientsMap.values());

        // Filter patients based on search query
        const filteredPatients = patientSearchQuery.trim()
          ? allPatients.filter(patient =>
            patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
            patient.email.toLowerCase().includes(patientSearchQuery.toLowerCase())
          )
          : allPatients;

        setPatients(filteredPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };

    const debounceTimer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [patientSearchQuery]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setLocalPatientId(patient.id);
    setPatientSearchQuery(patient.name);
    setShowPatientDropdown(false);
  };

  const handlePatientSearchChange = (value: string) => {
    setPatientSearchQuery(value);
    setShowPatientDropdown(true);
    if (!value) {
      setSelectedPatient(null);
      setLocalPatientId('');
    }
  };

  // Load all patients on component mount
  useEffect(() => {
    const loadAllPatients = async () => {
      setLoadingPatients(true);
      try {
        const response = await discoveryService.getReceivedRequests({ status: 'approved', page: 1, limit: 100 });

        const patientsMap = new Map<string, Patient>();

        (response.requests || []).forEach(request => {
          const sender = request.sender;
          const senderRoles = sender?.roles || [];

          if (!senderRoles.includes('patient')) {
            return;
          }

          const patientId = sender?.id || request.senderId;
          const existingPatient = patientsMap.get(patientId);

          if (existingPatient) {
            existingPatient.appointmentCount = (existingPatient.appointmentCount || 0) + 1;
            if (request.respondedAt && new Date(request.respondedAt) > new Date(existingPatient.lastVisit || 0)) {
              existingPatient.lastVisit = request.respondedAt;
            }
          } else {
            const firstName = sender?.profile?.firstName || '';
            const lastName = sender?.profile?.lastName || '';
            const displayName = sender?.profile?.displayName || sender?.displayName || '';
            const fullName = displayName || `${firstName} ${lastName}`.trim() || 'Unknown Patient';

            patientsMap.set(patientId, {
              id: patientId,
              userId: patientId,
              email: sender?.email || '',
              roles: senderRoles,
              profile: {
                firstName,
                lastName,
                displayName
              },
              name: fullName,
              appointmentCount: 1,
              lastVisit: request.respondedAt
            });
          }
        });

        setPatients(Array.from(patientsMap.values()));
      } catch (error) {
        console.error('Error loading patients:', error);
        toast.error('Failed to load patients');
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };

    loadAllPatients();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedPatientId = patientId || localPatientId;

    if (!formData.title.trim() || !formData.recordType || !resolvedPatientId) {
      toast.error('Please fill in all required fields including patient selection');
      return;
    }

    setIsSubmitting(true);

    try {
      // Remove 'files' from the data sent to the backend because it's not in the DTO
      // and 'forbidNonWhitelisted' is set to true in the backend ValidationPipe.
      const { files: _, ...cleanFormData } = formData;

      // Only include vitals if at least one value is present to satisfy recordData/vitals object requirements
      const prospectiveVitals = {
        bloodPressure: (formData as any).bloodPressure,
        heartRate: (formData as any).heartRate,
        temperature: (formData as any).temperature,
        weight: (formData as any).weight,
        height: (formData as any).height,
        oxygenSaturation: (formData as any).oxygenSaturation,
      };

      // Filter out undefined/empty values
      const filteredVitals = Object.fromEntries(
        Object.entries(prospectiveVitals).filter(([_, v]) => v !== undefined && v !== '')
      );

      const response = await onSubmit({
        ...cleanFormData,
        patientId: resolvedPatientId,
        ...(centerId ? { centerId } : {}),
        vitals: Object.keys(filteredVitals).length > 0 ? filteredVitals : undefined
      });

      // If onSubmit returns an ID, we can show the success view
      if ((response as any)?.id) {
        setCreatedRecordId((response as any).id);
      } else {
        // Fallback if no ID returned but we assume success
        toast.success('Medical record created successfully');
        onCancel();
      }
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error('Failed to create medical record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        <CardTitle className="text-gray-900">Create Medical Record</CardTitle>
      </CardHeader>
      <CardContent className="bg-white p-6">
        {createdRecordId ? (
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Medical Record Created!</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                The clinical record for {selectedPatient?.name || 'the patient'} has been successfully saved and synchronized with the hospital system.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedRecordId(null);
                  setFormData({
                    title: '',
                    description: '',
                    recordType: '',
                    category: '',
                    tags: [],
                    files: [],
                    diagnosis: '',
                    treatment: '',
                    notes: ''
                  });
                }}
                className="border-gray-300 text-gray-700"
              >
                Create Another
              </Button>
              <Button
                onClick={onCancel}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Close and Finish
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {!patientId && (
              <div>
                <Label htmlFor="patientId" className="text-gray-900 font-medium">Patient *</Label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="patientId"
                      value={patientSearchQuery}
                      onChange={(e) => handlePatientSearchChange(e.target.value)}
                      placeholder="Search for patient by name..."
                      required
                      className="bg-white border-gray-300 text-gray-900 pl-10"
                      onFocus={() => setShowPatientDropdown(true)}
                    />
                  </div>

                  {showPatientDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {loadingPatients ? (
                        <div className="p-3 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mx-auto"></div>
                          <p className="mt-2 text-sm">Loading patients...</p>
                        </div>
                      ) : patients.length > 0 ? (
                        patients.map((patient) => (
                          <div
                            key={patient.id}
                            onClick={() => handlePatientSelect(patient)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-teal-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{patient.name}</p>
                                {patient.email && (
                                  <p className="text-sm text-gray-500">{patient.email}</p>
                                )}
                                {patient.appointmentCount && (
                                  <p className="text-xs text-gray-400">
                                    {patient.appointmentCount} appointment{patient.appointmentCount !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          <p className="text-sm">No patients found</p>
                          <p className="text-xs mt-1">Patients will appear here once they request appointments</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {selectedPatient && (
                  <div className="mt-2 p-2 bg-teal-50 border border-teal-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-teal-600" />
                      <span className="text-sm text-teal-800">
                        Selected: <strong>{selectedPatient.name}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-gray-900 font-medium">Record Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter record title"
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <Label htmlFor="recordType" className="text-gray-900 font-medium">Record Type *</Label>
                <Select onValueChange={(value) => handleInputChange('recordType', value)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {recordTypes.map(type => (
                      <SelectItem key={type} value={type} className="text-gray-900 hover:bg-gray-100">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clinical Triage / Vitals Section */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Clinical Triage & Vitals
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-600">Blood Pressure (mmHg)</Label>
                  <Input
                    placeholder="120/80"
                    className="h-10 text-sm bg-white"
                    onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-600">Heart Rate (bpm)</Label>
                  <Input
                    placeholder="72"
                    className="h-10 text-sm bg-white"
                    onChange={(e) => handleInputChange('heartRate', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-600">Temp (°C)</Label>
                  <Input
                    placeholder="36.5"
                    className="h-10 text-sm bg-white"
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-600">Weight (kg)</Label>
                  <Input
                    placeholder="70"
                    className="h-10 text-sm bg-white"
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-600">Height (cm)</Label>
                  <Input
                    placeholder="175"
                    className="h-10 text-sm bg-white"
                    onChange={(e) => handleInputChange('height', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-600">SpO2 (%)</Label>
                  <Input
                    placeholder="98"
                    className="h-10 text-sm bg-white"
                    onChange={(e) => handleInputChange('oxygenSaturation', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-gray-900 font-medium">Category</Label>
              <Select onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-gray-900 hover:bg-gray-100">
                      {category.replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="diagnosis" className="text-gray-900 font-medium">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                placeholder="Enter professional diagnosis"
                rows={3}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div>
              <Label htmlFor="treatment" className="text-gray-900 font-medium">Treatment & Recommendations</Label>
              <Textarea
                id="treatment"
                value={formData.treatment}
                onChange={(e) => handleInputChange('treatment', e.target.value)}
                placeholder="Enter CLINICAL TREATMENT PLAN and recommendations"
                rows={3}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-gray-900 font-medium">Additional Consultation Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any other notes from the session"
                rows={3}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-900 font-medium">Internal Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Internal notes not included in the primary report"
                rows={2}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div>
              <Label className="text-gray-900 font-medium">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-white border-gray-300 text-gray-900"
                />
                <Button type="button" onClick={addTag} className="bg-teal-600 hover:bg-teal-700 text-white">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-gray-100 text-gray-800">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-900 font-medium">File Attachments</Label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group mt-2 ${isDragging
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                  : 'border-gray-200 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-100/50'
                  }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    setFormData(prev => ({
                      ...prev,
                      files: [...prev.files, ...files]
                    }));
                  }
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                    <Upload className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {isDragging ? 'Drop files here' : 'Drop files here or click to browse'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB per file)
                    </p>
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
              </div>

              {formData.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border border-gray-300 rounded bg-white">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end sticky bottom-0 bg-white pt-4 border-t border-gray-200 mt-6">
              <Button type="button" variant="outline" onClick={onCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white">
                {isSubmitting ? 'Creating...' : 'Create Record'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
