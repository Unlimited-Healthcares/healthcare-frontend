import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User as UserIcon,
  MapPin,
  GraduationCap,
  Shield,
  Save,
  Clock,
  Loader2,
  Image as ImageIcon,
  Upload,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { GENDER_OPTIONS, SPECIALIZATIONS, type User } from '@/types/discovery';
import { profileApi, calculateProfileCompletion } from '@/services/profileApi';
import { discoveryService } from '@/services/discoveryService';
import toast from 'react-hot-toast';

// Enhanced form validation schema with discovery fields
const enhancedProfileSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  displayName: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  avatar: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),

  // Professional Information
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  experience: z.string().optional(),
  qualifications: z.array(z.string()).optional(),

  // Location Information
  location: z.object({
    address: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  }),

  // Availability
  availability: z.object({
    schedule: z.record(z.any()).optional(),
    timezone: z.string().optional(),
    generalAvailability: z.string().optional(),
    isAvailable: z.boolean().optional()
  }).optional(),

  // Privacy Settings
  privacySettings: z.object({
    profileVisibility: z.enum(['public', 'private', 'professional_only']).optional(),
    dataSharing: z.object({
      allowPatientRequests: z.boolean().optional(),
      allowCenterInvitations: z.boolean().optional(),
      allowCollaboration: z.boolean().optional()
    }).optional(),
    contactPreferences: z.object({
      allowDirectMessages: z.boolean().optional(),
      allowEmailNotifications: z.boolean().optional(),
      allowSmsNotifications: z.boolean().optional()
    }).optional()
  }).optional()
});

type EnhancedProfileFormData = z.infer<typeof enhancedProfileSchema>;

interface EnhancedProfileFormProps {
  user: any;
  profile: any;
  onProfileUpdate: (updatedProfile: any) => void;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
}

const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({
  user,
  profile,
  onProfileUpdate,
  isEditing,
  onEditToggle
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<EnhancedProfileFormData>({
    resolver: zodResolver(enhancedProfileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      displayName: profile?.displayName || '',
      phone: profile?.phone || '',
      avatar: profile?.avatar || '',
      dateOfBirth: profile?.dateOfBirth || '',
      gender: profile?.gender || '',
      address: profile?.address || '',
      specialization: profile?.specialization || '',
      licenseNumber: profile?.licenseNumber || '',
      experience: profile?.experience || '',
      qualifications: profile?.qualifications || [],
      location: profile?.location || {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        coordinates: { lat: 0, lng: 0 }
      },
      availability: profile?.availability || {
        schedule: {},
        timezone: 'UTC',
        generalAvailability: 'Available',
        isAvailable: true
      },
      privacySettings: profile?.privacySettings || {
        profileVisibility: 'public',
        dataSharing: {
          allowPatientRequests: true,
          allowCenterInvitations: true,
          allowCollaboration: true
        },
        contactPreferences: {
          allowDirectMessages: true,
          allowEmailNotifications: true,
          allowSmsNotifications: false
        }
      }
    }
  });

  // Watch form values for completion calculation
  const watchedValues = watch();

  // Calculate profile completion
  useEffect(() => {
    const completion = calculateProfileCompletion(watchedValues, user?.role);
    setCompletionPercentage(completion);
  }, [watchedValues, user?.role]);

  // Handle form submission
  const onSubmit = async (data: EnhancedProfileFormData) => {
    setIsSaving(true);
    try {
      // Prepare basic profile data
      const basicProfileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        phone: data.phone,
        avatar: data.avatar,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        experience: data.experience,
        qualifications: data.qualifications
      };

      // Update basic profile
      const updatedProfile = await profileApi.createOrUpdateProfile(basicProfileData);

      // Update discovery-specific fields
      if (data.location || data.availability || data.privacySettings) {
        const discoveryData: Partial<User> = {};

        if (data.location) {
          discoveryData.location = {
            city: data.location.city || '',
            state: data.location.state || '',
            country: data.location.country || ''
          };
        }

        if (data.availability) {
          discoveryData.availability = {
            timezone: data.availability.timezone || 'UTC',
            generalAvailability: data.availability.generalAvailability || 'Available',
            schedule: data.availability.schedule || {},
            isAvailable: data.availability.isAvailable || false
          };
        }

        if (data.privacySettings) {
          discoveryData.privacySettings = {
            profileVisibility: data.privacySettings.profileVisibility || 'public',
            dataSharing: {
              allowPatientRequests: data.privacySettings.dataSharing?.allowPatientRequests || false,
              allowCenterInvitations: data.privacySettings.dataSharing?.allowCenterInvitations || false,
              allowCollaboration: data.privacySettings.dataSharing?.allowCollaboration || false
            },
            contactPreferences: {
              allowDirectMessages: data.privacySettings.contactPreferences?.allowDirectMessages || false,
              allowEmailNotifications: data.privacySettings.contactPreferences?.allowEmailNotifications || false,
              allowSmsNotifications: data.privacySettings.contactPreferences?.allowSmsNotifications || false
            }
          };
        }

        await discoveryService.updateDiscoveryProfile(discoveryData);
      }

      onProfileUpdate(updatedProfile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit toggle
  const handleEditToggle = () => {
    if (isEditing) {
      reset();
    }
    onEditToggle(!isEditing);
  };

  // Handle qualification changes
  const handleQualificationChange = (value: string) => {
    const qualifications = value.split(',').map(q => q.trim()).filter(q => q);
    setValue('qualifications', qualifications);
  };

  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Profile Completion</h3>
              <p className="text-sm text-gray-600">
                Complete your profile to improve discoverability
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {completionPercentage}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <UserIcon className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
            {!isEditing ? (
              <Button
                type="button"
                size="sm"
                onClick={handleEditToggle}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="text-gray-600 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1.5" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Image Upload - Highlighted at top */}
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  {watchedValues.avatar ? (
                    <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                      <img
                        src={watchedValues.avatar}
                        alt="Profile Avatar"
                        className="h-full w-full rounded-2xl object-cover border-4 border-white shadow-md"
                      />
                      {isEditing && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => setValue('avatar', '')}
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center bg-blue-50/50 text-blue-400 group-hover:border-blue-400 transition-colors">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <Label className="text-sm font-semibold text-gray-700">Profile Picture <span className="text-gray-400 font-normal">(Optional)</span></Label>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto sm:mx-0">
                    Upload a professional photo to enhance your discoverability. PNG or JPG, max 2MB.
                  </p>
                  {isEditing && (
                    <div className="flex items-center gap-2 mt-2">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm">
                          <Upload className="h-4 w-4" />
                          {watchedValues.avatar ? 'Change Photo' : 'Upload Photo'}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setValue('avatar', reader.result as string)
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  disabled={!isEditing}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  disabled={!isEditing}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  disabled={!isEditing}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={watch('gender')}
                  onValueChange={(value) => setValue('gender', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option: { value: string; label: string }) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  value={watch('specialization')}
                  onValueChange={(value) => setValue('specialization', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec.toLowerCase()}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  {...register('experience')}
                  disabled={!isEditing}
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications</Label>
              <Input
                id="qualifications"
                placeholder="MD, Board Certified, PhD, etc. (comma-separated)"
                value={watch('qualifications')?.join(', ') || ''}
                onChange={(e) => handleQualificationChange(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Practice Number</Label>
              <Input
                id="licenseNumber"
                {...register('licenseNumber')}
                disabled={!isEditing}
                placeholder="Professional practice number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register('location.address')}
                disabled={!isEditing}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...register('location.city')}
                  disabled={!isEditing}
                  placeholder="City"
                  className={errors.location?.city ? 'border-red-500' : ''}
                />
                {errors.location?.city && (
                  <p className="text-sm text-red-600">{errors.location.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  {...register('location.state')}
                  disabled={!isEditing}
                  placeholder="State"
                  className={errors.location?.state ? 'border-red-500' : ''}
                />
                {errors.location?.state && (
                  <p className="text-sm text-red-600">{errors.location.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  {...register('location.zipCode')}
                  disabled={!isEditing}
                  placeholder="ZIP Code"
                  className={errors.location?.zipCode ? 'border-red-500' : ''}
                />
                {errors.location?.zipCode && (
                  <p className="text-sm text-red-600">{errors.location.zipCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  {...register('location.country')}
                  disabled={!isEditing}
                  placeholder="Country"
                  className={errors.location?.country ? 'border-red-500' : ''}
                />
                {errors.location?.country && (
                  <p className="text-sm text-red-600">{errors.location.country.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={watch('availability.isAvailable') || false}
                onCheckedChange={(checked) => setValue('availability.isAvailable', checked)}
                disabled={!isEditing}
              />
              <Label htmlFor="isAvailable">Currently available for new patients</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={watch('availability.timezone')}
                onValueChange={(value) => setValue('availability.timezone', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="generalAvailability">General Availability</Label>
              <Select
                value={watch('availability.generalAvailability')}
                onValueChange={(value) => setValue('availability.generalAvailability', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Limited">Limited Availability</SelectItem>
                  <SelectItem value="Not Available">Not Available</SelectItem>
                  <SelectItem value="By Appointment Only">By Appointment Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Discovery Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileVisibility">Profile Visibility</Label>
              <Select
                value={watch('privacySettings.profileVisibility')}
                onValueChange={(value) => setValue('privacySettings.profileVisibility', value as any)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can find and view</SelectItem>
                  <SelectItem value="professional_only">Professional Only - Other healthcare professionals</SelectItem>
                  <SelectItem value="private">Private - Only approved connections</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Data Sharing Preferences</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowPatientRequests">Allow patient connection requests</Label>
                    <p className="text-sm text-gray-600">Patients can send you connection requests</p>
                  </div>
                  <Switch
                    id="allowPatientRequests"
                    checked={watch('privacySettings.dataSharing.allowPatientRequests') || false}
                    onCheckedChange={(checked) => setValue('privacySettings.dataSharing.allowPatientRequests', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowCenterInvitations">Allow center staff invitations</Label>
                    <p className="text-sm text-gray-600">Healthcare centers can invite you to join their staff</p>
                  </div>
                  <Switch
                    id="allowCenterInvitations"
                    checked={watch('privacySettings.dataSharing.allowCenterInvitations') || false}
                    onCheckedChange={(checked) => setValue('privacySettings.dataSharing.allowCenterInvitations', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowCollaboration">Allow collaboration requests</Label>
                    <p className="text-sm text-gray-600">Other professionals can request collaboration</p>
                  </div>
                  <Switch
                    id="allowCollaboration"
                    checked={watch('privacySettings.dataSharing.allowCollaboration') || false}
                    onCheckedChange={(checked) => setValue('privacySettings.dataSharing.allowCollaboration', checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom actions removed as they are now at the top */}
      </form>
    </div>
  );
};

export default EnhancedProfileForm;
