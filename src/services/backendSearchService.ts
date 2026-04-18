import apiClient from './apiClient';

export interface SearchResult {
  id: string;
  entity_type: 'patient' | 'medical_record' | 'file' | 'appointment' | 'center' | 'doctor' | 'service';
  entity_id: string;
  title: string;
  description?: string;
  content?: string;
  metadata: Record<string, any>;
  center_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientSearchResult {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  center_id: string;
  created_at: string;
}

export interface MedicalRecordSearchResult {
  id: string;
  patient_id: string;
  patient_name: string;
  record_type: string;
  diagnosis?: string;
  symptoms?: string;
  treatment?: string;
  category: string;
  tags: string[];
  center_id: string;
  created_at: string;
  updated_at: string;
}

export interface FileSearchResult {
  id: string;
  filename: string;
  file_type: string;
  category: string;
  size: number;
  patient_id?: string;
  center_id: string;
  uploaded_at: string;
}

export interface SearchFilters {
  query: string;
  category?: string;
  tags?: string[];
  centerId?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const backendSearchService = {
  /**
   * Global search across multiple entity types
   */
  async globalSearch(query: string, filters?: Omit<SearchFilters, 'query'>): Promise<SearchResult[]> {
    try {
      const params = new URLSearchParams({ query });

      if (filters?.category) params.append('category', filters.category);
      if (filters?.centerId) params.append('centerId', filters.centerId);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await apiClient.get<SearchResult[]>(`/search/global?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error performing global search:', error);
      return [];
    }
  },

  /**
   * Search patients
   */
  async searchPatients(filters: SearchFilters): Promise<SearchResponse<PatientSearchResult>> {
    try {
      const params = new URLSearchParams({ query: filters.query });

      if (filters.category) params.append('category', filters.category);
      if (filters.centerId) params.append('centerId', filters.centerId);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<SearchResponse<PatientSearchResult>>(`/patients/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
  },

  /**
   * Search medical records
   */
  async searchMedicalRecords(filters: SearchFilters): Promise<SearchResponse<MedicalRecordSearchResult>> {
    try {
      const params = new URLSearchParams({ query: filters.query });

      if (filters.category) params.append('category', filters.category);
      if (filters.tags) params.append('tags', filters.tags.join(','));
      if (filters.centerId) params.append('centerId', filters.centerId);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<SearchResponse<MedicalRecordSearchResult>>(`/medical-records/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching medical records:', error);
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
  },

  /**
   * Search files
   */
  async searchFiles(filters: SearchFilters): Promise<SearchResponse<FileSearchResult>> {
    try {
      const params = new URLSearchParams({ query: filters.query });

      if (filters.category) params.append('category', filters.category);
      if (filters.centerId) params.append('centerId', filters.centerId);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<SearchResponse<FileSearchResult>>(`/files/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching files:', error);
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
  },

  /**
   * Search appointments
   */
  async searchAppointments(filters: SearchFilters): Promise<SearchResponse<any>> {
    try {
      const params = new URLSearchParams({ query: filters.query });

      if (filters.centerId) params.append('centerId', filters.centerId);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await apiClient.get<SearchResponse<any>>(`/appointments/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching appointments:', error);
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
  },

  /**
   * Search nearby centers
   */
  async searchNearbyCenters(location: string, radius: number = 10): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        location,
        radius: radius.toString()
      });

      const response = await apiClient.get<any[]>(`/centers/nearby?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching nearby centers:', error);
      return [];
    }
  },

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(`/search/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }
};
