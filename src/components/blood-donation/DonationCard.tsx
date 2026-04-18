import React from 'react';
import { User, Calendar, Droplets, MapPin, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { BloodDonation, DonationStatus } from '../../types/blood-donation';

interface DonationCardProps {
  donation: BloodDonation;
  onComplete: () => void;
  onCancel: () => void;
}

const DonationCard: React.FC<DonationCardProps> = ({ donation, onComplete, onCancel }) => {
  const getStatusColor = (status: DonationStatus): string => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rejected: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: DonationStatus) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const canComplete = donation.status === 'scheduled';
  const canCancel = donation.status === 'scheduled';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
            <User className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {donation.donationNumber}
            </h3>
            <p className="text-sm text-gray-500">
              {donation.bloodType} • {donation.volumeMl}ml • Main Donation Center
            </p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(donation.status)}`}>
          {getStatusIcon(donation.status)}
          <span>{donation.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Blood Type and Volume */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-red-600">{donation.bloodType}</span>
          </div>
          <span className="text-sm font-medium text-gray-600">Blood Type</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-600">{donation.volumeMl}ml</span>
        </div>
      </div>

      {/* Donation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Donation Date: {formatDate(donation.donationDate)}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>Main Donation Center</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Created: {formatDate(donation.createdAt)}</span>
          </div>
          
          {donation.expiryDate && (
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Expires: {formatDate(donation.expiryDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Vitals Information */}
      {(donation.preDonationVitals || donation.postDonationVitals) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 mb-2">Vital Signs</p>
          
          {donation.preDonationVitals && (
            <div className="mb-2">
              <p className="text-xs text-gray-600 mb-1">Pre-Donation</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(donation.preDonationVitals).map(([key, value]) => (
                  <span key={key} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {donation.postDonationVitals && (
            <div>
              <p className="text-xs text-gray-600 mb-1">Post-Donation</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(donation.postDonationVitals).map(([key, value]) => (
                  <span key={key} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screening Results */}
      {donation.preScreeningResults && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 mb-2">Screening Results</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(donation.preScreeningResults).map(([key, value]) => (
              <span key={key} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {key}: {String(value)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Staff Notes */}
      {donation.staffNotes && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 mb-1">Staff Notes</p>
          <p className="text-sm text-gray-700">{donation.staffNotes}</p>
        </div>
      )}

      {/* Compensation */}
      {donation.compensationAmount > 0 && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Compensation</span>
            <span className="text-lg font-bold text-green-600">
              ${Number(donation.compensationAmount).toFixed(2)}
            </span>
          </div>
          {donation.paymentStatus && (
            <p className="text-xs text-gray-500 mt-1">
              Status: {donation.paymentStatus}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {canComplete || canCancel ? (
        <div className="flex space-x-2">
          {canComplete && (
            <button
              onClick={onComplete}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete</span>
            </button>
          )}
          
          {canCancel && (
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      ) : null}

      {/* Status-specific messages */}
      {donation.status === 'completed' && (
        <div className="mt-3 p-2 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700 font-medium">
            ✓ Donation completed successfully
          </p>
        </div>
      )}
      
      {donation.status === 'cancelled' && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg">
          <p className="text-xs text-red-700 font-medium">
            ✗ Donation cancelled
          </p>
        </div>
      )}
      
      {donation.status === 'rejected' && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-700 font-medium">
            ⚠ Donation rejected
          </p>
        </div>
      )}
    </div>
  );
};

export default DonationCard;
