import { PaymentSettings } from './profile';

// Discovery System Type Definitions - Sanitized for Public Display
export interface User {
  id: string;                // Internal ID for requests
  publicId: string;          // Safe public identifier (e.g., "DR651842456")
  name: string;              // Full name (e.g., "Dr. John Smith")
  displayName: string;       // Display name only (e.g., "Dr. John Smith")
  email?: string;            // User email (optional when sanitized)
  roles?: string[];          // Roles for routing/permissions (optional in some responses)
  specialty?: string;        // Medical specialty
  licenseExpiryDate?: string | Date; // Professional license expiry date
  phone?: string;            // Professional phone number
  profile?: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    avatar?: string;
    bio?: string;
    bloodGroup?: string;
    genotype?: string;
    height?: number;
    weight?: number;
    [key: string]: unknown;
  } | any;             // Complete profile data from API (sanitized subset above)
  location?: {              // General location only - no exact addresses
    city: string;
    state: string;
    country: string;
  };
  distance?: string;        // Distance from user (e.g., "1.2 km")
  matchesCount?: number;    // Number of services matching user's request
  rating?: number;          // User rating
  avatar?: string;          // Avatar URL
  qualifications?: string[]; // Professional qualifications (sanitized)
  experience?: string;      // Years of experience (e.g., "10+ years")
  bio?: string;             // Professional bio
  joinedAt?: string;        // Subscription date
  availability?: {          // General availability only
    timezone: string;
    generalAvailability: string;
    schedule?: Record<string, any>;
    isAvailable?: boolean;
  };
  privacySettings?: {
    profileVisibility: string;
    dataSharing: {
      allowPatientRequests: boolean;
      allowCenterInvitations: boolean;
      allowCollaboration: boolean;
    };
    contactPreferences: {
      allowDirectMessages: boolean;
      allowEmailNotifications: boolean;
      allowSmsNotifications: boolean;
    };
  };
  offeredServices?: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    category?: string;
  }[];
  services?: any[]; // Alias for offeredServices to match backend
  paymentSettings?: PaymentSettings;
  patientId?: string;
  publicVitals?: {
    bloodType?: string;
    heartRate?: number;
    bp?: string;
    temp?: string;
    spO2?: number;
    height?: string;
    weight?: string;
    bloodGroup?: string;
  };
  metadata?: Record<string, any>;
}

export interface Center {
  id: string;                // Internal ID for requests
  publicId: string;          // Safe public identifier (e.g., "HSP563335216")
  name: string;              // Center name
  type?: string;             // Center type (hospital, diagnostic center, etc.)
  description?: string;      // Center description
  address?: string;          // Full address for navigation
  city?: string;             // City name
  state?: string;            // State/Province
  zipCode?: string;          // ZIP/Postal code
  latitude?: number;         // Latitude coordinate
  longitude?: number;        // Longitude coordinate
  generalLocation: {         // General location info
    city: string;
    state: string;
    country: string;
  };
  locationMetadata?: {       // Additional location details
    building?: string;
    floor?: string;
    entrance?: string;
    [key: string]: unknown;
  };
  businessRegistrationNumber?: string;
  businessRegistrationDocUrl?: string;
  hours?: string;            // Operating hours
  operatingHours?: Record<string, any>; // Detailed operating hours
  rating?: number;           // Center rating
  reviewCount?: number;      // Number of reviews
  distance?: string;         // Distance from user (e.g., "1.2 km")
  matchesCount?: number;     // Number of services matching user's request
  serviceCategories?: string[]; // Available services
  staff?: any[];             // Staff information
  phone?: string;            // Phone number
  email?: string;            // Email address
  website?: string;          // Website URL
  isActive: boolean;         // Whether center is active
  createdAt?: string;        // Creation timestamp
  acceptingNewPatients?: boolean; // New patient status
  offeredServices?: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    category?: string;
  }[];
  services?: any[]; // Alias for offeredServices to match backend
  paymentSettings?: PaymentSettings;
}

export interface SearchParams {
  type?: 'doctor' | 'center' | 'practitioner' | 'patient' | 'biotech_engineer' | 'allied_practitioner' | 'nurse' | 'diagnostic' | 'maternity';
  specialty?: string;
  city?: string;
  state?: string;
  country?: string;
  service?: string;
  search?: string;
  page?: number;
  limit?: number;
  // Note: experience and availability are not supported by backend SearchUsersDto
  // They are kept for frontend UI state management but filtered out in API calls
  experience?: number;
  availability?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface CenterSearchParams {
  type?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  radius?: number;
  service?: string;
  acceptingNewPatients?: boolean;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface Request {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  requestType: 'connection' | 'collaboration' | 'patient_request' | 'staff_invitation' | 'referral' | 'consultation_request' | 'service_interest' | 'lab_order' | 'pharmacy_transfer' | 'radiology_order';
  message: string;
  responseMessage?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'scheduled' | 'declined' | 'completed';
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string; // When the recipient responded (approval/rejection)
  expiresAt?: string;
  // Optional full user objects when backend includes SafeUserDto
  sender?: {
    id?: string;
    publicId?: string;
    displayName?: string;
    email?: string;
    profile?: {
      displayName?: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      dateOfBirth?: string;
      gender?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      bloodGroup?: string;
      genotype?: string;
      height?: number;
      weight?: number;
    };
    roles?: string[];
  };
  recipient?: {
    id?: string;
    publicId?: string;
    displayName?: string;
    email?: string;
    profile?: {
      displayName?: string;
      firstName?: string;
      lastName?: string;
      bloodGroup?: string;
      genotype?: string;
      height?: number;
      weight?: number;
    };
    roles?: string[];
  };
}

export interface CreateRequestData {
  recipientId?: string;
  requestType: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface Invitation {
  id: string;
  email: string;
  invitationType: 'staff_invitation' | 'patient_invitation' | 'doctor_invitation';
  role?: string;
  message: string;
  centerId?: string;
  metadata: Record<string, unknown>;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvitationData {
  email: string;
  invitationType: string;
  role?: string;
  message: string;
  centerId?: string;
  metadata?: Record<string, unknown>;
}

export interface AcceptInvitationData {
  name: string;
  password: string;
  phone?: string;
  profileData?: Record<string, unknown>;
}

export interface Availability {
  schedule: Record<string, TimeSlot[]>;
  timezone: string;
  isAvailable: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

export interface OperatingHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'professional_only';
  dataSharing: {
    allowPatientRequests: boolean;
    allowCenterInvitations: boolean;
    allowCollaboration: boolean;
  };
  contactPreferences: {
    allowDirectMessages: boolean;
    allowEmailNotifications: boolean;
    allowSmsNotifications: boolean;
  };
}

export interface UserSearchResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CenterSearchResponse {
  centers: Center[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestResponse {
  requests: Request[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvitationResponse {
  invitations: Invitation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Specialization options
export const SPECIALIZATIONS = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Psychiatrist',
  'Pulmonologist',
  'Gastroenterologist',
  'Nephrologist',
  'Endocrinologist',
  'Oncologist',
  'Hematologist',
  'Rheumatologist',
  'Ophthalmologist',
  'Otolaryngologist',
  'Orthopedist',
  'Urologist',
  'Gynecologist',
  'Obstetrician',
  'Pediatrician',
  'Geriatrician',
  'General Practitioner',
  'Immunologist',
  'Allergist',
  'Pathologist',
  'Radiologist',
  'Anesthesiologist',
  'Surgeon',
  'Plastic Surgeon',
  'Bariatric Surgeon',
  'Vascular Surgeon',
  'Colorectal Surgeon',
  'Cardiothoracic Surgeon',
  'Neurosurgeon',
  'Pediatric Surgeon',
  'Oral & Maxillofacial Surgeon',
  'Dentist',
  'Periodontist',
  'Endodontist',
  'Prosthodontist',
  'Orthodontist',
  'Sports Medicine Specialist',
  'Forensic Pathologist',
  'Geneticist',
  'Hepatologist',
  'Diabetologist',
  'Pain Management Specialist',
  'Sleep Specialist',
  'Tropical Disease Specialist',
  'Nursing',
  'Maternity Care',
  'Biotechnology',
  'Biotech Engineer',
  'Specialist Nurse',
  'Fitness Therapist',
  // Allied Health Specialties
  'Art Therapist',
  'Athletic Trainer / Sports Therapist',
  'Audiologist',
  'Biomedical Scientist / Medical Laboratory Scientist',
  'Cardiovascular Technologist / Cardiac Sonographer',
  'Chiropractor',
  'Clinical Laboratory Technologist / Technician',
  'Cytotechnologist / Cytogenetic Technologist',
  'Dietitian / Nutritionist',
  'Dramatherapist',
  'Exercise Physiologist',
  'Massage Therapist',
  'Medical Laboratory Professional (Microbiologist, Immunologist, etc.)',
  'Medical Radiation Scientist / Radiographer (Diagnostic Imaging)',
  'Medical Sonographer',
  'Music Therapist',
  'Occupational Therapist',
  'Optometrist',
  'Orthotist and Prosthetist',
  'Osteopath',
  'Paramedic / Emergency Medical Technician (EMT)',
  'Pharmacist Technician',
  'Pharmacist',
  'Physiotherapist / Physical Therapist',
  'Podiatrist',
  'Public Health / Environmental Health Inspector',
  'Radiation Therapist',
  'Radiographer / Medical Imaging Technologist',
  'Rehabilitation Technician',
  'Respiratory Therapist',
  'Social Worker',
  'Speech and Language Therapist (Speech‑Language Pathologist)',
  'Anesthesia Technician / Anesthesiologist Assistant',
  'Anesthetic Technologist',
  'Blood‑Bank Technologist',
  'Cardiology / Vascular / Pulmonary Technologist',
  'Counseling / Behavioral Health Counselor',
  'Dental Hygienist',
  'Dental Assistant',
  'Dental Technician',
  'Dialysis / Renal Technologist',
  'Endoscopy Technologist',
  'Forensic / Medico‑Legal Laboratory Technologist',
  'Health‑Information / Medical‑Record Technician',
  'Genetic Counselor',
  'Lactation Consultant',
  'Medical Assistant',
  'Medical Dosimetrist',
  'Medical Physicist',
  'Medical Secretary / Administrative Health Staff',
  'Medical Transcriptionist',
  'Mental Health Counselor / Behavioral‑Health Counselor',
  'Operating Department Practitioner / Surgical Technologist',
  'Physician Assistant / Physician Associate',
  'Sanitary / Infection‑Control Inspector',
  'Surgical and Anesthesia‑Related Technologist',
  'Urology / Renal Technologist',
  'Nurse',
  'Others'
] as const;

// Center types
export const CENTER_TYPES = [
  'Hospital',
  'Eye Clinic',
  'Maternity Center',
  'Emergency Center',
  'Rehabilitation Center',
  'Psychiatric Center',
  'Dental Clinic',
  'Radiology Center',
  'Ambulance',
  'Pharmacy',
  'Gym Center',
  'Diagnostic Center'
] as const;

// Request types
export const REQUEST_TYPES = [
  { value: 'connection', label: 'Professional Connection' },
  { value: 'patient_request', label: 'Patient Request' },
  { value: 'appointment_request', label: 'Direct Booking' },
  { value: 'consultation_request', label: 'Inbound Consultation' },
  { value: 'staff_invitation', label: 'Staff Invitation' },
  { value: 'referral', label: 'Clinical Referral' },
  { value: 'diagnostic_request', label: 'Diagnostic Request' },
  { value: 'appointment_invitation', label: 'Consultation Request' },
  { value: 'lab_order', label: 'Lab Order' },
  { value: 'pharmacy_transfer', label: 'Pharmacy Transfer' },
  { value: 'radiology_order', label: 'Radiology Order' }
] as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
] as const;

// Invitation types
export const INVITATION_TYPES = [
  { value: 'staff_invitation', label: 'Staff Invitation' },
  { value: 'patient_invitation', label: 'Patient Invitation' },
  { value: 'doctor_invitation', label: 'Doctor Invitation' }
] as const;
// Country options (All Countries)
export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Congo-Brazzaville)', 'Congo (DRC)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia (Czech Republic)',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Holy See', 'Honduras', 'Hong Kong', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jersey', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Macau', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'North Korea', 'North Macedonia', 'Northern Mariana Islands', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine State', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico',
  'Qatar',
  'Reunion', 'Romania', 'Russia', 'Rwanda',
  'Saint Barthelemy', 'Saint Helena', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Martin', 'Saint Pierre and Miquelon', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Sint Maarten', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Svalbard and Jan Mayen', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos Islands', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States of America', 'Uruguay', 'US Virgin Islands', 'Uzbekistan',
  'Vanuatu', 'Venezuela', 'Vietnam',
  'Wallis and Futuna', 'Western Sahara',
  'Yemen',
  'Zambia', 'Zimbabwe'
] as const;
