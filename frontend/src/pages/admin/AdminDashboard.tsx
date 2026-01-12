import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Users,
  Briefcase,
  Calendar,
  Clock,
  TrendingUp,
  Search,
  MoreVertical,
  Eye,
  MessageSquare,
  FileText,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '@/services/api';
import { DashboardStats, Case, Booking, User } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';
import CaseDetailModal from '@/components/admin/CaseDetailModal';



export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ clients: User[]; cases: Case[] } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.dashboard.getLawyerStats(),
      api.cases.getMyCases(),
      api.booking.getMyBookings(),
    ]).then(([statsRes, casesRes, bookingsRes]) => {
      if (statsRes.success) setStats(statsRes.data);
      if (casesRes.success) setCases(casesRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      setLoading(false);
    });
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const res = await api.dashboard.search(searchQuery);
      if (res.success) {
        setSearchResults(res.data);
      }
      setSearchLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, []);

  const handleBookingStatusChange = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    const res = await api.booking.updateBookingStatus(bookingId, newStatus);
    if (res.success) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      toast({ title: 'Status Updated', description: `Appointment status changed to ${newStatus}` });
    } else {
      toast({ title: 'Error', description: res.message || 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleCaseStatusChange = async (caseId: string, newStatus: 'pending' | 'active' | 'closed') => {
    const res = await api.cases.updateCaseStatus(caseId, newStatus);
    if (res.success) {
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
      toast({ title: 'Status Updated', description: `Case status changed to ${newStatus}` });
    } else {
      toast({ title: 'Error', description: res.message || 'Failed to update status', variant: 'destructive' });
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Eka. Here's your practice overview.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients, cases..."
                className="pl-10 pr-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {/* Search Results Dropdown */}
              {searchQuery && searchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
                  {searchLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Searching...</div>
                  ) : (
                    <>
                      {searchResults.clients.length > 0 && (
                        <div>
                          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                            Clients ({searchResults.clients.length})
                          </div>
                          {searchResults.clients.slice(0, 5).map((client) => (
                            <button
                              key={client.id}
                              onClick={() => {
                                navigate('/admin/clients', { state: { selectedClientId: client.id } });
                                setSearchQuery('');
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
                            >
                              <Users className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">{client.name}</p>
                                <p className="text-xs text-muted-foreground">{client.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.cases.length > 0 && (
                        <div>
                          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                            Cases ({searchResults.cases.length})
                          </div>
                          {searchResults.cases.slice(0, 5).map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSelectedCaseId(c.id);
                                setCaseModalOpen(true);
                                setSearchQuery('');
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
                            >
                              <Briefcase className="h-4 w-4 text-accent" />
                              <div>
                                <p className="text-sm font-medium">{c.title}</p>
                                <p className="text-xs text-muted-foreground">{c.clientName || 'Unknown Client'} • {c.caseType}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.clients.length === 0 && searchResults.cases.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">No results found</div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-24 bg-muted" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Cases</p>
                    <p className="text-3xl font-bold">{stats?.activeCase || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <p className="text-xs text-success mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +2 this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                    <p className="text-3xl font-bold">{stats?.totalClients || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-success mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +5 this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-3xl font-bold">{stats?.upcomingAppointments || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-success" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Appointments scheduled</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Cases</p>
                    <p className="text-3xl font-bold">{stats?.pendingCases || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Cases awaiting action</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.appointmentsThisWeek || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.monthlyCases || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [value, 'Cases']}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--accent))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="cases">Recent Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingBookings.length > 0 ? (
                      upcomingBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.clientName}</p>
                              <p className="text-sm text-muted-foreground">{booking.clientEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>{booking.consultationType.name}</TableCell>
                          <TableCell>
                            {new Date(booking.date).toLocaleDateString()} at {booking.time}
                          </TableCell>
                          <TableCell>
                            <select
                              value={booking.status}
                              onChange={(e) => handleBookingStatusChange(booking.id, e.target.value as 'pending' | 'confirmed' | 'completed' | 'cancelled')}
                              className={cn(
                                "px-2 py-1 text-sm rounded border cursor-pointer bg-background",
                                booking.status === 'confirmed' && 'border-success text-success',
                                booking.status === 'pending' && 'border-warning text-warning',
                                booking.status === 'completed' && 'border-primary text-primary',
                                booking.status === 'cancelled' && 'border-destructive text-destructive'
                              )}
                            >
                              <option value="pending">pending</option>
                              <option value="confirmed">confirmed</option>
                              <option value="completed">completed</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate('/admin/calendar', { state: { selectedBooking: booking } })}>
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/admin/messages', { state: { clientId: booking.clientId, clientName: booking.clientName } })}>
                                  <MessageSquare className="h-4 w-4 mr-2" /> Send Message
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No upcoming appointments
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{caseItem.title}</p>
                            <p className="text-sm text-muted-foreground">{caseItem.clientName || 'Unknown Client'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{caseItem.caseType}</TableCell>
                        <TableCell>
                          <select
                            value={caseItem.status}
                            onChange={(e) => handleCaseStatusChange(caseItem.id, e.target.value as 'pending' | 'active' | 'closed')}
                            className={cn(
                              "px-2 py-1 text-sm rounded border cursor-pointer bg-background",
                              caseItem.status === 'active' && 'border-success text-success',
                              caseItem.status === 'pending' && 'border-warning text-warning',
                              caseItem.status === 'closed' && 'border-muted-foreground text-muted-foreground'
                            )}
                          >
                            <option value="pending">pending</option>
                            <option value="active">active</option>
                            <option value="closed">closed</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          {new Date(caseItem.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedCaseId(caseItem.id);
                                setCaseModalOpen(true);
                              }}>
                                <Eye className="h-4 w-4 mr-2" /> View Case
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate('/admin/documents', { state: { caseId: caseItem.id, caseTitle: caseItem.title } })}>
                                <FileText className="h-4 w-4 mr-2" /> Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate('/admin/messages', { state: { clientId: caseItem.clientId } })}>
                                <MessageSquare className="h-4 w-4 mr-2" /> Message Client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CaseDetailModal
          open={caseModalOpen}
          onOpenChange={setCaseModalOpen}
          caseId={selectedCaseId}
        />
      </div>
    </AdminLayout>
  );
}