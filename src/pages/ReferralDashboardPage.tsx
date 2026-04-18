import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import {
  Referral,
  ReferralStatus,
  ReferralType,
  CreateReferralDto,
  ReferralQueryParams,
  ReferralDashboardSummary,
  ReferralAnalytics as ReferralAnalyticsType
} from '../services/referralService';
import { referralService } from '../services/referralService';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import ReferralKPIs from '../components/referrals/ReferralKPIs';
import ReferralAnalytics from '../components/referrals/ReferralAnalytics';
import ReferralList from '../components/referrals/ReferralList';
import NewReferralModal from '../components/referrals/NewReferralModal';
import { useAuth } from '../hooks/useAuth';

const ReferralDashboardPage: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [summary, setSummary] = useState<ReferralDashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<ReferralAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewReferralModalOpen, setIsNewReferralModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [direction, setDirection] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Use the user's center from their profile; fall back to user ID for personal referrals
  const centerId = profile?.center_id || profile?.id || user?.id || '';

  useEffect(() => {
    if (centerId) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [centerId, selectedStatus, selectedType, dateRange, direction]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const queryParams: ReferralQueryParams = {
        startDate: dateRange.start,
        endDate: dateRange.end
      };

      if (selectedStatus !== 'all') {
        queryParams.status = selectedStatus as ReferralStatus;
      }

      // If specific direction is selected, add it to query
      if (direction === 'inbound') {
        queryParams.receivingCenterId = centerId;
      } else if (direction === 'outbound') {
        queryParams.referringCenterId = centerId;
      }

      const [referralsResponse, summaryData, analyticsResponse] = await Promise.all([
        referralService.getReferralsForCenter(centerId, queryParams),
        referralService.getReferralDashboardSummary(centerId, {
          startDate: dateRange.start,
          endDate: dateRange.end
        }),
        referralService.getReferralAnalytics(centerId, {
          startDate: dateRange.start,
          endDate: dateRange.end
        })
      ]);

      setReferrals(referralsResponse.data);
      setSummary(summaryData);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async (referralData: CreateReferralDto) => {
    try {
      const { data: newReferral, error } = await referralService.createReferral(referralData);
      if (error) {
        console.error('Error creating referral:', error);
        return;
      }
      setReferrals(prev => [newReferral, ...prev]);
      setIsNewReferralModalOpen(false);
      loadDashboardData(); // Refresh all data
    } catch (error) {
      console.error('Error creating referral:', error);
    }
  };

  const handleUpdateReferralStatus = async (referralId: string, status: ReferralStatus) => {
    try {
      await referralService.updateReferral(referralId, { status });
      loadDashboardData(); // Refresh all data
    } catch (error) {
      console.error('Error updating referral status:', error);
    }
  };

  const handleDeleteReferral = async (referralId: string) => {
    if (window.confirm('Are you sure you want to delete this referral?')) {
      try {
        await referralService.deleteReferral(referralId);
        setReferrals(prev => prev.filter(r => r.id !== referralId));
        loadDashboardData(); // Refresh all data
      } catch (error) {
        console.error('Error deleting referral:', error);
      }
    }
  };

  const handleViewReferral = (referral: Referral) => {
    navigate(`/referrals/${referral.id}`);
  };

  const handleEditReferral = (referral: Referral) => {
    // TODO: Implement edit referral modal
    console.log('Edit referral:', referral);
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = searchTerm === '' ||
      referral.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || referral.status === selectedStatus;
    const matchesType = selectedType === 'all' || referral.referralType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 pb-32 md:pb-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Referral Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage patient referrals and track analytics</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setIsNewReferralModalOpen(true)}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
            >
              <PlusIcon className="h-4 w-4 mr-1 sm:mr-2" />
              New Referral
            </button>
          </div>
        </div>
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search referrals, patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-4">
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'all' | 'inbound' | 'outbound')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-50 font-semibold text-blue-700"
              >
                <option value="all">All Referrals</option>
                <option value="inbound">Inbound (Incoming)</option>
                <option value="outbound">Outbound (Sent)</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value={ReferralStatus.PENDING}>Pending</option>
                <option value={ReferralStatus.ACCEPTED}>Accepted</option>
                <option value={ReferralStatus.REJECTED}>Rejected</option>
                <option value={ReferralStatus.COMPLETED}>Completed</option>
                <option value={ReferralStatus.CANCELED}>Canceled</option>
                <option value={ReferralStatus.EXPIRED}>Expired</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value={ReferralType.SPECIALIST}>Specialist</option>
                <option value={ReferralType.DIAGNOSTIC}>Diagnostic</option>
                <option value={ReferralType.PROCEDURE}>Procedure</option>
                <option value={ReferralType.CONSULTATION}>Consultation</option>
                <option value={ReferralType.FOLLOW_UP}>Follow Up</option>
                <option value={ReferralType.SECOND_OPINION}>Second Opinion</option>
                <option value={ReferralType.TRANSFER}>Transfer</option>
              </select>

              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md border-2 transition-colors ${viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600 border-blue-400'
                    : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  title="Grid view"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md border-2 transition-colors ${viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600 border-blue-400'
                    : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  title="List view"
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        {summary && (
          <ReferralKPIs summary={summary} loading={loading} />
        )}

        {/* Analytics Charts */}
        {analytics && (
          <ReferralAnalytics analytics={analytics} loading={loading} />
        )}

        {/* Referrals List */}
        <ReferralList
          referrals={filteredReferrals}
          loading={loading}
          onViewReferral={handleViewReferral}
          onEditReferral={handleEditReferral}
          onDeleteReferral={handleDeleteReferral}
          onUpdateStatus={handleUpdateReferralStatus}
          currentCenterId={centerId}
        />

        {/* New Referral Modal */}
        <NewReferralModal
          isOpen={isNewReferralModalOpen}
          onClose={() => setIsNewReferralModalOpen(false)}
          onSubmit={handleCreateReferral}
          loading={false}
        />
      </div>
    </DashboardLayout>
  );
};

export default ReferralDashboardPage;
