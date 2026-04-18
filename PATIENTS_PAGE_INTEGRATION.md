# Patients Page Integration Guide

## Overview
A comprehensive patients management page has been created to display approved patients for both healthcare centers and individual providers.

## File Created
- **Component**: `/src/pages/PatientsPage.tsx`

## Features

### 1. Role-Based Access
- **Centers** (`/center/patients`): View all patients assigned to the healthcare center
- **Individual Providers** (`/me/patients`): View personal patient list
- Automatically detects user role and adjusts endpoint and UI accordingly

### 2. Patient Statistics Dashboard
- **Total Patients**: Overall count of approved patients
- **Active Patients**: Currently active patient count
- **New This Month**: Patients added in the current month

### 3. Patient List with Search
- Comprehensive patient cards with key information
- Real-time search by name or email
- Filterable patient list
- Beautiful card-based layout

### 4. Patient Information Display
- Profile information (name, age, gender)
- Contact details (email, phone)
- Address information
- Patient statistics (join date, appointments, last visit)
- Status badges

### 5. Patient Details Modal
- Full patient profile view
- Organized sections for different information types
- Quick access to complete patient data

## Integration Steps

### Step 1: Add Routes

Add both routes to your routing configuration:

```typescript
import PatientsPage from '@/pages/PatientsPage';

// In your routes configuration
{
  path: '/center/patients',
  element: <PatientsPage />,
  // Add guard for center users
}
{
  path: '/me/patients',
  element: <PatientsPage />,
  // Add guard for doctors/providers
}
```

### Step 2: Update Navigation

#### For Center Users (Sidebar/Navigation)
```typescript
{
  label: 'Discovery',
  icon: <Search />,
  items: [
    {
      label: 'Search',
      path: '/discovery',
      icon: <Search />,
    },
    {
      label: 'My Patients',
      path: '/center/patients',
      icon: <Users />,
    },
  ]
}
```

#### For Individual Providers
```typescript
{
  label: 'Discovery',
  icon: <Search />,
  items: [
    {
      label: 'Search',
      path: '/discovery',
      icon: <Search />,
    },
    {
      label: 'My Patients',
      path: '/me/patients',
      icon: <Users />,
    },
  ]
}
```

### Step 3: Backend API Endpoints Required

The page expects the following API endpoints to exist:

#### For Centers
```http
GET /centers/patients
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Results per page
- `search` (string, optional): Search term

**Response:**
```typescript
{
  patients: Patient[],
  total: number,
  page: number,
  limit: number,
  hasMore: boolean
}
```

#### For Individual Providers
```http
GET /users/patients
```

**Same parameters and response structure as above**

### Step 4: Patient Type Definition

Add this to your types if not already present:

```typescript
// src/types/patient.ts
export interface Patient {
  id: string;
  userId: string;
  email: string;
  roles: string[];
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  createdAt: string;
  lastVisit?: string;
  appointmentCount?: number;
  status?: 'active' | 'inactive';
}
```

## Usage Examples

### For Healthcare Centers

**URL**: `/center/patients`

Shows all patients assigned to the healthcare center, including:
- Patients who requested appointments and were approved
- Patients added by center staff
- Patients transferred from other centers

### For Individual Doctors/Providers

**URL**: `/me/patients`

Shows personal patient list for the logged-in provider:
- Patients who specifically requested this doctor
- Patients assigned to this doctor by the center
- Personal practice patients

## API Integration Details

### Fetching Patients

The component uses different endpoints based on user role:

```typescript
// Auto-detected based on user role
const isCenter = user?.roles?.includes('healthcare_provider') || 
                 user?.roles?.includes('center_admin');

const endpoint = isCenter ? '/centers/patients' : '/users/patients';

const response = await apiClient.get(endpoint, {
  params: {
    page: 1,
    limit: 100,
    search: searchTerm || undefined,
  }
});
```

### Expected Response Structure

```json
{
  "patients": [
    {
      "id": "patient-uuid-123",
      "userId": "user-uuid-456",
      "email": "patient@example.com",
      "roles": ["patient"],
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "displayName": "John Doe",
        "phoneNumber": "+1-555-123-4567",
        "dateOfBirth": "1990-01-15",
        "gender": "Male",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "country": "United States"
      },
      "createdAt": "2024-01-15T10:00:00Z",
      "lastVisit": "2024-02-01T14:30:00Z",
      "appointmentCount": 5,
      "status": "active"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 100,
  "hasMore": true
}
```

## Features in Detail

### 1. Statistics Cards
- Automatically calculated from patient data
- Shows total, active, and new patients
- Updates in real-time as data changes

### 2. Search Functionality
- Live search as you type (with 500ms debounce)
- Searches across:
  - Display name
  - Email
  - First name
  - Last name
- Case-insensitive

### 3. Patient Cards
Display for each patient:
- Avatar (auto-generated initials)
- Full name and email
- Phone number (if available)
- Age and gender (if date of birth provided)
- Location (city, state)
- Patient since date
- Appointment count
- Status badge (active/inactive)

### 4. Patient Details Dialog
Organized sections showing:
- **Personal Information**: Name, age, gender
- **Contact Information**: Email, phone
- **Address**: Full address details
- **Patient Statistics**: Join date, last visit, appointments, status

## Customization Options

### Adding Export Functionality

The export button is already in place. Implement the export logic:

```typescript
const handleExport = () => {
  // Convert patients to CSV
  const csv = convertToCSV(filteredPatients);
  
  // Download CSV file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `patients-${new Date().toISOString()}.csv`;
  link.click();
};
```

### Adding Filters

Extend the filter functionality:

```typescript
const [filters, setFilters] = useState({
  status: 'all', // all, active, inactive
  gender: 'all', // all, male, female, other
  ageRange: 'all', // all, 0-18, 19-40, 41-60, 60+
});

// Apply filters in the filteredPatients logic
```

### Adding Actions

Add more action buttons per patient:

```typescript
<Button variant="outline" size="sm">
  <Calendar className="h-4 w-4 mr-2" />
  Schedule Appointment
</Button>

<Button variant="outline" size="sm">
  <FileText className="h-4 w-4 mr-2" />
  View Records
</Button>
```

## Example: Complete Routes Setup

```typescript
// src/App.tsx or routes configuration
import { Routes, Route, Navigate } from 'react-router-dom';
import PatientsPage from '@/pages/PatientsPage';
import { useAuth } from '@/hooks/useAuth';

const ProtectedPatientsRoute = () => {
  const { user } = useAuth();
  
  // Redirect based on user role
  if (user?.roles?.includes('healthcare_provider') || user?.roles?.includes('center_admin')) {
    return <Navigate to="/center/patients" replace />;
  } else if (user?.roles?.includes('doctor')) {
    return <Navigate to="/me/patients" replace />;
  }
  
  return <Navigate to="/discovery" replace />;
};

function App() {
  return (
    <Routes>
      {/* Patients routes */}
      <Route path="/center/patients" element={<PatientsPage />} />
      <Route path="/me/patients" element={<PatientsPage />} />
      <Route path="/patients" element={<ProtectedPatientsRoute />} />
      
      {/* Other routes */}
    </Routes>
  );
}
```

## Testing

### Test as Center User
1. Log in with a center admin account
2. Navigate to `/center/patients`
3. Verify you see all center patients
4. Test search functionality
5. Click "View Details" to see patient information

### Test as Individual Provider
1. Log in with a doctor account
2. Navigate to `/me/patients`
3. Verify you see only your patients
4. Test search and details functionality

## Next Steps

1. ✅ Add the routes to your routing configuration
2. ✅ Update navigation menus based on user role
3. ✅ Implement the backend API endpoints
4. ✅ Test with different user roles
5. 🔄 (Optional) Add export functionality
6. 🔄 (Optional) Add additional filters
7. 🔄 (Optional) Add appointment scheduling from patient cards
8. 🔄 (Optional) Add link to patient medical records

## Differences from /requests Page

| Feature | /requests Page | /patients Page |
|---------|---------------|----------------|
| Purpose | Approve/reject pending requests | View approved patients |
| Status | Shows pending, approved, rejected | Shows only approved patients |
| Actions | Approve/Reject buttons | View details, schedule appointments |
| Data Source | Request submissions | Approved patient records |
| User Flow | Request → Approval → Patient | Patient management |

The pages are complementary:
- **Requests Page**: Handles the approval workflow
- **Patients Page**: Manages approved/active patients

Both pages can coexist under Discovery:
- Discovery → Patient Requests (for approvals)
- Discovery → My Patients (for managing approved patients)

The component is fully functional and ready to use!

