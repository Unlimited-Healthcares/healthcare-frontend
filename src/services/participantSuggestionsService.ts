import { approvedProvidersService } from './approvedProvidersService';
import { discoveryService } from './discoveryService';
import { healthcareCentersService } from './healthcareCentersService';

export interface ChatParticipantSuggestion {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  category?: 'patient' | 'doctor' | 'center' | 'staff';
}

export class ParticipantSuggestionsService {

  /**
   * Get role-based participant suggestions for chat creation
   */
  async getParticipantSuggestions(
    userRoles: string[],
    userId: string,
    profileId?: string,
    centerId?: string
  ): Promise<ChatParticipantSuggestion[]> {
    try {
      console.log('🔍 Fetching participant suggestions:', { userRoles, userId, profileId, centerId });

      const suggestions: ChatParticipantSuggestion[] = [];

      // For Patients
      if (userRoles.includes('patient') && profileId) {
        const patientSuggestions = await this.getPatientSuggestions(profileId);
        suggestions.push(...patientSuggestions);
      }

      // For Centers and Center Staff
      if ((userRoles.includes('center') || userRoles.includes('center_staff')) && centerId) {
        const centerSuggestions = await this.getCenterSuggestions(centerId);
        suggestions.push(...centerSuggestions);
      }

      // For Doctors
      if (userRoles.includes('doctor') && userId) {
        const doctorSuggestions = await this.getDoctorSuggestions(userId, centerId);
        suggestions.push(...doctorSuggestions);
      }

      console.log('✅ Fetched participant suggestions:', suggestions.length);
      return suggestions;
    } catch (error) {
      console.error('❌ Error fetching participant suggestions:', error);
      return [];
    }
  }

  /**
   * Get suggestions for patients (approved doctors and centers)
   */
  private async getPatientSuggestions(patientId: string): Promise<ChatParticipantSuggestion[]> {
    const suggestions: ChatParticipantSuggestion[] = [];

    // First try the approved providers endpoint
    try {
      const response = await approvedProvidersService.getApprovedProviders(patientId);
      console.log('🔍 Approved providers response:', response);

      // Process approved providers
      (response.providers || []).forEach(provider => {
        if (provider.providerType === 'doctor' && provider.provider) {
          const doctor = provider.provider;
          const suggestion: ChatParticipantSuggestion = {
            id: doctor.id,
            name: `${doctor.profile?.firstName || ''} ${doctor.profile?.lastName || ''}`.trim() || 'Unknown Doctor',
            email: doctor.email || '',
            avatar: doctor.profile?.avatar,
            role: 'doctor',
            category: 'doctor'
          };
          suggestions.push(suggestion);
        } else if (provider.providerType === 'center' && provider.center) {
          const center = provider.center;
          const suggestion: ChatParticipantSuggestion = {
            id: center.id,
            name: center.name || 'Healthcare Center',
            email: center.email || '',
            avatar: undefined,
            role: 'center',
            category: 'center'
          };
          suggestions.push(suggestion);
        }
      });
    } catch (error) {
      console.warn('⚠️ Approved providers endpoint failed:', error);
    }

    // Fallback: Get approved sent requests (this is where the actual data is)
    try {
      const requests = await discoveryService.getSentRequests({ status: 'approved', page: 1, limit: 100 });
      console.log('🔍 Sent requests response:', requests);

      (requests.requests || []).forEach(request => {
        const recipient = request.recipient;
        if (recipient && recipient.id) {
          console.log('🔍 Processing recipient:', {
            id: recipient.id,
            name: recipient.profile?.displayName,
            roles: (recipient as any).roles,
            requestType: request.requestType,
            metadata: request.metadata
          });

          let role = 'unknown';
          let category: 'patient' | 'doctor' | 'center' | 'staff' = 'patient';

          // Determine role based on recipient's roles array
          const recipientRoles = (recipient as any).roles;
          if (recipientRoles?.includes('doctor')) {
            role = 'doctor';
            category = 'doctor';
          } else if (recipientRoles?.includes('center')) {
            role = 'center';
            category = 'center';
          } else if (recipientRoles?.includes('center_staff')) {
            role = 'staff';
            category = 'staff';
          } else if (recipientRoles?.includes('patient')) {
            role = 'patient';
            category = 'patient';
          } else {
            // Fallback: try to determine from request type or metadata
            if (request.requestType === 'patient_request') {
              // This is a patient sending a request to a provider
              // The recipient should be doctor/center, not patient
              if (request.metadata?.recipientType === 'center_owner' || request.metadata?.centerId) {
                role = 'center';
                category = 'center';
              } else {
                role = 'doctor';
                category = 'doctor';
              }
            } else if (request.requestType === 'connection') {
              // Connection requests are usually doctor-to-doctor or patient-to-doctor
              role = 'doctor';
              category = 'doctor';
            } else {
              // Default fallback
              role = 'unknown';
              category = 'patient';
            }
          }

          console.log('✅ Resolved role:', { name: recipient.profile?.displayName, role, category });

          const suggestion: ChatParticipantSuggestion = {
            id: recipient.id,
            name: recipient.profile?.displayName || 'Unknown User',
            email: recipient.email || '',
            avatar: (recipient.profile as any)?.avatar || undefined,
            role,
            category
          };
          suggestions.push(suggestion);
        }
      });
    } catch (error) {
      console.warn('⚠️ Sent requests endpoint failed:', error);
    }

    // Remove duplicates based on ID
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.id === suggestion.id)
    );

    console.log('✅ Final patient suggestions:', uniqueSuggestions);
    return uniqueSuggestions;
  }

  /**
   * Get suggestions for centers (staff, patients, connected doctors)
   */
  private async getCenterSuggestions(centerId: string): Promise<ChatParticipantSuggestion[]> {
    try {
      const suggestions: ChatParticipantSuggestion[] = [];

      // Get center staff
      try {
        const staff = await healthcareCentersService.getCenterStaff(centerId);
        staff.forEach(member => {
          if (member.user) {
            const suggestion: ChatParticipantSuggestion = {
              id: member.user.id,
              name: member.user.profile?.displayName || 'Unknown Staff',
              email: member.user.email || '',
              avatar: (member.user.profile as any)?.avatar || undefined,
              role: member.role || 'staff',
              category: 'staff'
            };
            suggestions.push(suggestion);
          }
        });
      } catch (error) {
        console.warn('Failed to fetch center staff:', error);
      }

      // Get center patients via approved requests
      try {
        const requests = await discoveryService.getReceivedRequests({ status: 'approved', page: 1, limit: 100 });
        const patientRequests = (requests.requests || []).filter(request =>
          request.requestType === 'patient_request'
        );

        patientRequests.forEach(request => {
          const sender = request.sender;
          if (sender && sender.id) {
            const suggestion: ChatParticipantSuggestion = {
              id: sender.id,
              name: sender.profile?.displayName || 'Unknown Patient',
              email: sender.email || '',
              avatar: (sender.profile as any)?.avatar || undefined,
              role: 'patient',
              category: 'patient'
            };
            suggestions.push(suggestion);
          }
        });
      } catch (error) {
        console.warn('Failed to fetch center patients:', error);
      }

      return suggestions;
    } catch (error) {
      console.error('❌ Error fetching center suggestions:', error);
      return [];
    }
  }

  /**
   * Get suggestions for doctors (patients, centers, other doctors)
   */
  private async getDoctorSuggestions(doctorId: string, centerId?: string): Promise<ChatParticipantSuggestion[]> {
    try {
      const suggestions: ChatParticipantSuggestion[] = [];

      // Get doctor's patients via approved requests
      try {
        const requests = await discoveryService.getReceivedRequests({ status: 'approved', page: 1, limit: 100 });
        const patientRequests = (requests.requests || []).filter(request =>
          request.requestType === 'patient_request'
        );

        patientRequests.forEach(request => {
          const sender = request.sender;
          if (sender && sender.id) {
            const suggestion: ChatParticipantSuggestion = {
              id: sender.id,
              name: sender.profile?.displayName || 'Unknown Patient',
              email: sender.email || '',
              avatar: (sender.profile as any)?.avatar || undefined,
              role: 'patient',
              category: 'patient'
            };
            suggestions.push(suggestion);
          }
        });
      } catch (error) {
        console.warn('Failed to fetch doctor patients:', error);
      }

      // Get connected doctors
      try {
        const connections = await discoveryService.getConnections();
        connections.forEach(connection => {
          if (connection.id !== doctorId) {
            const suggestion: ChatParticipantSuggestion = {
              id: connection.id,
              name: connection.displayName || 'Unknown Doctor',
              email: '', // Discovery User doesn't have email property
              avatar: connection.avatar,
              role: 'doctor',
              category: 'doctor'
            };
            suggestions.push(suggestion);
          }
        });
      } catch (error) {
        console.warn('Failed to fetch doctor connections:', error);
      }

      // Get centers if doctor is associated with one
      if (centerId) {
        try {
          const center = await healthcareCentersService.getCenterById(centerId);
          const suggestion: ChatParticipantSuggestion = {
            id: center.id,
            name: center.name || 'Healthcare Center',
            email: center.email || '',
            avatar: undefined,
            role: 'center',
            category: 'center'
          };
          suggestions.push(suggestion);
        } catch (error) {
          console.warn('Failed to fetch doctor center:', error);
        }
      }

      return suggestions;
    } catch (error) {
      console.error('❌ Error fetching doctor suggestions:', error);
      return [];
    }
  }
}

export const participantSuggestionsService = new ParticipantSuggestionsService();
