import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    FileText,
    MessageSquare,
    Calendar,
    User,
    Clock,
    Download,
    Eye,
} from 'lucide-react';
import { Case } from '@/types';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router';

interface CaseDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    caseId: string | null;
}

export default function CaseDetailModal({ open, onOpenChange, caseId }: CaseDetailModalProps) {
    const [caseData, setCaseData] = useState<Case | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (open && caseId) {
            setLoading(true);
            api.cases.getCaseById(caseId).then((res) => {
                if (res.success) {
                    setCaseData(res.data);
                }
                setLoading(false);
            });
        }
    }, [open, caseId]);

    if (!caseData && !loading) return null;

    const statusColors = {
        active: 'border-success text-success',
        pending: 'border-warning text-warning',
        closed: 'border-muted-foreground text-muted-foreground',
    };

    const handleMessageClient = () => {
        onOpenChange(false);
        navigate('/admin/messages', {
            state: { clientId: caseData?.clientId }
        });
    };

    const handleViewDocuments = () => {
        onOpenChange(false);
        navigate('/admin/documents', {
            state: { caseId: caseData?.id, caseTitle: caseData?.title }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Case Details</DialogTitle>
                    <DialogDescription>
                        Comprehensive overview of case information and activity
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Loading case details...
                    </div>
                ) : caseData ? (
                    <ScrollArea className="max-h-[70vh]">
                        <div className="space-y-6 pr-4">
                            {/* Case Header */}
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-serif text-xl font-bold">{caseData.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{caseData.caseType}</p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn(statusColors[caseData.status as keyof typeof statusColors])}
                                    >
                                        {caseData.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{caseData.description}</p>
                            </div>

                            <Separator />

                            {/* Client Info */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Client Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Client ID:</span>
                                        <span className="font-medium">{caseData.clientId}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={handleMessageClient}
                                    >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Message Client
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Timeline */}
                            {caseData.timeline && caseData.timeline.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Recent Activity
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {caseData.timeline.slice(0, 5).map((event, index) => (
                                                <div key={index} className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                                                        {index < caseData.timeline.length - 1 && (
                                                            <div className="w-px h-full bg-border mt-1" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-3">
                                                        <p className="text-sm font-medium">{event.event}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(event.date).toLocaleDateString()} at{' '}
                                                            {new Date(event.date).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Documents */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Documents ({caseData.documents?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {caseData.documents && caseData.documents.length > 0 ? (
                                        <div className="space-y-2">
                                            {caseData.documents.slice(0, 3).map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                        <span className="text-sm truncate">{doc.name}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <Download className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {caseData.documents.length > 3 && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={handleViewDocuments}
                                                >
                                                    View all {caseData.documents.length} documents →
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No documents uploaded yet
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Dates */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Important Dates
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span className="font-medium">
                                            {new Date(caseData.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Updated:</span>
                                        <span className="font-medium">
                                            {new Date(caseData.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
