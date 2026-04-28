import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Calendar,
  FileText,
  Heart,
  Settings,
  Plus,
  AlertTriangle
} from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const DashboardHome: React.FC = () => {
  const navigate = useNavigate()
  const {
    user,
    profile,
    userProfile,
    profileCompletion,
    profileLoading,
    fetchUserProfile,
    fetchProfileCompletion
  } = useAuth()

  // Get user name with better fallback logic
  const getUserName = () => {
    // First try to get name from profile
    if (profile?.name) {
      return profile.name;
    }

    // Then try to get name from user object
    if (user?.name) {
      return user.name;
    }

    // Final fallback
    return 'User';
  };

  // Local loading state to prevent blinking
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Only fetch if not already loaded
        if (!userProfile) {
          await fetchUserProfile()
        }
        if (!profileCompletion.percentage) {
          await fetchProfileCompletion()
        }
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize dashboard:', error)
        setIsInitialized(true)
      }
    }

    initializeDashboard()
  }, [fetchUserProfile, fetchProfileCompletion, userProfile, profileCompletion.percentage])

  const handleCompleteProfile = () => {
    navigate('/profile')
  }

  // Show loading only on initial load, not on subsequent state updates
  if (!isInitialized || (profileLoading && !userProfile)) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {getUserName()}!
        </h2>
        <p className="text-gray-600">
          Manage your health journey and access healthcare services
        </p>
      </div>

      {/* Profile Completion Alert */}
      {profileCompletion.percentage < 100 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-warning-800">
                Complete Your Profile
              </h3>
              <p className="text-sm text-warning-700 mt-1">
                Your profile is {profileCompletion.percentage}% complete. Complete your profile to get personalized care recommendations.
              </p>
              <div className="mt-3">
                <button
                  onClick={handleCompleteProfile}
                  className="btn-primary text-sm"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Book Appointment */}
        <div className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 rounded-lg p-3">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Book Appointment</h3>
              <p className="text-sm text-gray-600">Schedule with healthcare providers</p>
            </div>
          </div>
        </div>

        {/* Medical Records */}
        <div className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="bg-success-100 rounded-lg p-3">
              <FileText className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Medical Records</h3>
              <p className="text-sm text-gray-600">View and manage your health records</p>
            </div>
          </div>
        </div>

        {/* Health Assessment */}
        <div className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="bg-healthcare-100 rounded-lg p-3">
              <Heart className="h-6 w-6 text-healthcare-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Health Assessment</h3>
              <p className="text-sm text-gray-600">Get AI-powered health insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Personal Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{userProfile?.firstName} {userProfile?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{userProfile?.phoneNumber || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Profile Completion</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{profileCompletion.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion.percentage}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleCompleteProfile}
                className="btn-primary text-sm w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="bg-gray-200 rounded-lg p-3 mx-auto w-12 h-12 mb-3 flex items-center justify-center">
              <Heart className="h-6 w-6 text-gray-500" />
            </div>
            <h4 className="font-medium text-gray-700 mb-1">Blood Donation</h4>
            <p className="text-xs text-gray-500">Donor management system</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="bg-gray-200 rounded-lg p-3 mx-auto w-12 h-12 mb-3 flex items-center justify-center">
              <Settings className="h-6 w-6 text-gray-500" />
            </div>
            <h4 className="font-medium text-gray-700 mb-1">Equipment Rental</h4>
            <p className="text-xs text-gray-500">Medical equipment marketplace</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="bg-gray-200 rounded-lg p-3 mx-auto w-12 h-12 mb-3 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-gray-500" />
            </div>
            <h4 className="font-medium text-gray-700 mb-1">Emergency Services</h4>
            <p className="text-xs text-gray-500">Emergency response system</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="bg-gray-200 rounded-lg p-3 mx-auto w-12 h-12 mb-3 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
            <h4 className="font-medium text-gray-700 mb-1">Video Consultations</h4>
            <p className="text-xs text-gray-500">Virtual healthcare visits</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
