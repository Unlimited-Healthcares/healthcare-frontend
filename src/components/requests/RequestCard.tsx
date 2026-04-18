import React, { useState } from 'react';
import { Clock, User, MessageCircle, Check, X, MoreVertical, Mail, AlertCircle, Calendar, Activity, Stethoscope, Heart, UserCircle, ArrowRight, Sparkles, Video, Phone, FileText, ShieldAlert, Trash2, Star } from 'lucide-react';
import { backendSearchService } from '@/services/backendSearchService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Request } from '@/types/discovery';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { PerformanceReviewModal } from './PerformanceReviewModal';
import { Award, CheckCircle2 } from 'lucide-react';
import { discoveryService } from '@/services/discoveryService';

interface RequestCardProps {
  request: Request;
  onApprove: (requestId: string, message?: string, metadata?: Record<string, any>) => void;
  onReject: (requestId: string, message?: string) => void;
  onCancel: (requestId: string) => void;
  onConfirm?: (requestId: string) => void;
  onDeclineResponse?: (requestId: string) => void;
  onViewProfile: (userId: string) => void;
  showActions?: boolean;
  isReceived?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onApprove,
  onReject,
  onCancel,
  onConfirm,
  onDeclineResponse,
  onViewProfile,
  showActions = true,
  isReceived = false
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [responseMessage, setResponseMessage] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return 'NA';
    const trimmed = name.trim();
    if (!trimmed) return 'NA';
    return trimmed
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'scheduled':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'declined':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'cancelled':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'connection':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'collaboration':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'patient_request':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'staff_invitation':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'referral':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'patient_request':
        return Heart;
      case 'staff_invitation':
        return Sparkles;
      case 'consultation_request':
        return Activity;
      case 'referral':
        return Stethoscope;
      default:
        return UserCircle;
    }
  };

  const getMetadataIcon = (key: string) => {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('urgency') || keyLower.includes('emergency')) return AlertCircle;
    if (keyLower.includes('symptom')) return Activity;
    if (keyLower.includes('date') || keyLower.includes('time')) return Calendar;
    if (keyLower.includes('type') || keyLower.includes('category')) return Stethoscope;
    return UserCircle;
  };

  const handleAction = async (action: 'approve' | 'reject' | 'cancel' | 'confirm' | 'decline', message?: string, metadata?: Record<string, any>) => {
    setLoading(action);

    try {
      if (action === 'approve') {
        await onApprove(request.id, message, metadata);
      } else if (action === 'reject') {
        await onReject(request.id, message);
      } else if (action === 'cancel') {
        await onCancel(request.id);
      } else if (action === 'confirm' && onConfirm) {
        await onConfirm(request.id);
      } else if (action === 'decline' && onDeclineResponse) {
        await onDeclineResponse(request.id);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleMarkComplete = async () => {
    setIsUpdatingStatus(true);
    try {
      await discoveryService.updateRequestStatus(request.id, 'completed');
      toast.success('Service marked as completed!');
      setShowReviewModal(true);
      if (onConfirm) onConfirm(request.id);
    } catch (error: any) {
      console.error('Error completing request:', error);
      toast.error('Failed to complete request');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatRequestType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const targetUser = isReceived ? {
    id: request.sender?.id || request.senderId,
    name: request.sender?.profile?.displayName ||
      (request.sender?.profile?.firstName && request.sender?.profile?.lastName
        ? `${request.sender.profile.firstName} ${request.sender.profile.lastName}`.trim()
        : request.senderName),
    email: request.sender?.email || request.senderEmail
  } : {
    id: request.recipient?.id || request.recipientId,
    name: request.recipient?.profile?.displayName ||
      (request.recipient?.profile?.firstName && request.recipient?.profile?.lastName
        ? `${request.recipient.profile.firstName} ${request.recipient.profile.lastName}`.trim()
        : request.recipientName),
    email: request.recipient?.email || request.recipientEmail
  };

  const safeName = typeof targetUser.name === 'string' && targetUser.name.trim().length > 0
    ? targetUser.name
    : 'Unknown User';
  const safeEmail = typeof targetUser.email === 'string' && targetUser.email.trim().length > 0
    ? targetUser.email
    : '';

  const RequestTypeIcon = getRequestTypeIcon(request.requestType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className="w-full hover:shadow-lg transition-all duration-300 border border-gray-200 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Avatar className="h-14 w-14 ring-2 ring-gray-100">
                  <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-teal-400 to-teal-600 text-white">
                    {getInitials(safeName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                  <RequestTypeIcon className="h-4 w-4 text-teal-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">
                    {safeName}
                  </h3>
                  <Badge className={`${getRequestTypeColor(request.requestType)} border px-3 py-1 rounded-full text-xs font-medium`}>
                    {formatRequestType(request.requestType)}
                  </Badge>
                </div>

                {safeEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{safeEmail}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={cn(getStatusColor(request.status), "border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider")}>
                {request.status}
              </Badge>
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 hover:bg-slate-100 rounded-full transition-colors">
                      <MoreVertical className="h-4 w-4 text-slate-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-2 border-slate-50 bg-white shadow-2xl">
                    <DropdownMenuItem onClick={() => onViewProfile(targetUser.id)} className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-slate-50 rounded-lg">
                      <User className="h-4 w-4" />
                      <span>View Profile</span>
                    </DropdownMenuItem>
                    {request.status === 'pending' && isReceived && (
                      <DropdownMenuItem onClick={() => {
                        setModalType('approve');
                        setShowResponseModal(true);
                      }} className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-blue-50 text-blue-600 rounded-lg font-bold">
                        <MessageCircle className="h-4 w-4" />
                        <span>Respond</span>
                      </DropdownMenuItem>
                    )}
                    {request.status === 'pending' && !isReceived && (
                      <DropdownMenuItem onClick={() => handleAction('cancel')} className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-amber-50 text-amber-600 rounded-lg font-bold">
                        <X className="h-4 w-4" />
                        <span>Cancel Request</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleAction('cancel')}
                      className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-red-50 text-red-600 rounded-lg font-bold border-t border-slate-100 mt-1 pt-3"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Permanently Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          <div className="bg-gradient-to-br from-blue-50/50 to-teal-50/30 rounded-xl p-4 border border-blue-100/50">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed font-medium">{request.message}</p>
                {request.responseMessage && (
                  <div className="mt-3 pt-3 border-t border-teal-100/50">
                    <p className="text-xs font-semibold text-teal-700 uppercase mb-1">Response from {targetUser.name}:</p>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm italic">{request.responseMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {Object.keys(request.metadata || {}).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(request.metadata || {})
                .filter(([key]) => key !== 'respondedMetadata')
                .map(([key, value]) => {
                  const Icon = getMetadataIcon(key);
                  const formattedKey = key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
                  const isUrgency = key.toLowerCase().includes('urgency') || key.toLowerCase().includes('emergency');
                  const isSymptom = key.toLowerCase().includes('symptom');

                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${isUrgency
                        ? 'bg-red-50 border-red-100'
                        : isSymptom
                          ? 'bg-amber-50 border-amber-100'
                          : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isUrgency ? 'text-red-600' : isSymptom ? 'text-amber-600' : 'text-teal-600'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wide">
                          {formattedKey}
                        </div>
                        <div className="text-sm font-semibold text-gray-800 truncate">
                          {key === 'vitals' && typeof value === 'object' && value !== null ? (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {Object.entries(value).map(([vKey, vValue]) => vValue && (
                                <div key={vKey} className="flex flex-col bg-white/50 p-1.5 rounded-md border border-slate-100">
                                  <span className="text-[8px] font-black text-slate-400 min-w-[50px] uppercase truncate">
                                    {vKey.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <span className="text-[10px] font-black text-slate-900">{String(vValue)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            String(value)
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {showActions && (
            <div className="pt-4 border-t border-gray-200">
              {request.status === 'pending' || request.status === 'approved' ? (
                <div className="flex items-center gap-3">
                  {isReceived ? (
                    <>
                      <Button
                        onClick={() => {
                          const schedulingTypes = ['consultation_request', 'appointment_proposal', 'call_request'];
                          if (schedulingTypes.includes(request.requestType)) {
                            setModalType('approve');
                            setShowResponseModal(true);
                          } else {
                            handleAction('approve');
                          }
                        }}
                        disabled={loading === 'approve'}
                        className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all duration-200 h-11 rounded-xl font-bold"
                      >
                        {loading === 'approve' ? (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        {['consultation_request', 'appointment_proposal', 'call_request'].includes(request.requestType) ? 'Accept' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => {
                          setModalType('reject');
                          setShowResponseModal(true);
                        }}
                        disabled={loading === 'reject'}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 h-11 rounded-xl font-bold"
                      >
                        {loading === 'reject' ? (
                          <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Reject Request
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col w-full gap-3">
                      {request.status === 'pending' && (
                        <Button
                          onClick={() => handleAction('cancel')}
                          disabled={loading === 'cancel'}
                          className="w-full bg-slate-900 hover:bg-black text-white font-bold h-11 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                          {loading === 'cancel' ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          Cancel & Withdraw Request
                        </Button>
                      )}

                      {request.status === 'approved' && (
                        <div className="flex gap-3 w-full">
                          <Button
                            onClick={() => handleAction('confirm')}
                            disabled={loading === 'confirm'}
                            className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-md transition-all duration-200"
                          >
                            {loading === 'confirm' ? (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Confirm Appointment
                          </Button>
                          <Button
                            onClick={() => handleAction('decline')}
                            disabled={loading === 'decline'}
                            variant="outline"
                            className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                          >
                            {loading === 'decline' ? (
                              <div className="h-4 w-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                              <X className="h-4 w-4 mr-2" />
                            )}
                            Decline Schedule
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col w-full gap-3">
                  {request.status === 'completed' && !isReceived && (
                    <Button
                      onClick={() => setShowReviewModal(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-xl h-11 font-bold uppercase tracking-tight rounded-xl"
                    >
                      <Star className="h-4 w-4 mr-2 fill-white" />
                      Rate Performance
                    </Button>
                  )}
                  {request.status === 'scheduled' && !isReceived && (
                    <Button
                      onClick={handleMarkComplete}
                      disabled={isUpdatingStatus}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-lg flex items-center justify-center gap-2"
                    >
                      {isUpdatingStatus ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Mark as Service Completed
                    </Button>
                  )}
                  {/* For all other statuses (rejected, cancelled, completed), show a direct Delete button */}
                  <Button
                    onClick={() => handleAction('cancel')}
                    disabled={loading === 'cancel'}
                    variant="outline"
                    className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 font-bold h-11 rounded-xl flex items-center justify-center gap-2"
                  >
                    {loading === 'cancel' ? (
                      <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete from History
                  </Button>
                </div>
              )}
            </div>
          )}

        </CardContent>

        <PerformanceReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          request={request}
          onSuccess={() => { }}
        />

        {showResponseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("p-2 rounded-lg", modalType === 'approve' ? "bg-teal-100" : "bg-red-100")}>
                    {modalType === 'approve' ? <Calendar className="h-5 w-5 text-teal-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {modalType === 'approve' ? 'Appointment Schedule Form' : 'Provide Reason for Declining'}
                  </h3>
                </div>

                <div className="space-y-4 mb-6">
                  {modalType === 'approve' && (
                    <>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldAlert className="h-4 w-4 text-amber-600" />
                          <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Payment Protocol Notice</p>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-tight">
                          By scheduling this consultation, the specified fee will be **automatically deducted** from the user's account.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (USD)</label>
                        <div className="relative">
                          <div className="absolute left-3 top-2.5 text-gray-400 font-bold">$</div>
                          <input
                            type="number"
                            id="response-fee"
                            className="w-full p-2 pl-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Date</label>
                          <input
                            type="date"
                            id="response-date"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Time</label>
                          <input
                            type="time"
                            id="response-time"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {modalType === 'approve' ? 'Additional Message' : 'Reason / Note'}
                    </label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      placeholder={modalType === 'approve' ? "Add a response message (optional)" : "Please state why you are unable to accept this request"}
                      className={cn(
                        "w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 resize-none",
                        modalType === 'approve' ? "focus:ring-teal-500" : "focus:ring-red-500"
                      )}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowResponseModal(false)}>Cancel</Button>
                  <Button
                    onClick={() => {
                      if (modalType === 'approve') {
                        const fee = (document.getElementById('response-fee') as HTMLInputElement)?.value;
                        const date = (document.getElementById('response-date') as HTMLInputElement)?.value;
                        const time = (document.getElementById('response-time') as HTMLInputElement)?.value;
                        const metadata: Record<string, any> = {};
                        if (fee) metadata.consultationFee = fee;
                        if (date) metadata.appointmentDate = date;
                        if (time) metadata.appointmentTime = time;
                        handleAction('approve', responseMessage, metadata);
                      } else {
                        handleAction('reject', responseMessage);
                      }
                      setShowResponseModal(false);
                      setResponseMessage('');
                    }}
                    className={cn(
                      "font-bold text-white",
                      modalType === 'approve' ? "bg-teal-600 hover:bg-teal-700" : "bg-red-600 hover:bg-red-700"
                    )}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
