
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone, MapPin, Truck, Heart, Shield, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { AmbulanceRequestDialog } from './AmbulanceRequestDialog';
import { emergencyService } from '@/services/emergencyService';

interface EmergencyContact {
  id: string;
  name: string;
  type: 'ambulance' | 'police' | 'fire' | 'hospital' | 'poison';
  number: string;
  description: string;
  available24h: boolean;
  distance?: number;
}

interface SOSAlert {
  id: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  status: 'active' | 'responded' | 'cancelled';
  type: string;
}

export function EmergencyServices() {
  const [sosActive, setSosActive] = useState(false);
  const [activeAlert, setActiveAlert] = useState<SOSAlert | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [emergencyContacts] = useState<EmergencyContact[]>([]);
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false);

  const handleAmbulanceRequest = async (data: any) => {
    try {
      if (!userLocation) throw new Error('Location required for ambulance dispatch');

      await emergencyService.requestAmbulance({
        ...data,
        pickupLatitude: userLocation.lat,
        pickupLongitude: userLocation.lng,
      });

      toast.success(`${data.requestType === 'emergency_team' ? 'Crisis Emergency Team' : 'Medical Transport Team'} dispatched!`);
    } catch (error) {
      toast.error('Failed to request ambulance. Please try again or call emergency.');
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const activateSOS = async () => {
    if (!userLocation) {
      toast.error('Unable to get your location. Please try again.');
      return;
    }

    const alert: SOSAlert = {
      id: Date.now().toString(),
      timestamp: new Date(),
      location: userLocation,
      status: 'active',
      type: 'general_emergency'
    };

    setActiveAlert(alert);
    setSosActive(true);

    toast.success('SOS alert activated! Emergency services have been notified of your location.');

    // In a real implementation, this would send the alert to emergency services
    console.log('SOS Alert sent:', alert);
  };

  const cancelSOS = () => {
    if (activeAlert) {
      setActiveAlert({ ...activeAlert, status: 'cancelled' });
    }
    setSosActive(false);
    toast.info('SOS alert cancelled');
  };

  const callEmergency = (contact: EmergencyContact) => {
    window.location.href = `tel:${contact.number}`;
  };

  const shareLocation = async () => {
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }

    const locationUrl = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Current Location',
          text: 'I need help at this location',
          url: locationUrl
        });
      } catch (error) {
        console.error('Error sharing location:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(locationUrl);
      toast.success('Location copied to clipboard');
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'ambulance': return <Truck className="h-4 w-4" />;
      case 'police': return <Shield className="h-4 w-4" />;
      case 'fire': return <AlertTriangle className="h-4 w-4" />;
      case 'hospital': return <Heart className="h-4 w-4" />;
      case 'poison': return <AlertTriangle className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  const getContactColor = (type: string) => {
    switch (type) {
      case 'ambulance': return 'bg-blue-100 text-blue-800';
      case 'police': return 'bg-purple-100 text-purple-800';
      case 'fire': return 'bg-red-100 text-red-800';
      case 'hospital': return 'bg-green-100 text-green-800';
      case 'poison': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dispatch Ambulance Section */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Truck className="h-5 w-5" />
            Dispatch Ambulance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-black uppercase text-blue-900">Transport Team</span>
              </div>
              <p className="text-[10px] text-blue-700 font-bold mb-4 uppercase leading-tight">For non-critical medical movement. Basic Support units.</p>
              <Button
                onClick={() => setIsAmbulanceModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Request Transport
              </Button>
            </div>

            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="text-xs font-black uppercase text-red-900">Crisis Team</span>
              </div>
              <p className="text-[10px] text-red-700 font-bold mb-4 uppercase leading-tight">Advanced Medical Experts (Doctor/Nurse). Full clinical access.</p>
              <Button
                onClick={() => setIsAmbulanceModalOpen(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Request Crisis Unit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SOS Alert Section */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Emergency SOS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!sosActive ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Press and hold the SOS button to alert emergency services with your current location.
              </p>
              <Button
                onClick={activateSOS}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold rounded-full"
                size="lg"
              >
                SOS EMERGENCY
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">SOS ACTIVE</h3>
                <p className="text-sm text-red-600 mb-3">
                  Emergency alert sent at {activeAlert?.timestamp.toLocaleTimeString()}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-red-600">
                  <MapPin className="h-3 w-3" />
                  Location shared with emergency services
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={cancelSOS} variant="outline">
                  Cancel Alert
                </Button>
                <Button onClick={shareLocation} variant="outline">
                  Share Location
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergencyContacts.length > 0 ? (
              emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getContactColor(contact.type)}`}>
                      {getContactIcon(contact.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{contact.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {contact.number}
                        </Badge>
                        {contact.available24h && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            24/7
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{contact.description}</p>
                      {contact.distance && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {contact.distance} km away
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => callEmergency(contact)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Call Now
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 italic text-sm">
                No local emergency contacts found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Viral Problem Reporting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Report Health Emergency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => toast.info('Viral outbreak reporting feature coming soon')}
              className="justify-start"
            >
              Report Viral Outbreak
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Food poisoning reporting feature coming soon')}
              className="justify-start"
            >
              Report Food Poisoning
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Environmental hazard reporting feature coming soon')}
              className="justify-start"
            >
              Environmental Hazard
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Public health concern reporting feature coming soon')}
              className="justify-start"
            >
              Public Health Concern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Location Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Location Services</span>
            </div>
            <Badge variant={userLocation ? "default" : "secondary"}>
              {userLocation ? "Active" : "Inactive"}
            </Badge>
          </div>
          {!userLocation && (
            <p className="text-xs text-gray-500 mt-2">
              Enable location services for faster emergency response
            </p>
          )}
        </CardContent>
      </Card>

      <AmbulanceRequestDialog
        open={isAmbulanceModalOpen}
        onOpenChange={setIsAmbulanceModalOpen}
        onSubmit={handleAmbulanceRequest}
      />
    </div>
  );
}
