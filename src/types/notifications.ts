// Notification Types
export enum NotificationType {
  APPOINTMENT = 'appointment',
  MEDICAL_RECORD = 'medical_record',
  SYSTEM = 'system',
  REFERRAL = 'referral',
  PAYMENT = 'payment',
  TEST_RESULT = 'test_result',
  MESSAGE = 'message',
  EMERGENCY = 'emergency',
  APPOINTMENT_REQUEST = 'appointment_request'
}

// Delivery Methods
export enum DeliveryMethod {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  BOTH = 'both',
  ALL = 'all'
}

// Delivery Status
export enum DeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

// Priority Levels
export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Alert Severity
export enum AlertSeverity {
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Create Notification Request
export interface CreateNotificationDto {
  userId?: string;
  centerId?: string;
  title: string;
  message: string;
  type: string;
  deliveryMethod?: string;
  relatedType?: string;
  relatedId?: string;
  data?: Record<string, unknown>;
  isUrgent?: boolean;
  scheduledFor?: string;
  expiresAt?: string;
}

// Get Notifications Query
export interface GetNotificationsDto {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
  priority?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Update Notification Preferences
export interface UpdateNotificationPreferencesDto {
  emailVerified?: boolean;
  phoneVerified?: boolean;
  medicalRecordRequest?: string;
  medicalRecordAccess?: string;
  recordShareExpiring?: string;
  appointment?: string;
  message?: string;
  system?: string;
  referral?: string;
  testResult?: string;
  payment?: string;
  marketing?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
}

// Notification Entity
export interface Notification {
  id: string;
  userId: string;
  centerId?: string;
  title: string;
  message: string;
  type: string;
  deliveryMethod: string;
  relatedType?: string;
  relatedId?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  isUrgent: boolean;
  readAt?: Date | string;
  sentAt?: Date | string;
  scheduledFor?: Date | string;
  expiresAt?: Date | string;
  deliveryStatus: string;
  errorMessage?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: User;
}

// User interface (simplified)
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Notification Preferences Entity
export interface NotificationPreference {
  id: string;
  userId: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  medicalRecordRequest: string;
  medicalRecordAccess: string;
  recordShareExpiring: string;
  appointment: string;
  message: string;
  system: string;
  referral: string;
  testResult: string;
  payment: string;
  marketing: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: User;
}

// Notification Filters
export interface NotificationFilters {
  type?: string;
  isRead?: boolean;
  priority?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
  view?: 'list' | 'grid' | 'calendar';
}

// Notification Response
export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Notification KPIs
export interface NotificationKPIs {
  totalNotifications: number;
  totalNotificationsChange: number;
  unreadNotifications: number;
  unreadNotificationsChange: number;
  criticalNotifications: number;
  criticalNotificationsChange: number;
  todayNotifications: number;
  todayNotificationsChange: number;
  deliveryRate: number;
  deliveryRateChange: number;
  averageResponseTime: number;
  averageResponseTimeChange: number;
  typeCounts?: Record<string, number>;
}

// WebSocket Notification Data
export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  createdAt: Date | string;
  metadata?: Record<string, unknown>;
}

// Alert Data
export interface AlertData {
  type: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  actionRequired?: boolean;
  metadata?: Record<string, unknown>;
}

// System Notification
export interface SystemNotification {
  type: string;
  title: string;
  message: string;
  priority: PriorityLevel;
  targetAudience?: string[];
  metadata?: Record<string, unknown>;
}
