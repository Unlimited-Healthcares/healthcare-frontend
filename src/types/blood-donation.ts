// Blood Type Enum
export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

// Donor Status Enum
export enum DonorStatus {
  ELIGIBLE = 'eligible',
  TEMPORARILY_DEFERRED = 'temporarily_deferred',
  PERMANENTLY_DEFERRED = 'permanently_deferred',
  SUSPENDED = 'suspended',
}

// Request Status Enum
export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

// Request Priority Enum
export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Donation Status Enum
export enum DonationStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

// Blood Donor Interface
export interface BloodDonor {
  id: string;
  userId: string;
  donorNumber: string;
  bloodType: BloodType;
  weightKg?: number;
  heightCm?: number;
  dateOfBirth: Date;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions: string[];
  medications: string[];
  lastDonationDate?: Date;
  nextEligibleDate?: Date;
  totalDonations: number;
  totalRewardPoints: number;
  status: DonorStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Blood Donation Request Interface
export interface BloodDonationRequest {
  id: string;
  requestNumber: string;
  requestingCenterId: string;
  patientName?: string;
  patientAge?: number;
  bloodType: BloodType;
  unitsNeeded: number;
  unitsFulfilled: number;
  priority: RequestPriority;
  status: RequestStatus;
  neededBy: Date;
  medicalCondition?: string;
  specialRequirements?: string;
  contactPerson?: string;
  contactPhone?: string;
  approvedBy?: string;
  approvedAt?: Date;
  fulfilledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Blood Donation Interface
export interface BloodDonation {
  id: string;
  donationNumber: string;
  donorId: string;
  requestId?: string;
  bloodBankCenterId: string;
  donationDate: Date;
  bloodType: BloodType;
  volumeMl: number;
  status: DonationStatus;
  preDonationVitals?: Record<string, string | number>;
  postDonationVitals?: Record<string, string | number>;
  preScreeningResults?: Record<string, unknown>;
  postDonationMonitoring?: Record<string, unknown>;
  notes?: Record<string, unknown>;
  staffNotes?: string;
  compensationAmount: number;
  paymentStatus: string;
  paymentReference?: string;
  expiryDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Blood Inventory Interface
export interface BloodInventory {
  id: string;
  centerId: string;
  bloodType: BloodType;
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  expiredUnits: number;
  minimumThreshold: number;
  lastUpdated: Date;
}

// DTOs for API calls
export interface CreateBloodDonorDto {
  bloodType: BloodType;
  weightKg?: number;
  heightCm?: number;
  dateOfBirth: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string[];
  medications?: string[];
  notes?: string;
}

export interface CreateBloodDonationRequestDto {
  requestingCenterId: string;
  patientName?: string;
  patientAge?: number;
  bloodType: BloodType;
  unitsNeeded: number;
  priority: RequestPriority;
  neededBy: string;
  medicalCondition?: string;
  specialRequirements?: string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
}

export interface CreateBloodDonationDto {
  donorId: string;
  requestId?: string;
  bloodBankCenterId: string;
  donationDate: string;
  bloodType: BloodType;
  volumeMl?: number;
  preDonationVitals?: Record<string, string | number>;
  postDonationVitals?: Record<string, string | number>;
  screeningResults?: Record<string, string | number>;
  staffNotes?: string;
  compensationAmount?: number;
  preScreeningResults?: Record<string, unknown>;
  postDonationMonitoring?: Record<string, unknown>;
  notes?: string;
}

// Filter interfaces
export interface DonorFilters {
  page?: number;
  limit?: number;
  status?: DonorStatus;
  bloodType?: string;
}

export interface RequestFilters {
  page?: number;
  limit?: number;
  status?: RequestStatus;
  priority?: RequestPriority;
  bloodType?: string;
  centerId?: string;
}

// API Response interfaces
export interface BloodDonationApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard analytics interfaces
export interface BloodDonationAnalytics {
  totalDonors: number;
  eligibleDonors: number;
  pendingRequests: number;
  lowStockAlerts: number;
  donationTrends: {
    month: string;
    donations: number;
    requests: number;
  }[];
  inventoryDistribution: {
    bloodType: BloodType;
    availableUnits: number;
  }[];
}
