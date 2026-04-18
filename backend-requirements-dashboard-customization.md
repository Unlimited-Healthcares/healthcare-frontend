# Backend Requirements for Role-Based Dashboard Customization

## Overview
This document outlines what has been implemented for role-based dashboards and what the backend developer needs to provide to enable dynamic dashboard customization when different users log in.

## Current Dashboard Implementations

### 1. Patient Dashboard (User: Livanbre, Patient ID: PT879478486)

**Key Features Implemented:**
- **AI Health Assistant**: Symptom check, health guidance, wellness tips
- **Personal Health Overview**: Personalized greeting and health status
- **Upcoming Appointments**: Patient's scheduled appointments with doctors
- **Health Records**: Personal medical records (lab results, prescriptions, imaging)
- **Health Monitoring**: Personal vital signs (heart rate, blood pressure, temperature)
- **Today's Health Tips**: Personalized health advice
- **Emergency Services**: 911 call functionality with location sharing
- **Community Health**: Blood drive alerts and community information
- **Equipment Store**: Health monitoring equipment recommendations

**Navigation Items:**
- Dashboard, Messages, AI Health Chat, Appointments, Video Conferences, Health Centers, Health Records, Equipment, Blood Donation, Medical Reports, Referrals, Reviews, Notifications, Emergency, Community, Settings

### 2. Center Manager Dashboard (User: Center01, Center ID: USR125024705)

**Key Features Implemented:**
- **AI Center Assistant**: Center management assistance
- **Staff Management**: Manage center staff functionality
- **Center Analytics**: View center performance metrics
- **Center Settings**: Configure center settings
- **Appointments Management**: View and manage center appointments
- **Health Records Access**: Access to patient records within the center
- **Emergency Services**: Center-wide emergency management
- **Community Health**: Center-specific community information
- **Equipment Store**: Center equipment management

**Navigation Items:**
- Same as patient dashboard but with center management focus

### 3. Doctor Dashboard (User: Noobcyber208, Doctor ID: DR651842456)

**Key Features Implemented:**
- **AI Medical Assistant**: Medical practice assistance
- **Patient List**: View assigned patients
- **Medical Notes**: Review patient records
- **Diagnosis Help**: AI diagnostic assistance
- **Appointments**: Doctor's schedule and patient appointments
- **Health Records**: Access to patient medical records
- **Health Monitoring**: Patient vital signs monitoring
- **Emergency Services**: Medical emergency response
- **Community Health**: Medical community information
- **Equipment Store**: Medical equipment recommendations

**Navigation Items:**
- Same as patient dashboard but with medical practice focus

## Backend Requirements for Role-Based Customization

### 1. User Authentication & Role Management

**Required API Endpoints:**
```
POST /api/auth/login
GET /api/auth/profile
GET /api/auth/roles
```

**Data Structure Needed:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "patient|doctor|center_manager|admin|nurse|scheduler",
    "roleId": "string",
    "permissions": ["permission1", "permission2"],
    "profileData": {
      "patientId": "string", // for patients
      "doctorId": "string", // for doctors
      "centerId": "string", // for center managers
      "specialization": "string", // for doctors
      "department": "string" // for center staff
    }
  }
}
```

### 2. Dashboard Configuration API

**Required Endpoint:**
```
GET /api/dashboard/config/{role}
```

**Response Structure:**
```json
{
  "role": "patient|doctor|center_manager",
  "sections": [
    {
      "id": "ai_assistant",
      "title": "AI Health Assistant",
      "visible": true,
      "order": 1,
      "widgets": ["symptom_check", "health_guidance", "wellness_tips"]
    },
    {
      "id": "appointments",
      "title": "Upcoming Appointments",
      "visible": true,
      "order": 2,
      "widgets": ["appointment_list", "schedule_new"]
    }
  ],
  "navigation": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "icon": "dashboard",
      "visible": true,
      "order": 1
    },
    {
      "id": "messages",
      "label": "Messages",
      "icon": "messages",
      "visible": true,
      "order": 2
    }
  ]
}
```

### 3. Role-Specific Data Endpoints

#### For Patients:
```
GET /api/patients/{patientId}/appointments
GET /api/patients/{patientId}/health-records
GET /api/patients/{patientId}/vitals
GET /api/patients/{patientId}/prescriptions
GET /api/patients/{patientId}/lab-results
GET /api/patients/{patientId}/imaging
```

#### For Doctors:
```
GET /api/doctors/{doctorId}/patients
GET /api/doctors/{doctorId}/appointments
GET /api/doctors/{doctorId}/patient-records/{patientId}
GET /api/doctors/{doctorId}/medical-notes
GET /api/doctors/{doctorId}/diagnosis-help
```

#### For Center Managers:
```
GET /api/centers/{centerId}/staff
GET /api/centers/{centerId}/analytics
GET /api/centers/{centerId}/settings
GET /api/centers/{centerId}/appointments
GET /api/centers/{centerId}/patients
GET /api/centers/{centerId}/equipment
```

### 4. Permission-Based Data Filtering

**Required Middleware:**
- Role-based access control (RBAC) middleware
- Data filtering based on user permissions
- Patient data access restricted to assigned doctors
- Center data access restricted to center staff

**Example Permission Matrix:**
```json
{
  "patient": {
    "can_view": ["own_appointments", "own_records", "own_vitals"],
    "can_edit": ["own_profile", "own_vitals"],
    "can_create": ["appointment_requests", "record_uploads"]
  },
  "doctor": {
    "can_view": ["assigned_patients", "patient_records", "own_schedule"],
    "can_edit": ["medical_notes", "prescriptions", "diagnoses"],
    "can_create": ["prescriptions", "lab_orders", "referrals"]
  },
  "center_manager": {
    "can_view": ["center_staff", "center_analytics", "center_appointments"],
    "can_edit": ["center_settings", "staff_assignments"],
    "can_create": ["staff_accounts", "center_policies"]
  }
}
```

### 5. Dynamic Content Configuration

**Required Endpoints:**
```
GET /api/dashboard/sections/{role}
GET /api/dashboard/widgets/{role}
GET /api/dashboard/navigation/{role}
```

**Response Examples:**

**Patient Dashboard Sections:**
```json
{
  "sections": [
    {
      "id": "ai_health_assistant",
      "title": "AI Health Assistant",
      "description": "How can I help with your health today?",
      "widgets": [
        {
          "id": "symptom_check",
          "title": "Symptom Check",
          "description": "Describe your symptoms",
          "action": "start_symptom_check"
        },
        {
          "id": "health_guidance",
          "title": "Health Guidance",
          "description": "Get medical advice",
          "action": "start_health_guidance"
        }
      ]
    }
  ]
}
```

**Doctor Dashboard Sections:**
```json
{
  "sections": [
    {
      "id": "ai_medical_assistant",
      "title": "AI Medical Assistant",
      "description": "How can I assist with your medical practice?",
      "widgets": [
        {
          "id": "patient_list",
          "title": "Patient List",
          "description": "View your patients",
          "action": "view_patients"
        },
        {
          "id": "medical_notes",
          "title": "Medical Notes",
          "description": "Review patient records",
          "action": "review_notes"
        }
      ]
    }
  ]
}
```

### 6. Real-time Data Updates

**Required WebSocket Endpoints:**
```
WS /api/ws/dashboard/{userId}
WS /api/ws/notifications/{userId}
WS /api/ws/emergency/{centerId}
```

**Events to Handle:**
- New appointment notifications
- Emergency alerts
- Health record updates
- Vital sign alerts
- System notifications

### 7. Emergency Services Integration

**Required Endpoints:**
```
POST /api/emergency/alert
GET /api/emergency/location/{userId}
POST /api/emergency/share-medical-info
```

**Data Structure:**
```json
{
  "emergency": {
    "userId": "string",
    "location": {
      "lat": "number",
      "lng": "number",
      "address": "string"
    },
    "medicalInfo": {
      "allergies": ["string"],
      "medications": ["string"],
      "conditions": ["string"],
      "bloodType": "string",
      "emergencyContact": "string"
    },
    "timestamp": "datetime"
  }
}
```

### 8. Community and Equipment Store Integration

**Required Endpoints:**
```
GET /api/community/alerts
GET /api/community/blood-drives
GET /api/equipment/recommendations/{userId}
GET /api/equipment/store
POST /api/equipment/rent
POST /api/equipment/purchase
```

## Implementation Priority

### Phase 1: Core Authentication & Role Management
1. User authentication with role identification
2. Basic RBAC middleware
3. Dashboard configuration API

### Phase 2: Role-Specific Data Endpoints
1. Patient data endpoints
2. Doctor data endpoints
3. Center manager data endpoints

### Phase 3: Dynamic Dashboard Configuration
1. Section visibility control
2. Widget customization
3. Navigation customization

### Phase 4: Advanced Features
1. Real-time updates
2. Emergency services integration
3. Community and equipment store

## Security Considerations

1. **Data Isolation**: Ensure users can only access data relevant to their role and permissions
2. **API Rate Limiting**: Implement rate limiting for dashboard data endpoints
3. **Audit Logging**: Log all dashboard access and data modifications
4. **Encryption**: Encrypt sensitive health data in transit and at rest
5. **Session Management**: Implement secure session management with role-based tokens

## Testing Requirements

1. **Unit Tests**: Test each role's data access permissions
2. **Integration Tests**: Test dashboard loading for each role
3. **Security Tests**: Verify data isolation between roles
4. **Performance Tests**: Test dashboard loading times with large datasets
5. **User Acceptance Tests**: Verify dashboard functionality matches user expectations

## Conclusion

The frontend has been designed with three distinct role-based dashboards that provide comprehensive functionality for patients, doctors, and center managers. The backend needs to implement the authentication, authorization, and data access patterns described above to enable dynamic dashboard customization based on user roles.

The key success factors are:
1. Robust role-based authentication
2. Comprehensive permission system
3. Efficient data filtering and access control
4. Real-time updates and notifications
5. Secure emergency services integration

This implementation will provide a scalable foundation for role-based dashboard customization that can be extended for additional user types in the future.

