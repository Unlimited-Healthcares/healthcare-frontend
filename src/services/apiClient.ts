import { API_BASE_URL } from '@/config/api'
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { logger, generateCorrelationId } from '@/utils/logger'
import toast from 'react-hot-toast'
import { formatApiError } from '@/lib/error-formatter'
const API_TIMEOUT = 120000 // 120 seconds for large media uploads

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('access_token') || localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Structured logging for Invitations/Requests with correlation id
    const url = config.url || ''
    const isInvite = url.includes('/invitations')
    const isRequest = url.includes('/requests')
    if (isInvite || isRequest) {
      const correlationIdHeader = (config.headers as Record<string, unknown>)['X-Request-Id'] as string | undefined
      const correlationId = correlationIdHeader || generateCorrelationId()
        ; (config.headers as Record<string, unknown>)['X-Request-Id'] = correlationId

      // mask sensitive fields
      const data = (config as any).data
      const masked = data && typeof data === 'object' ? { ...data } : data
      if (masked && typeof masked === 'object' && 'email' in masked) {
        ; (masked as Record<string, unknown>).email = '***@***'
      }
      logger.info(isInvite ? 'INVITES:REQ' : 'REQUESTS:REQ', {
        method: config.method,
        url,
        correlationId,
        data: masked,
      })
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const url = response.config?.url || ''
    if (url.includes('/invitations') || url.includes('/requests')) {
      const correlationId = (response.config.headers as any)?.['X-Request-Id']
      logger.info(url.includes('/invitations') ? 'INVITES:RES' : 'REQUESTS:RES', {
        url,
        status: response.status,
        correlationId,
      })
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken && !originalRequest.url?.includes('/auth/refresh')) {
        try {
          // Use a fresh axios instance or fetch to avoid interceptor loops
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          })

          const newToken = response.data?.data?.access_token || response.data?.access_token
          const newRefreshToken = response.data?.data?.refresh_token || response.data?.refresh_token

          if (newToken) {
            localStorage.setItem('authToken', newToken)
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return apiClient(originalRequest)
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          // Fall through to logout logic
        }
      }

      // Only auto-logout for auth-related endpoints, or if refresh failed
      // User requested "the token should not even be expiring at all" 
      // so we handle it silently without forcing a page reload here.
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/')

      if (isAuthEndpoint || !refreshToken) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        console.error('🚫 Axios Auth session invalid, but not redirecting yet per user request.');
        return Promise.reject(error)
      }
    }

    // Invitation/Request specific error logging
    try {
      const url = originalRequest?.url || ''
      if (url.includes('/invitations') || url.includes('/requests')) {
        const correlationId = originalRequest?.headers?.['X-Request-Id']
        logger.error(url.includes('/invitations') ? 'INVITES:ERR' : 'REQUESTS:ERR', {
          url,
          correlationId,
          message: (error as any)?.message,
          status: error.response?.status,
          data: error.response?.data,
        })
      }
    } catch { }

    // Handle other errors - component level error handling preferred
    // Remove global toasts to prevent duplicate/technical debug alerts per user request.
    return Promise.reject(error)

    return Promise.reject(error)
  }
)

// API response wrapper
export const apiResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data
}

// API error wrapper
export const apiError = (error: AxiosError): string => {
  if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
    return (error.response.data as { message: string }).message
  }
  return error.message || 'An unexpected error occurred'
}

// Request wrapper with error handling
export const apiRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await requestFn()
    return apiResponse(response)
  } catch (error) {
    throw new Error(apiError(error as AxiosError))
  }
}

export default apiClient
