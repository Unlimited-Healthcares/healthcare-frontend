import { apiClient } from '@/lib/api-client';

export interface DicomWebStudy {
  studyInstanceUid: string;
  patientName?: string;
  patientId?: string;
  studyDate?: string;
  modality?: string;
  description?: string;
  seriesCount?: number;
  instanceCount?: number;
}

export interface DicomWebSeries {
  seriesInstanceUid: string;
  modality: string;
  description?: string;
  instanceCount: number;
}

export interface DicomWebInstance {
  sopInstanceUid: string;
  seriesInstanceUid: string;
  studyInstanceUid: string;
  instanceNumber: number;
  rows?: number;
  columns?: number;
}

export const dicomWebService = {
  /**
   * QIDO-RS: Search for studies
   */
  searchStudies: async (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<DicomWebStudy[]>(`/imaging/dicom-web/studies?${query}`);
  },

  /**
   * QIDO-RS: Search for series in a study
   */
  getSeries: async (studyInstanceUid: string) => {
    return apiClient.get<DicomWebSeries[]>(`/imaging/dicom-web/studies/${studyInstanceUid}/series`);
  },

  /**
   * QIDO-RS: Search for instances in a series
   */
  getInstances: async (studyInstanceUid: string, seriesInstanceUid: string) => {
    return apiClient.get<DicomWebInstance[]>(`/imaging/dicom-web/studies/${studyInstanceUid}/series/${seriesInstanceUid}/instances`);
  },

  /**
   * WADO-RS: Get instance metadata
   */
  getInstanceMetadata: async (studyInstanceUid: string, seriesInstanceUid: string, sopInstanceUid: string) => {
    return apiClient.get<any>(`/imaging/dicom-web/studies/${studyInstanceUid}/series/${seriesInstanceUid}/instances/${sopInstanceUid}/metadata`);
  },

  /**
   * WADO-RS: Get frame URL (for rendering)
   * In a real PACS bridge, this would point to a WADO-RS /frames endpoint or a rendered JPEG
   */
  getFrameUrl: (studyInstanceUid: string, seriesInstanceUid: string, sopInstanceUid: string, frameNumber: number = 1) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}/imaging/dicom-web/studies/${studyInstanceUid}/series/${seriesInstanceUid}/instances/${sopInstanceUid}/frames/${frameNumber}/rendered`;
  }
};
