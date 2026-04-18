import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from "@/components/ui/button";
import { Printer, Download, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import QRCode from "react-qr-code";

interface CenterInfo {
  name: string;
  type?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface ReportData {
  reportId: string;
  patientId: string;
  patientName: string;
  center: string;
  centerType?: string;
  centerAddress?: string;
  centerPhone?: string;
  centerEmail?: string;
  doctor: string;
  generatedDate: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  followUpDate?: string;
}

interface PatientInfo {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface ReportPdfProps {
  reportData: ReportData;
  patientInfo: PatientInfo;
  centerInfo: CenterInfo;
  onClose: () => void;
}

export const ReportPdfGenerator: React.FC<ReportPdfProps> = ({ reportData, onClose }) => {
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
      description: `The report has been shared with ${reportData.patientName}.`,
    });
  };

  const qrCodeValue = JSON.stringify({
    reportId: reportData.reportId,
    patientId: reportData.patientId,
    center: reportData.center,
    doctor: reportData.doctor,
    date: reportData.generatedDate,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Medical Report Preview</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-grow">
          <div className="bg-white p-6" ref={reportRef}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold">{reportData.center}</h1>
                <p className="text-muted-foreground">{reportData.centerType || 'Healthcare Center'}</p>
                <div className="text-sm mt-2 space-y-1">
                  <p>{reportData.centerAddress}</p>
                  {reportData.centerPhone && <p>Phone: {reportData.centerPhone}</p>}
                  {reportData.centerEmail && <p>Email: {reportData.centerEmail}</p>}
                </div>
              </div>
              <div>
                <div className="text-right mb-2">
                  <p className="font-bold">Report ID: {reportData.reportId}</p>
                  <p>Date: {new Date(reportData.generatedDate).toLocaleDateString()}</p>
                </div>
                <div className="border p-2 bg-white">
                  <QRCode value={qrCodeValue} size={80} />
                </div>
              </div>
            </div>
            
            <div className="border-b pb-4 mb-4">
              <h2 className="font-bold text-lg mb-2">Patient Information</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium">Patient Name:</p>
                  <p>{reportData.patientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Patient ID:</p>
                  <p>{reportData.patientId}</p>
                </div>
              </div>
            </div>
            
            <div className="border-b pb-4 mb-4">
              <h2 className="font-bold text-lg mb-2">Diagnosis</h2>
              <p className="whitespace-pre-wrap">{reportData.diagnosis}</p>
            </div>
            
            {reportData.prescription && (
              <div className="border-b pb-4 mb-4">
                <h2 className="font-bold text-lg mb-2">Prescription</h2>
                <p className="whitespace-pre-wrap">{reportData.prescription}</p>
              </div>
            )}
            
            {reportData.notes && (
              <div className="border-b pb-4 mb-4">
                <h2 className="font-bold text-lg mb-2">Additional Notes</h2>
                <p className="whitespace-pre-wrap">{reportData.notes}</p>
              </div>
            )}
            
            {reportData.followUpDate && (
              <div className="mb-4">
                <h2 className="font-bold text-lg mb-2">Follow-Up Appointment</h2>
                <p>{new Date(reportData.followUpDate).toLocaleDateString()}</p>
              </div>
            )}
            
            <div className="mt-8 pt-4 border-t">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">Attending Physician:</p>
                  <p>{reportData.doctor}</p>
                </div>
                <div className="text-right">
                  <img 
                    src="/doctor-signature.png" 
                    alt="Doctor Signature" 
                    className="h-16 w-48 object-contain mb-2"
                    onError={(e) => {
                      // If signature image fails to load, replace with text
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML += `<p class="font-signature text-lg">${reportData.doctor}</p>`;
                    }}
                  />
                  <p className="text-sm border-t border-dashed pt-1">Digital Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t p-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Mail className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
