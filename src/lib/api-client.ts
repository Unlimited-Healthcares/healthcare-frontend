// ...existing code...
// New API client to replace Supabase
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = null;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private isRedirecting = false;
  private refreshPromise: Promise<string | null> | null = null;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      // console.log(`[API Client] Fetching: ${url}`, { method: options.method || 'GET' });
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Handle 401 Unauthorized - Attempt token refresh
        if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {

          if (!this.refreshPromise) {
            this.refreshPromise = (async () => {
              const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
              const activeStorage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
              
              if (!refreshToken) return null;

              try {
                const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshToken}`
                  }
                });

                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  const newToken = refreshData.data?.access_token || refreshData.access_token;
                  const newRefreshToken = refreshData.data?.refresh_token || refreshData.refresh_token;

                  if (newToken) {
                    this.setAuthToken(newToken);
                    activeStorage.setItem('authToken', newToken);
                    if (newRefreshToken) activeStorage.setItem('refreshToken', newRefreshToken);
                    return newToken;
                  }
                }
                return null;
              } catch (refreshErr) {
                console.error('🚨 Token refresh failed:', refreshErr);
                return null;
              } finally {
                this.refreshPromise = null;
              }
            })();
          }

          const newToken = await this.refreshPromise;
          if (newToken) {
            // Retry original request with new token
            return this.request<T>(endpoint, {
              ...options,
              headers: {
                ...headers,
                'Authorization': `Bearer ${newToken}`
              }
            });
          }
        }

        const rawErrorText = await response.text();
        let parsedError: any = null;
        try {
          parsedError = rawErrorText ? JSON.parse(rawErrorText) : null;
        } catch { }
        const errorMessage = parsedError?.message || response.statusText || 'Request failed';
        const err: any = new Error(errorMessage);
        err.status = response.status;
        err.statusCode = response.status;
        err.data = parsedError;
        console.error(`API Client: Request failed (${response.status}) for ${url}:`, errorMessage, parsedError || rawErrorText);

        // If it's a 401 and we couldn't refresh, just log it but don't force logout/redirect
        // as the user requested "the token should not even be expiring at all"
        if (response.status === 401 && !endpoint.includes('/auth/')) {
          console.error('🚫 Auth session is invalid, but not redirecting yet per user request.');
          // We still throw so the UI can handle it, but we don't force the page away
        }

        throw err;
      }

      const responseText = await response.text();
      // console.log('📄 Raw Response:', responseText);

      // Handle empty responses (common for DELETE operations)
      if (!responseText || responseText.trim() === '') {
        return null as T;
      }

      try {
        const parsedResponse = JSON.parse(responseText);
        // console.log('✅ Parsed Response:', parsedResponse);
        return parsedResponse;
      } catch (parseError) {
        console.error(`API Client: Failed to parse JSON response from ${url}:`, parseError);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error(`🚨 API Request Error for ${url}:`, error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('🛑 Network error or CORS block. Possible causes: Server is down, invalid URL, or CORS policy mismatch.');
      }
      throw error;
    }
  }

  // Helper to build query string
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => urlParams.append(key, String(v)));
        } else if (typeof value === 'object') {
          urlParams.append(key, JSON.stringify(value));
        } else {
          urlParams.append(key, String(value));
        }
      }
    });
    const queryString = urlParams.toString();
    return queryString ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}` : endpoint;
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, config: { params?: Record<string, any>, headers?: Record<string, string> } = {}): Promise<T> {
    return this.request<T>(this.buildUrl(endpoint, config.params), {
      method: 'GET',
      headers: config.headers
    });
  }

  async post<T>(endpoint: string, data?: any, config: { params?: Record<string, any>, headers?: Record<string, string> } = {}): Promise<T> {
    return this.request<T>(this.buildUrl(endpoint, config.params), {
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      headers: config.headers,
    });
  }

  async postFormData<T>(endpoint: string, formData: FormData, config: { params?: Record<string, any>, headers?: Record<string, string> } = {}): Promise<T> {
    return this.request<T>(this.buildUrl(endpoint, config.params), {
      method: 'POST',
      body: formData,
      headers: config.headers,
    });
  }

  async put<T>(endpoint: string, data?: any, config: { params?: Record<string, any>, headers?: Record<string, string> } = {}): Promise<T> {
    return this.request<T>(this.buildUrl(endpoint, config.params), {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: config.headers,
    });
  }

  async patch<T>(endpoint: string, data?: any, config: { params?: Record<string, any>, headers?: Record<string, string> } = {}): Promise<T> {
    return this.request<T>(this.buildUrl(endpoint, config.params), {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: config.headers,
    });
  }

  async delete<T>(endpoint: string, config: { params?: Record<string, any>, headers?: Record<string, string> } = {}): Promise<T> {
    return this.request<T>(this.buildUrl(endpoint, config.params), {
      method: 'DELETE',
      headers: config.headers
    });
  }

  // Center management methods
  async createCenter(centerData: any) {
    return this.post('/centers', centerData);
  }
  async resendVerification(email: string, channel: 'email' | 'sms' | 'whatsapp' = 'email') {
    return this.post('/auth/resend-verification', { email, channel });
  }

  async verifyAccount(token: string) {
    // Note:Backend uses /auth/verify-email and expects { token }
    return this.post('/auth/verify-email', { token });
  }

  async submitKyc(data: any) {
    return this.post('/users/me/kyc', data);
  }

  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.post('/auth/reset-password', { token, newPassword });
  }

  async uploadProfilePicture(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.postFormData<{ url: string }>('/uploads/profile-picture', formData);
  }

  async uploadIdentityDocument(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.postFormData<{ url: string }>('/uploads/identity-document', formData);
  }

  async uploadBusinessAsset(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.postFormData<{ url: string }>('/uploads/business-asset', formData);
  }

  /**
   * Stream AI chat responses token-by-token (like ChatGPT / Claude).
   * Calls onChunk for each word/token received, then onDone when finished.
   */
  async streamChat(
    sessionId: string,
    messageData: Record<string, unknown>,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError?: (err: string) => void,
  ): Promise<void> {
    const url = `${this.baseUrl}/ai/chat/sessions/${sessionId}/messages/stream`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(messageData),
      });
    } catch (error) {
      const networkMessage = error instanceof Error ? error.message : 'Unknown network error';
      const debugMessage =
        `Stream network error while calling ${url}: ${networkMessage}. ` +
        'Possible causes: CORS block, DNS/SSL issue, or backend unavailable.';
      console.error('❌ streamChat fetch failed:', { url, networkMessage, hasAuthToken: Boolean(this.token) });
      onError?.(debugMessage);
      return;
    }

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => '');
      let parsedMessage = '';
      try {
        const parsed = text ? JSON.parse(text) : null;
        parsedMessage =
          parsed?.message ||
          parsed?.error ||
          (Array.isArray(parsed?.message) ? parsed.message.join(', ') : '');
      } catch {
        parsedMessage = '';
      }

      const responseSnippet = (parsedMessage || text || 'No response body')
        .toString()
        .slice(0, 500);
      const debugMessage =
        `Stream request failed (${response.status} ${response.statusText}) at ${url}. ` +
        `Response: ${responseSnippet}`;

      console.error('❌ streamChat bad response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        hasBody: Boolean(response.body),
        responseText: text,
      });
      onError?.(debugMessage);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') { onDone(); return; }
        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) {
            const streamError =
              typeof parsed.error === 'string'
                ? parsed.error
                : JSON.stringify(parsed.error);
            onError?.(`Stream event error: ${streamError}`);
            return;
          }
          if (parsed.content) onChunk(parsed.content);
        } catch {
          console.warn('⚠️ streamChat malformed SSE payload:', payload);
        }
      }
    }
    onDone();
  }
}

import { API_BASE_URL } from '@/config/api';

// Create and export the main API client instance
const apiUrl = API_BASE_URL;
// console.log('🔧 API URL configured as:', apiUrl);
export const apiClient = new ApiClient(apiUrl);
