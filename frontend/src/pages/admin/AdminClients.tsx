import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, MoreVertical, Eye, MessageSquare, FileText, UserPlus, Mail, Phone, Calendar } from 'lucide-react';
import { api } from '@/services/api';
import { User } from '@/types';
import AddClientModal from '@/components/admin/AddClientModal';
import { cn } from '@/lib/utils';

export default function AdminClients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadClients = () => {
    setLoading(true);
    api.clients.getAll().then((res) => {
      if (res.success) {
        setClients(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProfile = (client: User) => {
    setSelectedClient(client);
    setProfileOpen(true);
  };

  const handleSendMessage = (client: User) => {
    navigate('/admin/messages', { state: { clientId: client.id, clientName: client.name } });
  };

  const handleViewCases = (client: User) => {
    navigate('/admin/cases', { state: { clientId: client.id, clientName: client.name } });
  };

  const handleStatusChange = async (client: User, newStatus: 'active' | 'closed') => {
    const result = await api.clients.updateClientStatus(client.id, newStatus);
    if (result.success) {
      toast({
        title: 'Status Updated',
        description: `${client.name}'s status has been changed to ${newStatus}.`,
      });
      // Update local state
      setClients(clients.map(c => 
        c.id === client.id ? { ...c, status: newStatus } : c
      ));
    } else {
      toast({
        title: 'Error',
        description: result.message || 'Failed to update client status',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground">Manage your client relationships</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="gold" onClick={() => setAddClientOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> Add Client
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={client.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`} />
                            <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Select
                          value={client.status || 'active'}
                          onValueChange={(value: 'active' | 'closed') => handleStatusChange(client, value)}
                        >
                          <SelectTrigger className="w-[100px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-success" />
                                Active
                              </span>
                            </SelectItem>
                            <SelectItem value="closed">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                                Closed
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProfile(client)}>
                              <Eye className="h-4 w-4 mr-2" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendMessage(client)}>
                              <MessageSquare className="h-4 w-4 mr-2" /> Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewCases(client)}>
                              <FileText className="h-4 w-4 mr-2" /> View Cases
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No clients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AddClientModal
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        onSuccess={loadClients}
      />

      {/* Client Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Client Profile</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedClient.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedClient.name}`} />
                  <AvatarFallback className="text-lg">{selectedClient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedClient.name}</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "mt-1",
                      selectedClient.status === 'active' && "border-success text-success",
                      selectedClient.status === 'closed' && "border-muted-foreground text-muted-foreground"
                    )}
                  >
                    {selectedClient.status === 'active' ? 'Active' : 'Closed'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedClient.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedClient.phone || 'No phone number'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(selectedClient.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setProfileOpen(false);
                    handleSendMessage(selectedClient);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> Message
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setProfileOpen(false);
                    handleViewCases(selectedClient);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" /> Cases
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

