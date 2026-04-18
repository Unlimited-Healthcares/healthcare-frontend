import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { referralService, ReferralStatus, ReferralStatusHistory, ReferralWithDetails } from "@/services/referralService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  AlertTriangle,
  ChevronLeft,
  Package,
  User,
  Users,
  Briefcase,
  Stethoscope,
  HelpCircle,
} from "lucide-react";
import { ReferralTimeline } from "./ReferralTimeline";

interface FacilityReferralDetailsProps {
  referralId: string;
  onBack: () => void;
}

interface FacilityResource {
  id?: string;
  resourceType: string;
  resourceId?: string;
  details?: {
    description?: string;
    quantity?: string | number;
    [key: string]: unknown;
  };
}

// Resource type icons mapping
const resourceTypeIcons = {
  equipment_transfer: Package,
  staff_transfer: User,
  capacity_sharing: Users,
  specialized_service: Briefcase,
  emergency_support: HelpCircle, // Changed from Ambulance to HelpCircle
  consultation: Stethoscope,
};

export const FacilityReferralDetails: React.FC<FacilityReferralDetailsProps> = ({
  referralId,
  onBack
}) => {
  const { profile } = useAuth();
  
  const [referral, setReferral] = useState<ReferralWithDetails | null>(null);
  const [resources, setResources] = useState<FacilityResource[]>([]);
  const [statusHistory, setStatusHistory] = useState<ReferralStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<ReferralStatus>(ReferralStatus.PENDING);
  const [statusNote, setStatusNote] = useState("");
  const [isSendingUpdate, setIsSendingUpdate] = useState(false);
  
  const fetchReferralDetails = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get referral details
      const { data: referralData, error: referralError } = await referralService.getReferralById(referralId);
      
      if (referralError) throw referralError;
      
      if (referralData) {
        // Convert Referral to ReferralWithDetails by adding statusHistory
        const referralWithDetails: ReferralWithDetails = {
          ...referralData,
          statusHistory: []
        };
        setReferral(referralWithDetails);
        setNewStatus(referralData.status as ReferralStatus);
        
        // Get resources for this referral
        const { data: resourcesData, error: resourcesError } = await referralService.getFacilityResources(referralId);
        
        if (resourcesError) throw resourcesError;
        
        setResources(resourcesData || []);
        
        // Get status history
        const { data: historyData, error: historyError } = await referralService.getReferralStatusHistory(referralId);
        
        if (historyError) throw historyError;
        
        setStatusHistory(historyData || []);
      }
    } catch (err) {
      console.error("Error fetching referral details:", err);
      toast.error("Failed to load referral details");
    } finally {
      setIsLoading(false);
    }
  }, [referralId]);
  
  useEffect(() => {
    fetchReferralDetails();
  }, [fetchReferralDetails]);
  
  const handleUpdateStatus = async () => {
    if (!statusNote.trim()) {
      toast.error("Please provide notes for the status update");
      return;
    }
    
    setIsSendingUpdate(true);
    
    try {
      const { error } = await referralService.updateReferralStatus({
        referralId,
        status: newStatus,
        notes: statusNote
      });
      
      if (error) throw error;
      
      toast.success(`Referral status updated to ${newStatus}`);
      setStatusNote("");
      fetchReferralDetails();
    } catch (err) {
      console.error("Error updating referral status:", err);
      toast.error("Failed to update referral status");
    } finally {
      setIsSendingUpdate(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case ReferralStatus.PENDING:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case ReferralStatus.ACCEPTED:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Accepted</Badge>;
      case ReferralStatus.IN_PROGRESS:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case ReferralStatus.COMPLETED:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case ReferralStatus.REJECTED:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case ReferralStatus.CANCELLED:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Low</Badge>;
      case "normal":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Normal</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, "MMMM d, yyyy");
    } catch (e) {
      return String(dateString);
    }
  };
  
  // Get the resource icon based on resource type
  const getResourceIcon = (resourceType: string) => {
    const IconComponent = resourceTypeIcons[resourceType as keyof typeof resourceTypeIcons] || HelpCircle;
    return <IconComponent className="h-5 w-5" />;
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!referral) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium">Referral Not Found</h3>
            <p className="text-muted-foreground mt-2">The requested referral could not be found.</p>
            <Button className="mt-4" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Referrals
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const isSender = profile?.center_id === (referral.referringCenterId || referral.from_center_id);
  const isReceiver = profile?.center_id === (referral.receivingCenterId || referral.to_center_id);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Referrals
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Facility Referral Details</CardTitle>
              <CardDescription>
                Reference ID: {referral.id.split("-")[0]}...
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(referral.status)}
              {getPriorityBadge(referral.priority || "normal")}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">From</h3>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{referral.referringProvider?.name || 'Unknown Center'}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">To</h3>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{referral.receivingProvider?.name || 'Unknown Center'}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Reason</h3>
                <p>{referral.reason}</p>
              </div>
              
              {(referral.clinicalNotes || referral.notes) && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Notes</h3>
                  <p>{referral.clinicalNotes || referral.notes}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Created</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatDate(referral.createdAt || referral.created_at)}</span>
                </div>
              </div>
              
              {(referral.scheduledDate || referral.scheduled_date) && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Scheduled Date</h3>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(referral.scheduledDate || referral.scheduled_date)}</span>
                  </div>
                </div>
              )}
              
              {(referral.scheduledDate || referral.expected_completion_date) && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Expected Completion</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(referral.scheduledDate || referral.expected_completion_date)}</span>
                  </div>
                </div>
              )}
              
              {(referral.respondedDate || referral.completed_date) && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Completed On</h3>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                    <span>{formatDate(referral.respondedDate || referral.completed_date)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            
            {resources.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No resources specified for this referral.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {resources.map((resource, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-center mb-2">
                      {getResourceIcon(resource.resourceType)}
                      <span className="font-medium ml-2">
                        {resource.resourceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    {resource.details && (
                      <div className="mt-2 space-y-2">
                        {resource.details?.description && (
                          <p className="text-sm">{String(resource.details.description)}</p>
                        )}
                        
                        {resource.details?.quantity && (
                          <div className="flex items-center text-sm">
                            <span className="text-muted-foreground mr-2">Quantity/Duration:</span>
                            <span>{String(resource.details.quantity)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="font-medium mb-4">Timeline</h3>
            <ReferralTimeline statusHistory={statusHistory} />
          </div>
        </CardContent>
        
        <CardFooter className="flex-col items-stretch">
          <Separator className="mb-6" />
          
          <div className="space-y-4">
            <h3 className="font-medium">Update Status</h3>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <Select 
                  value={newStatus} 
                  onValueChange={(value) => setNewStatus(value as ReferralStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(isSender && [ReferralStatus.PENDING, ReferralStatus.CANCELLED].includes(referral.status)) && (
                      <>
                        <SelectItem value={ReferralStatus.CANCELLED}>Cancel</SelectItem>
                      </>
                    )}
                    
                    {(isReceiver && referral.status === ReferralStatus.PENDING) && (
                      <>
                        <SelectItem value={ReferralStatus.ACCEPTED}>Accept</SelectItem>
                        <SelectItem value={ReferralStatus.REJECTED}>Reject</SelectItem>
                      </>
                    )}
                    
                    {(isReceiver && referral.status === ReferralStatus.ACCEPTED) && (
                      <>
                        <SelectItem value={ReferralStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={ReferralStatus.COMPLETED}>Complete</SelectItem>
                      </>
                    )}
                    
                    {(isReceiver && referral.status === ReferralStatus.IN_PROGRESS) && (
                      <>
                        <SelectItem value={ReferralStatus.COMPLETED}>Complete</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Textarea
                  placeholder="Add notes about this status change"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
              
              <div className="col-span-1">
                <Button 
                  className="w-full" 
                  onClick={handleUpdateStatus}
                  disabled={isSendingUpdate || referral.status === newStatus}
                >
                  {isSendingUpdate ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}; 