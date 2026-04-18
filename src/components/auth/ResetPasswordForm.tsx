import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/services/authApi'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
    token: string
    onBackToLogin: () => void
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onBackToLogin }) => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            setLoading(true)
            setError(null)
            await authApi.resetPassword(token, data.password)
            setSuccess(true)
        } catch (err: any) {
            console.error('Reset password error:', err)
            setError(err?.response?.data?.message || 'Failed to reset password. The link may be expired or invalid.')
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
                <p className="text-gray-600 mb-8">
                    Your password has been successfully reset. You can now log in with your new password.
                </p>
                <button
                    onClick={onBackToLogin}
                    className="btn-primary w-full flex items-center justify-center"
                >
                    Go to Login
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
                <p className="text-gray-600">Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* New Password Field */}
                <div>
                    <label htmlFor="password" className="form-label">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            className={`input-field pr-10 ${errors.password ? 'border-error-500' : ''}`}
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-600" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="error-message">{errors.password.message}</p>
                    )}
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            {...register('confirmPassword')}
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            className={`input-field pr-10 ${errors.confirmPassword ? 'border-error-500' : ''}`}
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-600" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="error-message">{errors.confirmPassword.message}</p>
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
                            Resetting Password...
                        </>
                    ) : (
                        'Reset Password'
                    )}
                </button>
            </form>
        </div>
    )
}

export default ResetPasswordForm
