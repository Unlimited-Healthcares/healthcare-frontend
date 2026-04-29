import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { apiClient } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';
import { User, UserProfile, ProfileCompletion, UserPreferences, EmergencyContact } from '@/types/auth';
import { Preferences } from '@capacitor/preferences';

interface Profile {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  display_id?: string;
  center_id?: string;
  is_fallback?: boolean;
  [key: string]: unknown;
}


type AuthContextType = {
  session: any | null;
  user: User | null;
  profile: Profile | null;
  userProfile: UserProfile | null;
  profileCompletion: ProfileCompletion;
  userPreferences: UserPreferences;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, userData?: object) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshProfile: (userId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  // Profile management methods
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  fetchProfileCompletion: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  updateEmergencyContact: (id: string, contact: Partial<EmergencyContact>) => Promise<void>;
  removeEmergencyContact: () => Promise<void>;
  clearProfileError: () => void;
  profileError: string | null;
  resendVerification: (email: string, channel?: 'email' | 'sms' | 'whatsapp') => Promise<void>;
  verifyAccount: (code: string) => Promise<void>;
  submitKyc: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  showCheckEmail: string | null;
  setShowCheckEmail: (email: string | null) => void;
  isTwoFactorRequired: boolean;
  completeTwoFactor: (code: string) => Promise<void>;
  cancelTwoFactor: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>({
    percentage: 0,
    missingFields: [],
    completedSections: [],
    requiredFields: [],
    optionalFields: []
  });
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    notifications: true,
    emailUpdates: true,
    smsUpdates: true,
    pushNotifications: true,
    language: 'en',
    timezone: 'UTC'
  });
  const [loading, setLoading] = useState(() => {
    // Faster initialization: if no token exists, we are definitely not logged in
    return !!localStorage.getItem('authToken');
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [refreshInProgress, setRefreshInProgress] = useState(false);
  const isMountedRef = useRef<boolean>(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // 2FA state
  const [isTwoFactorRequired, setIsTwoFactorRequired] = useState(false);
  const [pendingAuthData, setPendingAuthData] = useState<any>(null);

  const clearAuthError = () => setAuthError(null);
  const clearProfileError = () => setProfileError(null);

  // Profile management methods
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) {
      // console.log('🔍 fetchUserProfile: No user ID available, skipping');
      return;
    }

    try {
      // console.log('🔍 fetchUserProfile: Starting to fetch detailed profile for user:', user.id);
      setProfileLoading(true);
      setProfileError(null);

      // Get the detailed user and profile
      const response = await apiClient.get<any>('/auth/me');
      const userWithProfile = response.data;
      const profileData = userWithProfile?.profile;

      if (isMountedRef.current && userWithProfile) {
        setUserProfile(profileData || null);
        setProfile(userWithProfile as unknown as Profile);
        localStorage.setItem('authProfile', JSON.stringify(userWithProfile));

        // Update the basic profile with more detailed information if available
        if (profileData && profileData.firstName && profileData.lastName) {
          const updatedProfile: Profile = {
            ...(profile || userWithProfile || {}),
            name: `${profileData.firstName} ${profileData.lastName}`.trim(),
            is_fallback: false
          };
          setProfile(updatedProfile);
        }
      }
    } catch (error) {
      // console.error('🔍 fetchUserProfile: Error fetching profile:', error);
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : 'Failed to fetch profile';
        setProfileError(message);
        toast.error(message);
      }
    } finally {
      if (isMountedRef.current) {
        setProfileLoading(false);
      }
    }
  }, [user?.id, profile]);

  const updateUserProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!user?.id) return;

    try {
      setProfileLoading(true);
      setProfileError(null);

      const userId = user.id;

      // Then update using the correct endpoint
      const response = await apiClient.post<UserProfile>(`/users/profile`, profileData);
      if (isMountedRef.current) {
        // The database is the source of truth. After a successful POST, 
        // we re-fetch the user profile to ensure all local states (user, profile, userProfile)
        // are perfectly synchronized with the server.
        await fetchUserProfile();
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : 'Failed to update profile';
        setProfileError(message);
        toast.error(message);
      }
    } finally {
      if (isMountedRef.current) {
        setProfileLoading(false);
      }
    }
  }, [user?.id, userProfile]);

  const fetchProfileCompletion = useCallback(async () => {
    if (!user?.id) return;

    try {
      setProfileLoading(true);
      setProfileError(null);

      const response = await apiClient.get<any>('/auth/me');
      const user = response.data;
      const profileData = user?.profile;

      // Calculate completion percentage based on profile data
      // Fields are: firstName, lastName, email, phone, dateOfBirth, gender, address
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'address'];

      if (!profileData) {
        setProfileCompletion({
          percentage: 0,
          missingFields: requiredFields,
          completedSections: [],
          requiredFields,
          optionalFields: ['avatar', 'bio', 'emergencyContacts', 'insurance', 'medicalHistory']
        });
        return;
      }

      const completedFields = requiredFields.filter(field => {
        if (field === 'email') return user.email;
        if (field === 'address') {
          return profileData.address &&
            profileData.address.street &&
            profileData.address.city &&
            profileData.address.state &&
            profileData.address.zipCode;
        }
        return profileData[field];
      });

      const percentage = Math.round((completedFields.length / requiredFields.length) * 100);

      const completion: ProfileCompletion = {
        percentage,
        missingFields: requiredFields.filter(field => !completedFields.includes(field)),
        completedSections: completedFields,
        requiredFields,
        optionalFields: ['avatar', 'bio', 'emergencyContacts', 'insurance', 'medicalHistory']
      };

      if (isMountedRef.current) {
        setProfileCompletion(completion);
      }
    } catch (error) {
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : 'Failed to fetch profile completion';
        setProfileError(message);
        toast.error(message);
      }
    } finally {
      if (isMountedRef.current) {
        setProfileLoading(false);
      }
    }
  }, [user?.id]);

  const updateUserPreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    if (!user?.id) return;

    try {
      setProfileLoading(true);
      setProfileError(null);

      const userId = user.id;

      // Update preferences as part of the profile for the current authenticated user
      const response = await apiClient.post<UserProfile>(`/users/profile`, { preferences });

      if (isMountedRef.current) {
        const newPreferences = response.preferences || preferences;
        setUserPreferences(prev => ({ ...prev, ...newPreferences }));
        toast.success('Preferences updated successfully');
      }
    } catch (error) {
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : 'Failed to update preferences';
        setProfileError(message);
        toast.error(message);
      }
    } finally {
      if (isMountedRef.current) {
        setProfileLoading(false);
      }
    }
  }, [user?.id]);

  const addEmergencyContact = useCallback(async (contact: Omit<EmergencyContact, 'id'>) => {
    if (!user?.id) return;

    try {
      setProfileLoading(true);
      setProfileError(null);

      const userId = user.id;

      // Add emergency contact as part of the profile for the current authenticated user
      const response = await apiClient.post<UserProfile>(`/users/profile`, {
        emergencyContacts: [contact]
      });

      if (isMountedRef.current) {
        setUserProfile(response);
        toast.success('Emergency contact added successfully');
      }
    } catch (error) {
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : 'Failed to add emergency contact';
        setProfileError(message);
        toast.error(message);
      }
    } finally {
      if (isMountedRef.current) {
        setProfileLoading(false);
      }
    }
  }, [user?.id]);

  const updateEmergencyContact = useCallback(async (id: string, contact: Partial<EmergencyContact>) => {
    if (!user?.id) return;

    try {
      setProfileLoading(true);
      setProfileError(null);

      const userId = user.id;

      // Update emergency contact as part of the profile for the current authenticated user
      const response = await apiClient.post<UserProfile>(`/users/profile`, {
        emergencyContacts: [{ id, ...contact }]
      });

      if (isMountedRef.current) {
        setUserProfile(response);
        toast.success('Emergency contact updated successfully');
      }
    } catch (error) {
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : 'Failed to update emergency contact';
        setProfileError(message);
        toast.error(message);
      }
    } finally {
      if (isMountedRef.current) {
        setProfileLoading(false);
      }
    }
  }, [user?.id]);

  const removeEmergencyContact = useCallback(async () => {
    if (!user?.id) return;

    try {
      setProfileLoading(true);
      setProfileError(null);

      const userId = user.id;

      // Remove emergency contact as part of the profile for the current authenticated user
      await apiClient.post<UserProfile>(`/users/profile`, {
        emergencyContacts: [] // Clear all emergency contacts for now
      });

      if (isMountedRef.current) {
        toast.success('Emergency contact removed successfully');
      }
    } catch (error) {
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : 'Failed to remove emergency contact';
        setProfileError(message);
        toast.error(message);
      }
    } finally {
      if (isMountedRef.current) {
        setProfileLoading(false);
      }
    }
  }, [user?.id]);

  // Clear any existing refresh timeout
  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Session refresh function using the correct endpoint
  const refreshSession = useCallback(async () => {
    if (refreshInProgress || !isMountedRef.current) {
      // console.log('🔐 Refresh already in progress or component unmounted, skipping');
      return;
    }

    try {
      // console.log('🔐 Starting session refresh...');
      setRefreshInProgress(true);

      // Check if we have a stored refresh token in either storage
      const storedRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      const activeStorage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
      
      if (!storedRefreshToken) {
        // console.log('🔐 No refresh token found, cannot refresh session');
        return;
      }

      // Use the refresh token directly in the request
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedRefreshToken}`
        }
      });

      if (!response.ok) {
        // console.error('🔐 Refresh request failed:', response.status, response.statusText);
        throw new Error(`Refresh failed: ${response.statusText}`);
      }

      const responseData = await response.json();
      const { data, error } = responseData;

      if (error) {
        // console.error("Session refresh failed:", error);
        throw error;
      }

      if (data && isMountedRef.current) {
        // console.log('🔐 Refresh successful, updating tokens and user data');

        // Update the stored tokens with the new ones in the active storage
        if (data.access_token) {
          activeStorage.setItem('authToken', data.access_token);
          apiClient.setAuthToken(data.access_token);
        }
        if (data.refresh_token) {
          activeStorage.setItem('refreshToken', data.refresh_token);
        }

        // Update session state
        setSession({
          token: data.access_token,
          refreshToken: data.refresh_token
        });

        // Update user and profile
        if (data.user) {
          // console.log('🧭 Navbar Source: refresh data.user:', data.user);
          setUser(data.user);
          activeStorage.setItem('authUser', JSON.stringify(data.user));
        }
        if (data.profile) {
          // console.log('🧭 Navbar Source: refresh data.profile:', data.profile);
          setProfile(data.profile);
          activeStorage.setItem('authProfile', JSON.stringify(data.profile));
        }

        // Clear any auth errors
        setAuthError(null);
      }
    } catch (error) {
      // console.error("Failed to refresh session:", error);
      if (isMountedRef.current) {
        // console.log('🔐 Refresh failed, clearing auth state');
        setAuthError("Session expired. Please log in again.");
        setSession(null);
        setUser(null);
        setProfile(null);
        // Clear invalid tokens from both
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('authProfile');
        
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem('authProfile');
        
        apiClient.clearAuthToken();
      }
      throw error;
    } finally {
      if (isMountedRef.current) {
        // console.log('🔐 Refresh process complete');
        setRefreshInProgress(false);
        setLoading(false);
      }
    }
  }, [refreshInProgress]);

  // Handle network events
  useEffect(() => {
    const handleNetworkChange = () => {
      const isOnline = navigator.onLine;

      if (isOnline && user && !profile && isMountedRef.current && !refreshInProgress) {
        // We're back online but might have stale profile state
        refreshTimeoutRef.current = setTimeout(() => {
          refreshSession();
        }, 1000);
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      clearRefreshTimeout();
    };
  }, [user, profile, refreshSession, refreshInProgress, clearRefreshTimeout]);

  // Initialize auth - this should only run once
  useEffect(() => {
    isMountedRef.current = true;

    // No explicit timeout - let the backend initialization complete naturally
    // Since tokens are 100y, we expect success virtually always
    // If the server is down, natural fetch errors will handle it.

    // Check for stored token and get user profile
    const initializeAuth = async () => {
      try {
        // Check if we have stored tokens in either storage
        const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const storedRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

        // Case 1: We have an access token – try to authenticate immediately
        if (storedToken) {
          // console.log('🔐 Initializing auth with stored access token');
          apiClient.setAuthToken(storedToken);

          try {
            const response = await apiClient.get<any>('/auth/me');
            // console.log('🔐 /auth/me response:', response);

            // If API wraps data, unwrap; otherwise use raw
            // If API wraps data, unwrap; otherwise use raw
            const meBody = (response && response.data) ? response.data : response;
            const userData = meBody?.data ?? meBody;

            if (userData?.error) {
              // console.error('🔐 /auth/me returned error, attempting refresh if possible:', userData.error);
              if (storedRefreshToken) {
                await refreshSession();
                return;
              }
              // No refresh token available; clear state
              if (isMountedRef.current) {
                setAuthError('Session expired. Please log in again.');
                localStorage.removeItem('authToken');
                apiClient.clearAuthToken();
              }
            } else if (userData && isMountedRef.current) {
              const resolvedUser = (userData && userData.user) ? userData.user : userData;
              const resolvedProfile = (userData && userData.profile) ? userData.profile : (userData?.id ? (userData as any).profile : null);
              const resolvedRoles = Array.isArray((resolvedUser as any)?.roles)
                ? (resolvedUser as any).roles
                : ((resolvedUser as any)?.role ? [((resolvedUser as any).role as any)] : []);

              // console.log('🧭 Navbar Source: /auth/me resolvedUser:', resolvedUser);
              // console.log('🧭 Navbar Source: /auth/me resolvedProfile:', resolvedProfile);
              // console.log('🧭 Navbar Source: /auth/me resolvedRoles:', resolvedRoles);

              // Single source of truth: set the user as returned by the backend without local defaults
              setUser({ ...(resolvedUser as any), roles: resolvedRoles } as any);
              // Prefer backend profile if provided; otherwise keep existing or null
              setProfile((resolvedProfile as any) ?? (resolvedUser as any));
              setSession({ token: storedToken, refreshToken: storedRefreshToken || null });
            }
          } catch (profileError) {
            // console.error('🔐 Error getting user profile with stored token:', profileError);
            // If profile fetch fails, try to refresh once if we have refresh token
            if (storedRefreshToken) {
              // console.log('🔐 Attempting token refresh after /auth/me failure...');
              try {
                await refreshSession();
                // console.log('🔐 Token refresh successful after profile error');
                return;
              } catch (refreshError) {
                // console.error('🔐 Token refresh failed:', refreshError);
                if (isMountedRef.current) {
                  setAuthError('Session expired. Please log in again.');
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('refreshToken');
                  apiClient.clearAuthToken();
                }
              }
            }
          }
          // Case 2: No access token but we have a refresh token – try to refresh session
        } else if (storedRefreshToken) {
          // console.log('🔐 No access token found, attempting refresh with stored refresh token');
          try {
            await refreshSession();
            // console.log('🔐 Refresh with stored refresh token succeeded');
            return;
          } catch (error) {
            // console.error('🔐 Refresh with stored refresh token failed:', error);
            if (isMountedRef.current) {
              setAuthError('Session expired. Please log in again.');
              localStorage.removeItem('refreshToken');
              apiClient.clearAuthToken();
            }
          }
        } else {
          // console.log('🔐 No stored tokens found');
        }
      } catch (error) {
        // console.error("Error initializing auth:", error);
        if (isMountedRef.current) {
          setAuthError("Failed to initialize authentication");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMountedRef.current = false;
      clearRefreshTimeout();
    };
  }, [clearRefreshTimeout]);

  // Fetch user profile and completion when user is authenticated
  useEffect(() => {
    if (user?.id && !!user) {
      // console.log('🔍 useEffect: User authenticated, profile already set from login response');
      // Don't fetch profile immediately - we already have basic profile data from login
      // Only fetch detailed profile when explicitly needed (e.g., user profile page)
    }
  }, [user?.id, user]);

  const refreshProfile = useCallback(async (userId: string) => {
    if (!userId || !isMountedRef.current) return;

    try {
      await refreshSession();
    } catch (error) {
      // console.error('Error refreshing profile:', error);
    }
  }, [refreshSession]);

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    try {
      setLoading(true);
      setAuthError(null);
      // console.log('🔐 Starting sign in process for:', email);

      const response = await apiClient.login(email, password) as import('@/types/auth').AuthResponse | import('@/types/auth').ApiResponse<import('@/types/auth').AuthResponse>;

      // console.log('🔐 Login response received');

      // Support both wrapped and unwrapped API responses
      const payload = (response && (response as any).data) ? (response as any).data : response as any;

      if (payload?.access_token) {
        // Check if 2FA is enabled in preferences
        const is2FAEnabled = await Preferences.get({ key: '2fa_enabled' });

        if (is2FAEnabled.value === 'true') {
          setPendingAuthData(payload);
          setIsTwoFactorRequired(true);
          setLoading(false);
          return;
        }

        storage.setItem('authToken', payload.access_token);
        if (payload.refresh_token) {
          storage.setItem('refreshToken', payload.refresh_token);
        }
        apiClient.setAuthToken(payload.access_token);

        // Set the session state immediately
        setSession({
          token: payload.access_token,
          refreshToken: payload.refresh_token
        });

        // console.log('🧭 Navbar Source: login payload.user:', payload.user);
        // console.log('🧭 Navbar Source: login payload.profile:', payload.profile);

        setUser(payload.user || null);
        setProfile(payload.profile || null);

        if (payload.user) storage.setItem('authUser', JSON.stringify(payload.user));
        if (payload.profile) storage.setItem('authProfile', JSON.stringify(payload.profile));

        // Login response does not include full profile; fetch /auth/me so profile completion gate has correct data
        let hasProfileFromMe = false;
        try {
          const meResponse = await apiClient.get<any>('/auth/me');
          const meBody = (meResponse && (meResponse as any).data) ? (meResponse as any).data : meResponse;
          const mePayload = meBody?.data ?? meBody;
          if (mePayload && isMountedRef.current) {
            const fullUser = mePayload.user ?? mePayload;
            const fullProfile = fullUser?.profile ?? mePayload.profile ?? null;
            hasProfileFromMe = !!fullProfile;
            const roles = Array.isArray(fullUser?.roles) ? fullUser.roles : (fullUser?.role ? [fullUser.role] : []);
            setUser({ ...(fullUser as any), roles } as any);
            setProfile((fullProfile as Profile) || null);
            if (fullUser) storage.setItem('authUser', JSON.stringify({ ...fullUser, roles }));
            if (fullProfile) storage.setItem('authProfile', JSON.stringify(fullProfile));
          }
        } catch (_) {
          // Non-fatal: keep login state; profile gate may redirect to /profile until /auth/me is loaded elsewhere
        }

        // If no profile from login or /auth/me, create a basic profile from user data
        if (!hasProfileFromMe && !payload.profile && payload.user) {
          // console.log('🔐 No profile in response, creating basic profile from user data');

          // Extract a better name from email if name is not available
          let userName = payload.user.name;
          if (!userName && payload.user.email) {
            const emailPrefix = payload.user.email.split('@')[0];
            userName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          }

          const basicProfile: Profile = {
            id: payload.user.id,
            email: payload.user.email,
            name: userName || 'User',
            role: payload.user.roles?.[0],
            display_id: payload.user.displayId || payload.user.id, // Use displayId from user object
            center_id: undefined,
            is_fallback: true
          };
          // console.log('🔐 Setting fallback profile:', basicProfile);
          setProfile(basicProfile);
          storage.setItem('authProfile', JSON.stringify(basicProfile));
        }

        // console.log('🧭 Navbar Source: after login setUser:', payload.user);
        // console.log('🧭 Navbar Source: after login setProfile:', payload.profile || 'Using fallback');

        toast.success('Successfully signed in!');

        // Get the return path from sessionStorage if available
        const returnPath = sessionStorage.getItem('returnPath') || '/dashboard';
        navigate(returnPath);
      } else {
        setAuthError("Failed to sign in. Please try again.");
        toast.error('Failed to sign in. Please try again.');
      }
    } catch (error) {
      // console.error('Sign in error:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      setAuthError(message);
      toast.error(message);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const signUp = async (email: string, password: string, userData?: object) => {
    try {
      setLoading(true);
      setAuthError(null);
      // Register without auto-login session to force verification
      const response = await apiClient.register({ email, password, ...userData });

      const payload = (response && (response as any).data) ? (response as any).data : response as any;
      // Return success but don't show the check-email overlay anymore
      // The RegisterForm will now transition to the choice page
      toast.success(payload.message || 'Account created successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setAuthError(message);
      toast.error(message);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Attempt to notify server, but don't fail if it's already unauthorized or network issue
      await apiClient.logout().catch(err => {
        console.warn('Server-side sign out failed:', err);
      });

      // Always clear local and session state regardless of API success
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('authProfile');
      
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('authUser');
      sessionStorage.removeItem('authProfile');
      
      apiClient.clearAuthToken();

      setUser(null);
      setProfile(null);
      setUserProfile(null);
      setProfileCompletion({
        percentage: 0,
        missingFields: [],
        completedSections: [],
        requiredFields: [],
        optionalFields: []
      });
      setUserPreferences({
        notifications: true,
        emailUpdates: true,
        smsUpdates: true,
        pushNotifications: true,
        language: 'en',
        timezone: 'UTC'
      });

      // Reset UI state
      if (isMountedRef.current) {
        setLoading(false);
      }

      // Force navigation to home AND reload to ensure clean state if slacking persists
      window.location.href = '/';
      toast.success('Successfully signed out');
    } catch (error) {
      // Emergency fallback
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const resendVerification = async (email: string, channel: 'email' | 'sms' | 'whatsapp' = 'email') => {
    setLoading(true);
    try {
      const response = await apiClient.resendVerification(email, channel) as { message: string };
      toast.success(response.message || `Verification code sent via ${channel}!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to send verification code via ${channel}.`;
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // State to control CheckEmail screen
  const [showCheckEmail, setShowCheckEmail] = useState<string | null>(null);

  const verifyAccount = async (code: string) => {
    setLoading(true);
    try {
      const response = await apiClient.verifyAccount(code) as {
        message: string;
        access_token?: string;
        refresh_token?: string;
        user?: User;
        profile?: Profile | null;
      };

      if (response.access_token && response.user) {
        localStorage.setItem('authToken', response.access_token);
        apiClient.setAuthToken(response.access_token);

        if (response.refresh_token) {
          localStorage.setItem('refreshToken', response.refresh_token);
        }

        setSession({
          token: response.access_token,
          refreshToken: response.refresh_token || null,
        });
        setUser(response.user);
        setProfile((response.profile as Profile) || null);

        localStorage.setItem('authUser', JSON.stringify(response.user));
        if (response.profile) {
          localStorage.setItem('authProfile', JSON.stringify(response.profile));
        } else {
          localStorage.removeItem('authProfile');
        }

        // One-time flag to route verified users from profile completion to dashboard.
        sessionStorage.setItem('postVerifyOnboarding', 'true');
        toast.success(response.message || 'Account verified successfully!');
        toast.info('Welcome! Please complete your profile to get started.');
        setShowCheckEmail(null);
        navigate('/profile');
        return;
      }

      toast.success(response.message || 'Account verified! You can now log in.');
      setShowCheckEmail(null);
      // Redirect to login tab after successful verification
      navigate('/auth?tab=login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed.';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const submitKyc = async (data: any) => {
    setLoading(true);
    try {
      const response = await apiClient.submitKyc(data) as { data: User };
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      toast.success('KYC submitted for approval!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'KYC submission failed.';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      await apiClient.forgotPassword(email);
      toast.success('If an account exists, a reset link has been sent.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset link.';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    try {
      const response = await apiClient.resetPassword(token, newPassword) as { message: string };
      toast.success(response.message || 'Password reset successfully!');
      // Navigate to login after successful reset
      navigate('/auth?tab=login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password.';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeTwoFactor = async (code: string) => {
    setLoading(true);
    try {
      // Simulate backend verification
      if (code !== '123456') {
        throw new Error('Invalid verification code. Please use 123456 for testing.');
      }

      if (!pendingAuthData) throw new Error('No pending authentication data found.');

      const payload = pendingAuthData;

      localStorage.setItem('authToken', payload.access_token);
      if (payload.refresh_token) {
        localStorage.setItem('refreshToken', payload.refresh_token);
      }
      apiClient.setAuthToken(payload.access_token);

      setSession({
        token: payload.access_token,
        refreshToken: payload.refresh_token
      });

      setUser(payload.user || null);
      setProfile(payload.profile || null);

      if (payload.user) localStorage.setItem('authUser', JSON.stringify(payload.user));
      if (payload.profile) localStorage.setItem('authProfile', JSON.stringify(payload.profile));

      toast.success('Identity verified safely!');
      setIsTwoFactorRequired(false);
      setPendingAuthData(null);

      const returnPath = sessionStorage.getItem('returnPath') || '/dashboard';
      navigate(returnPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : '2FA verification failed.';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelTwoFactor = () => {
    setIsTwoFactorRequired(false);
    setPendingAuthData(null);
    setLoading(false);
    clearAuthError();
  };

  const value = {
    session,
    user,
    profile,
    userProfile,
    profileCompletion,
    userPreferences,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    refreshProfile,
    refreshSession,
    authError,
    clearAuthError,
    // Profile management methods
    fetchUserProfile,
    updateUserProfile,
    fetchProfileCompletion,
    updateUserPreferences,
    addEmergencyContact,
    updateEmergencyContact,
    removeEmergencyContact,
    clearProfileError,
    profileError,
    showCheckEmail,
    setShowCheckEmail,
    resendVerification,
    verifyAccount,
    submitKyc,
    refreshUser: refreshSession,
    forgotPassword,
    resetPassword,
    isTwoFactorRequired,
    completeTwoFactor,
    cancelTwoFactor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
