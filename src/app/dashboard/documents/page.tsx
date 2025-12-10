'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  MagnifyingGlass,
  Funnel,
  DotsThree,
  File,
  FilePdf,
  FileImage,
  FileDoc,
  Upload,
  Download,
  Eye,
  Robot,
  Trash,
  SpinnerGap,
  CloudArrowUp,
  X,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Tables, Enums } from '@/types/database';

type Document = Tables<'documents'> & {
  client?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
  } | null;
  policy?: {
    id: string;
    policy_number: string;
  } | null;
};

type Client = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  type: Enums<'client_type'>;
};

type Policy = {
  id: string;
  policy_number: string;
};

const documentTypes: Enums<'document_type'>[] = [
  'id_card',
  'dec_page',
  'application',
  'endorsement',
  'cancellation',
  'invoice',
  'claim',
  'other',
];

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return <File className="h-5 w-5 text-gray-500" />;
  if (mimeType.includes('pdf')) return <FilePdf className="h-5 w-5 text-red-500" />;
  if (mimeType.includes('image')) return <FileImage className="h-5 w-5 text-blue-500" />;
  if (mimeType.includes('word') || mimeType.includes('doc'))
    return <FileDoc className="h-5 w-5 text-blue-600" />;
  return <File className="h-5 w-5 text-gray-500" />;
};

const aiStatusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  processing: 'secondary',
  pending: 'outline',
  failed: 'destructive',
};

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [policies, setPolicies] = React.useState<Policy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [deleteDocumentId, setDeleteDocumentId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Upload form state
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploadClientId, setUploadClientId] = React.useState<string>('');
  const [uploadPolicyId, setUploadPolicyId] = React.useState<string>('');
  const [uploadDocumentType, setUploadDocumentType] = React.useState<Enums<'document_type'>>('other');
  const [dragActive, setDragActive] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch documents
  const fetchDocuments = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '100');

      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Fetch clients for dropdown
  const fetchClients = React.useCallback(async () => {
    try {
      const response = await fetch('/api/clients?limit=100');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, []);

  // Fetch policies for dropdown
  const fetchPolicies = React.useCallback(async () => {
    try {
      const response = await fetch('/api/policies?limit=100');
      if (!response.ok) throw new Error('Failed to fetch policies');
      const data = await response.json();
      setPolicies(data.policies || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  React.useEffect(() => {
    if (isUploadOpen) {
      fetchClients();
      fetchPolicies();
    }
  }, [isUploadOpen, fetchClients, fetchPolicies]);

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    const total = documents.length;
    const processed = documents.filter(d => d.ai_processing_status === 'completed').length;
    const pending = documents.filter(d => d.ai_processing_status === 'pending' || d.ai_processing_status === 'processing').length;
    const failed = documents.filter(d => d.ai_processing_status === 'failed').length;
    return { total, processed, pending, failed };
  }, [documents]);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const getClientName = (doc: Document) => {
    if (!doc.client) return '—';
    if (doc.client.business_name) return doc.client.business_name;
    return `${doc.client.first_name || ''} ${doc.client.last_name || ''}`.trim() || '—';
  };

  const getClientDisplayName = (client: Client) => {
    if (client.business_name) return client.business_name;
    return `${client.first_name || ''} ${client.last_name || ''}`.trim();
  };

  // Handle file drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('documentType', uploadDocumentType);
      if (uploadClientId) formData.append('clientId', uploadClientId);
      if (uploadPolicyId) formData.append('policyId', uploadPolicyId);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      // Reset form and close dialog
      setUploadFile(null);
      setUploadClientId('');
      setUploadPolicyId('');
      setUploadDocumentType('other');
      setIsUploadOpen(false);

      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(error instanceof Error ? error.message : t('upload.error'));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDocumentId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${deleteDocumentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');

      setDeleteDocumentId(null);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <SpinnerGap className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              {t('uploadDocument')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('upload.title')}</DialogTitle>
              <DialogDescription>{t('upload.description')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : uploadFile
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-3">
                    {getFileIcon(uploadFile.type)}
                    <span className="font-medium">{uploadFile.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <CloudArrowUp className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('upload.dropzone')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('upload.formats')}
                    </p>
                  </>
                )}
              </div>

              {/* Document Type */}
              <div className="grid gap-2">
                <Label htmlFor="documentType">{t('upload.documentType')}</Label>
                <Select
                  value={uploadDocumentType}
                  onValueChange={(value) => setUploadDocumentType(value as Enums<'document_type'>)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`type.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Client Selection */}
              <div className="grid gap-2">
                <Label htmlFor="client">{t('upload.selectClient')}</Label>
                <Select value={uploadClientId} onValueChange={setUploadClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {getClientDisplayName(client)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Policy Selection */}
              <div className="grid gap-2">
                <Label htmlFor="policy">{t('upload.selectPolicy')}</Label>
                <Select value={uploadPolicyId} onValueChange={setUploadPolicyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.map((policy) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.policy_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
                disabled={isUploading}
              >
                {t('delete.cancel')}
              </Button>
              <Button onClick={handleUpload} disabled={!uploadFile || isUploading}>
                {isUploading ? (
                  <>
                    <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                    {t('upload.uploading')}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t('uploadDocument')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">{t('stats.total')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
            <p className="text-sm text-muted-foreground">{t('stats.processed')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">{t('stats.pending')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-sm text-muted-foreground">{t('stats.failed')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Funnel className="mr-2 h-4 w-4" />
              {t('filter')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allDocuments')}</CardTitle>
          <CardDescription>
            {t('totalDocuments', { count: documents.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <File className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t('empty.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('empty.description')}
              </p>
              <Button className="mt-4" onClick={() => setIsUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                {t('uploadDocument')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.client')}</TableHead>
                  <TableHead>{t('table.policy')}</TableHead>
                  <TableHead>{t('table.type')}</TableHead>
                  <TableHead>{t('table.size')}</TableHead>
                  <TableHead>{t('table.aiStatus')}</TableHead>
                  <TableHead>{t('table.uploaded')}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.mime_type)}
                        <span className="font-medium truncate max-w-[200px]">
                          {doc.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getClientName(doc)}</TableCell>
                    <TableCell>
                      {doc.policy?.policy_number ? (
                        <span className="font-mono text-sm">{doc.policy.policy_number}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`type.${doc.type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFileSize(doc.file_size)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={aiStatusColors[doc.ai_processing_status || 'pending']}
                        className="gap-1"
                      >
                        <Robot className="h-3 w-3" />
                        {t(`aiStatus.${doc.ai_processing_status || 'pending'}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(doc.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <DotsThree className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('actions.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            {t('actions.download')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Robot className="mr-2 h-4 w-4" />
                            {t('actions.reprocess')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteDocumentId(doc.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            {t('actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDocumentId} onOpenChange={() => setDeleteDocumentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('delete.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash className="mr-2 h-4 w-4" />
              )}
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
