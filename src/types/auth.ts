// User roles and permissions
export type UserRole = 'patient' | 'doctor' | 'staff' | 'admin' | 'center_staff' | 'center' | 'nurse' | 'diagnostic' | 'pharmacy' | 'fitness_center' | 'mortuary' | 'maternity' | 'virology' | 'psychiatric' | 'biotech_engineer' | 'ambulance_service' | 'allied_practitioner'

export interface User {
  id: string
  email: string
  name?: string
  displayId?: string
  roles: UserRole[]
  isActive: boolean
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED'
  professionalStatus: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED'
  licenseExpiryDate?: string
  profile?: UserProfile
  createdAt?: string
  updatedAt?: string
  lastLoginAt?: string
  // Do not mirror UI-only completion flag on core user
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
  roles: UserRole[]
  phone?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token?: string
  user: User
  token_type?: string
  expires_in?: number
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

// User profile types
export interface UserProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  phoneNumber?: string; // Legacy field for some parts of the app
  phone?: string;       // Backend field name
  address?: string;
  location?: {
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: { lat: number; lng: number }
  };
  emergencyContacts: EmergencyContact[]
  insurance?: InsuranceInfo
  medicalHistory?: MedicalHistory
  preferences: UserPreferences
  avatar?: string;
  // Professional fields
  specialization?: string;
  licenseNumber?: string;
  practiceNumber?: string;
  experience?: string;
  services?: any[];
  certificates?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phoneNumber: string
  email?: string
  isPrimary: boolean
}

export interface InsuranceInfo {
  provider: string
  policyNumber: string
  groupNumber?: string
  expirationDate?: string
}

export interface MedicalHistory {
  allergies: string[]
  medications: string[]
  conditions: string[]
  surgeries: string[]
  familyHistory: string[]
}

export interface UserPreferences {
  notifications: boolean
  emailUpdates: boolean
  smsUpdates: boolean
  pushNotifications: boolean
  language: string;
  timezone: string;
  biometricEnabled?: boolean;
}

// Profile completion tracking
export interface ProfileCompletion {
  percentage: number
  missingFields: string[]
  completedSections: string[]
  requiredFields: string[]
  optionalFields: string[]
}

// API response types
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Error types
export interface ApiError {
  message: string
  status: number
  code?: string
  details?: any
}

// Form validation types
export interface ValidationError {
  field: string
  message: string
}

export interface FormState<T> {
  data: T
  errors: ValidationError[]
  isValid: boolean
  isSubmitting: boolean
}
