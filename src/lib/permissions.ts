
export type UserRole = 
  | 'doctor' 
  | 'nurse' 
  | 'pharmacist' 
  | 'biotech_engineer' 
  | 'mortuary_attendant' 
  | 'patient' 
  | 'admin' 
  | 'allied_practitioner' 
  | 'diagnostic' 
  | 'maternity' 
  | 'other';

export interface PermissionSet {
  canViewClinicalNotes: boolean;
  canViewVitals: boolean;
  canViewCarePlan: boolean;
  canViewPrescriptions: boolean;
  canViewLabResults: boolean;
  canViewPsychNotes: boolean;
  canViewDiagnoses: boolean;
  canViewDeceasedInfo: boolean;
  canViewTransportLogs: boolean;
  canViewDeviceLogs: boolean;
  canViewRepairTickets: boolean;
  canViewFinancialInfo: boolean;
  canViewAdminAuditLogs: boolean;
  canViewOtherPatients: boolean;
  canViewDeviceInventory: boolean;
  canViewBilling: boolean;
  canViewOrdersOnly: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionSet> = {
  doctor: {
    canViewClinicalNotes: true,
    canViewVitals: true,
    canViewCarePlan: true,
    canViewPrescriptions: true,
    canViewLabResults: true,
    canViewPsychNotes: true, // Usually true with consent
    canViewDiagnoses: true,
    canViewDeceasedInfo: true,
    canViewTransportLogs: true,
    canViewDeviceLogs: false,
    canViewRepairTickets: false,
    canViewFinancialInfo: false,
    canViewAdminAuditLogs: false,
    canViewOtherPatients: true,
    canViewDeviceInventory: false,
    canViewBilling: false,
    canViewOrdersOnly: false,
  },
  nurse: {
    canViewClinicalNotes: true,
    canViewVitals: true,
    canViewCarePlan: true,
    canViewPrescriptions: true,
    canViewLabResults: true,
    canViewPsychNotes: false,
    canViewDiagnoses: true,
    canViewDeceasedInfo: false,
    canViewTransportLogs: false,
    canViewDeviceLogs: false,
    canViewRepairTickets: false,
    canViewFinancialInfo: false,
    canViewAdminAuditLogs: false,
    canViewOtherPatients: true,
    canViewDeviceInventory: false,
    canViewBilling: false,
    canViewOrdersOnly: false,
  },
  pharmacist: {
    canViewClinicalNotes: false,
    canViewVitals: false,
    canViewCarePlan: false,
    canViewPrescriptions: true,
    canViewLabResults: true, // Relevant labs
    canViewPsychNotes: false,
    canViewDiagnoses: false,
    canViewDeceasedInfo: false,
    canViewTransportLogs: false,
    canViewDeviceLogs: false,
    canViewRepairTickets: false,
    canViewFinancialInfo: false,
    canViewAdminAuditLogs: false,
    canViewOtherPatients: false,
    canViewDeviceInventory: false,
    canViewBilling: false,
    canViewOrdersOnly: true,
  },
  biotech_engineer: {
    canViewClinicalNotes: false,
    canViewVitals: false,
    canViewCarePlan: false,
    canViewPrescriptions: false,
    canViewLabResults: false,
    canViewPsychNotes: false,
    canViewDiagnoses: false,
    canViewDeceasedInfo: false,
    canViewTransportLogs: false,
    canViewDeviceLogs: true,
    canViewRepairTickets: true,
    canViewFinancialInfo: false,
    canViewAdminAuditLogs: false,
    canViewOtherPatients: false,
    canViewDeviceInventory: true,
    canViewBilling: false,
    canViewOrdersOnly: false,
  },
  mortuary_attendant: {
    canViewClinicalNotes: false,
    canViewVitals: false,
    canViewCarePlan: false,
    canViewPrescriptions: false,
    canViewLabResults: false,
    canViewPsychNotes: false,
    canViewDiagnoses: false,
    canViewDeceasedInfo: true,
    canViewTransportLogs: true,
    canViewDeviceLogs: false,
    canViewRepairTickets: false,
    canViewFinancialInfo: false,
    canViewAdminAuditLogs: false,
    canViewOtherPatients: false,
    canViewDeviceInventory: false,
    canViewBilling: false,
    canViewOrdersOnly: false,
  },
  patient: {
    canViewClinicalNotes: true, // Their own
    canViewVitals: true, // Their own
    canViewCarePlan: true, // Their own
    canViewPrescriptions: true, // Their own
    canViewLabResults: true, // Their own
    canViewPsychNotes: true, // Their own
    canViewDiagnoses: true, // Their own
    canViewDeceasedInfo: false,
    canViewTransportLogs: false,
    canViewDeviceLogs: false,
    canViewRepairTickets: false,
    canViewFinancialInfo: true, // Their own
    canViewAdminAuditLogs: false,
    canViewOtherPatients: false,
    canViewDeviceInventory: false,
    canViewBilling: true,
    canViewOrdersOnly: false,
  },
  admin: {
    canViewClinicalNotes: true,
    canViewVitals: true,
    canViewCarePlan: true,
    canViewPrescriptions: true,
    canViewLabResults: true,
    canViewPsychNotes: true,
    canViewDiagnoses: true,
    canViewDeceasedInfo: true,
    canViewTransportLogs: true,
    canViewDeviceLogs: true,
    canViewRepairTickets: true,
    canViewFinancialInfo: true,
    canViewAdminAuditLogs: true,
    canViewOtherPatients: true,
    canViewDeviceInventory: true,
    canViewBilling: true,
    canViewOrdersOnly: false,
  },
  allied_practitioner: {
    canViewClinicalNotes: true,
    canViewVitals: true,
    canViewCarePlan: true,
    canViewPrescriptions: false,
    canViewLabResults: true,
    canViewPsychNotes: false,
    canViewDiagnoses: true,
    canViewDeceasedInfo: false,
    canViewTransportLogs: false,
    canViewDeviceLogs: false,
    canViewRepairTickets: false,
    canViewFinancialInfo: false,
    canViewAdminAuditLogs: false,
    canViewOtherPatients: true,
    canViewDeviceInventory: false,
    canViewBilling: false,
    canViewOrdersOnly: false,
  },
  diagnostic: {
    canViewClinicalNotes: false,
    canViewVitals: true,
    canViewCarePlan: false,
    canViewPrescriptions: false,
    canViewLabResults: true,
    canViewPsychNotes: false,
    canViewDiagnoses: false,
    canViewDeceasedInfo: false,
    canViewTransportLogs: false,
    canViewDeviceLogs: false,
    canViewRepairTickets: false,
    canViewFinancialInfo: false,
    canViewAdminAuditLogs: false,
    canViewOtherPatients: true,
    canViewDeviceInventory: false,
    canViewBilling: false,
    canViewOrdersOnly: true,
  },
  maternity: {
    canViewClinicalNotes: true,
    canViewVitals: true,
    canViewCarePlan: true,
    canViewPrescriptions: false,
    canViewLabResults: true,
    canViewPsychNotes: false,
    canViewDiagnoses: true,
    canViewDeceasedInfo: false,
    canViewTransportLogs: false,
    canViewDeviceLogs: false,
    canViewRepairTickets: false,
    canViewFinancialInfo: false,
    canViewAdminAuditLogs: false,
    canViewOtherPatients: true,
    canViewDeviceInventory: false,
    canViewBilling: false,
    canViewOrdersOnly: false,
  },
  other: {
    canViewClinicalNotes: false,
    canViewVitals: false,
    canViewCarePlan: false,
    canViewPrescriptions: false,
    canViewLabResults: false,
    canViewPsychNotes: false,
    canViewDiagnoses: false,
    canViewDeceasedInfo: false,
    canViewTransportLogs: false,
    canViewDeviceLogs: false,
    canViewRepairTickets: false,
    canViewFinancialInfo: false,
    canViewAdminAuditLogs: false,
    canViewOtherPatients: false,
    canViewDeviceInventory: false,
    canViewBilling: false,
    canViewOrdersOnly: true,
  }
};

export const hasPermission = (roles: string[] | undefined, permission: keyof PermissionSet): boolean => {
  if (!roles || roles.length === 0) return false;
  
  // If any of the user's roles have the permission, return true
  return roles.some(role => {
    const roleKey = role as UserRole;
    return ROLE_PERMISSIONS[roleKey]?.[permission] || false;
  });
};

export const getPermissions = (roles: string[] | undefined): PermissionSet => {
  const emptyPermissions: PermissionSet = {
    canViewClinicalNotes: false,
    canViewVitals: false,
    canViewCarePlan: false,
    canViewPrescriptions: false,
    canViewLabResults: false,
    canViewPsychNotes: false,
    canViewDiagnoses: false,
    canViewDeceasedInfo: false,
    canViewTransportLogs: false,
    canViewDeviceLogs: false,
    canViewRepairTickets: false,
    canViewFinancialInfo: false,
    canViewAdminAuditLogs: false,
    canViewOtherPatients: false,
    canViewDeviceInventory: false,
    canViewBilling: false,
    canViewOrdersOnly: false,
  };

  if (!roles || roles.length === 0) return emptyPermissions;

  return roles.reduce((acc, role) => {
    const roleKey = role as UserRole;
    const rolePerms = ROLE_PERMISSIONS[roleKey];
    if (!rolePerms) return acc;

    // Combine permissions (OR logic)
    const combined: any = { ...acc };
    Object.keys(rolePerms).forEach((key) => {
      combined[key] = combined[key] || (rolePerms as any)[key];
    });
    return combined as PermissionSet;
  }, emptyPermissions);
};
