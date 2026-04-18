import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  ExternalLink,
  MapPin,
  Loader2,
  AlertCircle,
  FileText,
  Building
} from "lucide-react";
import { toast } from "sonner";


import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { referralService, Referral, ReferralPriority } from "@/services/referralService";
import { format } from "date-fns";
import { ReferralDetails } from "./ReferralDetails";
import { ReferralAnalytics } from "./ReferralAnalytics";
import { FacilityReferralForm } from "./FacilityReferralForm";
import { FacilityReferralDetails } from "./FacilityReferralDetails";

interface ReferralSystemProps {
  centerId: string;
}

interface SearchResult {
  id: string;
  name: string;
  type: string;
  distance: string;
  image: string;
  address: string;
  rating: number;
}

const centerTypes = [
  { value: "hospital", label: "Hospital" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "diagnostics", label: "Diagnostic Center" },
  { value: "cardiology", label: "Cardiology Center" },
  { value: "ophthalmology", label: "Eye Care" },
  { value: "dental", label: "Dental Clinic" },
  { value: "physio", label: "Physiotherapy" },
];

export const ReferralSystem: React.FC<ReferralSystemProps> = ({ centerId }) => {

  const [searchId, setSearchId] = useState("");
  const [centerType, setCenterType] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<SearchResult | null>(null);
  const [isReferDialogOpen, setIsReferDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [referralReason, setReferralReason] = useState("");
  const [patientConsent, setPatientConsent] = useState(false);
  const [transferMedicalRecords, setTransferMedicalRecords] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("find");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
  const [referralPriority, setReferralPriority] = useState<ReferralPriority>(ReferralPriority.NORMAL);
  const [referralNotes, setReferralNotes] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");

  // Facility referral states
  const [isFacilityReferDialogOpen, setIsFacilityReferDialogOpen] = useState(false);
  const [facilityReferrals, setFacilityReferrals] = useState<Referral[]>([]);
  const [isLoadingFacilityReferrals, setIsLoadingFacilityReferrals] = useState(false);
  const [selectedFacilityReferralId, setSelectedFacilityReferralId] = useState<string | null>(null);

  // Mock data for development
  const mockPatients = [
    { id: "PT-001", name: "John Smith", age: 45, gender: "Male" },
    { id: "PT-002", name: "Sarah Johnson", age: 32, gender: "Female" },
    { id: "PT-003", name: "Michael Williams", age: 58, gender: "Male" },
    { id: "PT-004", name: "Emma Brown", age: 27, gender: "Female" },
  ];

  const mockMedicalRecords = [
    { id: "REC-001", patientId: "PT-001", type: "Diagnostic", title: "Blood Test Results", date: "2023-05-01" },
    { id: "REC-002", patientId: "PT-001", type: "Radiology", title: "Chest X-Ray", date: "2023-04-15" },
    { id: "REC-003", patientId: "PT-002", type: "Progress Note", title: "Follow-up Visit", date: "2023-05-10" },
    { id: "REC-004", patientId: "PT-003", type: "Surgical", title: "Appendectomy Report", date: "2023-03-22" },
  ];

  const fetchReferrals = useCallback(async () => {
    if (!centerId) return;

    setIsLoadingReferrals(true);

    try {
      const { data, error } = await referralService.getReferralsForCenter(centerId);

      if (error) {
        throw error;
      }

      setReferrals(data || []);
    } catch (err) {
      console.error("Error fetching referrals:", err);
      toast.error("Failed to load referrals");
    } finally {
      setIsLoadingReferrals(false);
    }
  }, [centerId]);

  const fetchFacilityReferrals = useCallback(async () => {
    if (!centerId) return;

    setIsLoadingFacilityReferrals(true);

    try {
      const { data, error } = await referralService.getFacilityReferralsForCenter(centerId);

      if (error) {
        throw error;
      }

      setFacilityReferrals(data || []);
    } catch (err) {
      console.error("Error fetching facility referrals:", err);
      toast.error("Failed to load facility referrals");
    } finally {
      setIsLoadingFacilityReferrals(false);
    }
  }, [centerId]);

  useEffect(() => {
    if (activeTab === "history" && centerId) {
      fetchReferrals();
    } else if (activeTab === "facility" && centerId) {
      fetchFacilityReferrals();
    }
  }, [activeTab, centerId, fetchReferrals, fetchFacilityReferrals]);

  const handleSearch = () => {
    setIsLoading(true);

    // In a real app, this would be an API call to search centers
    setTimeout(() => {
      // Mock search results
      const mockCenters = [
        { id: "CTR-001", name: "City General Hospital", type: "hospital", distance: "2.5 km", image: "/images/centers/hospital.jpg", address: "123 Medical Ave, Downtown", rating: 4.7 },
        { id: "CTR-002", name: "MedExpress Pharmacy", type: "pharmacy", distance: "1.2 km", image: "/images/centers/pharmacy.jpg", address: "456 Health St, Eastside", rating: 4.3 },
        { id: "CTR-003", name: "Advanced Diagnostic Center", type: "diagnostics", distance: "3.7 km", image: "/images/centers/diagnostics.jpg", address: "789 Science Blvd, Westside", rating: 4.8 },
        { id: "CTR-004", name: "Heart & Vascular Institute", type: "cardiology", distance: "5.1 km", image: "/images/centers/cardiology.jpg", address: "101 Cardiac Way, Northside", rating: 4.9 },
        { id: "CTR-005", name: "Clear Vision Eye Clinic", type: "ophthalmology", distance: "4.3 km", image: "/images/centers/ophthalmology.jpg", address: "202 Sight Road, Southside", rating: 4.5 },
      ];

      if (searchId.trim()) {
        // Search by ID logic would go here
        const result = mockCenters.find(center => center.id === searchId.trim());
        setSearchResults(result ? [result] : []);
      } else if (centerType) {
        // Filter by center type
        const filtered = mockCenters.filter(center => center.type === centerType);
        setSearchResults(filtered);
      } else {
        setSearchResults(mockCenters);
      }

      setHasSearched(true);
      setIsLoading(false);
    }, 800);
  };

  const handleCenterSelect = (center: SearchResult) => {
    setSelectedCenter(center);
    setIsReferDialogOpen(true);
  };

  const getPatientMedicalRecords = (patientId: string) => {
    return mockMedicalRecords.filter(record => record.patientId === patientId);
  };

  const handleReferralSubmit = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    if (!referralReason.trim()) {
      toast.error("Please provide a reason for referral");
      return;
    }

    if (!patientConsent) {
      toast.error("Patient consent is required for referrals");
      return;
    }

    if (!centerId) {
      toast.error("You must be associated with a healthcare center to create referrals");
      return;
    }

    setIsLoading(true);

    if (!selectedCenter) {
      toast.error("Please select a healthcare center");
      return;
    }

    try {
      const { error } = await referralService.createReferral({
        patientId: selectedPatient,
        referringCenterId: centerId,
        receivingCenterId: selectedCenter.id,
        reason: referralReason,
        clinicalNotes: referralNotes,
        priority: referralPriority,
        scheduledDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
        referralType: "consultation" as any,
        metadata: {
          sharedRecordIds: transferMedicalRecords ? selectedRecords : [],
        }
      });

      if (error) {
        throw error;
      }

      toast.success(`Referral created successfully to ${selectedCenter.name}`);

      setIsReferDialogOpen(false);
      resetReferralForm();
      setActiveTab("history");
      fetchReferrals();
    } catch (err) {
      console.error("Error creating referral:", err);
      toast.error("Failed to create referral");
    } finally {
      setIsLoading(false);
    }
  };

  const resetReferralForm = () => {
    setSelectedPatient("");
    setReferralReason("");
    setReferralNotes("");
    setReferralPriority(ReferralPriority.NORMAL);
    setExpectedCompletionDate("");
    setPatientConsent(false);
    setTransferMedicalRecords(false);
    setSelectedRecords([]);
  };

  const getReferralStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Accepted</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleToggleRecord = (recordId: string) => {
    setSelectedRecords(current =>
      current.includes(recordId)
        ? current.filter(id => id !== recordId)
        : [...current, recordId]
    );
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, "MMM d, yyyy");
    } catch (e) {
      return String(dateString);
    }
  };

  const handleViewReferral = (referralId: string) => {
    setSelectedReferralId(referralId);
    setActiveTab("details");
  };

  const handleBackFromDetails = () => {
    setSelectedReferralId(null);
    setActiveTab("history");
  };

  const handleCreateFacilityReferral = () => {
    if (!selectedCenter) {
      toast.error("Please select a healthcare center first");
      return;
    }

    setIsFacilityReferDialogOpen(true);
  };

  const handleFacilityReferralSuccess = () => {
    setActiveTab("facility");
    fetchFacilityReferrals();
  };

  const handleViewFacilityReferral = (referralId: string) => {
    setSelectedFacilityReferralId(referralId);
    setActiveTab("facility-details");
  };

  const handleBackFromFacilityDetails = () => {
    setSelectedFacilityReferralId(null);
    setActiveTab("facility");
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-1 mb-4">
            <TabsList className="w-full min-w-[500px]">
              <TabsTrigger value="find" className="text-xs sm:text-sm py-2 flex-1 h-10">Find Centers</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm py-2 flex-1 h-10">Referral History</TabsTrigger>
              <TabsTrigger value="facility" className="text-xs sm:text-sm py-2 flex-1 h-10">Facility Referrals</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2 flex-1 h-10">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="find">
            <div className="space-y-6">
              <div className="flex flex-col space-y-2 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-bold">Patient Referrals</h2>
                <p className="text-sm text-muted-foreground">
                  Refer patients to other healthcare centers in our network
                </p>
              </div>

              <div className="border rounded-lg p-2 sm:p-4 space-y-4">
                <h3 className="font-medium">Find Centers</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm">Search by Center ID</label>
                    <Input
                      placeholder="Enter center ID..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-sm">Or Filter by Type</label>
                    <Select value={centerType} onValueChange={setCenterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select center type" />
                      </SelectTrigger>
                      <SelectContent>
                        {centerTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {hasSearched && (
                <div className="space-y-4">
                  <h3 className="font-medium">Search Results</h3>
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((center) => (
                        <Card key={center.id} className="overflow-hidden">
                          <div className="aspect-video bg-muted relative">
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Building className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          <CardHeader className="p-3 sm:p-4">
                            <CardTitle className="text-base sm:text-lg">{center.name}</CardTitle>
                            <CardDescription className="flex items-center mt-1 text-sm">
                              <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              {center.distance} • {center.address}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 sm:p-4 pt-0">
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline">{center.type}</Badge>
                              <Badge variant="outline" className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-3 h-3 mr-1 text-amber-500"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {center.rating}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                ID: {center.id}
                              </span>
                              <Button size="sm" onClick={() => handleCenterSelect(center)} className="w-full sm:w-auto">
                                Refer to this Center
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">
                          No centers found matching your search criteria.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  All referrals are subject to patient consent and will be tracked in the system.
                  Medical data is only shared with explicit consent.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {selectedReferralId ? (
              <ReferralDetails
                referralId={selectedReferralId}
                onBack={handleBackFromDetails}
              />
            ) : centerId ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <div className="rounded-md border min-w-[800px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Date</TableHead>
                          <TableHead className="w-[150px]">Patient</TableHead>
                          <TableHead className="w-[200px]">Destination</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[100px]">Priority</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingReferrals ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : referrals.length > 0 ? (
                          referrals.map((referral) => (
                            <TableRow key={referral.id}>
                              <TableCell>{formatDate(referral.createdAt || referral.created_at)}</TableCell>
                              <TableCell>{referral.patientId || referral.patient_id}</TableCell>
                              <TableCell>{referral.receivingCenterId || referral.to_center_id}</TableCell>
                              <TableCell className="max-w-[300px] truncate">{referral.reason}</TableCell>
                              <TableCell>{getReferralStatusBadge(referral.status)}</TableCell>
                              <TableCell>
                                <Badge variant={referral.priority === ReferralPriority.URGENT ? "destructive" : "outline"}>
                                  {referral.priority ? referral.priority.charAt(0).toUpperCase() + referral.priority.slice(1) : "Normal"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewReferral(referral.id)}
                                  className="w-full sm:w-auto"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No referrals found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Center ID Required</h3>
                    <p className="text-muted-foreground mt-2">
                      You must be associated with a healthcare center to view referrals.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="facility">
            {selectedFacilityReferralId ? (
              <FacilityReferralDetails
                referralId={selectedFacilityReferralId}
                onBack={handleBackFromFacilityDetails}
              />
            ) : centerId ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-lg sm:text-xl font-bold">Facility-to-Facility Referrals</h2>
                  {hasSearched && selectedCenter && (
                    <Button onClick={handleCreateFacilityReferral} className="w-full sm:w-auto">
                      Create Facility Referral
                    </Button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <div className="rounded-md border min-w-[800px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Date</TableHead>
                          <TableHead className="w-[200px]">From</TableHead>
                          <TableHead className="w-[200px]">To</TableHead>
                          <TableHead className="w-[120px]">Type</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[100px]">Priority</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingFacilityReferrals ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : facilityReferrals.length > 0 ? (
                          facilityReferrals.map((referral) => (
                            <TableRow key={referral.id}>
                              <TableCell>{formatDate(referral.created_at)}</TableCell>
                              <TableCell>{referral.from_center_id}</TableCell>
                              <TableCell>{referral.to_center_id}</TableCell>
                              <TableCell>{referral.referralType === "transfer" ? "Facility" : "Patient"}</TableCell>
                              <TableCell>{getReferralStatusBadge(referral.status)}</TableCell>
                              <TableCell>
                                <Badge variant={referral.priority === ReferralPriority.URGENT ? "destructive" : "outline"}>
                                  {referral.priority ? referral.priority.charAt(0).toUpperCase() + referral.priority.slice(1) : "Normal"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewFacilityReferral(referral.id)}
                                  className="w-full sm:w-auto"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-muted-foreground">No facility referrals found</p>
                                {hasSearched && selectedCenter && (
                                  <Button
                                    variant="outline"
                                    className="mt-4 w-full sm:w-auto"
                                    onClick={handleCreateFacilityReferral}
                                  >
                                    Create Facility Referral
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Center ID Required</h3>
                    <p className="text-muted-foreground mt-2">
                      You must be associated with a healthcare center to view facility referrals.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            {centerId ? (
              <ReferralAnalytics centerId={centerId} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Center ID Required</h3>
                    <p className="text-muted-foreground mt-2">
                      You must be associated with a healthcare center to view analytics.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Patient Referral Dialog */}
      <Dialog open={isReferDialogOpen} onOpenChange={setIsReferDialogOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Patient Referral</DialogTitle>
            <DialogDescription>
              Refer a patient to {selectedCenter?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <label htmlFor="patient" className="sm:text-right font-medium">
                Patient*
              </label>
              <div className="sm:col-span-3">
                <Select
                  value={selectedPatient}
                  onValueChange={setSelectedPatient}
                >
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.age}, {patient.gender})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
              <label htmlFor="reason" className="sm:text-right font-medium pt-2">
                Reason*
              </label>
              <Textarea
                id="reason"
                className="sm:col-span-3"
                value={referralReason}
                onChange={(e) => setReferralReason(e.target.value)}
                rows={2}
                placeholder="Enter the reason for this referral"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
              <label htmlFor="notes" className="sm:text-right font-medium pt-2">
                Additional Notes
              </label>
              <Textarea
                id="notes"
                className="sm:col-span-3"
                value={referralNotes}
                onChange={(e) => setReferralNotes(e.target.value)}
                rows={3}
                placeholder="Add any additional notes or context for this referral"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <label htmlFor="priority" className="sm:text-right font-medium">
                Priority
              </label>
              <div className="sm:col-span-3">
                <Select
                  value={referralPriority}
                  onValueChange={(value) => setReferralPriority(value as ReferralPriority)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <label htmlFor="completion" className="sm:text-right font-medium">
                Expected Completion
              </label>
              <div className="sm:col-span-3">
                <Input
                  id="completion"
                  type="date"
                  value={expectedCompletionDate}
                  onChange={(e) => setExpectedCompletionDate(e.target.value)}
                />
              </div>
            </div>

            <Separator className="col-span-1 sm:col-span-4 my-2" />

            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
              <div className="sm:text-right font-medium pt-2">
                Patient Consent
              </div>
              <div className="sm:col-span-3 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consent"
                    checked={patientConsent}
                    onCheckedChange={(checked) => setPatientConsent(checked === true)}
                  />
                  <label
                    htmlFor="consent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Patient has consented to this referral*
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="records"
                    checked={transferMedicalRecords}
                    onCheckedChange={(checked) => setTransferMedicalRecords(checked === true)}
                  />
                  <label
                    htmlFor="records"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Transfer relevant medical records
                  </label>
                </div>

                {transferMedicalRecords && selectedPatient && (
                  <div className="pl-4 sm:pl-6 border-l-2 border-l-muted mt-4">
                    <h4 className="text-sm font-medium mb-2">Select Records to Transfer</h4>
                    <div className="space-y-2">
                      {getPatientMedicalRecords(selectedPatient).map((record) => (
                        <div key={record.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`record-${record.id}`}
                            checked={selectedRecords.includes(record.id)}
                            onCheckedChange={() => handleToggleRecord(record.id)}
                          />
                          <label
                            htmlFor={`record-${record.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {record.title} ({record.type}) - {record.date}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsReferDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleReferralSubmit} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Creating..." : "Create Referral"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Facility Referral Form Dialog */}
      <FacilityReferralForm
        open={isFacilityReferDialogOpen}
        onClose={() => setIsFacilityReferDialogOpen(false)}
        selectedCenter={selectedCenter}
        onSuccess={handleFacilityReferralSuccess}
      />
    </Card>
  );
};

export default ReferralSystem;
