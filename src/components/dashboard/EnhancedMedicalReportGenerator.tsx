import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle,
  FileText,
  Loader2,
  Printer,
  Share,
  Lock,
  User,
  Building,
  AlertTriangle,
  ShieldCheck,
  Download,
  Upload,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { EnhancedReportPdfGenerator } from "./EnhancedReportPdfGenerator";
import { supabase } from "@/integrations/supabase/client";
import { medicalReportsService } from "@/services/medicalReportsService";
import { discoveryService } from "@/services/discoveryService";
import { useAuth } from "@/hooks/useAuth";
import { PatientBiodata, MedicalReportData } from "@/types/patient";
import { MedicalReportFiles } from "./MedicalReportFiles";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface HealthcareCenter {
  id: string;
  name: string;
  type: string;
  address: string;
  contact?: string | null;
  email?: string | null;
  hours?: string | null;
  image_url?: string | null;
  phone?: string | null;
}

interface ReportTemplate {
  id: string;
  name: string;
  centerType: string;
  content: {
    diagnosis?: string;
    recommendations?: string;
    treatment?: string;
  };
}

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const reportSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  reportType: z.string().min(1, "Report type is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  prescription: z.string().optional(),
  treatment: z.string().optional(),
  recommendations: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  patientConsent: z.boolean().default(false),
  doctorSignature: z.string().min(1, "Digital signature is required"),
  files: z.array(z.any()).optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

// Mock healthcare centers for demonstration
const mockCenters: HealthcareCenter[] = [];

export const EnhancedMedicalReportGenerator = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<MedicalReportData | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientBiodata | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<HealthcareCenter>(mockCenters[0]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [patientConsent, setPatientConsent] = useState(false);
  const [useBiodata, setUseBiodata] = useState(false);
  const [healthcareCenters, setHealthcareCenters] = useState<HealthcareCenter[]>([]);
  const [isLoadingCenters, setIsLoadingCenters] = useState(false);
  const [activeTab, setActiveTab] = useState("report");

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      patientId: "",
      reportType: "",
      diagnosis: "",
      prescription: "",
      treatment: "",
      recommendations: "",
      notes: "",
      followUpDate: "",
      bloodType: "",
      allergies: "",
      patientConsent: false,
      doctorSignature: profile?.name || "",
      files: [],
    },
  });

  // Get report templates based on center type
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await medicalReportsService.getMedicalReportTemplates(selectedCenter.id);
        if (response.data && response.data.length > 0) {
          setReportTemplates(response.data);
        } else {
          // Add default premium templates if none found
          const defaultTemplates: ReportTemplate[] = [
            {
              id: "temp-1",
              name: "General Wellness Checkup",
              centerType: selectedCenter.type,
              content: {
                diagnosis: "Patient presents for annual wellness examination. Overall health appears stable with no acute distress.",
                treatment: "Continue balanced diet and regular physical activity (150 mins/week).",
                recommendations: "Maintain current hydration levels. Annual follow-up recommended."
              }
            },
            {
              id: "temp-2",
              name: "Cardiology Consultation",
              centerType: selectedCenter.type,
              content: {
                diagnosis: "Normal sinus rhythm. Blood pressure within target range. Heart sounds are clear S1, S2.",
                treatment: "Standard heart-healthy dietary protocols.",
                recommendations: "Periodic BP monitoring at home. Stress reduction techniques."
              }
            },
            {
              id: "temp-3",
              name: "Diagnostic Results Review",
              centerType: selectedCenter.type,
              content: {
                diagnosis: "Blood work results are within normal reference ranges across all major parameters.",
                treatment: "No clinical intervention required at this time.",
                recommendations: "Maintain routine screening schedule."
              }
            }
          ];
          setReportTemplates(defaultTemplates);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, [selectedCenter]);

  const applyTemplate = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      form.setValue("diagnosis", template.content.diagnosis || "");
      form.setValue("recommendations", template.content.recommendations || "");
      form.setValue("treatment", template.content.treatment || "");
    }
  };

  const fetchPatientDetails = useCallback(async (patientId: string) => {
    if (!patientId) return;

    setIsLoadingPatient(true);

    try {
      // Try to get the user profile directly
      const user = await discoveryService.getUserProfile(patientId);

      if (user) {
        setPatientInfo({
          id: user.publicId || user.id,
          name: user.displayName || `${user.profile?.firstName} ${user.profile?.lastName}`.trim() || 'Unknown',
          email: user.email,
          gender: user.profile?.gender || 'Not specified',
          dateOfBirth: user.profile?.dateOfBirth,
          bloodType: (user as any).healthProfile?.bloodType || '',
          allergies: (user as any).healthProfile?.allergies || [],
          phone: user.profile?.phone || '',
          address: user.profile?.address || '',
          photo: user.profile?.avatar,
          insurance: '',
          nextOfKin: '',
          height: (user as any).healthProfile?.height || 0,
          weight: (user as any).healthProfile?.weight || 0,
          medicalConditions: (user as any).healthProfile?.chronicConditions || []
        });
      }
      setIsLoadingPatient(false);
    } catch (error) {
      console.error('Error fetching patient:', error);
      // Don't show toast for every typed character that doesn't match
      setIsLoadingPatient(false);
    }
  }, [toast]);

  const watchPatientId = form.watch("patientId");

  useEffect(() => {
    const debouncedFetch = setTimeout(() => {
      if (watchPatientId) {
        fetchPatientDetails(watchPatientId);
      }
    }, 500);

    return () => clearTimeout(debouncedFetch);
  }, [watchPatientId, fetchPatientDetails]);

  // Handle applying patient biodata to form
  useEffect(() => {
    if (patientInfo && useBiodata && patientConsent) {
      form.setValue("bloodType", patientInfo.bloodType || "");
      form.setValue("allergies", patientInfo.allergies?.join(", ") || "");
    }
  }, [patientInfo, useBiodata, patientConsent, form]);

  // Fetch healthcare centers from the database
  useEffect(() => {
    const fetchHealthcareCenters = async () => {
      setIsLoadingCenters(true);
      try {
        const { data, error } = await supabase
          .from("healthcare_centers")
          .select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          setHealthcareCenters(data);
          // Set the first center as default if we don't have a selected center yet
          if (!selectedCenter || selectedCenter.id === "ctr-1") {
            setSelectedCenter(data[0]);
          }
        } else {
          // Fallback to mock data if no centers found
          setHealthcareCenters(mockCenters);
        }
      } catch (error) {
        console.error("Error fetching healthcare centers:", error);
        // Fallback to mock data on error
        setHealthcareCenters(mockCenters);
      } finally {
        setIsLoadingCenters(false);
      }
    };

    fetchHealthcareCenters();
  }, [selectedCenter]);

  async function onSubmit(data: ReportFormValues) {
    if (!patientConsent) {
      toast({
        title: "Patient consent required",
        description: "Please confirm patient consent to generate the report.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Create a medical record first
      const recordData = {
        patientId: data.patientId,
        title: `${data.reportType.toUpperCase()} Report - ${new Date().toLocaleDateString()}`,
        diagnosis: data.diagnosis,
        treatment: data.treatment || "",
        notes: data.notes || "",
        followUp: data.followUpDate || "",
        recordType: data.reportType,
        medications: data.prescription || "",
        centerId: selectedCenter.id,
      };


      const response = await medicalReportsService.createMedicalReport(recordData);
      const recordId = (response as any)?.data?.id || (response as any)?.id;

      // 1.5. Upload files if any
      const files = form.getValues("files") || [];
      if (recordId && files.length > 0) {
        toast({ title: "Uploading Files", description: `Attaching ${files.length} documents...` });
        for (const file of files) {
          try {
            await medicalReportsService.uploadFile(recordId, file, `Attachment for ${data.reportType} report`, [data.reportType]);
          } catch (uploadErr) {
            console.error('Failed to upload file:', file.name, uploadErr);
          }
        }
      }

      // 2. Generate the certified digital report
      const digitalReport = await medicalReportsService.generateDigitalReport(recordId);

      // Prepare report data for the UI, using the real data from the backend
      const reportData: MedicalReportData = {
        patientId: data.patientId,
        reportType: data.reportType,
        diagnosis: data.diagnosis,
        prescription: data.prescription || "",
        treatment: data.treatment || "",
        recommendations: data.recommendations || "",
        notes: data.notes || "",
        followUpDate: data.followUpDate || "",
        doctorId: profile?.id || "",
        doctorName: profile?.name || "",
        doctorSignature: data.doctorSignature,
        centerId: selectedCenter.id || "",
        centerName: selectedCenter.name || "",
        centerType: selectedCenter.type || "",
        centerAddress: selectedCenter.address || "",
        centerContact: selectedCenter.contact || "",
        centerEmail: selectedCenter.email || "",
        reportId: digitalReport.reportNumber || `REP-${Date.now().toString(36)}`,
        generatedDate: new Date().toISOString(),
        bloodType: data.bloodType || patientInfo?.bloodType || "",
        allergies: data.allergies || (patientInfo?.allergies ? patientInfo.allergies.join(", ") : ""),
        patientConsent: data.patientConsent,
        pdfUrl: digitalReport.pdfUrl, // Real URL from Supabase
        verificationCode: digitalReport.verificationCode,
      };

      setGeneratedReport(reportData);
      setIsGenerating(false);
      setActiveTab("report"); // Keep on report but show preview
      setShowPdfPreview(true);

      toast({
        title: "Certified Report Generated",
        description: `A secure, scannable report has been created for ${data.patientId}.`,
      });

    } catch (error) {
      console.error("Error generating report:", error);
      setIsGenerating(false);
      toast({
        title: "Error generating report",
        description: "An error occurred while generating the report.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="w-full px-0 sm:px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 px-4 sm:px-0">Medical Report Generator</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 sm:px-0">
        <TabsList className="mb-6">
          <TabsTrigger value="report">Generate Report</TabsTrigger>
          <TabsTrigger value="files">Report Files</TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Healthcare Center Selection */}
              <Card className="rounded-none sm:rounded-lg">
                <CardHeader>
                  <CardTitle>Healthcare Center Information</CardTitle>
                  <CardDescription>
                    Select the healthcare center for this report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCenters ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="centerSelect">Select Healthcare Center</Label>
                        <Select
                          value={selectedCenter?.id}
                          onValueChange={(value) => {
                            const center = healthcareCenters.find(c => c.id === value);
                            if (center) setSelectedCenter(center);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a healthcare center" />
                          </SelectTrigger>
                          <SelectContent>
                            {healthcareCenters.map((center) => (
                              <SelectItem key={center.id} value={center.id}>
                                {center.name} ({center.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedCenter && (
                        <div className="border rounded-md p-4 bg-muted/50">
                          <div className="grid gap-1">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{selectedCenter.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div>{selectedCenter.type}</div>
                              <div>{selectedCenter.address}</div>
                              {selectedCenter.contact && <div>Contact: {selectedCenter.contact}</div>}
                              {selectedCenter.email && <div>Email: {selectedCenter.email}</div>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rest of the existing form */}
              <Card className="rounded-none sm:rounded-lg">
                <CardHeader>
                  <CardTitle>Generate New Report</CardTitle>
                  <CardDescription>
                    Create a new medical report by filling out the form below.
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {reportTemplates.length > 0 && (
                      <Select onValueChange={applyTemplate}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Use a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="patientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient ID</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input placeholder="Enter patient ID" {...field} />
                                {isLoadingPatient && (
                                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                              </div>
                            </FormControl>
                            {patientInfo && (
                              <div className="p-3 bg-muted rounded-md text-sm mt-3">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="font-medium text-base">{patientInfo.name}</p>
                                  {patientInfo.photo && (
                                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                                      <img
                                        src={patientInfo.photo}
                                        alt={patientInfo.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = "/images/patient-placeholder.jpg";
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                  <p><span className="font-medium">Age:</span> {calculateAge(patientInfo.dateOfBirth || "")}</p>
                                  <p><span className="font-medium">Gender:</span> {patientInfo.gender}</p>
                                  <p><span className="font-medium">Blood Type:</span> {patientInfo.bloodType}</p>
                                </div>

                                <div className="mt-3 flex items-center space-x-2">
                                  <Checkbox
                                    id="use-biodata"
                                    checked={useBiodata}
                                    onCheckedChange={(checked) => {
                                      setUseBiodata(!!checked);
                                      if (!checked) {
                                        form.setValue("bloodType", "");
                                        form.setValue("allergies", "");
                                      }
                                    }}
                                    disabled={!patientConsent}
                                  />
                                  <label htmlFor="use-biodata" className="text-sm cursor-pointer">
                                    Use patient biodata in report {!patientConsent && "(requires consent)"}
                                  </label>
                                </div>

                                <div className="mt-2 flex items-center space-x-2">
                                  <Checkbox
                                    id="consent"
                                    checked={patientConsent}
                                    onCheckedChange={(checked) => {
                                      setPatientConsent(!!checked);
                                      form.setValue("patientConsent", !!checked);
                                    }}
                                  />
                                  <label
                                    htmlFor="consent"
                                    className="text-sm cursor-pointer"
                                  >
                                    Patient has provided consent for this report
                                  </label>
                                </div>

                                {patientConsent && (
                                  <div className="mt-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Consent Verified
                                    </Badge>
                                  </div>
                                )}

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="mt-3 w-full">
                                      <User className="h-3.5 w-3.5 mr-2" />
                                      View Complete Patient Information
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Patient Information</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Complete biodata for {patientInfo.name}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="space-y-4 py-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium mb-1">Full Name</p>
                                          <p>{patientInfo.name}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium mb-1">Patient ID</p>
                                          <p>{patientInfo.id}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium mb-1">Date of Birth</p>
                                          <p>{formatDate(patientInfo.dateOfBirth || "")}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium mb-1">Gender</p>
                                          <p>{patientInfo.gender}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium mb-1">Blood Type</p>
                                          <p>{patientInfo.bloodType}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium mb-1">Height/Weight</p>
                                          <p>{patientInfo.height} cm / {patientInfo.weight} kg</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium mb-1">Phone</p>
                                          <p>{patientInfo.phone}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium mb-1">Insurance</p>
                                          <p>{patientInfo.insurance}</p>
                                        </div>
                                      </div>

                                      <div>
                                        <p className="text-sm font-medium mb-1">Address</p>
                                        <p>{patientInfo.address}</p>
                                      </div>

                                      <div>
                                        <p className="text-sm font-medium mb-1">Next of Kin</p>
                                        <p>{patientInfo.nextOfKin}</p>
                                      </div>

                                      <div>
                                        <p className="text-sm font-medium mb-1">Allergies</p>
                                        <div className="flex flex-wrap gap-1">
                                          {patientInfo.allergies?.map((allergy, index) => (
                                            <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                              {allergy}
                                            </Badge>
                                          ))}
                                          {!patientInfo.allergies?.length && <p>No allergies recorded</p>}
                                        </div>
                                      </div>

                                      <div>
                                        <p className="text-sm font-medium mb-1">Medical Conditions</p>
                                        <div className="flex flex-wrap gap-1">
                                          {patientInfo.medicalConditions?.map((condition, index) => (
                                            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                              {condition}
                                            </Badge>
                                          ))}
                                          {!patientInfo.medicalConditions?.length && <p>No conditions recorded</p>}
                                        </div>
                                      </div>
                                    </div>

                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Close</AlertDialogCancel>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reportType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General Wellness Report</SelectItem>
                                <SelectItem value="lab">Diagnostic Results Summary</SelectItem>
                                <SelectItem value="radiology">Imaging & Radiology Report</SelectItem>
                                <SelectItem value="surgical">Surgical Procedure Report</SelectItem>
                                <SelectItem value="consultation">Clinical Consultation Record</SelectItem>
                                <SelectItem value="specialist">Specialist Clinical Examination</SelectItem>
                                <SelectItem value="emergency">Emergency Intervention Report</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bloodType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blood Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                                disabled={useBiodata && patientInfo?.bloodType !== undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select blood type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {bloodTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="allergies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Allergies</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Patient allergies"
                                  {...field}
                                  disabled={useBiodata && patientInfo?.allergies !== undefined}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="diagnosis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-premium font-bold italic">Clinical Diagnosis</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter diagnosis details"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="treatment">
                          <AccordionTrigger className="text-base font-medium">
                            Clinical Protocol & Prescriptions
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <FormField
                              control={form.control}
                              name="treatment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Clinical Protocol / Intervention</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Enter treatment details"
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="prescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Prescription</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Enter prescription details if any"
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Include medication, dosage, and duration
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="recommendations">
                          <AccordionTrigger className="text-base font-medium">
                            Recommendations & Notes
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <FormField
                              control={form.control}
                              name="recommendations"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Recommendations</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Enter recommendations for the patient"
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Notes</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Enter any additional notes"
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="signature">
                          <AccordionTrigger className="text-base font-medium">
                            Digital Signature & Certification
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <FormField
                              control={form.control}
                              name="doctorSignature"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Provider Digital Signature (Typed)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        placeholder="Type your full name as signature"
                                        className="font-signature text-xl h-12 border-2 border-blue-100 focus:border-blue-500 bg-blue-50/10"
                                        {...field}
                                      />
                                      <div className="absolute right-3 top-3 opacity-20 pointer-events-none">
                                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    By typing your name, you acknowledge that this constitutes a legally binding digital signature.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start space-x-3">
                              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                              <div className="text-xs text-amber-800">
                                <p className="font-bold uppercase mb-1">Security Notice</p>
                                <p>Unauthorised report generation or falsified signatures are strictly prohibited and monitored. Each report includes a unique QR verification code and cryptographic checksum.</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <FormField
                        control={form.control}
                        name="followUpDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow-Up Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center gap-2 pt-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        <p className="text-sm text-muted-foreground">
                          This report will be securely stored and accessible only to authorized personnel.
                        </p>
                      </div>

                      {/* File Upload Section */}
                      <FormField
                        control={form.control}
                        name="files"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-900 font-medium">Attach Supporting Documents (X-rays, Lab Results, etc.)</FormLabel>
                            <FormControl>
                              <div
                                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer group mt-2 ${isDragging
                                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                                  : 'border-gray-200 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-100/50'
                                  }`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDragging(false);
                                  const droppedFiles = Array.from(e.dataTransfer.files);
                                  if (droppedFiles.length > 0) {
                                    field.onChange([...(field.value || []), ...droppedFiles]);
                                  }
                                }}
                                onClick={() => document.getElementById('report-file-upload')?.click()}
                              >
                                <div className="flex flex-col items-center gap-3">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                    }`}>
                                    <Upload className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-900">
                                      {isDragging ? 'Drop files here' : 'Drop files here or click to browse'}
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                      PDF, JPG, PNG, DICOM (Max 10MB per file)
                                    </p>
                                  </div>
                                </div>
                                <input
                                  id="report-file-upload"
                                  type="file"
                                  className="hidden"
                                  multiple
                                  onChange={(e) => {
                                    const selectedFiles = Array.from(e.target.files || []);
                                    field.onChange([...(field.value || []), ...selectedFiles]);
                                  }}
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.dcm"
                                />
                              </div>
                            </FormControl>
                            {field.value && field.value.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {field.value.map((file: File, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded bg-white text-xs">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <FileText className="h-3 w-3 text-gray-600 flex-shrink-0" />
                                      <span className="truncate max-w-[150px]">{file.name}</span>
                                      <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => {
                                        const newFiles = [...(field.value || [])];
                                        newFiles.splice(index, 1);
                                        field.onChange(newFiles);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isGenerating || !patientConsent}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Report
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Report
                          </>
                        )}
                      </Button>

                      {!patientConsent && (
                        <div className="text-sm flex items-center gap-2 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          Patient consent is required to generate the report
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="rounded-none sm:rounded-lg">
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                  <CardDescription>
                    Preview the generated report before downloading.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedReport ? (
                    <div className="space-y-4 border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{generatedReport.centerName}</h3>
                          <p className="text-muted-foreground text-sm">{generatedReport.centerType} - Medical Report</p>
                        </div>
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          {generatedReport.reportType === 'general' ? 'General Checkup' :
                            generatedReport.reportType === 'lab' ? 'Diagnostic Results' :
                              generatedReport.reportType === 'radiology' ? 'Radiology Report' :
                                generatedReport.reportType === 'surgical' ? 'Surgical Report' :
                                  generatedReport.reportType === 'specialist' ? 'Specialist Examination' :
                                    generatedReport.reportType === 'emergency' ? 'Emergency Visit' : 'Consultation'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium block">Report ID:</span>
                          {generatedReport.reportId}
                        </div>
                        <div>
                          <span className="font-medium block">Date:</span>
                          {formatDate(generatedReport.generatedDate || "")}
                        </div>
                        <div>
                          <span className="font-medium block">Patient ID:</span>
                          {generatedReport.patientId}
                        </div>
                        <div>
                          <span className="font-medium block">Patient Name:</span>
                          {patientInfo?.name || "Unknown Patient"}
                        </div>
                        <div>
                          <span className="font-medium block">Blood Type:</span>
                          {generatedReport.bloodType || patientInfo?.bloodType || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium block">Allergies:</span>
                          {generatedReport.allergies || patientInfo?.allergies?.join(", ") || "None recorded"}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium block">Doctor:</span>
                          {generatedReport.doctorName}
                        </div>
                      </div>

                      <hr />

                      <div>
                        <h4 className="font-bold mb-1">Diagnosis</h4>
                        <p className="text-sm whitespace-pre-wrap">{generatedReport.diagnosis}</p>
                      </div>

                      {generatedReport.treatment && (
                        <div>
                          <h4 className="font-bold mb-1">Treatment</h4>
                          <p className="text-sm whitespace-pre-wrap">{generatedReport.treatment}</p>
                        </div>
                      )}

                      {generatedReport.prescription && (
                        <div>
                          <h4 className="font-bold mb-1">Prescription</h4>
                          <p className="text-sm whitespace-pre-wrap">{generatedReport.prescription}</p>
                        </div>
                      )}

                      {generatedReport.recommendations && (
                        <div>
                          <h4 className="font-bold mb-1">Recommendations</h4>
                          <p className="text-sm whitespace-pre-wrap">{generatedReport.recommendations}</p>
                        </div>
                      )}

                      {generatedReport.notes && (
                        <div>
                          <h4 className="font-bold mb-1">Additional Notes</h4>
                          <p className="text-sm whitespace-pre-wrap">{generatedReport.notes}</p>
                        </div>
                      )}

                      {generatedReport.followUpDate && (
                        <div>
                          <h4 className="font-bold mb-1">Follow-Up Appointment</h4>
                          <p className="text-sm">{formatDate(generatedReport.followUpDate)}</p>
                        </div>
                      )}

                      <div className="mt-4 border-t pt-4 flex justify-between items-center">
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Digitally Signed</span>
                        </div>
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => setShowPdfPreview(true)}
                              variant="outline"
                              size="sm"
                              className="border-teal-200 text-teal-700 hover:bg-teal-50"
                            >
                              <Printer className="h-4 w-4 mr-1" />
                              Print/PDF
                            </Button>
                            <Button
                              onClick={() => {
                                if (generatedReport?.pdfUrl) {
                                  window.open(generatedReport.pdfUrl, '_blank');
                                } else {
                                  toast({
                                    title: "Error",
                                    description: "Certified PDF not available.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download Certified PDF
                            </Button>
                          </div>

                          <Card className="border-teal-100 bg-teal-50/50">
                            <CardHeader className="py-3 px-4">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Share className="h-4 w-4" />
                                Grant Report Access
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="py-0 px-4 pb-3 space-y-2">
                              <p className="text-xs text-muted-foreground mb-2">Granting access will make this report visible in the recipient's "Reports" menu.</p>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="secondary"
                                  className="h-8 text-xs bg-white border border-teal-200 hover:bg-teal-100"
                                  onClick={async () => {
                                    try {
                                      await medicalReportsService.grantAccess(generatedReport.reportId!, generatedReport.patientId);
                                      toast({ title: "Access Granted", description: "The patient can now view this report." });
                                    } catch (err) {
                                      toast({ title: "Error", description: "Failed to grant access.", variant: "destructive" });
                                    }
                                  }}
                                >
                                  <User className="h-3.5 w-3.5 mr-1" />
                                  Share with Patient
                                </Button>

                                <Button
                                  variant="secondary"
                                  className="h-8 text-xs bg-white border border-teal-200 hover:bg-teal-100"
                                  onClick={async () => {
                                    if (selectedCenter) {
                                      try {
                                        await medicalReportsService.grantAccess(generatedReport.reportId!, selectedCenter.id);
                                        toast({ title: "Access Granted", description: `Members of ${selectedCenter.name} can now view this report.` });
                                      } catch (err) {
                                        toast({ title: "Error", description: "Failed to grant access.", variant: "destructive" });
                                      }
                                    }
                                  }}
                                >
                                  <Building className="h-3.5 w-3.5 mr-1" />
                                  Share with Center
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="flex gap-2 bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
                        <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <p><span className="font-medium">Security Notice:</span> This report is protected with encryption and access control. Only authorized personnel can access this document.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No report generated yet</h3>
                      <p className="text-muted-foreground mt-2">
                        Fill out the form and generate a report to see the preview here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <MedicalReportFiles patientId={watchPatientId} centerId={selectedCenter?.id} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <MedicalReportFiles patientId={watchPatientId} centerId={selectedCenter?.id} />
        </TabsContent>
      </Tabs>

      {showPdfPreview && generatedReport && patientInfo && (
        <EnhancedReportPdfGenerator
          reportData={generatedReport}
          patientInfo={patientInfo}
          centerInfo={{
            name: selectedCenter.name,
            type: selectedCenter.type,
            address: selectedCenter.address,
            phone: selectedCenter.phone || undefined,
            email: selectedCenter.email || undefined,
          }}
          onClose={() => setShowPdfPreview(false)}
        />
      )}
    </div>
  );
};

// Helper functions
const calculateAge = (dob: string): number | string => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};


