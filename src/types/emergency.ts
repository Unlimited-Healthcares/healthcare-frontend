// Emergency Alert Types
export enum AlertType {
  SOS = 'sos',
  MEDICAL_EMERGENCY = 'medical_emergency',
  ACCIDENT = 'accident',
  FIRE = 'fire',
  NATURAL_DISASTER = 'natural_disaster',
  SECURITY_THREAT = 'security_threat',
  PANIC = 'panic'
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESPONDING = 'responding',
  RESOLVED = 'resolved',
  FALSE_ALARM = 'false_alarm',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RequestStatus {
  PENDING = 'pending',
  DISPATCHED = 'dispatched',
  ACKNOWLEDGED = 'acknowledged',
  EN_ROUTE = 'en_route',
  ON_SCENE = 'on_scene',
  TRANSPORTING = 'transporting',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ViralReportType {
  OUTBREAK_REPORT = 'outbreak_report',
  EXPOSURE_REPORT = 'exposure_report',
  SYMPTOM_REPORT = 'symptom_report',
  CONTACT_TRACE = 'contact_trace',
  RECOVERY_REPORT = 'recovery_report'
}

export enum ReportStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  INVESTIGATED = 'investigated',
  CLOSED = 'closed',
  DISMISSED = 'dismissed'
}

// Emergency Alert Interface
export interface EmergencyAlert {
  id: string;
  alertNumber: string;
  type: AlertType;
  status: AlertStatus;
  userId: string;
  patientId?: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  contactNumber: string;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
    is_primary: boolean;
  }>;
  medicalInfo?: {
    blood_type?: string;
    allergies?: string[];
    medications?: string[];
    medical_conditions?: string[];
    emergency_medical_notes?: string;
  };
  responderIds?: string[];
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  responseTimeMinutes?: number;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Emergency Contact Interface
export interface EmergencyContact {
  id: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  relationship: string;
  isPrimary: boolean;
  isMedicalContact: boolean;
  contactAddress?: string;
  notes?: string;
  notificationPreferences?: {
    sms: boolean;
    email: boolean;
    voice_call: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Ambulance Interface
export interface Ambulance {
  id: string;
  vehicleNumber: string;
  licensePlate: string;
  type: string;
  status: string;
  isActive: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: Date;
  contactNumber: string;
  crewMembers: Record<string, string>;
  equipmentList: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Ambulance Team Member Interface
export interface AmbulanceTeamMember {
  name: string;
  role: string; // e.g., 'Driver', 'Doctor', 'Nurse', 'HCA'
  appId?: string;
}

// Ambulance Request Interface
export interface AmbulanceRequest {
  id: string;
  requestNumber: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  destinationAddress?: string;
  medicalCondition: string;
  symptoms?: string;
  priority: Priority;
  status: RequestStatus;
  specialRequirements?: string;
  medicalHistory?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    blood_type?: string;
  };
  requestedBy: string;
  ambulanceId?: string;
  ambulance?: Ambulance;
  dispatchedAt?: Date;
  acknowledgedAt?: Date;
  arrivedAt?: Date;
  completedAt?: Date;
  estimatedArrival?: Date;
  actualArrival?: Date;
  totalCost?: number;
  insuranceInfo?: {
    provider?: string;
    policy_number?: string;
    group_number?: string;
  };
  teamPersonnel?: AmbulanceTeamMember[];
  triageLevel?: 'red' | 'yellow' | 'green';
  vitals?: {
    hr?: number;
    bp?: string;
    spo2?: number;
    gcs?: number;
    bloodGlucose?: number;
    temp?: number;
    timestamp: Date;
  }[];
  mechanismOfInjury?: string;
  sceneMedia?: string[];
  liveEcgActive?: boolean;
  medicalOrders?: {
    id: string;
    order: string;
    orderedBy: string;
    timestamp: Date;
    status: 'pending' | 'completed' | 'declined';
  }[];
  medsAdministered?: {
    name: string;
    dosage: string;
    administeredBy: string;
    timestamp: Date;
  }[];
  preHospitalReportUrl?: string;
  patientConditionOnScene?: string;
  handoverDetails?: {
    facilityName: string;
    receiverName: string;
    receiverPhone: string;
    receiverEmail?: string;
    deliveredAt: Date;
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Viral Report Interface
export interface ViralReport {
  id: string;
  reportNumber: string;
  type: ViralReportType;
  status: ReportStatus;
  reportedBy?: string;
  isAnonymous: boolean;
  diseaseType: string;
  symptoms: string[];
  onsetDate?: Date;
  exposureDate?: Date;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
  contactInformation?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  affectedCount: number;
  description?: string;
  riskFactors?: string[];
  preventiveMeasures?: string[];
  healthcareFacilityVisited?: string;
  testResults?: {
    test_type?: string;
    result?: string;
    test_date?: Date;
    lab_name?: string;
  };
  healthAuthorityNotified: boolean;
  notificationSentAt?: Date;
  investigatedBy?: string;
  investigationNotes?: string;
  publicHealthActions?: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Emergency KPIs Interface
export interface EmergencyKPIs {
  activeAlerts: number;
  activeAlertsChange: number;
  criticalAlerts: number;
  criticalAlertsChange: number;
  pendingAmbulances: number;
  pendingAmbulancesChange: number;
  dispatchedAmbulances: number;
  dispatchedAmbulancesChange: number;
  averageResponseTime: number;
  averageResponseTimeChange: number;
  viralReports: number;
  viralReportsChange: number;
}

// Filter Interfaces
export interface AlertFilters {
  type?: AlertType;
  status?: AlertStatus;
  page?: number;
  limit?: number;
}

export interface AmbulanceRequestFilters {
  status?: RequestStatus;
  priority?: Priority;
  ambulanceId?: string;
  page?: number;
  limit?: number;
}

export interface ViralReportFilters {
  type?: ViralReportType;
  status?: ReportStatus;
  diseaseType?: string;
  page?: number;
  limit?: number;
}

// API Response Interfaces
export interface EmergencyAlertsResponse {
  data: EmergencyAlert[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AmbulanceRequestsResponse {
  data: AmbulanceRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ViralReportsResponse {
  data: ViralReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Create DTOs
export interface CreateSOSAlertDto {
  type: AlertType;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  contactNumber: string;
  patientId?: string;
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    medicalConditions?: string[];
    emergencyContacts?: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
    notes?: string;
  };
  isTestAlert?: boolean;
}

export interface CreateAmbulanceRequestDto {
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  destinationAddress?: string;
  medicalCondition: string;
  symptoms?: string;
  priority: Priority;
  specialRequirements?: string;
  medicalHistory?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    blood_type?: string;
  };
  insuranceInfo?: {
    provider?: string;
    policy_number?: string;
    group_number?: string;
  };
  teamPersonnel?: AmbulanceTeamMember[];
  metadata?: Record<string, unknown>;
}

export interface CreateViralReportDto {
  type: ViralReportType;
  isAnonymous?: boolean;
  diseaseType: string;
  symptoms: string[];
  onsetDate?: Date;
  exposureDate?: Date;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
  contactInformation?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  affectedCount?: number;
  description?: string;
  riskFactors?: string[];
  preventiveMeasures?: string[];
  healthcareFacilityVisited?: string;
  testResults?: {
    test_type?: string;
    result?: string;
    test_date?: Date;
    lab_name?: string;
  };
}
