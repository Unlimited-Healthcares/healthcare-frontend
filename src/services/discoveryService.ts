import apiClient from './apiClient';
import {
  SearchParams,
  CenterSearchParams,
  UserSearchResponse,
  CenterSearchResponse,
  User,
  Center,
  Request,
  CreateRequestData,
  RequestResponse,
  Invitation,
  CreateInvitationData,
  AcceptInvitationData,
  InvitationResponse
} from '@/types/discovery';

class DiscoveryService {
  // Simple cache for resolved UUIDs to avoid repeated API calls
  private uuidCache = new Map<string, string>();

  // User Search - Updated to use correct API parameters
  async searchUsers(params: SearchParams): Promise<UserSearchResponse> {
    const queryString = new URLSearchParams();

    // Only include parameters that are supported by the backend SearchUsersDto
    const validParams = ['type', 'specialty', 'city', 'state', 'country', 'service', 'search', 'page', 'limit'];

    Object.entries(params).forEach(([key, value]) => {
      if (validParams.includes(key) && value !== undefined && value !== null && value !== '') {
        queryString.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/users/search?${queryString}`);

    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid API response: No data received');
    }

    if (!response.data.users) {
      throw new Error('Invalid API response: No users array found');
    }

    // Process users according to the new backend standard
    // Backend now ensures both id (UUID) and publicId are present
    const processedUsers = response.data.users.map((user: any) => {
      // Log the user data structure for debugging
      console.log('🔍 FULL User data from search:', JSON.stringify(user));
      console.log('🔍 User details:', {
        id: user.id,
        publicId: user.publicId,
        displayName: user.displayName,
        hasUuid: user.id && user.id.includes('-'),
        hasPublicId: !!user.publicId
      });

      // Backend should now provide both fields consistently
      // If not, we'll handle it gracefully
      if (!user.id && user.publicId) {
        console.warn('⚠️ User missing UUID, using publicId as fallback:', user.publicId);
        user.id = user.publicId;
      }

      if (!user.publicId && user.id) {
        console.warn('⚠️ User missing publicId, using id as fallback:', user.id);
        user.publicId = user.id;
      }

      // Ensure services are mapped to offeredServices if present
      if ((user.services || user.offered_services) && (!user.offeredServices || user.offeredServices.length === 0)) {
        user.offeredServices = user.services || user.offered_services;
      }

      return user;
    });

    return {
      ...response.data,
      users: processedUsers
    };
  }

  async getUserProfile(userId: string): Promise<User> {
    try {
      // Try the public profile endpoint first
      const response = await apiClient.get(`/users/${userId}/public-profile`);
      return response.data;
    } catch (error) {
      // Only log if it's not a 400/403 error (which are expected for some users)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const status = axiosError.response?.status;
        if (status !== 400 && status !== 403) {
          console.error('Failed to get user profile:', error);
        }
      } else {
        console.error('Failed to get user profile:', error);
      }

      // If public profile fails, try to get the user by ID directly
      try {
        const response = await apiClient.get(`/users/${userId}`);
        return response.data;
      } catch (secondError) {
        // Only log if it's not a 400/403 error
        if (secondError && typeof secondError === 'object' && 'response' in secondError) {
          const axiosError = secondError as any;
          const status = axiosError.response?.status;
          if (status !== 400 && status !== 403) {
            console.error('Failed to get user by ID:', secondError);
          }
        } else {
          console.error('Failed to get user by ID:', secondError);
        }

        // If both fail, throw an error instead of returning mock data
        throw new Error(`Unable to resolve user profile for ID: ${userId}`);
      }
    }
  }

  // Resolve user UUID from publicId using the new backend endpoint
  async resolveUserUuid(publicId: string): Promise<string> {
    // Check cache first
    if (this.uuidCache.has(publicId)) {
      const cachedUuid = this.uuidCache.get(publicId)!;
      console.log('✅ Using cached UUID:', { publicId, uuid: cachedUuid });
      return cachedUuid;
    }

    try {
      // Use the new dedicated resolver endpoint
      const response = await apiClient.get(`/users/resolve/${publicId}`);

      if (response.data && response.data.uuid && response.data.uuid.includes('-')) {
        // Cache the result
        this.uuidCache.set(publicId, response.data.uuid);
        console.log('✅ Resolved and cached UUID:', { publicId, uuid: response.data.uuid });
        return response.data.uuid;
      }

      throw new Error(`Invalid response from resolver endpoint for publicId: ${publicId}`);
    } catch (error) {
      console.error('Failed to resolve user UUID:', error);

      // Fallback: try to find in recent search results (cached)
      try {
        const searchResults = await this.searchUsers({
          type: 'doctor',
          page: 1,
          limit: 100
        });

        const user = searchResults.users.find(u =>
          u.publicId === publicId || u.id === publicId
        );

        if (user && user.id && user.id.includes('-')) {
          // Cache the result
          this.uuidCache.set(publicId, user.id);
          console.warn(`Using cached search result for publicId: ${publicId}`);
          return user.id;
        }
      } catch (searchError) {
        console.warn('Search fallback failed:', searchError);
      }

      // Last resort: return the publicId itself
      console.warn(`Could not resolve UUID for publicId: ${publicId}, using publicId as fallback`);
      return publicId;
    }
  }

  // Center Search - Updated to use correct API parameters
  async searchCenters(params: CenterSearchParams): Promise<CenterSearchResponse> {
    const queryString = new URLSearchParams();

    // Only include parameters that are supported by the backend
    const validParams = ['type', 'city', 'state', 'country', 'service', 'acceptingNewPatients', 'page', 'limit'];

    Object.entries(params).forEach(([key, value]) => {
      if (validParams.includes(key) && value !== undefined && value !== null && value !== '') {
        queryString.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/centers/search?${queryString}`);
    return response.data;
  }

  async getCenterDetails(centerId: string): Promise<Center> {
    const response = await apiClient.get(`/centers/${centerId}`);
    return response.data;
  }

  async getCenterProfile(centerId: string): Promise<Center> {
    try {
      // Centers do not have a public-profile endpoint; use details endpoint directly
      const response = await apiClient.get(`/centers/${centerId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get center profile for ID: ${centerId}`, error);
      throw new Error(`Unable to resolve center profile for ID: ${centerId}`);
    }
  }

  async getCenterStaff(centerId: string): Promise<User[]> {
    console.log('🔍 FETCHING CENTER STAFF:', {
      centerId,
      endpoint: `/centers/${centerId}/staff`,
      timestamp: new Date().toISOString()
    });

    const response = await apiClient.get(`/centers/${centerId}/staff`);

    console.log('🔍 CENTER STAFF API RAW RESPONSE:', {
      centerId,
      status: response.status,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : [],
      dataLength: Array.isArray(response.data) ? response.data.length : 'not an array',
      rawData: response.data
    });

    // Handle different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object' && 'staff' in response.data) {
      console.log('🔍 STAFF DATA NESTED IN RESPONSE:', response.data.staff);
      return response.data.staff || [];
    } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      console.log('🔍 STAFF DATA IN data FIELD:', response.data.data);
      return response.data.data || [];
    }

    console.warn('⚠️ UNEXPECTED RESPONSE STRUCTURE, RETURNING EMPTY ARRAY');
    return [];
  }

  async getCenterOwner(centerId: string): Promise<{ userId: string }> {
    const response = await apiClient.get(`/centers/${centerId}/owner`);
    return response.data;
  }

  async getNearbyCenters(lat: number, lng: number, radius: number = 25): Promise<Center[]> {
    const response = await apiClient.get(`/centers/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  }

  // Request Management
  async createRequest(requestData: CreateRequestData): Promise<Request> {
    // 🔍 DEBUG: Log request data before sending
    console.log('🔍 DISCOVERY SERVICE - Creating Request:', {
      timestamp: new Date().toISOString(),
      requestData,
      endpoint: '/requests',
      method: 'POST'
    });

    const response = await apiClient.post('/requests', requestData);

    // 🔍 DEBUG: Log successful response
    console.log('✅ DISCOVERY SERVICE - Request Created Successfully:', {
      response: response.data,
      status: response.status
    });

    return response.data;
  }

  async getReceivedRequests({ status, type, specialty, page = 1, limit = 20 }: { status?: string, type?: string, specialty?: string, page?: number, limit?: number } = {}): Promise<RequestResponse> {
    // 🔍 DEBUG: Log request parameters
    console.log('📥 FETCHING RECEIVED REQUESTS:', {
      timestamp: new Date().toISOString(),
      status,
      type,
      specialty,
      page,
      limit,
      expectedFor: 'Centers should see staff requests here'
    });

    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (status) {
      queryString.append('status', status);
    }

    if (type) {
      queryString.append('type', type);
    }

    if (specialty) {
      queryString.append('specialty', specialty);
    }

    if ((arguments[0] as any)?.paymentStatus) {
      queryString.append('paymentStatus', (arguments[0] as any).paymentStatus);
    }

    try {
      const response = await apiClient.get(`/requests/received?${queryString}`);

      // 🔍 DEBUG: Log received requests data
      console.log('📥 RECEIVED REQUESTS DATA:', {
        totalRequests: response.data?.requests?.length || 0,
        requests: response.data?.requests?.map((req: any) => ({
          id: req.id,
          type: req.requestType,
          sender: req.senderName,
          status: req.status,
          isStaffInvitation: req.requestType === 'staff_invitation',
          position: req.metadata?.position,
          message: req.message?.substring(0, 50) + '...'
        })) || [],
        pagination: {
          page: response.data?.page ?? 1,
          totalPages: response.data?.totalPages ?? Math.ceil((response.data?.total ?? 0) / (response.data?.limit ?? 20)) ?? 0,
          total: response.data?.total ?? (response.data?.requests?.length ?? 0)
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ FAILED TO FETCH RECEIVED REQUESTS:', {
        error,
        status,
        page,
        limit
      });
      throw error;
    }
  }

  async getSentRequests({ status, type, page = 1, limit = 20 }: { status?: string, type?: string, page?: number, limit?: number } = {}): Promise<RequestResponse> {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (status) {
      queryString.append('status', status);
    }

    if (type) {
      queryString.append('type', type);
    }

    if ((arguments[0] as any)?.paymentStatus) {
      queryString.append('paymentStatus', (arguments[0] as any).paymentStatus);
    }

    try {
      const response = await apiClient.get(`/requests/sent?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('❌ FAILED TO FETCH SENT REQUESTS:', {
        error,
        status,
        page,
        limit,
        url: `/requests/sent?${queryString}`,
        statusCode: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText
      });

      // If it's a 500 error, return empty response instead of throwing
      if ((error as any)?.response?.status === 500) {
        console.warn('⚠️ Sent requests endpoint returned 500, returning empty response');
        return {
          requests: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        };
      }

      throw error;
    }
  }

  async respondToRequest(requestId: string, action: 'approve' | 'reject', message?: string, metadata?: Record<string, any>): Promise<Request> {
    // 🔍 DEBUG: Log request response action
    console.log('🔄 RESPONDING TO REQUEST:', {
      timestamp: new Date().toISOString(),
      requestId,
      action,
      message,
      metadata,
      expectedOutcome: action === 'approve' ? 'Doctor should be added to center staff' : 'Request rejected'
    });

    try {
      const response = await apiClient.patch(`/requests/${requestId}/respond`, {
        action,
        message,
        metadata
      });

      // 🔍 DEBUG: Log successful response
      console.log('✅ REQUEST RESPONSE SUCCESSFUL:', {
        requestId,
        action,
        newStatus: response.data?.status,
        updatedAt: response.data?.updatedAt,
        nextSteps: action === 'approve'
          ? 'Doctor should now be added to center staff and can book appointments'
          : 'Request has been rejected'
      });

      return response.data;
    } catch (error) {
      console.error('❌ FAILED TO RESPOND TO REQUEST:', {
        requestId,
        action,
        error,
        message
      });
      throw error;
    }
  }

  async confirmRequest(requestId: string): Promise<Request> {
    const response = await apiClient.post(`/requests/${requestId}/confirm`);
    return response.data;
  }

  async declineResponse(requestId: string): Promise<Request> {
    const response = await apiClient.post(`/requests/${requestId}/decline`);
    return response.data;
  }

  async cancelRequest(requestId: string): Promise<void> {
    await apiClient.delete(`/requests/${requestId}`);
  }

  async verifyRequestPayment(requestId: string, status: 'paid' | 'verified' | 'failed', reference?: string): Promise<Request> {
    const response = await apiClient.post(`/requests/${requestId}/payment-status`, { status, reference });
    return response.data;
  }

  async getRequest(requestId: string): Promise<Request> {
    const response = await apiClient.get(`/requests/${requestId}`);
    return response.data;
  }

  // Invitation Management
  async sendInvitation(invitationData: CreateInvitationData): Promise<Invitation> {
    const response = await apiClient.post('/invitations', invitationData);
    return response.data;
  }

  async getPendingInvitations(email: string): Promise<InvitationResponse> {
    const response = await apiClient.get(`/invitations/pending?email=${email}`);
    return response.data;
  }

  async acceptInvitation(token: string, userData: AcceptInvitationData): Promise<User> {
    const response = await apiClient.post(`/invitations/${token}/accept`, userData);
    return response.data;
  }

  async declineInvitation(token: string, reason?: string): Promise<void> {
    await apiClient.post(`/invitations/${token}/decline`, { reason });
  }

  async getInvitation(token: string): Promise<Invitation> {
    const response = await apiClient.get(`/invitations/${token}`);
    return response.data;
  }

  // Connection Management
  async getConnections(page: number = 1, limit: number = 20): Promise<User[]> {
    const response = await apiClient.get(`/users/connections?page=${page}&limit=${limit}`);
    return response.data;
  }

  async removeConnection(userId: string): Promise<void> {
    await apiClient.delete(`/users/connections/${userId}`);
  }

  // Profile Enhancement
  async updateDiscoveryProfile(profileData: Partial<User>): Promise<User> {
    const response = await apiClient.patch('/users/profile/discovery', profileData);
    return response.data;
  }

  async updatePrivacySettings(privacySettings: any): Promise<void> {
    await apiClient.patch('/users/profile/privacy', privacySettings);
  }

  // Search Suggestions
  async getSearchSuggestions(query: string, type: 'users' | 'centers'): Promise<string[]> {
    const response = await apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}&type=${type}`);
    return response.data;
  }

  // Analytics
  async getSearchAnalytics(): Promise<any> {
    const response = await apiClient.get('/analytics/search');
    return response.data;
  }

  async getConnectionAnalytics(): Promise<any> {
    const response = await apiClient.get('/analytics/connections');
    return response.data;
  }

  // Update Request Status
  async updateRequestStatus(requestId: string, status: string): Promise<Request> {
    const response = await apiClient.patch(`/requests/${requestId}/status`, { status });
    return response.data;
  }
}

export const discoveryService = new DiscoveryService();
export default discoveryService;
