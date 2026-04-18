import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useApprovedProviders } from '@/hooks/useApprovedProviders';

interface ApprovedProvidersSummaryProps {
  className?: string;
}

export const ApprovedProvidersSummary: React.FC<ApprovedProvidersSummaryProps> = ({ className }) => {
  const navigate = useNavigate();
  const { doctors, centers, loading, error, totalCount } = useApprovedProviders();

  const handleDoctorsClick = () => {
    navigate('/me/doctors');
  };

  const handleCentersClick = () => {
    navigate('/me/centers');
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Approved Providers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Approved Providers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Approved Providers</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="text-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all"
            onClick={handleDoctorsClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDoctorsClick();
              }
            }}
            aria-label="View approved doctors"
          >
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-900">{doctors.length}</div>
            <div className="text-sm text-blue-700">Practitioners</div>
          </div>
          <div
            className="text-center p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 hover:shadow-md transition-all"
            onClick={handleCentersClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCentersClick();
              }
            }}
            aria-label="View approved centers"
          >
            <Building2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-900">{centers.length}</div>
            <div className="text-sm text-green-700">Approved Centers</div>
          </div>
        </div>

        {totalCount === 0 && (
          <div className="text-center py-4 mt-4">
            <p className="text-sm text-gray-600 mb-2">No approved providers yet</p>
            <p className="text-xs text-gray-500">Send requests to doctors and centers to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
