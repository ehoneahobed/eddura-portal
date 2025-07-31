'use client';

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
import DocumentErrorBoundary from '@/components/documents/DocumentErrorBoundary';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');


  // Fetch documents
  const fetchDocuments = async () => {
    try {
      console.log('Fetching documents...');
      const response = await fetch('/api/documents');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Documents API response:', data);
        setDocuments(data.documents || []);
      } else {
        const errorData = await response.json();
        console.error('Documents API error:', errorData);
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

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
    categories.push('personal', 'professional', 'academic', 'experience', 'reference', 'upload');
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
  };



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DocumentErrorBoundary
      onRetry={fetchDocuments}
      onCreateNew={() => setCreateDialogOpen(true)}
    >
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="reference">Reference</TabsTrigger>
          <TabsTrigger value="upload">Uploads</TabsTrigger>
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
    </DocumentErrorBoundary>
  );
}