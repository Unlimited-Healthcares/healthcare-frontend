import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApprovedProviders } from '@/hooks/useApprovedProviders';
import { RefreshCw } from 'lucide-react';

/**
 * Test component to demonstrate the approved providers integration
 * This can be used for testing the API integration
 */
export const ApprovedProvidersTest: React.FC = () => {
  const { doctors, centers, allProviders, loading, error, refetch, totalCount } = useApprovedProviders();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Approved Providers Test</span>
          <Button onClick={refetch} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{doctors.length}</div>
              <div className="text-sm text-blue-700">Doctors</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{centers.length}</div>
              <div className="text-sm text-green-700">Centers</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{totalCount}</div>
              <div className="text-sm text-purple-700">Total</div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading approved providers...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-600">
              <p className="font-semibold">Error: {error}</p>
              <p className="text-sm mt-2">Check console for details</p>
            </div>
          )}

          {/* Data Display */}
          {!loading && !error && (
            <div className="space-y-6">
              {/* Raw Data */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Raw API Response</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-64">
                  {JSON.stringify({ doctors, centers, allProviders, totalCount }, null, 2)}
                </pre>
              </div>

              {/* Doctors List */}
              {doctors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Approved Doctors</h3>
                  <div className="space-y-2">
                    {doctors.map((doctorProvider) => {
                      const doctor = doctorProvider.provider;
                      if (!doctor) return null;
                      
                      return (
                        <div key={doctorProvider.id} className="p-3 border rounded-lg">
                          <div className="font-semibold">
                            Dr. {doctor.profile.firstName} {doctor.profile.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {doctor.profile.specialization || 'General Practice'} • 
                            Status: {doctorProvider.status} • 
                            Approved: {new Date(doctorProvider.approvedAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Centers List */}
              {centers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Approved Centers</h3>
                  <div className="space-y-2">
                    {centers.map((centerProvider) => {
                      const center = centerProvider.center;
                      if (!center) return null;
                      
                      return (
                        <div key={centerProvider.id} className="p-3 border rounded-lg">
                          <div className="font-semibold">{center.name}</div>
                          <div className="text-sm text-gray-600">
                            {center.centerType || 'Healthcare Center'} • 
                            Status: {centerProvider.status} • 
                            Approved: {new Date(centerProvider.approvedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{center.address}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {totalCount === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">👩‍⚕️</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Approved Providers</h3>
                  <p className="text-gray-600">
                    This patient hasn't been approved by any doctors or centers yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
