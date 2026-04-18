import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { calculateProfileCompletion, getMissingFields } from '@/services/profileApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ProfileCompletionWidgetProps {
  hideButton?: boolean;
}

export const ProfileCompletionWidget: React.FC<ProfileCompletionWidgetProps> = ({ hideButton }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const completion = calculateProfileCompletion(profile, user.roles || []);
  const missingFields = getMissingFields(profile, user.roles || []);

  if (completion === 100) return null;

  // Map camelCase fields to readable names
  const fieldNames: Record<string, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
    displayName: 'Display Name',
    phone: 'Phone Number',
    avatar: 'Profile Picture',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    address: 'Home Address',
    city: 'City',
    state: 'State/Province',
    country: 'Country',
    postalCode: 'ZIP/Postal Code',
    bloodGroup: 'Blood Group',
    genotype: 'Genotype',
    height: 'Height',
    weight: 'Weight',
    governmentIdType: 'ID Document Type',
    governmentIdNumber: 'ID Document Number',
    governmentIdDoc: 'ID Document Upload',
    specialization: 'Medical Specialization',
    licenseNumber: 'Practice License Number',
    experience: 'Years of Experience',
    businessRegistrationNumber: 'Business Reg. Number',
    businessRegistrationDocUrl: 'Business Reg. Document',
    hours: 'Operating Hours',
    email: 'Business Email',
    name: 'Center Name',
  };

  return (
    <Card className="border-blue-200 bg-white/50 backdrop-blur-sm shadow-lg overflow-hidden relative group transition-all hover:shadow-xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <AlertCircle className="h-24 w-24 text-blue-600" />
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
              {completion}%
            </span>
            Profile Completion
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold uppercase tracking-wider text-[10px]">
            Action Required
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-black text-gray-500 uppercase tracking-tighter">
            <span>Progress</span>
            <span>{completion}%</span>
          </div>
          <Progress value={completion} className="h-3 bg-blue-100" />
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          <h4 className="text-xs font-black text-gray-900 dark:text-white mb-3 uppercase tracking-widest flex items-center gap-2">
            Remaining Data to Fill:
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {missingFields.slice(0, 10).map((field) => (
              <Badge 
                key={field} 
                variant="secondary" 
                className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 font-medium px-2 py-1 flex items-center gap-1.5"
              >
                <div className="w-1 h-1 rounded-full bg-blue-500" />
                {fieldNames[field] || field}
              </Badge>
            ))}
            {missingFields.length > 10 && (
              <Badge variant="outline" className="text-gray-400 text-[10px]">
                + {missingFields.length - 10} more fields
              </Badge>
            )}
          </div>
        </div>

        {!hideButton && (
          <Button 
            onClick={() => navigate('/profile')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-md shadow-blue-200 group"
          >
            COMPLETE PROFILE NOW
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
        
        <p className="text-[10px] text-center text-gray-400 font-medium flex items-center justify-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          A complete profile unlocks 100% of platform features
        </p>
      </CardContent>
    </Card>
  );
};
