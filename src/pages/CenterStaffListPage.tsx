import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { profileApi } from '@/services/profileApi';
import { healthcareCentersService } from '@/services/healthcareCentersService';
import { HealthcareCenter, CenterStaff } from '@/types/healthcare-centers';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RefreshCw } from 'lucide-react';

const CenterStaffListPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [centers, setCenters] = useState<HealthcareCenter[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [selectedCenterStaff, setSelectedCenterStaff] = useState<CenterStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCenters = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Get all centers for the user
      const centersData = await healthcareCentersService.getCentersByUser(user.id);
      setCenters(centersData);
      
      // Auto-select first center if available, otherwise resolve via profile
      if (centersData.length > 0) {
        setSelectedCenterId(centersData[0].id);
      } else {
        try {
          const resolved = await profileApi.getCenterByUserId(user.id);
          const resolvedId = (resolved as any)?.id || (resolved as any)?.centerId;
          if (resolvedId) {
            setSelectedCenterId(resolvedId);
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error('Error loading centers:', err);
      setError('Failed to load centers');
    } finally {
      setLoading(false);
    }
  };

  const loadStaffForCenter = async (centerId: string) => {
    if (!centerId) return;

    try {
      setStaffLoading(true);
      const staff = await healthcareCentersService.getCenterStaff(centerId);
      setSelectedCenterStaff(staff);
    } catch (err) {
      console.error('Error loading staff:', err);
      // Handle 404: try to resolve center via profile and retry once
      const status = (err as any)?.response?.status;
      if (status === 404 && user?.roles?.includes('center')) {
        try {
          const resolved = await profileApi.getCenterByUserId(user.id);
          const resolvedCenterId = (resolved as any)?.id || (resolved as any)?.centerId;
          if (resolvedCenterId && resolvedCenterId !== centerId) {
            setSelectedCenterId(resolvedCenterId);
            const staffRetry = await healthcareCentersService.getCenterStaff(resolvedCenterId);
            setSelectedCenterStaff(staffRetry);
            return;
          }
        } catch (_) {}
      }
      setError('Failed to load staff for selected center');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleCenterChange = (centerId: string) => {
    setSelectedCenterId(centerId);
    loadStaffForCenter(centerId);
  };

  const handleRefresh = async () => {
    if (selectedCenterId) {
      await loadStaffForCenter(selectedCenterId);
      // Show a brief success message
      console.log('Staff list refreshed successfully');
    }
  };

  useEffect(() => {
    loadCenters();
  }, [user?.id]);

  useEffect(() => {
    if (selectedCenterId) {
      loadStaffForCenter(selectedCenterId);
    }
  }, [selectedCenterId]);

  // Respect centerId from query param if provided (e.g., after approval redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const centerIdParam = params.get('centerId');
    if (centerIdParam) {
      setSelectedCenterId(centerIdParam);
      // Load staff immediately for the provided center
      loadStaffForCenter(centerIdParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Auto-refresh when page becomes visible (e.g., when returning from requests page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedCenterId) {
        loadStaffForCenter(selectedCenterId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedCenterId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-lg font-medium text-gray-600">Loading centers...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={loadCenters}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedCenter = centers.find(center => center.id === selectedCenterId);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Center Staff Management</h1>
            </div>

            {/* Center Selection and Refresh */}
            <div className="flex items-center space-x-3">
              <div className="w-80 relative">
                <select
                  id="center-select"
                  value={selectedCenterId}
                  onChange={(e) => handleCenterChange(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200 appearance-none"
                >
                  <option value="">Choose a center...</option>
                  {centers.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={!selectedCenterId || staffLoading}
                className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh staff list"
              >
                <RefreshCw className={`h-4 w-4 ${staffLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {!selectedCenterId ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Center Selected</h3>
              <p className="text-gray-600">Please select a center from the dropdown above to view staff members.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Selected Center Info */}
            {selectedCenter && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedCenter.name}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                        {selectedCenter.type}
                      </span>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-xs font-medium">{selectedCenter.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Staff List */}
            {staffLoading ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="text-lg font-semibold text-gray-700">Loading staff...</div>
                  <p className="text-gray-500 text-sm">Please wait while we fetch the data</p>
                </div>
              </div>
            ) : selectedCenterStaff.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No Staff Members</h3>
                  <p className="text-gray-600 text-sm">This center doesn't have any staff members yet.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Staff Members</h3>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                    {selectedCenterStaff.length} member{selectedCenterStaff.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid gap-4">
                  {selectedCenterStaff.map((member) => {
                    const displayName = member.user.profile?.displayName || 
                                      (member.user.profile?.firstName && member.user.profile?.lastName 
                                        ? `${member.user.profile.firstName} ${member.user.profile.lastName}` 
                                        : member.user.email.split('@')[0]);
                    const initials = member.user.profile?.firstName?.[0] || 
                                   member.user.profile?.displayName?.[0] || 
                                   member.user.email[0].toUpperCase();
                    
                    return (
                      <div key={member.id} className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                                {initials}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                                {displayName}
                              </h4>
                              <p className="text-gray-600 text-sm mb-1">{member.user.email}</p>
                              {member.user.profile?.specialization && (
                                <div className="flex items-center space-x-2">
                                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-xs font-medium text-blue-600">
                                    {member.user.profile.specialization}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CenterStaffListPage;
