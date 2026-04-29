import React from 'react';
import { AlertTriangle, Truck, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyHeaderProps {
  onRefresh: () => void;
  lastUpdated?: string;
  isConnected?: boolean;
}

export const EmergencyHeader: React.FC<EmergencyHeaderProps> = ({
  onRefresh,
  lastUpdated,
  isConnected = true
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
      {/* Left: Page Title and Status */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">Emergency Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">Real-time emergency management and response</p>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <Wifi className="h-3 w-3" />
            <span className="hidden xs:inline">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Right: Last Updated and Refresh */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
        {lastUpdated && (
          <div className="text-xs sm:text-sm text-gray-600 truncate">
            <span className="hidden sm:inline">Last updated: </span>{lastUpdated}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-1 sm:gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-2 sm:px-3 flex-shrink-0"
        >
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>
  );
};

// Quick Actions Component
export const EmergencyQuickActions: React.FC<{
  onSOSAlert: () => void;
  onAmbulanceRequest: () => void;
}> = ({ onSOSAlert, onAmbulanceRequest }) => {
  return (
    <div className="mb-4 sm:mb-6 md:mb-8">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Emergency Alert Button */}
        <button
          onClick={onSOSAlert}
          className="group relative overflow-hidden bg-red-600 hover:bg-red-700 text-white p-4 sm:p-5 md:p-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-red-500 rounded-lg group-hover:bg-red-400 transition-colors flex-shrink-0">
              <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
            </div>
            <div className="text-left min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold truncate">Initiate ER MDT Emergency</h3>
              <p className="text-red-100 text-xs sm:text-sm truncate">Notify ER Doctors & MDT team</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        {/* Ambulance Request Button */}
        <button
          onClick={onAmbulanceRequest}
          className="group relative overflow-hidden bg-orange-500 hover:bg-orange-600 text-white p-4 sm:p-5 md:p-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-orange-400 rounded-lg group-hover:bg-orange-300 transition-colors flex-shrink-0">
              <Truck className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
            </div>
            <div className="text-left min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold truncate">Request Ambulance</h3>
              <p className="text-orange-100 text-xs sm:text-sm truncate">Medical transport needed</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>
    </div>
  );
};
