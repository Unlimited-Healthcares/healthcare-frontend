import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import { Shield, Users, Zap } from 'lucide-react'
import VerifyAccount from '@/components/auth/VerifyAccount'
import VerifyChoice from '@/components/auth/VerifyChoice'
import { TwoFactorModal } from '@/components/auth/TwoFactorModal'

type AuthMode = 'login' | 'register' | 'verify' | 'verify-choice'

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, profile, isTwoFactorRequired, completeTwoFactor, cancelTwoFactor } = useAuth()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const isComplete = profile !== null && !(profile as any).is_fallback;
      const from = location.state?.from?.pathname || (!isComplete ? '/profile' : '/dashboard')
      navigate(from, { replace: true })
      return
    }

    // Handle verification tabs from URL
    const searchParams = new URLSearchParams(location.search)
    const tab = searchParams.get('tab')
    if (tab === 'verify' || searchParams.get('token')) {
      setAuthMode('verify')
    } else if (tab === 'verify-choice') {
      setAuthMode('verify-choice')
    }
  }, [isAuthenticated, navigate, location])

  const handleSwitchToRegister = () => setAuthMode('register')
  const handleSwitchToLogin = () => {
    setAuthMode('login')
    navigate('/auth', { replace: true })
  }

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow in Phase 2
    console.log('Forgot password clicked')
  }

  const handleChoiceMade = (channel: string) => {
    const email = new URLSearchParams(location.search).get('email') || ''
    navigate(`/auth?tab=verify&email=${encodeURIComponent(email)}&channel=${channel}`, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-healthcare-50 to-primary-50 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-healthcare-600 to-primary-700 text-white p-12 flex-col justify-center">
        <div className="max-w-lg">
          <div className="flex items-center space-x-3 mb-8">
            <img src="/images/logo/logo-new.png" alt="UHC Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-3xl font-bold">UnlimitedHealthCares</h1>
          </div>

          <h2 className="text-4xl font-bold mb-6">
            Your Complete Healthcare Journey
          </h2>

          <p className="text-xl text-healthcare-100 mb-12 leading-relaxed">
            Access comprehensive healthcare services, AI-powered health insights, and real-time care coordination - all in one unified platform.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Quick Start</h3>
                <p className="text-healthcare-100">Get started in just 30 seconds with minimal information</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
                <p className="text-healthcare-100">HIPAA compliant with enterprise-grade security</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI-Powered Care</h3>
                <p className="text-healthcare-100">Intelligent health recommendations and symptom analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Auth Mode Tabs */}
          {authMode !== 'verify' && authMode !== 'verify-choice' && (
            <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
              <button
                onClick={handleSwitchToLogin}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMode === 'login'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={handleSwitchToRegister}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${authMode === 'register'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Form Content */}
          <div className="animate-fade-in text-left">
            {authMode === 'login' ? (
              <LoginForm
                onSwitchToRegister={handleSwitchToRegister}
                onForgotPassword={handleForgotPassword}
              />
            ) : authMode === 'register' ? (
              <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
            ) : authMode === 'verify-choice' ? (
              <VerifyChoice
                email={new URLSearchParams(location.search).get('email') || ''}
                onChoiceMade={handleChoiceMade}
                onBackToLogin={handleSwitchToLogin}
              />
            ) : (
              <VerifyAccount
                email={new URLSearchParams(location.search).get('email') || ''}
                initialCode={new URLSearchParams(location.search).get('token') || ''}
                onBackToLogin={handleSwitchToLogin}
              />
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>

      {isTwoFactorRequired && (
        <TwoFactorModal
          onVerify={completeTwoFactor}
          onCancel={cancelTwoFactor}
          email={new URLSearchParams(location.search).get('email') || user?.email || ''}
        />
      )}
    </div>
  )
}

export default AuthPage
