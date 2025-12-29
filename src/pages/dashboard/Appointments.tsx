import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, MapPin, X } from 'lucide-react';
import { api } from '@/services/api';
import { Booking } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Appointments() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    api.booking.getMyBookings().then(res => {
      if (res.success) setBookings(res.data);
      setLoading(false);
    });
  }, []);

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const handleCancel = async (id: string) => {
    const response = await api.booking.cancelBooking(id);
    if (response.success) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      toast({ title: 'Appointment cancelled', description: 'Your appointment has been cancelled.' });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Manage your consultation schedule</p>
        </div>
        <Link to="/book"><Button variant="gold">Book New Appointment</Button></Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6 h-32 bg-muted" /></Card>)}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-lg bg-accent/10 flex flex-col items-center justify-center">
                            <span className="text-xs text-accent font-medium">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-lg font-bold text-accent">{new Date(booking.date).getDate()}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{booking.consultationType.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{booking.reason}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {booking.time}</span>
                              <span className="flex items-center gap-1"><Video className="h-4 w-4" /> Video Call</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={cn(
                            booking.status === 'confirmed' && 'border-success text-success',
                            booking.status === 'pending' && 'border-warning text-warning'
                          )}>
                            {booking.status}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => handleCancel(booking.id)}>
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                  <Link to="/book"><Button variant="gold">Book a Consultation</Button></Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Past */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Past Appointments</h2>
              <div className="space-y-4">
                {pastBookings.map(booking => (
                  <Card key={booking.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg bg-muted flex flex-col items-center justify-center">
                            <span className="text-xs text-muted-foreground font-medium">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-lg font-bold text-muted-foreground">{new Date(booking.date).getDate()}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{booking.consultationType.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{booking.time}</span>
                              <Badge variant="outline">{booking.status}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
