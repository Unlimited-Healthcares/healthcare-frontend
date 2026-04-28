// Profile types for different user roles based on API documentation

export interface PaymentMethod {
  type: 'paystack' | 'flutterwave'
  label: string
  details: {
    subaccount: string
    [key: string]: any
  }
  instructions?: string
}

export interface PaymentSettings {
  requireUpfrontPayment: boolean
  methods: PaymentMethod[]
  consultationFee?: number
  serviceFee?: number
  currency?: string // Default: USD
}

// Base user profile interface
export interface BaseUserProfile {
  id: string
  firstName?: string
  lastName?: string
  displayName?: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  bloodGroup?: string
  genotype?: string
  height?: number
  weight?: number
  location?: {
    city?: string
    state?: string
    country?: string
    postalCode?: string
    coordinates?: { lat?: number; lng?: number }
  }
  bodyTemperature?: number
  bloodPressure?: string
  allergies?: string
  chronicDisease?: 'yes' | 'no' | 'na'
  createdAt: string
  updatedAt: string
  paymentSettings?: PaymentSettings
}

// Patient profile interface
export interface PatientProfile extends BaseUserProfile {
  specialization?: null
  licenseNumber?: null
  experience?: null
}

// Doctor profile interface
export interface DoctorProfile extends BaseUserProfile {
  specialization: string
  licenseNumber: string
  experience: string
}

export interface CenterPersonnel {
  id?: string
  name: string
  practiceNumber: string
  dateIssued?: string
  expiryDate?: string
  email?: string
  phone?: string
  specialization?: string
  role?: string
}

export interface CenterService {
  id?: string
  name: string
  description?: string
  category?: string
  price?: number
  currency?: string
  is_available?: boolean
}

export interface CenterEquipment {
  id?: string
  name: string
  description?: string
  status?: string
  count?: number
}

// Center profile interface
export interface CenterProfile {
  id: string
  name: string
  type: CenterType
  logoUrl?: string
  address: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  phone?: string
  email?: string
  hours?: string
  businessRegistrationNumber?: string
  businessRegNumber?: string
  businessRegistrationDocUrl?: string
  businessRegCertificateUrl?: string
  registrationDateIssued?: string
  registrationExpiryDate?: string
  numberOfStaff?: number
  attachedFacilityName?: string
  leadProfessionalName?: string
  leadProfessionalLicense?: string
  leadProfessionalIssueDate?: string
  leadProfessionalExpiryDate?: string
  leadProfessionalEmail?: string
  leadProfessionalPhone?: string
  personnels?: CenterPersonnel[]
  services?: CenterService[]
  equipment?: CenterEquipment[]
  displayId: string
  paymentSettings?: PaymentSettings
  locationMetadata?: any
  createdAt: string
  updatedAt: string
}

// Center types enum
export enum CenterType {
  HOSPITAL = 'hospital',
  PHARMACY = 'pharmacy',
  DIAGNOSTIC = 'diagnostic',
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
  FITNESS_CENTER = 'fitness-center',
  AMBULANCE_SERVICE = 'ambulance_service',
  MORTUARY = 'mortuary'
}

// Center type option for forms
export interface CenterTypeOption {
  value: CenterType
  label: string
}

// API DTOs for requests
export interface CreateProfileDto {
  firstName?: string
  lastName?: string
  displayName?: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  bloodGroup?: string
  genotype?: string
  height?: number
  weight?: number
  location?: {
    city?: string
    state?: string
    country?: string
    postalCode?: string
    coordinates?: { lat?: number; lng?: number }
  }
  specialization?: string
  licenseNumber?: string
  experience?: string
  paymentSettings?: PaymentSettings
}

export interface CreateCenterDto {
  name: string
  type: CenterType
  logoUrl?: string
  address: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  phone?: string
  email?: string
  hours?: string
  businessRegistrationNumber?: string
  businessRegNumber?: string
  businessRegistrationDocUrl?: string
  businessRegCertificateUrl?: string
  registrationDateIssued?: string
  registrationExpiryDate?: string
  numberOfStaff?: number
  attachedFacilityName?: string
  leadProfessionalName?: string
  leadProfessionalLicense?: string
  leadProfessionalIssueDate?: string
  leadProfessionalExpiryDate?: string
  leadProfessionalEmail?: string
  leadProfessionalPhone?: string
  personnels?: CenterPersonnel[]
  services?: CenterService[]
  equipment?: CenterEquipment[]
  paymentSettings?: PaymentSettings
}

export interface UpdateCenterDto extends Partial<CreateCenterDto> { }

// API response types
export interface UserWithProfile {
  id: string
  email: string
  roles: string[]
  displayId: string
  profile?: BaseUserProfile
  createdAt: string
  updatedAt: string
  lastLogin?: string
  isActive: boolean
}

export interface AuthMeResponse {
  success: boolean
  data: UserWithProfile
}

// Form validation types
export interface ProfileFormData {
  firstName: string
  lastName: string
  displayName: string
  phone: string
  avatar: string
  dateOfBirth: string
  gender: string
  address: string
  bloodGroup?: string
  genotype?: string
  height?: string
  weight?: string
  location?: {
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
  bodyTemperature?: string
  bloodPressure?: string
  allergies?: string
  chronicDisease?: string
  specialization?: string
  licenseNumber?: string
  experience?: string
  paymentSettings?: PaymentSettings
  services?: any[]
  certificates?: any[]
}

export interface CenterFormData {
  name: string
  type: CenterType
  address: string
  phone: string
  email: string
  hours: string
  businessRegistrationNumber: string
  businessRegistrationDocUrl: string
  registrationDateIssued?: string
  registrationExpiryDate?: string
  numberOfStaff?: number
  attachedFacilityName?: string
  leadProfessionalName?: string
  leadProfessionalLicense?: string
  personnels?: CenterPersonnel[]
  paymentSettings?: PaymentSettings
  services?: any[]
  equipment?: any[]
}

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
] as const

// Profile completion tracking
export interface ProfileCompletion {
  percentage: number
  missingFields: string[]
  completedSections: string[]
  requiredFields: string[]
  optionalFields: string[]
}

// Role-based profile requirements
export interface RoleProfileRequirements {
  patient: {
    required: string[]
    optional: string[]
  }
  doctor: {
    required: string[]
    optional: string[]
  }
  center: {
    required: string[]
    optional: string[]
  }
  diagnostic: {
    required: string[]
    optional: string[]
  }
  pharmacy: {
    required: string[]
    optional: string[]
  }
  fitness_center: {
    required: string[]
    optional: string[]
  }
  ambulance_service: {
    required: string[]
    optional: string[]
  }
  mortuary: {
    required: string[]
    optional: string[]
  }
  maternity: {
    required: string[]
    optional: string[]
  }
  biotech_engineer: {
    required: string[]
    optional: string[]
  }
  allied_practitioner: {
    required: string[]
    optional: string[]
  }
}

export const PROFILE_REQUIREMENTS: RoleProfileRequirements = {
  patient: {
    required: ['firstName', 'lastName', 'phone'],
    optional: ['displayName', 'avatar', 'dateOfBirth', 'gender', 'address', 'bloodGroup', 'genotype', 'height', 'weight']
  },
  doctor: {
    required: ['firstName', 'lastName', 'phone', 'specialization', 'licenseNumber', 'experience'],
    optional: ['displayName', 'avatar', 'dateOfBirth', 'gender', 'address', 'bloodGroup', 'genotype', 'height', 'weight']
  },
  biotech_engineer: {
    required: ['firstName', 'lastName', 'phone', 'specialization', 'experience'],
    optional: ['displayName', 'avatar', 'dateOfBirth', 'gender', 'address', 'bloodGroup', 'genotype', 'height', 'weight']
  },
  center: {
    required: ['name', 'type', 'address'],
    optional: ['phone', 'email', 'hours', 'businessRegistrationNumber', 'businessRegistrationDocUrl', 'attachedFacilityName', 'leadProfessionalName', 'leadProfessionalLicense']
  },
  diagnostic: {
    required: ['name', 'address', 'businessRegistrationNumber'],
    optional: ['phone', 'email', 'hours', 'businessRegistrationDocUrl', 'leadProfessionalName', 'leadProfessionalLicense']
  },
  pharmacy: {
    required: ['name', 'address', 'businessRegistrationNumber'],
    optional: ['phone', 'email', 'hours', 'businessRegistrationDocUrl', 'leadProfessionalName', 'leadProfessionalLicense']
  },
  fitness_center: {
    required: ['name', 'address', 'businessRegistrationNumber'],
    optional: ['phone', 'email', 'hours', 'businessRegistrationDocUrl', 'leadProfessionalName', 'leadProfessionalLicense']
  },
  ambulance_service: {
    required: ['name', 'address', 'businessRegistrationNumber'],
    optional: ['phone', 'email', 'hours', 'businessRegistrationDocUrl', 'attachedFacilityName', 'leadProfessionalName', 'leadProfessionalLicense']
  },
  mortuary: {
    required: ['name', 'address', 'businessRegistrationNumber'],
    optional: ['phone', 'email', 'hours', 'businessRegistrationDocUrl', 'leadProfessionalName', 'leadProfessionalLicense']
  },
  maternity: {
    required: ['name', 'address', 'businessRegistrationNumber'],
    optional: ['phone', 'email', 'hours', 'businessRegistrationDocUrl', 'leadProfessionalName', 'leadProfessionalLicense']
  },
  allied_practitioner: {
    required: ['firstName', 'lastName', 'phone', 'specialization', 'experience'],
    optional: ['displayName', 'avatar', 'dateOfBirth', 'gender', 'address', 'bloodGroup', 'genotype', 'height', 'weight']
  }
}
