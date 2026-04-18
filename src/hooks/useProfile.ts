import { useState, useEffect } from 'react'
import { profileApi, isCenterUser, calculateProfileCompletion, getMissingFields } from '@/services/profileApi'
import { User } from '@/types/auth'
import toast from 'react-hot-toast'

interface UseProfileReturn {
  profile: any
  center: any
  isLoading: boolean
  error: string | null
  completionPercentage: number
  missingFields: string[]
  refreshProfile: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  updateCenter: (data: any) => Promise<void>
}

export const useProfile = (user: User | null): UseProfileReturn => {
  const [profile, setProfile] = useState<any>(null)
  const [center, setCenter] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfileData = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      if (isCenterUser(user.roles)) {
        // Load center profile
        try {
          const centerData = await profileApi.getCenterByUserId(user.id)
          setCenter(centerData)
        } catch (centerError: any) {
          if (centerError?.response?.status === 404) {
            // Center doesn't exist yet
            setCenter(null)
          } else {
            throw centerError
          }
        }
      } else {
        // Load individual user profile
        try {
          const userData = await profileApi.getCurrentUser()
          setProfile(userData.data?.profile || null)
        } catch (profileError: any) {
          if (profileError?.response?.status === 404) {
            // Profile doesn't exist yet
            setProfile(null)
          } else {
            throw profileError
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading profile data:', error)
      setError(error?.response?.data?.message || 'Failed to load profile data')
      toast.error('Failed to load profile information')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = async () => {
    await loadProfileData()
  }

  const updateProfile = async (data: any) => {
    try {
      const updatedProfile = await profileApi.createOrUpdateProfile(data)
      setProfile(updatedProfile)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(error?.response?.data?.message || 'Failed to update profile')
      throw error
    }
  }

  const updateCenter = async (data: any) => {
    try {
      if (center?.id) {
        // Update existing center
        const updatedCenter = await profileApi.updateCenter(center.id, data)
        setCenter(updatedCenter)
        toast.success('Center information updated successfully!')
      } else {
        // Create new center
        const newCenter = await profileApi.createCenter(data)
        setCenter(newCenter)
        toast.success('Center created successfully!')
      }
    } catch (error: any) {
      console.error('Center update error:', error)
      toast.error(error?.response?.data?.message || 'Failed to update center information')
      throw error
    }
  }

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  // Calculate completion percentage and missing fields
  const currentData = isCenterUser(user?.roles || []) ? center : profile
  const completionPercentage = calculateProfileCompletion(currentData, user?.roles || [])
  const missingFields = getMissingFields(currentData, user?.roles || [])

  return {
    profile,
    center,
    isLoading,
    error,
    completionPercentage,
    missingFields,
    refreshProfile,
    updateProfile,
    updateCenter
  }
}
