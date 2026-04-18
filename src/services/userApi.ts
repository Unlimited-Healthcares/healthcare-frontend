import { apiClient } from '@/lib/api-client'
import {
  UserProfile,
  ProfileCompletion,
  UserPreferences,
  EmergencyContact
} from '@/types/auth'

export const userApi = {
  // Get user profile - using the correct endpoint from Postman collection
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<any>('/auth/me')
    // Backend wraps everything in { success, data }
    return response?.data || response
  },

  // Create or update user profile - using the correct endpoint from UsersController
  createProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.post<any>('/users/profile', profileData)
    return response?.data || response
  },

  // Update user profile - using the correct endpoint for currently authenticated user
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    // Note: The backend has @Post('profile') in UsersController which handles create/update for the current 'me'
    const response = await apiClient.post<any>('/users/profile', profileData)
    return response?.data || response
  },

  // Get profile completion status - this endpoint doesn't exist, so we'll calculate it from profile data
  getProfileCompletion: async (): Promise<ProfileCompletion> => {
    try {
      const response = await apiClient.get<any>('/auth/me')
      const user = response?.data || response
      const profileData = user?.profile

      // Update fields to match backend entity: firstName, lastName, phone, dateOfBirth, gender, address
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'address']

      if (!profileData) {
        return {
          percentage: 0,
          missingFields: requiredFields,
          completedSections: [],
          requiredFields,
          optionalFields: ['avatar', 'bio', 'emergencyContacts', 'insuranceInfo', 'medicalHistory']
        }
      }

      const completedFields = requiredFields.filter(field => {
        if (field === 'email') return user.email
        if (field === 'address') {
          return profileData.address &&
            profileData.address.street &&
            profileData.address.city &&
            profileData.address.state &&
            profileData.address.zipCode
        }
        return profileData[field]
      })

      const percentage = Math.round((completedFields.length / requiredFields.length) * 100)

      return {
        percentage,
        missingFields: requiredFields.filter(field => !completedFields.includes(field)),
        completedSections: completedFields,
        requiredFields,
        optionalFields: ['avatar', 'bio', 'emergencyContacts', 'insuranceInfo', 'medicalHistory']
      }
    } catch (error) {
      // Return default completion if there's an error
      return {
        percentage: 0,
        missingFields: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'address'],
        completedSections: [],
        requiredFields: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'address'],
        optionalFields: ['avatar', 'bio', 'emergencyContacts', 'insuranceInfo', 'medicalHistory']
      }
    }
  },

  // Update user preferences - using the correct endpoint for currently authenticated user
  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    // Update preferences as part of the profile for the current user
    const response = await apiClient.post<any>('/users/profile', { preferences })
    const profile = response?.data || response
    return profile.preferences || preferences
  },

  // Upload profile avatar - this endpoint doesn't exist, so we'll skip it for now
  uploadAvatar: async (): Promise<{ avatar_url: string }> => {
    // TODO: Implement when backend supports avatar upload
    throw new Error('Avatar upload not yet implemented')
  },

  // Add emergency contact - using the correct user endpoint
  addEmergencyContact: async (contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> => {
    // Add emergency contact as part of the profile for the current user
    const response = await apiClient.post<any>('/users/profile', {
      emergencyContacts: [contact]
    })
    const profile = response?.data || response
    return profile.emergencyContacts?.[0] || contact
  },

  // Update emergency contact - using the correct user endpoint
  updateEmergencyContact: async (id: string, contact: Partial<EmergencyContact>): Promise<EmergencyContact> => {
    // Update emergency contact as part of the profile for the current user
    const response = await apiClient.post<any>('/users/profile', {
      emergencyContacts: [{ id, ...contact }]
    })
    const profile = response?.data || response
    return profile.emergencyContacts?.find((c: any) => c.id === id) || contact as EmergencyContact
  },

  // Remove emergency contact - using the correct user endpoint
  removeEmergencyContact: async (): Promise<void> => {
    // Remove emergency contact as part of the profile for the current user
    await apiClient.post<any>('/users/profile', {
      emergencyContacts: [] // Clear all emergency contacts for now
    })
  }
}
