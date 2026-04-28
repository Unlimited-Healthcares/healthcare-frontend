import React, { useState, useEffect } from 'react';
import { Star, Clock, MessageCircle, Eye, MapPin, Phone, Calendar, Stethoscope, Heart, CheckCircle2, Video, Building2, Cpu, Dna, Lock as LucideLock, Loader2 as LucideLoader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appointmentService } from '@/services/appointmentService';
import { discoveryService } from '@/services/discoveryService';
import { toast } from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/discovery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { cn, getLicenseStatus } from '@/lib/utils';

interface CompactDoctorCardProps {
  user: User;
  onRequest: (user: User) => void;
  onViewProfile: (userId: string) => void;
  isSelected?: boolean;
  isSelectable?: boolean;
  onSelect?: () => void;
  onCall?: (user: User) => void;
  selectedService?: string;
}

export const CompactDoctorCard: React.FC<CompactDoctorCardProps> = ({
  user,
  onRequest,
  onViewProfile,
  isSelected = false,
  isSelectable = false,
  onSelect,
  onCall,
  selectedService
}) => {
  const getInitials = (name: string | undefined | null) => {
    if (!name || name === 'Unknown' || typeof name !== 'string') return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  };

  // Find matching service price
  const getServicePrice = () => {
    if (!user.offeredServices || user.offeredServices.length === 0) return null;

    // 1. Try to find the specifically selected service
    if (selectedService) {
      const match = user.offeredServices.find(s =>
        s.name.toLowerCase().includes(selectedService.toLowerCase()) ||
        selectedService.toLowerCase().includes(s.name.toLowerCase())
      );
      if (match) return { price: match.price, currency: match.currency || 'USD', name: match.name };
    }

    // 2. If no match or no selected service, show the first/primary one
    const primary = user.offeredServices[0];
    return { price: primary.price, currency: primary.currency || 'USD', name: primary.name };
  };

  const servicePrice = getServicePrice();

  const { user: currentUser } = useAuth();
  const [accessVerified, setAccessVerified] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);

  const checkConsultationAccess = async () => {
    if (accessVerified || !currentUser || verifying) return;

    // Always grant access to the provider themselves or their center staff
    const providerUuid = user.id || (user as any).providerId || (user as any).metadata?.providerId;
    if (currentUser.id === user.id || currentUser.id === providerUuid) {
      setAccessVerified(true);
      return;
    }

    setVerifying(true);
    try {
      // 1. Check for confirmed/paid appointments or clinical sessions (Patient View)
      const appointmentsResponse = await appointmentService.getAppointments({
        providerId: user.id || user.publicId,
        patientId: currentUser.id,
        status: 'confirmed'
      });

      if (appointmentsResponse.data.length > 0) {
        setAccessVerified(true);
        return;
      }

      // 2. Check for Professional Collaboration (Professional View)
      // If the current user is a professional, they should have access if they have an active request
      const proRoles = ['doctor', 'nurse', 'pharmacy', 'diagnostic', 'maternity', 'staff', 'practitioner', 'allied_practitioner', 'biotech_engineer'];
      const isCurrentPro = currentUser.roles?.some(r => proRoles.includes(r));
      const isTargetPro = user.roles?.some(r => proRoles.includes(r));

      if (isCurrentPro && isTargetPro) {
        // Check for approved referrals or collaboration requests between these professionals
        const [sent, received] = await Promise.all([
          discoveryService.getSentRequests({ status: 'approved', limit: 50 }),
          discoveryService.getReceivedRequests({ status: 'approved', limit: 50 })
        ]);

        const hasActiveCollab = [...sent.requests, ...received.requests].some(req =>
          (req.senderId === user.id || req.recipientId === user.id) &&
          ['referral', 'consultation_request', 'collaboration', 'staff_invitation'].includes(req.requestType)
        );

        if (hasActiveCollab) {
          setAccessVerified(true);
          return;
        }
      }

      setAccessVerified(false);

      if (currentUserRole === 'patient') {
        toast.error('Gated Feature: A paid consultation or specialized grant is required to access direct clinical lines.', {
          icon: '🔐',
          duration: 4000
        });
      } else {
        toast.error('Professional Connection Required: You must be collaborating on a patient or have an approved connection to call this provider.', {
          icon: '🤝',
          duration: 4000
        });
      }
    } catch (err) {
      console.warn('Access verification failed:', err);
      setAccessVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const isAmbulanceTeam = currentUser?.roles?.includes('ambulance_service');
  const currentUserRole = currentUser?.roles?.[0] || 'patient';
  const isProfessionalViewingPatient = currentUserRole !== 'patient' && (user.roles?.includes('patient') || !!user.patientId);
  const belongsToCenter = (user as any)?.centerId || (user as any)?.metadata?.centerId || (user as any)?.profile?.centerId;

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all duration-300 ring-1 p-5 ${isSelected
        ? 'border-blue-500 bg-blue-50/50 shadow-blue-100 shadow-lg ring-blue-500/20 scale-[1.01]'
        : 'border-blue-200/60 shadow-sm hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-300 ring-blue-100/50 hover:-translate-y-1'
        } ${isSelectable ? 'cursor-pointer' : ''}`}
      onClick={() => isSelectable && onSelect && onSelect()}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Selection Checkbox */}
        {isSelectable && (
          <div className="flex items-center">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
              }`}>
              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
        )}

        {/* Top Info section for mobile */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 border-2 border-blue-100 shadow-sm">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-md text-xl">
              {getInitials(user.displayName || 'Unknown')}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Specialty */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 items-center mb-1">
                  <h3 className="font-bold text-gray-900 text-lg sm:text-xl truncate">
                    {user.displayName || (user.roles?.includes('patient') ? 'Unnamed Patient' : 'Unnamed Provider')}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 items-center">
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

                      // Define colors for each major category
                      const badgeColors: Record<string, string> = {
                        'doctor': 'bg-blue-600 text-white shadow-blue-100',
                        'allied_practitioner': 'bg-purple-600 text-white shadow-purple-100',
                        'nurse': 'bg-pink-600 text-white shadow-pink-100',
                        'biotech_engineer': 'bg-cyan-600 text-white shadow-cyan-100',
                        'pharmacist': 'bg-emerald-600 text-white shadow-emerald-100',
                        'virologist': 'bg-indigo-600 text-white shadow-indigo-100',
                        'diagnostic': 'bg-slate-700 text-white shadow-slate-100'
                      };

                      return (
                        <Badge key={role} className={cn("text-[9px] uppercase font-black border-0 py-0.5 px-2 h-auto shadow-sm flex items-center gap-1", badgeColors[role] || 'bg-slate-600')}>
                          {role === 'biotech_engineer' && <Cpu className="h-3 w-3" />}
                          {displayRole}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {user.specialty && (
                    <Badge className="text-[10px] sm:text-xs bg-slate-900 text-white border-0 px-2 py-0.5 font-bold uppercase tracking-widest italic">
                      ↳ {user.specialty}
                    </Badge>
                  )}
                  {user.licenseExpiryDate && (
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-tighter shadow-sm",
                      getLicenseStatus(user.licenseExpiryDate).bg,
                      getLicenseStatus(user.licenseExpiryDate).text,
                      getLicenseStatus(user.licenseExpiryDate).border
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full",
                        getLicenseStatus(user.licenseExpiryDate).status === 'good' ? 'bg-green-500 animate-pulse' :
                          getLicenseStatus(user.licenseExpiryDate).status === 'warning' ? 'bg-amber-500 animate-bounce' : 'bg-red-500'
                      )} />
                      {getLicenseStatus(user.licenseExpiryDate).message}
                    </div>
                  )}
                  {user.patientId && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs bg-indigo-50 text-indigo-700 border-indigo-200 px-2 py-0.5 font-bold">
                      {user.patientId}
                    </Badge>
                  )}
                  {user.rating != null && user.rating > 0 && (
                    <div className="flex items-center gap-1 bg-gradient-to-br from-amber-100/50 to-orange-50/50 px-2 py-0.5 rounded-lg border border-amber-100">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-700">
                        {(Number(user.rating) || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {servicePrice && (
                <div className={cn(
                  "mt-1 md:mt-0 px-3 py-1.5 rounded-xl border shadow-sm flex flex-col items-center md:items-end min-w-fit max-w-fit self-start",
                  user.roles?.includes('biotech_engineer')
                    ? "bg-cyan-700 border-cyan-600"
                    : "bg-emerald-600 border-emerald-500"
                )}>
                  <span className={cn(
                    "text-[7px] font-black uppercase tracking-widest flex items-center gap-1 whitespace-nowrap",
                    user.roles?.includes('biotech_engineer') ? "text-cyan-100" : "text-emerald-100"
                  )}>
                    {user.roles?.includes('biotech_engineer') ? <Cpu className="h-2 w-2" /> : <CheckCircle2 className="h-2 w-2" />}
                    {user.roles?.includes('biotech_engineer') ? "Professional Service Fee" : "Marketplace Verified"}
                  </span>
                  <span className="text-sm font-black text-white">
                    {servicePrice.currency} {servicePrice.price?.toLocaleString()}
                  </span>
                  {servicePrice.name && (
                    <span className="text-[8px] text-white/80 font-bold truncate max-w-[120px]">
                      {servicePrice.name}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Vitals for Patients */}
            {user.publicVitals && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Blood Group</span>
                  <span className="text-sm font-bold text-rose-600">{user.publicVitals.bloodGroup || user.publicVitals.bloodType || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">BP</span>
                  <span className="text-sm font-bold text-slate-900">{user.publicVitals.bp || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Heart Rate</span>
                  <span className="text-sm font-bold text-slate-900">{user.publicVitals.heartRate ? `${user.publicVitals.heartRate} bpm` : 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">SpO2</span>
                  <span className="text-sm font-bold text-blue-600">{user.publicVitals.spO2 ? `${user.publicVitals.spO2}%` : 'N/A'}</span>
                </div>
              </div>
            )}

            {/* Stats & Location */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 mb-4">
              {user.experience && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{user.experience} yrs exp.</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-rose-500" />
                  <span className="truncate font-bold text-slate-700">
                    {typeof user.location === 'string'
                      ? user.location
                      : `${user.location.city || ''}`.trim()
                    }
                    {user.distance && <Badge className="bg-blue-600 text-white ml-2 font-black px-1.5 py-0 rounded-full text-[9px]">{user.distance}</Badge>}
                  </span>
                </div>
              )}
              {selectedService && selectedService.includes(',') && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] py-0 px-2 w-fit">
                  Matches {(selectedService.split(',').length)} Services
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            {/* Action Buttons - Gated for Institutional Control */}
            {belongsToCenter && currentUserRole === 'patient' ? (
              /* Institutional Routing: Force patient through the hospital secretary */
              <Button
                onClick={() => onViewProfile(user.publicId)}
                className="col-span-3 h-11 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl active:scale-[0.98] transition-all"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Contact Hospital Registry
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => onViewProfile(user.publicId)}
                  variant="outline"
                  size="sm"
                  className="w-full h-10 text-[9px] sm:text-[10px] md:text-[11px] font-black border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 text-blue-800 uppercase tracking-tighter"
                >
                  <Eye className="h-4 w-4 mr-1.5 shrink-0" />
                  <span className="truncate">{(user.roles?.includes('patient') || user.patientId) ? 'View Record' : 'Review Profile'}</span>
                </Button>

                <DropdownMenu onOpenChange={(open) => open && checkConsultationAccess()}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={verifying}
                      className={cn(
                        "w-full h-10 text-[9px] sm:text-[10px] md:text-[11px] font-black border-2 transition-all uppercase tracking-tighter",
                        isAmbulanceTeam
                          ? "border-rose-600 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-rose-100 shadow-lg"
                          : accessVerified === false
                            ? "border-amber-200 bg-amber-50/30 text-amber-700 hover:bg-amber-100"
                            : "border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 text-emerald-800"
                      )}
                    >
                      {verifying ? <LucideLoader className="h-4 w-4 mr-1.5 animate-spin" /> : isAmbulanceTeam ? <Phone className="h-4 w-4 mr-1.5 shrink-0 animate-pulse" /> : accessVerified === false ? <LucideLock className="h-4 w-4 mr-1.5 shrink-0" /> : <Phone className="h-4 w-4 mr-1.5 shrink-0" />}
                      <span className="truncate">{isAmbulanceTeam ? 'EMERGENCY CONSULT' : accessVerified === false ? 'PAY TO UNLOCK CALL' : 'Call / Consult'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-[2rem] border-2 border-emerald-100 bg-white shadow-2xl animate-in zoom-in duration-200">
                    <div className="px-3 py-2 mb-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Clinical Access Level</p>
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">
                        {isAmbulanceTeam ? "🚨 Emergency Institutional Session" : accessVerified ? "✅ Verified Institutional Session" : "🔐 Standard Access (Payment Required)"}
                      </p>
                    </div>

                    <DropdownMenuItem
                      disabled={!accessVerified && !isAmbulanceTeam}
                      onClick={() => onCall ? onCall(user) : window.open(`tel:${user.profile?.phoneNumber || user.phone || ''}`)}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer rounded-2xl group transition-all",
                        (accessVerified || isAmbulanceTeam) ? "hover:bg-emerald-50" : "opacity-50 grayscale cursor-not-allowed"
                      )}
                    >
                      <div className={cn("p-2 rounded-xl transition-colors", (accessVerified || isAmbulanceTeam) ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" : "bg-slate-100 text-slate-400")}>
                        {(!accessVerified && !isAmbulanceTeam) ? <LucideLock className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center justify-between">
                          Voice Call
                          {(!accessVerified && !isAmbulanceTeam) && <Badge className="bg-amber-100 text-amber-700 border-none text-[7px] font-black">LOCKED</Badge>}
                          {isAmbulanceTeam && <Badge className="bg-rose-100 text-rose-700 border-none text-[7px] font-black">EMERGENCY</Badge>}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium lowercase">Direct audio connection</p>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={!accessVerified && !isAmbulanceTeam}
                      onClick={() => {
                        if (onCall) onCall({ ...user, metadata: { ...user.metadata, callType: 'video' } } as any);
                        else window.open(`tel:${user.profile?.phoneNumber || user.phone || ''}`);
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer rounded-2xl group transition-all mt-1",
                        (accessVerified || isAmbulanceTeam) ? "hover:bg-blue-50" : "opacity-50 grayscale cursor-not-allowed"
                      )}
                    >
                      <div className={cn("p-2 rounded-xl transition-colors", (accessVerified || isAmbulanceTeam) ? "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" : "bg-slate-100 text-slate-400")}>
                        {(!accessVerified && !isAmbulanceTeam) ? <LucideLock className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center justify-between">
                          Video Consult
                          {accessVerified === false && <Badge className="bg-blue-100 text-blue-700 border-none text-[7px] font-black">PREMIUM</Badge>}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium lowercase">Face-to-face HD session</p>
                      </div>
                    </DropdownMenuItem>

                    {accessVerified === false && (
                      <div className="mt-2 p-3 bg-blue-600 rounded-[1.5rem] text-center shadow-lg shadow-blue-200 animate-pulse border border-white/20">
                        <p className="text-[8px] font-black text-blue-100 uppercase tracking-widest mb-1.5">Consultation Barrier Active</p>
                        <DropdownMenuItem
                          asChild
                          onSelect={() => {
                            // The DropdownMenuItem onSelect automatically closes the menu
                            onRequest(user);
                          }}
                        >
                          <Button
                            size="sm"
                            className="w-full h-8 bg-white text-blue-700 hover:bg-white/90 font-black text-[9px] uppercase tracking-widest rounded-xl shadow-sm cursor-pointer border-none"
                          >
                            Book & Pay to Unlock
                          </Button>
                        </DropdownMenuItem>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={() => onRequest(user)}
                  size="sm"
                  className={cn(
                    "w-full h-10 text-[9px] sm:text-[10px] md:text-[11px] font-black shadow-md hover:shadow-xl transition-all duration-300 uppercase tracking-tighter outline-none focus:ring-2 focus:ring-offset-2",
                    isProfessionalViewingPatient ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white ring-indigo-500" :
                      currentUserRole !== 'patient' && !user.roles?.includes('patient')
                        ? "bg-gradient-to-r from-orange-500 to-rose-600 text-white ring-orange-500"
                        : "bg-gradient-to-r from-blue-700 to-indigo-800 text-white ring-blue-500"
                  )}
                >
                  {currentUserRole !== 'patient' && !user.roles?.includes('patient') ? (
                    <MessageCircle className="h-4 w-4 mr-1.5 shrink-0" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-1.5 shrink-0" />
                  )}
                  <span className="truncate">
                    {isProfessionalViewingPatient
                      ? 'CONSULTATION REQUEST'
                      : currentUserRole !== 'patient' && !user.roles?.includes('patient')
                        ? 'REFER / LINK'
                        : 'CONSULT A PRACTITIONER'}
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
