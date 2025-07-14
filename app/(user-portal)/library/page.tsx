'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye,
  Copy,
  Star,
  Download,
  Calendar,
  Loader2,
  BookOpen,
  FileText,
  GraduationCap,
  Award,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import AdvancedSearchFilters from '@/components/library/AdvancedSearchFilters';

interface LibraryDocument {
  _id: string;
  title: string;
  type: string;
  description: string;
  category: string;
  subcategory?: string;
  content: string;
  wordCount: number;
  characterCount: number;
  targetAudience: string;
  tags: string[];
  viewCount: number;
  cloneCount: number;
  averageRating: number;
  ratingCount: number;
  author?: string;
  source?: string;
  publishedAt?: string;
  createdAt: string;
}

export default function LibraryPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [targetAudienceFilter, setTargetAudienceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedDocument, setSelectedDocument] = useState<LibraryDocument | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState<boolean>(false);
  const [isCloning, setIsCloning] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchDocuments();
  }, [pagination.page, categoryFilter, typeFilter, targetAudienceFilter, sortBy]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(targetAudienceFilter !== 'all' && { targetAudience: targetAudienceFilter }),
        sortBy,
      });

      const response = await fetch(`/api/library/documents?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setPagination(data.pagination || pagination);
      } else {
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDocuments();
  };

  const handleCloneDocument = async (documentId: string) => {
    setIsCloning(documentId);
    try {
      const response = await fetch(`/api/library/documents/${documentId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Document cloned successfully! You can find it in your Documents section.');
        // Update the clone count in the UI
        setDocuments(docs => 
          docs.map(doc => 
            doc._id === documentId 
              ? { ...doc, cloneCount: doc.cloneCount + 1 }
              : doc
          )
        );
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to clone document');
      }
    } catch (error) {
      console.error('Error cloning document:', error);
      toast.error('Failed to clone document');
    } finally {
      setIsCloning(undefined);
    }
  };

  const handleRateDocument = async (documentId: string, rating: number) => {
    try {
      const response = await fetch(`/api/library/documents/${documentId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Rating submitted successfully!');
        // Update the rating in the UI
        setDocuments(docs => 
          docs.map(doc => 
            doc._id === documentId 
              ? { 
                  ...doc, 
                  averageRating: data.averageRating,
                  ratingCount: data.ratingCount
                }
              : doc
          )
        );
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error rating document:', error);
      toast.error('Failed to submit rating');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal':
        return <Users className="h-4 w-4" />;
      case 'professional':
        return <FileText className="h-4 w-4" />;
      case 'academic':
        return <GraduationCap className="h-4 w-4" />;
      case 'experience':
        return <Clock className="h-4 w-4" />;
      case 'reference':
        return <Award className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-green-100 text-green-800';
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      case 'experience':
        return 'bg-orange-100 text-orange-800';
      case 'reference':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Library</h1>
          <p className="text-muted-foreground">
            Browse and clone high-quality academic documents for your applications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Viewed</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.length > 0 ? Math.max(...documents.map(d => d.viewCount)) : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Cloned</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.length > 0 ? Math.max(...documents.map(d => d.cloneCount)) : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.length > 0 
                ? (documents.reduce((sum, d) => sum + d.averageRating, 0) / documents.length).toFixed(1)
                : '0.0'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Search Filters */}
      <AdvancedSearchFilters
        onFiltersChange={(filters) => {
          setSearchTerm(filters.searchTerm);
          setCategoryFilter(filters.documentType.length > 0 ? filters.documentType[0] : 'all');
          setTypeFilter(filters.documentType.length > 0 ? filters.documentType[0] : 'all');
          setTargetAudienceFilter(filters.targetAudience.length > 0 ? filters.targetAudience[0] : 'all');
          setSortBy(filters.sortBy);
        }}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {/* Documents Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <Card key={document._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{document.title}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getCategoryColor(document.category)}>
                          {getCategoryIcon(document.category)}
                          <span className="ml-1">{document.category}</span>
                        </Badge>
                        <Badge variant="outline">{document.type.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {truncateText(document.description, 120)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{document.viewCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Copy className="h-3 w-3" />
                          <span>{document.cloneCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{document.averageRating.toFixed(1)} ({document.ratingCount})</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {document.tags && document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {document.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {document.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{document.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDocument(document);
                          setIsPreviewDialogOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCloneDocument(document._id)}
                        disabled={isCloning === document._id}
                        className="flex-1"
                      >
                        {isCloning === document._id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Clone
                      </Button>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRateDocument(document._id, star)}
                          className="text-gray-300 hover:text-yellow-400 transition-colors"
                        >
                          <Star 
                            className={`h-4 w-4 ${
                              star <= document.averageRating ? 'text-yellow-400 fill-current' : ''
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDocument && (
              <>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Published: {formatDate(selectedDocument.publishedAt || selectedDocument.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{selectedDocument.wordCount} words</span>
                  </div>
                  {selectedDocument.author && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>By: {selectedDocument.author}</span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {selectedDocument.content}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => selectedDocument && handleCloneDocument(selectedDocument._id)}
              disabled={!!(selectedDocument && isCloning === selectedDocument._id)}
            >
              {selectedDocument && isCloning === selectedDocument._id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Clone Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 