# Profile Management System

This directory contains the comprehensive profile management system for the healthcare frontend application. The system supports different user roles with appropriate forms and data management.

## Components

### 1. IndividualProfileForm.tsx
Handles profile management for individual users (patients, doctors, nurses, staff).

**Features:**
- Personal information form (name, phone, address, etc.)
- Professional information for doctors (specialization, license, experience)
- Form validation using Zod schema
- Profile completion tracking
- Real-time form validation
- Responsive design

**Props:**
- `user`: Current user object
- `profile`: User profile data
- `onProfileUpdate`: Callback for profile updates
- `isEditing`: Edit mode state
- `onEditToggle`: Toggle edit mode

### 2. CenterProfileForm.tsx
Handles profile management for healthcare centers.

**Features:**
- Center information form (name, type, address, hours, etc.)
- Center type selection with dynamic loading
- Operating hours management
- Center image URL support
- Profile completion tracking
- Form validation using Zod schema

**Props:**
- `user`: Current user object
- `center`: Center profile data
- `onCenterUpdate`: Callback for center updates
- `isEditing`: Edit mode state
- `onEditToggle`: Toggle edit mode

## Types

### profile.ts
Contains all TypeScript interfaces and types for the profile system:

- `BaseUserProfile`: Base profile interface
- `PatientProfile`: Patient-specific profile
- `DoctorProfile`: Doctor-specific profile with professional fields
- `CenterProfile`: Center profile interface
- `CenterType`: Enum for center types
- `CreateProfileDto`: API request DTO for profile creation/update
- `CreateCenterDto`: API request DTO for center creation
- `ProfileFormData`: Form data interface
- `CenterFormData`: Center form data interface
- `GENDER_OPTIONS`: Gender selection options
- `PROFILE_REQUIREMENTS`: Role-based field requirements

## Services

### profileApi.ts
API service for profile management:

**Individual Profile Methods:**
- `getCurrentUser()`: Get current user with profile
- `getUserProfile()`: Get user profile
- `createOrUpdateProfile()`: Create or update profile
- `getUserById()`: Get user by ID (admin/doctor/staff)

**Center Profile Methods:**
- `createCenter()`: Create new center
- `getCenterByUserId()`: Get center by user ID
- `getCenterById()`: Get center by ID
- `updateCenter()`: Update center information
- `getCenterTypes()`: Get available center types

**Helper Functions:**
- `isCenterUser()`: Check if user is a center
- `calculateProfileCompletion()`: Calculate completion percentage
- `getMissingFields()`: Get missing required fields

## Hooks

### useProfile.ts
Custom hook for profile management:

**Features:**
- Automatic profile data loading
- Profile completion tracking
- Error handling
- Update methods for both individual and center profiles
- Loading states

**Return Values:**
- `profile`: Individual user profile
- `center`: Center profile
- `isLoading`: Loading state
- `error`: Error message
- `completionPercentage`: Profile completion percentage
- `missingFields`: Array of missing required fields
- `refreshProfile()`: Refresh profile data
- `updateProfile()`: Update individual profile
- `updateCenter()`: Update center profile

## Usage

### Basic Usage

```tsx
import { useProfile } from '@/hooks/useProfile'
import IndividualProfileForm from '@/components/profile/IndividualProfileForm'
import CenterProfileForm from '@/components/profile/CenterProfileForm'

function ProfilePage() {
  const { user } = useAuth()
  const {
    profile,
    center,
    isLoading,
    error,
    completionPercentage,
    missingFields,
    updateProfile,
    updateCenter
  } = useProfile(user)

  const isCenter = user?.roles?.includes('center')

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {isCenter ? (
        <CenterProfileForm
          user={user}
          center={center}
          onCenterUpdate={updateCenter}
          isEditing={isEditing}
          onEditToggle={setIsEditing}
        />
      ) : (
        <IndividualProfileForm
          user={user}
          profile={profile}
          onProfileUpdate={updateProfile}
          isEditing={isEditing}
          onEditToggle={setIsEditing}
        />
      )}
    </div>
  )
}
```

### Form Validation

The forms use Zod schemas for validation:

```tsx
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  // ... other fields
})
```

### API Integration

The system integrates with the backend API at `https://api.unlimtedhealth.com/api`:

- **Authentication**: Uses Bearer token authentication
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Proper loading states for better UX
- **Toast Notifications**: Success/error notifications using react-hot-toast

## Role-Based Features

### Patient Profile
- Basic personal information
- Contact details
- Address information
- Medical preferences

### Doctor Profile
- All patient profile fields
- Professional information (specialization, license, experience)
- Medical credentials

### Center Profile
- Center name and type
- Address and contact information
- Operating hours
- Center image
- Service information

## Profile Completion

The system tracks profile completion with:
- Real-time percentage calculation
- Missing field identification
- Progress bars
- Completion recommendations

## Security Features

- Form validation on both client and server
- Secure API communication
- Input sanitization
- Error boundary handling
- HIPAA compliance considerations

## Styling

The components use:
- Tailwind CSS for styling
- Radix UI components for accessibility
- Responsive design
- Modern UI patterns
- Consistent color scheme

## Testing

The profile system includes:
- TypeScript type safety
- Form validation testing
- API error handling
- Loading state management
- User experience testing

## Future Enhancements

- Avatar upload functionality
- Profile image cropping
- Advanced validation rules
- Profile templates
- Bulk profile operations
- Profile analytics
- Export/import functionality
