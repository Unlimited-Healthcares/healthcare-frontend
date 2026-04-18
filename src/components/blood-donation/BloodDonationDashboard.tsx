import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClinicalSecurityGate } from '../medical-records/ClinicalSecurityGate';
import {
  BloodDonor,
  BloodDonationRequest,
  BloodDonation,
  BloodInventory,
  BloodDonationAnalytics
} from '../../types/blood-donation';
import bloodDonationService from '../../services/bloodDonationService';
import {
  Users,
  AlertTriangle,
  Droplets,
  Plus,
  Search,
  Filter,
  Heart,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import RegisterDonorModal from './RegisterDonorModal';
import CreateRequestModal from './CreateRequestModal';
import BloodInventoryCard from './BloodInventoryCard';
import DonorCard from './DonorCard';
import RequestCard from './RequestCard';
import DonationCard from './DonationCard';
import AnalyticsSection from './AnalyticsSection';
import DonorVerificationModal from './DonorVerificationModal';
import DonationEventModal from './DonationEventModal';
import DonorMatchingModal from './DonorMatchingModal';
import { toast } from 'sonner';

interface BloodDonationDashboardProps {
  centerId?: string;
}

const BloodDonationDashboard: React.FC<BloodDonationDashboardProps> = ({ centerId }) => {
  // State management
  const [activeTab, setActiveTab] = useState<'inventory' | 'donors' | 'requests' | 'donations'>('inventory');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bloodType: 'all',
    status: 'all',
    priority: 'all'
  });

  // Data state
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [requests, setRequests] = useState<BloodDonationRequest[]>([]);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [donations, setDonations] = useState<BloodDonation[]>([]);
  const [analytics, setAnalytics] = useState<BloodDonationAnalytics | null>(null);

  // Modal state
  const [showRegisterDonorModal, setShowRegisterDonorModal] = useState(false);
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<BloodDonor | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BloodDonationRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const navigate = useNavigate();

  // Load data on component mount
  useEffect(() => {
    loadBloodDonationData();
  }, [centerId]);

  const loadBloodDonationData = async () => {
    try {
      setLoading(true);

      const [donorsRes, requestsRes, inventoryRes, donationsRes, analyticsRes] = await Promise.all([
        bloodDonationService.getAllDonors({ page: 1, limit: 50 }),
        bloodDonationService.getAllBloodRequests({ page: 1, limit: 50, centerId }),
        bloodDonationService.getBloodInventory(centerId),
        bloodDonationService.getAllDonations(),
        bloodDonationService.getBloodDonationAnalytics(centerId)
      ]);

      setDonors(donorsRes.data || []);
      setRequests(requestsRes.data || []);
      setInventory(inventoryRes.data || []);
      setDonations(donationsRes.data || []);
      setAnalytics(analyticsRes.data || null);
    } catch (error) {
      console.error('Error loading blood donation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDonor = async (donorData: any) => {
    try {
      await bloodDonationService.registerDonor(donorData);
      setShowRegisterDonorModal(false);
      loadBloodDonationData();
    } catch (error) {
      console.error('Error registering donor:', error);
    }
  };

  const handleCreateRequest = async (requestData: any) => {
    try {
      await bloodDonationService.createBloodRequest(requestData);
      setShowCreateRequestModal(false);
      loadBloodDonationData();
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await bloodDonationService.approveBloodRequest(requestId);
      loadBloodDonationData();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await bloodDonationService.cancelBloodRequest(requestId);
      loadBloodDonationData();
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const handleCompleteDonation = async (donationId: string) => {
    try {
      await bloodDonationService.completeDonation(donationId);
      loadBloodDonationData();
    } catch (error) {
      console.error('Error completing donation:', error);
    }
  };

  const handleCancelDonation = async (donationId: string) => {
    try {
      await bloodDonationService.cancelDonation(donationId);
      loadBloodDonationData();
    } catch (error) {
      console.error('Error cancelling donation:', error);
    }
  };

  const handleRecordDonation = async (donationData: any) => {
    try {
      await bloodDonationService.createBloodDonation(donationData);
      toast.success('Donation recorded successfully and inventory updated');
      setShowDonationModal(false);
      loadBloodDonationData();
    } catch (error) {
      toast.error('Failed to record donation');
      console.error('Error recording donation:', error);
    }
  };

  const handleNotifyDonor = async (donorId: string) => {
    try {
      // In a real system, this would call a notification service
      console.log('Notifying donor:', donorId);
      toast.success('Compatible donor has been notified');
    } catch (error) {
      toast.error('Failed to notify donor');
    }
  };

  const openMatching = (request: BloodDonationRequest) => {
    setSelectedRequest(request);
    setShowMatchingModal(true);
  };

  const handleVerifyDonor = (donor: BloodDonor) => {
    setSelectedDonor(donor);
    setShowVerificationModal(true);
  };

  const submitVerification = async (verificationData: any) => {
    if (!selectedDonor) return;
    try {
      // In a real app, you would call bloodDonationService.verifyDonor(selectedDonor.id, verificationData);
      console.log('Verifying donor:', selectedDonor.id, verificationData);
      toast.success(`Donor ${selectedDonor.donorNumber} verified successfully!`);
      loadBloodDonationData();
    } catch (error) {
      console.error('Error verifying donor:', error);
      toast.error('Failed to verify donor');
    }
  };

  // Filter data based on search and filters
  const filteredDonors = donors.filter(donor => {
    const matchesSearch = !searchTerm ||
      donor.donorNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.bloodType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodType = filters.bloodType === 'all' || donor.bloodType === filters.bloodType;
    const matchesStatus = filters.status === 'all' || donor.status === filters.status;

    return matchesSearch && matchesBloodType && matchesStatus;
  });

  const filteredRequests = requests.filter(request => {
    const matchesSearch = !searchTerm ||
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.patientName && request.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBloodType = filters.bloodType === 'all' || request.bloodType === filters.bloodType;
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesPriority = filters.priority === 'all' || request.priority === filters.priority;

    return matchesSearch && matchesBloodType && matchesStatus && matchesPriority;
  });

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = !searchTerm ||
      donation.donationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.bloodType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodType = filters.bloodType === 'all' || donation.bloodType === filters.bloodType;
    const matchesStatus = filters.status === 'all' || donation.status === filters.status;

    return matchesSearch && matchesBloodType && matchesStatus;
  });

  const clearFilters = () => {
    setFilters({ bloodType: 'all', status: 'all', priority: 'all' });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-soft overflow-hidden">
          <ClinicalSecurityGate
            onUnlock={() => setIsUnlocked(true)}
            onCancel={() => navigate(-1)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">BloodCare+</h1>
                <p className="text-xs sm:text-sm text-gray-500">Blood Donation Management System</p>
              </div>
            </div>

            {/* Summary Cards - Scrollable on mobile */}
            <div className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <div className="text-center flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg mx-auto mb-1 sm:mb-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics?.totalDonors || 0}</p>
                <p className="text-xs sm:text-sm text-gray-500">Donors</p>
              </div>

              <div className="text-center flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg mx-auto mb-1 sm:mb-2">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{analytics?.lowStockAlerts || 0}</p>
                <p className="text-xs sm:text-sm text-gray-500">Critical</p>
              </div>

              <div className="text-center flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg mx-auto mb-1 sm:mb-2">
                  <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {inventory.reduce((sum, item) => sum + item.availableUnits, 0)}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">Units</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Quick Actions */}
        <div className="flex gap-2 mb-4 lg:hidden">
          <button
            onClick={() => setShowRegisterDonorModal(true)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Register Donor</span>
          </button>

          <button
            onClick={() => setShowCreateRequestModal(true)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>

        {/* Mobile Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm mb-4 lg:hidden"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">Filters</span>
          </div>
          {showFilters ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 lg:hidden space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                <select
                  value={filters.bloodType}
                  onChange={(e) => setFilters({ ...filters, bloodType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="eligible">Eligible</option>
                  <option value="temporarily_deferred">Deferred</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-80 space-y-6 flex-shrink-0">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                  <select
                    value={filters.bloodType}
                    onChange={(e) => setFilters({ ...filters, bloodType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="eligible">Eligible</option>
                    <option value="temporarily_deferred">Temporarily Deferred</option>
                    <option value="permanently_deferred">Permanently Deferred</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowRegisterDonorModal(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Register Donor</span>
                </button>

                <button
                  onClick={() => setShowCreateRequestModal(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Request</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex overflow-x-auto scrollbar-hide px-3 sm:px-6 space-x-4 sm:space-x-8">
                  {[
                    { id: 'inventory', label: 'Inventory', count: inventory.length },
                    { id: 'donors', label: 'Donors', count: donors.length },
                    { id: 'requests', label: 'Requests', count: requests.length },
                    { id: 'donations', label: 'Donations', count: donations.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      {tab.label}
                      <span className="ml-1 sm:ml-2 bg-gray-100 text-gray-900 py-0.5 px-1.5 sm:px-2.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-4 sm:space-y-6">
              {activeTab === 'inventory' && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {inventory.map((item) => (
                    <BloodInventoryCard key={`${item.centerId}-${item.bloodType}`} inventory={item} />
                  ))}
                </div>
              )}

              {activeTab === 'donors' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {filteredDonors.map((donor) => (
                    <DonorCard
                      key={donor.id}
                      donor={donor}
                      onVerify={handleVerifyDonor}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="space-y-3 sm:space-y-4">
                  {filteredRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onApprove={() => handleApproveRequest(request.id)}
                      onCancel={() => handleCancelRequest(request.id)}
                      onFulfill={() => {
                        setSelectedRequest(request);
                        setShowDonationModal(true);
                      }}
                      onMatch={openMatching}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'donations' && (
                <div className="space-y-3 sm:space-y-4">
                  {filteredDonations.map((donation) => (
                    <DonationCard
                      key={donation.id}
                      donation={donation}
                      onComplete={() => handleCompleteDonation(donation.id)}
                      onCancel={() => handleCancelDonation(donation.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Analytics Section */}
            {analytics && (
              <div className="mt-6 sm:mt-8">
                <AnalyticsSection analytics={analytics} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegisterDonorModal
        isOpen={showRegisterDonorModal}
        onClose={() => setShowRegisterDonorModal(false)}
        onSubmit={handleRegisterDonor}
      />

      <CreateRequestModal
        isOpen={showCreateRequestModal}
        onClose={() => setShowCreateRequestModal(false)}
        onSubmit={handleCreateRequest}
        centerId={centerId}
      />

      {showVerificationModal && selectedDonor && (
        <DonorVerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          donor={selectedDonor}
          onVerify={submitVerification}
        />
      )}

      <DonationEventModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        donors={donors}
        requests={requests}
        onSubmit={handleRecordDonation}
        centerId={centerId}
      />

      {selectedRequest && (
        <DonorMatchingModal
          isOpen={showMatchingModal}
          onClose={() => setShowMatchingModal(false)}
          request={selectedRequest}
          onNotify={handleNotifyDonor}
        />
      )}
    </div>
  );
};

export default BloodDonationDashboard;
