// Healthcare Center Types - Based on Backend DTOs
// Base URL: https://api.unlimtedhealth.com/api

// Core Center Interface (from HealthcareCenter entity)
export interface HealthcareCenter {
  id: string;                           // UUID - Primary key
  displayId: string;                    // Human-readable display ID
  name: string;                         // Center name
  type: string;                         // Center type (from CenterType enum)
  address: string;                      // Full address
  latitude?: number;                    // Latitude coordinate
  longitude?: number;                   // Longitude coordinate
  city?: string;                        // City name
  state?: string;                       // State/Province
  country?: string;                     // Country
  postalCode?: string;                  // Postal/ZIP code
  phone?: string;                       // Phone number
  email?: string;                       // Email address
  hours?: string;                       // Operating hours
  businessRegistrationNumber?: string;  // Business Registration Number
  businessRegistrationDocUrl?: string;  // Business Registration Document URL
  locationMetadata?: Record<string, unknown>;  // Location metadata (timezone, elevation, etc.)
  isActive: boolean;                    // Whether center is active
  createdAt: string;                    // Creation timestamp
  updatedAt: string;                    // Last update timestamp
}

// Center Service Interface (from CenterService entity)
export interface CenterService {
  id: string;                           // UUID - Primary key
  centerId: string;                     // UUID - Center ID
  serviceName: string;                  // Service name
  serviceCategory?: string;             // Service category (consultation, diagnostic, etc.)
  description?: string;                 // Service description
  durationMinutes?: number;             // Duration in minutes
  basePrice?: number;                   // Base price
  currency?: string;                    // Price currency (e.g., NGN, USD)
  isEmergencyService: boolean;          // Is emergency service
  requiresAppointment: boolean;         // Requires appointment
  isActive: boolean;                    // Is service active
  createdAt: string;                    // Creation timestamp
  updatedAt: string;                    // Last update timestamp
}

// Center Staff Interface (from CenterStaff entity)
export interface CenterStaff {
  id: string;                           // UUID - Primary key
  userId: string;                       // UUID - User ID
  centerId: string;                     // UUID - Center ID
  role: string;                         // Staff role (doctor, nurse, staff, etc.)
  user: {
    id: string;                         // UUID - User ID
    email: string;                      // User email
    profile: {
      firstName: string;                // First name
      lastName: string;                 // Last name
      displayName: string;              // Display name
      specialization?: string;          // Medical specialization
      licenseNumber?: string;           // Practice number
      experience?: string;              // Years of experience
    };
  };
  createdAt: string;                    // Creation timestamp
}

// Appointment Interface (from Appointment entity)
export interface Appointment {
  id: string;                           // UUID - Primary key
  patientId: string;                    // UUID - Patient ID
  centerId: string;                     // UUID - Center ID
  providerId?: string;                  // UUID - Provider ID
  appointmentTypeId?: string;           // UUID - Appointment type ID
  appointmentDate: string;              // ISO date string - Appointment date/time
  durationMinutes: number;              // Duration in minutes
  appointmentStatus: string;            // Appointment status (scheduled, confirmed, etc.)
  status: string;                       // General status (pending, etc.)
  priority: string;                     // Priority level (low, normal, high, urgent)
  reason: string;                       // Reason for appointment
  notes?: string;                       // Additional notes
  doctor: string;                       // Doctor name
  isRecurring: boolean;                 // Is recurring appointment
  recurrencePattern?: {                 // Recurrence pattern for recurring appointments
    frequency?: string;
    interval?: number;
    count?: number;
    endDate?: string;
    daysOfWeek?: string[];
    dayOfMonth?: number;
    occurrences?: number;
  };
  parentAppointmentId?: string;         // UUID - Parent appointment for recurring series
  confirmationStatus: string;           // Confirmation status (pending, confirmed, declined)
  confirmedAt?: string;                 // ISO date string - Confirmation timestamp
  reminderSentAt?: string;              // ISO date string - Reminder sent timestamp
  cancellationReason?: string;          // Cancellation reason
  cancelledBy?: string;                 // UUID - User who cancelled
  cancelledAt?: string;                 // ISO date string - Cancellation timestamp
  rescheduledFrom?: string;             // UUID - Original appointment if rescheduled
  metadata?: Record<string, unknown>;   // Additional metadata
  createdAt: string;                    // Creation timestamp
  updatedAt: string;                    // Last update timestamp
}

// Time Slot Interface
export interface TimeSlot {
  time: string;                         // Time in HH:MM format
  available: boolean;                   // Is slot available
  duration: number;                     // Slot duration in minutes
  serviceId?: string;                   // UUID - Associated service ID
}

// Filter Interfaces
export interface CenterFilters {
  type?: string;                        // Center type filter
  city?: string;                        // City filter
  state?: string;                       // State filter
  search?: string;                      // Search term
  latitude?: number;                    // Latitude for location search
  longitude?: number;                   // Longitude for location search
  radius?: number;                      // Search radius in km
  page?: number;                        // Page number
  limit?: number;                       // Items per page
}

export interface AppointmentFilters {
  page?: number;                        // Page number
  limit?: number;                       // Items per page
  centerId?: string;                    // UUID - Center ID filter
  providerId?: string;                  // UUID - Provider ID filter
  patientId?: string;                   // UUID - Patient ID filter
  status?: string;                      // Status filter
  dateFrom?: string;                    // Start date filter (YYYY-MM-DD)
  dateTo?: string;                      // End date filter (YYYY-MM-DD)
}

// DTO Interfaces (for API requests)
export interface CreateCenterDto {
  name: string;                         // Center name
  type: string;                         // Center type (from CenterType enum)
  address: string;                      // Center address
  phone?: string;                       // Phone number
  email?: string;                       // Email address
  hours?: string;                       // Operating hours
  businessRegistrationNumber?: string;  // Business Registration Number
  businessRegistrationDoc?: any;         // Business Registration Document (File or URL)
}

export interface CreateCenterServiceDto {
  centerId: string;                     // UUID - Center ID
  serviceName: string;                  // Service name
  serviceCategory?: string;             // Service category
  description?: string;                 // Service description
  durationMinutes?: number;             // Duration in minutes
  basePrice?: number;                   // Base price
  currency?: string;                    // Price currency
  isEmergencyService?: boolean;         // Is emergency service
  requiresAppointment?: boolean;        // Requires appointment
}

export interface CreateAppointmentDto {
  patientId: string;                    // UUID - Patient ID
  centerId: string;                     // UUID - Center ID
  providerId?: string;                  // UUID - Provider ID
  appointmentTypeId?: string;           // UUID - Appointment type ID
  appointmentDate: string;              // ISO date string
  durationMinutes?: number;             // Duration in minutes
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  reason: string;                       // Reason for appointment
  notes?: string;                       // Additional notes
  doctor: string;                       // Doctor name
  isRecurring?: boolean;                // Is recurring appointment
  recurrencePattern?: {
    frequency?: string;
    interval?: number;
    count?: number;
    endDate?: string;
    daysOfWeek?: string[];
    dayOfMonth?: number;
    occurrences?: number;
  };
}

export interface UpdateAppointmentDto {
  // All CreateAppointmentDto fields are optional
  patientId?: string;
  centerId?: string;
  providerId?: string;
  appointmentTypeId?: string;
  appointmentDate?: string;             // ISO date string
  durationMinutes?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  reason?: string;
  notes?: string;
  doctor?: string;
  isRecurring?: boolean;
  recurrencePattern?: {
    frequency?: string;
    interval?: number;
    count?: number;
    endDate?: string;
    daysOfWeek?: string[];
    dayOfMonth?: number;
    occurrences?: number;
  };

  // Additional update-specific fields
  appointmentStatus?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  confirmationStatus?: 'pending' | 'confirmed' | 'declined';
  cancellationReason?: string;
  confirmedAt?: string;                 // ISO date string
  metadata?: Record<string, unknown>;
}

// Center Type Enum (from CenterType enum)
export enum CenterType {
  HOSPITAL = 'hospital',
  PHARMACY = 'pharmacy',
  RADIOLOGY = 'radiology',
  DENTAL = 'dental',
  EYE = 'eye',
  MATERNITY = 'maternity',
  AMBULANCE = 'ambulance',
  VIROLOGY = 'virology',
  PSYCHIATRIC = 'psychiatric',
  CARE_HOME = 'care-home',
  HOSPICE = 'hospice',
  FUNERAL = 'funeral',
  DIAGNOSTIC = 'diagnostic',
  FITNESS_CENTER = 'fitness-center',
  AMBULANCE_SERVICE = 'ambulance_service',
  MORTUARY = 'mortuary'
}

// Service Type Interfaces
export type ServiceType = 'medical' | 'emergency' | 'support' | 'specialized';

export interface EmergencyRequest {
  id: string;
  centerId: string;
  patientName: string;
  patientAge: number;
  medicalCondition: string;
  location: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  contactName: string;
  contactPhone: string;
  relationship: string;
  status: 'pending' | 'dispatched' | 'en-route' | 'completed';
  createdAt: string;
}

export interface ConsultationRequest {
  id: string;
  centerId: string;
  serviceType: string;
  patientInfo: {
    name: string;
    age: number;
    condition?: string;
  };
  careNeeds: string;
  specialRequirements?: string;
  preferredContactMethod: 'phone' | 'email' | 'in-person';
  status: 'pending' | 'scheduled' | 'completed';
  createdAt: string;
}

export interface SpecializedService {
  id: string;
  centerId: string;
  serviceName: string;
  customRequirements: string;
  schedulingPreferences: string;
  additionalInfo?: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed';
  createdAt: string;
}

// Service Category Interface
export interface ServiceCategory {
  category: string;
  requiresAppointment: boolean;
  isEmergencyService: boolean;
  bookingFlow: 'appointment' | 'request' | 'consultation' | 'immediate';
  formFields: string[];
}

// Center Type Labels
export const CENTER_TYPE_LABELS: Record<string, string> = {
  [CenterType.HOSPITAL]: 'Hospital',
  [CenterType.PHARMACY]: 'Pharmacy',
  [CenterType.RADIOLOGY]: 'Radiology Center',
  [CenterType.DENTAL]: 'Dental Clinic',
  [CenterType.EYE]: 'Eye Clinic',
  [CenterType.MATERNITY]: 'Maternity Center',
  [CenterType.AMBULANCE]: 'Ambulance Drivers / Medical Transport Teams',
  [CenterType.VIROLOGY]: 'Virology Center',
  [CenterType.PSYCHIATRIC]: 'Psychiatric Center',
  [CenterType.CARE_HOME]: 'Care Home',
  [CenterType.HOSPICE]: 'Hospice',
  [CenterType.FUNERAL]: 'Funeral Service',
  [CenterType.DIAGNOSTIC]: 'Diagnostic Center',
  [CenterType.FITNESS_CENTER]: 'Fitness Centre',
  [CenterType.AMBULANCE_SERVICE]: 'Ambulance Service',
  [CenterType.MORTUARY]: 'Mortuary'
};

// Service Categories Configuration
export const SERVICE_CATEGORIES: Record<string, ServiceCategory> = {
  'consultation': {
    category: 'consultation',
    requiresAppointment: true,
    isEmergencyService: false,
    bookingFlow: 'appointment',
    formFields: ['reason', 'notes', 'preferredDate']
  },
  'emergency': {
    category: 'emergency',
    requiresAppointment: false,
    isEmergencyService: true,
    bookingFlow: 'immediate',
    formFields: ['patientInfo', 'location', 'urgency', 'contactInfo']
  },
  'assessment': {
    category: 'assessment',
    requiresAppointment: true,
    isEmergencyService: false,
    bookingFlow: 'consultation',
    formFields: ['patientInfo', 'careNeeds', 'specialRequirements']
  },
  'immediate': {
    category: 'immediate',
    requiresAppointment: false,
    isEmergencyService: true,
    bookingFlow: 'immediate',
    formFields: ['deceasedInfo', 'specialRequests', 'contactInfo']
  },
  'prescription': {
    category: 'prescription',
    requiresAppointment: false,
    isEmergencyService: false,
    bookingFlow: 'request',
    formFields: ['prescriptionInfo', 'pickupTime']
  }
};

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Error Types
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
