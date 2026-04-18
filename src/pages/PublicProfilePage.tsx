import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Star, Clock, GraduationCap, MessageCircle,
  Phone, Building2, AlertCircle, Loader2, Heart, X,
  CheckCircle2, Briefcase, Mail, Globe, Calendar,
  ShieldCheck, Award, CreditCard, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RequestModal } from '@/components/requests/RequestModal';
import { CenterStaffList } from '@/components/dashboard/CenterStaffList';
import { discoveryService } from '@/services/discoveryService';
import { User, Center } from '@/types/discovery';
import { toast } from 'react-hot-toast';
import { getLicenseStatus } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';

const PublicProfilePage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | Center | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);
  const { user } = useAuth();
  const [hasAppointment, setHasAppointment] = useState(false);
  const [initialRequestType, setInitialRequestType] = useState<string>('connection');

  const isCenter = profile ? ('type' in profile && 'address' in profile) : false;
  const isPatient = profile && !isCenter ? ((profile as User).roles?.includes('patient') || (profile as User).patientId) : false;
  const displayName = profile ? (isCenter ? (profile as Center).name : (profile as User).name || (profile as User).displayName) : '';
  const rating = (profile as any)?.rating || 0;
  const reviewCount = (profile as any)?.reviewCount || 0;
  const belongsToCenter = (profile as any).centerId || (profile as any).metadata?.centerId || (profile as any).profile?.centerId;

  useEffect(() => {
    const loadProfile = async () => {
      if (!publicId) {
        setError('Profile ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to load as user profile first
        try {
          const userProfile = await discoveryService.getUserProfile(publicId);
          setProfile(userProfile);
        } catch (userError: any) {
          // If user profile fails, try to load as center
          if (userError?.response?.status === 404) {
            try {
              const centerProfile = await discoveryService.getCenterProfile(publicId);
              setProfile(centerProfile);
            } catch (centerError: any) {
              if (centerError?.response?.status === 404) {
                setError('Profile not found');
              } else {
                throw centerError;
              }
            }
          } else {
            throw userError;
          }
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load profile';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [publicId]);

  useEffect(() => {
    const checkAppointmentStatus = async () => {
      if (user && profile && !isCenter && isPatient) {
        try {
          // Resolve patient record for this user
          const patientRecord = await patientService.getPatientByUserId(profile.id);
          if (patientRecord) {
            const appointments = await appointmentService.getAppointments({
              providerId: user.id,
              patientId: patientRecord.id
            });
            setHasAppointment(appointments.data.length > 0);
          }
        } catch (err) {
          console.error('Failed to check appointment status:', err);
        }
      }
    };

    if (profile) {
      checkAppointmentStatus();
    }
  }, [user, profile, isCenter, isPatient]);

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
    if (!experience) return 'Professional';
    return experience;
  };

  const handleRequest = (user: any, type: string = 'connection') => {
    setSelectedUser(user);
    setInitialRequestType(type);
    setShowRequestModal(true);
  };

  const handleContact = (u: any) => {
    const phone = u.phone || u.profile?.phone || u.profile?.phoneNumber;
    if (phone) {
      window.open(`tel:${phone}`);
    } else {
      toast.error('Direct contact number not shared. Please send a request.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 font-medium animate-pulse">Loading professional profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-red-500" />
          <CardContent className="flex flex-col items-center justify-center py-12 px-8">
            <div className="p-4 bg-red-50 rounded-full mb-6">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 text-center mb-8">{error || 'This professional is no longer available on our platform.'}</p>
            <Button
              onClick={() => navigate('/discovery')}
              className="w-full bg-blue-600 hover:bg-blue-700 h-11"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Professional Discovery
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dynamic Header Background */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 relative">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10 pb-20">
        {/* Breadcrumbs / Back button */}
        <div className="flex items-center gap-2 text-white/80 mb-6 hover:text-white transition-colors cursor-pointer w-fit" onClick={() => navigate('/discovery')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Professional Discovery</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100 mb-8 items-start">
          <div className="p-6 md:p-10">
            <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
              {/* Avatar Section */}
              <div className="relative shrink-0 flex justify-center lg:block">
                <div className="relative">
                  <Avatar className="h-32 w-32 md:h-44 md:w-44 ring-8 ring-white shadow-2xl">
                    <AvatarImage
                      src={isCenter ? undefined : (profile as User).avatar}
                      alt={displayName}
                    />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-2 ring-4 ring-white shadow-lg">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <div>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-2">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                      {displayName}
                    </h1>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 px-3 py-1 font-bold uppercase tracking-wider text-[10px]">
                      {isCenter ? (profile as Center).type : (profile as User).specialty || 'General Practitioner'}
                    </Badge>
                    {!isCenter && (profile as User).licenseExpiryDate && (
                      <Badge className={cn("px-3 py-1 font-bold uppercase tracking-wider text-[10px]", getLicenseStatus((profile as User).licenseExpiryDate).bg, getLicenseStatus((profile as User).licenseExpiryDate).text, getLicenseStatus((profile as User).licenseExpiryDate).border)}>
                        License: {getLicenseStatus((profile as User).licenseExpiryDate).message}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-slate-500">
                    <div className="flex items-center gap-1.5 underline decoration-blue-200 underline-offset-4">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {isCenter
                          ? (profile as Center).address
                          : `${(profile as User).location?.city || 'Med-City'}, ${(profile as User).location?.state || ''}`}
                      </span>
                    </div>
                    {!isCenter && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium">{formatExperience((profile as User).experience)} of experience</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Joined {(profile as any).joinedAt ? new Date((profile as any).joinedAt).getFullYear() : '2024'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-5 w-5 ${s <= Math.round(rating || 4.5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    ))}
                    <span className="ml-2 font-bold text-slate-900">{rating || 4.5}</span>
                    <span className="text-slate-400 text-sm">({reviewCount || 12} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Hero Action Section - Institutional Gating */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                {belongsToCenter && !isCenter && !user?.roles?.includes('doctor' as any) ? (
                  /* Institutional Routing for center-linked doctors */
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => handleRequest(profile, 'service_interest')}
                      className="bg-slate-900 hover:bg-black text-white font-bold h-12 px-8 rounded-2xl shadow-xl active:scale-95 transition-all w-full sm:w-auto lg:w-full"
                    >
                      <Building2 className="h-5 w-5 mr-3" />
                      CONTACT HOSPITAL REGISTRY
                    </Button>
                    <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest leading-tight">
                      Institutional routing enabled.<br />Contact hospital management to book.
                    </p>
                  </div>
                ) : (
                  <>
                    {!isPatient ? (
                      <Button
                        onClick={() => handleRequest(profile, user?.roles?.includes('patient' as any) ? 'appointment_request' : 'connection')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all w-full sm:w-auto lg:w-full"
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        {isCenter ? 'REQUEST APPOINTMENT' : 'Book Appointment'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => hasAppointment ? navigate('/consultation') : handleRequest(profile, 'appointment_invitation')}
                        className={cn(
                          "font-bold h-12 px-8 rounded-2xl shadow-lg active:scale-95 transition-all w-full sm:w-auto lg:w-full",
                          hasAppointment
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                        )}
                      >
                        {hasAppointment ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Conduct Consultation
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-5 w-5 mr-2" />
                            {isCenter ? 'REQUEST APPOINTMENT' : 'Book Appointment'}
                          </>
                        )}
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleContact(profile)}
                        variant="outline"
                        className="flex-1 h-12 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-700 font-bold"
                      >
                        <Phone className="h-5 w-5 mr-2" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 w-12 rounded-2xl border-2 border-slate-100 p-0 hover:bg-red-50 hover:border-red-100 hover:text-red-500"
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Info */}
          <div className="lg:col-span-8 space-y-8">

            {/* Professional Bio section */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Professional Profile & Background
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 leading-relaxed text-lg">
                  {(profile as any).bio || (profile as any).description || `Hello! I am a dedicated ${isCenter ? (profile as Center).type : (profile as User).specialty || 'Healthcare Professional'}. I provide high-quality medical services and personalized care. With my expertise, I ensure that my clients receive the best attention possible.`}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Specialty</p>
                    <p className="font-bold text-slate-800">{isCenter ? (profile as Center).type : (profile as User).specialty || 'General Practice'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Experience</p>
                    <p className="font-bold text-slate-800">{isCenter ? 'Operational' : formatExperience((profile as User).experience)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Practice ID</p>
                    <p className="font-bold text-slate-800">{(profile as any).practiceNumber || 'PRC-X7701'}</p>
                  </div>
                  {!isCenter && (profile as User).licenseExpiryDate && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">License Status</p>
                      <div className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border", getLicenseStatus((profile as User).licenseExpiryDate).bg, getLicenseStatus((profile as User).licenseExpiryDate).text, getLicenseStatus((profile as User).licenseExpiryDate).border)}>
                        {getLicenseStatus((profile as User).licenseExpiryDate).message}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services & Offerings section - Hide for patients */}
            {!isPatient && (
              <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Offered Services & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {(() => {
                      const services = (profile as any).offeredServices || (profile as any).services || (profile as any).offered_services;
                      if (services && services.length > 0) {
                        return services.map((service: any, idx: number) => (
                          <div key={idx} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{service.name}</h4>
                              <p className="text-sm text-slate-500 max-w-md">{service.description || 'Professional healthcare service tailored to your needs.'}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <span className="text-xl font-black text-slate-900">
                                {service.currency || '₦'}{service.price?.toLocaleString() || '5,000'}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-[10px] font-black uppercase text-blue-600 border border-blue-100 hover:bg-blue-50"
                                onClick={() => handleRequest(profile, user?.roles?.includes('patient' as any) ? 'appointment_request' : 'appointment_invitation')}
                              >
                                {user?.roles?.includes('patient' as any) ? 'Book Now' : 'Request'}
                              </Button>
                            </div>
                          </div>
                        ));
                      }
                      return (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                          <Briefcase className="h-12 w-12 mb-4 opacity-20" />
                          <p className="font-medium">Services will be listed upon request approval</p>
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Qualifications Section */}
            {!isCenter && (profile as User).qualifications && (profile as User).qualifications!.length > 0 && (
              <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Verified Qualifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(profile as User).qualifications!.map((q, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <Award className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{q}</p>
                          <p className="text-xs text-slate-500">Verified Professional Credential</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Center Practitioners Section */}
            {isCenter && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Our Practitioners</h3>
                  <Badge variant="outline" className="text-[10px] font-black uppercase text-blue-600 border-blue-100">Verified Personnel</Badge>
                </div>
                <CenterStaffList
                  centerId={profile.id}
                  centerPhone={(profile as Center).phone}
                  centerEmail={(profile as Center).email}
                />
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            {/* Availability Widget */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
                <CardTitle className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Availability Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="font-bold text-slate-800">Available Today</p>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {(profile as any).availability?.generalAvailability || 'Monday - Saturday: 08:00 AM - 06:00 PM'}
                </p>
                <div className="pt-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                    Timezone: {(profile as any).availability?.timezone || 'GMT+1 (WAT)'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details Widget */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Official Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold text-slate-700">{(profile as any).email || 'Masked for privacy'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Phone className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
                      <p className="text-sm font-bold text-slate-700">{(profile as any).phone || 'Shared on approval'}</p>
                    </div>
                  </div>

                  {isCenter && (profile as Center).website && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Globe className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website</p>
                        <a href={(profile as Center).website} target="_blank" rel="noopener" className="text-sm font-bold text-blue-600 hover:underline inline-flex items-center">
                          Official Site <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Alert */}
            {showPrivacyNotice && (
              <Alert className="border-0 shadow-lg bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-24 w-24" />
                </div>
                <div className="flex gap-4 relative z-10">
                  <div className="shrink-0 p-2 bg-white/10 rounded-xl">
                    <ShieldCheck className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Privacy First</h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      Only verified professionals are listed. We mask personal data until you initiate a formal request to protect both parties.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPrivacyNotice(false)}
                      className="text-white hover:bg-white/10 p-0 h-auto font-bold text-xs"
                    >
                      Dismiss Notice
                    </Button>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Simplified Mobile Header */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe z-50 shadow-2xl">
        {!isPatient ? (
          <Button
            onClick={() => handleRequest(profile, user?.roles?.includes('patient' as any) ? 'appointment_request' : 'connection')}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-2xl font-bold shadow-lg shadow-blue-600/20"
          >
            {isCenter ? 'REQUEST APPOINTMENT' : 'Book Appointment'}
          </Button>
        ) : (
          <Button
            onClick={() => hasAppointment ? navigate('/consultation') : handleRequest(profile, 'appointment_invitation')}
            className={cn(
              "w-full h-12 rounded-2xl font-bold shadow-lg",
              hasAppointment
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
            )}
          >
            {hasAppointment ? 'Conduct Consultation' : (isCenter ? 'REQUEST APPOINTMENT' : 'Book Appointment')}
          </Button>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedUser && (
        <RequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          recipient={selectedUser}
          onSend={() => {
            toast.success('Professional request sent successfully!');
            setShowRequestModal(false);
          }}
          initialRequestType={initialRequestType}
        />
      )}
    </div>
  );
};

export default PublicProfilePage;
