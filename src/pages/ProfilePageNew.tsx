import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { profileApi, isCenterUser, isProfileComplete } from '@/services/profileApi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import IndividualProfileForm from '@/components/profile/IndividualProfileForm'
import CenterProfileForm from '@/components/profile/CenterProfileForm'
import { ProfileCompletionWidget } from '@/components/dashboard/ProfileCompletionWidget'
import toast from 'react-hot-toast'
import { SpecialtyUpdateModal } from '@/components/dashboard/SpecialtyUpdateModal'
import { MoreHorizontal, Stethoscope } from 'lucide-react'

const ProfilePageNew: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile: authProfile, loading: authLoading } = useAuth()

  const [isLoading, setIsLoading] = useState(!authProfile)
  const [searchParams] = useSearchParams()
  const [isEditing, setIsEditing] = useState(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('postVerifyOnboarding') === 'true') return true
    return searchParams.get('edit') === 'true'
  })
  const [profile, setProfile] = useState<any>(authProfile)

  // Update local profile if authProfile changes (e.g., after specialization update or background verification)
  useEffect(() => {
    if (authProfile) {
      // The authProfile from useAuth can be the user object or the profile object.
      // We extract the internal profile data to keep the local state consistent.
      const profileData = (authProfile as any).profile || authProfile;
      setProfile(profileData);
      if (isLoading) setIsLoading(false);
    }
  }, [authProfile]);

  const [center, setCenter] = useState<any>(null)
  const [centers, setCenters] = useState<any[]>([])
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false)

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        if (isCenterUser(user.roles)) {
          // Load center profile
          try {
            console.log('Loading center profile for user:', user.id)
            const centerData = await profileApi.getCenterByUserId(user.id)
            console.log('Center data loaded:', centerData)

            if (Array.isArray(centerData)) {
              setCenters(centerData)
              if (centerData.length > 0) {
                setCenter(centerData[0])
                setSelectedCenterId(centerData[0].id)
              }
            } else {
              setCenters([centerData])
              setCenter(centerData)
              setSelectedCenterId(centerData?.id || null)
            }
          } catch (centerError: any) {
            console.log('Center fetch error:', centerError)
            setCenter(null)
          }
        } else {
          // Always fetch the latest profile for individuals so values persist across navigation/reload.
          try {
            console.log('Loading individual profile for user:', user.id)
            const userData = await profileApi.getCurrentUser()
            console.log('User profile data loaded:', userData)
            setProfile(userData.data?.profile || (userData as any).profile || null)
          } catch (profileError: any) {
            console.log('Profile fetch error:', profileError)
            setProfile(null)
          }
        }
      } catch (error: any) {
        console.error('Unexpected error loading profile data:', error)
        if (error?.response?.status && error.response.status >= 500) {
          setError(error?.response?.data?.message || 'Server error occurred')
          toast.error('Server error occurred while loading profile')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      loadProfileData()
    }
  }, [user?.id])

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile)
  }

  const handleCenterUpdate = (updatedCenter: any) => {
    setCenter(updatedCenter)
    // Update the centers array with the updated center
    setCenters(prev => prev.map(c => c.id === updatedCenter.id ? updatedCenter : c))
  }

  const handleCenterSelect = (centerId: string) => {
    const selectedCenter = centers.find(c => c.id === centerId)
    if (selectedCenter) {
      setCenter(selectedCenter)
      setSelectedCenterId(centerId)
    }
  }

  const handleEditToggle = (editing: boolean) => {
    setIsEditing(editing)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in to view your profile.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isCenter = isCenterUser(user.roles)
  const profileComplete = isProfileComplete(
    isCenter ? center : profile,
    user?.roles || []
  )

  return (
    <div className="bg-gray-50 pb-safe-offset md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 safe-area-pt">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="p-1.5 sm:p-2 touch-target-sm hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </Button>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isCenter ? (
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                ) : (
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                )}
                <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                  {isCenter
                    ? 'Business Profile'
                    : 'User Profile'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xs sm:text-sm text-gray-600">
                {user.displayId && (
                  <span className="font-medium">ID: <span className="hidden sm:inline">{user.displayId}</span><span className="sm:hidden">{user.displayId.slice(0, 12)}...</span></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile completion banner */}
      {!profileComplete && (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4">
          <ProfileCompletionWidget hideButton />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* User Info Card */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              {isCenter ? (
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              ) : (
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              )}
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm sm:text-base md:text-lg font-semibold break-all">{user.email}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-0">Designation & Mastery</label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSpecialtyModalOpen(true)}
                    className="h-8 w-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100 transition-all hover:scale-110 active:scale-95 flex items-center justify-center p-0"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {user.roles.map((role: string) => {
                    const roleDisplayMap: Record<string, string> = {
                      'doctor': 'Health Care Practitioners',
                      'allied_practitioner': 'Allied Health Care Practitioners',
                      'nurse': 'Nursing Practitioners',
                      'biotech_engineer': 'Biotech Engineers',
                      'virologist': 'Virology Specialists',
                      'pharmacist': 'Pharmacy Practitioners',
                      'diagnostic': 'Diagnostic Specialists',
                      'patient': 'Patient'
                    };

                    const displayRole = roleDisplayMap[role] || role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');
                    const professionalRoles = ['allied_practitioner', 'doctor', 'nurse', 'biotech_engineer', 'virologist', 'pharmacist', 'diagnostic'];
                    const isProfessional = professionalRoles.includes(role);
                    const isCenterUserRef = isCenterUser(user.roles);
                    const specialty = isCenterUserRef ? (center?.specialization || center?.type) : profile?.specialization;

                    return (
                      <div key={role} className="flex flex-col gap-1.5 border-l-2 border-blue-600 pl-3 py-1 bg-slate-50/50 rounded-r-xl transition-all hover:bg-white hover:shadow-sm">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-100 w-fit">
                          {displayRole}
                        </span>
                        {isProfessional && specialty && (
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600 font-bold text-sm">↳</span>
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                              {specialty}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Account Status</label>
                <p className="text-xs sm:text-sm mt-1">
                  <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-xs sm:text-sm text-gray-600">
                  {user.createdAt ? new Date(user.createdAt as any).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center Selector - Show when user has multiple centers */}
        {isCenter && centers.length > 1 && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Select Center to Manage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {centers.map((centerItem) => (
                  <div
                    key={centerItem.id}
                    className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors touch-target ${selectedCenterId === centerItem.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => handleCenterSelect(centerItem.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{centerItem.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{centerItem.type}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{centerItem.displayId}</p>
                      </div>
                      {selectedCenterId === centerItem.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Forms */}
        {isCenter ? (
          <CenterProfileForm
            user={user}
            center={center}
            onCenterUpdate={handleCenterUpdate}
            isEditing={isEditing}
            onEditToggle={handleEditToggle}
          />
        ) : (
          <IndividualProfileForm
            user={user}
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            isEditing={isEditing}
            onEditToggle={handleEditToggle}
            initialAddService={searchParams.get('addService') || undefined}
          />
        )}

        {/* Missing Profile Notice */}
        {((isCenter && centers.length === 0) || (!isCenter && !profile)) && (
          <Card className="mt-4 sm:mt-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-medium text-amber-800">
                    {isCenter ? 'Business Profile Not Created' : 'Profile Not Created'}
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-700 mt-1">
                    {isCenter
                      ? 'You need to create your business profile to start using the platform. Click "Edit Business Information" to get started.'
                      : 'You need to create your profile to get personalized care recommendations. Click "Edit Profile" to get started.'
                    }
                  </p>
                  {isCenter && (
                    <div className="mt-2 text-[10px] sm:text-xs text-amber-600">
                      <p>As a center user, you can create your healthcare facility profile with details like:</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 sm:space-y-1">
                        <li>Center name and type</li>
                        <li>Address and contact information</li>
                        <li>Operating hours</li>
                        <li>Services offered</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Specialty Update Modal */}
      <SpecialtyUpdateModal
        isOpen={isSpecialtyModalOpen}
        onClose={() => setIsSpecialtyModalOpen(false)}
        currentSpecialty={profile?.specialization as any}
        role={user?.roles?.[0] || 'patient'}
      />
    </div>
  )
}

export default ProfilePageNew
