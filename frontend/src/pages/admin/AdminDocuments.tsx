import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MoreVertical, Eye, Download, Trash2, Upload, File, FileText, Image } from 'lucide-react';
import { api } from '@/services/api';
import { Case, Document } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminDocuments() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we got case context from navigation state
    const state = location.state as { caseId?: string; caseTitle?: string } | null;
    if (state?.caseId) {
      const caseTitle = state.caseTitle || `Case ${state.caseId}`;
      toast({
        title: 'Filtered by Case',
        description: `Showing documents for: ${caseTitle}`,
      });
    }

    api.cases.getMyCases().then(res => {
      if (res.success) setCases(res.data);
      setLoading(false);
    });
  }, [location.state]);

  // Flatten all documents from all cases
  const allDocuments = cases.flatMap(c =>
    c.documents.map(doc => ({
      ...doc,
      caseTitle: c.title,
      caseId: c.id,
    }))
  );

  // Filter by case ID if provided in route state, and also by search query
  const state = location.state as { caseId?: string } | null;
  const filteredDocuments = allDocuments
    .filter(doc => !state?.caseId || doc.caseId === state.caseId)
    .filter(doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.caseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return Image;
    if (type.includes('pdf')) return FileText;
    return File;
  };

  const loadCases = () => {
    setLoading(true);
    api.cases.getMyCases().then(res => {
      if (res.success) setCases(res.data);
      setLoading(false);
    });
  };

  const handleUpload = async () => {
    if (!selectedCaseId || !selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a case and file',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const res = await api.documents.uploadDocument(selectedCaseId, selectedFile, selectedTag || undefined);
    setUploading(false);

    if (res.success) {
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      setUploadModalOpen(false);
      setSelectedFile(null);
      setSelectedCaseId('');
      setSelectedTag('');
      setFilePreviewUrl(null);
      loadCases();
    } else {
      toast({
        title: 'Error',
        description: res.message || 'Failed to upload document',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (doc: Document & { caseTitle: string; caseId: string }) => {
    // Open document URL in new tab
    window.open(doc.url, '_blank');
    toast({
      title: 'Download Started',
      description: `Downloading ${doc.name}`,
    });
  };

  const handleDelete = async (doc: Document & { caseTitle: string; caseId: string }) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      return;
    }

    const res = await api.documents.deleteDocument(doc.id);
    if (res.success) {
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      loadCases();
    } else {
      toast({
        title: 'Error',
        description: res.message || 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handlePreview = (doc: Document & { caseTitle: string; caseId: string }) => {
    // Use the API endpoint for document content
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    window.open(`${baseUrl}/documents/${doc.id}/content?token=${token}`, '_blank');
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      // Create preview URL for image files
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      } else {
        setFilePreviewUrl(null);
      }
    } else {
      setFilePreviewUrl(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground">Manage all case documents</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="gold" onClick={() => setUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" /> Upload
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{allDocuments.length}</div>
              <div className="text-sm text-muted-foreground">Total Documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{cases.length}</div>
              <div className="text-sm text-muted-foreground">Cases with Documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {formatFileSize(allDocuments.reduce((sum, doc) => sum + doc.size, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Storage Used</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Uploaded By</TableHead>
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
                ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => {
                    const FileIcon = getFileIcon(doc.type);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded bg-muted flex items-center justify-center">
                              <FileIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <span className="font-medium">{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{doc.caseTitle}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.type.split('/')[1]?.toUpperCase() || doc.type}</Badge>
                        </TableCell>
                        <TableCell>{formatFileSize(doc.size)}</TableCell>
                        <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePreview(doc)}>
                                <Eye className="h-4 w-4 mr-2" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4 mr-2" /> Download
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No documents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={(open) => {
        setUploadModalOpen(open);
        if (!open) {
          setSelectedFile(null);
          setSelectedTag('');
          setFilePreviewUrl(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Case</Label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Document Tag (Optional)</Label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="evidence">Evidence</SelectItem>
                  <SelectItem value="correspondence">Correspondence</SelectItem>
                  <SelectItem value="court-filing">Court Filing</SelectItem>
                  <SelectItem value="identification">Identification</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              />
              {selectedFile && (
                <div className="mt-2 p-3 border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB | Type: {selectedFile.type || 'Unknown'}
                  </p>
                  {/* File Preview */}
                  {filePreviewUrl && selectedFile.type.startsWith('image/') && (
                    <div className="mt-2">
                      <img
                        src={filePreviewUrl}
                        alt="Preview"
                        className="max-h-48 rounded border"
                      />
                    </div>
                  )}
                  {selectedFile.type === 'application/pdf' && (
                    <div className="mt-2 p-2 bg-muted rounded text-center text-sm text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-1" />
                      PDF Preview not available - will be uploaded
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleUpload} disabled={uploading || !selectedCaseId || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
