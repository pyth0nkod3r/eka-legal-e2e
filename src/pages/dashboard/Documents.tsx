import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Image, File, X, Download, Eye, FolderOpen } from 'lucide-react';
import { api } from '@/services/api';
import { Case, Document } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Documents() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    api.cases.getMyCases().then(res => {
      if (res.success) setCases(res.data);
    });
  }, []);

  const allDocuments = cases.flatMap(c => c.documents.map(d => ({ ...d, caseName: c.title, caseId: c.id })));
  const filteredDocuments = selectedCase === 'all' ? allDocuments : allDocuments.filter(d => d.caseId === selectedCase);

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return Image;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  }, []);

  const handleUpload = async (files: FileList) => {
    if (selectedCase === 'all') {
      toast({ title: 'Select a case', description: 'Please select a specific case to upload documents.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    for (const file of Array.from(files)) {
      await api.documents.uploadDocument(selectedCase, file);
    }

    clearInterval(interval);
    setUploadProgress(100);
    
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
      toast({ title: 'Upload complete', description: `${files.length} file(s) uploaded successfully.` });
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">Manage and upload case-related documents</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={selectedCase === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCase('all')}>All Cases</Button>
          {cases.map(c => (
            <Button key={c.id} variant={selectedCase === c.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCase(c.id)} className="truncate max-w-40">
              {c.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive ? "border-accent bg-accent/5" : "border-border",
              uploading && "pointer-events-none opacity-50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Drag and drop files here</h3>
            <p className="text-sm text-muted-foreground mb-4">or click to browse from your computer</p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild className="cursor-pointer">
                <span>Choose Files</span>
              </Button>
            </label>
            {selectedCase === 'all' && <p className="text-xs text-muted-foreground mt-4">Select a specific case above to upload documents</p>}
          </div>
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length > 0 ? (
            <div className="space-y-3">
              {filteredDocuments.map(doc => {
                const FileIcon = getFileIcon(doc.type);
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{doc.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          {selectedCase === 'all' && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1"><FolderOpen className="h-3 w-3" /> {doc.caseName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No documents yet</h3>
              <p>Upload your first document using the area above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
