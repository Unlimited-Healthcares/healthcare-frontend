import React from 'react';
import { Droplets, AlertTriangle, CheckCircle } from 'lucide-react';
import { BloodInventory, BloodType } from '../../types/blood-donation';

interface BloodInventoryCardProps {
  inventory: BloodInventory;
}

const BloodInventoryCard: React.FC<BloodInventoryCardProps> = ({ inventory }) => {
  const isLowStock = inventory.availableUnits < inventory.minimumThreshold;
  const isCritical = inventory.availableUnits < (inventory.minimumThreshold * 0.5);

  const getBloodTypeColor = (bloodType: BloodType): string => {
    const colors = {
      'A+': 'bg-red-50 border-red-200 text-red-800',
      'A-': 'bg-red-100 border-red-300 text-red-900',
      'B+': 'bg-blue-50 border-blue-200 text-blue-800',
      'B-': 'bg-blue-100 border-blue-300 text-blue-900',
      'AB+': 'bg-purple-50 border-purple-200 text-purple-800',
      'AB-': 'bg-purple-100 border-purple-300 text-purple-900',
      'O+': 'bg-green-50 border-green-200 text-green-800',
      'O-': 'bg-green-100 border-green-300 text-green-900',
    };
    return colors[bloodType] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getStatusColor = (): string => {
    if (isCritical) return 'bg-red-100 text-red-800 border-red-200';
    if (isLowStock) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusIcon = () => {
    if (isCritical) return <AlertTriangle className="w-4 h-4" />;
    if (isLowStock) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isCritical) return 'Critical';
    if (isLowStock) return 'Low Stock';
    return 'Good';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all hover:shadow-md ${
      isCritical ? 'border-red-200' : isLowStock ? 'border-yellow-200' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getBloodTypeColor(inventory.bloodType)}`}>
          {inventory.bloodType}
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>

      {/* Blood Drop Icon */}
      <div className="flex items-center justify-center mb-4">
        <div className={`p-3 rounded-full ${isCritical ? 'bg-red-100' : isLowStock ? 'bg-yellow-100' : 'bg-green-100'}`}>
          <Droplets className={`w-8 h-8 ${isCritical ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'}`} />
        </div>
      </div>

      {/* Inventory Details */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Available</span>
          <span className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
            {inventory.availableUnits} units
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Reserved</span>
          <span className="text-lg font-semibold text-orange-600">
            {inventory.reservedUnits} units
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Total</span>
          <span className="text-lg font-semibold text-gray-900">
            {inventory.totalUnits} units
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Min Required</span>
          <span className="text-sm font-semibold text-red-600">
            {inventory.minimumThreshold} units
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Stock Level</span>
          <span>{Math.round((inventory.availableUnits / inventory.minimumThreshold) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCritical ? 'bg-red-500' : isLowStock ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min((inventory.availableUnits / inventory.minimumThreshold) * 100, 100)}%`
            }}
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isCritical || isLowStock
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              : 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          }`}
        >
          {isCritical || isLowStock ? 'Reserve Units' : 'Reserve Units'}
        </button>
      </div>

      {/* Low Stock Alert */}
      {(isCritical || isLowStock) && (
        <div className={`mt-3 p-2 rounded-lg text-xs font-medium ${
          isCritical ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          {isCritical ? '▲ Critical Stock Level' : '▲ Low Stock Alert'}
        </div>
      )}
    </div>
  );
};

export default BloodInventoryCard;
