import { apiClient } from '@/lib/api-client';

export interface ImagingStudy {
  id: string;
  patientId: string;
  studyInstanceUid?: string;
  description?: string;
  studyDate?: string;
  modality?: string;
  bodyPart?: string;
  centerId?: string;
  providerId?: string;
  isUrgent: boolean;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
  files?: ImagingFile[];
  patient?: { name: string };
  center?: { name: string };
}

export interface ImagingFile {
  id: string;
  studyId: string;
  sopInstanceUid?: string;
  seriesInstanceUid?: string;
  filePath: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  metadata?: any;
  createdAt: string;
}

export const imagingService = {
  createStudy: async (data: any) => {
    return apiClient.post<ImagingStudy>('/imaging/studies', data);
  },

  uploadFile: async (studyId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ImagingFile>(`/imaging/studies/${studyId}/upload`, formData);
  },

  getPatientStudies: async (patientId: string) => {
    return apiClient.get<ImagingStudy[]>(`/imaging/studies/patient/${patientId}`);
  },

  getStudy: async (id: string) => {
    return apiClient.get<ImagingStudy>(`/imaging/studies/${id}`);
  },

  getFileUrl: async (fileId: string) => {
    return apiClient.get<{ url: string }>(`/imaging/files/${fileId}/url`);
  }
};
