import { ReactNode, useEffect, useState, useRef, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw, WifiOff } from "lucide-react";
import { toast } from "sonner";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, user, profile, refreshSession, authError } = useAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const lastNetworkStatus = useRef<boolean>(navigator.onLine);
  const reconnectionAttempted = useRef<boolean>(false);
  const refreshAttemptCount = useRef<number>(0);
  const maxRefreshAttempts = 3;
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store the current location to redirect back after auth
  const [returnPath, setReturnPath] = useState<string | null>(null);
  
  // Clear any existing refresh timeout
  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    // Save the current path for later redirect
    if (location.pathname !== '/auth/login' && !returnPath) {
      setReturnPath(location.pathname);
    }
  }, [location.pathname, returnPath]);

  const handleRefreshSession = useCallback(async (isNetworkRecovery = false) => {
    if (isRefreshing || refreshAttempted) return;
    
    setIsRefreshing(true);
    setRefreshError(null);
    setRefreshAttempted(true);
    
    try {
      console.log("Attempting to refresh auth session...");
      await refreshSession();
      
      if (isNetworkRecovery) {
        toast.success("Connection restored. Your session has been refreshed.");
      }
      
      refreshAttemptCount.current = 0;
      setIsRefreshing(false);
    } catch (error) {
      console.error("Failed to refresh session:", error);
      refreshAttemptCount.current += 1;
      
      if (refreshAttemptCount.current >= maxRefreshAttempts) {
        setRefreshError("Failed to authenticate your session after multiple attempts. Please try logging in again.");
        toast.error("Failed to restore your session. Please try logging in again.");
        
        // Clear the invalid tokens after max retry attempts
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      } else {
        // Retry after a delay with increasing backoff
        const retryDelay = 1000 * Math.pow(2, refreshAttemptCount.current - 1); // Exponential backoff
        toast.loading(`Retrying authentication (Attempt ${refreshAttemptCount.current}/${maxRefreshAttempts})...`, {
          duration: retryDelay,
        });
        
        refreshTimeoutRef.current = setTimeout(() => {
          setRefreshAttempted(false); // Reset so we can try again
          setIsRefreshing(false);
        }, retryDelay);
        return;
      }
      
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshAttempted, refreshSession, maxRefreshAttempts]);

  // Check network status
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network is back online, attempting session refresh");
      setNetworkError(false);
      
      // Only attempt to refresh if we were previously offline
      if (!lastNetworkStatus.current && !reconnectionAttempted.current) {
        reconnectionAttempted.current = true;
        refreshAttemptCount.current = 0; // Reset attempt counter
        
        toast.info("Connection restored. Attempting to refresh your session...", {
          duration: 5000,
        });
        
        refreshTimeoutRef.current = setTimeout(() => {
          handleRefreshSession(true);
          // Reset the reconnection flag after some time
          setTimeout(() => {
            reconnectionAttempted.current = false;
          }, 10000); // 10 seconds cooldown
        }, 1000); // Small delay to ensure network is stable
      }
      
      lastNetworkStatus.current = true;
    };
    
    const handleOffline = () => {
      console.log("Network is offline");
      setNetworkError(true);
      lastNetworkStatus.current = false;
      
      toast.error("You are currently offline. Some features may be unavailable.", {
        duration: 0, // Keep until dismissed
        id: "network-offline",
      });
    };
    
    // Initialize network status
    setNetworkError(!navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearRefreshTimeout();
    };
  }, [handleRefreshSession, clearRefreshTimeout]);

  useEffect(() => {
    // If we're not authenticated but have both tokens in localStorage, try to refresh
    const hasLocalSession = localStorage.getItem('authToken') !== null && localStorage.getItem('refreshToken') !== null;
    
    if (!user && !loading && hasLocalSession && !refreshAttempted && !isRefreshing) {
      console.log("Found local session tokens, attempting to refresh", { hasLocalSession });
      // Add a small delay to prevent immediate refresh on component mount
      refreshTimeoutRef.current = setTimeout(() => {
        handleRefreshSession();
      }, 500);
    }
  }, [user, loading, refreshAttempted, isRefreshing, handleRefreshSession]);

  // Display auth errors coming from the useAuth hook
  useEffect(() => {
    if (authError && !refreshError) {
      setRefreshError(authError);
    }
  }, [authError, refreshError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRefreshTimeout();
    };
  }, [clearRefreshTimeout]);

  // Improved loading state with progress indication
  if (loading || isRefreshing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[1000]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-600"></div>
          <div>
            <p className="text-lg font-medium">
              {isRefreshing ? "Refreshing your session..." : "Loading your dashboard..."}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {user ? "Retrieving your profile data..." : "Checking authentication..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (networkError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-md p-6">
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Network Error</AlertTitle>
            <AlertDescription>
              You're currently offline. Please check your internet connection and try again.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (refreshError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-md p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {refreshError}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleRefreshSession()} 
              disabled={isRefreshing || refreshAttemptCount.current >= maxRefreshAttempts}
              className="flex-1"
            >
              {isRefreshing ? "Refreshing..." : "Retry Authentication"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/auth';
              }} 
              className="flex-1"
            >
              Sign In Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check both authentication and profile data
  if (!user) {
    // Redirect to login page with return URL
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  
  // Wait for profile data to load
  if (!profile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[1000]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-600"></div>
          <div>
            <p className="text-lg font-medium">Loading your profile data...</p>
            <p className="text-sm text-muted-foreground mt-1">
              This will only take a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
