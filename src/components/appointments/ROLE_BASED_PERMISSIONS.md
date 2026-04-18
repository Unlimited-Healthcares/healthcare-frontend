# 👥 Role-Based Permissions for Appointment Page

This document defines the permissions and UI variations for different user roles in the appointment system.

## 🎭 User Roles Overview

### **1. Patient Role**
- **Description**: Regular patients who book and manage their own appointments
- **Access Level**: Limited to own data and basic appointment management
- **Primary Actions**: View, confirm, reschedule, cancel own appointments

### **2. Doctor/Provider Role**
- **Description**: Healthcare providers who see patients and manage their schedules
- **Access Level**: Can view assigned appointments and manage their availability
- **Primary Actions**: View assigned appointments, complete appointments, manage availability

### **3. Staff Role**
- **Description**: Administrative staff who manage appointments for the center
- **Access Level**: Can view and manage all appointments within their center
- **Primary Actions**: Full CRUD operations on appointments, manage schedules

### **4. Center Admin Role**
- **Description**: Center administrators with full control over their center
- **Access Level**: Complete control over all center operations
- **Primary Actions**: All staff actions plus center management

### **5. System Admin Role**
- **Description**: System administrators with access to all centers
- **Access Level**: Complete system-wide access
- **Primary Actions**: All operations across all centers

## 🔐 Permission Matrix

| Feature | Patient | Doctor | Staff | Center Admin | System Admin |
|---------|---------|--------|-------|--------------|--------------|
| **View Own Appointments** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View All Appointments** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **View Center Appointments** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **View System Appointments** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Create Appointments** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit Own Appointments** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit All Appointments** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Cancel Appointments** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Complete Appointments** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **View Analytics** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Manage Availability** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Manage Appointment Types** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Send Reminders** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Export Data** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Manage Users** | ❌ | ❌ | ❌ | ✅ | ✅ |

## 🎨 UI Variations by Role

### **Patient Role UI**

#### **Header Section**
- ✅ Search appointments
- ✅ View toggle (List/Calendar/Grid)
- ✅ Notifications (own appointments only)
- ✅ User profile display

#### **KPIs Section**
- ✅ Personal metrics only
- ❌ Center-wide analytics
- ❌ Provider performance metrics

#### **Filters Section**
- ✅ Search by doctor, reason
- ✅ Filter by status, date, type
- ❌ Filter by patient ID
- ❌ Filter by provider
- ❌ Export functionality

#### **Appointments List**
- ✅ View own appointments only
- ✅ Confirm scheduled appointments
- ✅ Reschedule appointments
- ✅ Cancel appointments
- ✅ Join video calls
- ❌ Complete appointments
- ❌ View other patients' appointments

#### **Sidebar**
- ✅ Book new appointment
- ✅ View available slots
- ✅ Reschedule appointment
- ✅ Next appointment widget
- ❌ Provider availability management
- ❌ Admin tools

### **Doctor/Provider Role UI**

#### **Header Section**
- ✅ Search appointments
- ✅ View toggle (List/Calendar/Grid)
- ✅ Notifications (assigned appointments)
- ✅ User profile display

#### **KPIs Section**
- ✅ Personal metrics
- ✅ Assigned appointments metrics
- ❌ Center-wide analytics

#### **Filters Section**
- ✅ Search by patient, reason
- ✅ Filter by status, date, type
- ✅ Filter by patient ID
- ❌ Filter by other providers
- ❌ Export functionality

#### **Appointments List**
- ✅ View assigned appointments
- ✅ Complete confirmed appointments
- ✅ Reschedule appointments
- ✅ Cancel appointments
- ✅ Join video calls
- ❌ View other providers' appointments

#### **Sidebar**
- ✅ Book new appointment
- ✅ View available slots
- ✅ Reschedule appointment
- ✅ Next appointment widget
- ✅ Manage own availability
- ❌ Admin tools

### **Staff Role UI**

#### **Header Section**
- ✅ Search appointments
- ✅ View toggle (List/Calendar/Grid)
- ✅ Notifications (center appointments)
- ✅ User profile display

#### **KPIs Section**
- ✅ Center-wide metrics
- ✅ Provider performance metrics
- ❌ System-wide analytics

#### **Filters Section**
- ✅ Search by patient, doctor, reason
- ✅ Filter by status, date, type, provider
- ✅ Filter by patient ID
- ✅ Export functionality

#### **Appointments List**
- ✅ View all center appointments
- ✅ Complete appointments
- ✅ Reschedule appointments
- ✅ Cancel appointments
- ✅ Join video calls
- ❌ View other centers' appointments

#### **Sidebar**
- ✅ Book new appointment
- ✅ View available slots
- ✅ Reschedule appointment
- ✅ Next appointment widget
- ✅ Manage provider availability
- ✅ Admin tools (center-level)

### **Center Admin Role UI**

#### **Header Section**
- ✅ Search appointments
- ✅ View toggle (List/Calendar/Grid)
- ✅ Notifications (center appointments)
- ✅ User profile display

#### **KPIs Section**
- ✅ Center-wide metrics
- ✅ Provider performance metrics
- ✅ Advanced analytics
- ❌ System-wide analytics

#### **Filters Section**
- ✅ Search by patient, doctor, reason
- ✅ Filter by status, date, type, provider
- ✅ Filter by patient ID
- ✅ Export functionality
- ✅ Advanced filtering options

#### **Appointments List**
- ✅ View all center appointments
- ✅ Complete appointments
- ✅ Reschedule appointments
- ✅ Cancel appointments
- ✅ Join video calls
- ✅ Manage all appointments
- ❌ View other centers' appointments

#### **Sidebar**
- ✅ Book new appointment
- ✅ View available slots
- ✅ Reschedule appointment
- ✅ Next appointment widget
- ✅ Manage provider availability
- ✅ Admin tools (center-level)
- ✅ User management

### **System Admin Role UI**

#### **Header Section**
- ✅ Search appointments
- ✅ View toggle (List/Calendar/Grid)
- ✅ Notifications (all appointments)
- ✅ User profile display

#### **KPIs Section**
- ✅ System-wide metrics
- ✅ Center performance metrics
- ✅ Provider performance metrics
- ✅ Advanced analytics

#### **Filters Section**
- ✅ Search by patient, doctor, reason
- ✅ Filter by status, date, type, provider, center
- ✅ Filter by patient ID
- ✅ Export functionality
- ✅ Advanced filtering options

#### **Appointments List**
- ✅ View all appointments
- ✅ Complete appointments
- ✅ Reschedule appointments
- ✅ Cancel appointments
- ✅ Join video calls
- ✅ Manage all appointments

#### **Sidebar**
- ✅ Book new appointment
- ✅ View available slots
- ✅ Reschedule appointment
- ✅ Next appointment widget
- ✅ Manage provider availability
- ✅ Admin tools (system-level)
- ✅ User management
- ✅ Center management

## 🔧 Implementation Details

### **Role Detection**
```typescript
// Get user role from auth context
const { profile } = useAuth();
const userRole = profile?.role || 'patient';

// Check permissions
const canViewAllAppointments = ['staff', 'center_admin', 'system_admin'].includes(userRole);
const canCompleteAppointments = ['doctor', 'staff', 'center_admin', 'system_admin'].includes(userRole);
const canManageAvailability = ['doctor', 'staff', 'center_admin', 'system_admin'].includes(userRole);
```

### **Conditional Rendering**
```typescript
// Show/hide components based on role
{canViewAllAppointments && (
  <AppointmentFilters
    showPatientFilter={true}
    showProviderFilter={true}
    showExportButton={true}
  />
)}

{canCompleteAppointments && (
  <AppointmentList
    showCompleteButton={true}
    showAdminActions={true}
  />
)}
```

### **API Endpoint Selection**
```typescript
// Choose appropriate API endpoint based on role
const getAppointmentsEndpoint = () => {
  switch (userRole) {
    case 'patient':
      return '/appointments/me';
    case 'doctor':
      return `/appointments?providerId=${profile.providerId}`;
    case 'staff':
    case 'center_admin':
      return `/appointments?centerId=${profile.centerId}`;
    case 'system_admin':
      return '/appointments';
    default:
      return '/appointments/me';
  }
};
```

### **Data Filtering**
```typescript
// Filter data based on role permissions
const filterAppointmentsByRole = (appointments: Appointment[]) => {
  switch (userRole) {
    case 'patient':
      return appointments.filter(apt => apt.patientId === profile.id);
    case 'doctor':
      return appointments.filter(apt => apt.providerId === profile.providerId);
    case 'staff':
    case 'center_admin':
      return appointments.filter(apt => apt.centerId === profile.centerId);
    case 'system_admin':
      return appointments; // No filtering
    default:
      return appointments.filter(apt => apt.patientId === profile.id);
  }
};
```

## 🚨 Security Considerations

### **Frontend Validation**
- All role-based UI elements are conditionally rendered
- API calls are filtered based on user role
- Sensitive data is hidden from unauthorized users

### **Backend Validation**
- All API endpoints validate user permissions
- Data access is restricted based on user role
- Audit logs track all appointment modifications

### **Data Privacy**
- Patients can only see their own appointments
- Providers can only see their assigned appointments
- Staff can only see appointments within their center
- System admins have access to all data

## 📱 Responsive Role Behavior

### **Mobile View**
- Role-specific features are maintained
- Touch-friendly interfaces for all roles
- Simplified navigation for complex roles

### **Tablet View**
- Full feature set available for all roles
- Optimized layouts for different screen sizes
- Consistent role-based permissions

### **Desktop View**
- Complete feature set with advanced options
- Multi-panel layouts for admin roles
- Keyboard shortcuts for power users

This role-based permission system ensures that each user sees only the features and data they're authorized to access, maintaining security while providing an optimal user experience for each role type.
