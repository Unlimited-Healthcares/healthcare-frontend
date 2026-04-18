'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { medicalRecordService } from '@/services/medicalRecordService';
import { supabase } from '@/lib/supabase-client';
import { toast } from '@/components/ui/use-toast';

// Define form schema
const requestFormSchema = z.object({
  patientId: z.string({
    required_error: "Please select a patient",
  }),
  toCenterId: z.string({
    required_error: "Please select a healthcare facility",
  }),
  purpose: z.string().min(10, {
    message: "Purpose must be at least 10 characters.",
  }),
  expiryDate: z.date().optional(),
  accessDays: z.coerce.number().min(1).max(365).default(30),
  notes: z.string().optional(),
  specificRecords: z.boolean().default(false),
  recordTypes: z.array(z.string()).optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface MedicalRecordRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  centerId: string;
}

interface Patient {
  id: string;
  name: string;
  patient_id: string;
}

interface Center {
  id: string;
  name: string;
  center_type: string;
}

export function MedicalRecordRequestForm({
  open,
  onOpenChange,
  centerId,
}: MedicalRecordRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [recordTypes] = useState([
    { id: 'allergies', label: 'Allergies' },
    { id: 'diagnoses', label: 'Diagnoses' },
    { id: 'medications', label: 'Medications' },
    { id: 'lab_results', label: 'Diagnostic Results' },
    { id: 'imaging', label: 'Imaging & Radiology' },
    { id: 'vitals', label: 'Vital Signs' },
    { id: 'procedures', label: 'Procedures' },
    { id: 'immunizations', label: 'Immunizations' },
  ]);

  // Initialize form
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      accessDays: 30,
      specificRecords: false,
      recordTypes: [],
    },
  });

  // Fetch patients and centers on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        console.warn('Supabase is not configured');
        return;
      }

      // Fetch patients associated with this center
      const { data: patientsData, error: patientsError } = await supabase!
        .from('patients')
        .select('id, name, patient_id')
        .order('name', { ascending: true });

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
      } else {
        setPatients(patientsData || []);
      }

      // Fetch other healthcare centers
      const { data: centersData, error: centersError } = await supabase!
        .from('centers')
        .select('id, name, center_type')
        .neq('id', centerId) // Exclude the current center
        .order('name', { ascending: true });

      if (centersError) {
        console.error('Error fetching centers:', centersError);
      } else {
        setCenters(centersData || []);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, centerId]);

  const onSubmit = async (data: RequestFormValues) => {
    setLoading(true);
    try {
      // Prepare the specific records data if needed
      const specificRecords = data.specificRecords && data.recordTypes?.length
        ? { record_types: data.recordTypes }
        : null;

      // Call the service function to request medical records
      const result = await medicalRecordService.requestMedicalRecords({
        patient_id: data.patientId,
        from_center_id: centerId,
        to_center_id: data.toCenterId,
        purpose: data.purpose,
        access_duration_days: data.accessDays,
        specific_records: specificRecords,
        notes: data.notes,
      });

      if (result.success) {
        toast({
          title: "Request Sent",
          description: "Medical record request has been sent successfully.",
        });
        onOpenChange(false);
        form.reset();
      } else {
        toast({
          title: "Error",
          description: "Failed to send medical record request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Medical Records</DialogTitle>
          <DialogDescription>
            Request patient medical records from another healthcare facility.
            The receiving facility will review and respond to your request.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Selection */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.patient_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the patient whose records you wish to request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Healthcare Facility Selection */}
            <FormField
              control={form.control}
              name="toCenterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Healthcare Facility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a healthcare facility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {centers.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name} ({center.center_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the facility from which to request records.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purpose */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why you need these medical records"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a clear explanation for why these records are needed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Access Duration */}
            <FormField
              control={form.control}
              name="accessDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Duration (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} min={1} max={365} />
                  </FormControl>
                  <FormDescription>
                    How many days should the facility have access to these records?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiry Date */}
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Request Expiry Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>No expiry date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    If set, the request will expire if not approved by this date.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Specific Records Toggle */}
            <FormField
              control={form.control}
              name="specificRecords"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Request Specific Records</FormLabel>
                    <FormDescription>
                      Toggle on to request only specific types of records.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Record Types Checkboxes */}
            {form.watch("specificRecords") && (
              <FormField
                control={form.control}
                name="recordTypes"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Record Types</FormLabel>
                      <FormDescription>
                        Select the specific types of medical records you need.
                      </FormDescription>
                    </div>
                    <Card>
                      <CardContent className="pt-4 grid grid-cols-2 gap-4">
                        {recordTypes.map((type) => (
                          <FormField
                            key={type.id}
                            control={form.control}
                            name="recordTypes"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={type.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(type.id)}
                                      onCheckedChange={(checked) => {
                                        const currentValues = field.value || [];
                                        return checked
                                          ? field.onChange([...currentValues, type.id])
                                          : field.onChange(
                                            currentValues.filter(
                                              (value) => value !== type.id
                                            )
                                          );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {type.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </CardContent>
                    </Card>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add any additional context or notes for the receiving facility.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 