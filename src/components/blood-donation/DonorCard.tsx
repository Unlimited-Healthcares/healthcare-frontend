import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Heart, Eye, ShieldCheck } from 'lucide-react';
import { BloodDonor, DonorStatus } from '../../types/blood-donation';

interface DonorCardProps {
  donor: BloodDonor;
  onViewDetails?: (donor: BloodDonor) => void;
  onSchedule?: (donor: BloodDonor) => void;
  onVerify?: (donor: BloodDonor) => void;
}

const DonorCard: React.FC<DonorCardProps> = ({ donor, onViewDetails, onSchedule, onVerify }) => {
  const getStatusColor = (status: DonorStatus): string => {
    const colors = {
      eligible: 'bg-green-100 text-green-800 border-green-200',
      temporarily_deferred: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      permanently_deferred: 'bg-red-100 text-red-800 border-red-200',
      suspended: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: DonorStatus): string => {
    const statusMap = {
      eligible: 'Eligible',
      temporarily_deferred: 'Deferred',
      permanently_deferred: 'Deferred',
      suspended: 'Suspended',
    };
    return statusMap[status] || status;
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
            <User className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Donor #{donor.donorNumber}</h3>
            <p className="text-sm text-gray-500">{donor.bloodType} • {donor.totalDonations} donations</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(donor.status)}`}>
          {getStatusText(donor.status)}
        </div>
      </div>

      {/* Blood Type Badge */}
      <div className="mb-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
          <Heart className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-800">{donor.bloodType}</span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="truncate">john.smith@email.com</span>
        </div>
        
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>(555) 123-4567</span>
        </div>
        
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">123 Main St, City, State</span>
        </div>
        
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Last donation: {formatDate(donor.lastDonationDate)}</span>
        </div>
      </div>

      {/* Donation Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{donor.totalDonations}</p>
          <p className="text-xs text-gray-500">Total Donations</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{donor.totalRewardPoints}</p>
          <p className="text-xs text-gray-500">Reward Points</p>
        </div>
      </div>

      {/* Medical Information */}
      {(donor.medicalConditions.length > 0 || donor.medications.length > 0) && (
        <div className="mb-4">
          {donor.medicalConditions.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Medical Conditions</p>
              <div className="flex flex-wrap gap-1">
                {donor.medicalConditions.slice(0, 2).map((condition, index) => (
                  <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {condition}
                  </span>
                ))}
                {donor.medicalConditions.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{donor.medicalConditions.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {donor.medications.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Medications</p>
              <div className="flex flex-wrap gap-1">
                {donor.medications.slice(0, 2).map((medication, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {medication}
                  </span>
                ))}
                {donor.medications.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{donor.medications.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails?.(donor)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Eye className="w-4 h-4" />
            <span>Details</span>
          </button>
          
          <button
            onClick={() => onVerify?.(donor)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify</span>
          </button>
        </div>
        
        {donor.status === 'eligible' && (
          <button
            onClick={() => onSchedule?.(donor)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Donation</span>
          </button>
        )}
      </div>

      {/* Notes */}
      {donor.notes && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Notes:</span> {donor.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default DonorCard;
