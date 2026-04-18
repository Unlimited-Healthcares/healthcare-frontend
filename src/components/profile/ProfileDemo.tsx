import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Building2, Stethoscope, Users } from 'lucide-react'
import IndividualProfileForm from './IndividualProfileForm'
import CenterProfileForm from './CenterProfileForm'

// Mock data for demonstration
const mockPatient = {
  id: '1',
  email: 'patient@example.com',
  roles: ['patient'],
  displayId: 'P001',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

const mockDoctor = {
  id: '2',
  email: 'doctor@example.com',
  roles: ['doctor'],
  displayId: 'D001',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

const mockCenter = {
  id: '3',
  email: 'admin@hospital.com',
  roles: ['center'],
  displayId: 'C001',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

const mockPatientProfile = {
  id: 'profile-1',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  phone: '+1-555-0123',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  address: '123 Main St, City, State 12345',
  avatar: 'https://example.com/avatar.jpg',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

const mockDoctorProfile = {
  id: 'profile-2',
  firstName: 'Dr. Sarah',
  lastName: 'Wilson',
  displayName: 'Dr. Sarah Wilson',
  phone: '+1-555-0456',
  dateOfBirth: '1985-03-15',
  gender: 'female',
  address: '456 Oak Street, Springfield, IL 62701',
  specialization: 'Cardiology',
  licenseNumber: 'MD123456',
  experience: '8 years',
  avatar: 'https://example.com/doctor-avatar.jpg',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

const mockCenterProfile = {
  id: 'center-1',
  name: 'Springfield Medical Center',
  type: 'hospital',
  address: '789 Healthcare Blvd, Springfield, IL 62701',
  phone: '+1-555-0456',
  email: 'info@springfieldmedical.com',
  hours: '24/7 Emergency, 6:00 AM - 10:00 PM General Services',
  businessRegistrationNumber: 'RC1234567',
  businessRegistrationDocUrl: 'https://example.com/doc.pdf',
  displayId: 'H001',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

const ProfileDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('patient')
  const [isEditing, setIsEditing] = useState(false)

  const handleProfileUpdate = (updatedProfile: any) => {
    console.log('Profile updated:', updatedProfile)
  }

  const handleCenterUpdate = (updatedCenter: any) => {
    console.log('Center updated:', updatedCenter)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Profile Management System Demo
        </h1>
        <p className="text-gray-600">
          Interactive demonstration of role-based profile management
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patient" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Patient Profile
          </TabsTrigger>
          <TabsTrigger value="doctor" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Doctor Profile
          </TabsTrigger>
          <TabsTrigger value="center" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Center Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patient" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Patient Profile Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge variant="secondary" className="mb-2">Role: Patient</Badge>
                <p className="text-sm text-gray-600">
                  This demonstrates the patient profile form with basic personal information fields.
                </p>
              </div>
              <IndividualProfileForm
                user={mockPatient}
                profile={mockPatientProfile}
                onProfileUpdate={handleProfileUpdate}
                isEditing={isEditing}
                onEditToggle={setIsEditing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-green-600" />
                Doctor Profile Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge variant="secondary" className="mb-2">Role: Doctor</Badge>
                <p className="text-sm text-gray-600">
                  This demonstrates the doctor profile form with professional information fields including specialization, practice number, and experience.
                </p>
              </div>
              <IndividualProfileForm
                user={mockDoctor}
                profile={mockDoctorProfile}
                onProfileUpdate={handleProfileUpdate}
                isEditing={isEditing}
                onEditToggle={setIsEditing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="center" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Center Profile Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge variant="secondary" className="mb-2">Role: Center</Badge>
                <p className="text-sm text-gray-600">
                  This demonstrates the center profile form for healthcare facilities with business information fields.
                </p>
              </div>
              <CenterProfileForm
                user={mockCenter}
                center={mockCenterProfile}
                onCenterUpdate={handleCenterUpdate}
                isEditing={isEditing}
                onEditToggle={setIsEditing}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Demo Features</h4>
              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                <li>• Role-based form rendering (Patient, Doctor, Center)</li>
                <li>• Real-time form validation with Zod schemas</li>
                <li>• Profile completion tracking and progress bars</li>
                <li>• Responsive design with modern UI components</li>
                <li>• Professional fields for doctors (specialization, license, experience)</li>
                <li>• Center-specific fields (type, hours, business information)</li>
                <li>• Edit mode with save/cancel functionality</li>
                <li>• Error handling and user feedback</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileDemo
