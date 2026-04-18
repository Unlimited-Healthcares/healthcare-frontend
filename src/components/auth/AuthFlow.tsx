import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import CenterCreation from './CenterCreation'
import { Loader2 } from 'lucide-react'

interface AuthFlowProps {
  children: React.ReactNode
}

const AuthFlow: React.FC<AuthFlowProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<'loading' | 'center' | 'dashboard'>('loading')

  useEffect(() => {
    // Only proceed if we're not loading and have a definitive authentication state
    if (!loading) {
      if (isAuthenticated && user) {
        console.log('🔐 AuthFlow: User authenticated, proceeding to dashboard')
        
        // Skip profile completion for now - let users access dashboard and edit profile optionally
        // Check if center role user needs to create center
        if (user.roles.includes('center')) {
          console.log('🔐 AuthFlow: Center user, checking center creation')
          // TODO: Check if center already exists
          setCurrentStep('center')
        } else {
          console.log('🔐 AuthFlow: Proceeding to dashboard')
          setCurrentStep('dashboard')
        }
      } else if (!isAuthenticated) {
        // Only redirect to login if we're sure the user is not authenticated
        // This prevents premature redirects during token refresh
        console.log('🔐 AuthFlow: User not authenticated, redirecting to login')
        navigate('/auth')
      }
    }
  }, [loading, isAuthenticated, user, navigate])

  // Reset currentStep when user changes to prevent stale state
  useEffect(() => {
    if (user?.id) {
      setCurrentStep('loading')
    }
  }, [user?.id])


  const handleCenterCreationComplete = () => {
    setCurrentStep('dashboard')
  }

  if (loading || currentStep === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {loading ? 'Checking your session...' : 'Loading your dashboard...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we verify your authentication
          </p>
        </div>
      </div>
    )
  }

  if (currentStep === 'center') {
    return <CenterCreation onComplete={handleCenterCreationComplete} />
  }

  if (currentStep === 'dashboard') {
    return <>{children}</>
  }

  return null
}

export default AuthFlow
