import apiClient from './apiClient'
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User
} from '@/types/auth'
import { API_BASE_URL } from '@/config/api'

export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    console.log('Attempting to register user with credentials:', credentials)
    console.log('Making POST request to:', '/auth/register')

    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', credentials)
      console.log('Registration successful, response:', response)
      return response.data
    } catch (error: any) {
      console.error('Registration API call failed:', error)
      console.error('Error response:', error?.response)
      console.error('Error response data:', error?.response?.data)
      throw error
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  // Refresh token - requires refresh_token in Authorization header
  // This is handled by useAuth.tsx refreshSession() which correctly passes the refresh token
  refreshToken: async (refreshToken: string): Promise<{ access_token: string; refresh_token?: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    })
    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.statusText}`)
    }
    return response.json()
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/logout')
    return response.data
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword })
    return response.data
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', { token })
    return response.data
  },

  // Resend verification
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/resend-verification', { email })
    return response.data
  }
}
