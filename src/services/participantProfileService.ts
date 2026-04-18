import { apiClient } from '@/lib/api-client';
import { discoveryService } from './discoveryService';

export interface ParticipantProfile {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  role?: string;
}

export class ParticipantProfileService {
  private profileCache = new Map<string, ParticipantProfile>();

  /**
   * Get participant profile by user ID
   */
  async getParticipantProfile(userId: string): Promise<ParticipantProfile | null> {
    try {
      // Check cache first
      if (this.profileCache.has(userId)) {
        return this.profileCache.get(userId)!;
      }

      console.log('🔍 Fetching participant profile for:', userId);

      // Try to get user profile using discovery service
      try {
        const userProfile = await discoveryService.getUserProfile(userId);
        
        const profile: ParticipantProfile = {
          id: userId,
          name: userProfile.profile?.displayName || 
                `${userProfile.profile?.firstName || ''} ${userProfile.profile?.lastName || ''}`.trim() ||
                'Unknown User',
          avatar: userProfile.profile?.avatar,
          email: userProfile.email,
          role: userProfile.roles?.[0] || 'user'
        };

        // Cache the result
        this.profileCache.set(userId, profile);
        return profile;
      } catch (error) {
        console.warn('⚠️ Failed to fetch user profile via discovery service:', error);
      }

      // Fallback: try direct API call
      try {
        const response = await apiClient.get(`/users/${userId}`);
        const userData: any = (response as any).data || response;
        
        const profile: ParticipantProfile = {
          id: userId,
          name: userData.profile?.displayName || 
                `${userData.profile?.firstName || ''} ${userData.profile?.lastName || ''}`.trim() ||
                userData.name ||
                'Unknown User',
          avatar: userData.profile?.avatar || userData.avatar,
          email: userData.email,
          role: userData.roles?.[0] || 'user'
        };

        // Cache the result
        this.profileCache.set(userId, profile);
        return profile;
      } catch (error) {
        console.warn('⚠️ Failed to fetch user profile via direct API:', error);
      }

      // Final fallback: return minimal profile
      const fallbackProfile: ParticipantProfile = {
        id: userId,
        name: 'Unknown User',
        avatar: undefined,
        email: undefined,
        role: 'user'
      };

      this.profileCache.set(userId, fallbackProfile);
      return fallbackProfile;
    } catch (error) {
      console.error('❌ Error fetching participant profile:', error);
      return null;
    }
  }

  /**
   * Get multiple participant profiles
   */
  async getParticipantProfiles(userIds: string[]): Promise<Map<string, ParticipantProfile>> {
    const profiles = new Map<string, ParticipantProfile>();
    
    // Process in parallel for better performance
    const profilePromises = userIds.map(async (userId) => {
      const profile = await this.getParticipantProfile(userId);
      if (profile) {
        profiles.set(userId, profile);
      }
    });

    await Promise.all(profilePromises);
    return profiles;
  }

  /**
   * Clear profile cache
   */
  clearCache(): void {
    this.profileCache.clear();
  }

  /**
   * Clear specific profile from cache
   */
  clearProfileCache(userId: string): void {
    this.profileCache.delete(userId);
  }
}

export const participantProfileService = new ParticipantProfileService();
