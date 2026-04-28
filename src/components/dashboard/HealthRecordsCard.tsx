import { FileText, Upload, Download, Eye, Search, Filter, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { medicalReportsService } from "@/services/medicalReportsService";
import { MedicalReport } from "@/types/medical-reports";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { patientService } from "@/services/patientService";
import { useNavigate } from "react-router-dom";
import { discoveryService } from "@/services/discoveryService";

// No mock data - using dynamic records from backend

export function HealthRecordsCard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<MedicalReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const res = await medicalReportsService.getMedicalReports({ limit: 5 });
      setRecords(res.data || []);
    } catch (error) {
      console.error("Failed to fetch records", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDownload = async (recordId: string) => {
    try {
      toast.loading('Generating PDF...');
      const res = await medicalReportsService.generateDigitalReport(recordId);
      if (res?.pdfUrl) {
        window.open(res.pdfUrl, '_blank');
        toast.success('Document ready');
      } else {
        toast.error('PDF not available for this record');
      }
    } catch (error) {
      toast.error('Download failed');
    } finally {
      toast.dismiss();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Only PDF files are allowed");
      return;
    }

    try {
      setIsUploading(true);

      // 1. Get patient ID
      let pId = "";
      const patient = await patientService.getCurrentPatient().catch(() => null);

      if (patient?.id) {
        pId = patient.id;
      } else {
        // Fallback for professionals/others: biotech engineers must have a patient to attach to
        // If they click 'Record Discovery' first, they should have a patient context.
        // For now, let's look for any patient they are associated with (or any patient if global access)
        const patientsRes = await patientService.getPatients({ limit: 1 }).catch(() => ({ data: [] }));
        if (patientsRes.data?.length > 0) {
          pId = patientsRes.data[0].id;
          toast.info(`Attaching document to patient: ${patientsRes.data[0].fullName || patientsRes.data[0].patientId}`);
        } else {
          toast.dismiss();
          toast.error("Please use 'Record Discovery' to find a patient before uploading.");
          setIsUploading(false);
          return;
        }
      }

      // 2. Resolve and validate centerId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isValidUUID = (id: any) => 
        typeof id === 'string' && uuidRegex.test(id) && id.toLowerCase() !== 'centerid' && id.toLowerCase() !== 'default-center';

      let centerId = (profile as any)?.center_id || (user as any)?.centerId || (profile as any)?.centerId || (user as any)?.center_id;

      if (!isValidUUID(centerId)) {
        // Smart Lookup Fallback: Check approved connections or recent reports
        try {
          const discovery = await discoveryService.getSentRequests({ status: 'approved', limit: 5 });
          const center = discovery.requests.find(r => 
            r.recipient?.roles?.includes('center') || 
            r.requestType?.includes('center')
          );
          if (center && isValidUUID(center.recipientId)) {
            centerId = center.recipientId;
          } else {
            // Check recent records as last resort
            const connections = await medicalReportsService.getMedicalReports({ limit: 1 });
            if (connections.data?.[0]?.centerId && isValidUUID(connections.data[0].centerId)) {
              centerId = connections.data[0].centerId;
            }
          }
        } catch (e) {
          console.warn('Smart lookup failed in vault:', e);
        }
      }

      if (!isValidUUID(centerId)) {
        toast.dismiss();
        toast.error("No linked facility found. Please link to a center in Discovery before uploading.");
        setIsUploading(false);
        return;
      }

      toast.loading("Creating vault record...");
      // 3. Create the medical record
      const record = await medicalReportsService.createMedicalReport({
        patientId: pId,
        centerId: centerId as string,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        recordType: 'EXTERNAL_DOCUMENT',
        category: 'general',
        diagnosis: `Uploaded from Document Vault on ${format(new Date(), 'yyyy-MM-dd')}`,
        notes: `File: ${file.name}`,
        tags: ['uploaded', 'pdf', 'vault']
      });

      toast.loading("Uploading file to vault...");
      // 3. Upload the file
      await medicalReportsService.uploadFile(record.id, file);

      toast.dismiss();
      toast.success(`PDF uploaded successfully to vault for patient: ${pId}`);
      fetchRecords(); // Refresh the list
    } catch (error) {
      console.error("Upload failed", error);
      toast.dismiss();
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredRecords = records.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reportType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="pb-4 px-3 md:px-6">
        <CardTitle className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xl font-bold text-gray-800">Document Vault</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-medium"
            >
              View All
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search history & vault documents..."
              className="pl-9 h-9 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-blue-100 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 md:px-6">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 italic">Syncing with Document Vault...</div>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className="group flex items-center justify-between p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 w-full relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border-slate-200 px-2 py-0.5 rounded-lg"
                  >
                    {record.reportType.replace(/_/g, ' ')}
                  </Badge>
                  <Badge
                    className={cn("text-[10px] text-white px-2 py-0.5 rounded-lg font-bold bg-indigo-500")}
                  >
                    Recorded
                  </Badge>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{record.title}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-tighter bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{record.reportType}</p>
                  <p className="text-xs text-gray-400 font-medium italic">{format(new Date(record.generatedDate), 'MMMM dd, yyyy')}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Preview"
                  onClick={() => window.open(`/records/${record.id}`, '_blank')}
                >
                  <Eye className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  title="Download PDF"
                  onClick={() => handleDownload(record.id)}
                >
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
              <Plus className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400 font-medium italic">No document records found matching "{searchQuery}"</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            className="w-full sm:flex-1 h-12 bg-white border-blue-100 text-blue-700 hover:bg-blue-50 rounded-xl font-black uppercase text-xs tracking-widest shadow-sm disabled:opacity-50"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                Uploading...
              </div>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full sm:flex-1 h-12 bg-white border-indigo-100 text-indigo-700 hover:bg-indigo-50 rounded-xl font-black uppercase text-xs tracking-widest shadow-sm"
            onClick={() => navigate('/discovery?type=patient')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Record Discovery
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
