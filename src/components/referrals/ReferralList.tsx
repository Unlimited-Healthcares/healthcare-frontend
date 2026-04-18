import React, { useState } from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import { Referral, ReferralStatus, ReferralPriority, ReferralType } from '../../services/referralService';

interface ReferralListProps {
  referrals: Referral[];
  loading?: boolean;
  onViewReferral: (referral: Referral) => void;
  onEditReferral: (referral: Referral) => void;
  onDeleteReferral: (referralId: string) => void;
  onUpdateStatus: (referralId: string, status: ReferralStatus) => void;
  currentCenterId?: string;
}

const ReferralList: React.FC<ReferralListProps> = ({
  referrals,
  loading = false,
  onViewReferral,
  onEditReferral,
  onDeleteReferral,
  onUpdateStatus,
  currentCenterId
}) => {
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedReferrals.length === referrals.length) {
      setSelectedReferrals([]);
    } else {
      setSelectedReferrals(referrals.map(r => r.id));
    }
  };

  const handleSelectReferral = (referralId: string) => {
    setSelectedReferrals(prev => 
      prev.includes(referralId) 
        ? prev.filter(id => id !== referralId)
        : [...prev, referralId]
    );
  };

  const getStatusBadge = (status: ReferralStatus) => {
    const statusConfig = {
      [ReferralStatus.PENDING]: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon,
        label: 'Pending'
      },
      [ReferralStatus.ACCEPTED]: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
        label: 'Accepted'
      },
      [ReferralStatus.IN_PROGRESS]: {
        color: 'bg-blue-100 text-blue-800',
        icon: ClockIcon,
        label: 'In Progress'
      },
      [ReferralStatus.REJECTED]: {
        color: 'bg-red-100 text-red-800',
        icon: XCircleIcon,
        label: 'Rejected'
      },
      [ReferralStatus.COMPLETED]: {
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircleIcon,
        label: 'Completed'
      },
      [ReferralStatus.CANCELED]: {
        color: 'bg-gray-100 text-gray-800',
        icon: XCircleIcon,
        label: 'Canceled'
      },
      [ReferralStatus.CANCELLED]: {
        color: 'bg-gray-100 text-gray-800',
        icon: XCircleIcon,
        label: 'Cancelled'
      },
      [ReferralStatus.EXPIRED]: {
        color: 'bg-orange-100 text-orange-800',
        icon: ExclamationTriangleIcon,
        label: 'Expired'
      }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: ReferralPriority) => {
    const priorityConfig = {
      [ReferralPriority.LOW]: 'bg-gray-100 text-gray-800',
      [ReferralPriority.NORMAL]: 'bg-green-100 text-green-800',
      [ReferralPriority.HIGH]: 'bg-yellow-100 text-yellow-800',
      [ReferralPriority.URGENT]: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: ReferralType) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="px-6 py-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Referrals</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {referrals.length} referral{referrals.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {referrals.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new referral.</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReferrals.length === referrals.length && referrals.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedReferrals.includes(referral.id)}
                      onChange={() => handleSelectReferral(referral.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                          <span className="text-sm font-medium text-blue-700">
                            {referral.patient.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {referral.patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {referral.patient.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {referral.receivingCenterId === currentCenterId ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                        <ArrowDownLeftIcon className="w-3 h-3 mr-1" />
                        Inbound
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        <ArrowUpRightIcon className="w-3 h-3 mr-1" />
                        Outbound
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(referral.referralType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(referral.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(referral.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(referral.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewReferral(referral)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View referral"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditReferral(referral)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit referral"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {referral.status === ReferralStatus.PENDING && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onUpdateStatus(referral.id, ReferralStatus.ACCEPTED)}
                            className="text-green-600 hover:text-green-900"
                            title="Accept referral"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onUpdateStatus(referral.id, ReferralStatus.REJECTED)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject referral"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => onDeleteReferral(referral.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete referral"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReferralList;
