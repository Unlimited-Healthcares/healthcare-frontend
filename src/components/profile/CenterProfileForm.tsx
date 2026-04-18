import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  Phone,
  Mail,
  Clock,
  MapPin,
  Image as ImageIcon,
  Save,
  Upload,
  FileText,
  Plus,
  Loader2,
  X,
  UserPlus,
  User,
  Trash2,
  Check,
  ChevronsUpDown,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { CenterType, CenterTypeOption } from '@/types/profile'
import { profileApi, calculateProfileCompletion } from '@/services/profileApi'
import { useFieldArray } from 'react-hook-form'
import { isPast, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { COMMON_SERVICES, CURRENCIES, SPECIALTY_SERVICES } from '@/constants/services'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import PaymentSettingsForm from './PaymentSettingsForm'
import { apiClient } from '@/lib/api-client'
import { formatApiError } from '@/lib/error-formatter'
import { COUNTRIES } from '@/constants/countries'

const isExpired = (dateString?: string) => {
  if (!dateString) return false
  try {
    return isPast(parseISO(dateString))
  } catch {
    return false
  }
}

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  price: z.any().optional(),
  currency: z.string().optional().or(z.literal('')),
  is_available: z.boolean().optional(),
})

// Form validation schema
const centerSchema = z.object({
  name: z.string().min(2, 'Center name is required'),
  type: z.nativeEnum(CenterType, { required_error: 'Center type is required' }),
  logoUrl: z.string().optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'ZIP / Postal code is required'),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Please enter a valid email'),
  hours: z.string().optional().or(z.literal('')),
  businessRegistrationNumber: z.string().min(1, 'Registration number is required'),
  businessRegNumber: z.string().optional().or(z.literal('')),
  businessRegistrationDocUrl: z.string().optional().or(z.literal('')),
  businessRegCertificateUrl: z.string().optional().or(z.literal('')),
  registrationDateIssued: z.string().optional().or(z.literal('')),
  registrationExpiryDate: z.string().optional().or(z.literal('')),
  numberOfStaff: z.coerce.number().optional(),
  attachedFacilityName: z.string().optional().or(z.literal('')),
  leadProfessionalName: z.string().optional().or(z.literal('')),
  leadProfessionalLicense: z.string().optional().or(z.literal('')),
  leadProfessionalIssueDate: z.string().optional().or(z.literal('')),
  leadProfessionalExpiryDate: z.string().optional().or(z.literal('')),
  leadProfessionalEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  leadProfessionalPhone: z.string().optional().or(z.literal('')),
  specialization: z.string().optional().or(z.literal('')),
  personnels: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional().or(z.literal('')),
    practiceNumber: z.string().optional().or(z.literal('')),
    dateIssued: z.string().optional().or(z.literal('')),
    expiryDate: z.string().optional().or(z.literal('')),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal(''))
  })).optional(),
  services: z.array(serviceSchema).optional(),
  equipment: z.array(z.object({
    id: z.string().optional(),
    name: z.string().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    status: z.string().optional().or(z.literal('')),
    count: z.coerce.number().optional()
  })).optional(),
  paymentSettings: z.object({
    requireUpfrontPayment: z.boolean().default(false),
    consultationFee: z.any().optional(),
    serviceFee: z.any().optional(),
    currency: z.string().optional().default('USD'),
    methods: z.array(z.object({
      type: z.enum(['paystack', 'flutterwave']),
      label: z.string().min(1, 'Payment method label is required'),
      details: z.record(z.any()).optional(),
      instructions: z.string().optional()
    })).optional().default([])
  }).optional()
})

type CenterFormData = z.infer<typeof centerSchema>

interface CenterProfileFormProps {
  user: any
  center: any
  onCenterUpdate: (updatedCenter: any) => void
  isEditing: boolean
  onEditToggle: (editing: boolean) => void
}

const CenterProfileForm: React.FC<CenterProfileFormProps> = ({
  user,
  center,
  onCenterUpdate,
  isEditing,
  onEditToggle
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [centerTypes, setCenterTypes] = useState<CenterTypeOption[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control
  } = useForm<CenterFormData>({
    resolver: zodResolver(centerSchema),
    defaultValues: {
      name: '',
      type: undefined as unknown as CenterType,
      logoUrl: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      phone: '',
      email: '',
      hours: '',
      businessRegistrationNumber: '',
      businessRegNumber: '',
      businessRegistrationDocUrl: '',
      businessRegCertificateUrl: '',
      registrationDateIssued: '',
      registrationExpiryDate: '',
      numberOfStaff: 0,
      attachedFacilityName: '',
      leadProfessionalName: '',
      leadProfessionalLicense: '',
      leadProfessionalIssueDate: '',
      leadProfessionalExpiryDate: '',
      leadProfessionalEmail: '',
      leadProfessionalPhone: '',
      specialization: '',
      personnels: [],
      services: [],
      equipment: [],
      paymentSettings: {
        requireUpfrontPayment: false,
        currency: 'USD',
        methods: []
      }
    }
  })

  const { fields: personnelFields, append: appendPersonnel, remove: removePersonnel } = useFieldArray({
    control,
    name: 'personnels'
  })

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'services'
  })

  const { fields: equipmentFields, append: appendEquipment, remove: removeEquipment } = useFieldArray({
    control,
    name: 'equipment'
  })

  // Actually I should get 'control' from useForm

  // Reset form when center data changes
  useEffect(() => {
    if (center && !Array.isArray(center)) {
      console.log('Center data available, resetting form with:', center)
      console.log('Center ID:', center.id, 'Center Name:', center.name)
      const formData: Partial<CenterFormData> = {
        name: center.name || '',
        type: center.type as CenterType,
        address: center.address || '',
        city: center.city || '',
        state: center.state || '',
        country: center.country || '',
        postalCode: center.postalCode || '',
        phone: center.phone || '',
        email: center.email || '',
        hours: center.hours || '',
        businessRegistrationNumber: center.businessRegistrationNumber || center.businessRegNumber || '',
        businessRegNumber: center.businessRegNumber || center.businessRegistrationNumber || '',
        businessRegistrationDocUrl: center.businessRegistrationDocUrl || center.businessRegCertificateUrl || '',
        businessRegCertificateUrl: center.businessRegCertificateUrl || center.businessRegistrationDocUrl || '',
        registrationDateIssued: center.registrationDateIssued || '',
        registrationExpiryDate: center.registrationExpiryDate || '',
        numberOfStaff: center.numberOfStaff || 0,
        attachedFacilityName: center.attachedFacilityName || '',
        leadProfessionalName: center.leadProfessionalName || '',
        leadProfessionalLicense: center.leadProfessionalLicense || '',
        leadProfessionalIssueDate: (center as any).leadProfessionalIssueDate || '',
        leadProfessionalExpiryDate: (center as any).leadProfessionalExpiryDate || '',
        leadProfessionalEmail: (center as any).leadProfessionalEmail || '',
        leadProfessionalPhone: (center as any).leadProfessionalPhone || '',
        specialization: center.specialization || '',
        personnels: center.personnels || [],
        services: (center as any).services || [],
        equipment: (center as any).equipment || [],
        paymentSettings: center.paymentSettings || {
          requireUpfrontPayment: false,
          currency: 'USD',
          methods: []
        }
      }
      console.log('Form data to reset with:', formData)
      reset(formData)

      // Log form values after reset
      setTimeout(() => {
        console.log('Form values after reset:', watch())
      }, 100)
    } else {
      console.log('No center data or center is array, resetting form to empty values for new center creation')
      reset({
        name: '',
        type: undefined as unknown as CenterType,
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        phone: '',
        email: '',
        hours: '',
        businessRegistrationNumber: '',
        businessRegNumber: '',
        businessRegistrationDocUrl: '',
        businessRegCertificateUrl: '',
        attachedFacilityName: '',
        leadProfessionalName: '',
        leadProfessionalLicense: ''
      })
    }
  }, [center, reset])

  // Watch form values to calculate completion
  const watchedValues = watch()

  useEffect(() => {
    // Only calculate completion based on the SAVED center data
    const percentage = calculateProfileCompletion(center, user?.roles || [])
    setCompletionPercentage(percentage)
  }, [center, user?.roles])

  // Load center types
  useEffect(() => {
    const loadCenterTypes = async () => {
      try {
        // We still fetch from API for potential new backend-driven types
        const typesFromApi = await profileApi.getCenterTypes()

        // But we ensure our core types from the enum are present with correct labels
        const coreTypes: CenterTypeOption[] = [
          { value: CenterType.HOSPITAL, label: 'Hospital' },
          { value: CenterType.PHARMACY, label: 'Pharmacy' },
          { value: CenterType.RADIOLOGY, label: 'Radiology Center' },
          { value: CenterType.DENTAL, label: 'Dental' },
          { value: CenterType.EYE, label: 'Eye Center' },
          { value: CenterType.MATERNITY, label: 'Maternity Center' },
          { value: CenterType.AMBULANCE, label: 'Ambulance / Medical Transport Team' },
          { value: CenterType.VIROLOGY, label: 'Virology Center' },
          { value: CenterType.PSYCHIATRIC, label: 'Psychiatric Center' },
          { value: CenterType.CARE_HOME, label: 'Care Home' },
          { value: CenterType.HOSPICE, label: 'Hospice' },
          { value: CenterType.FUNERAL, label: 'Funeral Service' },
          { value: CenterType.DIAGNOSTIC, label: 'Diagnostic Center' },
          { value: CenterType.FITNESS_CENTER, label: 'Fitness Centre' },
          { value: CenterType.AMBULANCE_SERVICE, label: 'Ambulance Service' },
          { value: CenterType.MORTUARY, label: 'Mortuary' }
        ]

        // Create a map by value to handle merging
        const typesMap = new Map<string, CenterTypeOption>()

        // Fill with core types first
        coreTypes.forEach(type => typesMap.set(type.value, type))

        // Override or add with API types if they exist
        if (Array.isArray(typesFromApi)) {
          typesFromApi.forEach(type => {
            if (type && type.value) {
              typesMap.set(type.value, type)
            }
          })
        }

        setCenterTypes(Array.from(typesMap.values()))
      } catch (error) {
        console.error('Failed to load center types:', error)
      }
    }
    loadCenterTypes()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'businessRegistrationDocUrl' | 'logoUrl') => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!user?.id) {
      toast.error('You must be logged in to upload documents.')
      return
    }

    try {
      setIsUploading(true)

      let response;
      if (fieldName === 'logoUrl') {
        response = await apiClient.uploadProfilePicture(file) // Center logo uses profile-picture bucket/logic for simplicity or we can use business-asset
      } else {
        response = await apiClient.uploadBusinessAsset(file)
      }

      if (response && response.url) {
        setValue(fieldName, response.url)
        toast.success(`${fieldName === 'logoUrl' ? 'Logo' : 'Document'} uploaded successfully!`)
      } else {
        throw new Error('Upload succeeded but no URL was returned from the server.')
      }
    } catch (error: any) {
      console.error(`Error uploading ${fieldName} to backend:`, error)
      toast.error(`Upload failed. Please check your connection.`)
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: CenterFormData) => {
    try {
      setIsSaving(true)
      console.log('Submitting center data:', data)

      const { businessRegistrationNumber, businessRegistrationDocUrl, ...rest } = data;
      const filteredData = {
        ...rest,
        businessRegNumber: businessRegistrationNumber,
        businessRegCertificateUrl: businessRegistrationDocUrl,
        services: (data.services || []).filter(s => s.name && s.name.trim() !== '').map(s => ({
          ...s,
          price: s.price === "" || isNaN(Number(s.price)) ? 0 : Number(s.price)
        }))
      };

      let result;
      if (center?.id) {
        // Update existing center
        console.log('Updating existing center with ID:', center.id)
        result = await profileApi.updateCenter(center.id, filteredData as any)
      } else {
        // Create new center
        console.log('Creating new center')
        result = await profileApi.createCenter(filteredData as any)
      }

      console.log('Center processed successfully:', result)
      onCenterUpdate(result)

      const nowComplete = calculateProfileCompletion(result, user?.roles || []) === 100

      if (nowComplete) {
        toast.success('Center profile complete! Accessing dashboard...')
        window.location.href = '/dashboard' // Force refresh to update all contexts
      } else {
        toast.success('Progress saved! Complete all fields to access your dashboard.', {
          icon: '💾',
          duration: 4000
        })
      }

      onEditToggle(false)
    } catch (error: any) {
      console.error('Center action error:', error)
      console.error('Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message
      })

      let errorMessage = 'Failed to process center information'

      if (error?.response?.status === 400) {
        if (error?.response?.data?.message) {
          errorMessage = formatApiError(error.response.data.message)
        } else {
          errorMessage = 'Please check your input and try again'
        }
      } else if (error?.response?.status === 401) {
        errorMessage = 'You are not authorized to perform this action'
      } else if (error?.response?.status === 403) {
        errorMessage = 'You do not have permission to perform this action'
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error occurred. Please try again later'
      }

      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const onInvalid = (errors: any) => {
    console.error('Form Validation Errors:', errors)
    toast.error('Please complete all required fields with valid information.')
  }

  const handleCancel = () => {
    reset()
    onEditToggle(false)
  }

  const getCenterTypeLabel = (type: CenterType): string => {
    const typeOption = centerTypes.find(t => t.value === type)
    return typeOption?.label || type
  }

  return (
    <div className="space-y-6">
      {/* Profile Completion Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Center Profile Completion</h3>
              <p className="text-blue-700 text-sm">
                Complete your center profile to provide better services to patients.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
              <div className="text-sm text-blue-600">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* Center Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
              {center ? 'Center Information' : 'Create Your Center Profile'}
            </CardTitle>
            {!isEditing ? (
              <Button
                type="button"
                size="sm"
                onClick={() => onEditToggle(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {center ? 'Edit Center' : 'Create Profile'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="text-gray-600 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className={cn(
                    "shadow-sm transition-all",
                    completionPercentage < 100
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-green-100"
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Save className="h-4 w-4 mr-1.5" />
                  )}
                  {completionPercentage < 100 ? 'Save Progress' : 'Finish Profile'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 pb-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div
                  className={cn(
                    "relative h-24 w-24 sm:h-32 sm:w-32 group",
                    isEditing && "cursor-pointer"
                  )}
                  onClick={() => isEditing && document.getElementById('logo-upload-input')?.click()}
                >
                  {watchedValues.logoUrl ? (
                    <div className="h-full w-full">
                      <img
                        src={watchedValues.logoUrl}
                        alt="Center Logo"
                        className="h-full w-full rounded-2xl object-cover border-4 border-white shadow-md bg-white transition-all group-hover:opacity-90"
                      />
                      {isEditing && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setValue('logoUrl', '');
                          }}
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="h-full w-full rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center bg-blue-50/50 text-blue-400 group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">No Logo</span>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center z-20">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <Label className="text-sm font-semibold text-gray-700">Center Logo <span className="text-gray-400 font-normal">(Optional)</span></Label>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto sm:mx-0">
                    Upload your facility logo to build trust and brand recognition. PNG or JPG, max 2MB.
                  </p>
                  {isEditing && (
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm">
                            <Upload className="h-4 w-4" />
                            {watchedValues.logoUrl ? 'Change Logo' : 'Upload Logo'}
                          </div>
                          <input
                            id="logo-upload-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'logoUrl')}
                          />
                        </label>
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Center Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="e.g., City General Hospital"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Center Type *</Label>
                <Select
                  value={watchedValues.type}
                  onValueChange={(value) => setValue('type', value as CenterType)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                    <SelectValue placeholder="Select center type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-y-auto">
                    {centerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              {(watchedValues.type === CenterType.DIAGNOSTIC || watchedValues.type === CenterType.RADIOLOGY || watchedValues.type === CenterType.VIROLOGY || watchedValues.type === CenterType.PHARMACY) && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="specialization" className="text-gray-900 font-bold">Clinical Subspecialty *</Label>
                  <Input
                    id="specialization"
                    {...register('specialization')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : 'border-blue-200 focus:ring-blue-500'}
                    placeholder="e.g., Clinical Chemistry, CT Scan Unit, Virology Lab, Community Pharmacy"
                  />
                  <p className="text-[10px] text-gray-500 italic font-medium">
                    Specify the specific clinical faculty or specialized unit under this facility.
                  </p>
                  {errors.specialization && (
                    <p className="text-sm text-red-600 font-black uppercase text-[10px]">{errors.specialization.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!isEditing}
                      error={!!errors.phone}
                      className={!isEditing ? 'opacity-80' : ''}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={!isEditing}
                    className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="info@center.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="address"
                  {...register('address')}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Enter your center's full address"
                  rows={3}
                />
              </div>
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="City"
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State / Province *</Label>
                <Input
                  id="state"
                  {...register('state')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="State or Province"
                />
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">ZIP / Postal Code *</Label>
                <Input
                  id="postalCode"
                  {...register('postalCode')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="ZIP or Postal Code"
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-600">{errors.postalCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!isEditing}
                          className={cn(
                            "w-full justify-between h-auto py-2.5 font-normal border-gray-200 rounded-lg",
                            !field.value && "text-gray-400",
                            !isEditing && "bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {field.value ? (
                              <>
                                <img
                                  src={`https://flagcdn.com/w20/${COUNTRIES.find(c => c.value === field.value)?.code || 'ng'}.png`}
                                  className="h-3 w-auto rounded-sm"
                                  alt=""
                                />
                                <span className="font-medium text-gray-900">{field.value}</span>
                              </>
                            ) : (
                              "Select Country"
                            )}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {COUNTRIES.map((country) => (
                                <CommandItem
                                  key={country.value}
                                  value={country.label}
                                  onSelect={() => {
                                    field.onChange(country.value);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                                >
                                  <img
                                    src={`https://flagcdn.com/w40/${country.code}.png`}
                                    alt={country.label}
                                    className="w-5 h-auto rounded-sm"
                                  />
                                  <span className="flex-1 font-medium">{country.label}</span>
                                  <span className="text-gray-400 font-mono text-xs">{country.dialCode}</span>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4 text-blue-600",
                                      field.value === country.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.country && (
                  <p className="text-sm text-red-600">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Operating Hours</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="hours"
                  {...register('hours')}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="e.g., 24/7 Emergency, 8:00 AM - 6:00 PM General"
                  rows={2}
                />
              </div>
              {errors.hours && (
                <p className="text-sm text-red-600">{errors.hours.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessRegistrationNumber">
                {(watchedValues.type === CenterType.AMBULANCE || watchedValues.type === CenterType.AMBULANCE_SERVICE)
                  ? 'Attached Facility Business Registration Number *'
                  : 'Business Registration Number *'}
              </Label>
              <Input
                id="businessRegistrationNumber"
                {...register('businessRegistrationNumber')}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
                placeholder="Enter Registration Number"
              />
              {errors.businessRegistrationNumber && (
                <p className="text-sm text-red-600">{errors.businessRegistrationNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationDateIssued">Registration Issue Date</Label>
                <Input
                  id="registrationDateIssued"
                  type="date"
                  {...register('registrationDateIssued')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationExpiryDate" className="flex items-center gap-2">
                  Registration Expiry Date
                  {watchedValues.registrationExpiryDate && isExpired(watchedValues.registrationExpiryDate) && (
                    <Badge variant="destructive" className="h-5 px-1.5 animate-pulse">EXPIRED</Badge>
                  )}
                </Label>
                <Input
                  id="registrationExpiryDate"
                  type="date"
                  {...register('registrationExpiryDate')}
                  disabled={!isEditing}
                  className={`${!isEditing ? 'bg-gray-50' : ''} ${watchedValues.registrationExpiryDate && isExpired(watchedValues.registrationExpiryDate) ? 'border-red-500 bg-red-50' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfStaff">Number of Staff</Label>
                <Input
                  id="numberOfStaff"
                  type="number"
                  {...register('numberOfStaff')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="e.g., 25"
                />
              </div>
            </div>

            {(watchedValues.type === CenterType.AMBULANCE || watchedValues.type === CenterType.AMBULANCE_SERVICE) && (
              <div className="space-y-4 pt-6 pb-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">Medical Transport Team Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="attachedFacilityName" className="text-gray-700">Attached Health Care Facility Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="attachedFacilityName"
                        {...register('attachedFacilityName')}
                        disabled={!isEditing}
                        className={`pl-10 ${!isEditing ? 'bg-gray-50' : 'focus:ring-blue-500'}`}
                        placeholder="e.g., City General Hospital"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadProfessionalName" className="font-bold uppercase text-[10px] tracking-widest text-blue-600">Lead Professional (Health Care Practitioner) *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="leadProfessionalName"
                        {...register('leadProfessionalName')}
                        disabled={!isEditing}
                        className={`pl-10 ${!isEditing ? 'bg-gray-50' : 'focus:ring-blue-500 border-blue-100'}`}
                        placeholder="Enter full name (e.g., Dr. Jane Smith)"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadProfessionalLicense" className="text-gray-700">Practice/License Number of Lead *</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="leadProfessionalLicense"
                        {...register('leadProfessionalLicense')}
                        disabled={!isEditing}
                        className={`pl-10 ${!isEditing ? 'bg-gray-50' : 'focus:ring-blue-500'}`}
                        placeholder="e.g., MED123456"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadProfessionalEmail" className="text-gray-700">Lead Professional Email</Label>
                    <Input
                      id="leadProfessionalEmail"
                      type="email"
                      {...register('leadProfessionalEmail')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                      placeholder="lead@facility.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadProfessionalPhone" className="text-gray-700">Lead Professional Phone</Label>
                    <Controller
                      name="leadProfessionalPhone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={!isEditing}
                          error={!!errors.leadProfessionalPhone}
                          className={!isEditing ? 'opacity-80' : ''}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadProfessionalIssueDate">License Issue Date</Label>
                    <Input
                      id="leadProfessionalIssueDate"
                      type="date"
                      {...register('leadProfessionalIssueDate')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadProfessionalExpiryDate" className="flex items-center gap-2">
                      License Expiry Date
                      {watchedValues.leadProfessionalExpiryDate && isExpired(watchedValues.leadProfessionalExpiryDate) && (
                        <Badge variant="destructive" className="h-5 px-1.5">EXPIRED</Badge>
                      )}
                    </Label>
                    <Input
                      id="leadProfessionalExpiryDate"
                      type="date"
                      {...register('leadProfessionalExpiryDate')}
                      disabled={!isEditing}
                      className={`${!isEditing ? 'bg-gray-50' : ''} ${watchedValues.leadProfessionalExpiryDate && isExpired(watchedValues.leadProfessionalExpiryDate) ? 'border-red-500 bg-red-50' : ''}`}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 italic mt-2">
                  * For medical transport teams, the business registration of the attached facility is required for verification.
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <UserPlus className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">Additional Medical Personnel</h4>
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendPersonnel({ name: '', practiceNumber: '', email: '', phone: '', dateIssued: '', expiryDate: '' })}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Personnel
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {personnelFields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                    {isEditing && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePersonnel(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Full Name *</Label>
                        <Input
                          {...register(`personnels.${index}.name` as const)}
                          disabled={!isEditing}
                          placeholder="Name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Practice/License Number *</Label>
                        <Input
                          {...register(`personnels.${index}.practiceNumber` as const)}
                          disabled={!isEditing}
                          placeholder="License #"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email</Label>
                        <Input
                          {...register(`personnels.${index}.email` as const)}
                          disabled={!isEditing}
                          placeholder="Email"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Issue Date</Label>
                        <Input
                          type="date"
                          {...register(`personnels.${index}.dateIssued` as const)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center justify-between">
                          Expiry Date
                          {watchedValues.personnels?.[index]?.expiryDate && isExpired(watchedValues.personnels[index].expiryDate!) && (
                            <Badge variant="destructive" className="h-4 text-[9px] px-1">EXPIRED</Badge>
                          )}
                        </Label>
                        <Input
                          type="date"
                          {...register(`personnels.${index}.expiryDate` as const)}
                          disabled={!isEditing}
                          className={watchedValues.personnels?.[index]?.expiryDate && isExpired(watchedValues.personnels[index].expiryDate!) ? 'border-red-500 bg-red-50' : ''}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Phone</Label>
                        <Controller
                          name={`personnels.${index}.phone` as const}
                          control={control}
                          render={({ field }) => (
                            <PhoneInput
                              value={field.value}
                              onChange={field.onChange}
                              disabled={!isEditing}
                              error={!!errors.personnels?.[index]?.phone}
                              className={!isEditing ? 'opacity-80' : ''}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {personnelFields.length === 0 && (
                  <p className="text-sm text-center text-gray-500 py-4 bg-gray-50 rounded-xl border border-dashed">
                    No additional personnel listed.
                  </p>
                )}
              </div>
            </div>

            {/* Services Section */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">Services Provided</h4>
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendService({ name: '', description: '', category: '', price: 0, currency: 'USD', is_available: true })}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Service
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {serviceFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Service Name *</Label>
                        <Controller
                          control={control}
                          name={`services.${index}.name` as const}
                          render={({ field: nameField }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  disabled={!isEditing}
                                  className={cn(
                                    "w-full justify-between font-normal",
                                    !nameField.value && "text-muted-foreground"
                                  )}
                                >
                                  {nameField.value || "Select service..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                  <CommandInput
                                    placeholder="Search or type service..."
                                    value={nameField.value}
                                    onValueChange={(v) => {
                                      setValue(`services.${index}.name` as const, v)
                                    }}
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      <div className="p-2 text-sm text-gray-500">
                                        No predefined service found. Hit enter to use your typed name.
                                      </div>
                                    </CommandEmpty>
                                    <CommandGroup heading="Specialty Services">
                                      {[...new Set([
                                        ...(COMMON_SERVICES.general),
                                        ...(COMMON_SERVICES[watchedValues.type as keyof typeof COMMON_SERVICES] || []),
                                        ...(watchedValues.type === CenterType.HOSPITAL ? COMMON_SERVICES.biotech_engineer : []),
                                        ...(SPECIALTY_SERVICES[watchedValues.specialization || ''] || [])
                                      ])].map((service) => (
                                        <CommandItem
                                          key={service}
                                          value={service}
                                          onSelect={() => {
                                            setValue(`services.${index}.name` as const, service);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              nameField.value === service ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {service}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Category</Label>
                        <Input
                          {...register(`services.${index}.category` as const)}
                          disabled={!isEditing}
                          placeholder="e.g., Primary Care"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Currency</Label>
                        <Select
                          value={watch(`services.${index}.currency` as any) || 'USD'}
                          onValueChange={(val) => setValue(`services.${index}.currency` as any, val)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map(curr => (
                              <SelectItem key={curr.value} value={curr.value}>
                                {curr.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            {...register(`services.${index}.price` as const, { valueAsNumber: true })}
                            disabled={!isEditing}
                            className={`pl-9 ${!isEditing ? 'bg-gray-50' : ''}`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="absolute -top-2 -left-2 flex gap-1">
                      <Badge className="bg-blue-600 hover:bg-blue-600 text-[10px] h-5 px-1.5 shadow-sm border-blue-400">
                        SEARCHABLE
                      </Badge>
                      <Badge variant="outline" className="bg-white text-[10px] h-5 px-1.5 shadow-sm">
                        SERVICE #{index + 1}
                      </Badge>
                    </div>

                    {isEditing && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(index)}
                        className="self-center text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {serviceFields.length === 0 && (
                  <p className="text-sm text-center text-gray-500 py-4 bg-gray-50 rounded-xl border border-dashed">
                    No services listed. Add the services your facility provides.
                  </p>
                )}
              </div>
            </div>

            {/* Equipment Section */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Save className="h-4 w-4 text-amber-600" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">Medical Equipment</h4>
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendEquipment({ name: '', description: '', status: 'Functional', count: 1 })}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Equipment
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {equipmentFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Equipment Name *</Label>
                        <Input
                          {...register(`equipment.${index}.name` as const)}
                          disabled={!isEditing}
                          placeholder="e.g., X-Ray Machine"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={watch(`equipment.${index}.status` as any)}
                          onValueChange={(val) => setValue(`equipment.${index}.status` as any, val)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Functional">Functional</SelectItem>
                            <SelectItem value="Needs Repair">Needs Repair</SelectItem>
                            <SelectItem value="Non-Functional">Non-Functional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          {...register(`equipment.${index}.count` as const)}
                          disabled={!isEditing}
                          placeholder="1"
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEquipment(index)}
                        className="self-center text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {equipmentFields.length === 0 && (
                  <p className="text-sm text-center text-gray-500 py-4 bg-gray-50 rounded-xl border border-dashed">
                    No medical equipment listed. Add the equipment available at your facility.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessRegistrationDocUrl">Registration Document *</Label>
              <div className="space-y-3">
                {watchedValues.businessRegistrationDocUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 truncate">
                        Document Uploaded
                      </p>
                      <a
                        href={watchedValues.businessRegistrationDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setValue('businessRegistrationDocUrl', '')}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${isEditing ? 'border-gray-300 hover:border-blue-400 bg-gray-50' : 'border-gray-100 bg-gray-50/50'
                      }`}>
                      <FileText className={`h-8 w-8 mb-2 ${isEditing ? 'text-gray-400' : 'text-gray-200'}`} />
                      <p className="text-sm font-medium text-gray-600">
                        {isUploading ? 'Uploading...' : 'Upload Registration Document'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG (Max 5MB)</p>

                      {isEditing && (
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleFileUpload(e, 'businessRegistrationDocUrl')}
                          disabled={isUploading}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      )}
                    </div>
                  </div>
                )}
                <Input
                  type="hidden"
                  {...register('businessRegistrationDocUrl')}
                />
                {errors.businessRegistrationDocUrl && (
                  <p className="text-sm text-red-600">{errors.businessRegistrationDocUrl.message}</p>
                )}
              </div>
            </div>

            {/* Payment Settings Section */}
            {(center || isEditing) && (
              <PaymentSettingsForm
                register={register}
                control={control}
                watch={watch}
                setValue={setValue}
                isEditing={isEditing}
                isCenter={true}
              />
            )}
          </CardContent>
        </Card>

        {/* Center Display Info */}
        {center && (
          <Card>
            <CardHeader>
              <CardTitle>Center Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Display ID</Label>
                  <p className="text-lg font-semibold">{center.displayId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Center Type</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {getCenterTypeLabel(center.type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(center.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(center.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom actions removed as they are now at the top */}
      </form>

      {/* Information Note */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-800">Center Profile Information</h4>
              <p className="text-sm text-gray-600 mt-1">
                Keep your center information up to date to help patients find and contact your facility.
                This information will be displayed in search results and center listings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div >
  )
}

export default CenterProfileForm
