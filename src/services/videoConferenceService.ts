import {
  VideoConference,
  CreateVideoConferenceDto,
  GetConferencesDto,
  VideoConferenceResponse,
  ConferenceSettingsUpdate,
  ConferenceRecording
} from '@/types/videoConferences';

import apiClient from './apiClient';

class VideoConferenceService {
  // Conference Management
  async getVideoConferences(filters: GetConferencesDto = {}): Promise<VideoConferenceResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/video-conferences?${queryParams}`);
    return response.data;
  }

  async createVideoConference(conferenceData: CreateVideoConferenceDto): Promise<VideoConference> {
    const response = await apiClient.post('/video-conferences', conferenceData);
    return response.data;
  }

  async getConferenceDetails(conferenceId: string): Promise<VideoConference> {
    const response = await apiClient.get(`/video-conferences/${conferenceId}`);
    return response.data;
  }

  async updateConference(conferenceId: string, updateData: Partial<CreateVideoConferenceDto>): Promise<VideoConference> {
    const response = await apiClient.patch(`/video-conferences/${conferenceId}`, updateData);
    return response.data;
  }

  async deleteConference(conferenceId: string): Promise<void> {
    await apiClient.delete(`/video-conferences/${conferenceId}`);
  }

  // Conference Actions
  async startConference(conferenceId: string): Promise<VideoConference> {
    const response = await apiClient.post(`/video-conferences/${conferenceId}/start`);
    return response.data;
  }

  async endConference(conferenceId: string): Promise<VideoConference> {
    const response = await apiClient.post(`/video-conferences/${conferenceId}/end`);
    return response.data;
  }

  async joinConference(conferenceId: string, password?: string): Promise<VideoConference> {
    const response = await apiClient.post(`/video-conferences/${conferenceId}/join`, { password });
    return response.data;
  }

  async leaveConference(conferenceId: string): Promise<void> {
    await apiClient.post(`/video-conferences/${conferenceId}/leave`);
  }

  // Recording Management
  async toggleRecording(conferenceId: string): Promise<VideoConference> {
    const response = await apiClient.post(`/video-conferences/${conferenceId}/recording/toggle`);
    return response.data;
  }

  async getConferenceRecordings(conferenceId: string): Promise<ConferenceRecording[]> {
    const response = await apiClient.get(`/video-conferences/${conferenceId}/recordings`);
    return response.data;
  }

  // Settings Management
  async updateConferenceSettings(conferenceId: string, settings: ConferenceSettingsUpdate): Promise<VideoConference> {
    const response = await apiClient.patch(`/video-conferences/${conferenceId}/settings`, settings);
    return response.data;
  }

  // Participant Management
  async addParticipant(conferenceId: string, userId: string): Promise<VideoConference> {
    const response = await apiClient.post(`/video-conferences/${conferenceId}/participants`, { userId });
    return response.data;
  }

  async removeParticipant(conferenceId: string, userId: string): Promise<VideoConference> {
    const response = await apiClient.delete(`/video-conferences/${conferenceId}/participants/${userId}`);
    return response.data;
  }

  // Statistics and KPIs
  async getConferenceKPIs(centerId?: string): Promise<any> {
    const queryParams = centerId ? `?centerId=${centerId}` : '';
    const response = await apiClient.get(`/video-conferences/kpis${queryParams}`);
    return response.data;
  }

  // Export functionality
  async exportConferences(filters: GetConferencesDto, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    queryParams.append('format', format);

    const response = await apiClient.get(`/video-conferences/export?${queryParams}`, {
      responseType: 'blob'
    });

    return response.data;
  }
}

export const videoConferenceService = new VideoConferenceService();
