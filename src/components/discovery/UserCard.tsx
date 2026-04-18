import React from 'react';
import { MapPin, Star, Clock, GraduationCap, MessageCircle, User, Phone, Microscope, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserType } from '@/types/discovery';

interface UserCardProps {
  user: UserType;
  onRequest: (user: UserType) => void;
  onViewProfile: (userId: string) => void;
  onContact?: (user: UserType) => void;
  showActions?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onRequest,
  onViewProfile,
  onContact,
  showActions = true
}) => {
  const getInitials = (name: string | undefined | null) => {
    if (!name || name === 'Unknown' || typeof name !== 'string') return 'DR';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatExperience = (experience?: string) => {
    if (!experience) return 'New';
    return experience;
  };

  const getRatingColor = (rating?: number | string) => {
    const numRating = Number(rating);
    if (!numRating || isNaN(numRating)) return 'text-gray-400';
    if (numRating >= 4.5) return 'text-green-600';
    if (numRating >= 4.0) return 'text-yellow-600';
    if (numRating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(user.displayName || 'Unknown')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.displayName || 'Dr. Unknown'}
              </h3>

              <div className="mt-1.5 space-y-1">
                {user.roles?.filter(r => ['doctor', 'allied_practitioner', 'nurse', 'biotech_engineer', 'virologist', 'pharmacist', 'diagnostic'].includes(r)).map((role: string) => {
                  const roleDisplayMap: Record<string, string> = {
                    'doctor': 'Health Care Practitioner',
                    'allied_practitioner': 'Allied Healthcare Practitioner',
                    'nurse': 'Nursing Practitioner',
                    'biotech_engineer': 'Biotech Engineer',
                    'virologist': 'Virology Specialist',
                    'pharmacist': 'Pharmacy Practitioner',
                    'diagnostic': 'Diagnostic Specialist'
                  };

                  const displayRole = roleDisplayMap[role] || role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');

                  return (
                    <div key={role} className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit border border-blue-100 italic">
                        {displayRole}
                      </span>
                      {user.specialty && (
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter border-l-2 border-blue-600 pl-2 ml-1/2 mt-0.5">
                          ↳ {user.specialty}
                        </span>
                      )}
                    </div>
                  );
                })}

                {(!user.roles || user.roles.length === 0 || !user.roles.some(r => ['doctor', 'allied_practitioner', 'nurse', 'biotech_engineer', 'virologist', 'pharmacist', 'diagnostic'].includes(r))) && (
                  user.specialty ? (
                    <Badge variant="secondary">
                      {user.specialty}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      Profile Incomplete
                    </Badge>
                  )
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                {user.experience && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatExperience(user.experience)}</span>
                  </div>
                )}

                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {typeof user.location === 'string'
                        ? user.location
                        : `${user.location.city}, ${user.location.state}`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {user.rating && (
            <div className="flex items-center gap-1">
              <Star className={`h-4 w-4 ${getRatingColor(user.rating)}`} />
              <span className={`font-semibold ${getRatingColor(user.rating)}`}>
                {(Number(user.rating) || 0).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Qualifications */}
        {user.qualifications && user.qualifications.length > 0 ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Qualifications</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {user.qualifications.slice(0, 3).map((qual, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {qual}
                </Badge>
              ))}
              {user.qualifications.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{user.qualifications.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        ) : !user.specialty && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              This doctor's profile is incomplete. Reach out to them to learn more about their qualifications.
            </p>
          </div>
        )}

        {/* Availability Status */}
        {user.availability && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">
                {user.availability.generalAvailability || 'Available'}
              </span>
            </div>
          </div>
        )}

        {/* Services & Pricing - Diagnostic Focus */}
        {user.offeredServices && user.offeredServices.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Microscope className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Offered Diagnostics</span>
            </div>
            <div className="space-y-1.5">
              {user.offeredServices.slice(0, 4).map((service, index) => (
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
              {user.offeredServices.length > 4 && (
                <p className="text-[10px] text-gray-400 font-medium pl-1">+{user.offeredServices.length - 4} more specialized services</p>
              )}
            </div>
          </div>
        )}

        {/* Contact Information - Restored for Clinical Discovery */}
        {(user.phone || user.profile?.phoneNumber) && (
          <div className="mb-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-blue-700 font-bold bg-blue-50/50 p-2 rounded-lg border border-blue-100 w-fit">
              <Phone className="h-4 w-4 shrink-0" />
              <a href={`tel:${user.phone || user.profile?.phoneNumber}`} className="hover:underline">
                {user.phone || user.profile?.phoneNumber}
              </a>
            </div>
            <p className="text-[9px] text-gray-400 mt-1 uppercase font-black tracking-widest">Registered Contact Number</p>
          </div>
        )}

        {/* Action Buttons - Gated for Institutional Control */}
        {showActions && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            {((user as any).centerId || (user as any).metadata?.centerId) ? (
              <Button
                onClick={() => onViewProfile(user.publicId)}
                className="flex-1 bg-slate-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-widest h-10 rounded-xl shadow-md"
                size="sm"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Contact Hospital Registry
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => onRequest(user)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-tight h-10 rounded-xl shadow-md"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4 mr-1.5 shrink-0" />
                  {user.specialty ? `${user.specialty} Consultation` : 'Professional Consultation'}
                </Button>

                <Button
                  onClick={() => onViewProfile(user.publicId)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>

                {onContact && (
                  <Button
                    onClick={() => onContact(user)}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
