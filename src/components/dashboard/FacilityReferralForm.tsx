import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { referralService, ReferralPriority, FacilityResource } from "@/services/referralService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HealthcareCenter {
  id: string;
  name: string;
  type?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface FacilityReferralFormProps {
  open: boolean;
  onClose: () => void;
  selectedCenter: HealthcareCenter | null;
  onSuccess: () => void;
}

const resourceTypes = [
  { value: "equipment_transfer", label: "Equipment Transfer" },
  { value: "staff_transfer", label: "Staff Transfer" },
  { value: "capacity_sharing", label: "Capacity Sharing" },
  { value: "specialized_service", label: "Specialized Service" },
  { value: "emergency_support", label: "Emergency Support" },
  { value: "consultation", label: "Consultation" },
];

export const FacilityReferralForm: React.FC<FacilityReferralFormProps> = ({
  open,
  onClose,
  selectedCenter,
  onSuccess,
}) => {
  const { profile } = useAuth();
  
  const [referralReason, setReferralReason] = useState("");
  const [referralNotes, setReferralNotes] = useState("");
  const [referralPriority, setReferralPriority] = useState<ReferralPriority>(ReferralPriority.NORMAL);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState<Date | undefined>(undefined);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<FacilityResource[]>([]);
  
  const handleAddResource = () => {
    setResources([...resources, { resourceType: "equipment_transfer", details: {} } as FacilityResource]);
  };
  
  const handleRemoveResource = (index: number) => {
    const newResources = [...resources];
    newResources.splice(index, 1);
    setResources(newResources);
  };
  
  const handleResourceTypeChange = (value: string, index: number) => {
    const newResources = [...resources];
    newResources[index] = { ...newResources[index], resourceType: value };
    setResources(newResources);
  };
  
  const handleResourceDetailsChange = (value: string, index: number, field: string) => {
    const newResources = [...resources];
    newResources[index] = {
      ...newResources[index],
      details: { 
        ...newResources[index].details, 
        [field]: value 
      }
    };
    setResources(newResources);
  };
  
  const resetForm = () => {
    setReferralReason("");
    setReferralNotes("");
    setReferralPriority(ReferralPriority.NORMAL);
    setExpectedCompletionDate(undefined);
    setScheduledDate(undefined);
    setResources([]);
  };
  
  const handleSubmit = async () => {
    if (!referralReason.trim()) {
      toast.error("Please provide a reason for the facility referral");
      return;
    }
    
    if (!profile?.center_id) {
      toast.error("You must be associated with a healthcare center to create referrals");
      return;
    }
    
    if (!selectedCenter) {
      toast.error("Please select a healthcare center");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await referralService.createFacilityReferral({
        patientId: "facility-referral", // Placeholder for facility referrals
        referringCenterId: profile.center_id as string,
        receivingCenterId: selectedCenter.id,
        reason: referralReason,
        clinicalNotes: referralNotes,
        priority: referralPriority,
        scheduledDate: scheduledDate,
        expirationDate: expectedCompletionDate,
        referralType: "transfer" as any, // Use transfer type for facility referrals
        metadata: {
          isFacilityReferral: true,
          facilityResources: resources
        }
      });

      if (error) {
        throw error;
      }

      toast.success(`Facility referral created successfully to ${selectedCenter.name}`);
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating facility referral:", err);
      toast.error("Failed to create facility referral");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Facility Referral</DialogTitle>
          <DialogDescription>
            Create a facility-to-facility referral to {selectedCenter?.name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="referralReason" className="text-right font-medium">
              Reason*
            </label>
            <Textarea
              id="referralReason"
              className="col-span-3"
              value={referralReason}
              onChange={(e) => setReferralReason(e.target.value)}
              rows={2}
              placeholder="Enter the reason for this facility referral"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="referralNotes" className="text-right font-medium">
              Additional Notes
            </label>
            <Textarea
              id="referralNotes"
              className="col-span-3"
              value={referralNotes}
              onChange={(e) => setReferralNotes(e.target.value)}
              rows={3}
              placeholder="Add any additional notes or context for this referral"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="priority" className="text-right font-medium">
              Priority
            </label>
            <Select 
              value={referralPriority} 
              onValueChange={(value) => setReferralPriority(value as ReferralPriority)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReferralPriority.LOW}>Low</SelectItem>
                <SelectItem value={ReferralPriority.NORMAL}>Normal</SelectItem>
                <SelectItem value={ReferralPriority.HIGH}>High</SelectItem>
                <SelectItem value={ReferralPriority.URGENT}>Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right font-medium">Expected Completion</label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expectedCompletionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedCompletionDate ? (
                      format(expectedCompletionDate, "PPP")
                    ) : (
                      <span>Expected completion date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expectedCompletionDate}
                    onSelect={setExpectedCompletionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right font-medium">Scheduled Date</label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? (
                      format(scheduledDate, "PPP")
                    ) : (
                      <span>Select a scheduled date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Resources</h3>
              <Button variant="outline" size="sm" onClick={handleAddResource}>
                <Plus className="h-4 w-4 mr-1" /> Add Resource
              </Button>
            </div>
            
            {resources.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No resources added. Add resources that will be shared or transferred.
              </p>
            )}
            
            {resources.map((resource, index) => (
              <div key={index} className="border rounded-md p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Resource {index + 1}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveResource(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Type</label>
                    <Select 
                      value={resource.resourceType} 
                      onValueChange={(value) => handleResourceTypeChange(value, index)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Description</label>
                    <Textarea
                      className="col-span-3"
                      rows={2}
                      value={String(resource.details?.description || "")}
                      onChange={(e) => handleResourceDetailsChange(e.target.value, index, "description")}
                      placeholder="Describe this resource"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Quantity/Duration</label>
                    <Input
                      className="col-span-3"
                      value={String(resource.details?.quantity || "")}
                      onChange={(e) => handleResourceDetailsChange(e.target.value, index, "quantity")}
                      placeholder="Enter quantity or duration"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Facility Referral"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 