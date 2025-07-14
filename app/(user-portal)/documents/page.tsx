'use client';

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, FileText, Edit, Trash2, Eye, Copy, MoreVertical, Calendar, Tag, Type, Folder } from 'lucide-react';
import DocumentForm from '@/components/documents/DocumentForm';

interface Document {
  _id: string;
  title: string;
  description?: string;
  content: string;
  type: 'cv' | 'resume' | 'personal_statement' | 'essay' | 'cover_letter' | 'recommendation' | 'transcript' | 'certificate' | 'other';
  category: 'academic' | 'professional' | 'personal' | 'certification' | 'other';
  tags: string[];
  version: number;
  isPublic: boolean;
  language: string;
  metadata?: {
    wordCount?: number;
    characterCount?: number;
    lastEdited?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const documentTypes = [
    { value: '', label: 'All Types' },
    { value: 'cv', label: 'CV/Resume' },
    { value: 'personal_statement', label: 'Personal Statement' },
    { value: 'essay', label: 'Essay' },
    { value: 'cover_letter', label: 'Cover Letter' },
    { value: 'recommendation', label: 'Recommendation' },
    { value: 'transcript', label: 'Transcript' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'other', label: 'Other' }
  ];

  const documentCategories = [
    { value: '', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'professional', label: 'Professional' },
    { value: 'personal', label: 'Personal' },
    { value: 'certification', label: 'Certification' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, selectedType, selectedCategory]);

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedType) params.append('type', selectedType);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/documents?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
=======
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Edit, Trash2, Eye, Copy, Download } from 'lucide-react';
import { DocumentType, DOCUMENT_TYPE_CONFIG, Document } from '@/types/documents';
import CreateDocumentDialog from '@/components/documents/CreateDocumentDialog';
import DocumentCard from '@/components/documents/DocumentCard';
import { toast } from 'sonner';



export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
>>>>>>> main
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cv':
      case 'resume':
        return <FileText className="h-4 w-4" />;
      case 'personal_statement':
        return <FileText className="h-4 w-4" />;
      case 'essay':
        return <FileText className="h-4 w-4" />;
      case 'cover_letter':
        return <FileText className="h-4 w-4" />;
      case 'recommendation':
        return <FileText className="h-4 w-4" />;
      case 'transcript':
        return <FileText className="h-4 w-4" />;
      case 'certificate':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = documentTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getCategoryLabel = (category: string) => {
    const categoryObj = documentCategories.find(c => c.value === category);
    return categoryObj ? categoryObj.label : category;
=======
  useEffect(() => {
    if (session?.user) {
      fetchDocuments();
    }
  }, [session]);

  // Group documents by category
  const documentsByCategory = documents.reduce((acc, doc) => {
    const category = DOCUMENT_TYPE_CONFIG[doc.type]?.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  // Get all categories
  const categories = Object.keys(documentsByCategory);
  if (categories.length === 0) {
    categories.push('personal', 'professional', 'academic', 'experience', 'reference');
  }

  const handleDocumentCreated = () => {
    setCreateDialogOpen(false);
    fetchDocuments();
    toast.success('Document created successfully');
  };

  const handleDocumentDeleted = (documentId: string) => {
    setDocuments(docs => docs.filter(doc => doc._id !== documentId));
    toast.success('Document deleted successfully');
  };

  const handleDocumentUpdated = (updatedDocument: Document) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc._id === updatedDocument._id ? updatedDocument : doc
      )
    );
    toast.success('Document updated successfully');
>>>>>>> main
  };

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
=======
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
>>>>>>> main
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <TooltipProvider>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Documents</h1>
            <p className="text-gray-600 mt-1">Manage and organize your documents</p>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Document</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Create a new document with comprehensive content and metadata.
                </DialogDescription>
              </DialogHeader>
              <DocumentForm 
                mode="create"
                initialData={{}}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedType || selectedCategory 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first document.'
                }
              </p>
              {!searchTerm && !selectedType && !selectedCategory && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.filter(Boolean).map((document) => (
              <Card key={document._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getTypeIcon(document.type)}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{document.title || 'Untitled Document'}</CardTitle>
                        <CardDescription className="truncate">
                          {document.description || 'No description'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">
                        v{document.version || 1}
                      </Badge>
                      {document.isPublic && (
                        <Badge variant="secondary" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>{document.metadata?.wordCount || 0} words</span>
                      <span>{document.metadata?.characterCount || 0} chars</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(document.metadata?.lastEdited || document.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Type and Category */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Type className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{getTypeLabel(document.type || 'other')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Folder className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{getCategoryLabel(document.category || 'other')}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {document.tags && document.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-3 w-3 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {document.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {document.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{document.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDocument(document);
                              setShowCreateModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit document</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/documents/${document._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View document</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(document._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete document</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {selectedDocument && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Document</DialogTitle>
                <DialogDescription>
                  Update your document content and metadata.
                </DialogDescription>
              </DialogHeader>
              <DocumentForm 
                mode="edit"
                documentId={selectedDocument._id}
                initialData={{
                  title: selectedDocument.title,
                  description: selectedDocument.description,
                  content: selectedDocument.content,
                  type: selectedDocument.type,
                  category: selectedDocument.category,
                  tags: selectedDocument.tags,
                  language: selectedDocument.language,
                  isPublic: selectedDocument.isPublic
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
=======
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your academic and professional documents
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Documents</p>
                <p className="text-2xl font-bold">
                  {documents.filter(doc => doc.isActive).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Words</p>
                <p className="text-2xl font-bold">
                  {documents.reduce((sum, doc) => sum + (doc.wordCount || 0), 0).toLocaleString()}
                </p>
              </div>
              <Edit className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Copy className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents by Category */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="reference">Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first document to get started
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            categories.map(category => (
              <div key={category} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold capitalize">{category} Documents</h2>
                  <Badge variant="secondary">
                    {documentsByCategory[category]?.length || 0} documents
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentsByCategory[category]?.map(document => (
                    <DocumentCard
                      key={document._id}
                      document={document}
                      onDelete={handleDocumentDeleted}
                      onUpdate={handleDocumentUpdated}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            {documentsByCategory[category]?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No {category} documents</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first {category} document
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Document
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentsByCategory[category]?.map(document => (
                  <DocumentCard
                    key={document._id}
                    document={document}
                    onDelete={handleDocumentDeleted}
                    onUpdate={handleDocumentUpdated}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Document Dialog */}
      <CreateDocumentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onDocumentCreated={handleDocumentCreated}
      />
    </div>
>>>>>>> main
  );
}