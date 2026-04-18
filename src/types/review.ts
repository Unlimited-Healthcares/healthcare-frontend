// Review Status
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  HIDDEN = 'hidden'
}

// Review Moderation Actions
export enum ReviewModerationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  FLAG = 'flag',
  UNFLAG = 'unflag',
  HIDE = 'hide'
}

// Review Sort Options
export enum ReviewSortBy {
  CREATED_AT = 'createdAt',
  RATING = 'overallRating',
  HELPFUL_VOTES = 'helpfulVotes'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

// Create Review Request
export interface CreateReviewDto {
  centerId?: string;                   // Optional: Center UUID
  patientId?: string;                  // Optional: Patient UUID
  revieweeUserId?: string;             // Optional: User UUID being reviewed
  reviewerUserId?: string;             // Optional: User UUID who wrote the review
  reviewerCenterId?: string;           // Optional: Center UUID who wrote the review
  requestId?: string;                  // Optional: Request UUID
  appointmentId?: string;              // Optional: Appointment UUID
  overallRating: number;               // Required: 1-5 rating
  staffRating?: number;                // Optional: 1-5 rating
  cleanlinessRating?: number;          // Optional: 1-5 rating
  waitTimeRating?: number;             // Optional: 1-5 rating
  treatmentRating?: number;            // Optional: 1-5 rating
  title?: string;                      // Optional: Review title (max 200 chars)
  content?: string;                    // Optional: Review content (max 2000 chars)
  isAnonymous?: boolean;               // Optional: Anonymous review
  photos?: string[];                   // Optional: Photo URLs
}

// Update Review Request
export interface UpdateReviewDto extends Partial<CreateReviewDto> { }

// Query Reviews Parameters
export interface QueryReviewsDto {
  centerId?: string;                   // Optional: Filter by center
  patientId?: string;                  // Optional: Filter by patient
  revieweeUserId?: string;             // Optional: Filter by reviewee user
  reviewerUserId?: string;             // Optional: Filter by reviewer user
  requestId?: string;                  // Optional: Filter by request
  minRating?: number;                  // Optional: Minimum rating (1-5)
  maxRating?: number;                  // Optional: Maximum rating (1-5)
  verifiedOnly?: boolean;              // Optional: Verified reviews only
  hasResponse?: boolean;               // Optional: Reviews with responses
  search?: string;                     // Optional: Search in content
  sortBy?: ReviewSortBy;               // Optional: Sort field
  sortOrder?: SortOrder;               // Optional: Sort direction
  page?: number;                       // Optional: Page number (1+)
  limit?: number;                      // Optional: Items per page (1-100)
}

// Create Review Response
export interface CreateReviewResponseDto {
  content: string;                     // Required: Response content (10-1000 chars)
}

// Moderate Review
export interface ModerateReviewDto {
  action: ReviewModerationAction;      // Required: Moderation action
  notes?: string;                      // Optional: Moderation notes
}

// Vote on Review
export interface VoteReviewDto {
  isHelpful: boolean;                  // Required: Helpful or not helpful
}

// Upload Review Photos
export interface UploadReviewPhotosDto {
  photos: string[];                    // Required: Photo URLs
  captions?: string[];                 // Optional: Photo captions
}

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Patient interface
export interface Patient {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Healthcare Center interface
export interface HealthcareCenter {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

// Review Response Entity
export interface ReviewResponse {
  id: string;                          // UUID - Primary key
  reviewId: string;                    // UUID - Review ID
  content: string;                     // Response content
  respondedBy: string;                 // UUID - Responder ID
  status: 'active' | 'edited' | 'deleted';
  isEdited: boolean;                   // Edited flag
  editedAt?: Date;                     // Last edit timestamp
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Last update timestamp
  responder: User;                     // Responder information
}

// Review Vote Entity
export interface ReviewVote {
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean;
  createdAt: Date;
}

// Review Entity
export interface Review {
  id: string;                          // UUID - Primary key
  centerId?: string;                   // UUID - Center ID
  patientId?: string;                  // UUID - Patient ID
  revieweeUserId?: string;             // UUID - User ID being reviewed
  reviewerUserId?: string;             // UUID - User ID who wrote the review
  reviewerCenterId?: string;           // UUID - Center ID who wrote the review
  requestId?: string;                  // UUID - Request ID
  appointmentId?: string;              // UUID - Appointment ID
  overallRating: number;               // Overall rating (1-5)
  staffRating?: number;                // Staff rating (1-5)
  cleanlinessRating?: number;          // Cleanliness rating (1-5)
  waitTimeRating?: number;             // Wait time rating (1-5)
  treatmentRating?: number;            // Treatment rating (1-5)
  title?: string;                      // Review title
  content?: string;                    // Review content
  isAnonymous: boolean;                // Anonymous flag
  isVerified: boolean;                 // Verified flag
  status: ReviewStatus;                // Review status
  photos?: string[];                   // Photo URLs
  helpfulVotes: number;                // Helpful votes count
  totalVotes: number;                  // Total votes count
  isEdited: boolean;                   // Edited flag
  editedAt?: Date;                     // Last edit timestamp
  moderationNotes?: string;            // Moderation notes
  moderatedBy?: string;                // UUID - Moderator ID
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Last update timestamp
  center?: HealthcareCenter;           // Center information
  patient?: Patient;                   // Patient information
  revieweeUser?: User;                 // User being reviewed
  reviewerUser?: User;                 // User who wrote review
  reviewerCenter?: HealthcareCenter;   // Center who wrote review
  moderator?: User;                    // Moderator information
  response?: ReviewResponse;           // Center response
  votes: ReviewVote[];                 // User votes
}

// Review Photo Entity
export interface ReviewPhoto {
  id: string;                          // UUID - Primary key
  reviewId: string;                    // UUID - Review ID
  photoUrl: string;                    // Photo URL
  caption?: string;                    // Photo caption
  displayOrder: number;                // Display order
  fileSize?: number;                   // File size in bytes
  dimensions?: {                       // Photo dimensions
    width: number;
    height: number;
  };
  createdAt: Date;                     // Creation timestamp
}

// Analytics Types
export interface CenterReviewSummary {
  totalReviews: number;                // Total review count
  averageRating: number;               // Average rating
  ratingDistribution: {                // Rating distribution
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStars: number;
  };
  verifiedReviewsCount: number;        // Verified reviews count
  responseRate: number;                // Response rate percentage
  averageResponseTime: number;         // Average response time in hours
  recentReviews: Review[];             // Recent reviews
}

export interface SentimentAnalysis {
  positive: number;                    // Positive sentiment count
  negative: number;                    // Negative sentiment count
  neutral: number;                     // Neutral sentiment count
  averageSentiment: number;            // Average sentiment score
  sentimentTrend: 'improving' | 'declining' | 'stable';
}

export interface ResponseMetrics {
  averageResponseTime: number;         // Average response time in hours
  totalResponses: number;              // Total responses count
  responseRate: number;                // Response rate percentage
  quickResponseCount: number;          // Quick responses (< 24h)
  delayedResponseCount: number;        // Delayed responses (> 72h)
}

export interface PhotoMetrics {
  totalPhotos: number;                 // Total photos count
  reviewsWithPhotos: number;           // Reviews with photos count
  averagePhotosPerReview: number;      // Average photos per review
}

export interface TimeTrends {
  daily: Record<string, number>;       // Daily trends
  weekly: Record<string, number>;      // Weekly trends
  monthly: Record<string, number>;     // Monthly trends
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ReviewWithVotes {
  review: Review;
  userVote?: ReviewVote;
}

export interface AdvancedAnalytics {
  totalReviews: number;                // Total reviews count
  sentimentAnalysis: SentimentAnalysis;
  responseMetrics: ResponseMetrics;
  photoMetrics: PhotoMetrics | null;
  trends: TimeTrends;
  reviewsWithVotes: ReviewWithVotes[];
}

export interface TrendsAnalysis {
  ratingTrend: RatingTrend[];
  categoryTrends: {
    staff: CategoryTrend[];
    cleanliness: CategoryTrend[];
    waitTime: CategoryTrend[];
    treatment: CategoryTrend[];
  };
  responseRateTrend: ResponseRateTrend[];
}

export interface RatingTrend {
  period: Date;                        // Time period
  averageRating: number;               // Average rating for period
  totalReviews: number;                // Total reviews for period
}

export interface CategoryTrend {
  period: Date;                        // Time period
  rating: number;                      // Category rating for period
}

export interface ResponseRateTrend {
  period: Date;                        // Time period
  responseRate: number;                // Response rate for period
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
