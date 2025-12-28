import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Calendar, MessageSquare, FileText, ChevronRight, Clock } from 'lucide-react';
import { api } from '@/services/api';
import { Case, Booking, Conversation } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.cases.getMyCases(),
      api.booking.getMyBookings(),
      api.messages.getConversations(),
    ]).then(([casesRes, bookingsRes, convsRes]) => {
      if (casesRes.success) setCases(casesRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (convsRes.success) setConversations(convsRes.data);
      setLoading(false);
    });
  }, []);

  const activeCases = cases.filter(c => c.status === 'active' || c.status === 'pending');
  const upcomingBooking = bookings.find(b => b.status === 'confirmed');
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const stats = [
    { icon: FolderOpen, label: 'Active Cases', value: activeCases.length, href: '/dashboard/cases', color: 'text-blue-500' },
    { icon: Calendar, label: 'Upcoming Appointments', value: bookings.filter(b => b.status === 'confirmed').length, href: '/dashboard/appointments', color: 'text-green-500' },
    { icon: MessageSquare, label: 'Unread Messages', value: unreadMessages, href: '/dashboard/messages', color: 'text-purple-500' },
    { icon: FileText, label: 'Documents', value: cases.reduce((sum, c) => sum + c.documents.length, 0), href: '/dashboard/documents', color: 'text-orange-500' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6 h-24 bg-muted" /></Card>)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={cn("h-10 w-10", stat.color)} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Consultation</CardTitle>
            <Link to="/dashboard/appointments"><Button variant="ghost" size="sm">View All <ChevronRight className="h-4 w-4" /></Button></Link>
          </CardHeader>
          <CardContent>
            {upcomingBooking ? (
              <div className="flex items-start gap-4 p-4 bg-secondary rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{upcomingBooking.consultationType.name}</h4>
                  <p className="text-sm text-muted-foreground">{new Date(upcomingBooking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{upcomingBooking.time}</span>
                    <Badge variant="outline" className="ml-2">{upcomingBooking.status}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming appointments</p>
                <Link to="/book"><Button variant="gold" size="sm" className="mt-3">Book Consultation</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Messages</CardTitle>
            <Link to="/dashboard/messages"><Button variant="ghost" size="sm">View All <ChevronRight className="h-4 w-4" /></Button></Link>
          </CardHeader>
          <CardContent>
            {conversations.length > 0 ? (
              <div className="space-y-3">
                {conversations.slice(0, 3).map(conv => (
                  <Link key={conv.id} to={`/dashboard/messages/${conv.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" alt="Sarah" className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{conv.caseTitle}</span>
                        {conv.unreadCount > 0 && <Badge className="bg-accent text-accent-foreground">{conv.unreadCount}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Cases */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Your Cases</CardTitle>
            <Link to="/dashboard/cases"><Button variant="ghost" size="sm">View All <ChevronRight className="h-4 w-4" /></Button></Link>
          </CardHeader>
          <CardContent>
            {cases.length > 0 ? (
              <div className="space-y-3">
                {cases.map(caseItem => (
                  <Link key={caseItem.id} to={`/dashboard/cases/${caseItem.id}`} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{caseItem.title}</h4>
                        <p className="text-sm text-muted-foreground">{caseItem.caseType}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      caseItem.status === 'active' && 'border-success text-success',
                      caseItem.status === 'pending' && 'border-warning text-warning',
                      caseItem.status === 'closed' && 'border-muted-foreground text-muted-foreground'
                    )}>
                      {caseItem.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active cases</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
