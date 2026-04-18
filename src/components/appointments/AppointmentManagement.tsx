import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  X,
  Download,
  Search,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  History,
  Star
} from 'lucide-react';
import { Appointment } from '@/types/appointments';
import { useAppointments, useAppointmentStats, useUpcomingAppointments, usePastAppointments } from '@/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BookAppointmentModal } from './BookAppointmentModal';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { InvoiceModal } from '../dashboard/InvoiceModal';
import { appointmentService } from '@/services/appointmentService';
import { cn } from '@/lib/utils';

interface AppointmentManagementProps {
  centerId?: string;
  patientId?: string;
  providerId?: string;
  userRoles?: string[];
  userId?: string;
  showBookModal?: boolean;
  setShowBookModal?: (show: boolean) => void;
}

const AppointmentManagement: React.FC<AppointmentManagementProps> = ({
  centerId,
  patientId,
  providerId,
  userRoles = [],
  userId,
  showBookModal = false,
  setShowBookModal
}) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('all');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoicePatientName, setInvoicePatientName] = useState('');

  const canApproveAppointments = userRoles.some(role =>
    ['doctor', 'staff', 'admin', 'center'].includes(role)
  );

  const today = new Date().toISOString().split('T')[0];

  const {
    appointments,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    cancelAppointment,
    confirmAppointment,
    deleteAppointment
  } = useAppointments({
    centerId,
    patientId,
    providerId,
    page: 1,
    limit: 20,
    dateFrom: today
  });

  const safeAppointments = appointments || [];
  const stats = useAppointmentStats(safeAppointments);

  const pendingAppointments = safeAppointments.filter(apt =>
    apt.confirmationStatus === 'pending' && new Date(apt.appointmentDate) >= new Date()
  );
  const upcomingAppointments = useUpcomingAppointments(safeAppointments, 10);
  const pastAppointments = usePastAppointments(safeAppointments, 10);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-slate-900 text-white';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !cancelReason) return;
    try {
      await cancelAppointment(selectedAppointment.id, cancelReason, userId);
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (window.confirm('IRREVERSIBLE: Execute permanent deletion of this clinical appointment?')) {
      try {
        await deleteAppointment(appointment.id);
      } catch (error) {
        console.error('Failed to delete appointment:', error);
      }
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      await confirmAppointment(selectedAppointment.id, approvalMessage);
      setShowApproveDialog(false);
      setApprovalMessage('');
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
    }
  };

  const handleOpenConfirmDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    if (canApproveAppointments) {
      setShowApproveDialog(true);
    } else {
      // Patients confirm directly if allowed
      confirmAppointment(appointment.id);
    }
  };

  const handleQuickFilter = (filter: string) => {
    setSelectedQuickFilter(filter);
    if (filter === 'all') {
      updateFilters({ status: undefined });
    } else {
      updateFilters({ status: filter as any });
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing synchronization registry...</p>
    </div>
  );

  if (error) return (
    <div className="p-12 text-center space-y-6">
      <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900">Registry Conflict Detected</h3>
        <p className="text-slate-500 font-medium mt-2">{error}</p>
      </div>
      <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl px-10 h-14 font-black">
        Retry Synchronization
      </Button>
    </div>
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* STATS OVERLAY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: 'Pending Approval', val: stats.pending, icon: Clock, color: 'from-amber-400 to-orange-500', trend: '+12%', up: true },
          { label: 'Upcoming sessions', val: stats.upcoming, icon: Calendar, color: 'from-primary to-emerald-500', trend: '+5%', up: true },
          { label: 'Past encounters', val: stats.completed, icon: CheckCircle, color: 'from-slate-700 to-slate-900', trend: 'Stable', up: true },
          { label: 'System Conflicts', val: stats.cancelled, icon: Activity, color: 'from-red-400 to-rose-600', trend: '-2%', up: false }
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-soft group hover:shadow-premium transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500" />
            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-gradient-to-br ${s.color} p-2.5 md:p-3.5 mb-4 md:mb-6 shadow-lg shadow-primary/20 relative z-10`}>
              <s.icon className="w-full h-full text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <div className="flex items-end gap-2 md:gap-3">
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 leading-none">{s.val}</h3>
                <div className={`flex items-center gap-0.5 md:gap-1 text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-full mb-0.5 md:mb-1 ${s.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {s.up ? <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3" /> : <TrendingDown className="h-2.5 w-2.5 md:h-3 md:w-3" />}
                  {s.trend}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FILTER MATRIX - DESKTOP */}
      <div className="hidden lg:block">
        <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-soft flex items-center gap-8">
          <div className="flex-1 space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Protocol Filter</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(val) => updateFilters({ status: val === 'all' ? undefined : val as any })}
            >
              <SelectTrigger className="h-16 rounded-[24px] bg-slate-50/50 border-none px-6 font-black text-slate-900 focus:ring-primary/20 shadow-inner">
                <SelectValue placeholder="Unified Filtering" />
              </SelectTrigger>
              <SelectContent className="rounded-3xl border-slate-100 shadow-premium">
                <SelectItem value="all">Full Registry Access</SelectItem>
                <SelectItem value="pending">Awaiting Review</SelectItem>
                <SelectItem value="confirmed">Authorized Sessions</SelectItem>
                <SelectItem value="completed">Archive Data</SelectItem>
                <SelectItem value="cancelled">Supressed Protocols</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Temporal Range</Label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilters({ dateFrom: e.target.value })}
              className="h-16 rounded-[24px] bg-slate-50/50 border-none px-6 font-black text-slate-900 shadow-inner focus:ring-primary/20"
            />
          </div>

          <div className="flex-1 space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Temporal Range</Label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilters({ dateTo: e.target.value })}
              className="h-16 rounded-[24px] bg-slate-50/50 border-none px-6 font-black text-slate-900 shadow-inner focus:ring-primary/20"
            />
          </div>

          <div className="pt-6">
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-16 px-8 rounded-[24px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all uppercase text-[10px] tracking-widest"
            >
              Reset Parameters
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE QUICK FILTERS */}
      <div className="lg:hidden -mx-4">
        <div className="flex gap-3 overflow-x-auto px-4 pb-6 no-scrollbar scroll-smooth">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'completed', label: 'History' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => handleQuickFilter(f.id)}
              className={`flex-shrink-0 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedQuickFilter === f.id
                ? 'bg-slate-900 text-white shadow-premium scale-105'
                : 'bg-white text-slate-400 border border-slate-100'
                }`}
            >
              {f.label}
            </button>
          ))}
          <div className="w-12 flex-shrink-0" /> {/* Larger spacer for end of scroll */}
        </div>
      </div>

      {/* WORKSPACE CONTENT */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <div className="-mx-4">
          <div className="flex md:justify-center overflow-x-auto px-4 pb-6 no-scrollbar scroll-smooth">
            <TabsList className="bg-slate-50 p-1.5 md:p-2 rounded-full md:rounded-[30px] border border-slate-100 h-auto flex min-w-max mr-4">
              {[
                { v: 'pending', l: 'Pending Approval', c: pendingAppointments.length, i: Clock },
                { v: 'upcoming', l: 'Confirmed Schedule', c: upcomingAppointments.length, i: Calendar },
                { v: 'past', l: 'Archive / History', c: pastAppointments.length, i: History }
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="rounded-full px-5 md:px-8 py-2.5 md:py-3.5 data-[state=active]:bg-white data-[state=active]:shadow-soft data-[state=active]:text-primary font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <t.i className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {t.l}
                  <span className="bg-slate-900/10 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] ml-1">{t.c}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="w-12 flex-shrink-0 md:hidden" /> {/* Added significant spacer */}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {activeTab === 'pending' && pendingAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  item={item}
                  canApprove={canApproveAppointments}
                  isPast={new Date(apt.appointmentDate) < new Date()}
                  onConfirm={() => handleOpenConfirmDialog(apt)}
                  onCancel={() => { setSelectedAppointment(apt); setShowCancelDialog(true); }}
                  onReschedule={(apt: any) => { setSelectedAppointment(apt); setShowRescheduleModal(true); }}
                  onDelete={() => handleDeleteAppointment(apt)}
                  onGenerateInvoice={(name: string) => { setInvoicePatientName(name); setShowInvoiceModal(true); }}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusStyle={getStatusStyle}
                  getPriorityStyle={getPriorityStyle}
                />
              ))}

              {activeTab === 'upcoming' && upcomingAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  item={item}
                  canApprove={false}
                  onCancel={() => { setSelectedAppointment(apt); setShowCancelDialog(true); }}
                  onDelete={() => handleDeleteAppointment(apt)}
                  onGenerateInvoice={(name: string) => { setInvoicePatientName(name); setShowInvoiceModal(true); }}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusStyle={getStatusStyle}
                  getPriorityStyle={getPriorityStyle}
                />
              ))}

              {activeTab === 'past' && pastAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  item={item}
                  canApprove={false}
                  isPast
                  onDelete={() => handleDeleteAppointment(apt)}
                  onGenerateInvoice={(name: string) => { setInvoicePatientName(name); setShowInvoiceModal(true); }}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusStyle={getStatusStyle}
                  getPriorityStyle={getPriorityStyle}
                />
              ))}

              {(activeTab === 'pending' ? pendingAppointments : activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).length === 0 && (
                <motion.div
                  variants={item}
                  className="col-span-full py-16 md:py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-[32px] md:rounded-[60px] border border-dashed border-slate-200"
                >
                  <div className="bg-slate-50 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-inner">
                    <Calendar className="h-10 w-10 md:h-12 md:w-12 text-slate-200" />
                  </div>
                  <div className="max-w-md mx-auto px-6">
                    <h4 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">Protocol Vacancy</h4>
                    <p className="text-slate-400 text-sm md:text-base font-medium mt-2 italic px-4 md:px-8">No session signatures detected in this Temporal Sector of the clinical registry.</p>
                  </div>
                  {activeTab === 'upcoming' && (
                    <Button
                      onClick={() => setShowBookModal?.(true)}
                      className="h-14 px-10 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-widest shadow-premium"
                    >
                      {canApproveAppointments ? 'Reschedule (Missed Session)' : 'Initialize Authorization'}
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* MODALS */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-2xl rounded-[40px] border-none shadow-premium p-10">
          <DialogHeader className="mb-8">
            <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <DialogTitle className="text-3xl font-black text-slate-900 uppercase tracking-tight">Supression Directive</DialogTitle>
            <p className="text-slate-500 font-medium italic mt-2">Mutual consent and documented rationale required for session termination.</p>
          </DialogHeader>
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Reason for Cancellation Protocol</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="State the clinical or administrative rationale for session termination..."
                className="min-h-[150px] rounded-[32px] border-slate-100 bg-slate-50 p-6 font-medium italic focus:ring-red-500/20 shadow-inner"
              />
            </div>
            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8">
              <input
                type="checkbox"
                id="consent"
                className="w-6 h-6 mt-1 rounded-lg border-slate-200 text-red-600 focus:ring-red-500/20"
                defaultChecked={false}
              />
              <Label htmlFor="consent" className="text-sm font-bold text-slate-600 leading-relaxed cursor-pointer">
                I confirm that both parties (Doctor and Patient) have signaled mutual consent for this cancellation and it has been documented in the rationale above.
              </Label>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setShowCancelDialog(false)} className="flex-1 h-16 rounded-[24px] font-black uppercase text-xs tracking-widest">
                Abort Directive
              </Button>
              <Button
                onClick={handleCancelAppointment}
                disabled={!cancelReason.trim()}
                className="flex-1 h-16 rounded-[24px] bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-red-200"
              >
                Confirm Termination
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {
        showBookModal && setShowBookModal && (
          <BookAppointmentModal
            isOpen={showBookModal}
            onClose={() => setShowBookModal?.(false)}
            onSuccess={() => { }}
            patientId={patientId}
            centerId={centerId}
          />
        )
      }

      {showRescheduleModal && selectedAppointment && (
        <RescheduleAppointmentModal
          isOpen={showRescheduleModal}
          onClose={() => { setShowRescheduleModal(false); setSelectedAppointment(null); }}
          onSuccess={() => { /* list updates via hook */ }}
          appointment={selectedAppointment}
        />
      )}

      {/* APPROVAL DIALOG */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-2xl rounded-[40px] border-none shadow-premium p-10">
          <DialogHeader className="mb-8">
            <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <DialogTitle className="text-3xl font-black text-slate-900 uppercase tracking-tight">Manual Authorization</DialogTitle>
            <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <p className="text-[10px] font-bold text-blue-700 uppercase leading-relaxed tracking-tight">
                Clinical Managed Queue Logic:
                <span className="block mt-1 font-medium italic normal-case text-blue-600/80">
                  Doctors may limit daily consultations to ensure quality of care. This session is currently pending review based on the first-come-first-serve protocol. Manual approval will bypass the queue.
                </span>
              </p>
            </div>
          </DialogHeader>
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 group flex justify-between">
                <span>Message to Patient</span>
                <span className="text-emerald-500 animate-pulse">Email Notification Active</span>
              </Label>
              <Textarea
                value={approvalMessage}
                onChange={(e) => setApprovalMessage(e.target.value)}
                placeholder="Ex: 'Your clinical slot has been authorized. Please arrive 15 minutes early for vitals screening...'"
                className="min-h-[150px] rounded-[32px] border-slate-100 bg-slate-50 p-6 font-medium italic focus:ring-emerald-500/20 shadow-inner"
              />
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setShowApproveDialog(false)} className="flex-1 h-16 rounded-[24px] font-black uppercase text-xs tracking-widest">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAppointment}
                className="flex-1 h-16 rounded-[24px] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-200"
              >
                Authorize & Notify Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        patientName={invoicePatientName}
      />
    </div >
  );
};

const AppointmentCard = ({
  apt,
  item,
  canApprove,
  isPast,
  onConfirm,
  onCancel,
  onDelete,
  onReschedule,
  onGenerateInvoice,
  formatDate,
  formatTime,
  getStatusStyle,
  getPriorityStyle
}: any) => (
  <motion.div
    variants={item}
    whileHover={{ y: -8, scale: 1.01 }}
    className={`bg-white rounded-[40px] border border-slate-100 p-8 shadow-soft hover:shadow-premium transition-all relative overflow-hidden group ${isPast ? 'opacity-70 grayscale-[0.3]' : ''}`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors duration-500" />

    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className="flex gap-3">
        <Badge className={`${getPriorityStyle(apt.priority)} uppercase text-[9px] font-black px-4 py-1.5 rounded-full shadow-sm`}>
          {apt.priority}
        </Badge>
        {!isPast && (
          <Badge variant="outline" className={`${getStatusStyle(apt.confirmationStatus || 'pending')} uppercase text-[9px] font-black px-4 py-1.5 rounded-full border shadow-sm`}>
            {apt.confirmationStatus === 'pending' ? 'Review Required' : 'Authorized'}
          </Badge>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-inner">
            <MoreVertical className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-premium p-2">
          <DropdownMenuItem onClick={onDelete} className="text-red-500 rounded-xl focus:bg-red-50 focus:text-red-600 font-black text-xs uppercase tracking-widest p-3">
            <Trash2 className="h-4 w-4 mr-3" /> Execute Purge
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onReschedule(apt)}
            className="rounded-xl font-black text-xs uppercase tracking-widest p-3 text-slate-600 cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-3" /> Reschedule Session
          </DropdownMenuItem>
          {isPast && (
            <DropdownMenuItem
              onClick={() => {
                const name = apt.patient?.fullName || apt.patient?.firstName + ' ' + apt.patient?.lastName || 'Patient';
                onGenerateInvoice(name);
              }}
              className="rounded-xl font-black text-xs uppercase tracking-widest p-3 text-emerald-600 cursor-pointer bg-emerald-50 focus:bg-emerald-100 focus:text-emerald-700"
            >
              <Download className="h-4 w-4 mr-3" /> Generate Invoice
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="space-y-6 relative z-10">
      <div className="flex items-center gap-5">
        <div className={`h-16 w-16 rounded-[24px] flex items-center justify-center font-black text-xl shadow-inner border border-slate-100 transition-colors group-hover:bg-primary group-hover:text-white ${isPast ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-900'}`}>
          {apt.doctor?.substring(0, 2).toUpperCase() || 'PH'}
        </div>
        <div>
          <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight leading-none mb-2 group-hover:text-primary transition-colors">{apt.doctor}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> Clinical Specialist • Verified
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-50 shadow-inner group-hover:bg-white transition-colors duration-500">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Calendar className="h-3 w-3 text-primary" /> Temporal Date
          </p>
          <p className="font-black text-slate-900">{formatDate(apt.appointmentDate)}</p>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-50 shadow-inner group-hover:bg-white transition-colors duration-500">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Clock className="h-3 w-3 text-primary" /> Global Time
          </p>
          <p className="font-black text-slate-900">{formatTime(apt.appointmentDate)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 px-2 italic">
        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="truncate">{apt.center?.name || 'Authorized Network Node'}</span>
      </div>
    </div>

    <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
      {apt.confirmationStatus === 'pending' && (
        <Button
          onClick={onConfirm}
          className="h-12 flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-95"
        >
          {canApprove ? 'Authorize Encounter' : 'Confirm & Book Session'}
        </Button>
      )}
      {!isPast && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className={cn(
            "h-12 rounded-2xl text-red-400 hover:text-red-600 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest transition-all",
            canApprove && apt.confirmationStatus === 'pending' ? "w-12 px-0" : "w-full"
          )}
        >
          {canApprove && apt.confirmationStatus === 'pending' ? <XCircle className="h-5 w-5" /> : 'Initiate Cancellation'}
        </Button>
      )}
      {isPast && (
        <div className="w-full text-center py-2">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Temporal Archive • Read Only</span>
        </div>
      )}
    </div>
  </motion.div>
);

export default AppointmentManagement;
