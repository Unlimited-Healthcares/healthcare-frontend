import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, Truck } from 'lucide-react';
import { useEmergencyTrackingContext } from './EmergencyTrackingProvider';
import { toast } from 'sonner';
import type { GenericObject } from '@/types/common';

interface AmbulanceLocation {
  ambulanceId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface AmbulanceRequest {
  id: string;
  requestNumber: string;
  patientName: string;
  pickupAddress: string;
  status: string;
  priority: string;
  ambulanceId?: string;
  estimatedArrival?: string;
  createdAt: string;
  teamPersonnel?: Array<{ name: string; role: string; appId?: string }>;
  patientConditionOnScene?: string;
  handoverDetails?: {
    facilityName: string;
    receiverName: string;
    receiverPhone: string;
    receiverEmail?: string;
    deliveredAt: string;
  };
}

interface AmbulanceTrackerProps {
  request: AmbulanceRequest;
}

interface StatusUpdateData {
  requestId: string;
  status: string;
  estimatedArrival?: string;
  teamPersonnel?: any[];
  patientConditionOnScene?: string;
  handoverDetails?: any;
}

export function AmbulanceTracker({ request }: AmbulanceTrackerProps) {
  const navigate = useNavigate();
  const { isConnected, subscribe, unsubscribe } = useEmergencyTrackingContext();
  const [ambulanceLocation, setAmbulanceLocation] = useState<AmbulanceLocation | null>(null);
  const [requestStatus, setRequestStatus] = useState(request.status);
  const [estimatedArrival, setEstimatedArrival] = useState(request.estimatedArrival);
  const [currentRequest, setCurrentRequest] = useState(request);

  const calculateMinutesLeft = () => {
    if (!estimatedArrival) return null;
    const arrival = new Date(estimatedArrival).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, Math.floor((arrival - now) / 60000));
    return diff;
  };

  const minutesLeft = calculateMinutesLeft();

  useEffect(() => {
    // Subscribe to ambulance location updates
    const handleLocationUpdate = (data: AmbulanceLocation) => {
      if (data.ambulanceId === request.ambulanceId) {
        setAmbulanceLocation(data);
        toast.info('Ambulance location updated');
      }
    };

    // Subscribe to request status updates
    const handleStatusUpdate = (data: StatusUpdateData) => {
      if (data.requestId === request.id) {
        setRequestStatus(data.status);
        if (data.estimatedArrival) {
          setEstimatedArrival(data.estimatedArrival);
        }
        setCurrentRequest(prev => ({
          ...prev,
          status: data.status,
          estimatedArrival: data.estimatedArrival || prev.estimatedArrival,
          teamPersonnel: data.teamPersonnel || prev.teamPersonnel,
          patientConditionOnScene: data.patientConditionOnScene || prev.patientConditionOnScene,
          handoverDetails: data.handoverDetails || prev.handoverDetails
        }));
        toast.success(`Journey status: ${data.status.replace('_', ' ')}`);
      }
    };

    subscribe('ambulance_location_update', (data: GenericObject) => handleLocationUpdate(data as unknown as AmbulanceLocation));
    subscribe('request_status_update', (data: GenericObject) => handleStatusUpdate(data as unknown as StatusUpdateData));

    return () => {
      unsubscribe('ambulance_location_update');
      unsubscribe('request_status_update');
    };
  }, [request.id, request.ambulanceId, subscribe, unsubscribe]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dispatched': return 'bg-blue-100 text-blue-800';
      case 'en_route': return 'bg-orange-100 text-orange-800';
      case 'on_scene': return 'bg-purple-100 text-purple-800';
      case 'transporting': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openInMaps = () => {
    if (ambulanceLocation) {
      const url = `https://www.google.com/maps?q=${ambulanceLocation.latitude},${ambulanceLocation.longitude}`;
      window.open(url, '_blank');
    }
  };

  const callAmbulanceVendors = () => {
    navigate('/centers?type=ambulance');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Ambulance Request #{request.requestNumber}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(requestStatus)}>
              {requestStatus.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(request.priority)}>
              {request.priority.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Real-time tracking active' : 'Tracking disconnected'}
          </span>
        </div>

        {/* Patient Information */}
        <div className="space-y-2">
          <h4 className="font-medium">Patient Information</h4>
          <p className="text-sm text-gray-600">Name: {request.patientName}</p>
          <p className="text-sm text-gray-600">Pickup: {request.pickupAddress}</p>
        </div>

        {/* Ambulance Information */}
        {request.ambulanceId && (
          <div className="space-y-2">
            <h4 className="font-medium">Ambulance Information</h4>
            <p className="text-sm text-gray-600">ID: {request.ambulanceId}</p>

            {ambulanceLocation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Lat: {ambulanceLocation.latitude.toFixed(6)},
                    Lng: {ambulanceLocation.longitude.toFixed(6)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(ambulanceLocation.timestamp).toLocaleTimeString()}
                </p>
                <Button
                  onClick={openInMaps}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Estimated Arrival */}
        {estimatedArrival && (
          <div className="flex flex-col gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Clock className="h-4 w-4" />
              <span>Estimated Arrival</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-900">{minutesLeft ?? '--'}</span>
              <span className="text-sm font-medium text-blue-600">minutes remaining</span>
            </div>
            <p className="text-xs text-blue-500">Scheduled: {new Date(estimatedArrival).toLocaleTimeString()}</p>
          </div>
        )}

        {/* Assigned Team */}
        {currentRequest.teamPersonnel && currentRequest.teamPersonnel.length > 0 && (
          <div className="space-y-2 py-2 border-t border-gray-100">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4 text-orange-500" />
              Medical Team En Route
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {currentRequest.teamPersonnel.map((member, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 italic">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-400" />
                    <span className="text-xs font-semibold text-gray-700">{member.role}</span>
                  </div>
                  <span className="text-xs text-gray-600">{member.name} {member.appId ? `(ID: ${member.appId})` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Update */}
        {currentRequest.patientConditionOnScene && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">On-Scene Assessment</h4>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-200 text-purple-800 border-purple-300">
                Patient {currentRequest.patientConditionOnScene}
              </Badge>
              <span className="text-xs text-purple-600 italic">Registered by medical team</span>
            </div>
          </div>
        )}

        {/* Handover Details */}
        {currentRequest.handoverDetails && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Handover Complete</h4>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-green-900">{currentRequest.handoverDetails.facilityName}</p>
              <p className="text-xs text-green-700">Received by: {currentRequest.handoverDetails.receiverName}</p>
              <p className="text-[10px] text-green-600">Contact: {currentRequest.handoverDetails.receiverPhone}</p>
              <p className="text-[10px] text-green-500 italic mt-1">Delivered at: {new Date(currentRequest.handoverDetails.deliveredAt).toLocaleTimeString()}</p>
            </div>
          </div>
        )}

        {/* Emergency Actions */}
        <div className="flex gap-2">
          <Button
            onClick={callAmbulanceVendors}
            className="bg-red-600 hover:bg-red-700 flex-1"
          >
            <Truck className="h-4 w-4 mr-2" />
            Ambulance Drivers / Medical Transport Teams
          </Button>
        </div>

        {/* Request Timeline */}
        <div className="space-y-2">
          <h4 className="font-medium">Timeline</h4>
          <div className="text-sm text-gray-600">
            <p>Created: {new Date(request.createdAt).toLocaleString()}</p>
            <p>Current Status: {requestStatus.replace('_', ' ')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
