import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { discoveryService } from '@/services/discoveryService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Search,
  Filter,
  UserCheck,
  Users,
  Activity,
  Clock,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RequestActionButtons } from '@/components/patients/RequestActionButtons';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  userId: string;
  email: string;
  roles: string[];
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    bloodGroup?: string;
    genotype?: string;
    height?: number;
    weight?: number;
  };
  createdAt: string;
  lastVisit?: string;
  appointmentCount?: number;
  status?: 'active' | 'inactive';
}


const PatientsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
  });

  // Determine if user is a center or individual provider
  const isCenter = (user?.roles as any)?.includes('healthcare_provider') || (user?.roles as any)?.includes('center_admin');
  const pageTitle = isCenter ? 'Center Patients' : 'My Patients';
  const pageDescription = isCenter
    ? 'Manage patients assigned to your healthcare center'
    : 'View and manage your patient list';

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Use existing requests endpoint to get approved patients
      const response = await discoveryService.getReceivedRequests({ status: 'approved', page: 1, limit: 100 });

      // Transform approved requests into patient data
      const patientsMap = new Map<string, Patient>();

      (response.requests || []).forEach(request => {
        const sender = request.sender;
        const senderRoles = sender?.roles || [];

        // Only include users with 'patient' role
        if (!senderRoles.includes('patient')) {
          console.log('🔍 SKIPPING NON-PATIENT:', {
            senderId: sender?.id,
            senderName: sender?.profile?.displayName || sender?.displayName,
            roles: senderRoles,
            reason: 'User does not have patient role'
          });
          return;
        }

        const patientId = sender?.id || request.senderId;
        const existingPatient = patientsMap.get(patientId);

        if (existingPatient) {
          // If patient already exists, increment appointment count and update last visit
          existingPatient.appointmentCount = (existingPatient.appointmentCount || 0) + 1;
          if (request.respondedAt && new Date(request.respondedAt) > new Date(existingPatient.lastVisit || 0)) {
            existingPatient.lastVisit = request.respondedAt;
          }
        } else {
          // Create new patient entry
          patientsMap.set(patientId, {
            id: patientId,
            userId: patientId,
            email: sender?.email || '',
            roles: senderRoles,
            profile: {
              firstName: sender?.profile?.firstName,
              lastName: sender?.profile?.lastName,
              displayName: sender?.profile?.displayName || sender?.displayName,
              phoneNumber: sender?.profile?.phoneNumber,
              dateOfBirth: sender?.profile?.dateOfBirth,
              gender: sender?.profile?.gender,
              address: sender?.profile?.address,
              city: sender?.profile?.city,
              state: sender?.profile?.state,
              country: sender?.profile?.country,
              bloodGroup: sender?.profile?.bloodGroup,
              genotype: sender?.profile?.genotype,
              height: sender?.profile?.height,
              weight: sender?.profile?.weight,
            },
            createdAt: request.createdAt,
            lastVisit: request.respondedAt,
            appointmentCount: 1,
            status: 'active' as const,
          });

          console.log('✅ ADDED PATIENT:', {
            patientId: patientId,
            patientName: sender?.profile?.displayName || sender?.displayName,
            roles: senderRoles,
            reason: 'User has patient role'
          });
        }
      });

      const patientsData: Patient[] = Array.from(patientsMap.values());

      console.log('🔍 PATIENT FILTERING SUMMARY:', {
        totalRequests: (response.requests || []).length,
        filteredPatients: patientsData.length,
        skippedCount: (response.requests || []).length - patientsData.length,
        reason: 'Only users with patient role are included'
      });

      setPatients(patientsData);

      // Calculate stats
      const total = patientsData.length;
      const active = patientsData.filter(p => p.status === 'active').length;
      const currentMonth = new Date().getMonth();
      const newThisMonth = patientsData.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate.getMonth() === currentMonth;
      }).length;

      setStats({ total, active, newThisMonth });
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const exportPatientsToCSV = () => {
    if (patients.length === 0) {
      toast.error('No patients to export');
      return;
    }

    try {
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Gender', 'Age', 'Blood Group', 'Genotype', 'Patient Since'];
      const rows = patients.map(p => [
        p.userId,
        p.profile?.displayName || `${p.profile?.firstName || ''} ${p.profile?.lastName || ''}`.trim(),
        p.email,
        p.profile?.phoneNumber || 'N/A',
        p.profile?.gender || 'N/A',
        getPatientAge(p.profile?.dateOfBirth) || 'N/A',
        p.profile?.bloodGroup || 'N/A',
        p.profile?.genotype || 'N/A',
        new Date(p.createdAt).toLocaleDateString()
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Patient list exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchPatients();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsDialog(true);
  };

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const displayName = patient.profile?.displayName?.toLowerCase() || '';
    const email = patient.email?.toLowerCase() || '';
    const firstName = patient.profile?.firstName?.toLowerCase() || '';
    const lastName = patient.profile?.lastName?.toLowerCase() || '';

    return displayName.includes(searchLower) ||
      email.includes(searchLower) ||
      firstName.includes(searchLower) ||
      lastName.includes(searchLower);
  });

  const getInitials = (patient: Patient) => {
    const name = patient.profile?.displayName || patient.email;
    if (!name) return 'PT';

    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPatientAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Superior Header Design */}
        <div className="pt-10 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest border border-blue-100 dark:border-blue-800 shadow-sm backdrop-blur-sm">
                <Users className="h-3.5 w-3.5" /> Clinical Oversight
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {pageTitle}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
                {pageDescription}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={exportPatientsToCSV}
                className="group relative overflow-hidden rounded-2xl h-14 px-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black hover:border-blue-500 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-3"
              >
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Download className="h-5 w-5 text-blue-600 relative z-10" />
                <span className="relative z-10">Export CSV</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Patients', value: stats.total, icon: Users, color: 'blue', bg: 'bg-blue-600' },
            { label: 'Active Cases', value: stats.active, icon: UserCheck, color: 'emerald', bg: 'bg-emerald-500' },
            { label: 'Monthly Growth', value: `+${stats.newThisMonth}`, icon: Activity, color: 'purple', bg: 'bg-purple-600' }
          ].map((stat, idx) => (
            <Card key={idx} className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                      {stat.label}
                    </p>
                    <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn("h-16 w-16 rounded-[1.75rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500", stat.bg)}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modernized Search Registry */}
        <div className="relative mb-10">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-[3rem] blur-2xl opacity-100"></div>
          <Card className="rounded-[2.25rem] border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden relative z-10 p-2">
            <CardContent className="p-2 sm:p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search clinical registry by patient identity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-16 h-16 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-blue-100 dark:focus-visible:ring-blue-900/30 text-lg shadow-inner"
                />
              </div>
              <Button className="h-16 rounded-2xl px-10 bg-slate-900 dark:bg-blue-600 text-white font-black hover:bg-black dark:hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-slate-200 dark:shadow-none">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Patient Registry Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="h-20 w-20 border-8 border-slate-100 dark:border-slate-800 rounded-full"></div>
              <div className="absolute top-0 left-0 h-20 w-20 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[11px] tracking-[0.4em] animate-pulse">Syncing Medical Database</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className="rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-none overflow-hidden bg-white dark:bg-slate-900 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900 transition-all group"
              >
                <CardContent className="p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row items-start gap-8">
                    {/* Identity Core */}
                    <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                      <div className="h-24 w-24 rounded-[2.25rem] bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-slate-200 dark:shadow-none group-hover:scale-105 transition-transform duration-500">
                        {getInitials(patient)}
                      </div>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 h-8 w-8 border-4 border-white dark:border-slate-900 rounded-full shadow-lg",
                        patient.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                      )}></div>
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                            {patient.profile?.displayName ||
                              `${patient.profile?.firstName || ''} ${patient.profile?.lastName || ''}`.trim() ||
                              'Classified Patient'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="rounded-full border-slate-200 dark:border-slate-700 font-bold text-[10px] text-slate-500 dark:text-slate-400">
                              ID: {patient.id.slice(0, 8).toUpperCase()}
                            </Badge>
                            {patient.profile?.bloodGroup && (
                              <Badge className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-none font-black text-[10px]">
                                {patient.profile.bloodGroup} POS
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-y-3 mb-8">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold text-[13px] hover:text-blue-600 transition-colors cursor-pointer truncate">
                          <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <Mail className="h-4 w-4" />
                          </div>
                          {patient.email}
                        </div>

                        <div className="flex flex-wrap gap-4">
                          {patient.profile?.phoneNumber && (
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold text-[13px]">
                              <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <Phone className="h-4 w-4" />
                              </div>
                              {patient.profile.phoneNumber}
                            </div>
                          )}

                          {patient.profile?.dateOfBirth && (
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold text-[13px]">
                              <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <Calendar className="h-4 w-4" />
                              </div>
                              {getPatientAge(patient.profile.dateOfBirth)} yrs • {patient.profile.gender || 'Not Specified'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                        <Button
                          onClick={() => handleViewDetails(patient)}
                          className="w-full sm:flex-1 rounded-2xl h-14 bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 dark:shadow-none"
                        >
                          Clinical Record
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetails(patient)}
                          className="h-14 w-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-transparent group/eye shadow-sm"
                        >
                          <Eye className="h-6 w-6 text-slate-300 group-hover/eye:text-blue-500 transition-colors" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-[4rem] border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="py-32 text-center">
              <div className="h-24 w-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
                No active patient records
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto text-lg leading-relaxed mb-10">
                {searchTerm
                  ? `Search query "${searchTerm}" yielded no results in the clinical registry.`
                  : 'Your clinical practice is ready for new patient connections via the discovery portal.'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => navigate('/discovery')}
                  className="rounded-full h-16 px-12 bg-blue-600 text-white font-black hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all hover:scale-105"
                >
                  Explore Discovery Portal
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Patient Details Intelligence Center */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-none shadow-[0_0_100px_rgba(0,0,0,0.2)] rounded-[3rem] flex flex-col">
            <div className="p-10 pb-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
              <DialogHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                    <UserCheck className="h-3.5 w-3.5" /> Identity Verified
                  </div>
                </div>
                <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                  {selectedPatient && getInitials(selectedPatient)}
                  <span className="tracking-tight">Clinical Identity Summary</span>
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium text-lg pt-2">
                  Comprehensive professional oversight for {selectedPatient?.profile?.displayName || 'subject'}.
                </DialogDescription>
              </DialogHeader>
            </div>

            <ScrollArea className="flex-1 p-10 pt-6 bg-slate-50/50 dark:bg-slate-950/50">
              {selectedPatient && (
                <div className="space-y-8 pb-10">
                  {/* Subject Identification Card */}
                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                    <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-8">
                      <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                        {getInitials(selectedPatient)}
                      </div>
                      <div className="text-center sm:text-left space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white truncate">
                          {selectedPatient.profile?.displayName || 'Classified Patient'}
                        </h2>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                          <Badge className="bg-blue-600 text-white border-none font-bold">{selectedPatient.email}</Badge>
                          <Badge variant="outline" className="border-slate-200 dark:border-slate-700 font-bold">{selectedPatient.profile?.gender || 'Universal'}</Badge>
                          <Badge variant="outline" className="border-slate-200 dark:border-slate-700 font-bold">{getPatientAge(selectedPatient.profile?.dateOfBirth)} Years</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Biometric Registry */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900">
                      <CardContent className="p-8 space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" /> Biometric Identity
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Blood Group</p>
                            <p className="text-2xl font-black text-rose-600">{selectedPatient.profile?.bloodGroup || 'N/A'}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Genotype</p>
                            <p className="text-2xl font-black text-blue-600">{selectedPatient.profile?.genotype || 'N/A'}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Height</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedPatient.profile?.height ? `${selectedPatient.profile.height} cm` : 'N/A'}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase">Weight</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedPatient.profile?.weight ? `${selectedPatient.profile.weight} kg` : 'N/A'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Geographical Attribution */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900">
                      <CardContent className="p-8 space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-rose-500" /> Strategic Location
                        </h4>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase">Registered Address</p>
                              <p className="font-bold text-slate-800 dark:text-white leading-tight">
                                {selectedPatient.profile?.address || 'Restricted Access'}
                              </p>
                              <p className="text-sm font-medium text-slate-500 mt-1">
                                {[selectedPatient.profile?.city, selectedPatient.profile?.state, selectedPatient.profile?.country].filter(Boolean).join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                              <Phone className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase">Encrypted Communication</p>
                              <p className="font-bold text-slate-800 dark:text-white">
                                {selectedPatient.profile?.phoneNumber || 'No verified number'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Clinical Actions Hub */}
                  <div className="pt-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4">Workspace Actions</h4>
                    <RequestActionButtons
                      patient={selectedPatient}
                      onRefresh={fetchPatients}
                    />
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <Button
                onClick={() => setShowDetailsDialog(false)}
                className="w-full h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black uppercase tracking-widest transition-all"
              >
                Close Intelligence Center
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PatientsPage;

