import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, FileText, Calendar, MessageSquare, Upload, Clock, CheckCircle, AlertCircle, File } from 'lucide-react';
import { api } from '@/services/api';
import { Case, Document, TimelineEvent } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
  active: { label: 'Active', variant: 'default' as const, icon: AlertCircle },
  closed: { label: 'Closed', variant: 'outline' as const, icon: CheckCircle },
};

const timelineIcons = {
  note: MessageSquare,
  document: FileText,
  status: AlertCircle,
  meeting: Calendar,
};

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseId) {
      api.cases.getCaseById(caseId).then(res => {
        if (res.success && res.data) {
          setCaseData(res.data);
        }
        setLoading(false);
      });
    }
  }, [caseId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!caseData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Case Not Found</h2>
          <p className="text-muted-foreground mb-6">The case you're looking for doesn't exist or you don't have access.</p>
          <Link to="/dashboard/cases">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Cases
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const StatusIcon = statusConfig[caseData.status].icon;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to="/dashboard/cases" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center mb-2">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Cases
            </Link>
            <h1 className="font-serif text-2xl font-bold text-foreground">{caseData.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">Case ID: {caseData.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusConfig[caseData.status].variant} className="h-8 px-3">
              <StatusIcon className="h-4 w-4 mr-1" />
              {statusConfig[caseData.status].label}
            </Badge>
            <Link to={`/dashboard/messages`}>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" /> Message Attorney
              </Button>
            </Link>
          </div>
        </div>

        {/* Case Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Case Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Case Type</div>
              <div className="font-medium">{caseData.caseType}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Opened</div>
              <div className="font-medium">{formatDate(caseData.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="font-medium">{formatDate(caseData.updatedAt)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Documents</div>
              <div className="font-medium">{caseData.documents.length} files</div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{caseData.description}</p>
          </CardContent>
        </Card>

        {/* Tabs for Timeline and Documents */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents ({caseData.documents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Case Timeline</CardTitle>
                <CardDescription>Activity and updates on your case</CardDescription>
              </CardHeader>
              <CardContent>
                {caseData.timeline.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No timeline events yet.</p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-6">
                      {caseData.timeline.map((event, index) => {
                        const Icon = timelineIcons[event.type];
                        return (
                          <div key={event.id} className="relative flex gap-4 pl-10">
                            <div className={cn(
                              "absolute left-2 w-5 h-5 rounded-full flex items-center justify-center",
                              index === 0 ? "bg-accent text-accent-foreground" : "bg-muted"
                            )}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <div className="flex-1 bg-muted/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-foreground">{event.title}</h4>
                                <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Files related to your case</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" /> Upload
                </Button>
              </CardHeader>
              <CardContent>
                {caseData.documents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No documents uploaded yet.</p>
                ) : (
                  <div className="divide-y">
                    {caseData.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <File className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{doc.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(doc.size)} • Uploaded {formatDate(doc.uploadedAt)}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
