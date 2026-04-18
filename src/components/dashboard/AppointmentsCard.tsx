import { Calendar, Video, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppointments, useUpcomingAppointments } from "@/hooks/useAppointments";
import { format, addMinutes, isAfter, isBefore } from "date-fns";
import { Appointment } from "@/types/appointments";
import { useAuth } from "@/hooks/useAuth";

export function AppointmentsCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments: allAppointments, loading } = useAppointments();
  const appointments = useUpcomingAppointments(allAppointments, 3);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`;
    if (firstName) return firstName[0];
    return '?';
  };

  const isJoinable = (appointment: Appointment) => {
    if (appointment.confirmationStatus !== "confirmed") return false;
    if (!appointment.isOnline) return false;

    // Explicitly check for payment if metadata exists
    const paymentStatus = (appointment as any).metadata?.paymentInfo?.status;
    if (paymentStatus && paymentStatus !== 'paid') return false;

    try {
      const apptDate = new Date(appointment.appointmentDate);
      if (appointment.startTime) {
        const [h, m] = appointment.startTime.split(':').map(Number);
        apptDate.setHours(h, m, 0, 0);
      }

      const joinWindowStart = apptDate; // Strict start time
      const joinWindowEnd = addMinutes(apptDate, appointment.durationMinutes || 30);

      return isAfter(now, joinWindowStart) && isBefore(now, joinWindowEnd);
    } catch (e) {
      return false;
    }
  };
  return (
    <Card className="shadow-lg border-0 bg-gray-50">
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-4 md:px-6">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Upcoming Appointments</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-xs sm:text-sm px-2 sm:px-3"
            onClick={() => navigate('/calendar')}
          >
            Calendar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 sm:px-4 md:px-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading appointments...</p>
          </div>
        ) : appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 w-full"
            >
              <Avatar className="h-10 w-10 sm:h-12 md:h-14 sm:w-12 md:w-14 flex-shrink-0">
                <AvatarFallback className="bg-blue-600 text-white text-sm sm:text-base md:text-lg font-semibold">
                  {getInitials(appointment.patient?.firstName, appointment.patient?.lastName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1 sm:mb-2">
                  <h4 className="font-semibold text-xs sm:text-sm text-gray-800 truncate">
                    {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : (appointment.providerName || 'Healthcare Provider')}
                  </h4>
                  <Badge className="text-[10px] sm:text-xs bg-teal-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ml-2 flex-shrink-0 sm:hidden">
                    {appointment.type || 'Visit'}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span className="font-medium">
                      {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{appointment.startTime} - {appointment.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {appointment.isOnline ? (
                      <Video className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span>{appointment.isOnline ? "Video Call" : "Physical Visit"}</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 sm:gap-4 flex-shrink-0">
                <Badge className="text-xs bg-teal-500 text-white px-2 py-1 rounded-full">
                  {appointment.type || 'Visit'}
                </Badge>
                {appointment.isOnline ? (
                  <Button
                    size="sm"
                    disabled={!isJoinable(appointment)}
                    onClick={() => navigate(`/teleconsult/${appointment.id}`)}
                    className={`text-xs sm:text-sm ${isJoinable(appointment)
                      ? "bg-blue-600 text-white hover:bg-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg"
                      : "bg-gray-100 text-gray-400 border border-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg"
                      }`}
                  >
                    {isJoinable(appointment) ? "Join Call" : "Locked"}
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-xs text-gray-500 font-bold uppercase py-1.5">
                    {appointment.confirmationStatus === "confirmed" ? "Scheduled" : "Pending"}
                  </Badge>
                )}
              </div>

              {/* Mobile action button */}
              {appointment.isOnline && (
                <Button
                  size="sm"
                  disabled={!isJoinable(appointment)}
                  onClick={() => navigate(`/teleconsult/${appointment.id}`)}
                  className={`sm:hidden text-xs flex-shrink-0 ${isJoinable(appointment)
                    ? "bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg"
                    : "bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg"
                    }`}
                >
                  {isJoinable(appointment) ? "Join" : "Locked"}
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 italic text-sm">
            No upcoming appointments scheduled.
          </div>
        )}

        {user?.roles?.includes('patient') && (
          <Button
            variant="outline"
            onClick={() => navigate('/appointments')}
            className="w-full h-10 sm:h-12 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 rounded-lg font-medium mt-3 sm:mt-4 text-xs sm:text-sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule New Appointment
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
