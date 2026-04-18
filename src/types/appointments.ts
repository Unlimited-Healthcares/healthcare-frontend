// Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  centerId: string;
  providerId: string;
  appointmentTypeId?: string | null;
  appointmentDate: string;
  durationMinutes: number;
  reason: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  appointmentStatus: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  patientType: 'new' | 'follow-up'; // New per service logic
  confirmationStatus: 'pending' | 'confirmed' | 'declined';
  notes?: string;
  doctor: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  isRecurring: boolean;
  recurrencePattern?: any | null;
  parentAppointmentId?: string | null;
  rescheduledFrom?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  confirmedAt?: string | null;
  completedAt?: string | null;
  reminderSentAt?: string | null;
  completionNotes?: string;
  metadata?: {
    preparation?: string;
    reminderPreferences?: {
      emailEnabled: boolean;
      smsEnabled: boolean;
      reminderTiming: number[];
    };
  } | null;
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  centerName?: string;
  providerName?: string;
  location?: string;
  type?: 'video' | 'in-person' | 'phone';
  // Related objects from API
  center?: {
    id: string;
    displayId: string;
    name: string;
    type: string;
    address: string;
    phone?: string;
    email?: string;
  };
  provider?: {
    id: string;
    displayId: string;
    email: string;
    roles: string[];
  };
  patient?: {
    id: string;
    userId: string;
    patientId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface AppointmentType {
  id: string;
  centerId: string;
  name: string;
  description: string;
  durationMinutes: number;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  centerId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  maxAppointmentsPerSlot: number;
  slotDurationMinutes: number;
  bufferTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
  appointmentId?: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable: boolean;
}

export interface AppointmentFilters {
  search?: string;
  status?: 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  dateFrom?: string;
  dateTo?: string;
  providerId?: string;
  centerId?: string;
  patientId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  type?: string;
  isOnline?: boolean;
  page?: number;
  limit?: number;
  view?: 'list' | 'calendar' | 'grid';
}

export interface AppointmentKPIs {
  totalAppointments: number;
  confirmedToday: number;
  pendingConfirmation: number;
  cancellationRate: number;
  averageWaitTime: number;
  uniquePatients: number;
  // Percentage changes vs last month
  totalAppointmentsChange: number;
  confirmedTodayChange: number;
  pendingConfirmationChange: number;
  cancellationRateChange: number;
  averageWaitTimeChange: number;
  uniquePatientsChange: number;
}

export interface AppointmentAnalytics {
  centerId: string;
  period: string;
  metrics: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    averageDuration: number;
    utilizationRate: number;
  };
  byProvider: Array<{
    providerId: string;
    providerName: string;
    totalAppointments: number;
    completedAppointments: number;
    cancellationRate: number;
  }>;
  byDate: Array<{
    date: string;
    totalAppointments: number;
    completedAppointments: number;
  }>;
}

export interface CreateAppointmentDto {
  patientId: string;
  centerId: string;
  providerId: string;
  appointmentTypeId?: string;
  appointmentDate: string;
  durationMinutes: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  reason: string;
  patientType: 'new' | 'follow-up';
  notes?: string;
  doctor: string;
  isRecurring: boolean;
  metadata?: {
    preparation?: string;
    reminderPreferences?: {
      emailEnabled: boolean;
      smsEnabled: boolean;
      reminderTiming: number[];
    };
  };
}

export interface UpdateAppointmentDto {
  appointmentDate?: string;
  durationMinutes?: number;
  reason?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  confirmedAt?: string;
  completedAt?: string;
  completionNotes?: string;
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  reminderType: 'email' | 'sms' | 'push';
  reminderTime: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  deliveryStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringAppointment {
  id: string;
  patientId: string;
  centerId: string;
  providerId: string;
  startDate: string;
  endDate: string;
  recurrencePattern: 'daily' | 'weekly' | 'monthly';
  recurrenceInterval: number;
  dayOfWeek?: number;
  durationMinutes: number;
  reason: string;
  notes?: string;
  doctor: string;
  status: 'active' | 'paused' | 'cancelled';
  appointmentsCreated: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoConference {
  id: string;
  title: string;
  description?: string;
  type: 'consultation' | 'follow-up' | 'emergency';
  appointmentId?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  maxParticipants: number;
  isRecordingEnabled: boolean;
  waitingRoomEnabled: boolean;
  muteParticipantsOnEntry: boolean;
  provider: 'webrtc' | 'zoom' | 'teams';
  participantIds: string[];
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationMeta;
}

export interface AppointmentListResponse {
  data: Appointment[];
  pagination: PaginationMeta;
}

export interface AppointmentTypesResponse {
  centerId: string;
  appointmentTypes: AppointmentType[];
}

export interface ProviderAvailabilityResponse {
  providerId: string;
  availability: ProviderAvailability[];
}

export interface TimeSlotsResponse {
  providerId: string;
  timeSlots: TimeSlot[];
}

export interface AvailableSlotsResponse {
  providerId: string;
  date: string;
  availableSlots: AvailableSlot[];
}

export interface RemindersResponse {
  data: AppointmentReminder[];
  pagination: PaginationMeta;
}
