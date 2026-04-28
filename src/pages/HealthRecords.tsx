import { useMemo, useState } from 'react';
import { Plus, FileText, Share2, Bell, TrendingUp, Activity, Pill, Filter, Download as DownloadIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ViewToggle } from '@/components/medical-records/ViewToggle';
import { CategoryTree } from '@/components/medical-records/CategoryTree';
import { SearchFilters } from '@/components/medical-records/SearchFilters';
import { RecordCard } from '@/components/medical-records/RecordCard';
import { useHealthRecords, useCategoryHierarchy, useDashboardStats, useCreateHealthRecord, useUploadFile, useHealthRecord } from '@/hooks/useHealthRecords';
import { Button } from '@/components/ui/button';
import { SearchFilters as SearchFiltersType } from '@/types/health-records';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MedicalRecordForm } from '@/components/medical-records/MedicalRecordForm';
import { MedicalRecordViewer } from '@/components/medical-records/MedicalRecordViewer';
import { ClinicalEncounterDashboard } from '@/components/medical-records/ClinicalEncounterDashboard';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Preferences } from '@capacitor/preferences';
import { ClinicalSecurityGate } from '@/components/medical-records/ClinicalSecurityGate';
import { discoveryService } from '@/services/discoveryService';

/**
 * RecordViewerWrapper fetches a medical record by ID and displays it using MedicalRecordViewer.
 * It includes a ClinicalSecurityGate to ensure identity verification before decryption.
 */
const RecordViewerWrapper = ({ recordId, onClose }: { recordId: string; onClose: () => void }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { data: recordData, isLoading, error } = useHealthRecord(recordId);

  if (!isUnlocked) {
    return (
      <ClinicalSecurityGate
        onUnlock={() => setIsUnlocked(true)}
        onCancel={onClose}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Decrypting Clinical Stream...</p>
      </div>
    );
  }

  if (error || !recordData) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-bold">Failed to load medical record</p>
        <Button onClick={onClose} variant="outline" className="border-gray-300 text-gray-700">Close</Button>
      </div>
    );
  }

  // Ensure recordData matches the structure expected by MedicalRecordViewer
  // Some APIs wrap response in a 'data' field
  const record = (recordData as any).data || recordData;

  return (
    <div className="max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
      <MedicalRecordViewer record={record} />
      <div className="mt-8 flex justify-end">
        <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-700 hover:bg-gray-50 px-8 rounded-xl font-bold">
          Close Viewer
        </Button>
      </div>
    </div>
  );
};

export default function HealthRecords() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);
  const [encounterOpen, setEncounterOpen] = useState(false);
  const [initialEncounterStep, setInitialEncounterStep] = useState(1);

  const { user } = useAuth();
  const createRecord = useCreateHealthRecord();
  const uploadFile = useUploadFile();

  // API hooks with demo fallback
  const apiFilters = {
    ...filters,
    query: searchQuery,
    categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined
  };

  const { data: recordsData, isLoading: apiLoading, error: apiError } = useHealthRecords({
    page: 1,
    limit: 20,
    filters: apiFilters
  });

  const { data: apiCategories } = useCategoryHierarchy();
  const { data: apiStats } = useDashboardStats();

  // Use API data only
  const records = useMemo(() => {
    return (recordsData?.data || []).map((record: any) => ({
      ...record,
      patientName: record.patient ? `${record.patient.firstName} ${record.patient.lastName}` : 'Private Patient',
      recordDate: record.createdAt,
    }));
  }, [recordsData]);

  const categories = apiCategories || [];
  const stats = apiStats || { totalRecords: 0, sharedRecords: 0, pendingRequests: 0, recentActivity: 0 };

  const startEncounter = (step: number = 1) => {
    setInitialEncounterStep(step);
    setEncounterOpen(true);
  };

  // If API is loading
  const isLoading = apiLoading;
  const error = apiError;

  const canCreateRecords = useMemo(() => {
    const roles = (user as any)?.roles || [];
    return roles.includes('admin') || roles.includes('doctor') || roles.includes('healthcare_provider') || roles.includes('nurse');
  }, [user]);

  // Format stats for display
  const displayStats = [
    {
      label: 'Total Records',
      value: stats.totalRecords || records.length,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      label: 'Shared Records',
      value: stats.sharedRecords || 0,
      icon: Share2,
      color: 'text-green-600'
    },
    {
      label: 'Pending Requests',
      value: stats.pendingRequests || 0,
      icon: Bell,
      color: 'text-orange-600'
    },
    {
      label: 'Recent Activity',
      value: stats.recentActivity || 0,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const handleCreateRecord = () => {
    if (!canCreateRecords) {
      toast.error('You do not have permission to create medical records.');
      return;
    }
    setCreateOpen(true);
  };

  const handleSubmitCreate = async (data: { title: string; description: string; recordType: string; category: string; tags: string[]; files?: File[]; patientId: string; centerId?: string }) => {
    if (!canCreateRecords) {
      toast.error('You do not have permission to create medical records.');
      return;
    }

    // Validate required fields
    if (!data.patientId) {
      toast.error('Please select a patient');
      return;
    }

    if (!data.title.trim()) {
      toast.error('Please enter a record title');
      return;
    }

    if (!data.recordType) {
      toast.error('Please select a record type');
      return;
    }

    // Validate that the patient ID is valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.patientId)) {
      toast.error('Invalid patient ID format. Please select a patient from the dropdown.');
      return;
    }

    // Helper to validate UUID
    const isValidUUID = (id: any) => 
      typeof id === 'string' && uuidRegex.test(id) && id.toLowerCase() !== 'centerid' && id.toLowerCase() !== 'default-center';

    // Get centerId from user profile or data, prioritizing valid UUIDs
    let centerId = data.centerId || (user as any)?.center_id || (user as any)?.centerId;
    
    // Smart Lookup Fallback: If still no centerId, try to find an approved connection
    if (!isValidUUID(centerId)) {
      try {
        console.log('🔍 Smart Lookup: No primary centerId, checking connections...');
        const connections = await discoveryService.getSentRequests({ status: 'approved', limit: 10 });
        const centerConnection = connections.requests.find(r => r.recipientType === 'center' || r.requestType?.includes('center'));
        if (centerConnection && isValidUUID(centerConnection.recipientId)) {
          centerId = centerConnection.recipientId;
          console.log('✅ Smart Lookup: Found connection centerId:', centerId);
        }
      } catch (e) {
        console.warn('Smart lookup failed:', e);
      }
    }

    if (!isValidUUID(centerId)) {
      toast.error('Healthcare facility identification failed. Please link your profile to a center in Discovery or Settings.');
      return;
    }

    // Map form data to backend DTO structure
    const payload = {
      patientId: data.patientId,
      centerId: centerId, // Use the resolved centerId
      createdBy: user?.id, // Add the current user as creator
      recordType: data.recordType,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      isSensitive: false,
      isShareable: true,
      recordData: {
        vitals: (data as any).vitals
      },
      fileAttachments: Array.isArray(data.files) ? data.files.map(file => file.name) : []
    };

    console.log('Creating medical record with payload:', payload);

    try {
      const response = await createRecord.mutateAsync(payload as any);
      const recordId = (response as any)?.data?.id || (response as any)?.id;

      console.log('Record created, ID:', recordId);

      if (recordId && Array.isArray(data.files) && data.files.length) {
        toast.info(`Uploading ${data.files.length} attachment(s)...`);
        for (const file of data.files) {
          await uploadFile.mutateAsync({ recordId, file, tags: data.tags, description: data.description });
        }
      }
      toast.success('Record created successfully');
      if (recordId) {
        setViewingRecordId(recordId);
      }

      return response;
    } catch (e: any) {
      console.error('Create record error:', e);

      // Handle specific error cases
      if (e.message?.includes('foreign key constraint')) {
        toast.error('Invalid patient selected. Please ensure the patient exists and you have permission to create records for them.');
      } else if (e.message?.includes('permission')) {
        toast.error('You do not have permission to create records for this patient.');
      } else {
        toast.error(e?.message || 'Failed to create record. Please try again.');
      }
    }
  };

  const handleViewRecord = async (id: string) => {
    setViewingRecordId(id);
  };

  const handleEditRecord = (id: string) => {
    // TODO: Navigate to edit record page
    console.log('Edit record:', id);
  };

  const handleShareRecord = (id: string) => {
    // TODO: Open share record modal
    console.log('Share record:', id);
  };

  const handleDownloadRecord = (id: string) => {
    // TODO: Download record
    console.log('Download record:', id);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };


  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen bg-gray-50">
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center py-12">
                  <div className="text-gray-600 text-lg font-medium mb-2">Loading Records...</div>
                  <p className="text-gray-500">Please wait while we fetch your health records</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-screen bg-gray-50">
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center py-12">
                  <div className="text-red-600 text-lg font-medium mb-2">Error Loading Records</div>
                  <p className="text-gray-600">{(error as Error).message}</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full bg-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Page Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-3">
                    Clinical Records
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full backdrop-blur-xl">
                      v4.0 Enterprise
                    </Badge>
                  </h1>
                  <p className="text-slate-500 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
                    Orchestrate high-fidelity diagnostics, encrypted prescriptions, and unified care history across the clinical matrix.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => startEncounter(1)}
                    className="bg-primary hover:bg-primary/90 text-white font-black px-6 h-12 rounded-2xl shadow-premium transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
                  >
                    <Activity className="h-5 w-5 group-hover:animate-pulse" />
                    <span className="hidden sm:inline">Diagnostic Charting</span>
                    <span className="sm:hidden text-xs">Diagnostic</span>
                  </Button>
                  <Button
                    onClick={() => startEncounter(3)}
                    className="bg-secondary hover:bg-secondary/90 text-white font-black px-6 h-12 rounded-2xl shadow-premium transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
                  >
                    <Pill className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span className="hidden sm:inline">Prescription Auth</span>
                    <span className="sm:hidden text-xs">Prescription</span>
                  </Button>
                  <Button
                    onClick={handleCreateRecord}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 h-12 rounded-2xl shadow-premium transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="hidden sm:inline">Archive New</span>
                    <span className="sm:hidden text-xs">Archive</span>
                  </Button>
                </div>
              </div>

              {/* Advanced Stats Architecture */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayStats.map((stat, index) => {
                  const Icon = stat.icon;
                  const gColor = index === 0 ? 'from-blue-500/20' : index === 1 ? 'from-emerald-500/20' : index === 2 ? 'from-amber-500/20' : 'from-indigo-500/20';
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group"
                    >
                      <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-200/60 shadow-soft group-hover:shadow-premium transition-all relative overflow-hidden h-full">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gColor} to-transparent rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500`} />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <div className={`p-2.5 rounded-2xl bg-white shadow-inner border border-slate-100`}>
                            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                          </div>
                          <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            Real-time
                          </div>
                        </div>
                        <div className="relative z-10">
                          <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">{stat.value}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
                {/* Global Filters & Categories */}
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-slate-50/50 rounded-3xl p-1 border border-slate-100">
                    <CategoryTree
                      categories={categories}
                      selectedCategories={selectedCategories}
                      onCategorySelect={handleCategorySelect}
                    />
                  </div>

                  <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                    <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> System Health
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      All clinical nodes are currently synchronized. Records are encrypted with AES-256 standards.
                    </p>
                  </div>
                </div>

                {/* Intelligent Workspace */}
                <div className="md:col-span-3 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                      <SearchFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onSearch={handleSearch}
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                      <ViewToggle view={view} onViewChange={setView} />
                      <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-500">
                        <DownloadIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Dynamic Records Matrix */}
                  <div className="bg-slate-50/30 backdrop-blur-md rounded-[32px] border border-slate-200/50 p-2 sm:p-4 min-h-[600px] relative">
                    {records.length === 0 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-soft flex items-center justify-center mb-6">
                          <FileText className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">No results detected</h3>
                        <p className="text-slate-500 max-w-sm mb-8 font-medium">
                          The neural search engine couldn't find any records matching your current matrix parameters.
                        </p>
                        <Button
                          onClick={() => { setFilters({}); setSearchQuery(''); setSelectedCategories([]) }}
                          variant="outline"
                          className="rounded-2xl h-12 px-8 font-black border-slate-200 hover:bg-slate-50"
                        >
                          Reset Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between px-4 py-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                            Matrix Analysis: {records.length} Nodes Found
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase">Live Sync</span>
                          </div>
                        </div>

                        <div className={view === 'grid'
                          ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 p-2'
                          : 'space-y-4 p-2'
                        }>
                          <AnimatePresence mode="popLayout">
                            {records.map((record: any, idx: number) => (
                              <motion.div
                                key={record.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <RecordCard
                                  record={record}
                                  onView={handleViewRecord}
                                  onEdit={handleEditRecord}
                                  onShare={handleShareRecord}
                                  onDownload={handleDownloadRecord}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </motion.div>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl bg-white max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">New Medical Record</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
            <MedicalRecordForm
              onSubmit={handleSubmitCreate}
              onCancel={() => setCreateOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Medical Record Viewer Dialog */}
      <Dialog open={!!viewingRecordId} onOpenChange={(open) => !open && setViewingRecordId(null)}>
        <DialogContent className="max-w-4xl p-6 bg-white overflow-hidden">
          {viewingRecordId && <RecordViewerWrapper recordId={viewingRecordId} onClose={() => setViewingRecordId(null)} />}
        </DialogContent>
      </Dialog>

      {/* Clinical Encounter Dialog */}
      <Dialog open={encounterOpen} onOpenChange={setEncounterOpen}>
        <DialogContent className="max-w-none w-full md:max-w-6xl md:w-[95vw] h-full md:h-[90dvh] p-0 bg-gray-50 overflow-hidden border-none md:rounded-[3rem] shadow-none md:shadow-2xl">
          <ClinicalEncounterDashboard
            patient={undefined}
            initialStep={initialEncounterStep}
            onComplete={(id) => {
              setEncounterOpen(false);
              setViewingRecordId(id);
            }}
            onCancel={() => setEncounterOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
