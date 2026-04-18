# Frontend PRD - Detailed Page Specifications
# Healthcare Management System

## 📱 **Page Inventory & Detailed Specifications**

---

## **1. AUTHENTICATION & USER MANAGEMENT PAGES**

### **Page: Authentication (Login/Register)**
- **Purpose**: User authentication and account creation
- **URL Path**: `/auth`
- **UI Elements**:
  - Email input field with validation
  - Password input field with strength indicator
  - Login button with loading state
  - Register link/button
  - Forgot password link
  - Role selection dropdown (for registration)
  - Form validation messages
  - Loading states and spinners
  - Error message display
  - Success confirmation

- **API Integration**:
  ```typescript
  // Login
  POST /auth/login
  Request: { email: string, password: string }
  Response: { access_token: string, user: UserDto }
  
  // Registration
  POST /auth/register
  Request: { email: string, password: string, name: string, roles: string[] }
  Response: { access_token: string, user: UserDto }
  
  // Forgot Password
  POST /auth/forgot-password
  Request: { email: string }
  Response: { message: string }
  ```

- **User Flow**:
  1. User enters credentials
  2. Frontend validates input format
  3. API call to backend authentication
  4. JWT token stored in localStorage/sessionStorage
  5. Redirect to role-appropriate dashboard
  6. Error handling for invalid credentials
  7. Success confirmation and redirect

- **Supabase Replacement**: Remove Supabase Auth → Use backend JWT authentication
- **Security**: JWT token encryption, password hashing, rate limiting

### **Page: User Profile Management**
- **Purpose**: Complete user profile setup and management
- **URL Path**: `/profile`
- **UI Elements**:
  - Personal information form (name, email, phone)
  - Health profile sections (age, gender, blood type)
  - Emergency contacts management
  - Insurance information
  - Medical history summary
  - Profile completion progress bar
  - Save/update buttons with loading states
  - Avatar/photo upload with preview
  - Privacy settings toggle
  - Data export options

- **API Integration**:
  ```typescript
  // Get user profile
  GET /users/me
  Response: UserDto with complete profile
  
  // Update user profile
  PATCH /users/me
  Request: Partial<UserDto>
  Response: Updated UserDto
  
  // Upload profile photo
  POST /users/me/avatar
  Request: FormData with image file
  Response: { avatar_url: string }
  
  // Get profile completion status
  GET /users/me/profile-completion
  Response: { completion_percentage: number, missing_fields: string[] }
  ```

- **User Flow**:
  1. Load existing profile data
  2. Display editable form fields
  3. Real-time validation feedback
  4. Save changes to backend
  5. Update local state and UI
  6. Show success/error messages
  7. Track profile completion progress

- **Supabase Replacement**: Remove Supabase user profiles → Use backend user management
- **Features**: Progressive profile completion, data validation, privacy controls

---

## **2. PATIENT JOURNEY PAGES**

### **Page: Patient Dashboard**
- **Purpose**: Central hub for patient health management
- **URL Path**: `/dashboard`
- **UI Elements**:
  - Health summary cards (vitals, recent tests)
  - Upcoming appointments widget
  - Recent medical records
  - AI health assistant widget (persistent)
  - Quick action buttons (book appointment, view records)
  - Emergency services button (always visible)
  - Health metrics visualization (charts/graphs)
  - Recent activity feed
  - Notification center
  - Health goals tracking

- **API Integration**:
  ```typescript
  // Get dashboard data
  GET /patients/dashboard
  Response: {
    upcoming_appointments: AppointmentDto[],
    recent_records: MedicalRecordDto[],
    health_metrics: HealthMetricsDto,
    notifications: NotificationDto[],
    health_summary: HealthSummaryDto
  }
  
  // Get patient profile
  GET /patients/me
  Response: PatientDto
  
  // Get health metrics
  GET /patients/me/health-metrics
  Response: HealthMetricsDto
  ```

- **User Flow**:
  1. Load dashboard data on page mount
  2. Display health overview and metrics
  3. Show quick action options
  4. Real-time updates via WebSocket
  5. Navigate to specific features
  6. Interact with AI health assistant

- **Supabase Replacement**: Remove Supabase real-time subscriptions → Use backend WebSocket connections
- **Features**: Real-time updates, health tracking, AI integration

### **Page: Health Assessment & AI Chat**
- **Purpose**: AI-powered health assessment and guidance
- **URL Path**: `/health-assessment`
- **UI Elements**:
  - AI chat interface with message history
  - Symptom input forms with auto-complete
  - Health questionnaire with progress tracking
  - AI recommendations display cards
  - Health insights visualization
  - Action items list with checkboxes
  - Progress tracking dashboard
  - Health risk assessment
  - Appointment suggestions
  - Emergency alerts for critical symptoms

- **API Integration**:
  ```typescript
  // Start AI chat session
  POST /ai/chat/sessions
  Request: { patient_id: string, initial_symptoms?: string }
  Response: { session_id: string, ai_response: string }
  
  // Send message to AI
  POST /ai/chat/sessions/{session_id}/messages
  Request: { message: string, context: any }
  Response: { ai_response: string, recommendations: string[] }
  
  // Symptom analysis
  POST /ai/symptoms/check
  Request: { symptoms: string[], patient_history: any }
  Response: { analysis: string, severity: string, recommendations: string[] }
  
  // Get AI recommendations
  GET /ai/recommendations
  Query Params: { patient_id: string, context: string }
  Response: RecommendationDto[]
  ```

- **User Flow**:
  1. User describes symptoms or health concerns
  2. AI analyzes and provides recommendations
  3. User can ask follow-up questions
  4. AI suggests next steps (appointments, tests, etc.)
  5. Save assessment results to medical records
  6. Track health recommendations over time
  7. Emergency escalation for critical symptoms

- **Supabase Replacement**: Remove Supabase AI services → Use backend AI endpoints
- **Features**: Natural language processing, symptom analysis, health tracking

### **Page: Healthcare Center Discovery**
- **Purpose**: Find and explore healthcare facilities
- **URL Path**: `/centers`
- **UI Elements**:
  - Search and filter controls (location, specialty, rating)
  - Interactive map view with center markers
  - Center list with detailed cards
  - Distance and rating display
  - Service availability calendar
  - Provider information and specialties
  - Appointment booking buttons
  - Reviews and ratings system
  - Center comparison tool
  - Favorites and recent searches

- **API Integration**:
  ```typescript
  // Get centers with filters
  GET /centers
  Query Params: { 
    location?: string, 
    specialty?: string, 
    rating?: number,
    distance?: number,
    services?: string[]
  }
  Response: CenterDto[]
  
  // Get center details
  GET /centers/{id}
  Response: CenterDto with full details
  
  // Get nearby centers
  GET /location/centers
  Query Params: { lat: number, lng: number, radius: number }
  Response: CenterDto[]
  
  // Search centers
  GET /centers/search
  Query Params: { query: string, filters: any }
  Response: CenterDto[]
  ```

- **User Flow**:
  1. User enters location or uses GPS
  2. Display nearby centers on interactive map
  3. Filter by specialty, rating, distance, services
  4. View detailed center information
  5. Check appointment availability
  6. Book appointments directly
  7. Save favorite centers
  8. Compare multiple centers

- **Supabase Replacement**: Remove Supabase location services → Use backend location endpoints
- **Features**: Interactive maps, advanced filtering, real-time availability

### **Page: Appointment Booking & Management**
- **Purpose**: Schedule and manage healthcare appointments
- **URL Path**: `/appointments`
- **UI Elements**:
  - Calendar view (monthly/weekly/daily)
  - Time slot selection grid
  - Provider selection dropdown
  - Appointment type selection
  - Recurring appointment options
  - Pre-visit questionnaire forms
  - Confirmation details display
  - Appointment list view with status
  - Rescheduling and cancellation options
  - Reminder settings
  - Video call preparation

- **API Integration**:
  ```typescript
  // Get available time slots
  GET /appointments/availability/provider/{provider_id}
  Query Params: { date: string, appointment_type: string }
  Response: TimeSlotDto[]
  
  // Book appointment
  POST /appointments
  Request: {
    provider_id: string,
    patient_id: string,
    appointment_type: string,
    scheduled_time: string,
    notes?: string,
    recurring_pattern?: any
  }
  Response: AppointmentDto
  
  // Get user appointments
  GET /appointments
  Query Params: { status?: string, date_from?: string, date_to?: string }
  Response: AppointmentDto[]
  
  // Update appointment
  PATCH /appointments/{id}
  Request: Partial<AppointmentDto>
  Response: Updated AppointmentDto
  
  // Cancel appointment
  DELETE /appointments/{id}
  Response: { success: boolean }
  ```

- **User Flow**:
  1. Select provider and appointment type
  2. Choose available time slot from calendar
  3. Fill pre-visit questionnaire
  4. Set recurring appointment if needed
  5. Confirm booking details
  6. Receive confirmation and reminders
  7. Manage existing appointments
  8. Prepare for video consultations

- **Supabase Replacement**: Remove Supabase calendar → Use backend appointment management
- **Features**: Recurring appointments, pre-visit preparation, video call integration

### **Page: Medical Records**
- **Purpose**: Access and manage personal medical records
- **URL Path**: `/medical-records`
- **UI Elements**:
  - Record categories (tests, prescriptions, procedures)
  - Document viewer with zoom and search
  - Advanced search and filtering
  - Upload new documents with drag-and-drop
  - Sharing controls and permissions
  - Version history tracking
  - Download options (PDF, original format)
  - Privacy settings and access logs
  - Record organization tools
  - Medical history timeline

- **API Integration**:
  ```typescript
  // Get medical records
  GET /medical-records
  Query Params: { category?: string, date_from?: string, date_to?: string }
  Response: MedicalRecordDto[]
  
  // Upload new record
  POST /medical-records
  Request: FormData with file and metadata
  Response: MedicalRecordDto
  
  // Share record with provider
  POST /medical-records/share
  Request: { record_id: string, provider_id: string, permissions: string[] }
  Response: { success: boolean }
  
  // Get record details
  GET /medical-records/{id}
  Response: MedicalRecordDto with full details
  
  // Update record metadata
  PATCH /medical-records/{id}
  Request: Partial<MedicalRecordDto>
  Response: Updated MedicalRecordDto
  ```

- **User Flow**:
  1. Browse records by category and date
  2. Search for specific records using keywords
  3. View document details and metadata
  4. Upload new documents with proper categorization
  5. Share records with healthcare providers
  6. Manage privacy and access settings
  7. Track record access and sharing history
  8. Organize records into folders

- **Supabase Replacement**: Remove Supabase file storage → Use backend file management
- **Features**: Document management, sharing controls, version tracking

### **Page: Emergency Services**
- **Purpose**: Access emergency healthcare services
- **URL Path**: `/emergency`
- **UI Elements**:
  - Large emergency alert button (always visible)
  - Ambulance request form
  - Automatic location sharing
  - Emergency contacts display
  - Health information summary
  - Emergency instructions and protocols
  - Real-time status tracking
  - Post-emergency care coordination
  - Emergency history
  - Quick emergency numbers

- **API Integration**:
  ```typescript
  // Create emergency alert
  POST /emergency/alerts
  Request: {
    patient_id: string,
    emergency_type: string,
    location: { lat: number, lng: number },
    description: string,
    severity_level: string
  }
  Response: EmergencyAlertDto
  
  // Request ambulance
  POST /emergency/ambulance
  Request: {
    patient_id: string,
    location: { lat: number, lng: number },
    urgency_level: string,
    medical_notes: string
  }
  Response: AmbulanceRequestDto
  
  // Get emergency status
  GET /emergency/alerts/{id}
  Response: EmergencyAlertDto with current status
  
  // Update emergency status
  PATCH /emergency/alerts/{id}
  Request: { status: string, notes: string }
  Response: Updated EmergencyAlertDto
  ```

- **User Flow**:
  1. User activates emergency mode with one tap
  2. Automatic location detection and sharing
  3. Send emergency alert to healthcare providers
  4. Request ambulance if needed
  5. Share critical health information
  6. Track emergency response in real-time
  7. Coordinate post-emergency care
  8. Document emergency for medical records

- **Supabase Replacement**: Remove Supabase location services → Use backend emergency endpoints
- **Features**: One-tap emergency, real-time tracking, health information sharing

### **Page: Blood Donation**
- **Purpose**: Manage blood donation participation
- **URL Path**: `/blood-donation`
- **UI Elements**:
  - Donor registration form with health screening
  - Donation history with impact metrics
  - Urgent request alerts with priority levels
  - Blood type information and compatibility
  - Donation scheduling calendar
  - Reward tracking and achievements
  - Community impact visualization
  - Health requirements and eligibility
  - Donation center locations
  - Health monitoring post-donation

- **API Integration**:
  ```typescript
  // Register as donor
  POST /blood-donation/donors/register
  Request: {
    patient_id: string,
    blood_type: string,
    health_conditions: string[],
    contact_preferences: any,
    emergency_contact: ContactDto
  }
  Response: DonorDto
  
  // Get urgent requests
  GET /blood-donation/requests/urgent
  Response: BloodRequestDto[]
  
  // Schedule donation
  POST /blood-donation/appointments
  Request: {
    donor_id: string,
    center_id: string,
    preferred_date: string,
    blood_type: string,
    donation_type: string
  }
  Response: DonationAppointmentDto
  
  // Get donor profile
  GET /blood-donation/donors/me
  Response: DonorDto with donation history
  
  // Get donation impact
  GET /blood-donation/donors/me/impact
  Response: { lives_saved: number, donations_count: number, last_donation: string }
  ```

- **User Flow**:
  1. Complete comprehensive donor registration
  2. View urgent blood requests with priority levels
  3. Schedule donation appointments at convenient centers
  4. Track donation history and impact metrics
  5. Monitor community health impact
  6. Manage health requirements and eligibility
  7. Receive rewards and recognition
  8. Coordinate with donation centers

- **Supabase Replacement**: Remove Supabase user profiles → Use backend blood donation system
- **Features**: Donor management, urgent alerts, impact tracking

### **Page: Equipment Marketplace**
- **Purpose**: Browse and rent medical equipment
- **URL Path**: `/equipment`
- **UI Elements**:
  - Equipment catalog with categories
  - Advanced filtering (price, condition, availability)
  - Equipment details with specifications
  - Rental request forms
  - Price comparison tools
  - Availability calendar
  - Vendor information and ratings
  - Maintenance scheduling
  - Equipment reviews
  - Rental history tracking

- **API Integration**:
  ```typescript
  // Browse equipment
  GET /equipment/items
  Query Params: {
    category?: string,
    condition?: string,
    price_min?: number,
    price_max?: number,
    availability?: string,
    location?: string
  }
  Response: EquipmentItemDto[]
  
  // Request equipment rental
  POST /equipment/rental/requests
  Request: {
    equipment_id: string,
    patient_id: string,
    rental_period: { start: string, end: string },
    delivery_address: string,
    special_requirements?: string
  }
  Response: RentalRequestDto
  
  // Schedule maintenance
  POST /equipment/maintenance
  Request: {
    equipment_id: string,
    maintenance_type: string,
    scheduled_date: string,
    notes: string
  }
  Response: MaintenanceScheduleDto
  
  // Get rental history
  GET /equipment/rental/history
  Query Params: { patient_id: string }
  Response: RentalHistoryDto[]
  ```

- **User Flow**:
  1. Browse equipment by category and location
  2. Apply filters for price, condition, and availability
  3. View detailed equipment specifications
  4. Submit rental requests with delivery details
  5. Schedule equipment maintenance
  6. Track rental status and history
  7. Compare prices and vendors
  8. Manage equipment returns

- **Supabase Replacement**: Remove Supabase marketplace → Use backend equipment management
- **Features**: Advanced filtering, rental management, maintenance scheduling

---

## **3. PROVIDER JOURNEY PAGES**

### **Page: Provider Dashboard**
- **Purpose**: Central hub for healthcare providers
- **URL Path**: `/provider/dashboard`
- **UI Elements**:
  - Patient overview with key metrics
  - Appointment calendar with today's schedule
  - Recent consultations summary
  - Medical record updates pending
  - AI assistance tools for diagnosis
  - Performance metrics and analytics
  - Quick action buttons
  - Notifications center
  - Patient alerts and reminders
  - Resource utilization

- **API Integration**:
  ```typescript
  // Get provider dashboard data
  GET /providers/dashboard
  Response: {
    upcoming_appointments: AppointmentDto[],
    recent_patients: PatientDto[],
    medical_records: MedicalRecordDto[],
    notifications: NotificationDto[],
    performance_metrics: ProviderMetricsDto
  }
  
  // Get provider profile
  GET /providers/me
  Response: ProviderDto
  
  // Get today's schedule
  GET /appointments/today
  Query Params: { provider_id: string }
  Response: AppointmentDto[]
  ```

- **User Flow**:
  1. Load provider-specific dashboard data
  2. View patient overview and key metrics
  3. Access appointment calendar and schedule
  4. Review recent activities and consultations
  5. Navigate to specific tools and features
  6. Monitor performance and patient outcomes

- **Supabase Replacement**: Remove Supabase real-time → Use backend provider endpoints
- **Features**: Performance tracking, patient analytics, real-time updates

### **Page: Patient Management**
- **Purpose**: Manage assigned patients and their records
- **URL Path**: `/provider/patients`
- **UI Elements**:
  - Patient list with search and filters
  - Patient profiles with health summary
  - Medical history timeline
  - Recent visits and treatments
  - Treatment plans and progress
  - Communication tools and chat
  - Document management
  - Health metrics and trends
  - Appointment scheduling
  - Patient notes and observations

- **API Integration**:
  ```typescript
  // Get assigned patients
  GET /providers/patients
  Query Params: { search?: string, status?: string, specialty?: string }
  Response: PatientDto[]
  
  // Get patient details
  GET /patients/{id}
  Response: PatientDto with full medical history
  
  // Update patient information
  PATCH /patients/{id}
  Request: Partial<PatientDto>
  Response: Updated PatientDto
  
  // Get patient medical records
  GET /medical-records
  Query Params: { patient_id: string }
  Response: MedicalRecordDto[]
  
  // Get patient health metrics
  GET /patients/{id}/health-metrics
  Response: HealthMetricsDto
  ```

- **User Flow**:
  1. Browse assigned patients with search and filters
  2. Search for specific patients by name or criteria
  3. View comprehensive patient profiles
  4. Access complete medical records and history
  5. Update patient information and notes
  6. Communicate with patients through chat
  7. Monitor health metrics and trends
  8. Schedule follow-up appointments

- **Supabase Replacement**: Remove Supabase patient data → Use backend patient management
- **Features**: Patient search, health tracking, communication tools

### **Page: Appointment Calendar**
- **Purpose**: Manage provider's appointment schedule
- **URL Path**: `/provider/calendar`
- **UI Elements**:
  - Calendar view (daily/weekly/monthly)
  - Appointment details and patient information
  - Time slot management and availability
  - Availability settings and working hours
  - Patient information and medical history
  - Consultation tools and preparation
  - Schedule conflicts detection
  - Booking management and confirmations
  - Recurring appointment patterns
  - Calendar export and sharing

- **API Integration**:
  ```typescript
  // Get provider appointments
  GET /appointments
  Query Params: { provider_id: string, date_from: string, date_to: string }
  Response: AppointmentDto[]
  
  // Set availability
  POST /appointments/availability
  Request: {
    provider_id: string,
    time_slots: TimeSlotDto[],
    recurring_pattern?: any,
    exceptions?: string[]
  }
  Response: AvailabilityDto[]
  
  // Update appointment
  PATCH /appointments/{id}
  Request: Partial<AppointmentDto>
  Response: Updated AppointmentDto
  
  // Get availability conflicts
  GET /appointments/conflicts
  Query Params: { provider_id: string, date: string }
  Response: ConflictDto[]
  ```

- **User Flow**:
  1. View comprehensive appointment calendar
  2. Set working hours and availability patterns
  3. Manage appointment details and scheduling
  4. Handle schedule conflicts and rescheduling
  5. Access consultation tools and patient information
  6. Update appointment status and notes
  7. Manage recurring appointment patterns
  8. Export calendar for external use

- **Supabase Replacement**: Remove Supabase calendar → Use backend appointment system
- **Features**: Conflict detection, recurring patterns, availability management

### **Page: Consultation Tools**
- **Purpose**: Conduct virtual and in-person consultations
- **URL Path**: `/provider/consultation`
- **UI Elements**:
  - Video conferencing interface with controls
  - Chat functionality for patient communication
  - Document sharing and viewing
  - Medical record access and updates
  - Prescription tools and medication management
  - Treatment notes and documentation
  - Patient communication history
  - Follow-up scheduling tools
  - Consultation recording (with consent)
  - AI diagnostic assistance

- **API Integration**:
  ```typescript
  // Start video session
  POST /video-conferencing/sessions
  Request: {
    appointment_id: string,
    provider_id: string,
    patient_id: string,
    session_type: string,
    recording_consent: boolean
  }
  Response: VideoSessionDto
  
  // Create chat room
  POST /chat/rooms
  Request: {
    participants: string[],
    room_type: string,
    metadata: any
  }
  Response: ChatRoomDto
  
  // Update medical records
  PATCH /medical-records/{id}
  Request: Partial<MedicalRecordDto>
  Response: Updated MedicalRecordDto
  
  // Create prescription
  POST /prescriptions
  Request: PrescriptionDto
  Response: PrescriptionDto
  ```

- **User Flow**:
  1. Start consultation session with patient
  2. Conduct video call with recording options
  3. Use chat for additional communication
  4. Access and update patient records
  5. Create prescriptions and treatment plans
  6. Document consultation notes
  7. Schedule follow-up appointments
  8. Review consultation summary

- **Supabase Replacement**: Remove Supabase video/chat → Use backend communication services
- **Features**: Video conferencing, document sharing, prescription management

---

## **4. CENTER STAFF PAGES**

### **Page: Center Management**
- **Purpose**: Manage healthcare center operations
- **URL Path**: `/center/management`
- **UI Elements**:
  - Center profile and information
  - Staff management and roles
  - Service configuration and pricing
  - Operational settings and policies
  - Performance metrics and analytics
  - Resource allocation and scheduling
  - Compliance monitoring and reporting
  - System configuration and settings
  - Center branding and customization
  - Integration settings

- **API Integration**:
  ```typescript
  // Get center details
  GET /centers/{id}
  Response: CenterDto
  
  // Update center information
  PATCH /centers/{id}
  Request: Partial<CenterDto>
  Response: Updated CenterDto
  
  // Get center staff
  GET /centers/{id}/staff
  Response: UserDto[]
  
  // Configure services
  POST /appointments/types/center/{center_id}
  Request: AppointmentTypeDto
  Response: AppointmentTypeDto
  
  // Get center performance
  GET /centers/{id}/performance
  Response: CenterPerformanceDto
  ```

- **User Flow**:
  1. View and edit center information
  2. Manage staff members and roles
  3. Configure services and pricing
  4. Monitor center performance
  5. Update operational settings
  6. Manage compliance requirements
  7. Customize center branding
  8. Configure system integrations

- **Supabase Replacement**: Remove Supabase center management → Use backend center services
- **Features**: Staff management, service configuration, performance monitoring

### **Page: Operations Dashboard**
- **Purpose**: Monitor center operations and performance
- **URL Path**: `/center/operations`
- **UI Elements**:
  - Appointment overview and metrics
  - Resource utilization charts
  - Patient flow and wait times
  - Equipment status and availability
  - Staff performance and productivity
  - Revenue analytics and trends
  - Quality metrics and outcomes
  - Operational alerts and notifications
  - Capacity planning tools
  - Efficiency optimization

- **API Integration**:
  ```typescript
  // Get center operations data
  GET /centers/{id}/operations
  Response: {
    appointments: AppointmentMetricsDto,
    resources: ResourceUtilizationDto,
    performance: PerformanceMetricsDto,
    quality: QualityMetricsDto
  }
  
  // Get equipment status
  GET /equipment/center/{center_id}
  Response: EquipmentItemDto[]
  
  // Get staff performance
  GET /centers/{id}/staff-performance
  Response: StaffPerformanceDto[]
  
  // Get operational alerts
  GET /centers/{id}/alerts
  Response: OperationalAlertDto[]
  ```

- **User Flow**:
  1. Monitor center performance metrics
  2. Track resource utilization and efficiency
  3. Analyze patient flow and wait times
  4. Manage equipment status and maintenance
  5. Review staff performance and productivity
  6. Analyze revenue and quality metrics
  7. Respond to operational alerts
  8. Optimize center operations

- **Supabase Replacement**: Remove Supabase analytics → Use backend metrics
- **Features**: Real-time monitoring, performance analytics, operational optimization

---

## **5. ADMIN PAGES**

### **Page: System Administration**
- **Purpose**: Manage system-wide settings and users
- **URL Path**: `/admin`
- **UI Elements**:
  - User management and role assignment
  - System settings and configuration
  - Security configuration and policies
  - Performance monitoring and health checks
  - Compliance dashboard and reporting
  - Audit logs and activity tracking
  - System health and maintenance
  - Backup and recovery tools
  - Integration management
  - System analytics and insights

- **API Integration**:
  ```typescript
  // Get all users
  GET /admin/users
  Query Params: { role?: string, status?: string, center_id?: string }
  Response: UserDto[]
  
  // Update user roles
  PATCH /admin/users/{id}
  Request: { roles: string[], permissions: string[] }
  Response: Updated UserDto
  
  // Get audit logs
  GET /audit/logs
  Query Params: { user_id?: string, action?: string, date_from?: string }
  Response: AuditLogDto[]
  
  // Get system health
  GET /admin/health
  Response: SystemHealthDto
  
  // Get system metrics
  GET /admin/metrics
  Response: SystemMetricsDto
  ```

- **User Flow**:
  1. Manage system users and roles
  2. Assign permissions and access levels
  3. Monitor system health and performance
  4. Review audit logs and compliance
  5. Configure security settings
  6. Manage system integrations
  7. Monitor system analytics
  8. Perform system maintenance

- **Supabase Replacement**: Remove Supabase admin → Use backend admin services
- **Features**: User management, system monitoring, compliance tracking

---

## **6. SHARED COMPONENTS & FEATURES**

### **Navigation System**
- **Purpose**: Consistent navigation across all pages
- **Components**:
  - Top navigation bar with branding
  - Side navigation menu with role-based items
  - Breadcrumbs for page hierarchy
  - Role-based menu items and permissions
  - Quick action buttons and shortcuts
  - Search functionality across the system
  - User profile menu and settings
  - Emergency access button (always visible)
  - Notification center and alerts
  - Help and support access

- **API Integration**:
  ```typescript
  // Get user permissions
  GET /users/me/permissions
  Response: PermissionDto[]
  
  // Get navigation menu
  GET /navigation/menu
  Query Params: { user_role: string }
  Response: NavigationMenuDto
  
  // Get user notifications
  GET /notifications
  Response: NotificationDto[]
  ```

### **Real-time Communication Hub**
- **Purpose**: Unified communication across the system
- **Components**:
  - Chat interface with room management
  - Video conferencing integration
  - File sharing and document exchange
  - Push notifications and alerts
  - Message history and archiving
  - Contact management and favorites
  - Communication preferences
  - Group chat and team communication
  - Voice messages and audio calls
  - Screen sharing capabilities

- **API Integration**:
  ```typescript
  // WebSocket connection
  WebSocket: /ws
  
  // Get chat history
  GET /chat/rooms/{room_id}/messages
  Response: MessageDto[]
  
  // Send message
  POST /chat/rooms/{room_id}/messages
  Request: { content: string, type: string, attachments?: any[] }
  Response: MessageDto
  
  // Get video session
  GET /video-conferencing/sessions/{id}
  Response: VideoSessionDto
  ```

### **AI Health Assistant Widget**
- **Purpose**: Persistent AI assistance across all pages
- **Components**:
  - Floating chat widget with minimize/maximize
  - Context-aware suggestions based on current page
  - Health recommendations and guidance
  - Symptom analysis and assessment
  - Appointment assistance and scheduling
  - Medical guidance and information
  - Health tracking and reminders
  - Emergency escalation for critical issues
  - Multi-language support
  - Voice input and output

- **API Integration**:
  ```typescript
  // Get AI context
  GET /ai/context
  Query Params: { page: string, user_action: string, user_role: string }
  Response: AIContextDto
  
  // AI chat
  POST /ai/chat/sessions
  Request: { message: string, context: any, session_id?: string }
  Response: { response: string, suggestions: string[], actions: string[] }
  
  // Get AI recommendations
  GET /ai/recommendations
  Query Params: { context: string, user_profile: any }
  Response: RecommendationDto[]
  ```

---

**This document provides comprehensive specifications for all frontend pages, including UI elements, API integrations, user flows, and Supabase replacement strategies. Each page is designed to integrate seamlessly with the backend API while providing an optimal user experience.**
