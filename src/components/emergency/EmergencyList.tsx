import React, { useState } from 'react';
import {
  AlertTriangle,
  Truck,
  Shield,
  MapPin,
  Phone,
  User,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Plus,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  EmergencyAlert,
  AmbulanceRequest,
  ViralReport,
  AlertType,
  AlertStatus,
  Priority,
  ReportStatus,
  AmbulanceTeamMember
} from '@/types/emergency';

interface EmergencyListProps {
  activeTab: 'alerts' | 'ambulances' | 'reports';
  alerts: EmergencyAlert[];
  ambulanceRequests: AmbulanceRequest[];
  viralReports: ViralReport[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  userRole: string;
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onDispatchAmbulance: (requestId: string, team: AmbulanceTeamMember[]) => void;
  onUpdateAmbulanceStatus: (requestId: string, status: string, metadata?: any) => void;
  onReviewReport: (reportId: string) => void;
  onVerifyReport: (reportId: string) => void;
  onCancelAmbulance: (requestId: string) => void;
  onPageChange: (page: number) => void;
  staffMembers?: any[];
}

export const EmergencyList: React.FC<EmergencyListProps> = ({
  activeTab,
  alerts,
  ambulanceRequests,
  viralReports,
  loading,
  error,
  pagination,
  userRole,
  onAcknowledgeAlert,
  onResolveAlert,
  onDispatchAmbulance,
  onUpdateAmbulanceStatus,
  onReviewReport,
  onVerifyReport,
  onCancelAmbulance,
  onPageChange,
  staffMembers = []
}) => {
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [seenDialogOpen, setSeenDialogOpen] = useState(false);
  const [deliveredDialogOpen, setDeliveredDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  // Dispatch state
  const [teamMembers, setTeamMembers] = useState<AmbulanceTeamMember[]>([
    { name: '', role: 'Driver', appId: '' }
  ]);

  // Seen state
  const [patientCondition, setPatientCondition] = useState('Stable');

  // Delivered state
  const [handover, setHandover] = useState({
    facilityName: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: ''
  });

  const commonRoles = ['Driver', 'Doctor', 'Nurse', 'Health Care Assistant', 'Paramedic'];

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', role: 'Nurse', appId: '' }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof AmbulanceTeamMember, value: string) => {
    const newTeam = [...teamMembers];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setTeamMembers(newTeam);
  };

  const handleDispatch = () => {
    if (selectedRequestId) {
      // Filter out empty rows
      const validTeam = teamMembers.filter(m => m.name.trim() !== '' || m.appId?.trim() !== '');
      onDispatchAmbulance(selectedRequestId, validTeam);
      setTeamDialogOpen(false);
      setSelectedRequestId(null);
      setTeamMembers([{ name: '', role: 'Driver', appId: '' }]);
    }
  };

  const openDispatchDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setTeamDialogOpen(true);
  };

  const openLiveTracking = (requestId: string) => {
    setTrackingId(requestId);
    setTrackingOpen(true);
  };

  const handleSeen = () => {
    if (selectedRequestId) {
      onUpdateAmbulanceStatus(selectedRequestId, 'on_scene', { patientConditionOnScene: patientCondition });
      setSeenDialogOpen(false);
      setSelectedRequestId(null);
    }
  };

  const handleDelivered = () => {
    if (selectedRequestId) {
      onUpdateAmbulanceStatus(selectedRequestId, 'completed', {
        handoverDetails: { ...handover, deliveredAt: new Date() }
      });
      setDeliveredDialogOpen(false);
      setSelectedRequestId(null);
    }
  };
  const getAlertStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'responding':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'false_alarm':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReportStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'submitted':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'investigated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dismissed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'sos':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medical_emergency':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'accident':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'fire':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'natural_disaster':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'security_threat':
        return <AlertTriangle className="h-4 w-4 text-purple-600" />;
      case 'panic':
        return <AlertTriangle className="h-4 w-4 text-pink-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getAvailableActions = (item: any, type: string) => {
    const actions = [];

    if (type === 'alert') {
      if (userRole !== 'patient') {
        if (item.status === 'active') {
          actions.push({ label: 'Acknowledge', action: () => onAcknowledgeAlert(item.id) });
        }
        if (['active', 'acknowledged', 'responding'].includes(item.status)) {
          actions.push({ label: 'Resolve', action: () => onResolveAlert(item.id) });
        }
      } else {
        // Patients can cancel their own active alerts
        if (['active', 'acknowledged', 'responding'].includes(item.status)) {
          actions.push({ label: 'Cancel Alert', action: () => onResolveAlert(item.id) }); // Mapping cancel to resolve logic as it closes the alert
        }
      }
    } else if (type === 'ambulance') {
      if (userRole !== 'patient') {
        if (item.status === 'pending') {
          actions.push({ label: 'Accept & Dispatch', action: () => openDispatchDialog(item.id) });
        }
        if (['dispatched', 'en_route', 'on_scene', 'transporting'].includes(item.status)) {
          actions.push({
            label: 'Direct Consultation (Call Doctor)',
            action: () => {
              // This would open the ClinicalRequestModal pre-populated
              window.dispatchEvent(new CustomEvent('open-clinical-request', {
                detail: {
                  patientId: item.patientId,
                  category: 'call',
                  notes: `Emergency Ambulance Consultation for ${item.patientName}. Condition: ${item.medicalCondition}`
                }
              }));
            }
          });
        }
        if (item.status === 'dispatched') {
          actions.push({ label: 'En Route', action: () => onUpdateAmbulanceStatus(item.id, 'en_route') });
        }
        if (item.status === 'en_route') {
          actions.push({
            label: 'Seen (On Scene)', action: () => {
              setSelectedRequestId(item.id);
              setSeenDialogOpen(true);
            }
          });
        }
        if (item.status === 'on_scene') {
          actions.push({ label: 'Start Transport', action: () => onUpdateAmbulanceStatus(item.id, 'transporting') });
        }
        if (item.status === 'transporting') {
          actions.push({
            label: 'Delivered (Handover)', action: () => {
              setSelectedRequestId(item.id);
              setDeliveredDialogOpen(true);
            }
          });
        }
        if (['dispatched', 'en_route', 'transporting'].includes(item.status)) {
          actions.push({ label: 'Live Track', action: () => openLiveTracking(item.id) });
        }
        if (['dispatched', 'en_route', 'transporting'].includes(item.status)) {
          actions.push({ label: 'Live Track', action: () => openLiveTracking(item.id) });
        }
        if (['pending', 'dispatched'].includes(item.status)) {
          actions.push({ label: 'Cancel Request', action: () => onCancelAmbulance(item.id) });
        }
      }
    } else if (type === 'report') {
      if (['admin', 'public_health'].includes(userRole)) {
        if (item.status === 'submitted') {
          actions.push({ label: 'Review', action: () => onReviewReport(item.id) });
        }
        if (item.status === 'under_review') {
          actions.push({ label: 'Verify', action: () => onVerifyReport(item.id) });
        }
      }
    }

    return actions;
  };

  const renderAlertCard = (alert: EmergencyAlert) => {
    const actions = getAvailableActions(alert, 'alert');
    const borderColor = alert.status === 'active' ? 'border-l-red-500' :
      alert.status === 'acknowledged' ? 'border-l-yellow-500' :
        'border-l-gray-300';

    return (
      <div key={alert.id} className={`bg-gray-50 rounded-lg border-l-4 ${borderColor} p-4 hover:shadow-md transition-all duration-200`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {getAlertTypeIcon(alert.type)}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {alert.type.replace('_', ' ').toUpperCase()} Alert - {alert.alertNumber}
                </h3>
                <p className="text-sm text-gray-600">{alert.description || 'Emergency alert triggered'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{alert.address || 'GPS Coordinates'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{alert.contactNumber}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={`${getAlertStatusColor(alert.status)} text-xs px-2 py-1`}>
                  {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                </Badge>
                <span className="text-xs text-gray-500">{formatTimeAgo(alert.createdAt.toString())}</span>
              </div>

              {actions.length > 0 && (
                <div className="flex items-center gap-2">
                  {actions.slice(0, 2).map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {action.label}
                    </Button>
                  ))}

                  {actions.length > 2 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.slice(2).map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={action.action}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAmbulanceCard = (request: AmbulanceRequest) => {
    const actions = getAvailableActions(request, 'ambulance');
    const borderColor = request.priority === 'critical' ? 'border-l-red-500' :
      request.priority === 'high' ? 'border-l-orange-500' :
        request.priority === 'medium' ? 'border-l-yellow-500' :
          'border-l-green-500';

    return (
      <div key={request.id} className={`bg-gray-50 rounded-lg border-l-4 ${borderColor} p-4 hover:shadow-md transition-all duration-200`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="h-4 w-4 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {request.requestNumber}
                </h3>
                <p className="text-sm text-gray-600">{request.medicalCondition}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{request.patientName} ({request.patientAge} years old, {request.patientGender})</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{request.pickupAddress}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={`${getPriorityColor(request.priority)} text-xs px-2 py-1`}>
                  {request.priority.toUpperCase()}
                </Badge>
                <Badge className={`${getAlertStatusColor(request.status as any)} text-xs px-2 py-1`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {request.teamPersonnel && request.teamPersonnel.length > 0 && (
                  <Badge variant={request.teamPersonnel.some(p => p.role === 'Doctor' || p.role === 'Nurse') ? 'default' : 'secondary'} className="text-[9px] px-2 py-0.5 uppercase font-black">
                    {request.teamPersonnel.some(p => p.role === 'Doctor' || p.role === 'Nurse') ? 'Clinical Access: Active' : 'Clinical Access: Restricted'}
                  </Badge>
                )}
                <span className="text-xs text-gray-500">{formatTimeAgo(request.createdAt.toString())}</span>
              </div>

              {request.teamPersonnel && request.teamPersonnel.length > 0 && (
                <div className="mt-3 p-2 bg-blue-50/50 rounded-md border border-blue-100/50">
                  <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-1">Assigned Team ({request.teamPersonnel.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {request.teamPersonnel.map((member, i) => (
                      <div key={i} className="text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 flex items-center gap-1">
                        <User className="h-3 w-3 text-blue-500" />
                        <span className="font-medium">{member.role}</span>
                        <span>: {member.name || member.appId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {actions.length > 0 && (
                <div className="flex items-center gap-2">
                  {actions.slice(0, 2).map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {action.label}
                    </Button>
                  ))}

                  {actions.length > 2 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.slice(2).map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={action.action}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPersonnelDialog = () => (
    <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
      <DialogContent className="w-[94vw] max-w-[94vw] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dispatch Team Details</DialogTitle>
          <DialogDescription>
            Specify the personnel coming with the ambulance for this emergency call.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {teamMembers.map((member, index) => (
            <div key={index} className="space-y-3 p-3 border rounded-lg bg-gray-50 relative">
              {teamMembers.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500"
                  onClick={() => removeTeamMember(index)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Role/Field</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                    value={member.role}
                    onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                  >
                    <option value="Driver">Driver</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Health Care Assistant">Health Care Assistant</option>
                    <option value="Paramedic">Paramedic</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">App ID (Optional)</Label>
                  <Input
                    placeholder="ID Number"
                    value={member.appId}
                    onChange={(e) => updateTeamMember(index, 'appId', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                {staffMembers.length > 0 ? (
                  <Select
                    value={member.name}
                    onValueChange={(val) => updateTeamMember(index, 'name', val)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select Staff Member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((s) => {
                        const name = s.user?.profile?.displayName ||
                          `${s.user?.profile?.firstName || ''} ${s.user?.profile?.lastName || ''}`.trim() ||
                          s.user?.email || 'Unknown';
                        return (
                          <SelectItem key={s.id} value={name}>
                            {name} ({s.role})
                          </SelectItem>
                        );
                      })}
                      <SelectItem value="Other">Custom Name...</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Personnel Name"
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                  />
                )}
                {member.name === 'Other' && (
                  <Input
                    className="mt-2"
                    placeholder="Enter Custom Name"
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="space-y-2 py-2 border-t border-b border-gray-100">
            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Quick Add Team Members</Label>
            <div className="flex flex-wrap gap-1.5">
              {commonRoles.map(role => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-7 px-2 border-dashed hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setTeamMembers([...teamMembers, { name: '', role, appId: '' }])}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {role}
                </Button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={addTeamMember}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Personnel
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDispatch}>Confirm Dispatch</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderSeenDialog = () => (
    <Dialog open={seenDialogOpen} onOpenChange={setSeenDialogOpen}>
      <DialogContent className="w-[94vw] max-w-[94vw] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Patient Encountered</DialogTitle>
          <DialogDescription>
            Register the time of meeting and the patient's current condition.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Patient Condition</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Stable', 'Serious', 'Critical', 'Dead', 'Unconscious'].map((cond) => (
                <Button
                  key={cond}
                  variant={patientCondition === cond ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPatientCondition(cond)}
                  className="w-full"
                >
                  {cond}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSeenDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSeen} className="bg-purple-600 hover:bg-purple-700 text-white">
            Confirm Seen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderDeliveredDialog = () => (
    <Dialog open={deliveredDialogOpen} onOpenChange={setDeliveredDialogOpen}>
      <DialogContent className="w-[94vw] max-w-[94vw] sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Patient Delivery / Handover</DialogTitle>
          <DialogDescription>
            Enter details of the receiving facility and personnel to complete the journey.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label>Facility Name (Hospital/Morgue)</Label>
            <Input
              placeholder="e.g. City General Hospital"
              value={handover.facilityName}
              onChange={(e) => setHandover({ ...handover, facilityName: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Receiver's Full Name</Label>
            <Input
              placeholder="Doctor, Nurse, or Mortician"
              value={handover.receiverName}
              onChange={(e) => setHandover({ ...handover, receiverName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Receiver's Phone</Label>
              <Input
                placeholder="Phone Number"
                value={handover.receiverPhone}
                onChange={(e) => setHandover({ ...handover, receiverPhone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Receiver's Email</Label>
              <Input
                placeholder="Optional Email"
                value={handover.receiverEmail}
                onChange={(e) => setHandover({ ...handover, receiverEmail: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeliveredDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelivered} className="bg-green-600 hover:bg-green-700 text-white">
            Confirm Delivery
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderReportCard = (report: ViralReport) => {
    const actions = getAvailableActions(report, 'report');
    const borderColor = report.status === 'submitted' ? 'border-l-gray-500' :
      report.status === 'under_review' ? 'border-l-yellow-500' :
        report.status === 'verified' ? 'border-l-green-500' :
          'border-l-blue-500';

    return (
      <div key={report.id} className={`bg-gray-50 rounded-lg border-l-4 ${borderColor} p-4 hover:shadow-md transition-all duration-200`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-4 w-4 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {report.reportNumber}
                </h3>
                <p className="text-sm text-gray-600">{report.diseaseType}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{report.affectedCount} affected • {report.symptoms.length} symptoms</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{report.locationAddress || 'Location not specified'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={`${getReportStatusColor(report.status)} text-xs px-2 py-1`}>
                  {report.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-500">{formatTimeAgo(report.createdAt.toString())}</span>
              </div>

              {actions.length > 0 && (
                <div className="flex items-center gap-2">
                  {actions.slice(0, 2).map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {action.label}
                    </Button>
                  ))}

                  {actions.length > 2 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.slice(2).map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={action.action}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Emergency List</h3>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-32 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Emergency List</h3>
        </div>
        <div className="text-center py-8">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'alerts':
        return alerts;
      case 'ambulances':
        return ambulanceRequests;
      case 'reports':
        return viralReports;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  if (currentData.length === 0) {
    const emptyIcons = {
      alerts: AlertTriangle,
      ambulances: Truck,
      reports: Shield
    };
    const EmptyIcon = emptyIcons[activeTab];

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTab === 'alerts' && 'Active Alerts'}
            {activeTab === 'ambulances' && 'Ambulance Requests'}
            {activeTab === 'reports' && 'Viral Reports'}
          </h3>
        </div>
        <div className="text-center py-8">
          <EmptyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No {activeTab} found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {activeTab === 'alerts' && `Active Alerts (${alerts.length})`}
          {activeTab === 'ambulances' && `Ambulance Requests (${ambulanceRequests.length})`}
          {activeTab === 'reports' && `Viral Reports (${viralReports.length})`}
        </h3>
        <p className="text-sm text-gray-600">
          Showing {currentData.length} items
        </p>
      </div>

      <div className="space-y-4">
        {activeTab === 'alerts' && alerts.map(renderAlertCard)}
        {activeTab === 'ambulances' && ambulanceRequests.map(renderAmbulanceCard)}
        {activeTab === 'reports' && viralReports.map(renderReportCard)}
      </div>

      <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
        <DialogContent className="w-[94vw] max-w-[94vw] sm:max-w-[800px] p-0 overflow-hidden bg-black border-gray-800">
          {(() => {
            const request = ambulanceRequests.find(r => r.id === trackingId);
            const ambulance = request?.ambulance;
            return (
              <div className="relative h-[600px] w-full flex flex-col">
                <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg animate-pulse">
                      <Navigation className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Live Asset Tracking</h3>
                      <p className="text-[10px] text-gray-500 font-mono">ID: {request?.requestNumber || trackingId}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-2 py-0.5 animate-pulse">LIVE SIGNAL</Badge>
                </div>

                <div className="flex-1 bg-gray-950 relative overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${ambulance?.currentLongitude || request?.pickupLongitude || 0}!3d${ambulance?.currentLatitude || request?.pickupLatitude || 0}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1234567890`}
                    className="w-full h-full border-0 grayscale invert opacity-60"
                    allowFullScreen
                  ></iframe>

                  {/* Data Overlays */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className="bg-black/80 backdrop-blur-md border border-gray-800 p-3 rounded-xl w-56 shadow-2xl">
                      <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Details</p>
                        <Badge variant="outline" className="text-[8px] font-black">{ambulance?.type || 'Assigned'}</Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-500 uppercase tracking-tighter">Unit:</span>
                          <span className="text-white font-mono">{ambulance?.vehicleNumber || 'PENDING'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-500 uppercase tracking-tighter">Plate:</span>
                          <span className="text-white font-mono">{ambulance?.licensePlate || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-500 uppercase tracking-tighter">Status:</span>
                          <span className="text-blue-400 font-mono uppercase italic">{request?.status.replace('_', ' ') || 'ACTIVE'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/80 backdrop-blur-md border border-gray-800 p-3 rounded-xl w-56 shadow-2xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Telemetry Data</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-500 uppercase tracking-tighter">G-Speed:</span>
                          <span className="text-white font-mono">{request?.status === 'en_route' ? '54.2 KM/H' : '0.0 KM/H'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-500 uppercase tracking-tighter">Lat:</span>
                          <span className="text-green-400 font-mono">{(ambulance?.currentLatitude || 0).toFixed(6)}°</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-500 uppercase tracking-tighter">Lng:</span>
                          <span className="text-green-400 font-mono">{(ambulance?.currentLongitude || 0).toFixed(6)}°</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-900 border-t border-gray-800">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      SECURE SAT-COM ESTABLISHED
                    </div>
                    <div>UTC REF: {new Date().toISOString().split('T')[1].split('.')[0]}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {renderPersonnelDialog()}
      {renderSeenDialog()}
      {renderDeliveredDialog()}

      {/* Pagination */}
      {
        pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      }
    </div>
  );
};
