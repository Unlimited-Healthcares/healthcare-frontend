import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/services/authApi'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
    onBackToLogin: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setLoading(true)
            setError(null)
            await authApi.forgotPassword(data.email)
            setSuccess(true)
        } catch (err: any) {
            console.error('Forgot password error:', err)
            setError(err?.response?.data?.message || 'Failed to send reset link. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="w-full max-w-md mx-auto text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-success-100 p-3 rounded-full">
                        <CheckCircle className="h-12 w-12 text-success-600" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-8">
                    We've sent a password reset link to your email address. It should arrive in a couple of minutes.
                </p>
                <button
                    onClick={onBackToLogin}
                    className="btn-primary w-full flex items-center justify-center"
                >
                    Back to Login
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-600">Enter your email and we'll send you a link to reset your password</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="form-label">
                        Email Address
                    </label>
                    <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className={`input-field ${errors.email ? 'border-error-500' : ''}`}
                        placeholder="Enter your email"
                    />
                    {errors.email && (
                        <p className="error-message">{errors.email.message}</p>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                        <p className="text-sm text-error-700">{error}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Sending Link...
                        </>
                    ) : (
                        'Send Reset Link'
                    )}
                </button>

                {/* Back to Login */}
                <div className="text-center">
                    <button
                        type="button"
                        onClick={onBackToLogin}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ForgotPasswordForm
