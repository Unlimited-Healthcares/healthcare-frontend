# 📅 Appointment Page API Integration Mapping

This document maps each UI component to its corresponding API endpoints and data requirements.

## 🔗 Component-to-API Mapping

### 1. **AppointmentHeader Component**
- **Search Functionality**: `GET /appointments?search={query}`
- **View Toggle**: Client-side state management
- **User Profile**: `GET /auth/me` (loaded via useAuth hook)

### 2. **AppointmentKPIs Component**
- **Data Source**: Calculated from `GET /appointments` response
- **Metrics Calculated**:
  - Total Appointments: Count of all appointments in current month
  - Confirmed Today: Count of confirmed appointments for today
  - Pending Confirmation: Count of scheduled appointments
  - Cancellation Rate: Percentage of cancelled appointments
  - Average Wait Time: Mock data (would need historical data)
  - Unique Patients: Count of unique patient IDs

### 3. **AppointmentFilters Component**
- **Search**: `GET /appointments?search={query}`
- **Status Filter**: `GET /appointments?status={status}`
- **Date Range**: `GET /appointments?dateFrom={date}&dateTo={date}`
- **Priority Filter**: `GET /appointments?priority={priority}`
- **Type Filter**: `GET /appointments?type={type}`
- **Export**: Future implementation (would need export endpoint)

### 4. **AppointmentList Component**
- **Data Source**: `GET /appointments` with pagination
- **Actions**:
  - Confirm: `PATCH /appointments/{id}/confirm`
  - Cancel: `PATCH /appointments/{id}` with status=cancelled
  - Complete: `PATCH /appointments/{id}/complete`
  - Reschedule: `PATCH /appointments/{id}` with new date/time
  - Join Call: `POST /video-conferences/{id}/join`

### 5. **AppointmentSidebar Component**
- **Next Appointment**: `GET /appointments?patientId={id}&status=confirmed&dateFrom=today&limit=1`
- **Provider Availability**: `GET /appointments/availability/provider/{providerId}`
- **Quick Actions**:
  - Book New: Opens CreateAppointmentModal
  - View Slots: `GET /appointments/slots/provider/{providerId}?date={date}`
  - Reschedule: Opens RescheduleAppointmentModal

### 6. **CreateAppointmentModal Component**
- **Load Appointment Types**: `GET /appointments/types/center/{centerId}`
- **Create Appointment**: `POST /appointments`
- **Form Fields**:
  - patientId, centerId, providerId (required)
  - appointmentDate, durationMinutes, reason, doctor (required)
  - priority, notes, isRecurring (optional)

### 7. **RescheduleAppointmentModal Component**
- **Update Appointment**: `PATCH /appointments/{id}`
- **Form Fields**:
  - appointmentDate (required)
  - durationMinutes, reason, notes (optional)

## 📊 Data Flow Architecture

### **Initial Page Load**
```typescript
// 1. Load user profile
const { profile } = useAuth(); // GET /auth/me

// 2. Load appointments with default filters
const appointments = await appointmentService.getAppointments({
  page: 1,
  limit: 10,
  status: 'all'
});

// 3. Calculate KPIs from appointments data
const kpis = appointmentService.calculateKPIs(appointments.data);
```

### **Filter Changes**
```typescript
// When user changes filters
const handleFilterChange = (newFilters) => {
  setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  // Triggers useEffect to reload appointments
};
```

### **Appointment Actions**
```typescript
// Confirm appointment
await appointmentService.confirmAppointment(appointmentId);

// Cancel appointment
await appointmentService.cancelAppointment(appointmentId, reason);

// Complete appointment
await appointmentService.completeAppointment(appointmentId, notes);
```

## 🔄 State Management

### **Global State Structure**
```typescript
interface AppointmentsState {
  // Data
  appointments: Appointment[];
  kpis: AppointmentKPIs | null;
  filters: AppointmentFilters;
  pagination: PaginationMeta;
  
  // UI State
  loading: boolean;
  error: string | null;
  showCreateModal: boolean;
  showRescheduleModal: boolean;
  selectedAppointment: Appointment | null;
}
```

### **State Updates Flow**
1. **Filter Change** → Update filters state → Trigger API call → Update appointments
2. **Appointment Action** → API call → Success → Refresh appointments list
3. **Modal Actions** → API call → Success → Close modal → Refresh data

## 🎯 Role-Based API Access

### **Patient Role**
- Can only access own appointments: `GET /appointments/me`
- Limited to confirm, reschedule, cancel own appointments
- Cannot access analytics or admin endpoints

### **Doctor/Provider Role**
- Can access assigned appointments: `GET /appointments?providerId={id}`
- Can complete appointments: `PATCH /appointments/{id}/complete`
- Can access provider availability: `GET /appointments/availability/provider/{id}`

### **Staff/Admin Role**
- Can access all appointments: `GET /appointments`
- Can access analytics: `GET /appointments/analytics/{centerId}`
- Can manage appointment types: `GET/POST /appointments/types/center/{centerId}`
- Can manage provider availability: `GET/POST/PATCH /appointments/availability`

## 🚀 Performance Optimizations

### **Data Loading Strategy**
- **Parallel Loading**: Load appointments and KPIs simultaneously
- **Pagination**: Load appointments in pages (default 10 per page)
- **Debounced Search**: 300ms delay on search input
- **Caching**: Cache appointment types and provider availability

### **API Call Optimization**
- **Batch Operations**: Group related API calls where possible
- **Conditional Loading**: Only load data when modals are opened
- **Error Handling**: Graceful fallbacks for failed API calls
- **Loading States**: Show skeleton loaders during data fetching

## 🔧 Error Handling

### **API Error Responses**
```typescript
// Standard error format from API
{
  statusCode: number;
  message: string;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
  path: string;
}
```

### **Component Error States**
- **Loading Errors**: Show error message with retry button
- **Validation Errors**: Show field-specific error messages
- **Network Errors**: Show generic error with refresh option
- **Permission Errors**: Show appropriate message based on user role

## 📱 Responsive Considerations

### **Mobile API Calls**
- **Reduced Data**: Load fewer appointments per page on mobile
- **Simplified Filters**: Show only essential filters on mobile
- **Touch-Friendly**: Larger touch targets for action buttons

### **Tablet API Calls**
- **Medium Pagination**: 20 items per page on tablet
- **Full Filters**: All filters available on tablet
- **Optimized Layout**: Sidebar collapses on smaller screens

## 🔮 Future Enhancements

### **Real-time Updates**
- **WebSocket Integration**: Real-time appointment updates
- **Push Notifications**: Appointment reminders and status changes
- **Live Availability**: Real-time provider availability updates

### **Advanced Features**
- **Bulk Operations**: Select multiple appointments for batch actions
- **Advanced Analytics**: More detailed reporting and insights
- **Integration**: Calendar sync, email notifications, SMS reminders

This mapping ensures that each UI component has a clear connection to its data source and maintains consistency with the API design patterns.
