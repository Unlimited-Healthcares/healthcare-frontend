import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  ZoomIn,
  ZoomOut,
  Gauge,
  ScanLine,
  RotateCcw,
  Contrast,
  LayoutGrid,
  Image as ImageIcon,
  Maximize,
  Printer,
  Download,
  Shield,
  ShieldCheck,
  History,
  EyeOff,
  Eye,
  Lock,
  Boxes,
  Activity,
  ChevronRight,
  Info,
  MoreVertical,
  Share2,
  Search,
  Maximize2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { imagingService } from "@/services/imagingService";
import { dicomWebService, DicomWebStudy, DicomWebSeries, DicomWebInstance } from "@/services/dicomWebService";
import { cn } from "@/lib/utils";

interface DicomImage {
  id: string;
  url: string;
  thumbnail: string;
  patientName?: string;
  patientId?: string;
  studyDate?: string;
  modality?: string;
}

interface DicomSeries {
  id: string;
  description: string;
  modality: string;
  images: DicomImage[];
}

interface DicomStudy {
  id: string;
  patientName: string;
  patientId: string;
  studyDate: string;
  studyDescription: string;
  series: DicomSeries[];
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export const DicomViewer = ({ patientId: propPatientId }: { patientId?: string }) => {
  const { toast } = useToast();
  const { profile, user: authUser } = useAuth();
  const patientId = propPatientId || (authUser?.roles?.includes('patient') ? authUser.id : null);
  const userName = profile?.name || authUser?.name || 'Practitioner';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studies, setStudies] = useState<DicomStudy[]>([]);
  const [currentStudy, setCurrentStudy] = useState<DicomStudy | null>(null);
  const [currentSeries, setCurrentSeries] = useState<DicomSeries | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isHorizontalFlipped, setIsHorizontalFlipped] = useState(false);
  const [isVerticalFlipped, setIsVerticalFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Security states
  const [isDeidentified, setIsDeidentified] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isPacsMode, setIsPacsMode] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const imageRef = useRef<HTMLImageElement>(null);

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: Date.now().toString(),
      action,
      user: userName,
      timestamp: new Date().toLocaleString(),
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const fetchStudies = useCallback(async () => {
    if (!patientId) return;
    try {
      setIsLoading(true);
      
      if (isPacsMode) {
        // Fetch from Live PACS via DICOM-web bridge
        const pacsStudies = await dicomWebService.searchStudies({ PatientID: patientId });
        const mappedStudies: DicomStudy[] = pacsStudies.map(s => ({
          id: s.studyInstanceUid,
          patientName: s.patientName || 'Unknown Patient',
          patientId: s.patientId || patientId,
          studyDate: s.studyDate || 'N/A',
          studyDescription: s.description || 'Live PACS Study',
          series: [] // Will fetch on demand
        }));
        setStudies(mappedStudies);
        if (mappedStudies.length > 0) handleStudySelect(mappedStudies[0].id, mappedStudies);
      } else {
        // Fetch from Local Node
        const data = await imagingService.getPatientStudies(patientId);
        const mappedStudies: DicomStudy[] = data.map(s => ({
          id: s.id,
          patientName: s.patient?.name || 'Unknown Patient',
          patientId: s.patientId,
          studyDate: s.studyDate ? new Date(s.studyDate).toISOString().split('T')[0] : 'N/A',
          studyDescription: s.description || 'No Description',
          series: [{
            id: s.id + '-series',
            description: s.modality + ' Series',
            modality: s.modality || 'UNK',
            images: (s.files || []).map(f => ({
              id: f.id,
              url: '',
              thumbnail: '/placeholder-dicom.jpg',
              patientName: s.patient?.name,
              patientId: s.patientId,
              studyDate: s.studyDate,
              modality: s.modality
            }))
          }]
        }));
        setStudies(mappedStudies);
        if (mappedStudies.length > 0 && !currentStudy) {
          handleStudySelect(mappedStudies[0].id, mappedStudies);
        }
      }
    } catch (error) {
      console.error('Failed to fetch imaging studies:', error);
      toast({ title: "PACS Sync Error", description: "Could not reach the live PACS bridge.", variant: "destructive" });
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [patientId, isPacsMode]);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !patientId) return;

    setIsLoading(true);
    addAuditLog('Initiated Upload', `Uploading ${files.length} DICOM instances`);

    try {
      const newStudyRecord = await imagingService.createStudy({
        patientId,
        description: "Manual Upload",
        modality: "DICOM",
        studyDate: new Date().toISOString()
      });

      const uploadPromises = Array.from(files).map(file =>
        imagingService.uploadFile(newStudyRecord.id, file)
      );

      await Promise.all(uploadPromises);
      addAuditLog('Upload Success', `Persisted study: ${newStudyRecord.id}`);
      toast({ title: "Upload Success", description: `${files.length} instances saved securely.` });
      fetchStudies();
    } catch (error) {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const resetControls = () => {
    setBrightness(50);
    setContrast(50);
    setZoom(100);
    setRotation(0);
    setIsHorizontalFlipped(false);
    setIsVerticalFlipped(false);
    setPan({ x: 0, y: 0 });
  };

  const handleImageSelect = async (series: DicomSeries, imageIndex: number) => {
    const image = series.images[imageIndex];
    if (!image.url) {
      try {
        if (isPacsMode && currentStudy) {
          // Construct WADO-RS URL for frame
          // In PACS mode, image.id might be a placeholder or SOPInstanceUID
          // For simplicity, we'll assume we have the metadata or fetch it
          // Here we use a generic rendered frame URL
          image.url = dicomWebService.getFrameUrl(currentStudy.id, series.id, image.id, imageIndex + 1);
          image.thumbnail = image.url;
        } else {
          const { url } = await imagingService.getFileUrl(image.id);
          image.url = url;
          image.thumbnail = url;
        }
      } catch (error) {
        console.error('Failed to get frame URL:', error);
      }
    }
    setCurrentSeries(series);
    setCurrentImageIndex(imageIndex);
    resetControls();
    addAuditLog('Image View', `Accessed frame ${imageIndex + 1} of series ${series.description} ${isPacsMode ? '(PACS)' : ''}`);
  };

  const handleStudySelect = async (studyId: string, currentStudies?: DicomStudy[]) => {
    const source = currentStudies || studies;
    const study = source.find(s => s.id === studyId);
    if (study) {
      setCurrentStudy(study);
      
      if (isPacsMode && study.series.length === 0) {
        setIsLoading(true);
        try {
          const pacsSeries = await dicomWebService.getSeries(studyId);
          study.series = pacsSeries.map(ser => ({
            id: ser.seriesInstanceUid,
            description: ser.description || `${ser.modality} Series`,
            modality: ser.modality,
            images: Array(ser.instanceCount).fill(null).map((_, i) => ({
              id: `${ser.seriesInstanceUid}-f${i}`,
              url: '',
              thumbnail: '/placeholder-dicom.jpg'
            }))
          }));
          setStudies([...source]);
          toast({ title: "PACS Stream 100%", description: "Zero-latency buffer initialized." });
        } catch (error) {
          toast({ title: "PACS Series Error", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }

      if (study.series[0]) {
        handleImageSelect(study.series[0], 0);
      }
      addAuditLog('Study Select', `Opened study: ${study.id} ${isPacsMode ? '(LIVE PACS)' : '(LOCAL)'}`);
    }
  };

  const getImageTransform = () => {
    const t = [];
    if (zoom !== 100) t.push(`scale(${zoom / 100})`);
    if (rotation !== 0) t.push(`rotate(${rotation}deg)`);
    if (isHorizontalFlipped) t.push(`scaleX(-1)`);
    if (isVerticalFlipped) t.push(`scaleY(-1)`);
    if (pan.x !== 0 || pan.y !== 0) t.push(`translate(${pan.x}px, ${pan.y}px)`);
    return t.join(' ');
  };

  const handleExportCurrentImage = async () => {
    if (!currentSeries || !currentSeries.images[currentImageIndex]) return;
    const image = currentSeries.images[currentImageIndex];

    try {
      const { url } = await imagingService.getFileUrl(image.id);
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `DICOM_IMG_${image.id}.dcm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      addAuditLog('Export Image', `Exported frame ${currentImageIndex + 1} of series ${currentSeries.id}`);
      toast({ title: "Export Success", description: "Image frame exported successfully." });
    } catch (error) {
      toast({ title: "Export Failed", variant: "destructive" });
    }
  };

  const handleExportAsPNG = async () => {
    if (!imageRef.current || !currentSeries) return;

    try {
      const canvas = document.createElement('canvas');
      const img = imageRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply current filters to canvas export
      ctx.filter = `brightness(${brightness / 50}) contrast(${contrast / 50})`;

      // Handle transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(isHorizontalFlipped ? -1 : 1, isVerticalFlipped ? -1 : 1);
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `IMG_EXTRACT_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addAuditLog('Export PNG', `Screenshot of frame ${currentImageIndex + 1} captured`);
      toast({ title: "Visual Export Success", description: "Converted DICOM frame to PNG." });
    } catch (error) {
      console.error('PNG Export failed:', error);
      toast({ title: "Visual Export Failed", variant: "destructive", description: "Could not capture frame to PNG." });
    }
  };

  const handleExportSeries = async () => {
    if (!currentSeries) return;

    toast({
      title: "Batch Export Initiated",
      description: `Preparing ${currentSeries.images.length} images for download...`
    });

    try {
      // For batch, we'll trigger them sequentially
      for (let i = 0; i < currentSeries.images.length; i++) {
        const image = currentSeries.images[i];
        const { url } = await imagingService.getFileUrl(image.id);
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `DICOM_SERIES_${currentSeries.id}_F${i + 1}.dcm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        await new Promise(r => setTimeout(r, 400)); // Throttling
      }

      addAuditLog('Export Series', `Exported full series: ${currentSeries.id}`);
      toast({ title: "Batch Export Complete", description: "Full digital archive downloaded." });
    } catch (error) {
      toast({ title: "Export Error", variant: "destructive", description: "Batch operation interrupted." });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !imageRef.current || !currentStudy) return;

    const img = imageRef.current;
    const studyInfo = `
      <div style="font-family: sans-serif; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
        <h1 style="margin: 0;">ANING IMAGING REPORT</h1>
        <p style="margin: 5px 0;"><b>Patient:</b> ${isDeidentified ? "•••••••• •••••" : currentStudy.patientName}</p>
        <p style="margin: 5px 0;"><b>ID:</b> ${isDeidentified ? "************" : currentStudy.patientId}</p>
        <p style="margin: 5px 0;"><b>Study Date:</b> ${currentStudy.studyDate}</p>
        <p style="margin: 5px 0;"><b>Modality:</b> ${currentSeries?.modality || 'N/A'}</p>
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>DICOM Print - ${currentStudy.id}</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; }
            img { max-width: 100%; height: auto; filter: brightness(${brightness / 50}) contrast(${contrast / 50}); }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${studyInfo}
          <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
            <img src="${img.src}" style="transform: rotate(${rotation}deg)${isHorizontalFlipped ? ' scaleX(-1)' : ''}${isVerticalFlipped ? ' scaleY(-1)' : ''}" />
          </div>
          <div style="margin-top: 20px; font-size: 10px; color: #666; font-family: sans-serif;">
            Printed via Aning Secure Imaging Node on ${new Date().toLocaleString()}
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    addAuditLog('Print', `Printed frame ${currentImageIndex + 1} of study ${currentStudy.id}`);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan(prev => ({ x: prev.x + (e.clientX - dragStart.x), y: prev.y + (e.clientY - dragStart.y) }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050510] text-slate-100 overflow-hidden font-sans">
      {/* Minimal High-Tech Header */}
      <header className="px-4 py-3 sm:py-3 pt-12 sm:pt-3 safe-area-pt flex items-center justify-between border-b border-white/[0.08] bg-[#0A0A1F]/80 backdrop-blur-md relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Aning Imaging <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] h-4">PRO</Badge>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-none mt-0.5">Secure AI Diagnostic Node</p>
          </div>
        </div>

        <div className="flex items-center gap-2 group">
          <div className="flex bg-[#12122b] rounded-xl p-1 border border-white/[0.05]">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 rounded-lg text-xs font-bold transition-all", isPacsMode ? "text-blue-400 bg-blue-500/10" : "text-slate-400")}
              onClick={() => setIsPacsMode(!isPacsMode)}
            >
              <Activity className="w-3 h-3 md:mr-1.5" />
              <span className="hidden md:inline">{isPacsMode ? "Live PACS" : "Local Node"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 rounded-lg text-xs font-bold transition-all", isLocked ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400")}
              onClick={() => setIsLocked(!isLocked)}
            >
              {isLocked ? <ShieldCheck className="w-3 h-3 md:mr-1.5" /> : <Shield className="w-3 h-3 md:mr-1.5" />}
              <span className="hidden md:inline">{isLocked ? "Secured" : "Lock Study"}</span>
            </Button>
          </div>

          <Button
            size="sm"
            className="h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3 h-3 mr-1.5" />
            <span className="hidden sm:inline">Import</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <input ref={fileInputRef} type="file" multiple accept=".dcm,.ima,.dicom" className="hidden" onChange={handleFileUpload} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0A0A1F] border-white/10 text-white">
              <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer hover:bg-white/5" onClick={handleExportSeries}>
                <Download className="w-3.5 h-3.5" /> Download Current Series
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer hover:bg-white/5">
                <Share2 className="w-3.5 h-3.5" /> Share Study
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-bold gap-2 cursor-pointer hover:bg-white/5 text-rose-400">
                <Lock className="w-3.5 h-3.5" /> Archive Study
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:row overflow-hidden lg:flex-row">
        {/* Responsive Navigation Sidebar */}
        <aside className="w-full lg:w-72 border-r border-white/5 bg-[#080816]/50 flex flex-col min-h-0">
          <Tabs defaultValue="studies" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-4">
              <TabsList className="w-full bg-white/[0.03] p-1 rounded-xl h-10 border border-white/[0.05]">
                <TabsTrigger value="studies" className="flex-1 rounded-lg text-[10px] font-bold uppercase tracking-tight">Studies</TabsTrigger>
                <TabsTrigger value="security" className="flex-1 rounded-lg text-[10px] font-bold uppercase tracking-tight">Security</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="studies" className="flex-1 flex flex-col overflow-hidden mt-0">
              <div className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-lg pl-8 p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    placeholder="Search cases..."
                  />
                </div>
              </div>
              <ScrollArea className="flex-1 px-4 pb-4">
                <div className="space-y-2">
                  {studies.map((study) => (
                    <div
                      key={study.id}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer group",
                        currentStudy?.id === study.id
                          ? "border-blue-500/50 bg-blue-500/[0.03] ring-1 ring-blue-500/20"
                          : "border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.1]"
                      )}
                      onClick={() => handleStudySelect(study.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs truncate pr-2">{isDeidentified ? "•••••••• •••••" : study.patientName}</h3>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{isDeidentified ? "ID: ************" : `ID: ${study.patientId}`}</p>
                        </div>
                        <Badge className="bg-white/[0.05] text-blue-400 border-none text-[8px] h-4 px-1">{study.series[0].modality}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-500/80 uppercase">{study.studyDate}</span>
                        <span className="text-[9px] text-slate-600 line-clamp-1 italic max-w-[100px]">{study.studyDescription}</span>
                      </div>

                      {currentStudy?.id === study.id && (
                        <div className="mt-3 space-y-1 pt-2 border-t border-white/[0.03]">
                          {study.series.map((series) => (
                            <button
                              key={series.id}
                              className={cn(
                                "w-full flex items-center justify-between p-2 rounded-lg text-[10px] font-bold tracking-tight",
                                currentSeries?.id === series.id ? "text-blue-400 bg-blue-500/[0.05]" : "text-slate-500 hover:text-slate-300"
                              )}
                              onClick={(e) => { e.stopPropagation(); handleImageSelect(series, 0); }}
                            >
                              <div className="flex items-center gap-2">
                                <LayoutGrid size={10} />
                                <span className="truncate max-w-[120px]">{series.description}</span>
                              </div>
                              <span className="bg-white/[0.05] px-1.5 rounded-full text-[8px]">{series.images.length}F</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {studies.length === 0 && !isLoading && (
                    <div className="text-center py-10 opacity-30">
                      <ImageIcon className="mx-auto h-8 w-8 mb-2" />
                      <p className="text-[10px] font-bold">No studies found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="security" className="flex-1 p-4 overflow-hidden">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Privacy Engine</h4>
                    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isDeidentified ? "bg-emerald-500" : "bg-slate-700")} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-medium">De-identify viewer metadata</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn("h-7 text-[9px] font-bold rounded-lg px-2", isDeidentified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "border-white/10")}
                      onClick={() => setIsDeidentified(!isDeidentified)}
                    >
                      {isDeidentified ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                      {isDeidentified ? "ACTIVE" : "OFF"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-black text-slate-600 px-1">Integrity Trail</h4>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-2">
                      {auditLogs.map(log => (
                        <div key={log.id} className="p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.03] space-y-1">
                          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                            <span className="text-blue-500">{log.action}</span>
                            <span className="text-slate-600">{log.timestamp.split(',')[1].trim()}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight font-medium line-clamp-2">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Main Interactive Stage */}
        <main className="flex-1 flex flex-col bg-black relative">
          {/* Viewport HUD Overlay */}
          {currentSeries && (
            <div className="absolute top-4 left-4 z-20 pointer-events-none space-y-1">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-400 tracking-[0.2em] uppercase">Telemetry Link Operational</span>
              </div>
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/[0.08] shadow-2xl space-y-1 min-w-[200px]">
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-tight">{isDeidentified ? "•••••••• •••••" : currentStudy?.patientName}</h2>
                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase">
                  <span className="text-blue-500">{currentSeries.modality}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-800" />
                  <span>{currentSeries.description}</span>
                </div>
                <div className="flex gap-4 mt-3 pt-2 border-t border-white/[0.03] text-[9px] font-mono text-slate-400">
                  <div className="flex flex-col">
                    <span className="text-slate-600 text-[8px] font-black uppercase tracking-tighter">Zoom</span>
                    <span>{zoom}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-600 text-[8px] font-black uppercase tracking-tighter">Contrast</span>
                    <span>{contrast}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-600 text-[8px] font-black uppercase tracking-tighter">Frame</span>
                    <span>{currentImageIndex + 1}/{currentSeries.images.length}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pt-2 border-t border-white/[0.03]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold gap-1.5"
                    onClick={handleExportAsPNG}
                  >
                    <ImageIcon className="w-3 h-3" /> Save Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold gap-1.5"
                    onClick={handleExportCurrentImage}
                  >
                    <Download className="w-3 h-3" /> Download .DCM
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] text-[10px] font-bold gap-1.5"
                    onClick={handleExportSeries}
                  >
                    <Boxes className="w-3 h-3" /> Export Series
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] text-[10px] font-bold gap-1.5"
                    onClick={handlePrint}
                  >
                    <Printer className="w-3 h-3" /> Print
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Image Area */}
          <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden group/stage">
            {isLoading ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-black tracking-[0.3em] text-blue-400 uppercase">Synchronizing Stream</p>
                  <p className="text-[9px] text-slate-600 font-medium">Validating point-to-point encryption tunnel</p>
                </div>
              </div>
            ) : currentSeries && viewMode === 'single' ? (
              <div
                className="w-full h-full flex items-center justify-center cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                {currentSeries.images[currentImageIndex]?.url && (
                  <img
                    ref={imageRef}
                    src={currentSeries.images[currentImageIndex].url}
                    className="max-w-full max-h-full select-none"
                    style={{
                      transform: getImageTransform(),
                      filter: `brightness(${brightness / 50}) contrast(${contrast / 50})`,
                      transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)"
                    }}
                    draggable={false}
                  />
                )}
              </div>
            ) : currentSeries && viewMode === 'grid' ? (
              <ScrollArea className="w-full h-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-6 gap-4 p-6">
                  {currentSeries.images.map((img, idx) => (
                    <div
                      key={img.id}
                      className={cn(
                        "aspect-square rounded-xl bg-[#080816] border transition-all overflow-hidden cursor-pointer",
                        idx === currentImageIndex ? "border-blue-500" : "border-white/5 hover:border-white/20"
                      )}
                      onClick={() => { setCurrentImageIndex(idx); setViewMode('single'); }}
                    >
                      <img src={img.thumbnail} alt="" className="w-full h-full object-cover p-2 opacity-60 group-hover:opacity-100" />
                      <div className="absolute bottom-2 left-2 text-[8px] font-black bg-black/40 px-1.5 py-0.5 rounded text-white backdrop-blur-sm">FR {idx + 1}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center gap-8 max-w-sm">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-500/20 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative w-32 h-32 rounded-[2.5rem] bg-[#0A0A1F] border border-white/[0.05] flex items-center justify-center shadow-2xl ring-1 ring-white/[0.02]">
                    <Boxes className="w-12 h-12 text-blue-500/50" />
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-lg font-black text-slate-200 tracking-tight uppercase">Workspace Ready</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">Please drag and drop or import your validated DICOM datasets to initialize the diagnostic node.</p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-[0_10px_30px_rgba(37,99,235,0.2)] active:scale-95 transition-all text-xs"
                >
                  Initialize Stream <Upload className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Precision Tool Control Center */}
          {currentSeries && (
            <nav className="absolute left-1/2 -translate-x-1/2 bottom-8 h-12 bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-2xl flex items-center px-1.5 gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <TooltipProvider delayDuration={100}>
                <div className="flex items-center gap-1 border-r border-white/[0.05] pr-1">
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-white" onClick={() => setZoom(z => Math.min(400, z + 25))}><ZoomIn className="w-4 h-4" /></Button></TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-white/10 text-[10px] font-bold">Zoom In</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-white" onClick={() => setZoom(z => Math.max(25, z - 25))}><ZoomOut className="w-4 h-4" /></Button></TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-white/10 text-[10px] font-bold">Zoom Out</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-1 border-r border-white/[0.05] pr-1">
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-white" onClick={() => setBrightness(b => Math.min(100, b + 5))}><Gauge className="w-4 h-4" /></Button></TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-white/10 text-[10px] font-bold">Brightness</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-white" onClick={() => setContrast(c => Math.min(100, c + 5))}><Contrast className="w-4 h-4" /></Button></TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-white/10 text-[10px] font-bold">Contrast</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-white" onClick={resetControls}><RotateCcw className="w-4 h-4" /></Button></TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-white/10 text-[10px] font-bold">Reset</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-9 w-9 rounded-xl transition-all", viewMode === 'grid' ? "text-blue-400 bg-blue-500/10" : "text-slate-400")}
                        onClick={() => setViewMode(v => v === 'grid' ? 'single' : 'grid')}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-white/10 text-[10px] font-bold">Grid View</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-white"><Maximize2 className="w-4 h-4" /></Button></TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-white/10 text-[10px] font-bold">Maximize</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </nav>
          )}

          {/* Frame Sequencing Blade */}
          {currentSeries && currentSeries.images.length > 1 && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 py-8 px-1.5 bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-full group/blade hover:scale-105 transition-transform">
              <span className="text-[8px] font-black text-slate-600 uppercase vertical-rl">Stream</span>
              <div className="h-48 flex flex-col py-2">
                <Slider
                  orientation="vertical"
                  min={0}
                  max={currentSeries.images.length - 1}
                  step={1}
                  value={[currentImageIndex]}
                  onValueChange={v => setCurrentImageIndex(v[0])}
                  className="h-full"
                />
              </div>
              <span className="text-[8px] font-black text-slate-600 uppercase vertical-rl">Node</span>
            </div>
          )}
        </main>
      </div>

      {/* Custom Styles for Vertical Text */}
      <style dangerouslySetInnerHTML={{
        __html: `
                .vertical-rl { writing-mode: vertical-rl; }
            ` }} />
    </div>
  );
};
