import React, { useState, useEffect, useRef } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { PhoneInput } from '@/components/auth/PhoneInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Ruler,
  Scale,
  GraduationCap,
  Shield,
  Save,
  Loader2,
  Image as ImageIcon,
  Upload,
  Plus,
  Stethoscope,
  X,
  CreditCard,
  FileText,
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
import { GENDER_OPTIONS } from '@/types/profile'
import { isProfileComplete, calculateProfileCompletion } from '@/services/profileApi'
import { formatApiError } from '@/lib/error-formatter'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { COMMON_SERVICES, CURRENCIES, SPECIALTY_SERVICES } from '@/constants/services'
import { COUNTRIES } from '@/constants/countries'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { apiClient } from '@/lib/api-client'
import PaymentSettingsForm from './PaymentSettingsForm'
import { SPECIALIZATIONS } from '@/types/discovery'
import { getLicenseStatus } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────
const optionalPositiveNumber = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(Number(v)), 'Must be a valid number')
  .refine((v) => !v || Number(v) > 0, 'Must be > 0')

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  price: z.any().optional(),
  currency: z.string().optional().or(z.literal('')),
  is_available: z.boolean().optional(),
})

const profileSchema = z.object({
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  displayName: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  avatar: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  // Patient-only vitals
  bloodGroup: z.string().optional().or(z.literal('')),
  genotype: z.string().optional().or(z.literal('')),
  height: z.string().optional().or(z.literal('')),
  weight: z.string().optional().or(z.literal('')),
  bodyTemperature: z.string().optional().or(z.literal('')),
  bloodPressure: z.string().optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  chronicDisease: z.string().optional().or(z.literal('')),
  // Location
  location: z.object({
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
  }).optional(),
  // Government ID (all roles)
  governmentIdType: z.string().optional().or(z.literal('')),
  governmentIdNumber: z.string().optional().or(z.literal('')),
  // Professional fields (doctor / nurse)
  specialization: z.string().optional().or(z.literal('')),
  licenseNumber: z.string().optional().or(z.literal('')),
  experience: z.string().optional().or(z.literal('')),
  // Services offered (doctor / nurse / biotech)
  services: z.array(serviceSchema).optional(),
  certificates: z.array(z.object({
    name: z.string().min(1, 'Certificate name is required'),
    issuer: z.string().min(1, 'Issuer is required'),
    issueDate: z.string().optional(),
    expiryDate: z.string().min(1, 'Expiry date is required'),
    url: z.string().url('Must be a valid URL').min(1, 'Verification link is required')
  })).optional(),
  licenseExpiryDate: z.string().min(1, 'Professional license expiry date is required').or(z.literal('')),
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

type ProfileFormData = z.infer<typeof profileSchema>

// ─────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────
const GOVERNMENT_ID_TYPES = [
  'National Identity Card (NIN)',
  'International Passport',
  "Driver's Licence",
  "Voter's Card (PVC)",
  'Bank Verification Number (BVN)',
  'Residence Permit',
  'Other Government ID',
] as const

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
  'Fitness Therapist',
  'Others'
] as const;

const DOCTOR_SPECIALIZATIONS = SPECIALIZATIONS.filter(s =>
  !['Nursing', 'Maternity Care', 'Specialist Nurse', 'Biotechnology', 'Biotech Engineer', 'Biotech Engineering', 'Fitness Therapist', ...ALLIED_SPECIALIZATIONS].includes(s)
);

const NURSE_SPECIALIZATIONS = [
  'Nursing', 'Maternity Care', 'Specialist Nurse'
] as const

const BIOTECH_SPECIALIZATIONS = [
  'Biotechnology', 'Biotech Engineer', 'Biotech Engineering'
] as const

const PHARMACIST_SPECIALIZATIONS = [
  'Community Pharmacy', 'Clinical Pharmacy', 'Industrial Pharmacy', 'Hospital Pharmacy', 'Pharmacovigilance'
] as const

const DIAGNOSTIC_SPECIALIZATIONS = [
  'Medical Laboratory Science', 'Radiography', 'Sonography', 'Pathology'
] as const

const VIROLOGIST_SPECIALIZATIONS = [
  'Clinical Virology', 'Molecular Biology', 'Immunology', 'Public Health Virology'
] as const

const DOCTOR_SERVICE_CATEGORIES = [
  'General Consultation', 'Specialist Consultation', 'Surgical Procedure',
  'Diagnostic & Imaging', 'Diagnostic Services', 'Vaccination',
  'Chronic Disease Management', 'Preventive Care', 'Psychiatric Service',
  'Pediatric Care', 'Maternal & Child Health', 'Emergency Care', 'Other',
] as const

const NURSE_SERVICE_CATEGORIES = [
  'Wound Care', 'Medication Administration', 'IV Therapy',
  'Patient Education', 'Post-Operative Care', 'Home Health Care',
  'Palliative Care', 'Maternal & Child Care', 'Chronic Disease Management',
  'Health Screening & Assessment', 'Psychiatric Support',
  'Rehabilitation Care', 'Emergency First Aid', 'Other',
] as const

const BIOTECH_SERVICE_CATEGORIES = [
  'Equipment Maintenance', 'Installation & Setup', 'Technical Support',
  'Technology Planning', 'Safety & Quality Control', 'Documentation', 'Other'
] as const

const EXPERIENCE_OPTIONS = [
  'Less than 1 year', '1-3 years', '3-5 years',
  '5-10 years', '10-15 years', '15-20 years', '20+ years',
] as const

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
const GENOTYPE_OPTIONS = ['AA', 'AS', 'AC', 'SS', 'SC', 'CC'] as const

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
interface IndividualProfileFormProps {
  user: any
  profile: any
  onProfileUpdate: (updatedProfile: any) => void
  isEditing: boolean
  onEditToggle: (editing: boolean) => void
  initialAddService?: string
}

const IndividualProfileForm: React.FC<IndividualProfileFormProps> = ({
  user,
  profile,
  onProfileUpdate,
  isEditing,
  onEditToggle,
  initialAddService
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [govIdFile, setGovIdFile] = useState<File | null>(null)
  const [govIdPreview, setGovIdPreview] = useState<string | null>(
    profile?.governmentIdDoc || null
  )
  const govIdInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingGovId, setIsUploadingGovId] = useState(false)
  const { updateUserProfile } = useAuth()
  const navigate = useNavigate()

  const toDateInputValue = (value?: string) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0]
    return value.length >= 10 ? value.slice(0, 10) : value
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      displayName: profile?.displayName || '',
      phone: profile?.phone || '',
      avatar: profile?.avatar || '',
      dateOfBirth: toDateInputValue(profile?.dateOfBirth),
      gender: profile?.gender || '',
      address: profile?.address || '',
      bloodGroup: profile?.bloodGroup || '',
      genotype: profile?.genotype || '',
      height: profile?.height != null ? String(profile.height) : '',
      weight: profile?.weight != null ? String(profile.weight) : '',
      location: {
        city: profile?.location?.city || '',
        state: profile?.location?.state || '',
        country: profile?.location?.country || '',
        postalCode: profile?.location?.postalCode || '',
      },
      governmentIdType: profile?.governmentIdType || '',
      governmentIdNumber: profile?.governmentIdNumber || '',
      specialization: profile?.specialization || '',
      licenseNumber: profile?.licenseNumber || profile?.practiceNumber || '',
      services: profile?.services || profile?.offeredServices || profile?.offered_services || [],
      certificates: profile?.certificates || [],
      licenseExpiryDate: toDateInputValue(user?.licenseExpiryDate || profile?.licenseExpiryDate),
      paymentSettings: profile?.paymentSettings || {
        requireUpfrontPayment: false,
        currency: 'USD',
        methods: []
      }
    },
  })

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'services',
  })

  const { fields: certificateFields, append: appendCertificate, remove: removeCertificate } = useFieldArray({
    control,
    name: 'certificates',
  })

  // Handle initial service addition from URL
  useEffect(() => {
    if (initialAddService && isEditing) {
      const currentServices = watch('services') || [];
      const exists = currentServices.some(s => s.name?.toLowerCase() === initialAddService.toLowerCase());

      if (!exists) {
        appendService({
          name: initialAddService,
          category: 'Medical Service',
          is_available: true
        });
        toast.success(`Suggested service "${initialAddService}" added!`);
      }
    }
  }, [initialAddService, isEditing, appendService, watch]);

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        avatar: profile.avatar || '',
        dateOfBirth: toDateInputValue(profile.dateOfBirth),
        gender: profile.gender || '',
        address: profile.address || '',
        bloodGroup: profile.bloodGroup || '',
        genotype: profile.genotype || '',
        height: profile.height != null ? String(profile.height) : '',
        weight: profile.weight != null ? String(profile.weight) : '',
        location: {
          city: profile?.location?.city || '',
          state: profile?.location?.state || '',
          country: profile?.location?.country || '',
          postalCode: profile?.location?.postalCode || '',
        },
        governmentIdType: profile?.governmentIdType || '',
        governmentIdNumber: profile?.governmentIdNumber || '',
        experience: profile.experience || '',
        services: profile.services || profile.offeredServices || profile.offered_services || [],
        certificates: profile.certificates || [],
        licenseExpiryDate: toDateInputValue(user?.licenseExpiryDate || profile.licenseExpiryDate),
        paymentSettings: profile.paymentSettings || {
          requireUpfrontPayment: false,
          currency: 'USD',
          methods: []
        }
      })
    }
  }, [profile, reset])

  const watchedValues = watch()

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingAvatar(true)
      const { url } = await apiClient.uploadProfilePicture(file)
      setValue('avatar', url)
      toast.success('Profile picture uploaded!')
    } catch (err: any) {
      console.error('Avatar upload failed:', err)
      toast.error('Failed to upload profile picture')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleGovIdChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ID card image must be under 5 MB')
      return
    }

    try {
      setIsUploadingGovId(true)

      // Update preview immediately for local feedback
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => setGovIdPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setGovIdPreview(null)
      }
      setGovIdFile(file)

      // Background Upload
      const { url } = await apiClient.uploadIdentityDocument(file)
      setGovIdPreview(url) // Switch to actual URL check
      toast.success('ID document uploaded!')
    } catch (err: any) {
      console.error('ID upload failed:', err)
      toast.error('Failed to upload ID document')
      setGovIdFile(null)
      setGovIdPreview(profile?.governmentIdDoc || null)
    } finally {
      setIsUploadingGovId(false)
    }
  }

  useEffect(() => {
    // Only calculate completion based on the SAVED profile, not draft changes
    const percentage = calculateProfileCompletion(profile, user?.roles || [])
    setCompletionPercentage(percentage)
  }, [profile, user?.roles])

  const isDoctor = user?.roles?.includes('doctor')
  const isNurse = user?.roles?.includes('nurse')
  const isBiotech = user?.roles?.includes('biotech_engineer')
  const isAllied = user?.roles?.includes('allied_practitioner')
  const isPharmacist = user?.roles?.includes('pharmacist')
  const isVirologist = user?.roles?.includes('virologist')
  const isDiagnostic = user?.roles?.includes('diagnostic')
  const isProfessional = isDoctor || isNurse || isBiotech || isAllied || isPharmacist || isVirologist || isDiagnostic
  const isPatient = !isProfessional

  // ── Live age calculation ──────────────────────────────────────────
  const calculateAge = (dob: string): number | null => {
    if (!dob) return null
    const birth = new Date(dob)
    if (isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const hasHadBirthday =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
    if (!hasHadBirthday) age--
    return age >= 0 ? age : null
  }

  const watchedDob = watch('dateOfBirth')
  const computedAge = calculateAge(watchedDob || '')

  const serviceCategories = isBiotech ? BIOTECH_SERVICE_CATEGORIES : (isNurse ? NURSE_SERVICE_CATEGORIES : DOCTOR_SERVICE_CATEGORIES)
  const specializations = isBiotech ? BIOTECH_SPECIALIZATIONS :
    isNurse ? NURSE_SPECIALIZATIONS :
      isAllied ? ALLIED_SPECIALIZATIONS :
        isPharmacist ? PHARMACIST_SPECIALIZATIONS :
          isDiagnostic ? DIAGNOSTIC_SPECIALIZATIONS :
            isVirologist ? VIROLOGIST_SPECIALIZATIONS :
              DOCTOR_SPECIALIZATIONS

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true)

      const hasLocation = Boolean(
        data.location?.city?.trim() ||
        data.location?.state?.trim() ||
        data.location?.country?.trim() ||
        data.location?.postalCode?.trim()
      )

      const profileData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName || undefined,
        phone: data.phone,
        avatar: data.avatar || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        // Government ID — all roles
        governmentIdType: data.governmentIdType || undefined,
        governmentIdNumber: data.governmentIdNumber || undefined,
        governmentIdDoc: govIdPreview || undefined,
        // Patient-only vitals
        bloodGroup: isPatient ? data.bloodGroup || undefined : undefined,
        genotype: isPatient ? data.genotype || undefined : undefined,
        height: isPatient ? (data.height ? Number(data.height) : undefined) : undefined,
        weight: isPatient ? (data.weight ? Number(data.weight) : undefined) : undefined,
        location: hasLocation
          ? {
            city: data.location?.city?.trim() || '',
            state: data.location?.state?.trim() || '',
            country: data.location?.country?.trim() || '',
            postalCode: data.location?.postalCode?.trim() || undefined,
            coordinates: profile?.location?.coordinates,
          }
          : undefined,
        // Professional fields
        specialization: isProfessional ? data.specialization || undefined : undefined,
        licenseNumber: isProfessional ? data.licenseNumber || undefined : undefined,
        experience: isProfessional ? data.experience || undefined : undefined,
        services: isProfessional
          ? (data.services || []).filter(s => s.name && s.name.trim() !== '').map(s => ({
            ...s,
            price: s.price === "" || isNaN(Number(s.price)) ? 0 : Number(s.price)
          }))
          : undefined,
        paymentSettings: isProfessional ? {
          ...data.paymentSettings,
          consultationFee: data.paymentSettings?.consultationFee ? Number(data.paymentSettings.consultationFee) : 0,
          serviceFee: data.paymentSettings?.serviceFee ? Number(data.paymentSettings.serviceFee) : 0,
        } : undefined,
        certificates: isProfessional ? data.certificates : undefined,
        licenseExpiryDate: isProfessional ? data.licenseExpiryDate : undefined,
      }

      await updateUserProfile(profileData as any)

      const updatedProfile = { ...profile, ...profileData }
      onProfileUpdate(updatedProfile)
      onEditToggle(false)

      const nowComplete = isProfileComplete(updatedProfile, user?.roles || [])

      if (nowComplete) {
        toast.success('Profile complete! Accessing dashboard...')
        window.location.href = '/dashboard' // Force refresh to update all contexts
      } else {
        toast.success('Progress saved! Complete all fields to access your dashboard.', {
          icon: '💾',
          duration: 4000,
        })
      }

      if (sessionStorage.getItem('postVerifyOnboarding') === 'true') {
        sessionStorage.removeItem('postVerifyOnboarding')
        if (nowComplete) navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(formatApiError(error?.response?.data?.message || error?.message || 'Failed to update profile'))
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

  const completionColor =
    completionPercentage >= 80
      ? 'bg-green-500'
      : completionPercentage >= 50
        ? 'bg-yellow-500'
        : 'bg-red-500'

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* ── Profile Completion Banner ── */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">Profile Completion</span>
            <span className="text-sm font-bold text-blue-900">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${completionColor}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          {completionPercentage < 100 && (
            <p className="text-xs text-blue-700 mt-2">
              Complete your profile to unlock full access to your dashboard.
            </p>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* ── Top action bar ── */}
        <div className="flex items-center justify-between">
          <div />
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                  )}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => onEditToggle(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            CARD 1 — Personal Information
        ══════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-6 pb-4 border-b border-gray-100">
              <div className="relative group">
                <div
                  className={cn(
                    "w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400",
                    isEditing && "cursor-pointer hover:bg-gray-200/50"
                  )}
                  onClick={() => isEditing && avatarInputRef.current?.click()}
                >
                  {watch('avatar') ? (
                    <img src={watch('avatar')} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-semibold text-gray-900">Profile Photo</h4>
                <p className="text-xs text-gray-500">
                  {isEditing
                    ? 'Recommended: Square image, max 5MB (JPEG, PNG)'
                    : 'Your professional profile picture'}
                </p>
                {isEditing && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      Change Photo
                    </Button>
                    {watch('avatar') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setValue('avatar', '')}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="firstName" {...register('firstName')} disabled={!isEditing} className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`} placeholder="First name" />
                </div>
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="lastName" {...register('lastName')} disabled={!isEditing} className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`} placeholder="Last name" />
                </div>
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Display name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" {...register('displayName')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} placeholder="How you'd like to appear publicly" />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
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
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  {computedAge !== null && (
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {computedAge} yrs old
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} disabled={!isEditing} className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={watch('gender') || ''} onValueChange={(v) => setValue('gender', v)} disabled={!isEditing}>
                  <SelectTrigger id="gender" className={!isEditing ? 'bg-gray-50' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Home Address</Label>
              <Textarea id="address" {...register('address')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} placeholder="Street address…" rows={2} />
            </div>

            {/* ── Patient-only vitals ── */}
            {isPatient && (
              <>
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Clinical Vitals</h4>
                  <p className="text-xs text-gray-500 mb-4">Core physiological indicators for clinical assessment.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select value={watch('bloodGroup') || ''} onValueChange={(v) => setValue('bloodGroup', v)} disabled={!isEditing}>
                      <SelectTrigger id="bloodGroup" className={!isEditing ? 'bg-gray-50' : ''}>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUP_OPTIONS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genotype">Genotype</Label>
                    <Select value={watch('genotype') || ''} onValueChange={(v) => setValue('genotype', v)} disabled={!isEditing}>
                      <SelectTrigger id="genotype" className={!isEditing ? 'bg-gray-50' : ''}>
                        <SelectValue placeholder="Select genotype" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENOTYPE_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="height" type="number" step="0.01" min="0" {...register('height')} disabled={!isEditing} className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`} placeholder="e.g., 175" />
                    </div>
                    {errors.height && <p className="text-sm text-red-600">{(errors.height as any)?.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="weight" type="number" step="0.01" min="0" {...register('weight')} disabled={!isEditing} className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`} placeholder="e.g., 72" />
                    </div>
                    {errors.weight && <p className="text-sm text-red-600">{(errors.weight as any)?.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bodyTemperature">Body Temperature (°C)</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="bodyTemperature" type="number" step="0.1" {...register('bodyTemperature')} disabled={!isEditing} className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`} placeholder="e.g., 36.5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="bloodPressure" {...register('bloodPressure')} disabled={!isEditing} className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`} placeholder="e.g., 120/80" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Known Allergies</Label>
                    <Textarea id="allergies" {...register('allergies')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} placeholder="List any medical, food, or environmental allergies..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chronicDisease">Chronic Disease Status</Label>
                    <Select value={watch('chronicDisease') || ''} onValueChange={(v) => setValue('chronicDisease', v)} disabled={!isEditing}>
                      <SelectTrigger id="chronicDisease" className={!isEditing ? 'bg-gray-50' : ''}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="na">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════
            CARD 2 — Government-Issued Identity
            (ALL roles — patient, nurse, doctor)
        ══════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Government-Issued Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Providing a valid government ID helps verify your identity and improves trust on the platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="governmentIdType">ID Card Type</Label>
                <Select
                  value={watch('governmentIdType') || ''}
                  onValueChange={(v) => setValue('governmentIdType', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="governmentIdType" className={!isEditing ? 'bg-gray-50' : ''}>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOVERNMENT_ID_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="governmentIdNumber">ID Number</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="governmentIdNumber"
                    {...register('governmentIdNumber')}
                    disabled={!isEditing}
                    className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                    placeholder="Enter your ID number"
                  />
                </div>
              </div>
            </div>

            {/* ── ID Card Image Upload ── */}
            <div className="space-y-2">
              <Label className="font-medium">Upload ID Card Image</Label>
              <p className="text-xs text-gray-500">
                Upload a clear photo or scan of your government-issued ID card (JPEG, PNG, WebP or PDF · Max 5 MB)
              </p>

              {/* Hidden file input */}
              <input
                ref={govIdInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                disabled={!isEditing}
                onChange={handleGovIdChange}
              />

              {govIdPreview || govIdFile ? (
                <div className="flex items-start gap-4 p-4 border-2 border-purple-200 rounded-xl bg-purple-50/40 relative">
                  {isUploadingGovId && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-xl">
                      <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                    </div>
                  )}
                  {govIdPreview?.startsWith('data:image') || govIdPreview?.startsWith('http') ? (
                    <img
                      src={govIdPreview}
                      alt="ID card"
                      className="w-28 h-20 object-cover rounded-lg border border-purple-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-28 h-20 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-8 w-8 text-purple-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {govIdFile?.name || 'Uploaded ID card'}
                    </p>
                    {govIdFile && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(govIdFile.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                    <p className="text-xs text-green-600 font-semibold mt-1">✓ ID card attached</p>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => { setGovIdFile(null); setGovIdPreview(null) }}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => govIdInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-all group ${isEditing
                    ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50/50 cursor-pointer'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 group-hover:text-purple-500 mb-2 transition-colors" />
                  <p className="text-sm font-medium text-gray-600 group-hover:text-purple-700">
                    Click to upload ID card photo / scan
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP or PDF · Max 5 MB</p>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════
            CARD 3 — Location
        ══════════════════════════════════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" {...register('location.city')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} placeholder="City" />
                {errors.location?.city && <p className="text-sm text-red-600">{errors.location.city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province *</Label>
                <Input id="state" {...register('location.state')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} placeholder="State or Province" />
                {errors.location?.state && <p className="text-sm text-red-600">{errors.location.state.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">ZIP / Postal Code *</Label>
                <Input id="postalCode" {...register('location.postalCode')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} placeholder="ZIP or Postal Code" />
                {errors.location?.postalCode && <p className="text-sm text-red-600">{errors.location.postalCode.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Controller
                  name="location.country"
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
                {errors.location?.country && <p className="text-sm text-red-600">{errors.location.country.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ══════════════════════════════════════════
            CARD 4 — Professional Information
            (doctors & nurses only)
        ══════════════════════════════════════════ */}
        {isProfessional && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Specialization */}
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-blue-700 font-bold">Clinical Subspecialty</Label>
                  <Select
                    value={(specializations as any[]).includes(watch('specialization' as any) || '') ? watch('specialization' as any) || '' : (watch('specialization' as any) ? 'Other' : '')}
                    onValueChange={(v) => {
                      if (v !== 'Other') {
                        setValue('specialization', v);
                      } else {
                        setValue('specialization', '');
                      }
                    }}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="specialization" className={!isEditing ? 'bg-gray-50' : ''}>
                      <SelectValue placeholder="Select your specific subspecialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other / Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Manual Input if 'Other' is selected or value is not in list */}
                  {(!(specializations as any[]).includes(watch('specialization' as any) || '') && watch('specialization' as any)) || (watch('specialization' as any) === '' && isEditing) ? (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="manualSpecialization" className="text-[10px] text-gray-500 uppercase font-bold">Type Specialty Manually</Label>
                      <Input
                        id="manualSpecialization"
                        value={watch('specialization' as any) || ''}
                        onChange={(e) => setValue('specialization', e.target.value)}
                        disabled={!isEditing}
                        placeholder="e.g. Cardiothoracic Surgeon"
                        className={cn("mt-1", !isEditing ? 'bg-gray-50' : 'border-blue-200 focus:ring-blue-500')}
                      />
                    </div>
                  ) : null}

                  {errors.specialization && <p className="text-sm text-red-600 font-bold uppercase text-[10px]">{errors.specialization.message}</p>}
                </div>

                {/* Practice / Nursing Council Number */}
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">
                    {isNurse ? 'Nursing Council Number (NMCN) *' : 'Medical Practice Number *'}
                  </Label>
                  <Input
                    id="licenseNumber"
                    {...register('licenseNumber')}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    placeholder={isNurse ? 'e.g., NCN/2023/12345' : 'e.g., MDCN/2023/12345'}
                  />
                  {errors.licenseNumber && <p className="text-sm text-red-600">{errors.licenseNumber.message}</p>}
                </div>

                {/* License Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiryDate" className="flex items-center justify-between">
                    License Expiry Date *
                    {watch('licenseExpiryDate') && (
                      <Badge className={cn("text-[10px] h-5", getLicenseStatus(watch('licenseExpiryDate')).bg, getLicenseStatus(watch('licenseExpiryDate')).text)}>
                        {getLicenseStatus(watch('licenseExpiryDate')).message}
                      </Badge>
                    )}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="licenseExpiryDate"
                      type="date"
                      {...register('licenseExpiryDate')}
                      disabled={!isEditing}
                      className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  {errors.licenseExpiryDate && <p className="text-sm text-red-600">{(errors.licenseExpiryDate as any).message}</p>}
                </div>

                {/* Experience */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select
                    value={watch('experience') || ''}
                    onValueChange={(v) => setValue('experience', v)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="experience" className={!isEditing ? 'bg-gray-50' : ''}>
                      <SelectValue placeholder="Select years of experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.experience && <p className="text-sm text-red-600">{errors.experience.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ══════════════════════════════════════════
            CARD 5 — Services Offered
            (doctors & nurses)
        ══════════════════════════════════════════ */}
        {isProfessional && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-indigo-600" />
                Services Offered
              </CardTitle>
              {isEditing && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => appendService({ name: '', description: '', category: '', price: undefined, currency: 'USD', is_available: true })}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Service
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceFields.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <Stethoscope className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">No services listed yet</p>
                  {isEditing && (
                    <p className="text-xs text-gray-400 mt-1">
                      Click <span className="font-semibold">Add Service</span> to list the services you provide.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceFields.map((field, index) => (
                    <div key={field.id} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/60">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}

                      <div className="absolute -top-2 left-4 flex gap-1">
                        <Badge className="bg-indigo-600 hover:bg-indigo-600 text-[10px] h-5 px-1.5 shadow-sm border-indigo-400">
                          SEARCHABLE IDENTIFIER
                        </Badge>
                        <Badge variant="outline" className="bg-white text-[10px] h-5 px-1.5 shadow-sm">
                          SERVICE #{index + 1}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Service Name</Label>
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
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white shadow-2xl border border-gray-200 z-[100]" align="start">
                                  <Command className="bg-white">
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
                                      <CommandGroup heading={`Services for ${watch('specialization') || 'General'}`}>
                                        {[...new Set([
                                          ...(COMMON_SERVICES.general),
                                          ...(watch('specialization') ? (SPECIALTY_SERVICES[watch('specialization') as string] || []) : []),
                                          ...(isDoctor ? COMMON_SERVICES.doctor : []),
                                          ...(isNurse ? COMMON_SERVICES.nurse : []),
                                          ...(isBiotech ? COMMON_SERVICES.biotech_engineer : []),
                                          ...(isPharmacist ? COMMON_SERVICES.pharmacy : []),
                                          ...(isDiagnostic ? COMMON_SERVICES.diagnostic : [])
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
                          <Label className="text-xs font-medium">Category</Label>
                          <Select
                            value={watch(`services.${index}.category`) || ''}
                            onValueChange={(v) => setValue(`services.${index}.category`, v)}
                            disabled={!isEditing}
                          >
                            <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceCategories.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs font-medium">Description</Label>
                          <Input
                            {...register(`services.${index}.description`)}
                            disabled={!isEditing}
                            className={!isEditing ? 'bg-gray-50' : ''}
                            placeholder="Brief description of the service"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Currency</Label>
                          <Select
                            value={(watch(`services.${index}.currency` as any) as string) || 'USD'}
                            onValueChange={(val) => setValue(`services.${index}.currency` as any, val)}
                            disabled={!isEditing}
                          >
                            <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
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
                          <Label className="text-xs font-medium">Price</Label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                              {CURRENCIES.find(c => c.value === (watch(`services.${index}.currency` as any) || 'USD'))?.label.split(' ')[0] || '$'}
                            </div>
                            <Input
                              type="number"
                              {...register(`services.${index}.price`, { valueAsNumber: true })}
                              disabled={!isEditing}
                              className={`pl-9 ${!isEditing ? 'bg-gray-50' : ''}`}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Availability</Label>
                          <Select
                            value={watch(`services.${index}.is_available`) ? 'true' : 'false'}
                            onValueChange={(v) => setValue(`services.${index}.is_available`, v === 'true')}
                            disabled={!isEditing}
                          >
                            <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">✅ Available</SelectItem>
                              <SelectItem value="false">🔴 Not Available</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Settings Section for Professionals */}
        {isProfessional && (isEditing || profile) && (
          <PaymentSettingsForm
            register={register}
            control={control}
            watch={watch}
            setValue={setValue}
            isEditing={isEditing}
            isCenter={false}
          />
        )}

        {/* ══════════════════════════════════════════
            CARD 4 — Professional Certificates
        ══════════════════════════════════════════ */}
        {isProfessional && (isEditing || (watchedValues.certificates && watchedValues.certificates.length > 0)) && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                Professional Certificates
              </CardTitle>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendCertificate({ name: '', issuer: '', url: '', expiryDate: '' })}
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Certificate
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                {isBiotech
                  ? 'List certificates earned from tech firms or local companies.'
                  : 'Add professional certifications to enhance your profile trust.'}
              </p>

              {certificateFields.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-sm text-gray-400">No certificates added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificateFields.map((field, index) => (
                    <div key={field.id} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/40">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeCertificate(index)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Certificate Name</Label>
                          <Input
                            {...register(`certificates.${index}.name`)}
                            disabled={!isEditing}
                            className={!isEditing ? 'bg-gray-50' : ''}
                            placeholder="e.g. AWS Machine Learning Specialist"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Issuer</Label>
                          <Input
                            {...register(`certificates.${index}.issuer`)}
                            disabled={!isEditing}
                            className={!isEditing ? 'bg-gray-50' : ''}
                            placeholder="e.g. Amazon Web Services, Local Tech Hub"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Verification Link / URL *</Label>
                          <Input
                            {...register(`certificates.${index}.url`)}
                            disabled={!isEditing}
                            className={!isEditing ? 'bg-gray-50' : ''}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium flex items-center justify-between">
                            Expiry Date *
                            {watch(`certificates.${index}.expiryDate`) && (
                              <Badge className={cn("text-[10px] h-4 leading-none px-1", getLicenseStatus(watch(`certificates.${index}.expiryDate`)).bg, getLicenseStatus(watch(`certificates.${index}.expiryDate`)).text)}>
                                {getLicenseStatus(watch(`certificates.${index}.expiryDate`)).message}
                              </Badge>
                            )}
                          </Label>
                          <Input
                            type="date"
                            {...register(`certificates.${index}.expiryDate`)}
                            disabled={!isEditing}
                            className={!isEditing ? 'bg-gray-50' : ''}
                          />
                        </div>
                      </div>
                      {watch(`certificates.${index}.expiryDate`) && getLicenseStatus(watch(`certificates.${index}.expiryDate`)).status === 'expired' && (
                        <p className="text-[10px] text-red-600 mt-2 font-medium bg-red-50 p-1.5 rounded border border-red-100 italic">
                          ⚠️ This certificate has expired. Renewal is mandatory to maintain practice authorization.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </form>

      {/* ── Security Note ── */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-800">Your Privacy & Security</h4>
              <p className="text-sm text-gray-600 mt-1">
                All personal and identity information is encrypted and stored securely. We follow HIPAA guidelines
                to ensure your data remains private and protected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacer for mobile bottom navigation */}
      <div className="h-24 md:hidden" aria-hidden="true" />
    </div>
  )
}

export default IndividualProfileForm
