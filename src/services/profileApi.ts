import apiClient from './apiClient'
import {
  CreateProfileDto,
  CreateCenterDto,
  UpdateCenterDto,
  CenterProfile,
  CenterTypeOption,
  UserWithProfile,
  AuthMeResponse
} from '@/types/profile'

export const profileApi = {
  // Get current user profile
  getCurrentUser: async (): Promise<AuthMeResponse> => {
    const response = await apiClient.get<AuthMeResponse>('/auth/me')
    return response.data
  },

  // Get user profile by ID
  getUserProfile: async (): Promise<any> => {
    const response = await apiClient.get('/users/profile')
    return response.data
  },

  // Create or update user profile
  createOrUpdateProfile: async (profileData: CreateProfileDto): Promise<any> => {
    const response = await apiClient.post('/users/profile', profileData)
    return response.data
  },

  // Get user by ID (for admin/doctor/staff)
  getUserById: async (userId: string): Promise<UserWithProfile> => {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  },

  // Center management endpoints
  createCenter: async (centerData: CreateCenterDto): Promise<CenterProfile> => {
    const response = await apiClient.post('/centers', centerData)
    return response.data
  },

  getCenterByUserId: async (userId: string): Promise<CenterProfile> => {
    const response = await apiClient.get(`/centers/user/${userId}`)
    return response.data
  },

  getCenterById: async (centerId: string): Promise<CenterProfile> => {
    const response = await apiClient.get(`/centers/${centerId}`)
    return response.data
  },

  updateCenter: async (centerId: string, updateData: UpdateCenterDto): Promise<CenterProfile> => {
    const response = await apiClient.patch(`/centers/${centerId}`, updateData)
    return response.data
  },

  getCenterTypes: async (): Promise<CenterTypeOption[]> => {
    const response = await apiClient.get('/centers/types')
    return response.data
  },

  // Upload center registration document
  uploadCenterRegistrationDoc: async (centerId: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(`/centers/${centerId}/upload-registration`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload center logo
  uploadCenterLogo: async (centerId: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(`/centers/${centerId}/upload-logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

// Helper function to check if user is a center
export const isCenterUser = (roles: string[]): boolean => {
  return roles.some(role => ['center', 'pharmacy', 'diagnostic', 'fitness_center', 'ambulance_service', 'mortuary'].includes(role))
}

// Helper function to get profile completion percentage
export const calculateProfileCompletion = (
  profile: any,
  userRoles: string[]
): number => {
  if (isCenterUser(userRoles)) {
    // Center profile completion
    const requiredFields = ['name', 'address', 'city', 'state', 'country', 'postalCode', 'businessRegistrationNumber']
    const optionalFields = ['phone', 'email', 'hours', 'businessRegistrationDocUrl', 'logoUrl']
    const allFields = [...requiredFields, ...optionalFields]

    let completedFields = 0
    allFields.forEach(field => {
      let value = profile && profile[field]

      // Handle both naming conventions for business registration
      if (field === 'businessRegistrationNumber' && (value == null || value === '')) {
        value = profile?.businessRegNumber
      }
      if (field === 'businessRegistrationDocUrl' && (value == null || value === '')) {
        value = profile?.businessRegCertificateUrl
      }

      if (value && value.toString().trim() !== '') {
        completedFields++
      }
    })

    return Math.round((completedFields / allFields.length) * 100)
  } else {
    // Professional user?
    const isProfessional = (userRoles || []).some(r => ['doctor', 'nurse', 'biotech_engineer'].includes(r))
    const isBiotech = (userRoles || []).includes('biotech_engineer')

    const requiredFields = ['firstName', 'lastName', 'phone']
    const locationFields = ['city', 'state', 'country', 'postalCode']
    const commonOptionalFields = [
      'displayName', 'avatar', 'dateOfBirth', 'gender', 'address',
      'governmentIdType', 'governmentIdNumber', 'governmentIdDoc'
    ]

    // Professionals don't have these fields in the form
    const patientOnlyFields = isProfessional ? [] : ['bloodGroup', 'genotype', 'height', 'weight', 'bodyTemperature', 'bloodPressure', 'allergies', 'chronicDisease']

    // Only professionals have these
    const professionalFields = isProfessional
      ? (isProfessional && (userRoles || []).includes('biotech_engineer') ? ['specialization', 'experience', 'services', 'certificates'] : ['specialization', 'licenseNumber', 'experience', 'services'])
      : []

    const allBasicFields = [...requiredFields, ...commonOptionalFields, ...patientOnlyFields, ...professionalFields]

    let completedFields = 0
    allBasicFields.forEach(field => {
      // Handle licenseNumber/practiceNumber mapping
      let value = profile && profile[field];
      if (field === 'licenseNumber' && (value == null || value === '')) {
        value = profile?.practiceNumber;
      }

      // Handle services field mapping
      if (field === 'services' && (value == null || (Array.isArray(value) && value.length === 0))) {
        value = profile?.offeredServices || profile?.offered_services;
      }

      // Handle Array fields like 'services'
      if (Array.isArray(value)) {
        if (value.length > 0) {
          // For services, only count if at least one service has a name
          if (field === 'services') {
            const hasRealService = value.some((s: any) => s && (s.name || s.description));
            if (hasRealService) completedFields++
          } else {
            completedFields++
          }
        }
        return;
      }

      if (value != null && value.toString().trim() !== '') {
        completedFields++
      }
    })

    // Check nested location fields
    locationFields.forEach(field => {
      if (profile && profile.location && profile.location[field] && profile.location[field].toString().trim() !== '') {
        completedFields++
      }
    })

    const totalFields = allBasicFields.length + locationFields.length
    return Math.round((completedFields / totalFields) * 100)
  }
}

/** 
 * Returns true if a profile exists at all. 
 * The app no longer strictly gates access based on 100% completion per user request.
 */
export const isProfileComplete = (profile: any, userRoles: string[]): boolean => {
  return !!profile;
}

// Helper function to get missing fields
export const getMissingFields = (
  profile: any,
  userRoles: string[]
): string[] => {
  if (isCenterUser(userRoles)) {
    // Center profile completion
    const requiredFields = ['name', 'address', 'city', 'state', 'country', 'postalCode', 'businessRegistrationNumber']
    const optionalFields = ['phone', 'email', 'hours', 'businessRegistrationDocUrl']
    const allFields = [...requiredFields, ...optionalFields]

    return allFields.filter(field => {
      let value = profile && profile[field]

      // Handle both naming conventions for business registration
      if (field === 'businessRegistrationNumber' && (value == null || value === '')) {
        value = profile?.businessRegNumber
      }
      if (field === 'businessRegistrationDocUrl' && (value == null || value === '')) {
        value = profile?.businessRegCertificateUrl
      }

      return !value || value.toString().trim() === ''
    })
  } else {
    // Professional user?
    const isProfessional = (userRoles || []).some(r => ['doctor', 'nurse', 'biotech_engineer'].includes(r))
    const isBiotech = (userRoles || []).includes('biotech_engineer')

    const requiredFields = ['firstName', 'lastName', 'phone']
    const locationFields = ['city', 'state', 'country', 'postalCode']
    const commonOptionalFields = [
      'displayName', 'avatar', 'dateOfBirth', 'gender', 'address',
      'governmentIdType', 'governmentIdNumber', 'governmentIdDoc'
    ]

    // Professionals don't have these fields in the form
    const patientOnlyFields = isProfessional ? [] : ['bloodGroup', 'genotype', 'height', 'weight', 'bodyTemperature', 'bloodPressure', 'allergies', 'chronicDisease']

    // Only professionals have these
    const professionalFields = isProfessional
      ? (isProfessional && (userRoles || []).includes('biotech_engineer') ? ['specialization', 'experience', 'services', 'certificates'] : ['specialization', 'licenseNumber', 'experience', 'services'])
      : []

    const missingBasic = [...requiredFields, ...commonOptionalFields, ...patientOnlyFields, ...professionalFields].filter(field => {
      let value = profile && profile[field];
      if (field === 'licenseNumber' && (value == null || value === '')) {
        value = profile?.practiceNumber;
      }

      // Handle services field mapping
      if (field === 'services' && (value == null || (Array.isArray(value) && value.length === 0))) {
        value = profile?.offeredServices || profile?.offered_services;
      }

      // Handle Array fields like 'services'
      if (Array.isArray(value)) {
        return value.length === 0;
      }

      return value == null || value.toString().trim() === '';
    })

    const missingLocation = locationFields.filter(field =>
      !profile || !profile.location || !profile.location[field] || profile.location[field].toString().trim() === ''
    )

    return [...missingBasic, ...missingLocation]
  }
}
