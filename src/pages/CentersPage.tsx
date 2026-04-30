import React, { useState, useEffect } from 'react';
import { Building2, Search, MapPin, RefreshCw, Navigation, Heart, Star, Shield, Clock, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CenterList from '@/components/centers/CenterList';
import { centerToHealthcareCenter } from '@/utils/centerTypeAdapter';
import { RequestModal } from '@/components/requests/RequestModal';
import { discoveryService } from '@/services/discoveryService';
import { Center, CenterSearchParams, CenterSearchResponse, CENTER_TYPES } from '@/types/discovery';
import { toast } from 'react-hot-toast';
import { LocationServices } from '@/components/location/LocationServices';
import { cn } from '@/lib/utils';

const CentersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<CenterSearchParams>({
    type: '',
    location: '',
    radius: 25,
    page: 1,
    limit: 20
  });

  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Perform search
  const performSearch = async (params: CenterSearchParams, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const response: CenterSearchResponse = await discoveryService.searchCenters(params);

      if (append) {
        setCenters(prev => [...prev, ...response.centers]);
      } else {
        setCenters(response.centers);
      }
      setTotalResults(response.total);
      setHasMore(response.page < response.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    const newParams = { ...searchParams, page: 1 };
    setSearchParams(newParams);
    performSearch(newParams);
  };

  // Handle load more
  const handleLoadMore = () => {
    const newParams = { ...searchParams, page: (searchParams.page || 1) + 1 };
    setSearchParams(newParams);
    performSearch(newParams, true);
  };

  // Handle view details
  const handleViewDetails = (centerId: string) => {
    window.open(`/centers/${centerId}`, '_blank');
  };

  // Handle center click (for CenterList integration)
  const handleCenterClick = (center: any) => {
    handleViewDetails(center.id);
  };

  // Handle send request
  const handleSendRequest = (center: any) => {
    const centerData: Center = {
      id: center.id,
      publicId: center.displayId,
      name: center.name,
      type: center.type,
      address: center.address,
      city: center.city,
      state: center.state,
      zipCode: center.postalCode,
      latitude: center.latitude,
      longitude: center.longitude,
      generalLocation: {
        city: center.city || '',
        state: center.state || '',
        country: center.country || ''
      },
      hours: center.hours,
      phone: center.phone,
      email: center.email,
      isActive: center.isActive,
      createdAt: center.createdAt
    };
    setSelectedCenter(centerData);
    setShowRequestModal(true);
  };

  const handleRequestModalClose = () => {
    setShowRequestModal(false);
    setSelectedCenter(null);
  };

  const handleRequestSent = () => {
    toast.success('Request sent successfully!');
    handleRequestModalClose();
  };

  const filteredCenters = centers.filter(center =>
    searchTerm === '' ||
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (center.type && center.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (center.city && center.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    center.services?.some(service =>
      service.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    performSearch(searchParams);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 py-12 sm:py-16 mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <Badge className="bg-blue-500/20 text-blue-400 border-none px-4 py-1.5 mb-4 font-black uppercase text-[10px] tracking-widest">
              Advanced Discovery Hub
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 uppercase">
              Global Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Centers</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-bold leading-relaxed max-w-xl">
              Connect with accredited hospitals, specialized clinics, and emergency facilities worldwide through our intelligent routing network.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16">
        {/* Glassmorphism Search Hub */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white/80 backdrop-blur-xl mb-8 overflow-hidden">
          <div className="bg-slate-900/5 px-6 py-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Precision Filters</span>
            </div>
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Facility Type</Label>
                <Select
                  value={searchParams.type || 'all'}
                  onValueChange={(value) => setSearchParams({ ...searchParams, type: value === 'all' ? '' : value })}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:ring-blue-500/20 transition-all font-bold text-xs uppercase">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                    <SelectItem value="all">All Types</SelectItem>
                    {CENTER_TYPES.map(type => (
                      <SelectItem key={type} value={type.toLowerCase()} className="text-xs font-bold uppercase py-3">
                        {type === 'Ambulance' ? 'Ambulance / Medical Transport' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location Node</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="City, State or ZIP"
                    value={searchParams.location || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                    className="h-12 pl-12 rounded-2xl border-slate-100 bg-white/50 focus:ring-blue-500/20 transition-all font-bold text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Search Radius</Label>
                <Select
                  value={searchParams.radius?.toString() || '25'}
                  onValueChange={(value) => setSearchParams({ ...searchParams, radius: parseInt(value) })}
                >
                  <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:ring-blue-500/20 transition-all font-bold text-xs uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                    <SelectItem value="5" className="text-xs font-bold uppercase py-3">5 miles</SelectItem>
                    <SelectItem value="10" className="text-xs font-bold uppercase py-3">10 miles</SelectItem>
                    <SelectItem value="25" className="text-xs font-bold uppercase py-3">25 miles</SelectItem>
                    <SelectItem value="50" className="text-xs font-bold uppercase py-3">50 miles</SelectItem>
                    <SelectItem value="100" className="text-xs font-bold uppercase py-3">100 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Entity Name</Label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 pl-12 rounded-2xl border-slate-100 bg-white/50 focus:ring-blue-500/20 transition-all font-bold text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest gap-3 shadow-xl shadow-slate-200 transition-all group"
              >
                <Search className={cn("h-4 w-4 transition-transform group-hover:scale-110", loading && "animate-spin")} />
                {loading ? 'Processing Node...' : 'Search Network'}
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNearby(!showNearby)}
                  className={cn(
                    "h-14 px-6 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest gap-2 transition-all border-2",
                    showNearby ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "border-slate-100 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <MapPin className="h-4 w-4" />
                  {showNearby ? 'Active Node' : 'Nearby Services'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                  className={cn(
                    "h-14 px-6 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest gap-2 transition-all border-2",
                    showMap ? "bg-blue-50 border-blue-200 text-blue-600" : "border-slate-100 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Navigation className="h-4 w-4" />
                  {showMap ? 'Hide Map' : 'Global Map'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Services Integration */}
        {showNearby && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <LocationServices onSelectCenter={(center) => {
              setSelectedCenter(center as any);
            }} />
          </div>
        )}

        {/* Results Stream */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Network Results
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {totalResults} Verified Healthcare Entities Found
              </p>
            </div>
          </div>

          {loading && (
            <div className="py-24 text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-6 opacity-20" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Global Facility Registry...</p>
            </div>
          )}

          {error && (
            <div className="py-20 text-center bg-rose-50 rounded-[2.5rem] border-2 border-dashed border-rose-100">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Shield className="h-8 w-8 text-rose-500" />
              </div>
              <p className="text-sm font-black text-rose-900 uppercase tracking-tight mb-2">Protocol Error</p>
              <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-6">{error}</p>
              <Button onClick={handleSearch} variant="outline" className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-100 font-black uppercase text-[10px] tracking-widest h-12 px-8">
                Attempt Re-Sync
              </Button>
            </div>
          )}

          {!loading && !error && filteredCenters.length === 0 && (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <Building2 className="h-16 w-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
                Node Silent
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                No healthcare entities matched the current search criteria in this sector.
              </p>
              <Button onClick={() => setSearchParams({ ...searchParams, type: '', location: '' })} variant="link" className="mt-6 text-[10px] font-black uppercase text-blue-600 tracking-widest">
                Reset Search Parameters
              </Button>
            </div>
          )}

          {!loading && !error && filteredCenters.length > 0 && (
            <div className="animate-in fade-in duration-700">
              <CenterList
                centers={filteredCenters.map(centerToHealthcareCenter)}
                loading={loading}
                error={error}
                onCenterClick={handleCenterClick}
                onSendRequest={handleSendRequest}
                showDistance={false}
                viewMode="grid"
                hideControls={true}
              />
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={loading}
                className="h-14 px-12 border-2 border-slate-200 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all gap-3"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Expanding Registry...
                  </>
                ) : (
                  <>
                    Load More Entities
                  </>
                )}
              </Button>
            </div>
          )}

          {!loading && !error && filteredCenters.length > 0 && (
            <div className="pt-12 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Displaying {filteredCenters.length} of {totalResults} Nodes · Sector Analysis Complete
              </p>
            </div>
          )}
        </div>
      </div>

      {showRequestModal && selectedCenter && (
        <RequestModal
          isOpen={showRequestModal}
          onClose={handleRequestModalClose}
          recipient={selectedCenter}
          onSend={handleRequestSent}
        />
      )}
    </div>
  );
};

export default CentersPage;

