import React, { useState, useEffect, useCallback } from "react";
import { Referral, ReferralStatusHistory, ReferralDocument, ReferralStatus, referralService } from "@/services/referralService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ReferralTimeline } from "./ReferralTimeline";
import { ReferralDocuments } from "./ReferralDocuments";

interface ReferralDetailsProps {
  referralId: string;
  onBack?: () => void;
  className?: string;
}

export const ReferralDetails: React.FC<ReferralDetailsProps> = ({
  referralId,
  onBack,
  className,
}) => {
  const { profile } = useAuth();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [statusHistory, setStatusHistory] = useState<ReferralStatusHistory[]>([]);
  const [documents, setDocuments] = useState<ReferralDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ReferralStatus>(ReferralStatus.PENDING);
  const [statusNote, setStatusNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchReferralData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch referral details
      const { data: referralData, error: referralError } = await referralService.getReferralById(referralId);

      if (referralError) {
        throw referralError;
      }

      setReferral(referralData || null);

      // Fetch status history
      const { data: historyData, error: historyError } = await referralService.getReferralStatusHistory(referralId);

      if (historyError) {
        throw historyError;
      }

      setStatusHistory(historyData || []);

      // Fetch documents
      const { data: documentsData, error: documentsError } = await referralService.getReferralDocuments(referralId);

      if (documentsError) {
        throw documentsError;
      }

      setDocuments(documentsData || []);
    } catch (err) {
      console.error("Error fetching referral data:", err);
      setError("Failed to load referral data");
    } finally {
      setIsLoading(false);
    }
  }, [referralId]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const handleStatusUpdate = async () => {
    if (!referral) return;

    setIsUpdating(true);

    try {
      const { error } = await referralService.updateReferralStatus({
        referralId: referral.id,
        status: newStatus,
        notes: statusNote,
        completedDate: newStatus === "completed" ? new Date().toISOString() : undefined,
      });

      if (error) {
        throw error;
      }

      toast.success(`Referral status updated to ${newStatus}`);
      setIsUpdateDialogOpen(false);
      setStatusNote("");
      
      // Refresh data
      fetchReferralData();
    } catch (err) {
      console.error("Error updating referral status:", err);
      toast.error("Failed to update referral status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDocumentUploaded = () => {
    fetchReferralData();
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

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return String(dateString);
    }
  };

  const canUpdateStatus = () => {
    if (!referral || !profile) return false;

    // Check if user belongs to either the sending or receiving center
    // In a real implementation, you would check if the user is associated with either center
    return true;
  };

  const getNextPossibleStatuses = () => {
    if (!referral) return [];

    switch (referral.status) {
      case ReferralStatus.PENDING:
        return [ReferralStatus.ACCEPTED, ReferralStatus.REJECTED];
      case ReferralStatus.ACCEPTED:
        return [ReferralStatus.IN_PROGRESS, ReferralStatus.REJECTED, ReferralStatus.CANCELLED];
      case ReferralStatus.IN_PROGRESS:
        return [ReferralStatus.COMPLETED, ReferralStatus.CANCELLED];
      case ReferralStatus.COMPLETED:
        return [];
      case ReferralStatus.REJECTED:
        return [];
      case ReferralStatus.CANCELLED:
        return [];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="py-10 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive">{error || "Referral not found"}</p>
            {onBack && (
              <Button variant="outline" onClick={onBack} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <h2 className="text-2xl font-bold">Referral Details</h2>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(referral.status)}
          {canUpdateStatus() && getNextPossibleStatuses().length > 0 && (
            <Button onClick={() => setIsUpdateDialogOpen(true)}>
              Update Status
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Information</CardTitle>
              <CardDescription>
                Details about this referral
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Referral ID</p>
                  <p>{referral.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Created Date</p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(referral.createdAt || referral.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">From Center</p>
                  <p className="flex items-center">
                    <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                    {referral.referringCenterId || referral.from_center_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">To Center</p>
                  <p className="flex items-center">
                    <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                    {referral.receivingCenterId || referral.to_center_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Patient</p>
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    {referral.patientId || referral.patient_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Priority</p>
                  <p>
                    {referral.priority ? (
                      <Badge variant={referral.priority === "urgent" ? "destructive" : "outline"}>
                        {referral.priority.charAt(0).toUpperCase() + referral.priority.slice(1)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Normal</Badge>
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Reason for Referral</p>
                <p className="p-3 bg-muted rounded-md">{referral.reason}</p>
              </div>

              {(referral.clinicalNotes || referral.notes) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</p>
                  <p className="p-3 bg-muted rounded-md">{referral.clinicalNotes || referral.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <ReferralDocuments
            referralId={referral.id}
            documents={documents}
            onDocumentUploaded={handleDocumentUploaded}
            readOnly={!canUpdateStatus()}
          />
        </div>

        <div className="space-y-6">
          <ReferralTimeline statusHistory={statusHistory} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Current Status</p>
                <div className="flex items-center">
                  {getStatusBadge(referral.status)}
                  <span className="ml-2">
                    {formatDate(referral.updatedAt || referral.updated_at)}
                  </span>
                </div>
              </div>
              
              {(referral.scheduledDate || referral.expected_completion_date) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Expected Completion</p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(referral.scheduledDate || referral.expected_completion_date)}
                  </p>
                </div>
              )}
              
              {(referral.respondedDate || referral.completed_date) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Completed Date</p>
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    {formatDate(referral.respondedDate || referral.completed_date)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Referral Status</DialogTitle>
            <DialogDescription>
              Change the status of this referral and add notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ReferralStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {getNextPossibleStatuses().map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Status Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note about this status change..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferralDetails; 