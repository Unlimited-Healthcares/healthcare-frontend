import React, { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { PhoneInput } from './PhoneInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Stethoscope,
  Heart,
  Building2,
  Microscope,
  Pill,
  Dumbbell,
  Activity,
  Truck,
  Milestone,
  Baby,
  Dna
} from 'lucide-react'
import CheckEmail from './CheckEmail'
import { cn } from '@/lib/utils'

// Registration form validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(10, 'Password must be at least 10 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  roles: z.array(z.string()).length(1, 'Please select exactly one role'),
  phone: z.string().min(5, 'Phone number is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSwitchToLogin?: () => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const { signUp, loading, authError, clearAuthError } = useAuth()
  const formFieldsRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      roles: []
    }
  })

  const selectedRoles = watch('roles')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearAuthError()
      await signUp(data.email, data.password, {
        name: data.name,
        roles: data.roles,
        phone: data.phone
      })
      // Navigate directly to verify page as code is now sent automatically
      navigate(`/auth?tab=verify&email=${encodeURIComponent(data.email)}`)
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  // Available roles with icons
  const availableRoles = [
    { value: 'patient', label: 'Patient', icon: User, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Personal health management' },
    { value: 'doctor', label: 'Health Care Practitioner', icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'Medical service provider' },
    { value: 'nurse', label: 'Nurse', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', description: 'Patient care specialist' },
    { value: 'center', label: 'Hospital', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', description: '(inpatient and outpatient services)' },
    { value: 'diagnostic', label: 'Diagnostic', icon: Microscope, color: 'text-cyan-600', bg: 'bg-cyan-50', description: 'Lab & imaging services' },
    { value: 'pharmacy', label: 'Pharmacy', icon: Pill, color: 'text-purple-600', bg: 'bg-purple-50', description: 'Medicine & prescriptions' },
    { value: 'fitness_center', label: 'Fitness', icon: Dumbbell, color: 'text-orange-600', bg: 'bg-orange-50', description: 'Gym & wellness' },
    { value: 'ambulance_service', label: 'Ambulance', icon: Truck, color: 'text-red-600', bg: 'bg-red-50', description: 'Emergency transport' },
    { value: 'mortuary', label: 'Mortuary', icon: Milestone, color: 'text-gray-600', bg: 'bg-gray-50', description: 'Funeral services' },
    { value: 'maternity', label: 'Maternity', icon: Baby, color: 'text-pink-600', bg: 'bg-pink-50', description: '(child delivery services)' },
    { value: 'virology', label: 'Virology', icon: Dna, color: 'text-blue-700', bg: 'bg-blue-100', description: 'Virus & infection research' },
    { value: 'biotech_engineer', label: 'Biotech / Prosthetics', icon: Microscope, color: 'text-cyan-700', bg: 'bg-cyan-100', description: 'Bio-engineering, Prosthetics & research' },
    { value: 'allied_practitioner', label: 'Allied Healthcare Practitioner', icon: Heart, color: 'text-emerald-700', bg: 'bg-emerald-100', description: 'Allied medical personnels' },
  ]

  const handleRoleSelect = (roleValue: string) => {
    setValue('roles', [roleValue])

    // Automatically scroll down to the next fields with a slight delay for better UX
    setTimeout(() => {
      formFieldsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-left mb-10">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Create Account</h2>
        <p className="text-gray-500 font-medium">Select your specialty to begin.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Roles Selection - Grid Layout */}
        <div role="group" aria-labelledby="role-legend">
          <label id="role-legend" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Identity <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableRoles.map((role) => {
              const isSelected = selectedRoles?.[0] === role.value
              const Icon = role.icon
              return (
                <div
                  key={role.value}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "relative group flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-center",
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-50"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => handleRoleSelect(role.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleRoleSelect(role.value)
                    }
                  }}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110",
                    isSelected ? "bg-blue-600 text-white" : cn(role.bg, role.color)
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "text-sm font-bold tracking-tight",
                    isSelected ? "text-blue-900" : "text-gray-700"
                  )}>
                    {role.label}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium leading-tight">
                    {role.description}
                  </p>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
              )
            })}
          </div>
          {errors.roles && (
            <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-wide">{errors.roles.message}</p>
          )}
        </div>

        <div
          ref={formFieldsRef}
          className="space-y-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 scroll-mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Full Legal Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                autoComplete="name"
                className={cn(
                  "block w-full px-4 py-3 rounded-xl border-gray-100 bg-white text-gray-900 placeholder-gray-300 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all font-medium",
                  errors.name && "border-red-300 focus:ring-red-50 focus:border-red-500"
                )}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.name.message}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Electronic Mail
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                className={cn(
                  "block w-full px-4 py-3 rounded-xl border-gray-100 bg-white text-gray-900 placeholder-gray-300 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all font-medium",
                  errors.email && "border-red-300 focus:ring-red-50 focus:border-red-500"
                )}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Contact Number
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
              {errors.phone && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.phone.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Secure Password
              </label>
              <div className="relative group">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  className={cn(
                    "block w-full px-4 py-3 rounded-xl border-gray-100 bg-white text-gray-900 placeholder-gray-300 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all font-medium",
                    errors.password && "border-red-300 focus:ring-red-50 focus:border-red-500"
                  )}
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.password.message}</p>}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
              Confirm Password
            </label>
            <div className="relative group">
              <input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                className={cn(
                  "block w-full px-4 py-3 rounded-xl border-gray-100 bg-white text-gray-900 placeholder-gray-300 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all font-medium",
                  errors.confirmPassword && "border-red-300 focus:ring-red-50 focus:border-red-500"
                )}
                placeholder="••••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* Error Display */}
        {authError && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 animate-shake">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <p className="text-sm font-bold text-red-700 tracking-tight">{authError}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex items-center justify-center py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg tracking-tight transition-all duration-300 shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 overflow-hidden"
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              <>
                <span className="relative z-10">Initialise Account</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full py-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            Already have an account? Log in
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegisterForm
