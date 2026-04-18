import axios from 'axios';
import {
  CreateReviewDto,
  UpdateReviewDto,
  QueryReviewsDto,
  CreateReviewResponseDto,
  ModerateReviewDto,
  VoteReviewDto,
  Review,
  CenterReviewSummary,
  AdvancedAnalytics,
  TrendsAnalysis,
  PaginatedResponse,
  ApiResponse
} from '../types/review';

import { API_BASE_URL as CONFIG_API_BASE_URL } from '../config/api';

// NOTE: Using fallback from config
const API_BASE_URL = CONFIG_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const reviewApi = {
  // Review Management
  createReview: (data: CreateReviewDto): Promise<ApiResponse<Review>> =>
    apiClient.post('/reviews', data),

  getReviews: (params: QueryReviewsDto = {}): Promise<PaginatedResponse<Review>> =>
    apiClient.get('/reviews', { params }),

  getReviewById: (id: string): Promise<ApiResponse<Review>> =>
    apiClient.get(`/reviews/${id}`),

  updateReview: (id: string, data: UpdateReviewDto): Promise<ApiResponse<Review>> =>
    apiClient.put(`/reviews/${id}`, data),

  deleteReview: (id: string): Promise<boolean> =>
    apiClient.delete(`/reviews/${id}`).then(() => true),

  // Analytics
  getCenterSummary: (centerId: string): Promise<ApiResponse<CenterReviewSummary>> =>
    apiClient.get(`/reviews/centers/${centerId}/summary`),

  getCenterAnalytics: (centerId: string, months: number = 12): Promise<ApiResponse<any>> =>
    apiClient.get(`/reviews/centers/${centerId}/analytics`, { params: { months } }),

  getCenterTrends: (centerId: string, months: number = 12): Promise<ApiResponse<TrendsAnalysis>> =>
    apiClient.get(`/reviews/centers/${centerId}/trends`, { params: { months } }),

  getAdvancedAnalytics: (centerId: string, options: {
    startDate?: string;
    endDate?: string;
    includePhotos?: boolean;
    includeResponses?: boolean;
  } = {}): Promise<ApiResponse<AdvancedAnalytics>> =>
    apiClient.get(`/reviews/centers/${centerId}/advanced-analytics`, { params: options }),

  // Response Management
  createResponse: (reviewId: string, data: CreateReviewResponseDto): Promise<ApiResponse<any>> =>
    apiClient.post(`/reviews/${reviewId}/response`, data),

  moderateReview: (reviewId: string, data: ModerateReviewDto): Promise<ApiResponse<Review>> =>
    apiClient.put(`/reviews/${reviewId}/moderate`, data),

  voteOnReview: (reviewId: string, data: VoteReviewDto): Promise<boolean> =>
    apiClient.post(`/reviews/${reviewId}/vote`, data).then(() => true),

  // Photo Management
  uploadPhotos: (reviewId: string, formData: FormData): Promise<ApiResponse<any>> =>
    apiClient.post(`/reviews/${reviewId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getPhotos: (reviewId: string): Promise<ApiResponse<any>> =>
    apiClient.get(`/reviews/${reviewId}/photos`),
};

// Mock data for development/testing
export const mockReviewData = {
  summary: {
    totalReviews: 200,
    averageRating: 3.1,
    ratingDistribution: {
      fiveStars: 46,
      fourStars: 36,
      threeStars: 41,
      twoStars: 48,
      oneStars: 29
    },
    verifiedReviewsCount: 141,
    responseRate: 52.0,
    averageResponseTime: 24.5,
    recentReviews: []
  },

  reviews: [
    {
      id: '1',
      centerId: 'center-1',
      patientId: 'patient-1',
      overallRating: 5,
      title: 'Excellent care and very professional staff',
      content: 'Excellent care and very professional staff. Highly recommend!',
      isAnonymous: false,
      isVerified: true,
      status: 'approved' as const,
      photos: [],
      helpfulVotes: 12,
      totalVotes: 15,
      isEdited: false,
      createdAt: new Date('2025-07-27'),
      updatedAt: new Date('2025-07-27'),
      center: { id: 'center-1', name: 'Healthcare Center', address: '123 Main St' },
      patient: { id: 'patient-1', name: 'David W.', email: 'david@example.com' },
      response: {
        id: 'resp-1',
        reviewId: '1',
        content: 'Thank you for your review! We appreciate your feedback.',
        respondedBy: 'provider-1',
        status: 'active' as const,
        isEdited: false,
        createdAt: new Date('2025-09-12'),
        updatedAt: new Date('2025-09-12'),
        responder: { id: 'provider-1', name: 'Dr. Johnson', email: 'dr.johnson@example.com' }
      },
      votes: []
    },
    {
      id: '2',
      centerId: 'center-1',
      patientId: 'patient-2',
      overallRating: 5,
      title: 'Outstanding service',
      content: 'Excellent care and very professional staff. Highly recommend!',
      isAnonymous: false,
      isVerified: true,
      status: 'approved' as const,
      photos: [],
      helpfulVotes: 8,
      totalVotes: 10,
      isEdited: false,
      createdAt: new Date('2025-09-04'),
      updatedAt: new Date('2025-09-04'),
      center: { id: 'center-1', name: 'Healthcare Center', address: '123 Main St' },
      patient: { id: 'patient-2', name: 'Michael R.', email: 'michael@example.com' },
      response: {
        id: 'resp-2',
        reviewId: '2',
        content: 'Thank you for your kind words!',
        respondedBy: 'provider-2',
        status: 'active' as const,
        isEdited: false,
        createdAt: new Date('2025-09-12'),
        updatedAt: new Date('2025-09-12'),
        responder: { id: 'provider-2', name: 'Dr. Davis', email: 'dr.davis@example.com' }
      },
      votes: []
    },
    {
      id: '3',
      centerId: 'center-1',
      patientId: 'patient-1',
      overallRating: 4,
      title: 'Professional and caring staff',
      content: 'Professional and caring staff, will definitely return.',
      isAnonymous: false,
      isVerified: true,
      status: 'pending' as const,
      photos: [],
      helpfulVotes: 5,
      totalVotes: 7,
      isEdited: false,
      createdAt: new Date('2025-09-01'),
      updatedAt: new Date('2025-09-01'),
      center: { id: 'center-1', name: 'Healthcare Center', address: '123 Main St' },
      patient: { id: 'patient-1', name: 'David W.', email: 'david@example.com' },
      response: {
        id: 'resp-3',
        reviewId: '3',
        content: 'Thank you for your feedback!',
        respondedBy: 'provider-1',
        status: 'active' as const,
        isEdited: false,
        createdAt: new Date('2025-09-12'),
        updatedAt: new Date('2025-09-12'),
        responder: { id: 'provider-1', name: 'Dr. Johnson', email: 'dr.johnson@example.com' }
      },
      votes: []
    },
    {
      id: '4',
      centerId: 'center-1',
      patientId: 'patient-3',
      overallRating: 4,
      title: 'Good experience overall',
      content: 'Good experience overall, modern facilities and equipment.',
      isAnonymous: false,
      isVerified: true,
      status: 'pending' as const,
      photos: ['https://example.com/photo1.jpg'],
      helpfulVotes: 3,
      totalVotes: 5,
      isEdited: false,
      createdAt: new Date('2025-07-18'),
      updatedAt: new Date('2025-07-18'),
      center: { id: 'center-1', name: 'Healthcare Center', address: '123 Main St' },
      patient: { id: 'patient-3', name: 'John D.', email: 'john@example.com' },
      response: {
        id: 'resp-4',
        reviewId: '4',
        content: 'We appreciate your review!',
        respondedBy: 'provider-2',
        status: 'active' as const,
        isEdited: false,
        createdAt: new Date('2025-09-12'),
        updatedAt: new Date('2025-09-12'),
        responder: { id: 'provider-2', name: 'Dr. Davis', email: 'dr.davis@example.com' }
      },
      votes: []
    },
    {
      id: '5',
      centerId: 'center-1',
      patientId: 'patient-4',
      overallRating: 5,
      title: 'Highly recommend',
      content: 'Excellent care and very professional staff. Highly recommend!',
      isAnonymous: false,
      isVerified: true,
      status: 'approved' as const,
      photos: [],
      helpfulVotes: 15,
      totalVotes: 18,
      isEdited: false,
      createdAt: new Date('2025-07-16'),
      updatedAt: new Date('2025-07-16'),
      center: { id: 'center-1', name: 'Healthcare Center', address: '123 Main St' },
      patient: { id: 'patient-4', name: 'Robert T.', email: 'robert@example.com' },
      response: {
        id: 'resp-5',
        reviewId: '5',
        content: 'Thank you for your review!',
        respondedBy: 'provider-1',
        status: 'active' as const,
        isEdited: false,
        createdAt: new Date('2025-09-12'),
        updatedAt: new Date('2025-09-12'),
        responder: { id: 'provider-1', name: 'Dr. Johnson', email: 'dr.johnson@example.com' }
      },
      votes: []
    },
    {
      id: '6',
      centerId: 'center-1',
      patientId: 'patient-5',
      overallRating: 5,
      title: 'Very knowledgeable doctor',
      content: 'Doctor was very knowledgeable and took time to answer questions.',
      isAnonymous: false,
      isVerified: true,
      status: 'approved' as const,
      photos: [],
      helpfulVotes: 7,
      totalVotes: 9,
      isEdited: false,
      createdAt: new Date('2025-08-05'),
      updatedAt: new Date('2025-08-05'),
      center: { id: 'center-1', name: 'Healthcare Center', address: '123 Main St' },
      patient: { id: 'patient-5', name: 'Emma L.', email: 'emma@example.com' },
      votes: []
    },
    {
      id: '7',
      centerId: 'center-1',
      patientId: 'patient-2',
      overallRating: 4,
      title: 'Modern facilities',
      content: 'Good experience overall, modern facilities and equipment.',
      isAnonymous: false,
      isVerified: true,
      status: 'approved' as const,
      photos: ['https://example.com/photo2.jpg'],
      helpfulVotes: 4,
      totalVotes: 6,
      isEdited: false,
      createdAt: new Date('2025-08-03'),
      updatedAt: new Date('2025-08-03'),
      center: { id: 'center-1', name: 'Healthcare Center', address: '123 Main St' },
      patient: { id: 'patient-2', name: 'Michael R.', email: 'michael@example.com' },
      response: {
        id: 'resp-7',
        reviewId: '7',
        content: 'Thank you for your feedback!',
        respondedBy: 'provider-3',
        status: 'active' as const,
        isEdited: false,
        createdAt: new Date('2025-09-12'),
        updatedAt: new Date('2025-09-12'),
        responder: { id: 'provider-3', name: 'Dr. Williams', email: 'dr.williams@example.com' }
      },
      votes: []
    },
    {
      id: '8',
      centerId: 'center-1',
      patientId: 'patient-2',
      overallRating: 4,
      title: 'Outstanding service',
      content: 'Outstanding service, felt comfortable throughout the visit.',
      isAnonymous: false,
      isVerified: true,
      status: 'approved' as const,
      photos: ['https://example.com/photo3.jpg'],
      helpfulVotes: 6,
      totalVotes: 8,
      isEdited: false,
      createdAt: new Date('2025-06-20'),
      updatedAt: new Date('2025-06-20'),
      center: { id: 'center-1', name: 'Healthcare Center', address: '123 Main St' },
      patient: { id: 'patient-2', name: 'Michael R.', email: 'michael@example.com' },
      votes: []
    },
    {
      id: '9',
      centerId: 'center-1',
      patientId: 'patient-5',
      overallRating: 5,
      title: 'Great experience',
      content: 'Great experience, doctor was very thorough and explained everything clearly.',
      isAnonymous: false,
      isVerified: true,
      status: 'pending' as const,
      photos: [],
      helpfulVotes: 9,
      totalVotes: 11,
      isEdited: false,
      createdAt: new Date('2025-08-02'),
      updatedAt: new Date('2025-08-02'),
      center: { id: 'center-1', name: 'Healthcare Center', address: '123 Main St' },
      patient: { id: 'patient-5', name: 'Emma L.', email: 'emma@example.com' },
      votes: []
    },
    {
      id: '10',
      centerId: 'center-1',
      patientId: 'patient-6',
      overallRating: 4,
      title: 'Worth the wait',
      content: 'Wait time was longer than expected, but the care was worth it.',
      isAnonymous: false,
      isVerified: true,
      status: 'approved' as const,
      photos: [],
      helpfulVotes: 2,
      totalVotes: 4,
      isEdited: false,
      createdAt: new Date('2025-07-08'),
      updatedAt: new Date('2025-07-08'),
      center: { id: 'center-1', name: 'Healthcare Center', address: '123 Main St' },
      patient: { id: 'patient-6', name: 'Sarah M.', email: 'sarah@example.com' },
      response: {
        id: 'resp-10',
        reviewId: '10',
        content: 'Thank you for your patience and feedback!',
        respondedBy: 'provider-4',
        status: 'active' as const,
        isEdited: false,
        createdAt: new Date('2025-09-12'),
        updatedAt: new Date('2025-09-12'),
        responder: { id: 'provider-4', name: 'Dr. Brown', email: 'dr.brown@example.com' }
      },
      votes: []
    }
  ] as Review[],

  trends: {
    ratingTrend: [
      { period: new Date('2025-08-14'), averageRating: 3.2, totalReviews: 8 },
      { period: new Date('2025-08-21'), averageRating: 3.5, totalReviews: 12 },
      { period: new Date('2025-08-28'), averageRating: 3.1, totalReviews: 15 },
      { period: new Date('2025-09-04'), averageRating: 3.8, totalReviews: 18 },
      { period: new Date('2025-09-12'), averageRating: 3.1, totalReviews: 20 }
    ]
  }
};
