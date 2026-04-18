import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApprovedProviders } from '@/hooks/useApprovedProviders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const PatientDebugInfo: React.FC = () => {
  const { user } = useAuth();
  const { error } = useApprovedProviders();

  if (!user) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Debug: No User Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700">User is not authenticated or user data is not available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">Debug: Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <strong>User ID:</strong> 
          <Badge variant="outline" className="ml-2 font-mono">
            {user.id || 'Not available'}
          </Badge>
        </div>
        
        <div>
          <strong>Email:</strong> 
          <span className="ml-2 text-gray-700">{user.email || 'Not available'}</span>
        </div>
        
        <div>
          <strong>Roles:</strong> 
          <div className="flex flex-wrap gap-1 mt-1">
            {user.roles?.map((role, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {role}
              </Badge>
            )) || <span className="text-gray-500">No roles</span>}
          </div>
        </div>
        
        <div>
          <strong>Primary Role:</strong> 
          <Badge variant="default" className="ml-2">
            {user.roles?.[0] || 'Not available'}
          </Badge>
        </div>
        
        <div className="pt-2 border-t border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> The app now resolves patientId from the userId before calling providers.
          </p>
          {error && (
            <p className="text-xs text-red-600 mt-1">
              {error}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
