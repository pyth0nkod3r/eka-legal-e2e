import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, Eye, MessageSquare, FileText, Plus, X, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api } from '@/services/api';
import { Case } from '@/types';
import { cn } from '@/lib/utils';
import NewCaseModal from '@/components/admin/NewCaseModal';

export default function AdminCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'closed'>('all');
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get client filter from navigation state
  const state = location.state as { clientId?: string; clientName?: string } | null;
  const clientFilter = state?.clientId || null;
  const clientName = state?.clientName || null;

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = clientFilter 
        ? await api.cases.getCasesByClient(clientFilter)
        : await api.cases.getMyCases();
      if (res.success) setCases(res.data);
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCases();
  }, [clientFilter]);

  const clearClientFilter = () => {
    // Navigate to same page without state
    navigate('/admin/cases', { replace: true });
  };

  const handleStatusChange = async (caseItem: Case, newStatus: 'active' | 'pending' | 'closed') => {
    const result = await api.cases.updateCaseStatus(caseItem.id, newStatus);
    if (result.success) {
      toast({
        title: 'Status Updated',
        description: `Case "${caseItem.title}" status changed to ${newStatus}.`,
      });
      // Update local state
      setCases(cases.map(c => 
        c.id === caseItem.id ? { ...c, status: newStatus } : c
      ));
    } else {
      toast({
        title: 'Error',
        description: result.message || 'Failed to update case status',
        variant: 'destructive',
      });
    }
  };

  const handleViewDocuments = (caseItem: Case) => {
    if (caseItem.documents.length === 0) {
      toast({
        title: 'No Documents',
        description: `No documents have been uploaded for case "${caseItem.title}".`,
      });
    } else {
      navigate('/admin/documents', { 
        state: { caseId: caseItem.id, caseTitle: caseItem.title } 
      });
    }
  };

  const filteredCases = cases
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseType.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Cases</h1>
            <p className="text-muted-foreground">Manage all legal cases</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="gold" onClick={() => setNewCaseOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Case
            </Button>
          </div>
        </div>

        {/* Client filter indicator */}
        {clientFilter && clientName && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="py-1.5 px-3 text-sm">
              <User className="h-3.5 w-3.5 mr-1.5" />
              Showing cases for: <span className="font-semibold ml-1">{clientName}</span>
            </Badge>
            <Button variant="ghost" size="sm" onClick={clearClientFilter}>
              <X className="h-4 w-4 mr-1" /> Clear filter
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          {(['all', 'active', 'pending', 'closed'] as const).map(status => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredCases.length > 0 ? (
                  filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.title}</TableCell>
                      <TableCell>{caseItem.caseType}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            caseItem.status === 'active' && 'border-success text-success',
                            caseItem.status === 'pending' && 'border-warning text-warning',
                            caseItem.status === 'closed' && 'border-muted-foreground text-muted-foreground'
                          )}
                        >
                          {caseItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(caseItem.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(caseItem.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1"
                          onClick={() => handleViewDocuments(caseItem)}
                        >
                          {caseItem.documents.length} {caseItem.documents.length === 1 ? 'doc' : 'docs'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast({ title: 'Coming Soon', description: 'Case details view will be available soon.' })}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDocuments(caseItem)}>
                              <FileText className="h-4 w-4 mr-2" /> Documents
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/admin/messages', { 
                              state: { clientId: caseItem.clientId, clientName: caseItem.clientName } 
                            })}>
                              <MessageSquare className="h-4 w-4 mr-2" /> Message Client
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Change Status</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(caseItem, 'active')}
                              disabled={caseItem.status === 'active'}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-success" /> Set Active
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(caseItem, 'pending')}
                              disabled={caseItem.status === 'pending'}
                            >
                              <Clock className="h-4 w-4 mr-2 text-warning" /> Set Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(caseItem, 'closed')}
                              disabled={caseItem.status === 'closed'}
                            >
                              <XCircle className="h-4 w-4 mr-2 text-muted-foreground" /> Set Closed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {clientFilter ? `No cases found for ${clientName}` : 'No cases found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <NewCaseModal 
        open={newCaseOpen} 
        onOpenChange={setNewCaseOpen}
        onSuccess={loadCases}
      />
    </AdminLayout>
  );
}

