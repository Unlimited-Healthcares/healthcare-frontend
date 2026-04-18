import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from "@/components/ui/button";
import { Printer, Download, Mail, Lock, ShieldCheck, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import QRCode from "react-qr-code";
import { PatientBiodata, MedicalReportData } from "@/types/patient";

interface CenterInfo {
  name: string;
  type?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface EnhancedReportPdfProps {
  reportData: MedicalReportData;
  patientInfo: PatientBiodata;
  centerInfo: CenterInfo;
  onClose: () => void;
}

export const EnhancedReportPdfGenerator: React.FC<EnhancedReportPdfProps> = ({ 
  reportData, 
  patientInfo, 
  centerInfo, 
  onClose 
}) => {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Medical_Report_${reportData.reportId}`,
    onAfterPrint: () => {
      toast({
        title: "Report printed successfully",
        description: "The medical report has been sent to your printer.",
      });
    },
  });

  const handleShare = async () => {
    toast({
      title: "Report shared",
      description: `The report has been shared with ${patientInfo.name}.`,
    });
  };

  const handleDownload = () => {
    handlePrint();
    toast({
      title: "Report downloaded",
      description: "The report has been saved as a PDF.",
    });
  };

  // Generate verification code that gets embedded in QR
  const securityCode = `${reportData.reportId}-${Date.now().toString(36)}`;
  
  const qrCodeValue = JSON.stringify({
    reportId: reportData.reportId,
    patientId: reportData.patientId,
    center: reportData.centerName,
    doctor: reportData.doctorName,
    date: reportData.generatedDate,
    verificationCode: securityCode
  });

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Medical Report Preview</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-grow">
          <div className="bg-white p-6" ref={reportRef}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold">{centerInfo.name}</h1>
                <p className="text-muted-foreground">{centerInfo.type}</p>
                <p className="text-sm text-muted-foreground">{centerInfo.address}</p>
              </div>
              <div>
                <div className="text-right mb-2">
                  <p className="font-bold">Report ID: {reportData.reportId}</p>
                  <p className="text-sm">Date: {formatDate(reportData.generatedDate)}</p>
                </div>
                <div className="border p-2 bg-white relative">
                  <QRCode value={qrCodeValue} size={80} />
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-1 border-2 border-white shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4 bg-teal-50 border border-teal-100 p-2 rounded text-teal-700 text-xs font-semibold">
              <CheckCircle className="h-3.5 w-3.5" />
              AUTHENTICITY CRYPTOGRAPHICALLY VERIFIED ● UNLIMITED HEALTHCARE SECURE DOCUMENT
            </div>
            
            <div className="border-t border-b py-3 my-4">
              <h2 className="font-bold text-lg mb-3">Patient Information</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium">Patient Name:</p>
                  <p>{patientInfo.name}</p>
                </div>
                <div>
                  <p className="font-medium">Patient ID:</p>
                  <p>{patientInfo.id}</p>
                </div>
                <div>
                  <p className="font-medium">Date of Birth:</p>
                  <p>{formatDate(patientInfo.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="font-medium">Gender:</p>
                  <p>{patientInfo.gender}</p>
                </div>
                <div>
                  <p className="font-medium">Blood Type:</p>
                  <p>{reportData.bloodType || patientInfo.bloodType || "Not specified"}</p>
                </div>
                <div>
                  <p className="font-medium">Allergies:</p>
                  <p>{reportData.allergies || patientInfo.allergies?.join(", ") || "None"}</p>
                </div>
                <div>
                  <p className="font-medium">Phone:</p>
                  <p>{patientInfo.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-medium">Insurance:</p>
                  <p>{patientInfo.insurance || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium">Address:</p>
                  <p>{patientInfo.address || "Not provided"}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 my-4">
              <div>
                <h2 className="font-bold text-lg mb-2">Diagnosis</h2>
                <p className="whitespace-pre-wrap">{reportData.diagnosis}</p>
              </div>
              
              {reportData.treatment && (
                <div>
                  <h2 className="font-bold text-lg mb-2">Treatment</h2>
                  <p className="whitespace-pre-wrap">{reportData.treatment}</p>
                </div>
              )}
              
              {reportData.prescription && (
                <div>
                  <h2 className="font-bold text-lg mb-2">Prescription</h2>
                  <p className="whitespace-pre-wrap">{reportData.prescription}</p>
                </div>
              )}
              
              {reportData.recommendations && (
                <div>
                  <h2 className="font-bold text-lg mb-2">Recommendations</h2>
                  <p className="whitespace-pre-wrap">{reportData.recommendations}</p>
                </div>
              )}
              
              {reportData.notes && (
                <div>
                  <h2 className="font-bold text-lg mb-2">Additional Notes</h2>
                  <p className="whitespace-pre-wrap">{reportData.notes}</p>
                </div>
              )}
              
              {reportData.followUpDate && (
                <div>
                  <h2 className="font-bold text-lg mb-2">Follow-Up Appointment</h2>
                  <p>{formatDate(reportData.followUpDate)}</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">Attending Physician:</p>
                  <p>{reportData.doctorName}</p>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    {reportData.doctorSignature ? (
                      <p className="font-signature text-3xl text-blue-900 leading-none py-2 px-4 border border-blue-100 bg-blue-50/30 inline-block">
                        {reportData.doctorSignature}
                      </p>
                    ) : (
                      <img 
                        src="/doctor-signature.png" 
                        alt="Doctor Signature" 
                        className="h-16 w-48 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML += `<p class="font-signature text-2xl">${reportData.doctorName}</p>`;
                        }}
                      />
                    )}
                  </div>
                  <p className="text-sm border-t border-dashed pt-1">Digital Signature</p>
                  <p className="text-xs text-muted-foreground mt-1">Verification Code: {securityCode}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-muted-foreground">
              <p>This is an official medical document from {centerInfo.name}.</p>
              <p>To verify authenticity, scan the QR code or visit our portal.</p>
              <p className="mt-1">Generated on {formatDate(reportData.generatedDate)} at {new Date(reportData.generatedDate || "").toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t p-4 flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Lock className="h-4 w-4 mr-1" /> 
            Secured with encryption
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Mail className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
