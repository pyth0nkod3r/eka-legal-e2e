import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, ChevronRight, FileText, Clock, Filter } from 'lucide-react';
import { api } from '@/services/api';
import { Case } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'closed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.cases.getMyCases().then(res => {
      if (res.success) setCases(res.data);
      setLoading(false);
    });
  }, []);

  const filteredCases = filter === 'all' ? cases : cases.filter(c => c.status === filter);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">My Cases</h1>
          <p className="text-muted-foreground">Track and manage your legal matters</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'pending', 'closed'] as const).map(status => (
            <Button key={status} variant={filter === status ? 'default' : 'outline'} size="sm" onClick={() => setFilter(status)} className="capitalize">
              {status}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6 h-32 bg-muted" /></Card>)}
        </div>
      ) : filteredCases.length > 0 ? (
        <div className="space-y-4">
          {filteredCases.map(caseItem => (
            <Link key={caseItem.id} to={`/dashboard/cases/${caseItem.id}`}>
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-foreground">{caseItem.title}</h3>
                          <Badge variant="outline" className={cn(
                            caseItem.status === 'active' && 'border-success text-success',
                            caseItem.status === 'pending' && 'border-warning text-warning',
                            caseItem.status === 'closed' && 'border-muted-foreground text-muted-foreground'
                          )}>
                            {caseItem.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{caseItem.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Opened {new Date(caseItem.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {caseItem.documents.length} documents</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No cases found</h3>
            <p className="text-muted-foreground mb-4">You don't have any {filter !== 'all' && filter} cases yet.</p>
            <Link to="/book"><Button variant="gold">Book a Consultation</Button></Link>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
