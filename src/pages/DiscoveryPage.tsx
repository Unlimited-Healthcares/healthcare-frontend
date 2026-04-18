import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { SearchFilters } from '@/components/discovery/SearchFilters';
import { SearchResults } from '@/components/discovery/SearchResults';
import { RequestModal } from '@/components/requests/RequestModal';
import { SendRequestModal } from '@/components/discovery/SendRequestModal';
import PatientRequestModal from '@/components/requests/PatientRequestModal';
import { discoveryService } from '@/services/discoveryService';
import { integrationsService } from '@/services/integrationsService';
import { SearchParams, User, Center, UserSearchResponse, CenterSearchResponse } from '@/types/discovery';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, X, Search } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerFooter } from '@/components/ui/drawer';

const DiscoveryPage: React.FC = () => {
  const { user, profile } = useAuth();

  // Parse URL parameters
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role') || '';

    // For biotech engineers, the role is already 'biotech_engineer'
    let specialty = params.get('specialty') || '';

    return {
      specialty: specialty,
      type: (params.get('type') as any) || (role === 'biotech_engineer' ? 'biotech_engineer' : 'doctor'),
      service: params.get('service') || '',
      city: params.get('city') || '',
      country: params.get('country') || '',
      search: params.get('search') || ''
    };
  };

  const urlParams = getUrlParams();

  const [searchParams, setSearchParams] = useState<SearchParams>({
    type: urlParams.type,
    specialty: urlParams.specialty,
    service: urlParams.service,
    city: urlParams.city,
    state: '',
    country: urlParams.country,
    search: urlParams.search,
    page: 1,
    limit: 20,
    experience: 0,
    availability: false
  });

  const [results, setResults] = useState<(User | Center)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRecipient, setSelectedRecipient] = useState<User | Center | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPatientRequestModal, setShowPatientRequestModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // New states for multi-select
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  // Get user role for filtering
  const userRole = user?.roles?.[0] || 'patient';

  // Filter out incomplete profiles - only show users with displayName and specialty
  const filteredResults = results.filter((item) => {
    if (!item || !item.publicId) return false;

    // For centers, always show them (they have different requirements)
    if (searchParams.type === 'center') {
      return true;
    }

    // For all user types (doctor, specialist, practitioner, patient), apply the same validation
    const user = item as User;

    const hasValidDisplayName = user.displayName &&
      user.displayName !== 'Unknown' &&
      user.displayName !== 'Unknown User' &&
      user.displayName.trim() !== '0' &&
      user.displayName.trim().length > 1;

    if (searchParams.type === 'patient') {
      return hasValidDisplayName;
    }

    const hasValidSpecialty = user.specialty &&
      user.specialty !== 'undefined' &&
      user.specialty.trim().length > 0;

    return hasValidDisplayName && hasValidSpecialty;
  });

  // Auto-perform search when type, specialty or service changes for smoother UX
  useEffect(() => {
    if (searchParams.type) {
      performSearch(searchParams);
    }
  }, [searchParams.type, searchParams.specialty, searchParams.service]);

  // Perform search
  const performSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setSelectedIds([]); // Clear selection on new search

    try {
      if (params.type === 'center') {
        const response: CenterSearchResponse = await discoveryService.searchCenters({
          type: params.specialty,
          city: params.city,
          state: params.state,
          country: params.country,
          service: params.service,
          page: params.page,
          limit: params.limit
        });

        console.log('Center Search Response:', response);
        console.log('Center Results:', response.centers);

        setResults(response.centers);
        setTotalPages(response.totalPages);
      } else {
        const response: UserSearchResponse = await discoveryService.searchUsers({
          ...params,
          // If multiple services are requested, we might need a custom handling 
          // but for now, we'll pass the string and assume backend handles it
          service: params.service
        });

        console.log('User Search Response:', response);
        console.log('User Results:', response.users);

        setResults(response.users);
        setTotalPages(response.totalPages);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    const newParams = { ...searchParams, page: 1 };
    setSearchParams(newParams);
    performSearch(newParams);
  };

  // Handle load more (for infinite scroll)
  const handleLoadMore = async () => {
    if (loading || !totalPages || !searchParams.page) return;

    const nextPage = searchParams.page + 1;
    if (nextPage > totalPages) return;

    const newParams = { ...searchParams, page: nextPage };

    try {
      setLoading(true);

      if (searchParams.type === 'center') {
        const response: CenterSearchResponse = await discoveryService.searchCenters({
          type: newParams.specialty,
          city: newParams.city,
          state: newParams.state,
          country: newParams.country,
          page: newParams.page,
          limit: newParams.limit
        });

        // Append new results to existing ones
        setResults(prev => [...prev, ...response.centers]);
      } else {
        const response: UserSearchResponse = await discoveryService.searchUsers(newParams);
        setResults(prev => [...prev, ...response.users]);
      }

      setSearchParams(newParams);
    } catch (err) {
      console.error('Failed to load more results:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // Handle broadcast notification
  const handleBroadcastNotify = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one provider');
      return;
    }

    setBroadcastLoading(true);
    try {
      const promises = selectedIds.map(id =>
        discoveryService.createRequest({
          recipientId: id,
          requestType: 'consultation_request',
          message: `I am interested in a consultation. Please provide a fee estimate and available appointment slots.`,
          metadata: {
            isBroadcast: true,
            source: 'discovery_broadcast'
          }
        })
      );

      await Promise.all(promises);
      toast.success(`Broadcasting notifications to ${selectedIds.length} providers!`);
      setSelectedIds([]);
      setIsSelectMode(false);
    } catch (err) {
      console.error('Broadcast failed:', err);
      toast.error('Failed to send some notifications');
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Handle Global Broadcast (Service Interest)
  const handleGlobalBroadcast = async () => {
    const specialty = searchParams.specialty || searchParams.search;

    if (!specialty) {
      toast.error('Please select a specialty or search for a service first');
      return;
    }

    setBroadcastLoading(true);
    try {
      await discoveryService.createRequest({
        requestType: 'service_interest',
        message: `A patient has indicated interest in ${specialty} services.`,
        metadata: {
          specialty,
          source: 'global_broadcast'
        }
      });
      toast.success(`Broadcasting your interest to all ${specialty} specialists! Check your dashboard for their proposals.`);
    } catch (err) {
      console.error('Global broadcast failed:', err);
      toast.error('Failed to broadcast interest');
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Handle request
  const handleRequest = (recipient: User | Center) => {
    // Validate recipient has required data
    if (!recipient) {
      toast.error('Invalid recipient data. Please try again.');
      console.error('Invalid recipient in handleRequest: recipient is null/undefined');
      return;
    }

    // Check if we have either a valid UUID or a publicId
    const hasUuid = recipient.id && recipient.id.includes('-');
    const hasPublicId = recipient.publicId && recipient.publicId.length > 0;

    if (!hasUuid && !hasPublicId) {
      toast.error('Unable to identify recipient. Missing user ID information.');
      console.error('Invalid recipient in handleRequest:', {
        recipient,
        hasUuid,
        hasPublicId,
        id: recipient.id,
        publicId: recipient.publicId
      });
      return;
    }

    setSelectedRecipient(recipient);

    // For patients, always show patient request modal for both doctors and centers
    if (userRole === 'patient') {
      setShowPatientRequestModal(true);
      return;
    }

    // For other roles (doctors, centers), use the existing logic
    if ((recipient as any).specialty) {
      setShowInviteModal(true);
      return;
    }
    setShowRequestModal(true);
  };

  // Handle view profile
  const handleViewProfile = (publicId: string) => {
    // Navigate to profile page or open profile modal
    window.open(`/profile/${publicId}`, '_blank');
  };

  // Handle request modal close
  const handleRequestModalClose = () => {
    setShowRequestModal(false);
    setSelectedRecipient(null);
  };

  const handleInviteModalClose = () => {
    setShowInviteModal(false);
    setSelectedRecipient(null);
  };

  const handlePatientRequestModalClose = () => {
    setShowPatientRequestModal(false);
    setSelectedRecipient(null);
  };

  // Handle request sent
  const handleRequestSent = () => {
    // We don't close the modal immediately here anymore, 
    // because the PatientRequestModal now has its own success/receipt screen
    // that the user should be able to see and interact with.
    // The modal will be closed when the user clicks "Back to Dashboard" inside it.
    console.log('Request success confirmed in DiscoveryPage');
  };

  // Initial search and sync with URL
  useEffect(() => {
    const params = getUrlParams();
    const updatedParams = { ...searchParams, ...params, page: 1 };
    setSearchParams(updatedParams);
    performSearch(updatedParams);
  }, [window.location.search]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/20 py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent mb-2">
                {['doctor', 'center', 'pharmacy', 'nurse', 'diagnostic'].includes(userRole) ? 'Build Professional Network / Find Patients' : 'Discover Healthcare Professionals'}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {['doctor', 'center', 'pharmacy', 'nurse', 'diagnostic', 'maternity'].includes(userRole)
                  ? 'Connect with patients, find professional partners, and collaborate with specialized clinical providers.'
                  : 'Find and connect with doctors, specialists, and healthcare centers in your area.'}
              </p>
            </div>

            {/* Prominent Search Bar on Page */}
            <div className="flex-1 max-w-xl mx-auto w-full md:mx-4">
              <div className="relative group mb-2">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search by Name, Specialist (DR-), Hospital (HSP-), or Specialty..."
                  value={searchParams.search || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams({ ...searchParams, search: e.target.value })}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 pr-16 md:pr-32 py-6 bg-white border-2 border-blue-100 rounded-2xl shadow-lg shadow-blue-900/5 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg"
                />

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {searchParams.search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newParams = { ...searchParams, search: '' };
                        setSearchParams(newParams);
                        performSearch(newParams);
                      }}
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 md:px-5 py-2 font-bold transition-all active:scale-95 flex items-center justify-center min-w-[40px] shadow-sm ml-1"
                  >
                    <Search className="h-4 w-4 md:hidden" />
                    <span className="hidden md:inline">Search</span>
                  </Button>
                </div>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">Try:</span>
                {['DR-', 'HSP-', 'NUR-', 'Cardiology', 'Pediatrics', 'Dentist', 'Lab Tests', 'Pharmacy', 'Surgeon', 'Physiotherapy'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      const newParams = { ...searchParams, search: suggestion };
                      setSearchParams(newParams);
                      performSearch(newParams);
                    }}
                    className="whitespace-nowrap px-3 py-1 bg-white border border-blue-100 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              {userRole === 'patient' && (
                <div className="flex gap-2">
                  <Button
                    variant={isSelectMode ? "secondary" : "outline"}
                    onClick={() => {
                      setIsSelectMode(!isSelectMode);
                      if (!isSelectMode) setSelectedIds([]);
                    }}
                    className="rounded-full px-6"
                  >
                    {isSelectMode ? "Cancel Selection" : "Select Multiple"}
                  </Button>

                  {(searchParams.specialty || searchParams.search) && !isSelectMode && (
                    <Button
                      onClick={handleGlobalBroadcast}
                      disabled={broadcastLoading}
                      className="rounded-full px-6 bg-slate-900 border-slate-900 text-white hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    >
                      {broadcastLoading ? "Broadcasting..." : `Broadcast Interest to ${searchParams.specialty || searchParams.search}`}
                    </Button>
                  )}
                </div>
              )}

              {isSelectMode && selectedIds.length > 0 && (
                <Button
                  onClick={handleBroadcastNotify}
                  disabled={broadcastLoading}
                  className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                >
                  {broadcastLoading ? "Sending..." : `Notify Selected (${selectedIds.length})`}
                </Button>
              )}
            </div>
          </div>

          {/* Search Filters - Desktop Only */}
          <div className="mb-8 relative z-20 hidden md:block">
            <SearchFilters
              params={searchParams}
              onChange={setSearchParams}
              onSearch={handleSearch}
              userRole={userRole}
              loading={loading}
            />
          </div>

          {/* Search Results */}
          <SearchResults
            results={filteredResults}
            loading={loading}
            error={error || undefined}
            onRequest={handleRequest}
            onViewProfile={handleViewProfile}
            onCall={async (u: any) => {
              const phone = u.profile?.phoneNumber || u.phone;
              const callType = (u as any).metadata?.callType || 'voice';

              // Emergency flow for Ambulance Services
              const isAmbulance = user?.roles?.includes('ambulance_service');
              if (isAmbulance) {
                try {
                  const confirmCall = window.confirm(`Initiate Emergency Consultation? This will immediately debit your wallet for the service fee to unlock direct clinical lines.`);
                  if (!confirmCall) return;

                  toast.loading('Processing instant consultation fee...', { id: 'emergency-payment' });

                  // 1. Create an emergency request first
                  const request = await discoveryService.createRequest({
                    recipientId: u.id || u.publicId,
                    requestType: 'consultation_request',
                    message: `EMERGENCY AMBULANCE CONSULTATION: Initiating immediate contact for patient inbound.`,
                    metadata: {
                      isEmergency: true,
                      immediateAccess: true,
                      source: 'ambulance_emergency_flow'
                    }
                  });

                  // 2. Process immediate wallet debit if there's a price
                  const service = u.offeredServices?.[0] || { price: 0, currency: 'USD' };
                  if (service.price > 0) {
                    await integrationsService.processPayment({
                      amount: service.price,
                      currency: service.currency || 'USD',
                      patientId: null,
                      centerId: (profile?.center_id || (user as any)?.centerId) || null,
                      description: `Emergency Consultation Fee - ${u.displayName}`,
                      paymentMethod: 'wallet',
                      metadata: { requestId: request.id, type: 'emergency_consultation' }
                    });
                  }

                  toast.success('Consultation unlocked! Dialing...', { id: 'emergency-payment' });

                  if (phone) window.open(`tel:${phone}`);
                  else toast.error('Phone number not available');
                  return;
                } catch (err: any) {
                  console.error('Emergency consultation failed:', err);
                  toast.error(err.message || 'Failed to initiate emergency consultation. Please check wallet balance.', { id: 'emergency-payment' });
                  return;
                }
              }

              if (callType === 'video') {
                toast.error(`Video Consultation Required: Please book an appointment first. Professional consultations require a confirmed booking and payment.`, {
                  icon: '🎫',
                  duration: 6000
                });
                // Automatically open the booking modal to help the user complete their request
                setSelectedRecipient(u);
                setShowPatientRequestModal(true);
                return;
              }

              if (phone) window.open(`tel:${phone}`);
              else toast.error('Phone number not available');
            }}
            searchType={searchParams.type || 'doctor'}
            hasMore={searchParams.page ? searchParams.page < totalPages : false}
            onLoadMore={handleLoadMore}
            // New props
            isSelectMode={isSelectMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            selectedService={searchParams.service}
          />


          {/* Mobile: Floating Filter Button - positioned above the AI chat button */}
          <div className="block md:hidden fixed bottom-24 right-4 z-30 safe-area-pb">
            <Button
              onClick={() => setShowFilterDrawer(true)}
              className="rounded-full w-12 h-12 shadow-xl shadow-blue-500/30 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-0 transition-all hover:scale-105 active:scale-95"
              aria-label="Open filters"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile: Filter Bottom Sheet Drawer */}
          <Drawer open={showFilterDrawer} onOpenChange={setShowFilterDrawer}>
            <DrawerContent className="rounded-t-3xl bg-gradient-to-b from-white to-blue-50/20 border-t-4 border-blue-600 shadow-2xl max-h-[90vh]">
              {/* Swipe indicator */}
              <div className="mx-auto mt-3 mb-2 h-1.5 w-16 rounded-full bg-blue-300" />

              <DrawerHeader className="px-6 pt-2 pb-4 border-b border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Search & Filter</DrawerTitle>
                  <DrawerClose asChild>
                    <button className="rounded-full p-2 hover:bg-blue-100 transition-colors" aria-label="Close filters">
                      <X className="w-5 h-5 text-blue-600" />
                    </button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="px-6 pb-2 pt-4 overflow-y-auto min-h-[300px]">
                <SearchFilters
                  params={searchParams}
                  onChange={setSearchParams}
                  onSearch={() => {
                    handleSearch();
                    setShowFilterDrawer(false);
                  }}
                  userRole={userRole}
                  loading={loading}
                  compact={true}
                />
              </div>

              {/* Sticky Footer for Mobile Search */}
              <DrawerFooter className="px-6 pb-8 pt-4 bg-white border-t border-blue-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      handleSearch();
                      setShowFilterDrawer(false);
                    }}
                    disabled={loading}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center transition-all active:scale-[0.98]"
                  >
                    <Search className="w-6 h-6 mr-3 stroke-[3]" />
                    {loading ? "Searching..." : "Initiate Search"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchParams({
                        type: 'doctor',
                        specialty: '',
                        city: '',
                        state: '',
                        country: '',
                        service: '',
                        page: 1,
                        limit: 20,
                        experience: 0,
                        availability: false
                      });
                      setShowFilterDrawer(false);
                    }}
                    className="w-fit self-start text-xs font-bold text-slate-400 hover:text-slate-600 gap-2 p-0 h-auto"
                  >
                    <X className="w-3 h-3" /> Clear Filters
                  </Button>
                </div>
                <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-2">
                  Searching {results.length > 0 ? results.length : ''} Active Professionals
                </p>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Patient Request Modal - for patients requesting medical services */}
          {showPatientRequestModal && selectedRecipient && (
            <PatientRequestModal
              isOpen={showPatientRequestModal}
              onClose={handlePatientRequestModalClose}
              recipient={selectedRecipient as User}
              onSend={() => {
                handlePatientRequestModalClose();
                performSearch(searchParams);
              }}
              preselectedServices={searchParams.service ? searchParams.service.split(',').map(s => s.trim()) : []}
            />
          )}

          {/* Legacy Request Modal */}
          {showRequestModal && selectedRecipient && (
            <RequestModal
              isOpen={showRequestModal}
              onClose={handleRequestModalClose}
              recipient={selectedRecipient}
              onSend={handleRequestSent}
            />
          )}

          {/* New Send Request/Invitation Modal */}
          {showInviteModal && selectedRecipient && 'specialty' in selectedRecipient && (
            <SendRequestModal
              isOpen={showInviteModal}
              onClose={handleInviteModalClose}
              recipient={selectedRecipient as User}
              onSent={() => {
                handleInviteModalClose();
                performSearch(searchParams);
              }}
              preselectedServices={searchParams.service ? searchParams.service.split(',').map(s => s.trim()) : []}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DiscoveryPage;
