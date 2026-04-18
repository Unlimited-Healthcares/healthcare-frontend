import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, Star } from 'lucide-react';
import { toast } from 'sonner';
import { discoveryService } from '@/services/discoveryService';
import { Center } from '@/types/discovery';
import { RefreshCw } from 'lucide-react';

interface LocationServicesProps {
  onSelectCenter?: (center: Center) => void;
}

const centerTypes = [
  'all',
  'Hospital',
  'Clinic',
  'Pharmacy',
  'Diagnostic Center',
  'Ambulance',
  'Dental',
  'Eye'
];

export function LocationServices({ onSelectCenter }: LocationServicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const radius = 25;

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocationPermission('granted');
        setIsLoading(false);
        toast.success('Location updated');
      },
      (error) => {
        setLocationPermission('denied');
        setIsLoading(false);
        console.error('Geolocation error:', error);
        toast.error('Could not get your location. Please grant permission.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, []);

  const searchNearbyServices = useCallback(async () => {
    if (!userCoords) return;

    setIsLoading(true);

    try {
      const results = await discoveryService.getNearbyCenters(
        userCoords.lat,
        userCoords.lng,
        radius
      );

      let filteredCenters = results || [];

      if (selectedType !== 'all') {
        filteredCenters = filteredCenters.filter(center =>
          center.type?.toLowerCase() === selectedType.toLowerCase()
        );
      }

      if (searchTerm) {
        filteredCenters = filteredCenters.filter(center =>
          center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (center.type && center.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (center.address && center.address.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setCenters(filteredCenters);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search nearby services');
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, searchTerm, userCoords, radius]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (locationPermission === 'granted') {
      searchNearbyServices();
    }
  }, [searchNearbyServices, locationPermission]);

  const openDirections = (center: Center) => {
    if (!center.latitude || !center.longitude) {
      toast.error('Coordinates not available for this center');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Healthcare Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {locationPermission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">
                  Location access is required to discovery nearby centers.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={getCurrentLocation} className="shrink-0">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search centers by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={getCurrentLocation} title="Refresh my location">
              <Navigation className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {centerTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Searching nearby services...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {centers.map((center) => (
            <Card key={center.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{center.name}</h3>
                      <Badge variant={center.isActive ? "default" : "secondary"} className={center.isActive ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" : ""}>
                        {center.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {center.type === 'Hospital' && (
                        <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                          Emergency 24/7
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm font-medium text-blue-600 mb-1">
                      {center.type}
                    </p>

                    <p className="text-sm text-gray-500 mb-3 flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-1 shrink-0" />
                      {center.address}, {center.city}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Open: {center.hours || '24 hrs'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{center.rating || '4.5'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => openDirections(center)}
                      className="flex-1 md:w-32 bg-blue-600 hover:bg-blue-700"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Directions
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onSelectCenter?.(center as any);
                        window.open(`/centers/${center.id}`, '_blank');
                      }}
                      className="flex-1 md:w-32"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {centers.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No healthcare services found matching your criteria.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
