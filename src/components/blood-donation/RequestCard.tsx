import React from 'react';
import { User, Calendar, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, Phone, SearchCheck } from 'lucide-react';
import { BloodDonationRequest, RequestStatus, RequestPriority } from '../../types/blood-donation';

interface RequestCardProps {
  request: BloodDonationRequest;
  onApprove: () => void;
  onCancel: () => void;
  onFulfill: () => void;
  onMatch?: (request: BloodDonationRequest) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onApprove, onCancel, onFulfill, onMatch }) => {
  const getPriorityColor = (priority: RequestPriority): string => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: RequestStatus): string => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      fulfilled: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityIcon = (priority: RequestPriority) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <XCircle className="w-4 h-4" />;
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

  const canApprove = request.status === 'pending';
  const canCancel = request.status === 'pending' || request.status === 'approved';
  const canFulfill = request.status === 'approved';

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
              {request.requestNumber}
            </h3>
            <p className="text-sm text-gray-500">
              {request.patientName || 'Anonymous'} • {request.contactPerson || 'Hospital'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
            {getPriorityIcon(request.priority)}
            <span>{request.priority.toUpperCase()}</span>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
            {getStatusIcon(request.status)}
            <span>{request.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Blood Type and Units */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-red-600">{request.bloodType}</span>
          </div>
          <span className="text-sm font-medium text-gray-600">Blood Type</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">{request.unitsNeeded}</span>
          </div>
          <span className="text-sm font-medium text-gray-600">Units Needed</span>
        </div>
      </div>

      {/* Request Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Needed By: {formatDate(request.neededBy)}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Created: {formatDate(request.createdAt)}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {request.contactPhone && (
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{request.contactPhone}</span>
            </div>
          )}
          
          {request.contactPerson && (
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{request.contactPerson}</span>
            </div>
          )}
        </div>
      </div>

      {/* Medical Information */}
      {(request.medicalCondition || request.specialRequirements) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          {request.medicalCondition && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Medical Condition</p>
              <p className="text-sm text-gray-700">{request.medicalCondition}</p>
            </div>
          )}
          
          {request.specialRequirements && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Special Requirements</p>
              <p className="text-sm text-gray-700">{request.specialRequirements}</p>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar for Fulfillment */}
      {request.status === 'approved' || request.status === 'fulfilled' ? (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Fulfillment Progress</span>
            <span>{Math.round((request.unitsFulfilled / request.unitsNeeded) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((request.unitsFulfilled / request.unitsNeeded) * 100, 100)}%`
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {request.unitsFulfilled} of {request.unitsNeeded} units fulfilled
          </p>
        </div>
      ) : null}

      {/* Notes */}
      {request.notes && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
          <p className="text-sm text-gray-700">{request.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          {canApprove && (
            <button
              onClick={onApprove}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </button>
          )}

          {request.status === 'approved' && onMatch && (
            <button
              onClick={() => onMatch(request)}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <SearchCheck className="w-4 h-4" />
              <span>Match Donors</span>
            </button>
          )}
        </div>

        <div className="flex space-x-2">
          {canFulfill && (
            <button
              onClick={onFulfill}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Record Fulfillment</span>
            </button>
          )}

          {canCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status-specific messages */}
      {request.status === 'fulfilled' && (
        <div className="mt-3 p-2 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700 font-medium">
            ✓ Request fulfilled on {request.fulfilledAt ? formatDate(request.fulfilledAt) : 'Unknown date'}
          </p>
        </div>
      )}
      
      {request.status === 'cancelled' && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg">
          <p className="text-xs text-red-700 font-medium">
            ✗ Request cancelled
          </p>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
