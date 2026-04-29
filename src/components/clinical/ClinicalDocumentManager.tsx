import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Plus, 
  Printer, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  Stethoscope,
  ClipboardList,
  FileWarning,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { medicalRecordService } from '@/services/medicalRecordService';
import { toast } from 'react-hot-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface ClinicalDocument {
  id: string;
  recordType: string;
  title: string;
  description: string;
  createdAt: string;
  recordData: any;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  creator?: {
    profile?: {
      displayName: string;
    };
    fullName?: string;
  };
}

interface ClinicalDocumentManagerProps {
  workspaceId: string;
  patientId: string;
}

export const ClinicalDocumentManager = ({ workspaceId, patientId }: ClinicalDocumentManagerProps) => {
  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState('prescription');
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<ClinicalDocument | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      // We'll use the search endpoint with workspaceId filter
      const response = await medicalRecordService.searchRecords({
        workspaceId,
        patientId,
        limit: 100
      });
      setDocuments(response.records || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to load clinical documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [workspaceId]);

  const handleCreateDocument = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        patientId,
        workspaceId,
        recordType: selectedType,
        title: formData.title || `${selectedType.replace('_', ' ').toUpperCase()} - ${format(new Date(), 'MMM dd')}`,
        description: formData.description || '',
        recordData: {
          ...formData,
          generatedAt: new Date().toISOString()
        },
        category: 'clinical_documentation',
        tags: [selectedType, 'workspace_document']
      };

      await medicalRecordService.createRecord(payload);
      toast.success(`${selectedType.replace('_', ' ')} generated successfully`);
      setShowCreateModal(false);
      setFormData({});
      fetchDocuments();
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to generate document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'prescription': return <Stethoscope className="w-5 h-5 text-blue-500" />;
      case 'lab_request': return <Activity className="w-5 h-5 text-emerald-500" />;
      case 'sick_note': return <ClipboardList className="w-5 h-5 text-amber-500" />;
      case 'death_certificate': return <FileWarning className="w-5 h-5 text-rose-500" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const renderTemplateFields = () => {
    switch (selectedType) {
      case 'prescription':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Medication List (One per line)</Label>
              <Textarea 
                placeholder="e.g. Paracetamol 500mg - 1x3 for 5 days" 
                onChange={(e) => setFormData({...formData, medications: e.target.value})}
                className="min-h-[120px]"
              />
            </div>
            <div className="grid gap-2">
              <Label>Clinical Instructions</Label>
              <Input 
                placeholder="Take after meals..." 
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              />
            </div>
          </div>
        );
      case 'lab_request':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Requested Tests</Label>
              <Textarea 
                placeholder="e.g. Full Blood Count, Malaria Parasite, Blood Sugar" 
                onChange={(e) => setFormData({...formData, tests: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Reason for Request</Label>
              <Input 
                placeholder="Differential diagnosis support..." 
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>
          </div>
        );
      case 'sick_note':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input type="date" onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Clinical Reason</Label>
              <Textarea 
                placeholder="Patient is unfit for duty due to..." 
                onChange={(e) => setFormData({...formData, medicalReason: e.target.value})}
              />
            </div>
          </div>
        );
      case 'death_certificate':
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Date & Time of Decease</Label>
              <Input type="datetime-local" onChange={(e) => setFormData({...formData, deceaseTime: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Immediate Cause of Death</Label>
              <Textarea 
                placeholder="Primary medical cause..." 
                onChange={(e) => setFormData({...formData, primaryCause: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Secondary/Contributing Factors</Label>
              <Input 
                placeholder="Underlying conditions..." 
                onChange={(e) => setFormData({...formData, secondaryFactors: e.target.value})}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Content</Label>
              <Textarea 
                placeholder="Enter document content..." 
                onChange={(e) => setFormData({...formData, genericContent: e.target.value})}
                className="min-h-[200px]"
              />
            </div>
          </div>
        );
    }
  };

  const handlePrint = (doc: ClinicalDocument) => {
    setViewingDoc(doc);
    // In a real app, this would trigger a print-friendly version
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="flex flex-col gap-6 h-full bg-slate-50/30 p-6 rounded-[32px]">
      <div className="flex justify-between items-center bg-white p-6 rounded-[28px] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Clinical Documentation</h3>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Registry of formal medical records & certificates</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl gap-2 font-black uppercase text-xs px-6 h-12 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          New Document
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <Card key={doc.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[32px] overflow-hidden bg-white border border-slate-100 group">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                      {getDocIcon(doc.recordType)}
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest py-1 border-slate-100 bg-slate-50/50">
                      {doc.recordType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-black text-slate-900 uppercase tracking-tight line-clamp-1">{doc.title}</CardTitle>
                  <CardDescription className="font-bold text-[10px] text-slate-400 uppercase tracking-tighter">
                    Generated on {format(new Date(doc.createdAt), 'MMM dd, yyyy • HH:mm')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    By: {doc.creator?.profile?.displayName || doc.creator?.fullName || 'Clinical Staff'}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                      onClick={() => setViewingDoc(doc)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl h-9 w-9 bg-slate-50 hover:bg-slate-100 text-slate-400"
                      onClick={() => handlePrint(doc)}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="text-lg font-black text-slate-400 uppercase tracking-tight">No records in this workspace</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-xs">Start by generating a prescription or clinical certificate</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Create Document Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl bg-white rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-slate-900 p-8 text-white">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Generate Clinical Record</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select template and populate clinical data</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-8">
            <div className="grid gap-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Document Type</Label>
              <Select value={selectedType} onValueChange={(val) => {
                setSelectedType(val);
                setFormData({});
              }}>
                <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-sm shadow-sm">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                  <SelectItem value="prescription">e-Prescription</SelectItem>
                  <SelectItem value="lab_request">Laboratory Request</SelectItem>
                  <SelectItem value="imaging_request">Radiology/Imaging Request</SelectItem>
                  <SelectItem value="sick_note">Medical Sick Note</SelectItem>
                  <SelectItem value="death_certificate">Death Certificate</SelectItem>
                  <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                  <SelectItem value="consent_form">Patient Consent Form</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Record Title</Label>
              <Input 
                placeholder="Custom title (optional)" 
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-sm shadow-sm"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="bg-blue-50/30 p-6 rounded-[28px] border border-blue-100/50">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Template Specific Data
              </h4>
              {renderTemplateFields()}
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowCreateModal(false)}
              className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDocument}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-10 font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20"
            >
              {isSubmitting ? "Generating..." : "Generate & Sign Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Print Document Modal */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-3xl bg-white rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
          <div id="printable-area" className="p-12 space-y-12 bg-white">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 p-2 rounded-xl">
                    <Activity className="text-white w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-black uppercase tracking-tighter">Unlimited Healthcare</h1>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  Clinical Network • Digital Health Registry<br />
                  Document ID: {viewingDoc?.id}
                </div>
              </div>
              <div className="text-right">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-xl inline-block text-[10px] font-black uppercase tracking-widest mb-4">
                  {viewingDoc?.recordType.replace('_', ' ')}
                </div>
                <div className="text-sm font-black uppercase tracking-tight text-slate-900">
                  {format(new Date(viewingDoc?.createdAt || Date.now()), 'MMMM dd, yyyy')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 bg-slate-50 p-8 rounded-[32px]">
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Patient Information</Label>
                <div className="text-sm font-black text-slate-900 uppercase">Patient ID: {patientId.substring(0, 8)}</div>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">Electronic Medical File</div>
              </div>
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Authorized Provider</Label>
                <div className="text-sm font-black text-slate-900 uppercase">{viewingDoc?.creator?.profile?.displayName || viewingDoc?.creator?.fullName || 'Medical Staff'}</div>
                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">Certified Practitioner</div>
              </div>
            </div>

            <div className="space-y-8 min-h-[300px]">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight text-center underline underline-offset-8 decoration-4 decoration-blue-600/20">
                {viewingDoc?.title}
              </h2>
              
              <div className="prose prose-slate max-w-none">
                <div className="bg-white p-8 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-700 font-medium leading-loose whitespace-pre-wrap">
                  {JSON.stringify(viewingDoc?.recordData, null, 2)}
                  {/* Better formatting for specific fields would go here */}
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-100 flex justify-between items-end">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Authentication</div>
                <div className="font-mono text-[9px] text-blue-600 font-bold uppercase">{viewingDoc?.id.split('-').join('')}</div>
              </div>
              <div className="text-center">
                <div className="h-20 w-48 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-2">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic opacity-50">Secure Digital Signature</span>
                </div>
                <div className="text-[10px] font-black uppercase tracking-tighter text-slate-900 underline underline-offset-4 decoration-2 decoration-blue-600">
                  {viewingDoc?.creator?.profile?.displayName || 'Clinical Staff'}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-900 gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setViewingDoc(null)}
              className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest text-slate-400 hover:text-white hover:bg-white/10"
            >
              Close
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-10 font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/40 gap-2"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
              Print Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .DialogFooter, button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
