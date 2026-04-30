import { useEffect, useState } from "react";
import { patientService, PatientRecord } from "@/services/patientService";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Plus, FileText, ArrowRight, Activity, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreatePatientModal } from "./CreatePatientModal";

interface PatientListProps {
  centerId?: string;
  onAction?: (action: string, patient: PatientRecord) => void;
}

export const PatientList = ({ centerId, onAction }: PatientListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPatients = async (search?: string) => {
    setIsLoading(true);
    try {
      const result = await patientService.getPatients({ search, centerId, limit: 100 });
      setPatients(result.data || []);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      toast.error("Could not load patients list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(searchTerm);
  }, [searchTerm, centerId]);

  const getTriageBadge = (color: string) => {
    switch (color) {
      case 'red': return <Badge className="bg-red-500 text-white border-none animate-pulse">Critical (Red)</Badge>;
      case 'yellow': return <Badge className="bg-amber-500 text-white border-none">Urgent (Yellow)</Badge>;
      case 'green': return <Badge className="bg-emerald-500 text-white border-none">Stable (Green)</Badge>;
      default: return <Badge variant="outline" className="text-slate-400">Not Triaged</Badge>;
    }
  };

  const getStatusBadge = (status: any) => {
    // Backend may return different status formats
    const s = status?.toString().toLowerCase() || "active";
    switch (s) {
      case "active":
      case "in_progress":
        return <Badge className="bg-teal-500">Active</Badge>;
      case "scheduled":
      case "pending":
        return <Badge variant="outline" className="text-blue-600 border-blue-400">Scheduled</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="secondary">{s}</Badge>;
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Patients</CardTitle>
          <CardDescription>Manage your patient records</CardDescription>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </CardHeader>
      <CardContent>
        <CreatePatientModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => fetchPatients(searchTerm)}
        />
        <div className="flex items-center mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or ID..."
              className="pl-10 rounded-xl bg-gray-50 border-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Triage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    Loading patients...
                  </TableCell>
                </TableRow>
              ) : patients.length > 0 ? (
                patients.map((patient: PatientRecord, i: number) => (
                  <TableRow key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-mono text-xs">{patient.patientId || patient.id}</TableCell>
                    <TableCell className="font-medium text-gray-900">{patient.fullName || 'Patient'}</TableCell>
                    <TableCell>{patient.age || '--'}</TableCell>
                    <TableCell>{patient.gender || '--'}</TableCell>
                    <TableCell>{patient.lastVisit ? new Date(patient.lastVisit as string).toLocaleDateString() : '--'}</TableCell>
                    <TableCell>{getStatusBadge(patient.status)}</TableCell>
                    <TableCell>{getTriageBadge((patient as any).triageColor || (i % 3 === 0 ? 'red' : i % 3 === 1 ? 'yellow' : 'green'))}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-purple-600"
                          onClick={() => onAction?.('ViewHistory', patient)}
                          title="View Medical History"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-emerald-600"
                          onClick={() => onAction?.('ClinicalReport', patient)}
                          title="Diagnosis Result"
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-blue-600"
                          onClick={() => onAction?.('ClinicalRequest', patient)}
                          title="Create Referral/Request"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                          onClick={() => onAction?.('OpenHub', patient)}
                          title="Open Physician Hub"
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    No patients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
