import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  User,
  Building,
  Check,
  ChevronRight,
  CalendarRange,
  Clock3,
  Loader2
} from "lucide-react";
import { useNotificationsContext } from "@/context/NotificationsContext";
import { useApprovedProviders } from "@/hooks/useApprovedProviders";
import LoadingSpinner from "../common/LoadingSpinner";

// Schema for appointment form
const appointmentSchema = z.object({
  doctor: z.string({
    required_error: "Please select a doctor.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  time: z.string({
    required_error: "Please select a time.",
  }),
  reason: z.string().min(3, {
    message: "Reason must be at least 3 characters.",
  }),
  notes: z.string().optional(),
  setReminder: z.boolean().default(true),
  reminderTime: z.string().optional(),
});

interface AppointmentSchedulerProps {
  centerId?: string;
}

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export const AppointmentScheduler = ({ centerId: _centerId }: AppointmentSchedulerProps) => {
  const { toast } = useToast();
  const { addNotification } = useNotificationsContext();
  const { doctors: approvedDoctors, loading: doctorsLoading } = useApprovedProviders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const doctors = approvedDoctors.map(d => ({
    id: d.providerId || (d as any).id,
    name: d.provider?.profile?.firstName
      ? `Dr. ${d.provider.profile.firstName} ${d.provider.profile.lastName}`
      : (d as any).name || "Unknown Specialist",
    specialty: d.provider?.profile?.specialization || 'Clinical Specialist'
  }));

  // Initialize the form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      reason: "",
      notes: "",
      setReminder: true,
      reminderTime: "24_hours",
    },
  });

  // Handle date selection to load available times
  const onDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const times: string[] = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
    setAvailableTimes(times);

    // If there's a time already selected and it's not in the new available times,
    // clear the time selection
    const currentTime = form.getValues("time");
    if (currentTime && !times.includes(currentTime)) {
      form.setValue("time", "");
    }
  };

  // Doctors data populated via useApprovedProviders hook

  // Handle form submission
  const onSubmit = (data: AppointmentFormValues) => {
    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      // Create appointment data
      const appointmentData = {
        id: Math.random().toString(36).substring(2, 11),
        doctor: doctors.find(doc => doc.id === data.doctor)?.name || "Unknown Doctor",
        date: format(data.date, "MMMM dd, yyyy"),
        time: data.time,
        reason: data.reason,
        notes: data.notes || "",
      };

      // Show success message
      setShowSuccess(true);
      setIsSubmitting(false);

      // Reset form after delay
      setTimeout(() => {
        setShowSuccess(false);
        form.reset();
        setAvailableTimes([]);
      }, 5000);

      // Add notification about the new booking request
      addNotification({
        title: "Clinical Session Requested",
        message: `Your appointment request with ${appointmentData.doctor} has been recorded for ${appointmentData.date} at ${appointmentData.time}.`,
        type: "appointment",
      });

      // Show toast
      toast({
        title: "Booking Request Buffered",
        description: `Your appointment with ${appointmentData.doctor} has been requested for ${appointmentData.date} at ${appointmentData.time}.`,
      });
    }, 1500);
  };

  return (
    <div className="w-full px-0 sm:px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 px-4 sm:px-0">Clinical Appointment Protocol</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-white">
            <CardTitle>Book Appointment Reminder</CardTitle>
            <CardDescription>
              Select your preferred consultant, date, and time. Note: Doctors will finalize and schedule the exact slot.
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            {showSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Protocol Buffered!</h3>
                <p className="text-green-700 mb-6 text-sm">
                  Your appointment request has been synchronized. You will receive a notification when the Specialist schedules the final session.
                </p>
                <Button variant="outline" className="rounded-xl border-green-200 text-green-700 hover:bg-green-100" onClick={() => setShowSuccess(false)}>
                  Schedule Another
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="doctor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-bold">Select Doctor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 h-12">
                              {doctorsLoading ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading Registry...</div> : <SelectValue placeholder="Select a medical professional" />}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl max-h-[300px]">
                            {doctors.length > 0 ? doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id} className="rounded-lg py-3">
                                <div className="flex flex-col">
                                  <span className="font-bold">{doctor.name}</span>
                                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">{doctor.specialty}</span>
                                </div>
                              </SelectItem>
                            )) : (
                              <div className="p-4 text-center text-xs text-gray-400">No Specialists available in your region.</div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose a doctor for your appointment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-gray-700 font-bold">Appointment Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={`w-full pl-3 text-left font-normal rounded-xl border-gray-100 bg-gray-50/50 ${!field.value ? "text-muted-foreground" : ""}`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 text-gray-400" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-xl" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  onDateSelect(date);
                                }}
                                disabled={(date) => {
                                  return (
                                    date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                    date.getDay() === 0
                                  );
                                }}
                                initialFocus
                                className="rounded-2xl"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-bold">Appointment Time</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={availableTimes.length === 0}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50">
                                <SelectValue placeholder={availableTimes.length === 0 ? "Select a date first" : "Select a time"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              {availableTimes.length > 0 ? availableTimes.map((time) => (
                                <SelectItem key={time} value={time} className="rounded-lg">
                                  {time}
                                </SelectItem>
                              )) : (
                                <div className="p-4 text-center text-xs text-gray-400 italic">Please pick a date to see temporal slots.</div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-bold">Reason for Visit</FormLabel>
                        <FormControl>
                          <textarea
                            className="flex min-h-24 w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm focus-visible:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                            placeholder="Please describe the reason for your appointment"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <FormField
                      control={form.control}
                      name="setReminder"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-bold text-slate-900">
                              Set Reminders
                            </FormLabel>
                            <FormDescription className="text-[10px]">
                              Receive alerts before your appointment.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("setReminder") && (
                      <FormField
                        control={form.control}
                        name="reminderTime"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-9 rounded-lg border-blue-100 bg-white text-xs">
                                  <SelectValue placeholder="When?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1_hour">1 hour before</SelectItem>
                                <SelectItem value="2_hours">2 hours before</SelectItem>
                                <SelectItem value="12_hours">12 hours before</SelectItem>
                                <SelectItem value="24_hours">24 hours before</SelectItem>
                                <SelectItem value="48_hours">2 days before</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-100 text-sm tracking-wider uppercase" disabled={isSubmitting || doctorsLoading}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Authorizing Protocol...
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        Request Session Authorization
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white">
              <CardTitle className="flex items-center text-lg">
                <CalendarRange className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <div className="space-y-4">
                {([] as any[]).length > 0 ? (
                  ([] as any[]).map((appt, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">{appt.dr}</span>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-lg px-2 py-0.5 text-[10px]">{appt.type}</Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-2 font-medium">
                        <Clock3 className="h-3.5 w-3.5 mr-1 text-blue-400" />
                        <span>{appt.time}, {appt.date}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 italic">General checkup and consultation</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 italic text-sm">
                    No upcoming appointments.
                  </div>
                )}
              </div>

              <Button variant="link" className="mt-4 p-0 text-blue-600 font-bold text-sm h-8">
                View all appointments <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white pb-2">
              <CardTitle className="text-lg">Insurance Coverage</CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <div className="space-y-3">
                <div className="text-center py-4 text-gray-500 italic text-sm">
                  No insurance information found.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                If you need assistance with scheduling or have questions about your appointment, our support team is here to help.
              </p>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl h-10">
                <User className="h-4 w-4 mr-2" />
                Talk to Assistant
              </Button>
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl h-10">
                <Building className="h-4 w-4 mr-2" />
                Contact Clinic
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
