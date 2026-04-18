import { useState, useEffect } from "react";
import { patientService, PatientRecord } from "@/services/patientService";
import { medicalReportsService } from "@/services/medicalReportsService";
import { appointmentService } from "@/services/appointmentService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Search,
  FileText,
  Pill,
  Clipboard,
  ChevronRight,
  Clock,
  AlertCircle,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";

interface Patient extends PatientRecord {
  // name is now fullName from PatientRecord
}

interface MedicalRecord {
  id: string;
  patientId: string;
  type: string;
  title: string;
  date: string;
  doctorName: string;
  summary: string;
  details: string;
}

interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  isActive: boolean;
}

interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  purpose: string;
  doctor: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const PatientRecords = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const res = await patientService.getPatients({ search: searchTerm });
        setPatients(res.data || []);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(fetchPatients, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePatientSelect = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    toast({
      title: "Patient selected",
      description: `Viewing records for ${patient.fullName || 'Patient'}`,
    });
  };

  const [records, setRecords] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      const fetchData = async () => {
        setDataLoading(true);
        try {
          const [recordsRes, appointmentsRes] = await Promise.all([
            medicalReportsService.getMedicalReports({ patientId: selectedPatient.id }),
            appointmentService.getAppointments({ patientId: selectedPatient.id })
          ]);
          setRecords(recordsRes.data || []);
          setAppointments(appointmentsRes.data || []);
          // medications could be derived from records or a separate service if available
          // For now using empty as we don't have a direct medicationsService yet
          setMedications([]);
        } catch (error) {
          console.error("Failed to fetch patient details:", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedPatient]);

  const getRecordsForPatient = () => records;
  const getMedicationsForPatient = () => medications;
  const getAppointmentsForPatient = () => appointments;

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="text-blue-600 border-blue-400 bg-blue-50">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-400 bg-green-50">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600 border-red-400 bg-red-50">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full px-0 sm:px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 px-4 sm:px-0">Patient Records</h1>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-1 rounded-none sm:rounded-lg">
          <CardHeader>
            <CardTitle>Patient Search</CardTitle>
            <CardDescription>
              Search for patients by name or ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : patients.length > 0 ? (
                patients.map(patient => (
                  <div
                    key={patient.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedPatient?.id === patient.id
                      ? "bg-healthcare-50 border-healthcare-200"
                      : "hover:bg-gray-50"
                      }`}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{patient.fullName || 'Unnamed Patient'}</h3>
                        <div className="text-sm text-muted-foreground">ID: {patient.patientId || patient.id}</div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-muted-foreground ${selectedPatient?.id === patient.id ? "transform rotate-90" : ""
                        }`} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No patients found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-none sm:rounded-lg">
          {selectedPatient ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedPatient.fullName || 'Patient'}</CardTitle>
                    <CardDescription>Patient ID: {selectedPatient.patientId || selectedPatient.id}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">Age: {selectedPatient.age || '--'}</div>
                    <div className="text-sm">Gender: {selectedPatient.gender || '--'}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="records">
                  <TabsList className="mb-4">
                    <TabsTrigger value="records">
                      <FileText className="h-4 w-4 mr-1" />
                      Medical Records
                    </TabsTrigger>
                    <TabsTrigger value="medications">
                      <Pill className="h-4 w-4 mr-1" />
                      Medications
                    </TabsTrigger>
                    <TabsTrigger value="appointments">
                      <Calendar className="h-4 w-4 mr-1" />
                      Appointments
                    </TabsTrigger>
                    <TabsTrigger value="vitals">
                      <Activity className="h-4 w-4 mr-1" />
                      Vitals HUD
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="records">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Medical Records</h3>

                      <Accordion type="single" collapsible className="w-full">
                        {dataLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                          </div>
                        ) : getRecordsForPatient().length > 0 ? (
                          getRecordsForPatient().map((record: any) => (
                            <AccordionItem key={record.id} value={record.id}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex flex-col items-start text-left">
                                  <div className="font-medium">{record.title}</div>
                                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                                    <div className="bg-gray-100 text-xs rounded px-2 py-0.5 mr-2">
                                      {record.type}
                                    </div>
                                    <Clock className="h-3 w-3 mr-1" />
                                    {record.date}
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="p-4 bg-gray-50 rounded-md">
                                  <div className="mb-2">
                                    <span className="font-medium">Doctor:</span> {record.doctorName}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-medium">Summary:</span> {record.summary}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-medium">Details:</span>
                                    <p className="mt-1 whitespace-pre-wrap">{record.details}</p>
                                  </div>
                                  <div className="mt-4 flex justify-end">
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-4 w-4 mr-1" />
                                      View Full Report
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No medical records found for this patient
                          </div>
                        )}
                      </Accordion>
                    </div>
                  </TabsContent>

                  <TabsContent value="medications">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Medications</h3>

                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medication</TableHead>
                              <TableHead>Dosage</TableHead>
                              <TableHead>Frequency</TableHead>
                              <TableHead>Start Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getMedicationsForPatient().length > 0 ? (
                              getMedicationsForPatient().map((med: any) => (
                                <TableRow key={med.id}>
                                  <TableCell className="font-medium">{med.name}</TableCell>
                                  <TableCell>{med.dosage}</TableCell>
                                  <TableCell>{med.frequency}</TableCell>
                                  <TableCell>{med.startDate}</TableCell>
                                  <TableCell>
                                    {med.isActive ? (
                                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-gray-100">Discontinued</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                  No medications found for this patient
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="appointments">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Appointments</h3>

                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Purpose</TableHead>
                              <TableHead>Doctor</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getAppointmentsForPatient().length > 0 ? (
                              getAppointmentsForPatient().map((appt: any) => (
                                <TableRow key={appt.id}>
                                  <TableCell>{appt.date}</TableCell>
                                  <TableCell>{appt.time}</TableCell>
                                  <TableCell className="font-medium">{appt.purpose}</TableCell>
                                  <TableCell>{appt.doctor}</TableCell>
                                  <TableCell>{getStatusBadge(appt.status)}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                  No appointments found for this patient
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="vitals">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black uppercase tracking-tight">Physiological HUD</h3>
                        <Button size="sm" variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-xl">
                          Record New Vitals
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Heart Rate', value: selectedPatient.vitals?.heartRate || '--', unit: 'bpm', color: 'text-rose-500', bg: 'bg-rose-50' },
                          { label: 'BP', value: selectedPatient.vitals?.bp || '--', unit: 'mmHg', color: 'text-blue-500', bg: 'bg-blue-50' },
                          { label: 'Temp', value: selectedPatient.vitals?.temp || '--', unit: '°C', color: 'text-orange-500', bg: 'bg-orange-50' },
                          { label: 'SpO2', value: selectedPatient.vitals?.spO2 || '--', unit: '%', color: 'text-teal-500', bg: 'bg-teal-50' }
                        ].map((v, i) => (
                          <div key={i} className={`${v.bg} p-4 rounded-3xl text-center border border-white shadow-sm`}>
                            <div className={`text-2xl font-black ${v.color}`}>{v.value}</div>
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">{v.label} ({v.unit})</div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 italic text-sm text-slate-500 text-center">
                        Viewing historical physiological trends requires a verified clinical biometric device sync or manual record validation.
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Clipboard className="mr-2 h-4 w-4" />
                  Generate Complete Medical History
                </Button>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Patient Selected</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Select a patient from the list on the left to view their medical records,
                medications, and appointment history.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
