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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RequestActionButtons } from '@/components/patients/RequestActionButtons';

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
      // Use existing requests endpoint to get approved requests
      const response = await discoveryService.getReceivedRequests({ status: 'approved', page: 1, limit: 100 });
      
      // Filter for only patient_request type requests
      const patientRequests = (response.requests || []).filter(request => {
        const isPatientRequest = request.requestType === 'patient_request';
        if (!isPatientRequest) {
          console.log('🔍 SKIPPING NON-PATIENT REQUEST:', {
            requestId: request.id,
            requestType: request.requestType,
            senderName: request.sender?.profile?.displayName || request.sender?.displayName,
            senderRoles: request.sender?.roles,
            reason: 'Not a patient_request type'
          });
        }
        return isPatientRequest;
      });
      
      console.log('🔍 REQUEST FILTERING SUMMARY:', {
        totalRequests: (response.requests || []).length,
        patientRequests: patientRequests.length,
        otherRequests: (response.requests || []).length - patientRequests.length,
        reason: 'Only patient_request type requests are processed'
      });
      
      // Transform approved patient requests into patient data
      const patientsMap = new Map<string, Patient>();
      
      patientRequests.forEach(request => {
        const sender = request.sender;
        const senderRoles = sender?.roles || [];
        
        // Only include users with 'patient' role (double check)
        if (!senderRoles.includes('patient')) {
          console.log('🔍 SKIPPING NON-PATIENT USER:', {
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
            reason: 'User has patient role and sent patient_request'
          });
        }
      });
      
      const patientsData: Patient[] = Array.from(patientsMap.values());

      console.log('🔍 FINAL PATIENT SUMMARY:', {
        totalPatientRequests: patientRequests.length,
        uniquePatients: patientsData.length,
        reason: 'Only users with patient role who sent patient_request type'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                {pageTitle}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {pageDescription}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Patients
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.total}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Patients
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.active}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    New This Month
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.newThisMonth}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search patients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading patients...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {getInitials(patient)}
                      </div>

                      {/* Patient Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {patient.profile?.displayName || 
                             `${patient.profile?.firstName || ''} ${patient.profile?.lastName || ''}`.trim() ||
                             'Unknown Patient'}
                          </h3>
                          {patient.status === 'active' && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Active
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Mail className="h-4 w-4" />
                            <span>{patient.email}</span>
                          </div>

                          {patient.profile?.phoneNumber && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Phone className="h-4 w-4" />
                              <span>{patient.profile.phoneNumber}</span>
                            </div>
                          )}

                          {patient.profile?.dateOfBirth && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Age: {getPatientAge(patient.profile.dateOfBirth)} years
                                {patient.profile.gender && ` • ${patient.profile.gender}`}
                              </span>
                            </div>
                          )}

                          {(patient.profile?.city || patient.profile?.state) && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {[patient.profile?.city, patient.profile?.state].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Additional Stats */}
                        <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Patient since {new Date(patient.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {patient.appointmentCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{patient.appointmentCount} appointments</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(patient)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No patients found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm
                  ? 'No patients match your search criteria.'
                  : 'You don\'t have any approved patients yet.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Patient Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                Complete information about the patient
              </DialogDescription>
            </DialogHeader>

            {selectedPatient && (
              <div className="space-y-6">
                {/* Patient Header */}
                <div className="flex items-center gap-4 pb-6 border-b">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-2xl">
                    {getInitials(selectedPatient)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedPatient.profile?.displayName || 
                       `${selectedPatient.profile?.firstName || ''} ${selectedPatient.profile?.lastName || ''}`.trim() ||
                       'Unknown Patient'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedPatient.email}
                    </p>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedPatient.profile?.firstName && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">First Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPatient.profile.firstName}
                        </p>
                      </div>
                    )}
                    {selectedPatient.profile?.lastName && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Last Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPatient.profile.lastName}
                        </p>
                      </div>
                    )}
                    {selectedPatient.profile?.dateOfBirth && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Age</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getPatientAge(selectedPatient.profile.dateOfBirth)} years
                        </p>
                      </div>
                    )}
                    {selectedPatient.profile?.gender && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Gender</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPatient.profile.gender}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedPatient.email}
                      </p>
                    </div>
                    {selectedPatient.profile?.phoneNumber && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Phone Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPatient.profile.phoneNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {(selectedPatient.profile?.address || selectedPatient.profile?.city) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Address
                    </h4>
                    <div className="text-sm space-y-2">
                      {selectedPatient.profile?.address && (
                        <p className="text-gray-900 dark:text-white">
                          {selectedPatient.profile.address}
                        </p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400">
                        {[
                          selectedPatient.profile?.city,
                          selectedPatient.profile?.state,
                          selectedPatient.profile?.country
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Vitals & Bio-Information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Medical Vitals & Bio-Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Blood Group</p>
                      <p className="text-lg font-black text-rose-600">
                        {selectedPatient.profile?.bloodGroup || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Genotype</p>
                      <p className="text-lg font-black text-blue-600">
                        {selectedPatient.profile?.genotype || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Height</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        {selectedPatient.profile?.height ? `${selectedPatient.profile.height} cm` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Weight</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        {selectedPatient.profile?.weight ? `${selectedPatient.profile.weight} kg` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Stats */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Administrative Records
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Patient Since</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedPatient.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedPatient.lastVisit && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Last Visit</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedPatient.appointmentCount !== undefined && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Total Appointments</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPatient.appointmentCount}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Status</p>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {selectedPatient.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Clinical Action Buttons */}
                <RequestActionButtons 
                  patient={selectedPatient} 
                  onRefresh={fetchPatients} 
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PatientsPage;
