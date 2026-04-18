// Common types to replace 'any' throughout the application

// Generic API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form and Event types
export type FormData = Record<string, unknown>;
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;

// Generic object types
export type GenericObject = Record<string, unknown>;
export type StringRecord = Record<string, string>;
export type NumberRecord = Record<string, number>;

// API Error types
export interface ApiError {
  message: string;
  code?: string | number;
  details?: GenericObject;
}

// File upload types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: GenericObject;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FilterOption {
  label: string;
  value: string | number;
}

// Analytics types
export interface AnalyticsData {
  metrics: GenericObject;
  timeRange: {
    start: string;
    end: string;
  };
  filters?: GenericObject;
}

// Notification types
export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: GenericObject;
}

// Location types
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends LocationCoordinates {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Emergency tracking types
export interface EmergencyData {
  id: string;
  type: string;
  status: string;
  location: LocationData;
  timestamp: string;
  metadata?: GenericObject;
}

// Medical data types
export interface MedicalData {
  patientId: string;
  recordId?: string;
  data: GenericObject;
  timestamp: string;
  providerId: string;
}

// User and authentication types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  metadata?: GenericObject;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Request/Response wrappers
export type AsyncResult<T> = Promise<ApiResponse<T>>;
export type AsyncData<T> = Promise<T>;

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Database entity base
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>; 