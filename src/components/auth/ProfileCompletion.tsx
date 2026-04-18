import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiClient } from '@/lib/api-client'
import { PhoneInput } from './PhoneInput'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { userApi } from '@/services/userApi'
import { Address } from '@/types/auth'
import { Loader2, User, MapPin, Calendar, GraduationCap, Building, Upload, Image as ImageIcon, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { SPECIALIZATIONS } from '@/types/discovery'

// Profile completion validation schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  street: z.string().optional(),
  city: z.string().min(2, 'City is required').optional(),
  state: z.string().min(2, 'State/Province is required').optional(),
  country: z.string().min(2, 'Country is required').optional(),
  zipCode: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  experience: z.string().optional(),
  certificates: z.array(z.string()).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

// Interface for API request that matches backend expectations
interface ProfileApiRequest {
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address?: string
  location?: {
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  }
  displayName: string
  specialization?: string
  licenseNumber?: string
  experience?: string
  certificates?: string[]
}

interface ProfileCompletionProps {
  onComplete: () => void
}

const ALLIED_SPECIALIZATIONS = [
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

const DOCTOR_SPECIALIZATIONS = SPECIALIZATIONS.filter(s =>
  !['Nursing', 'Maternity Care', 'Biotech Engineering', ...ALLIED_SPECIALIZATIONS].includes(s)
)

const NURSE_SPECIALIZATIONS = [
  'Nursing', 'Maternity Care'
] as const

const BIOTECH_SPECIALIZATIONS = [
  'Biotech Engineering'
] as const

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ onComplete }) => {
  const { user, userProfile, profileError, clearProfileError, fetchUserProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const totalSteps = 3
  const hasCalledOnComplete = useRef(false)

  // Check if user already has a completed profile - more relaxed check
  const hasCompletedProfile = useMemo(() => {
    if (!userProfile) return false

    // Check if essential profile fields are filled - only require basic info
    const hasFirstName = userProfile.firstName && userProfile.firstName.trim().length > 0
    const hasLastName = userProfile.lastName && userProfile.lastName.trim().length > 0

    // For now, just require first and last name to consider profile "complete enough"
    // Users can add more info later through the profile page
    return hasFirstName && hasLastName
  }, [userProfile])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    control,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  })

  const watchedAvatar = watch('avatar')

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      // Create local preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const { url } = await apiClient.uploadProfilePicture(file)
      setValue('avatar', url)
      toast.success('Profile picture uploaded!')
    } catch (err: any) {
      console.error('Avatar upload failed:', err)
      toast.error('Failed to upload profile picture')
      setAvatarPreview(null)
    } finally {
      setIsUploading(false)
    }
  }


  const isProfessional = user?.roles.includes('doctor') || user?.roles.includes('nurse') || user?.roles.includes('biotech_engineer') || user?.roles.includes('allied_practitioner')
  const isBiotech = user?.roles.includes('biotech_engineer')

  // Auto-complete if profile is already complete
  useEffect(() => {
    console.log('🔐 Profile completion check:', {
      hasCompletedProfile,
      userProfile,
      userProfileFields: userProfile ? {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phoneNumber,
        dateOfBirth: userProfile.dateOfBirth,
        gender: userProfile.gender,
        address: userProfile.address
      } : null
    })
    if (hasCompletedProfile && !hasCalledOnComplete.current) {
      console.log('🔐 Profile already complete, auto-completing')
      hasCalledOnComplete.current = true
      // Use setTimeout to prevent immediate re-evaluation
      const timeoutId = setTimeout(() => {
        onComplete()
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [hasCompletedProfile, onComplete, userProfile])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Check if profile is already completed
      if (hasCompletedProfile) {
        toast.info('Profile is already completed!')
        onComplete()
        return
      }

      setIsSubmitting(true)
      setError(null)
      clearProfileError()

      // Transform form data to match backend API structure
      const profileData: ProfileApiRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatar: data.avatar,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.street ? `${data.street}, ${data.city || ''}, ${data.state || ''}, ${data.zipCode || ''}, ${data.country || ''}`.trim().replace(/, ,/g, ',').replace(/,$/, '') : undefined,
        location: (data.city || data.state || data.country) ? {
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          postalCode: data.zipCode || ''
        } : undefined,
        displayName: data.displayName || `${data.firstName} ${data.lastName}`.trim(),
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        experience: data.experience,
        certificates: data.certificates,
      }

      // Create or update profile using userApi which handles creation vs update
      console.log('🔐 Attempting to create profile with data:', profileData)
      console.log('🔐 Current user:', user)
      console.log('🔐 User roles:', user?.roles)
      console.log('🔐 Auth token exists:', !!localStorage.getItem('authToken'))
      console.log('🔐 Auth token value:', localStorage.getItem('authToken')?.substring(0, 50) + '...')

      const response = await userApi.createProfile(profileData)

      toast.success('Profile completed successfully!')
      console.log('Profile created:', response)

      // Immediately refetch full profile so downstream checks see it as complete
      try {
        await fetchUserProfile()
      } catch (e) {
        // Non-blocking; proceed to completion even if refetch fails
        console.warn('Profile refetch failed after creation:', e)
      }

      onComplete()
    } catch (error: any) {
      console.error('Profile update failed:', error)
      let errorMessage = 'Failed to complete profile'

      // Handle specific error cases
      if (error.status === 400 && error.data?.message?.includes('duplicate key')) {
        errorMessage = 'Profile already exists. Please try updating your profile instead.'
      } else if (error.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.'
      } else if (error.status === 404) {
        errorMessage = 'Profile not found. Please try again.'
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index + 1 <= currentStep
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-600'
              }`}
          >
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-16 h-1 mx-2 ${index + 1 < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-primary-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-400">
            {avatarPreview || watchedAvatar ? (
              <img
                src={avatarPreview || watchedAvatar}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
            title="Upload Photo"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          className="hidden"
        />
        <p className="text-xs text-gray-500">Upload a profile picture (PNG, JPG max 5MB)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="form-label">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('firstName')}
            type="text"
            id="firstName"
            className={`input-field ${errors.firstName ? 'border-error-500' : ''}`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="error-message">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="form-label">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('lastName')}
            type="text"
            id="lastName"
            className={`input-field ${errors.lastName ? 'border-error-500' : ''}`}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="error-message">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="displayName" className="form-label">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('displayName')}
          type="text"
          id="displayName"
          className={`input-field ${errors.displayName ? 'border-error-500' : ''}`}
          placeholder="How should we display your name?"
        />
        {errors.displayName && (
          <p className="error-message">{errors.displayName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value}
                onChange={field.onChange}
                error={!!errors.phone}
                className="bg-white rounded-xl"
              />
            )}
          />
          {errors.phone && (
            <p className="error-message">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="form-label">
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('dateOfBirth')}
              type="date"
              id="dateOfBirth"
              className={`input-field pl-10 ${errors.dateOfBirth ? 'border-error-500' : ''}`}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="error-message">{errors.dateOfBirth.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="gender" className="form-label">
          Gender
        </label>
        <select
          {...register('gender')}
          id="gender"
          className={`input-field ${errors.gender ? 'border-error-500' : ''}`}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        {errors.gender && (
          <p className="error-message">{errors.gender.message}</p>
        )}
      </div>
    </div>
  )

  const renderAddress = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">Address Information</h3>
        <p className="text-gray-600">Where are you located?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="form-label">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            {...register('country')}
            id="country"
            className={`input-field ${errors.country ? 'border-error-500' : ''}`}
          >
            <option value="">Select country</option>
            <option value="Nigeria">Nigeria</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Ghana">Ghana</option>
            <option value="Canada">Canada</option>
          </select>
          {errors.country && (
            <p className="error-message">{errors.country.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="form-label">
            State / Province <span className="text-red-500">*</span>
          </label>
          <input
            {...register('state')}
            type="text"
            id="state"
            className={`input-field ${errors.state ? 'border-error-500' : ''}`}
            placeholder="e.g. Lagos, California"
          />
          {errors.state && (
            <p className="error-message">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="form-label">
            City / Town <span className="text-red-500">*</span>
          </label>
          <input
            {...register('city')}
            type="text"
            id="city"
            className={`input-field ${errors.city ? 'border-error-500' : ''}`}
            placeholder="e.g. Ikeja, Los Angeles"
          />
          {errors.city && (
            <p className="error-message">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="zipCode" className="form-label">
            Zip / Postal Code
          </label>
          <input
            {...register('zipCode')}
            type="text"
            id="zipCode"
            className={`input-field ${errors.zipCode ? 'border-error-500' : ''}`}
            placeholder="100001"
          />
        </div>
      </div>

      <div>
        <label htmlFor="street" className="form-label">
          Street Address
        </label>
        <textarea
          {...register('street')}
          id="street"
          rows={2}
          className={`input-field ${errors.street ? 'border-error-500' : ''}`}
          placeholder="Enter your street address"
        />
        {errors.street && (
          <p className="error-message">{errors.street.message}</p>
        )}
      </div>
    </div>
  )

  const renderMedicalCredentials = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <GraduationCap className="w-12 h-12 text-primary-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900">
          {isBiotech ? 'Technical Credentials' : 'Professional Credentials'}
        </h3>
        <p className="text-gray-600">
          {isBiotech
            ? 'Professional or tech-firm earned certifications'
            : 'Professional information for healthcare providers'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="specialization" className="form-label">
            {isBiotech ? 'Biotech Specialty' : 'Specialization'}
          </label>
          <select
            {...register('specialization')}
            id="specialization"
            className={`input-field ${errors.specialization ? 'border-error-500' : ''}`}
          >
            <option value="">Select specialization</option>
            {user?.roles.includes('doctor') && DOCTOR_SPECIALIZATIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
            {user?.roles.includes('nurse') && NURSE_SPECIALIZATIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
            {user?.roles.includes('biotech_engineer') && BIOTECH_SPECIALIZATIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
            {user?.roles.includes('allied_practitioner') && ALLIED_SPECIALIZATIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.specialization && (
            <p className="error-message">{errors.specialization.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="licenseNumber" className="form-label">
            {isBiotech ? 'Practice/License Number (Optional)' : 'Practice Number'}
          </label>
          <input
            {...register('licenseNumber')}
            type="text"
            id="licenseNumber"
            className={`input-field ${errors.licenseNumber ? 'border-error-500' : ''}`}
            placeholder={isBiotech ? "e.g., LIC-12345 (Optional)" : "e.g., MD123456"}
          />
          {errors.licenseNumber && (
            <p className="error-message">{errors.licenseNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="experience" className="form-label">
          Years of Experience
        </label>
        <input
          {...register('experience')}
          type="text"
          id="experience"
          className={`input-field ${errors.experience ? 'border-error-500' : ''}`}
          placeholder="e.g., 5 years"
        />
        {errors.experience && (
          <p className="error-message">{errors.experience.message}</p>
        )}
      </div>

      {isBiotech && (
        <div>
          <label htmlFor="certificates" className="form-label">
            Certificates (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Add certificates from recognized tech firms or local companies.
          </p>
          <textarea
            id="certificates"
            rows={2}
            className="input-field"
            placeholder="e.g. AWS Certified Engineer, Local Biotech Cert..."
            onChange={(e) => {
              const val = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
              setValue('certificates', val);
            }}
          />
        </div>
      )}
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo()
      case 2:
        return renderAddress()
      case 3:
        return isProfessional ? renderMedicalCredentials() : renderAddress()
      default:
        return renderBasicInfo()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Building className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-600 mt-2">
              Welcome to Unlimited Healthcare! Let's get to know you better.
            </p>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}

            {/* Error Display */}
            {(error || profileError) && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                <p className="text-sm text-error-700">{error || profileError}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="btn-primary flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Completing Profile...
                    </>
                  ) : (
                    'Complete Profile'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileCompletion
