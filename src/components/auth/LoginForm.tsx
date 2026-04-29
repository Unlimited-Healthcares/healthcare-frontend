import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { NativeBiometric } from '@capgo/capacitor-native-biometric'
import { Capacitor } from '@capacitor/core'
import { toast } from 'react-hot-toast'

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSwitchToRegister: (verify?: boolean) => void
  onForgotPassword: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isBiometricPromptVisible, setIsBiometricPromptVisible] = useState(false)
  const { signIn, loading, authError, clearAuthError } = useAuth()
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  React.useEffect(() => {
    const checkBiometric = async () => {
      if (!Capacitor.isNativePlatform()) return;
      try {
        const result = await NativeBiometric.isAvailable();
        setBiometricAvailable(result.isAvailable);
      } catch (err) {
        setBiometricAvailable(false);
      }
    };
    checkBiometric();
  }, []);

  const handleBiometricLogin = async () => {
    try {
      setIsBiometricPromptVisible(true);
      const credentials = await NativeBiometric.getCredentials({
        server: 'unlimited-healthcare.app'
      });

      if (credentials) {
        await signIn(credentials.username, credentials.password);
      } else {
        toast.error('No saved credentials found. Please sign in with your email and password first to enable biometric login.');
      }
    } catch (err: any) {
      console.error('Biometric login failed', err);
      // Only show error if it's not a user cancellation
      if (!err.message?.includes('User canceled') && !err.message?.includes('cancel')) {
        toast.error(`Biometric login failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsBiometricPromptVisible(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearAuthError()
      await signIn(data.email, data.password, rememberMe)

      // ALways store credentials in the secure vault on native platforms when login succeeds
      // so if they enable biometric later from settings, the credentials are ALREADY preserved.
      if (Capacitor.isNativePlatform()) {
        try {
          await NativeBiometric.setCredentials({
            username: data.email,
            password: data.password,
            server: 'unlimited-healthcare.app'
          });
          console.info('Credentials stored in secure vault automatically for subsequent biometric setup');
        } catch (err) {
          console.error('Failed to store credentials in native vault', err);
        }
      }
    } catch (error) {
      // Error is already handled by the useAuth hook
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight uppercase">Welcome Back</h2>
        <p className="text-gray-500 font-medium italic">Sign in to your healthcare account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="form-label uppercase text-[10px] font-black tracking-widest text-gray-400">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-[10px] uppercase font-bold text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="form-label uppercase text-[10px] font-black tracking-widest text-gray-400">
            Secure Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-blue-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] uppercase font-bold text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me Toggle */}
        <div className="flex items-center space-x-2 px-1">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="rememberMe" className="text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer">
            Remember me on this device
          </label>
        </div>

        {/* Error Display */}
        {authError && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-xs font-bold text-red-700">{authError}</p>
          </div>
        )}

        {/* Forgot Password Link */}
        <div className="flex justify-between items-center px-1">
          <button
            type="button"
            onClick={() => onSwitchToRegister(true)}
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
          >
            Verify Account
          </button>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary flex-1 flex items-center justify-center h-12 shadow-xl shadow-blue-100 active:scale-95 transition-all ${biometricAvailable ? 'rounded-l-2xl' : 'rounded-2xl'}`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Initialising...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {biometricAvailable && (
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={loading}
              className="w-14 h-12 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center rounded-r-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all"
              title="Sign in with biometrics"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-fingerprint"><path d="M2 12a10 10 0 0 1 13-9.54" /><path d="M7 19a10 10 0 0 1 14-7" /><path d="M5 12a10 10 0 0 1 11-13" /><path d="M9 19a10 10 0 0 1 9-9.54" /><path d="M7 12a10 10 0 0 1 12 5" /><path d="M12 12a10 10 0 0 1 4 4" /><path d="M12 20a10 10 0 0 1-5-1.54" /><path d="M15 20a10 10 0 0 0 5-1.54" /></svg>
            </button>
          )}
        </div>

        {/* Switch to Register */}
        <div className="text-center pt-2">
          <p className="text-sm font-bold text-gray-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onSwitchToRegister(false)}
              className="text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
