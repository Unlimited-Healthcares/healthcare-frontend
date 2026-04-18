import React, { useState } from 'react';
import { Send, AlertCircle, Calendar, Landmark, Banknote, CreditCard, Coins, Info, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { discoveryService } from '@/services/discoveryService';
import { User, Center, CreateRequestData, REQUEST_TYPES, UserSearchResponse } from '@/types/discovery';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Search, UserPlus, Check, X as CloseIcon, Loader2, FileUp, Paperclip, FileText, Trash2 } from 'lucide-react';
import { patientService, PatientRecord } from '@/services/patientService';
import { referralService, DocumentType } from '@/services/referralService';
import { useEffect, useRef } from 'react';
import { formatApiError } from '@/lib/error-formatter';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User | Center;
  onSend: (requestData: CreateRequestData) => void;
  initialRequestType?: string;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  recipient,
  onSend,
  initialRequestType = 'connection'
}) => {
  const [requestType, setRequestType] = useState(initialRequestType);
  const [message, setMessage] = useState('');
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState('');

  // File Upload State for Referrals
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const providerSettings = recipient.paymentSettings;

  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Professional Search State
  const [professionalSearchQuery, setProfessionalSearchQuery] = useState('');
  const [professionalResults, setProfessionalResults] = useState<User[]>([]);
  const [isSearchingProfessionals, setIsSearchingProfessionals] = useState(false);
  const [selectedColleague, setSelectedColleague] = useState<User | null>(null);
  const [showProfessionalSearch, setShowProfessionalSearch] = useState(false);

  const isRecipientPatient = !('type' in recipient) && (
    (recipient as any).roles?.includes('patient') ||
    !!(recipient as any).patientId ||
    !(recipient as any).specialty
  );
  const isProfessionalType = ['connection', 'referral', 'staff_invitation'].includes(requestType);
  const needsProfessionalSelection = isRecipientPatient && isProfessionalType;

  const isUserDoctor = (user?.roles as any[])?.some(role => ['doctor', 'specialist', 'practitioner', 'staff', 'nurse'].includes(role));
  const isUserPatient = user?.roles?.includes('patient' as any) && !isUserDoctor;

  // Update default request type when recipient changes
  useEffect(() => {
    if (isOpen) {
      if (isRecipientPatient && isUserDoctor) {
        setRequestType('appointment_invitation');
      } else if (!isRecipientPatient && isUserPatient) {
        setRequestType('consultation_request');
      } else {
        setRequestType(initialRequestType);
      }
    }
  }, [isOpen, isRecipientPatient, isUserDoctor, isUserPatient, initialRequestType]);

  // Filter REQUEST_TYPES based on roles
  const filteredRequestTypes = REQUEST_TYPES.filter(type => {
    // Doctors/Centers viewing Patients
    if (isRecipientPatient && isUserDoctor) {
      return ['appointment_invitation', 'referral', 'connection'].includes(type.value);
    }

    // Patients viewing Doctors/Centers
    if (!isRecipientPatient && isUserPatient) {
      return ['patient_request', 'appointment_request', 'consultation_request'].includes(type.value);
    }

    // Doctors viewing Doctors/Centers
    if (!isRecipientPatient && isUserDoctor) {
      return ['connection', 'staff_invitation', 'referral'].includes(type.value);
    }

    // Fallback: show everything if roles are ambiguous
    return true;
  });

  // Fetch patients if needed for referral
  useEffect(() => {
    if (isOpen && (requestType === 'referral' || requestType === 'transfer_patient')) {
      const fetchPatients = async () => {
        setLoadingPatients(true);
        try {
          const res = await patientService.getPatients({ limit: 100 });
          if (res && res.data) {
            setPatients(res.data);
          }
        } catch (error) {
          console.error('Failed to fetch patients:', error);
        } finally {
          setLoadingPatients(false);
        }
      };
      fetchPatients();
    }
  }, [isOpen, requestType]);

  // For patient_request, try to get the current user's patient ID if they are a patient
  useEffect(() => {
    if (isOpen && requestType === 'patient_request' && user) {
      const isUserPatient = user.roles?.includes('patient');
      if (isUserPatient) {
        const fetchCurrentPatient = async () => {
          try {
            const currentPatient = await patientService.getCurrentPatient();
            if (currentPatient?.id) {
              setMetadata(prev => ({ ...prev, patientId: currentPatient.id }));
            }
          } catch (error) {
            console.error('Failed to fetch current patient:', error);
          }
        };
        fetchCurrentPatient();
      }
    }
  }, [isOpen, requestType, user]);

  // Search Professionals
  useEffect(() => {
    const searchProfessionals = async () => {
      if (professionalSearchQuery.length < 2) {
        setProfessionalResults([]);
        return;
      }

      setIsSearchingProfessionals(true);
      try {
        const res: UserSearchResponse = await discoveryService.searchUsers({
          search: professionalSearchQuery,
          type: 'doctor', // We look for doctors/specialists
          page: 1,
          limit: 5
        });
        setProfessionalResults(res.users);
      } catch (error) {
        console.error('Professional search failed:', error);
      } finally {
        setIsSearchingProfessionals(false);
      }
    };

    const timer = setTimeout(searchProfessionals, 500);
    return () => clearTimeout(timer);
  }, [professionalSearchQuery]);

  const resolveRecipientId = async (target: User | Center): Promise<string | null> => {
    // If we already have a UUID, use it
    if (target.id && typeof target.id === 'string' && target.id.includes('-')) {
      return target.id;
    }

    // Centers from search now always include UUID in id – no resolver needed
    if ('type' in target) {
      return null; // Should not happen anymore; caller should surface a toast if it does
    }

    // Users: resolve public profile to UUID if needed
    const publicIdCandidate = (target as any).publicId || target.id;
    if (!publicIdCandidate) return null;

    try {
      const user = await discoveryService.getUserProfile(publicIdCandidate);
      return user?.id && user.id.includes('-') ? user.id : null;
    } catch {
      return null;
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') return 'DR';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!requestType) {
      newErrors.requestType = 'Request type is required';
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    // Role-specific validation
    // Note: Medical condition is optional for basic patient requests
    // if (requestType === 'patient_request' && !metadata.medicalCondition) {
    //   newErrors.medicalCondition = 'Medical condition is required for patient requests';
    // }

    if (requestType === 'appointment_request' && !metadata.preferredDate) {
      newErrors.preferredDate = 'Preferred date is required for appointment requests';
    }

    if (requestType === 'appointment_request' && !metadata.preferredTime) {
      newErrors.preferredTime = 'Preferred time is required for appointment requests';
    }

    if (requestType === 'consultation_request' && !metadata.consultationType) {
      newErrors.consultationType = 'Consultation type is required for consultation requests';
    }

    if (requestType === 'referral' && !selectedPatientId && !metadata.patientId) {
      newErrors.patientId = 'Patient selection is required for referrals';
    }
    // Initialize default payment method
    if (providerSettings?.methods && providerSettings.methods.length > 0 && !paymentMethod) {
      setPaymentMethod(providerSettings.methods[0].type);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log('❌ Request validation failed:', errors);
      return;
    }

    setLoading(true);

    try {
      // Use selected colleague if one was searched and chosen, otherwise use original recipient
      const targetRecipient = selectedColleague || recipient;

      // Perform final validation for professional selection
      if (needsProfessionalSelection && !selectedColleague) {
        setErrors(prev => ({ ...prev, professional: 'Please select a professional recipient' }));
        setLoading(false);
        return;
      }

      const resolvedRecipientId = await resolveRecipientId(targetRecipient);
      console.log('Resolved recipient ID:', resolvedRecipientId);
      console.log('Target recipient:', targetRecipient.name);

      if (!resolvedRecipientId) {
        toast.error('Unable to determine recipient. Please try again.');
        setLoading(false);
        return;
      }

      // 🔍 DEBUG: Validate recipient ID format
      if (!resolvedRecipientId.includes('-')) {
        console.error('❌ INVALID RECIPIENT ID FORMAT:', {
          recipientId: resolvedRecipientId,
          expectedFormat: 'UUID with dashes',
          issue: 'This might cause foreign key constraint violations'
        });
        toast.error('Invalid recipient ID format. Please try again.');
        setLoading(false);
        return;
      }

      let finalRecipientId = resolvedRecipientId;
      let finalRequestType = requestType;

      // 🔍 DEBUG: Validate request type
      const validRequestTypes = ['connection', 'collaboration', 'patient_request', 'appointment_request', 'consultation_request', 'staff_invitation', 'referral'];
      if (!validRequestTypes.includes(finalRequestType)) {
        console.warn('⚠️ INVALID REQUEST TYPE:', finalRequestType, 'Defaulting to connection');
        finalRequestType = 'connection';
      }

      // Resolve center owner and other common metadata
      let finalMetadata: Record<string, any> = {
        ...metadata,
        patientId: selectedPatientId || metadata.patientId
      };

      // For patient requests to centers, we need to find a center staff member to send the request to
      if ('type' in recipient && requestType === 'patient_request') {
        try {
          console.log('🔍 RESOLVING CENTER STAFF FOR PATIENT REQUEST...');

          // Get center staff to find a suitable recipient
          let centerStaff: Array<{ id: string; displayName?: string; name?: string; roles?: string[] }> = [];
          try {
            centerStaff = await discoveryService.getCenterStaff(recipient.id) as any;
            console.log('🔍 CENTER STAFF API RESPONSE:', {
              centerId: recipient.id,
              centerName: recipient.name,
              staffCount: centerStaff?.length || 0,
              staff: centerStaff?.map(s => ({ id: s.id, name: s.displayName || s.name, role: s.roles?.[0] })) || [],
              centerType: recipient.type,
              centerActive: recipient.isActive,
              apiResponseType: typeof centerStaff,
              isArray: Array.isArray(centerStaff),
              rawResponse: centerStaff
            });
          } catch (apiError) {
            console.error('🚨 CENTER STAFF API CALL FAILED:', {
              centerId: recipient.id,
              centerName: recipient.name,
              error: apiError,
              errorMessage: apiError instanceof Error ? apiError.message : 'Unknown error',
              errorStack: apiError instanceof Error ? apiError.stack : 'No stack'
            });
            // Set to empty array and continue to fallback logic
            centerStaff = [];
          }

          if (centerStaff.length === 0) {
            throw new Error('No staff members found at this center');
          }

          // Find a doctor or medical staff member to receive the request
          const medicalStaff = centerStaff.find(staff =>
            staff.roles?.includes('doctor') ||
            staff.roles?.includes('nurse') ||
            staff.roles?.includes('medical_staff')
          );

          if (medicalStaff) {
            finalRecipientId = medicalStaff.id;
            console.log('✅ FOUND MEDICAL STAFF RECIPIENT:', {
              staffId: medicalStaff.id,
              staffName: medicalStaff.displayName || medicalStaff.name,
              role: medicalStaff.roles?.[0],
              reason: 'Patient requests to centers must go to medical staff, not the center itself'
            });

            // Show user-friendly message
            toast.success(`Request will be sent to ${medicalStaff.displayName || medicalStaff.name} at ${recipient.name}`);
          } else {
            // Fallback to first available staff member
            finalRecipientId = centerStaff[0].id;
            console.log('⚠️ USING FIRST AVAILABLE STAFF MEMBER:', {
              staffId: centerStaff[0].id,
              staffName: centerStaff[0].displayName || centerStaff[0].name,
              role: centerStaff[0].roles?.[0],
              reason: 'No medical staff found, using first available staff member'
            });

            // Show user-friendly message
            toast.success(`Request will be sent to ${centerStaff[0].displayName || centerStaff[0].name} at ${recipient.name}`);
          }

          // Add center information to metadata
          finalMetadata = {
            ...finalMetadata,
            centerId: recipient.id, // center UUID
            centerName: recipient.name,
            centerType: recipient.type,
            originalRecipientType: 'center',
            originalRecipientId: recipient.id
          };

          console.log('🔍 UPDATED REQUEST FOR CENTER:', {
            originalCenterId: recipient.id,
            finalRecipientId: finalRecipientId,
            centerName: recipient.name,
            reason: 'user_requests table requires user ID as recipientId, not center ID'
          });

        } catch (staffError) {
          console.error('❌ FAILED TO RESOLVE CENTER STAFF:', {
            centerId: recipient.id,
            centerName: recipient.name,
            error: staffError,
            issue: 'Cannot send patient request to center without staff members'
          });

          // 🔍 DEBUG: Try alternative approaches
          console.log('🔍 ATTEMPTING ALTERNATIVE APPROACHES...');

          // Option 1: Try to get center owner as fallback
          try {
            console.log('🔍 TRYING TO GET CENTER OWNER...');
            const centerOwner = await discoveryService.getCenterOwner(recipient.id);
            if (centerOwner?.userId) {
              console.log('✅ FOUND CENTER OWNER:', {
                ownerId: centerOwner.userId,
                reason: 'Using center owner as fallback recipient'
              });

              finalRecipientId = centerOwner.userId;
              finalMetadata = {
                ...finalMetadata,
                centerId: recipient.id,
                centerName: recipient.name,
                centerType: recipient.type,
                originalRecipientType: 'center',
                originalRecipientId: recipient.id,
                recipientType: 'center_owner',
                fallbackReason: 'No staff members found, using center owner'
              };

              toast.success(`Request will be sent to the center owner at ${recipient.name}`);
              console.log('✅ USING CENTER OWNER AS RECIPIENT');
            } else {
              throw new Error('No center owner found');
            }
          } catch (ownerError) {
            console.error('❌ CENTER OWNER NOT FOUND:', ownerError);

            // Option 2: Show detailed error with suggestions
            console.log('🔍 NO ALTERNATIVE RECIPIENTS FOUND');
            toast.error(
              `${recipient.name} has no staff members or owner available to receive requests. ` +
              'This center may be inactive or not accepting new patients. Please try a different center.'
            );
            setLoading(false);
            return;
          }
        }
      }

      // 🔍 DEBUG: Consider using appointment_request for center requests
      if ('type' in recipient && requestType === 'patient_request') {
        console.log('🔍 CONSIDERING REQUEST TYPE CHANGE:', {
          currentType: 'patient_request',
          suggestedType: 'appointment_request',
          reason: 'Patient requests to centers might need appointment_request type',
          recipientType: recipient.type,
          centerName: recipient.name
        });

        // Optionally change to appointment_request for center requests
        // Uncomment the next line if the backend expects appointment_request for center requests
        // finalRequestType = 'appointment_request';
      }

      // 🔍 DEBUG: Log final request configuration
      console.log('🔍 FINAL REQUEST CONFIGURATION:', {
        originalRequestType: requestType,
        finalRequestType: finalRequestType,
        recipientType: 'type' in recipient ? 'Center' : 'User',
        originalRecipientId: recipient.id,
        finalRecipientId: finalRecipientId,
        isCenterRequest: 'type' in recipient,
        metadataKeys: Object.keys(finalMetadata),
        metadataValues: finalMetadata,
        reason: 'This configuration will be sent to backend'
      });

      const requestData: CreateRequestData = {
        recipientId: finalRecipientId,
        requestType: finalRequestType,
        message: message.trim(),
        metadata: {
          ...(finalMetadata || {}),
          paymentMethod,
          patientId: selectedPatientId || (isRecipientPatient ? recipient.id : null),
          hasAttachments: attachments.length > 0,
          attachmentCount: attachments.length
        }
      };

      // 🔍 DEBUG: Log referral details if applicable
      if (requestType === 'referral') {
        console.log('📋 REFERRAL INITIATED:', {
          from: user?.name,
          to: targetRecipient.name,
          patientId: requestData.metadata?.patientId,
          attachmentsCount: attachments.length
        });
      }

      const response = await discoveryService.createRequest(requestData);

      // Handle simulated file uploads for referrals
      if (requestType === 'referral' && attachments.length > 0 && response.id) {
        console.log('� REFERRAL ATTACHMENTS DETECTED:', attachments.map(f => f.name));
        toast.success(`Referral created with ${attachments.length} attachments`, { icon: '📎' });
        // Note: Full file upload to backend would happen here if API supported multipart discovery requests
      }

      // 🔍 DEBUG: Log successful response
      console.log('✅ REQUEST SENT SUCCESSFULLY:', {
        response,
        requestId: response.id,
        status: response.status,
        nextSteps: 'Center should now see this request in their dashboard'
      });

      onSend(requestData);
      onClose();

      // Reset form
      setRequestType('connection');
      setMessage('');
      setMetadata({});
      setErrors({});

      toast.success('Request sent successfully!');
    } catch (error: any) {
      // 🔍 DEBUG: Log detailed error information
      console.error('❌ REQUEST SEND FAILED:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        requestData: {
          recipientId: recipient.id,
          requestType,
          message: message.trim(),
          metadata
        },
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });

      // 🔍 DEBUG: Log axios error details if available
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('🔍 AXIOS ERROR DETAILS:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            headers: axiosError.config?.headers
          }
        });

        // 🔍 DEBUG: Log the actual error message from backend
        const responseData = axiosError.response?.data;
        if (responseData) {
          console.error('🔍 BACKEND ERROR MESSAGE:', {
            rawData: responseData,
            message: responseData.message || responseData.error || 'No message',
            details: responseData.details || responseData.validation || 'No details',
            constraint: responseData.constraint || 'No constraint info',
            code: responseData.code || 'No error code'
          });
        }
      }

      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to send request';
      toast.error(formatApiError(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form
      setRequestType('connection');
      setMessage('');
      setMetadata({});
      setErrors({});
    }
  };

  const getRequestTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      connection: 'Send a professional connection request',
      patient_request: 'Request medical consultation as a patient',
      appointment_request: 'Book an appointment for medical consultation',
      consultation_request: 'Request a consultation or second opinion',
      staff_invitation: 'Invite them to join your center',
      referral: 'Refer a patient to them',
      appointment_invitation: 'Invite a patient to book a consultation'
    };
    return descriptions[type] || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-blue-200 shadow-xl"
        aria-describedby="request-modal-description"
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-blue-900">
            <Send className="h-5 w-5 text-blue-600" />
            Send Request
          </DialogTitle>
          <DialogDescription id="request-modal-description" className="text-sm text-blue-600">
            Send a professional request to connect with healthcare professionals
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Info / Professional Selection */}
          <Card className={cn(
            "bg-white border shadow-sm transition-all duration-300",
            needsProfessionalSelection ? "border-amber-200 bg-amber-50/10" : "border-blue-200"
          )}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-blue-100 shadow-sm">
                    {('avatar' in (selectedColleague || recipient)) ? (
                      <AvatarImage src={(selectedColleague || recipient as User).avatar} alt={(selectedColleague || recipient).name} />
                    ) : null}
                    <AvatarFallback className="text-sm font-semibold bg-blue-50 text-blue-700">
                      {getInitials((selectedColleague || recipient).name || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-blue-900 text-lg">{(selectedColleague || recipient).name}</h3>
                      {needsProfessionalSelection && !selectedColleague && (
                        <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 animate-pulse">
                          Requires Colleague Selection
                        </Badge>
                      )}
                    </div>
                    {('specialty' in (selectedColleague || recipient)) && (selectedColleague || recipient as User).specialty && (
                      <p className="text-sm text-blue-600 font-medium">{(selectedColleague || recipient as User).specialty}</p>
                    )}
                    {selectedColleague && (
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1 italic flex items-center gap-1">
                        <Check className="h-3 w-3" /> Colleague Recipient Selected
                      </p>
                    )}
                  </div>
                  {needsProfessionalSelection && (
                    <div className="flex flex-col items-end gap-2 text-right">
                      {!selectedColleague && (
                        <p className="text-[10px] text-amber-600 font-black animate-pulse uppercase tracking-tighter">Choose receiving hospital/doctor</p>
                      )}
                      <Button
                        type="button"
                        variant={selectedColleague ? "outline" : "default"}
                        size="sm"
                        onClick={() => setShowProfessionalSearch(!showProfessionalSearch)}
                        className={cn(
                          "font-bold text-xs h-9 px-4 rounded-xl shadow-sm transition-all",
                          !selectedColleague ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-600 border-blue-100 hover:bg-blue-50"
                        )}
                      >
                        {selectedColleague ? 'Change Recipient' : 'Select Recipient'}
                      </Button>
                    </div>
                  )}
                </div>

                {needsProfessionalSelection && (showProfessionalSearch || !selectedColleague) && (
                  <div className="mt-2 space-y-3 p-4 bg-white rounded-xl border-2 border-dashed border-blue-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search for a doctor or specialist..."
                        value={professionalSearchQuery}
                        onChange={(e) => setProfessionalSearchQuery(e.target.value)}
                        className="pl-10 h-10 border-blue-100 focus:border-blue-400"
                      />
                      {isSearchingProfessionals && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
                      )}
                    </div>

                    {professionalResults.length > 0 && (
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {professionalResults.map((prof) => (
                          <div
                            key={prof.id}
                            onClick={() => {
                              setSelectedColleague(prof);
                              setShowProfessionalSearch(false);
                              setProfessionalSearchQuery('');
                              setErrors(prev => ({ ...prev, professional: '' }));
                            }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 cursor-pointer group transition-all border border-transparent hover:border-blue-100"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={prof.avatar} />
                                <AvatarFallback className="text-[10px]">{getInitials(prof.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-bold text-slate-800">{prof.name}</p>
                                <p className="text-[10px] text-blue-500">{prof.specialty || 'Specialist'}</p>
                              </div>
                            </div>
                            <UserPlus className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                          </div>
                        ))}
                      </div>
                    )}

                    {errors.professional && (
                      <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.professional}
                      </p>
                    )}

                    {!selectedColleague && !isSearchingProfessionals && professionalSearchQuery.length > 1 && professionalResults.length === 0 && (
                      <p className="text-[10px] text-slate-400 text-center py-2">No professionals found. Try another search.</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Request Type */}
          <div className="space-y-3">
            <Label htmlFor="request-type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Request Type *
            </Label>
            <Select
              value={requestType}
              onValueChange={(value) => {
                setRequestType(value);
                setSelectedPatientId('');
                setAttachments([]);
                setMetadata({});
                setErrors(prev => ({ ...prev, requestType: '' }));
              }}
            >
              <SelectTrigger className="w-full h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white text-blue-900">
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-blue-200 shadow-lg">
                {filteredRequestTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-blue-900 hover:bg-blue-50 hover:text-blue-700">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.requestType && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.requestType}
              </p>
            )}
            <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-md border border-blue-100">
              {getRequestTypeDescription(requestType)}
            </p>
          </div>

          {/* Role-specific Fields */}
          {requestType === 'appointment_invitation' && (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  This will invite the patient to book a consultation with you. They will receive an automated email notification.
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Invitation Message (Optional)</Label>
                <Textarea
                  placeholder="Add a personalized message to your invitation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px] border-blue-100 focus:border-blue-300"
                />
              </div>
            </div>
          )}
          {requestType === 'patient_request' && (
            <div className="space-y-3">
              <Label htmlFor="medical-condition" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Medical Condition (Optional)
              </Label>
              <Input
                id="medical-condition"
                placeholder="Describe your medical condition or concern"
                value={metadata.medicalCondition || ''}
                onChange={(e) => setMetadata(prev => ({ ...prev, medicalCondition: e.target.value }))}
                className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.medicalCondition && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.medicalCondition}
                </p>
              )}
            </div>
          )}

          {/* Job application form section removed */}

          {/* Payment Section for Appointment/Consultation */}
          {(requestType === 'appointment_request' || requestType === 'consultation_request') && (
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="h-3 w-3" /> Payment & Settlement
                </h5>
                {providerSettings?.requireUpfrontPayment && (
                  <div className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    <Info className="h-3 w-3" /> Upfront Required
                  </div>
                )}
              </div>

              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-white border-indigo-200 h-10 text-xs font-bold font-mono">
                  <SelectValue placeholder="Select Payment Source" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {providerSettings?.methods && providerSettings.methods.length > 0 ? (
                    providerSettings.methods.map((m: any, idx: number) => (
                      <SelectItem key={`${m.type}-${idx}`} value={m.type} className="text-xs font-bold">
                        <div className="flex items-center gap-2">
                          {m.type === 'paystack' ? <CreditCard className="h-4 w-4 text-blue-600" /> :
                            m.type === 'flutterwave' ? <CreditCard className="h-4 w-4 text-orange-500" /> :
                              <CreditCard className="h-4 w-4 text-gray-600" />}
                          {m.label || m.type.replace('_', ' ').toUpperCase()}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" className="text-xs">No Payment Method Configured</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {providerSettings?.methods?.find((m: any) => m.type === paymentMethod)?.instructions && (
                <div className="p-4 bg-white/80 rounded-xl text-xs text-indigo-700 leading-relaxed border border-indigo-50 italic shadow-sm">
                  {providerSettings.methods.find((m: any) => m.type === paymentMethod)?.instructions}
                </div>
              )}
            </div>
          )}

          {requestType === 'appointment_request' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="preferred-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preferred Date *
                </Label>
                <div className="relative">
                  <Input
                    id="preferred-date"
                    type="date"
                    value={metadata.preferredDate || ''}
                    onChange={(e) => setMetadata(prev => ({ ...prev, preferredDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-11 pl-10 pr-4 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                    placeholder="Select a date"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                </div>
                {errors.preferredDate && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.preferredDate}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="preferred-time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preferred Time *
                </Label>
                <Select
                  value={metadata.preferredTime || ''}
                  onValueChange={(value) => setMetadata(prev => ({ ...prev, preferredTime: value }))}
                >
                  <SelectTrigger className="h-11 border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white text-blue-900">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-blue-200 shadow-lg">
                    <SelectItem value="morning" className="text-blue-900 hover:bg-blue-50 hover:text-blue-700">Morning (8:00 AM - 12:00 PM)</SelectItem>
                    <SelectItem value="afternoon" className="text-blue-900 hover:bg-blue-50 hover:text-blue-700">Afternoon (12:00 PM - 5:00 PM)</SelectItem>
                    <SelectItem value="evening" className="text-blue-900 hover:bg-blue-50 hover:text-blue-700">Evening (5:00 PM - 8:00 PM)</SelectItem>
                    <SelectItem value="flexible" className="text-blue-900 hover:bg-blue-50 hover:text-blue-700">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                {errors.preferredTime && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.preferredTime}
                  </p>
                )}
              </div>
            </div>
          )}

          {requestType === 'consultation_request' && (
            <div className="space-y-2">
              <Label htmlFor="consultation-type">Consultation Type *</Label>
              <Select
                value={metadata.consultationType || ''}
                onValueChange={(value) => setMetadata(prev => ({ ...prev, consultationType: value }))}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white text-blue-900">
                  <SelectValue placeholder="Select consultation type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-blue-200 shadow-lg">
                  <SelectItem value="in_person" className="text-blue-900 hover:bg-blue-50 hover:text-blue-700">In-Person Consultation</SelectItem>
                  <SelectItem value="video_call" className="text-blue-900 hover:bg-blue-50 hover:text-blue-700">Video Call Consultation</SelectItem>
                  <SelectItem value="phone_call" className="text-blue-900 hover:bg-blue-50 hover:text-blue-700">Phone Call Consultation</SelectItem>
                  <SelectItem value="second_opinion" className="text-blue-900 hover:bg-blue-50 hover:text-blue-700">Second Opinion</SelectItem>
                  <SelectItem value="emergency" className="text-blue-900 hover:bg-blue-50 hover:text-blue-700">Emergency Consultation</SelectItem>
                </SelectContent>
              </Select>
              {errors.consultationType && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.consultationType}
                </p>
              )}
            </div>
          )}

          {requestType === 'staff_invitation' && (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="Role to invite them for"
                value={metadata.role || ''}
                onChange={(e) => setMetadata(prev => ({ ...prev, role: e.target.value }))}
              />
            </div>
          )}

          {requestType === 'referral' && (
            <div className="space-y-6 pt-4 border-t border-blue-100">
              {/* Patient Selection (If not already on patient page) */}
              {!isRecipientPatient && (
                <div className="space-y-3">
                  <Label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    Patient to Refer *
                  </Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="h-12 border-blue-200 bg-white shadow-sm">
                      <SelectValue placeholder="Which patient are you referring?" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200">
                      {loadingPatients ? (
                        <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-500" /></div>
                      ) : patients.length > 0 ? (
                        patients.map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-blue-900 font-medium">
                            {p.fullName || (p.name as string) || 'Unnamed Patient'}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400 font-bold">No patients found. Create one first.</div>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.patientId && <p className="text-[10px] text-red-500 font-bold">{errors.patientId}</p>}
                </div>
              )}

              {/* Attachments UI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-blue-600" />
                    Lab Work / Medical Reports
                  </Label>
                  <span className="text-[10px] text-slate-400 font-bold">PDF, JPG, PNG (Max 5MB)</span>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 rounded-2xl p-8 bg-blue-50/30 hover:bg-blue-50 transition-all cursor-pointer group flex flex-col items-center justify-center gap-3"
                >
                  <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-blue-900">Click to upload documents</p>
                    <p className="text-xs text-blue-500/60 font-medium">Attach relevance lab results or imaging reports</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setAttachments(prev => [...prev, ...newFiles]);
                      }
                    }}
                  />
                </div>

                {/* List of attachments */}
                {Array.isArray(attachments) && attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {attachments.map((file: File, idx: number) => {
                      if (!file) return null;
                      const fileName = file.name || 'Unknown File';
                      const fileSize = (file.size / 1024).toFixed(1);

                      return (
                        <div key={`attachment-${idx}`} className="flex items-center justify-between p-3 bg-white border border-blue-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] font-bold text-slate-800 truncate">{fileName}</p>
                              <p className="text-[9px] text-slate-400 font-medium">{fileSize} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Message */}
          <div className="space-y-3">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Message *
            </Label>
            <Textarea
              id="message"
              placeholder="Write a personal message explaining your request..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrors(prev => ({ ...prev, message: '' }));
              }}
              rows={4}
              className="resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.message && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.message}
              </p>
            )}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {message.length}/500 characters
              </p>
              {message.length > 400 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {500 - message.length} characters remaining
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-8 pb-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="px-8 py-3 h-12 text-base font-medium border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 h-12 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog >
  );
};
