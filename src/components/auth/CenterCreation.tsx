import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api-client'
import { Loader2, Building2, MapPin, Phone, Mail, Clock, FileText } from 'lucide-react'
import { toast } from 'sonner'

// Center creation validation schema
const centerSchema = z.object({
  name: z.string().min(2, 'Center name must be at least 2 characters'),
  type: z.enum([
    'hospital', 'pharmacy', 'radiology',
    'dental', 'eye', 'maternity', 'virology', 'psychiatric',
    'care-home', 'hospice', 'funeral', 'ambulance'
  ]),
  address: z.string().min(10, 'Please provide a complete address'),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  hours: z.string().optional(),
  businessRegistrationNumber: z.string().min(1, 'Business Registration Number is required'),
  businessRegistrationDocUrl: z.string().optional(),
})

type CenterFormData = z.infer<typeof centerSchema>

interface CenterCreationProps {
  onComplete: () => void
}

const CenterCreation: React.FC<CenterCreationProps> = ({ onComplete }) => {
  const { profileError, clearProfileError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<CenterFormData>({
    resolver: zodResolver(centerSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'hospital'
    }
  })

  const selectedType = watch('type')

  const centerTypes = [
    { value: 'hospital', label: 'Hospital', description: 'General hospitals and medical centers' },
    { value: 'pharmacy', label: 'Pharmacy', description: 'Drug stores and medication dispensaries' },
    { value: 'radiology', label: 'Radiology Center', description: 'Imaging and diagnostic centers' },
    { value: 'dental', label: 'Dental Clinic', description: 'Dental care and oral health' },
    { value: 'eye', label: 'Eye Clinic', description: 'Vision care and ophthalmology' },
    { value: 'maternity', label: 'Maternity Center', description: 'Prenatal and birthing care' },
    { value: 'virology', label: 'Virology Center', description: 'Infectious disease treatment' },
    { value: 'psychiatric', label: 'Psychiatric Center', description: 'Mental health and therapy' },
    { value: 'care-home', label: 'Care Home', description: 'Long-term care facilities' },
    { value: 'hospice', label: 'Hospice', description: 'End-of-life care services' },
    { value: 'funeral', label: 'Funeral Services', description: 'Memorial and funeral arrangements' },
    { value: 'ambulance', label: 'Ambulance Drivers / Medical Transport Teams', description: 'Emergency medical transport' },
  ]

  const onSubmit = async (data: CenterFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      clearProfileError()

      // Create center using API
      const response = await apiClient.createCenter(data)

      toast.success('Center created successfully!')
      console.log('Center created:', response)

      // Navigate to dashboard
      onComplete()

    } catch (error) {
      console.error('Center creation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create center'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDisplayId = (type: string) => {
    const typeMap: Record<string, string> = {
      hospital: 'HSP',
      pharmacy: 'PHR',
      diagnostic: 'LAB',
      radiology: 'RAD',
      dental: 'DNT',
      eye: 'EYE',
      maternity: 'MAT',
      virology: 'VIR',
      psychiatric: 'PSY',
      'care-home': 'CHM',
      hospice: 'HSP',
      funeral: 'FUN',
      ambulance: 'AMB'
    }

    const prefix = typeMap[type] || 'CTR'
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}${randomId}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Building2 className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Create Your Healthcare Center</h1>
            <p className="text-gray-600 mt-2">
              Set up your healthcare facility on our platform
            </p>
          </div>

          {/* Preview Display ID */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-primary-700 mb-1">Your center will be assigned ID:</p>
              <p className="text-2xl font-mono font-bold text-primary-900">
                {getDisplayId(selectedType)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Center Name */}
            <div>
              <label htmlFor="name" className="form-label">
                Center Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className={`input-field ${errors.name ? 'border-error-500' : ''}`}
                placeholder="Enter your center name"
              />
              {errors.name && (
                <p className="error-message">{errors.name.message}</p>
              )}
            </div>

            {/* Center Type */}
            <div>
              <label htmlFor="type" className="form-label">
                Center Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('type')}
                id="type"
                className={`input-field ${errors.type ? 'border-error-500' : ''}`}
              >
                {centerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {centerTypes.find(t => t.value === selectedType)?.description}
              </p>
              {errors.type && (
                <p className="error-message">{errors.type.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="form-label">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <textarea
                  {...register('address')}
                  id="address"
                  rows={3}
                  className={`input-field pl-10 ${errors.address ? 'border-error-500' : ''}`}
                  placeholder="Enter complete address (street, city, state, zip code)"
                />
              </div>
              {errors.address && (
                <p className="error-message">{errors.address.message}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    id="phone"
                    className={`input-field pl-10 ${errors.phone ? 'border-error-500' : ''}`}
                    placeholder="+1234567890"
                  />
                </div>
                {errors.phone && (
                  <p className="error-message">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className={`input-field pl-10 ${errors.email ? 'border-error-500' : ''}`}
                    placeholder="info@center.com"
                  />
                </div>
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <label htmlFor="hours" className="form-label">
                Operating Hours
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('hours')}
                  type="text"
                  id="hours"
                  className={`input-field pl-10 ${errors.hours ? 'border-error-500' : ''}`}
                  placeholder="e.g., Mon-Fri 9AM-5PM, Sat 9AM-1PM"
                />
              </div>
              {errors.hours && (
                <p className="error-message">{errors.hours.message}</p>
              )}
            </div>

            {/* Business Registration */}
            <div>
              <label htmlFor="businessRegistrationNumber" className="form-label">
                Business Registration Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('businessRegistrationNumber')}
                  type="text"
                  id="businessRegistrationNumber"
                  className={`input-field pl-10 ${errors.businessRegistrationNumber ? 'border-error-500' : ''}`}
                  placeholder="e.g., RC1234567"
                />
              </div>
              {errors.businessRegistrationNumber && (
                <p className="error-message">{errors.businessRegistrationNumber.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="businessRegistrationDocUrl" className="form-label">
                Registration Document URL
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('businessRegistrationDocUrl')}
                  type="url"
                  id="businessRegistrationDocUrl"
                  className={`input-field pl-10 ${errors.businessRegistrationDocUrl ? 'border-error-500' : ''}`}
                  placeholder="https://example.com/document.pdf"
                />
              </div>
              {errors.businessRegistrationDocUrl && (
                <p className="error-message">{errors.businessRegistrationDocUrl.message}</p>
              )}
            </div>

            {/* Error Display */}
            {(error || profileError) && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                <p className="text-sm text-error-700">{error || profileError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Creating Center...
                </>
              ) : (
                'Create Center'
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Center Creation Process
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>After creating your center, you'll be able to:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Manage center staff and doctors</li>
                    <li>Set up appointment scheduling</li>
                    <li>Handle patient records and billing</li>
                    <li>Access analytics and reporting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CenterCreation
