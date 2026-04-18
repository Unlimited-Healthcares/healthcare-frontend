
import { MedicalReportData, PatientBiodata } from "@/types/patient";
import { Notification } from "@/hooks/use-notifications";

export interface MedicalReportNotificationParams {
  reportData: MedicalReportData;
  patientData?: PatientBiodata;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
}

export const sendReportGeneratedNotification = (params: MedicalReportNotificationParams) => {
  const { reportData, patientData, addNotification } = params;
  
  // Notification to doctor
  addNotification({
    title: "Report Generated",
    message: `Medical report for ${patientData?.name || "Patient"} has been successfully generated.`,
    type: "success",
    link: `/reports/${reportData.reportId}`,
  });
  
  // In a real application, we would also send a notification to the patient
  // This would typically be done via SMS, email, or push notification
  console.log(`[MOCK] Sending notification to patient with ID: ${reportData.patientId}`);
};

export const sendReportSharedNotification = (params: MedicalReportNotificationParams) => {
  const { reportData, patientData, addNotification } = params;
  
  // Notification about sharing
  addNotification({
    title: "Report Shared",
    message: `Medical report for ${patientData?.name || "Patient"} has been shared with the patient.`,
    type: "info",
  });
  
  console.log(`[MOCK] Sending report access link to patient with ID: ${reportData.patientId}`);
};

export const sendReportAccessRequestNotification = (params: MedicalReportNotificationParams & { 
  requestingDoctorName?: string, 
  requestingCenterName?: string 
}) => {
  const { patientData, addNotification, requestingDoctorName, requestingCenterName } = params;
  
  // Notification about access request
  addNotification({
    title: "Report Access Request",
    message: `Dr. ${requestingDoctorName || "Unknown"} from ${requestingCenterName || "Unknown Center"} has requested access to ${patientData?.name || "Patient"}'s medical report.`,
    type: "warning",
    link: `/reports/access-requests`,
  });
};
