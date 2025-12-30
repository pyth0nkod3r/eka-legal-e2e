import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Clock, Video, MapPin } from 'lucide-react';
import { api } from '@/services/api';
import { Booking } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import AddAppointmentModal from '@/components/admin/AddAppointmentModal';

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  const loadBookings = () => {
    setLoading(true);
    api.booking.getMyBookings().then(res => {
      if (res.success) setBookings(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    // Check if we got booking context from navigation state
    const state = location.state as { selectedBooking?: Booking } | null;
    if (state?.selectedBooking) {
      const booking = state.selectedBooking;
      setHighlightedBookingId(booking.id);
      toast({
        title: 'Appointment Details',
        description: `Viewing appointment for ${booking.clientName} on ${booking.date} at ${booking.time}`,
      });
      // Set the selected date to the booking's date
      try {
        const bookingDate = new Date(booking.date);
        setSelectedDate(bookingDate);
      } catch (e) {
        // If date parsing fails, just use today
      }
    }

    loadBookings();
  }, [location.state]);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const todaysBookings = bookings.filter(b => b.date === selectedDateStr);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground">Manage your appointments and schedule</p>
          </div>
          <Button variant="gold" onClick={() => setAddAppointmentOpen(true)}>Add Appointment</Button>
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
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
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
                    onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : todaysBookings.length > 0 ? (
                <div className="space-y-4">
                  {todaysBookings
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className={cn(
                          "flex gap-4 p-4 rounded-lg border transition-colors",
                          highlightedBookingId === booking.id
                            ? "bg-gold/10 border-gold ring-2 ring-gold/20"
                            : "bg-card hover:bg-muted/50"
                        )}
                      >
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-semibold">{formatTime(booking.time)}</div>
                          <div className="text-xs text-muted-foreground">{booking.consultationType.duration} min</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{booking.clientName}</h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                booking.status === 'confirmed' && 'border-success text-success',
                                booking.status === 'pending' && 'border-warning text-warning'
                              )}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{booking.consultationType.name}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Video className="h-3 w-3" /> Video Call
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {booking.consultationType.duration} minutes
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Coming Soon', description: 'Reschedule functionality will be available soon.' })}>Reschedule</Button>
                          <Button variant="gold" size="sm" onClick={() => toast({ title: 'Coming Soon', description: 'Video call functionality will be available soon.' })}>Join</Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No appointments scheduled for this day</p>
                  <Button variant="outline" onClick={() => setAddAppointmentOpen(true)}>Add Appointment</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddAppointmentModal
        open={addAppointmentOpen}
        onOpenChange={setAddAppointmentOpen}
        onSuccess={loadBookings}
      />
    </AdminLayout>
  );
}
