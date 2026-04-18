# 🚀 Discovery & Matching System Integration Plan

## 📋 Current Frontend Analysis

### ✅ **What You Already Have**

#### **1. Core Infrastructure**
- **API Client**: `src/services/apiClient.ts` - Configured for `https://api.unlimtedhealth.com/api`
- **Authentication**: JWT-based with automatic token handling
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Routing**: React Router with protected routes

#### **2. Existing Components**
- **Profile System**: 
  - `IndividualProfileForm.tsx` - Complete profile management
  - `CenterProfileForm.tsx` - Center profile management
  - Profile completion tracking and validation
- **Appointment System**:
  - `BookAppointmentModal.tsx` - Multi-step appointment booking
  - `AppointmentManagement.tsx` - Full appointment lifecycle
  - Provider selection and time slot management
- **Notification System**:
  - `NotificationCenter.tsx` - Real-time notifications
  - `useBackendNotifications.ts` - Notification hooks
- **Healthcare Centers**:
  - `Centers.tsx` - Center discovery page
  - `CenterDetails.tsx` - Center information display
  - `BookingFlow.tsx` - Center-specific booking

#### **3. Services Layer**
- **User Management**: `userApi.ts` - Profile CRUD operations
- **Appointments**: `appointmentService.ts` - Complete appointment management
- **Notifications**: `backendNotificationService.ts` - Real-time notifications
- **Centers**: `healthcareCentersService.ts` - Center management

#### **4. UI Components**
- **Shadcn/UI**: Complete component library
- **TailwindCSS**: Styling system
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React hooks and context

---

## 🎯 **What Needs to Be Built**

### **Phase 1: Discovery Search Interface** 🆕

#### **1.1 New Components Needed**
```
src/components/discovery/
├── SearchPage.tsx              # Main discovery page
├── SearchFilters.tsx           # Advanced search filters
├── SearchResults.tsx           # Results display
├── UserCard.tsx                # Doctor/User profile cards
├── CenterCard.tsx              # Healthcare center cards
├── SearchPagination.tsx        # Results pagination
└── DiscoveryWidget.tsx         # Dashboard widget
```

#### **1.2 New Pages Needed**
```
src/pages/
├── DiscoveryPage.tsx           # Main discovery page
├── DoctorProfilePage.tsx       # Public doctor profiles
├── CenterProfilePage.tsx       # Public center profiles
└── ConnectionsPage.tsx         # User connections
```

### **Phase 2: Request Management System** 🆕

#### **2.1 New Components Needed**
```
src/components/requests/
├── RequestDashboard.tsx        # Request management
├── RequestModal.tsx            # Send request modal
├── RequestList.tsx             # Request listing
├── RequestCard.tsx             # Individual request cards
└── RequestActions.tsx          # Approve/reject actions
```

#### **2.2 New Pages Needed**
```
src/pages/
├── RequestsPage.tsx            # Request management page
└── ConnectionsPage.tsx         # User connections
```

### **Phase 3: Enhanced Profile System** 🔄

#### **3.1 Extend Existing Components**
- **IndividualProfileForm.tsx**: Add discovery-specific fields
- **CenterProfileForm.tsx**: Add discovery-specific fields
- **ProfilePage.tsx**: Add discovery settings

#### **3.2 New Profile Fields Needed**
```typescript
// Add to existing profile types
interface DiscoveryProfile {
  // Professional Information
  specialization: string;
  qualifications: string[];
  experience: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: { lat: number; lng: number };
  };
  
  // Availability
  availability: {
    schedule: Record<string, any>;
    timezone: string;
  };
  
  // Privacy Settings
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'professional_only';
    dataSharing: {
      allowPatientRequests: boolean;
      allowCenterInvitations: boolean;
      allowCollaboration: boolean;
    };
  };
}
```

### **Phase 4: Invitation System** 🆕

#### **4.1 New Components Needed**
```
src/components/invitations/
├── InvitationModal.tsx         # Send invitation modal
├── InvitationList.tsx          # Pending invitations
├── InvitationCard.tsx          # Individual invitation cards
└── InvitationActions.tsx       # Accept/decline actions
```

---

## 🔧 **Implementation Roadmap**

### **Week 1: Discovery Search Interface**

#### **Day 1-2: Core Discovery Components**
```typescript
// 1. Create discovery service
// src/services/discoveryService.ts
export class DiscoveryService {
  // User search
  async searchUsers(params: SearchParams): Promise<UserSearchResponse>
  async getUserProfile(userId: string): Promise<UserProfile>
  
  // Center search  
  async searchCenters(params: CenterSearchParams): Promise<CenterSearchResponse>
  async getCenterDetails(centerId: string): Promise<CenterDetails>
  
  // Location services
  async getNearbyCenters(lat: number, lng: number, radius: number): Promise<Center[]>
}
```

#### **Day 3-4: Search Interface**
```typescript
// 2. Create SearchPage component
// src/pages/DiscoveryPage.tsx
export const DiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    type: 'doctor',
    specialty: '',
    location: '',
    radius: 50,
    page: 1,
    limit: 20
  });
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search functionality
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await discoveryService.searchUsers(searchParams);
      setResults(response.users);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="discovery-page">
      <SearchFilters 
        params={searchParams}
        onChange={setSearchParams}
        onSearch={handleSearch}
      />
      <SearchResults 
        results={results}
        loading={loading}
        onRequest={(user) => openRequestModal(user)}
        onViewProfile={(userId) => viewProfile(userId)}
      />
    </div>
  );
};
```

#### **Day 5: Integration & Testing**
- Add discovery routes to `App.tsx`
- Update navigation menu
- Test search functionality

### **Week 2: Request Management System**

#### **Day 1-2: Request Service**
```typescript
// src/services/requestService.ts
export class RequestService {
  // Request management
  async createRequest(requestData: CreateRequestData): Promise<Request>
  async getReceivedRequests(status?: string): Promise<Request[]>
  async getSentRequests(status?: string): Promise<Request[]>
  async respondToRequest(requestId: string, action: 'approve' | 'reject'): Promise<Request>
  async cancelRequest(requestId: string): Promise<void>
}
```

#### **Day 3-4: Request Components**
```typescript
// src/components/requests/RequestDashboard.tsx
export const RequestDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState<Request[]>([]);
  
  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await requestService.respondToRequest(requestId, action);
      loadRequests(); // Refresh
    } catch (error) {
      console.error('Failed to respond to request:', error);
    }
  };
  
  return (
    <div className="request-dashboard">
      <RequestTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <RequestList 
        requests={requests}
        onApprove={(id) => handleRequestAction(id, 'approve')}
        onReject={(id) => handleRequestAction(id, 'reject')}
      />
    </div>
  );
};
```

#### **Day 5: Integration**
- Add request routes
- Update notification system to handle requests
- Test request workflow

### **Week 3: Enhanced Profile System**

#### **Day 1-2: Extend Profile Types**
```typescript
// src/types/discovery.ts
export interface DiscoveryProfile extends UserProfile {
  specialization?: string;
  qualifications?: string[];
  experience?: number;
  location?: LocationInfo;
  availability?: AvailabilityInfo;
  privacySettings?: PrivacySettings;
}
```

#### **Day 3-4: Update Profile Forms**
```typescript
// Extend IndividualProfileForm.tsx
const IndividualProfileForm: React.FC<IndividualProfileFormProps> = ({ ... }) => {
  // Add discovery-specific fields
  const [discoveryProfile, setDiscoveryProfile] = useState<DiscoveryProfile>({
    specialization: '',
    qualifications: [],
    experience: 0,
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: { lat: 0, lng: 0 }
    },
    privacySettings: {
      profileVisibility: 'public',
      dataSharing: {
        allowPatientRequests: true,
        allowCenterInvitations: true,
        allowCollaboration: true
      }
    }
  });
  
  // Add discovery fields to form
  return (
    <form onSubmit={handleSubmit}>
      {/* Existing fields */}
      
      {/* Discovery fields */}
      <Card>
        <CardHeader>
          <CardTitle>Discovery Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Specialization</Label>
              <Select value={discoveryProfile.specialization} onValueChange={setSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Profile Visibility</Label>
              <Select value={discoveryProfile.privacySettings.profileVisibility} onValueChange={setProfileVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="professional_only">Professional Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
```

#### **Day 5: Testing & Validation**
- Test profile updates
- Validate discovery settings
- Test privacy controls

### **Week 4: Invitation System**

#### **Day 1-2: Invitation Service**
```typescript
// src/services/invitationService.ts
export class InvitationService {
  async sendInvitation(invitationData: CreateInvitationData): Promise<Invitation>
  async getPendingInvitations(email: string): Promise<Invitation[]>
  async acceptInvitation(token: string, userData: AcceptInvitationData): Promise<User>
  async declineInvitation(token: string, reason?: string): Promise<void>
}
```

#### **Day 3-4: Invitation Components**
```typescript
// src/components/invitations/InvitationModal.tsx
export const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose, onSend }) => {
  const [invitationData, setInvitationData] = useState<CreateInvitationData>({
    email: '',
    invitationType: 'staff_invitation',
    role: '',
    message: '',
    centerId: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await invitationService.sendInvitation(invitationData);
      onSend(invitationData);
      onClose();
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          {/* Invitation form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

#### **Day 5: Integration & Testing**
- Add invitation routes
- Test invitation workflow
- Test email integration

---

## 🔄 **Complete User Flow Implementation**

### **1. Discovery Flow**
```
User Journey: Patient → Find Doctor → Send Request → Get Approved → Book Appointment
```

#### **Step 1: Search for Doctors**
```typescript
// src/pages/DiscoveryPage.tsx
const DiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    type: 'doctor',
    specialty: 'cardiology',
    location: 'New York',
    radius: 25
  });
  
  const handleSearch = async () => {
    const results = await discoveryService.searchUsers(searchParams);
    // Display results
  };
  
  return (
    <div>
      <SearchFilters params={searchParams} onChange={setSearchParams} onSearch={handleSearch} />
      <SearchResults results={results} onRequest={openRequestModal} />
    </div>
  );
};
```

#### **Step 2: Send Connection Request**
```typescript
// src/components/requests/RequestModal.tsx
const RequestModal: React.FC<RequestModalProps> = ({ recipient, onSend }) => {
  const [requestData, setRequestData] = useState({
    recipientId: recipient.id,
    requestType: 'connection',
    message: '',
    metadata: {}
  });
  
  const handleSubmit = async () => {
    await requestService.createRequest(requestData);
    onSend(requestData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Request form */}
    </form>
  );
};
```

#### **Step 3: Approve Request**
```typescript
// src/components/requests/RequestCard.tsx
const RequestCard: React.FC<RequestCardProps> = ({ request, onApprove, onReject }) => {
  const handleApprove = async () => {
    await requestService.respondToRequest(request.id, 'approve');
    onApprove(request.id);
  };
  
  const handleReject = async () => {
    await requestService.respondToRequest(request.id, 'reject');
    onReject(request.id);
  };
  
  return (
    <div className="request-card">
      <div className="request-info">
        <h3>{request.senderName}</h3>
        <p>{request.message}</p>
      </div>
      <div className="request-actions">
        <Button onClick={handleApprove}>Approve</Button>
        <Button onClick={handleReject} variant="outline">Reject</Button>
      </div>
    </div>
  );
};
```

#### **Step 4: Book Appointment**
```typescript
// Reuse existing BookAppointmentModal.tsx
// Just need to pass the connected doctor as default provider
const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ 
  isOpen, 
  onClose, 
  connectedDoctor 
}) => {
  // Pre-populate provider if connected
  useEffect(() => {
    if (connectedDoctor) {
      setSelectedProvider(connectedDoctor.id);
    }
  }, [connectedDoctor]);
  
  // Rest of existing appointment booking logic
};
```

### **2. Center Invitation Flow**
```
User Journey: Center Staff → Invite Doctor → Doctor Accepts → Doctor Joins Center → Can Book Appointments
```

#### **Step 1: Send Invitation**
```typescript
// src/components/invitations/InvitationModal.tsx
const InvitationModal: React.FC<InvitationModalProps> = ({ centerId, onSend }) => {
  const [invitationData, setInvitationData] = useState({
    email: '',
    invitationType: 'staff_invitation',
    role: 'doctor',
    message: 'Join our healthcare center',
    centerId: centerId
  });
  
  const handleSubmit = async () => {
    await invitationService.sendInvitation(invitationData);
    onSend(invitationData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Invitation form */}
    </form>
  );
};
```

#### **Step 2: Accept Invitation**
```typescript
// src/pages/InvitationAcceptPage.tsx
const InvitationAcceptPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    password: '',
    phone: ''
  });
  
  const handleAccept = async () => {
    await invitationService.acceptInvitation(token, userData);
    // Redirect to dashboard
  };
  
  return (
    <form onSubmit={handleAccept}>
      {/* User registration form */}
    </form>
  );
};
```

---

## 📁 **File Structure Changes**

### **New Files to Create**
```
src/
├── components/
│   ├── discovery/
│   │   ├── SearchPage.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── SearchResults.tsx
│   │   ├── UserCard.tsx
│   │   ├── CenterCard.tsx
│   │   └── DiscoveryWidget.tsx
│   ├── requests/
│   │   ├── RequestDashboard.tsx
│   │   ├── RequestModal.tsx
│   │   ├── RequestList.tsx
│   │   ├── RequestCard.tsx
│   │   └── RequestActions.tsx
│   └── invitations/
│       ├── InvitationModal.tsx
│       ├── InvitationList.tsx
│       ├── InvitationCard.tsx
│       └── InvitationActions.tsx
├── pages/
│   ├── DiscoveryPage.tsx
│   ├── DoctorProfilePage.tsx
│   ├── CenterProfilePage.tsx
│   ├── ConnectionsPage.tsx
│   ├── RequestsPage.tsx
│   └── InvitationAcceptPage.tsx
├── services/
│   ├── discoveryService.ts
│   ├── requestService.ts
│   └── invitationService.ts
└── types/
    └── discovery.ts
```

### **Files to Modify**
```
src/
├── App.tsx                     # Add new routes
├── components/
│   ├── layout/
│   │   └── MainLayout.tsx      # Update navigation
│   ├── profile/
│   │   └── IndividualProfileForm.tsx  # Add discovery fields
│   └── notifications/
│       └── NotificationCenter.tsx     # Add request notifications
└── services/
    └── apiClient.ts            # Add discovery endpoints
```

---

## 🚀 **Quick Start Implementation**

### **Step 1: Create Discovery Service**
```typescript
// src/services/discoveryService.ts
import apiClient from './apiClient';

export class DiscoveryService {
  async searchUsers(params: SearchParams): Promise<UserSearchResponse> {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/users/search?${queryString}`);
  }
  
  async searchCenters(params: CenterSearchParams): Promise<CenterSearchResponse> {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/centers/search?${queryString}`);
  }
}

export const discoveryService = new DiscoveryService();
```

### **Step 2: Add Routes to App.tsx**
```typescript
// src/App.tsx
import DiscoveryPage from '@/pages/DiscoveryPage';
import ConnectionsPage from '@/pages/ConnectionsPage';
import RequestsPage from '@/pages/RequestsPage';

// Add these routes to your existing Routes component
<Route path="/discovery" element={<ProtectedRoute><DiscoveryPage /></ProtectedRoute>} />
<Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
<Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
```

### **Step 3: Update Navigation**
```typescript
// src/components/layout/MainLayout.tsx
const navigationItems = [
  // Existing items...
  { icon: 'search', label: 'Find Doctors', href: '/discovery' },
  { icon: 'users', label: 'Connections', href: '/connections' },
  { icon: 'inbox', label: 'Requests', href: '/requests' },
];
```

### **Step 4: Test Integration**
```bash
# Test the discovery API
curl -X GET "https://api.unlimtedhealth.com/api/users/search?type=doctor&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test the request API
curl -X POST "https://api.unlimtedhealth.com/api/requests" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId":"user123","requestType":"connection","message":"Hello"}'
```

---

## ✅ **Success Criteria**

### **Phase 1: Discovery Search** ✅
- [ ] Users can search for doctors by specialty and location
- [ ] Users can search for healthcare centers by type and location
- [ ] Search results display with proper filtering
- [ ] Users can view detailed profiles

### **Phase 2: Request Management** ✅
- [ ] Users can send connection requests
- [ ] Users can approve/reject received requests
- [ ] Request status is tracked and updated
- [ ] Notifications are sent for request actions

### **Phase 3: Enhanced Profiles** ✅
- [ ] Profiles include discovery-specific fields
- [ ] Privacy settings control profile visibility
- [ ] Location information is properly stored
- [ ] Professional information is displayed

### **Phase 4: Invitation System** ✅
- [ ] Centers can invite doctors via email
- [ ] Invited users can accept/decline invitations
- [ ] Accepted invitations create user accounts
- [ ] Invited doctors can book appointments at the center

### **Phase 5: Complete Integration** ✅
- [ ] Discovery → Request → Approval → Appointment flow works end-to-end
- [ ] All components are properly integrated
- [ ] Error handling is comprehensive
- [ ] Mobile responsiveness is maintained

---

## 🔧 **Technical Considerations**

### **Performance**
- Implement pagination for search results
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Cache search results appropriately

### **Security**
- Validate all user inputs
- Implement proper authorization checks
- Sanitize user-generated content
- Use HTTPS for all API calls

### **User Experience**
- Implement loading states
- Show progress indicators
- Provide clear error messages
- Maintain consistent UI patterns

### **Testing**
- Unit tests for all new components
- Integration tests for API calls
- End-to-end tests for complete workflows
- Performance testing for search functionality

---

This integration plan provides a comprehensive roadmap for implementing the Discovery & Matching System into your existing healthcare frontend. The system builds on your existing components while adding powerful new discovery and networking capabilities! 🚀
