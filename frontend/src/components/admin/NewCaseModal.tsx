import { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { User } from '@/types';
import { Upload, X, File } from 'lucide-react';

interface NewCaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface DocumentUpload {
    file: File;
    tag: string;
}

const caseTypes = [
    'Corporate Law',
    'Estate Planning',
    'Civil Litigation',
    'Contract Law',
    'Business Formation',
    'Intellectual Property',
    'Personal Injury',
    'Immigration',
];

export default function NewCaseModal({ open, onOpenChange, onSuccess }: NewCaseModalProps) {
    const [clientId, setClientId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [caseType, setCaseType] = useState('');
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingClients, setLoadingClients] = useState(true);
    const [documents, setDocuments] = useState<DocumentUpload[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            api.clients.getAll().then((res) => {
                if (res.success) {
                    setClients(res.data);
                }
                setLoadingClients(false);
            });
        }
    }, [open]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newDocs: DocumentUpload[] = Array.from(files).map(file => ({
                file,
                tag: '',
            }));
            setDocuments([...documents, ...newDocs]);
        }
        // Reset input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    const updateDocumentTag = (index: number, tag: string) => {
        setDocuments(documents.map((doc, i) => 
            i === index ? { ...doc, tag } : doc
        ));
    };

    const resetForm = () => {
        setClientId('');
        setTitle('');
        setDescription('');
        setCaseType('');
        setDocuments([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // First, create the case
        const result = await api.cases.createCase({
            clientId,
            title,
            description,
            caseType,
        });

        if (result.success && result.data?.id) {
            // Then upload documents if any
            let uploadSuccess = true;
            for (const doc of documents) {
                const uploadResult = await api.documents.uploadDocument(result.data.id, doc.file, doc.tag);
                if (!uploadResult.success) {
                    uploadSuccess = false;
                    toast({
                        title: 'Document Upload Warning',
                        description: `Failed to upload ${doc.file.name}. You can upload it later.`,
                        variant: 'destructive',
                    });
                }
            }

            toast({
                title: 'Success',
                description: documents.length > 0
                    ? `Case created with ${documents.length} document(s)!`
                    : 'Case created successfully!',
            });
            resetForm();
            onOpenChange(false);
            onSuccess?.();
        } else {
            toast({ title: 'Error', description: result.message || 'Failed to create case', variant: 'destructive' });
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Case</DialogTitle>
                    <DialogDescription>
                        Open a new case for a client. You can also upload initial documents.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="client">Client</Label>
                            <Select value={clientId} onValueChange={setClientId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingClients ? 'Loading clients...' : 'Select a client'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name} ({client.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Case Title</Label>
                            <Input
                                id="title"
                                placeholder="Business Contract Review"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="caseType">Case Type</Label>
                            <Select value={caseType} onValueChange={setCaseType} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select case type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {caseTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of the case..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                required
                            />
                        </div>

                        {/* Document Upload Section */}
                        <div className="grid gap-2">
                            <Label>Documents (Optional)</Label>
                            <div 
                                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Click to upload documents
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                />
                            </div>

                            {/* Document List */}
                            {documents.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    {documents.map((doc, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                            <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{doc.file.name}</p>
                                                <Input
                                                    placeholder="Add tag (e.g., contract, agreement)"
                                                    value={doc.tag}
                                                    onChange={(e) => updateDocumentTag(index, e.target.value)}
                                                    className="mt-1 h-7 text-xs"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 flex-shrink-0"
                                                onClick={() => removeDocument(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="gold" disabled={loading || !clientId}>
                            {loading ? 'Creating...' : 'Create Case'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

