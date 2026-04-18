import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  const pathname = location.pathname
  const onProfilePage = pathname === '/profile'
  const onKycPage = pathname === '/kyc-verification'

  // Only redirect brand-new users who have no profile at all to the profile setup page.
  // Users with a partial profile can access the dashboard — the completion banner
  // there will guide them to fill in remaining fields.
  if (!onProfilePage && !onKycPage && profile == null) {
    return <Navigate to="/profile" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
