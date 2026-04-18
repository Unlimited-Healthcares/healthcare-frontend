import React from 'react';
import { MapPin, Star, Clock, Users, Phone, Mail, Globe, Navigation, Send, Eye, MessageCircle, Calendar, CheckCircle2, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Center } from '@/types/discovery';
import { formatDistanceToNow } from 'date-fns';
import { Video } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface CenterCardProps {
  center: Center;
  onViewDetails: (centerId: string) => void;
  onContact?: (center: Center) => void;
  onGetDirections?: (center: Center) => void;
  onSendRequest?: (center: Center) => void;
  showActions?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  selectedService?: string;
}

export const CenterCard: React.FC<CenterCardProps> = ({
  center,
  onViewDetails,
  onContact,
  onGetDirections,
  onSendRequest,
  showActions = true,
  isSelectable = false,
  isSelected = false,
  onSelect,
  selectedService
}) => {
  const { user: currentUser } = useAuth();
  const isAmbulanceTeam = currentUser?.roles?.includes('ambulance_service');

  const getRatingColor = (rating?: number | string) => {
    const numRating = Number(rating);
    if (!numRating || isNaN(numRating)) return 'text-gray-400';
    if (numRating >= 4.5) return 'text-green-600';
    if (numRating >= 4.0) return 'text-yellow-600';
    if (numRating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCenterTypeColor = (type: string | undefined) => {
    if (!type || typeof type !== 'string') return 'bg-gray-100 text-gray-800';

    const colors: Record<string, string> = {
      hospital: 'bg-red-100 text-red-800',
      clinic: 'bg-blue-100 text-blue-800',
      'eye clinic': 'bg-purple-100 text-purple-800',
      'maternity center': 'bg-pink-100 text-pink-800',
      'emergency center': 'bg-orange-100 text-orange-800',
      'rehabilitation center': 'bg-green-100 text-green-800',
      'mental health center': 'bg-indigo-100 text-indigo-800',
      'dental clinic': 'bg-cyan-100 text-cyan-800',
      'veterinary clinic': 'bg-yellow-100 text-yellow-800',
      diagnostic: 'bg-gray-100 text-gray-800',
      'imaging center': 'bg-teal-100 text-teal-800',
      pharmacy: 'bg-amber-100 text-amber-800'
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getServicePrice = () => {
    if (!center.offeredServices || center.offeredServices.length === 0) return null;

    if (selectedService) {
      const match = center.offeredServices.find(s =>
        s.name.toLowerCase().includes(selectedService.toLowerCase()) ||
        selectedService.toLowerCase().includes(s.name.toLowerCase())
      );
      if (match) return { price: match.price, currency: match.currency || 'USD', name: match.name };
    }

    const primary = center.offeredServices[0];
    return { price: primary.price, currency: primary.currency || 'USD', name: primary.name };
  };

  const servicePrice = getServicePrice();

  const formatOperatingHours = (hours: any) => {
    if (!hours) return 'Hours not available';

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[today];

    if (todayHours && todayHours.length > 0) {
      const firstSlot = todayHours[0];
      return `${firstSlot.start} - ${firstSlot.end}`;
    }

    return 'Hours not available';
  };

  const getFullAddress = () => {
    const parts = [
      center.address,
      center.city,
      center.state,
      center.zipCode
    ].filter(Boolean);
    return parts.join(', ') || 'Address not available';
  };

  return (
    <Card
      className={`w-full transition-all duration-200 ${isSelected
        ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20'
        : 'hover:shadow-lg'
        } ${isSelectable ? 'cursor-pointer' : ''}`}
      onClick={() => isSelectable && onSelect && onSelect()}
    >
      <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
        <div className="flex flex-col sm:flex-row items-start gap-4 justify-between w-full min-w-0">
          <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
            {/* Selection Checkbox */}
            {isSelectable && (
              <div className="mt-1 flex-shrink-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                  }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {center.name}
                </h3>
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <Badge className={cn(getCenterTypeColor(center.type), "w-fit uppercase text-[9px] font-black tracking-[0.15em] shadow-sm rounded-md px-2")}>
                    {center.type ? center.type.replace(/[_-]/g, ' ') : 'Unknown Center'}
                  </Badge>
                  {((center as any).specialty || (center as any).specialization) && (
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic pl-2 border-l-2 border-blue-500 bg-slate-50/50 pr-2 py-0.5 rounded-r-sm w-fit">
                      ↳ {(center as any).specialty || (center as any).specialization}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                  <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                  <span className="truncate">{getFullAddress()}</span>
                  {center.distance && <Badge className="bg-blue-600 text-white ml-1 font-black px-1.5 py-0 rounded-full text-[9px]">{center.distance}</Badge>}
                </div>
                {selectedService && selectedService.includes(',') && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] py-0 px-1 w-fit">
                    Multi-Service Fit
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-start">
            {center.rating && (
              <div className="flex items-center gap-1.5 bg-gradient-to-br from-amber-50 to-orange-50 px-2 py-1 rounded-lg border border-amber-100 shrink-0">
                <Star className={`h-3.5 w-3.5 fill-amber-400 text-amber-400`} />
                <span className={`text-xs font-bold text-amber-700`}>
                  {(Number(center.rating) || 0).toFixed(1)}
                </span>
              </div>
            )}

            {servicePrice && (
              <div className="bg-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-500 shadow-sm flex flex-col items-center sm:items-end min-w-fit sm:min-w-[120px] shrink-0">
                <span className="text-[7px] font-black text-emerald-100 uppercase tracking-widest flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle2 className="h-2 w-2" /> Marketplace Verified
                </span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {servicePrice.currency} {servicePrice.price?.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-4 sm:px-6">
        {/* Services & Pricing - Diagnostic Focus */}
        {center.offeredServices && center.offeredServices.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Microscope className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Offered Diagnostics</span>
            </div>
            <div className="space-y-1.5">
              {center.offeredServices.slice(0, 4).map((service, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 group hover:bg-white hover:border-blue-200 transition-all">
                  <span className="text-xs font-medium text-slate-700">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-blue-700">
                      {service.currency || 'USD'} {service.price?.toLocaleString()}
                    </span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[8px] font-black px-1 h-3.5">
                      VERIFIED
                    </Badge>
                  </div>
                </div>
              ))}
              {center.offeredServices.length > 4 && (
                <p className="text-[10px] text-gray-400 font-medium pl-1">+{center.offeredServices.length - 4} more specialized services</p>
              )}
            </div>
          </div>
        )}

        {/* Previous simple services list - keeping as fallback or removing if redundant */}
        {(!center.offeredServices || center.offeredServices.length === 0) && center.services && center.services.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Capabilities</h4>
            <div className="flex flex-wrap gap-1">
              {center.services.slice(0, 4).map((service, index) => (
                <Badge key={`${center.id}-service-${index}`} variant="outline" className="text-[10px] sm:text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Operating Hours */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Today's Hours</span>
          </div>
          <p className="text-sm text-gray-600">{formatOperatingHours(center.operatingHours)}</p>
        </div>

        {/* Contact Information */}
        <div className="mb-4 space-y-2">
          {center.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 shrink-0" />
              <a href={`tel:${center.phone}`} className="hover:text-blue-600 truncate">
                {center.phone}
              </a>
            </div>
          )}

          {center.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${center.email}`} className="hover:text-blue-600 truncate">
                {center.email}
              </a>
            </div>
          )}

          {center.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4 shrink-0" />
              <a
                href={center.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 truncate"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4 border-t border-gray-200">
            <Button
              onClick={() => onViewDetails(center.id)}
              variant="outline"
              size="sm"
              className="w-full h-10 text-[9px] sm:text-[10px] md:text-[11px] font-black border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 text-blue-800 uppercase tracking-tighter"
            >
              <Eye className="h-4 w-4 mr-1.5 shrink-0" />
              <span className="truncate">Review Profile</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full h-10 text-[9px] sm:text-[10px] md:text-[11px] font-black border-2 transition-all uppercase tracking-tighter",
                    isAmbulanceTeam
                      ? "border-rose-600 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-rose-100 shadow-lg"
                      : "border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 text-emerald-800"
                  )}
                >
                  {isAmbulanceTeam ? <Phone className="h-4 w-4 mr-1.5 shrink-0 animate-pulse" /> : <Phone className="h-4 w-4 mr-1.5 shrink-0" />}
                  <span className="truncate">{isAmbulanceTeam ? 'EMERGENCY CALL' : 'Call / Consult'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-2 border-emerald-100 bg-white shadow-2xl">
                <DropdownMenuItem
                  onClick={() => onContact ? onContact(center) : window.open(`tel:${center.phone || ''}`)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-emerald-50 rounded-lg group transition-colors"
                >
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Voice Call</p>
                    <p className="text-[10px] text-slate-500 font-medium lowercase">Direct audio connection</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (onContact) onContact({ ...center, metadata: { ...((center as any).metadata || {}), callType: 'video' } } as any);
                    else window.open(`tel:${center.phone || ''}`);
                  }}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-blue-50 rounded-lg group transition-colors mt-1"
                >
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Video Consult</p>
                    <p className="text-[10px] text-slate-500 font-medium lowercase">Face-to-face HD session</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {onSendRequest && (
              <Button
                onClick={() => onSendRequest(center)}
                size="sm"
                className="w-full h-10 text-[9px] sm:text-[10px] md:text-[11px] font-black bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white shadow-md hover:shadow-xl transition-all duration-300 uppercase tracking-tighter"
              >
                <Calendar className="h-4 w-4 mr-1.5 shrink-0" />
                <span className="truncate">{center.type ? `${center.type} Consultation` : 'Clinical Consultation'}</span>
              </Button>
            )}
          </div>
        )}

        {/* Status */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs">
            <span className="text-gray-500 font-medium">
              Status: <span className={center.isActive ? 'text-green-600' : 'text-red-600'}>{center.isActive ? 'Active' : 'Inactive'}</span>
            </span>
            <span className="text-gray-500 italic">
              {center.createdAt && !isNaN(new Date(center.createdAt).getTime())
                ? `Joined ${formatDistanceToNow(new Date(center.createdAt), { addSuffix: true })}`
                : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
