import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Clock, Video, Mail, UserCheck } from "lucide-react";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import AddAppointmentModal from "@/components/admin/AddAppointmentModal";
import RescheduleModal from "@/components/booking/RescheduleModal";
import VideoCallModal from "@/components/booking/VideoCallModal";
import AddToCalendarButton from "@/components/booking/AddToCalendarButton";

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [videoModalBooking, setVideoModalBooking] = useState<Booking | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [highlightedBookingId, setHighlightedBookingId] = useState<
    string | null
  >(null);
  const location = useLocation();
  const { toast } = useToast();

  const loadBookings = useCallback(() => {
    setLoading(true);
    api.booking.getMyBookings().then((res) => {
      if (res.success) setBookings(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Check if we got booking context from navigation state
    const state = location.state as { selectedBooking?: Booking } | null;
    if (state?.selectedBooking) {
      const booking = state.selectedBooking;
      setHighlightedBookingId(booking.id);
      toast({
        title: "Appointment Details",
        description: `Viewing appointment for ${booking.clientName} on ${booking.date} at ${booking.time}`,
      });
      try {
        const bookingDate = new Date(booking.date);
        setSelectedDate(bookingDate);
      } catch (e) {
        // If date parsing fails, use today
      }
    }

    loadBookings();
  }, [location.state, loadBookings, toast]);

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const todaysBookings = bookings.filter((b) => b.date === selectedDateStr);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Calendar
            </h1>
            <p className="text-muted-foreground">
              Manage your appointments and schedule
            </p>
          </div>
          <Button variant="gold" onClick={() => setAddAppointmentOpen(true)}>
            Add Appointment
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Day View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.setDate(selectedDate.getDate() - 1)
                        )
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.setDate(selectedDate.getDate() + 1)
                        )
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading...
                </div>
              ) : todaysBookings.length > 0 ? (
                <div className="space-y-4">
                  {todaysBookings
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className={cn(
                          "flex flex-col md:flex-row gap-4 p-4 rounded-lg border transition-colors",
                          highlightedBookingId === booking.id
                            ? "bg-gold/10 border-gold ring-2 ring-gold/20"
                            : "bg-card hover:bg-muted/50"
                        )}
                      >
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-semibold">
                            {formatTime(booking.time)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.consultationType.duration} min
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                            <h4 className="font-medium flex items-center gap-2">
                              {booking.clientName}
                              {!booking.clientId ? (
                                <Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning border-warning/30">
                                  Unregistered Guest
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] bg-success/10 text-success border-success/30">
                                  <UserCheck className="h-2.5 w-2.5 mr-0.5" /> Registered
                                </Badge>
                              )}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                booking.status === "confirmed" &&
                                  "border-success text-success",
                                booking.status === "pending" &&
                                  "border-warning text-warning"
                              )}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-1">
                            {booking.consultationType.name}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
                            <span className="flex items-center gap-1 font-mono text-[11px] text-foreground/80">
                              <Mail className="h-3 w-3 text-gold" /> {booking.clientEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              <Video className="h-3 w-3 text-gold" /> {booking.videoProvider ? booking.videoProvider.toUpperCase() : "Zoom (Default)"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {booking.consultationType.duration} mins
                            </span>
                          </div>

                          {booking.reason && (
                            <p className="text-xs italic bg-muted/30 p-2 rounded border text-muted-foreground">
                              "{booking.reason}"
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap md:flex-col gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRescheduleBooking(booking);
                              setRescheduleModalOpen(true);
                            }}
                          >
                            Reschedule
                          </Button>

                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => {
                              setVideoModalBooking(booking);
                              setVideoModalOpen(true);
                            }}
                          >
                            <Video className="h-3.5 w-3.5 mr-1" /> Video Call
                          </Button>

                          <AddToCalendarButton booking={booking} size="sm" variant="ghost" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No appointments scheduled for this day
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setAddAppointmentOpen(true)}
                  >
                    Add Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>This Week's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading...
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => {
                  // Calculate the date for each day of the current week
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(
                    today.getDate() - today.getDay() + 1 + index
                  ); // Monday = 1
                  const dayDateStr = startOfWeek.toISOString().split("T")[0];
                  const dayBookings = bookings.filter(
                    (b) => b.date === dayDateStr
                  );

                  return (
                    <div
                      key={day}
                      className="bg-muted/30 rounded-lg p-3 min-h-[120px]"
                    >
                      <div className="font-medium text-sm mb-2 flex justify-between items-center">
                        <span>{day}</span>
                        <span className="text-xs text-muted-foreground">
                          {startOfWeek.getDate()}/{startOfWeek.getMonth() + 1}
                        </span>
                      </div>
                      {dayBookings.length > 0 ? (
                        <div className="space-y-2">
                          {dayBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className={cn(
                                "text-xs p-2 rounded bg-card border cursor-pointer hover:bg-muted/50 transition-colors",
                                highlightedBookingId === booking.id &&
                                  "ring-2 ring-gold"
                              )}
                              onClick={() => {
                                setSelectedDate(new Date(booking.date));
                                setHighlightedBookingId(booking.id);
                              }}
                            >
                              <div className="font-medium truncate">
                                {booking.clientName}
                              </div>
                              <div className="text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(booking.time)}
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "mt-1 text-[10px]",
                                  booking.status === "confirmed" &&
                                    "border-success text-success",
                                  booking.status === "pending" &&
                                    "border-warning text-warning"
                                )}
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No appointments
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddAppointmentModal
        open={addAppointmentOpen}
        onOpenChange={setAddAppointmentOpen}
        onSuccess={loadBookings}
      />

      <RescheduleModal
        booking={rescheduleBooking}
        open={rescheduleModalOpen}
        onOpenChange={setRescheduleModalOpen}
        onSuccess={loadBookings}
      />

      <VideoCallModal
        booking={videoModalBooking}
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        isAdmin={true}
        onSuccess={loadBookings}
      />
    </AdminLayout>
  );
}
