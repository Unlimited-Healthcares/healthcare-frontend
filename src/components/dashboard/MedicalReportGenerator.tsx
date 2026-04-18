import React, { useState, useEffect, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, FileText, Loader2, Printer, Share, Building } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ReportPdfGenerator } from "./ReportPdfGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationsContext } from "@/context/NotificationsContext";
import { sendReportGeneratedNotification, sendReportSharedNotification } from "@/services/medical-report-notification";
import { Label } from "@/components/ui/label";

const reportSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  reportType: z.string().min(1, "Report type is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface HealthcareCenter {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  hours?: string | null;
  image_url?: string | null;
  display_id?: string | null;
}

interface GeneratedReport {
  patientId: string;
  reportType: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  followUpDate?: string;
  reportId: string;
  generatedDate: string;
  doctor: string;
  center: string;
  centerType: string;
  centerAddress: string;
  centerPhone: string;
  centerEmail: string;
  centerId: string;
  patientName: string;
}

interface PatientInfo {
  name: string;
  gender: string;
  age: number;
  bloodType: string;
}

const mockCenters: HealthcareCenter[] = [];

export const MedicalReportGenerator = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { addNotification } = useNotificationsContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  // @ts-ignore - patientInfo will be used once real fetching is implemented
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [centers, setCenters] = useState<HealthcareCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<HealthcareCenter | null>(null);
  const [isLoadingCenters, setIsLoadingCenters] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      patientId: "",
      reportType: "",
      diagnosis: "",
      prescription: "",
      notes: "",
      followUpDate: "",
    },
  });

  useEffect(() => {
    const fetchCenters = async () => {
      setIsLoadingCenters(true);
      try {
        const { data, error } = await supabase
          .from("healthcare_centers")
          .select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          setCenters(data);
          // Set the user's center as default if available
          if (profile?.center_id) {
            const userCenter = data.find(c => c.id === profile.center_id);
            if (userCenter) {
              setSelectedCenter(userCenter);
            }
          }
        } else {
          // Fallback to mock data if no centers found
          setCenters(mockCenters);
          setSelectedCenter(mockCenters[0]);
        }
      } catch (error) {
        console.error("Error fetching healthcare centers:", error);
        // Fallback to mock data on error
        setCenters(mockCenters);
        setSelectedCenter(mockCenters[0]);
        toast({
          title: "Error loading centers",
          description: "Using default healthcare centers.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCenters(false);
      }
    };

    fetchCenters();
  }, [profile?.center_id, toast]);

  const fetchPatientDetails = useCallback(async (patientId: string) => {
    if (!patientId) return;

    setIsLoadingPatient(true);

    try {
      // In real implementation, this would fetch from Supabase
      setIsLoadingPatient(false);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive",
      });
      setIsLoadingPatient(false);
    }
  }, [toast]);

  const watchPatientId = form.watch("patientId");

  React.useEffect(() => {
    const debouncedFetch = setTimeout(() => {
      if (watchPatientId) {
        fetchPatientDetails(watchPatientId);
      }
    }, 500);

    return () => clearTimeout(debouncedFetch);
  }, [watchPatientId, fetchPatientDetails]);

  async function onSubmit(data: ReportFormValues) {
    if (!selectedCenter) {
      toast({
        title: "Healthcare center required",
        description: "Please select a healthcare center for this report.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // In a real app, this would save to Supabase and potentially trigger notifications
      // Real implementation would handle this properly via service
      const reportData: GeneratedReport = {
        patientId: data.patientId,
        reportType: data.reportType,
        diagnosis: data.diagnosis,
        prescription: data.prescription,
        notes: data.notes,
        followUpDate: data.followUpDate,
        reportId: "RPT-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        generatedDate: new Date().toISOString(),
        doctor: profile?.name || "Practitioner",
        center: selectedCenter.name,
        centerType: selectedCenter.type,
        centerAddress: selectedCenter.address,
        centerPhone: selectedCenter.phone || "",
        centerEmail: selectedCenter.email || "",
        centerId: selectedCenter.id,
        patientName: patientInfo?.name || "Patient",
      };

      setGeneratedReport(reportData);
      setIsGenerating(false);

      toast({
        title: "Report generated successfully",
        description: "The medical report has been generated and is ready for download.",
      });

      // Send notification
      sendReportGeneratedNotification({
        reportData: {
          ...data,
          patientId: data.patientId,
          reportType: data.reportType,
          doctorName: profile?.name || "Practitioner",
          reportId: reportData.reportId,
          generatedDate: reportData.generatedDate,
          diagnosis: data.diagnosis || "",
          centerName: selectedCenter.name,
        },
        patientData: patientInfo ? {
          id: data.patientId,
          name: patientInfo.name,
          gender: patientInfo.gender,
          bloodType: patientInfo.bloodType
        } : undefined,
        addNotification
      });
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Error generating report",
        description: "There was a problem generating the report. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleShareReport = () => {
    if (!generatedReport) return;

    // Send notification for sharing
    sendReportSharedNotification({
      reportData: {
        patientId: generatedReport.patientId,
        reportType: generatedReport.reportType,
        diagnosis: generatedReport.diagnosis || "",
        prescription: generatedReport.prescription,
        doctorName: profile?.name || "Practitioner",
        reportId: generatedReport.reportId,
        generatedDate: generatedReport.generatedDate,
        centerName: generatedReport.center,
      },
      patientData: patientInfo ? {
        id: generatedReport.patientId,
        name: patientInfo.name
      } : undefined,
      addNotification
    });

    toast({
      title: "Report shared",
      description: "The report has been shared with the patient.",
    });
  };

  return (
    <div className="w-full px-0 sm:px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 px-4 sm:px-0">Medical Report Generator</h1>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="rounded-none sm:rounded-lg">
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
            <CardDescription>
              Create a new medical report by filling out the form below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Healthcare Center Selection */}
            <div className="mb-6 space-y-2">
              <Label htmlFor="center">Healthcare Center</Label>
              <Select
                value={selectedCenter?.id}
                onValueChange={(value) => {
                  const center = centers.find(c => c.id === value);
                  if (center) setSelectedCenter(center);
                }}
                disabled={isLoadingCenters}
              >
                <SelectTrigger id="center" className="w-full">
                  <SelectValue placeholder="Select healthcare center" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map(center => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name} ({center.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCenter && (
                <div className="rounded-md border p-3 mt-2 bg-muted/20 text-sm">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <Building className="h-4 w-4" />
                    {selectedCenter.name}
                  </div>
                  <div>Type: {selectedCenter.type}</div>
                  <div>Address: {selectedCenter.address}</div>
                  {selectedCenter.phone && <div>Phone: {selectedCenter.phone}</div>}
                  {selectedCenter.email && <div>Email: {selectedCenter.email}</div>}
                </div>
              )}
            </div>

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
                        <div className="p-3 bg-muted rounded-md text-sm">
                          <p><span className="font-medium">Patient:</span> {patientInfo.name}</p>
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            <p><span className="font-medium">Age:</span> {patientInfo.age}</p>
                            <p><span className="font-medium">Gender:</span> {patientInfo.gender}</p>
                            <p><span className="font-medium">Blood Type:</span> {patientInfo.bloodType}</p>
                          </div>
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
                          <SelectItem value="general">General Checkup</SelectItem>
                          <SelectItem value="lab">Diagnostic Results</SelectItem>
                          <SelectItem value="radiology">Radiology Report</SelectItem>
                          <SelectItem value="surgical">Surgical Report</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis</FormLabel>
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isGenerating || !selectedCenter}
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
                    <h3 className="font-bold text-lg">{generatedReport.center}</h3>
                    <p className="text-muted-foreground text-sm">{generatedReport.centerType}</p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    {generatedReport.reportType === 'general' ? 'General Checkup' :
                      generatedReport.reportType === 'lab' ? 'Diagnostic Results' :
                        generatedReport.reportType === 'radiology' ? 'Radiology Report' :
                          generatedReport.reportType === 'surgical' ? 'Surgical Report' : 'Consultation'}
                  </div>
                </div>

                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>{generatedReport.centerAddress}</p>
                  {generatedReport.centerPhone && <p>Phone: {generatedReport.centerPhone}</p>}
                  {generatedReport.centerEmail && <p>Email: {generatedReport.centerEmail}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium block">Report ID:</span>
                    {generatedReport.reportId}
                  </div>
                  <div>
                    <span className="font-medium block">Date:</span>
                    {new Date(generatedReport.generatedDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium block">Patient ID:</span>
                    {generatedReport.patientId}
                  </div>
                  <div>
                    <span className="font-medium block">Patient Name:</span>
                    {generatedReport.patientName}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium block">Doctor:</span>
                    {generatedReport.doctor}
                  </div>
                </div>

                <hr />

                <div>
                  <h4 className="font-bold mb-1">Diagnosis</h4>
                  <p className="text-sm whitespace-pre-wrap">{generatedReport.diagnosis}</p>
                </div>

                {generatedReport.prescription && (
                  <div>
                    <h4 className="font-bold mb-1">Prescription</h4>
                    <p className="text-sm whitespace-pre-wrap">{generatedReport.prescription}</p>
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
                    <p className="text-sm">{new Date(generatedReport.followUpDate).toLocaleDateString()}</p>
                  </div>
                )}

                <div className="mt-4 border-t pt-4 flex justify-between items-center">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Digitally Signed</span>
                  </div>
                  <div className="space-x-2">
                    <Button
                      onClick={() => setShowPdfPreview(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print/PDF
                    </Button>
                    <Button
                      onClick={handleShareReport}
                      size="sm"
                    >
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
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

      {showPdfPreview && generatedReport && (
        <ReportPdfGenerator
          reportData={generatedReport}
          patientInfo={patientInfo ? {
            id: generatedReport.patientId,
            name: patientInfo.name,
            gender: patientInfo.gender,
            age: patientInfo.age,
            bloodType: patientInfo.bloodType
          } : {
            id: generatedReport.patientId,
            name: generatedReport.patientName
          }}
          centerInfo={{
            name: generatedReport.center,
            type: generatedReport.centerType,
            address: generatedReport.centerAddress,
            phone: generatedReport.centerPhone,
            email: generatedReport.centerEmail
          }}
          onClose={() => setShowPdfPreview(false)}
        />
      )}
    </div>
  );
};
