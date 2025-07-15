'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Filter, 
  Eye,
  Copy,
  Star,
  Calendar,
  Loader2,
  BookOpen,
  FileText,
  GraduationCap,
  Award,
  Users,
  Clock,
  Check,
  ExternalLink,
  Download,
  FileDown
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
  isCloned?: boolean;
}

export default function LibraryPage() {
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
  const [userStats, setUserStats] = useState({
    totalCloned: 0,
    recentlyCloned: 0,
    favoriteCategory: '',
    totalRated: 0
  });

  const fetchDocuments = useCallback(async () => {
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
        setUserStats(data.userStats || {
          totalCloned: 0,
          recentlyCloned: 0,
          favoriteCategory: '',
          totalRated: 0
        });
      } else {
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, categoryFilter, typeFilter, targetAudienceFilter, sortBy, pagination]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
        
        // Update the clone count and mark as cloned in the UI
        setDocuments(docs => 
          docs.map(doc => 
            doc._id === documentId 
              ? { ...doc, cloneCount: doc.cloneCount + 1, isCloned: true }
              : doc
          )
        );
        
        // Also update the selected document if it's the same one
        if (selectedDocument && selectedDocument._id === documentId) {
          setSelectedDocument(prev => prev ? { ...prev, isCloned: true } : null);
        }
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

  const downloadDocument = async (doc: LibraryDocument, format: 'pdf' | 'docx') => {
    try {
      const response = await fetch(`/api/library/documents/${doc._id}/download?format=${format}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = globalThis.document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}_${doc.type}.${format}`;
        globalThis.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        globalThis.document.body.removeChild(a);
        toast.success(`Document downloaded as ${format.toUpperCase()}`);
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to download ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      toast.error(`Failed to download ${format.toUpperCase()}`);
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
            <CardTitle className="text-sm font-medium">Available Documents</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              Total documents in library
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Cloned Documents</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalCloned}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.recentlyCloned} cloned this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Category</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.favoriteCategory || 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              Most cloned category
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Rated</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalRated}</div>
            <p className="text-xs text-muted-foreground">
              Your ratings submitted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Quick access to your documents and common actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              onClick={() => window.open('/documents/cloned', '_blank')}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Copy className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">My Cloned Documents</div>
                <div className="text-sm text-muted-foreground">
                  {userStats.totalCloned} documents
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/documents', '_blank')}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">My Documents</div>
                <div className="text-sm text-muted-foreground">
                  Create new documents
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/applications', '_blank')}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Award className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">My Applications</div>
                <div className="text-sm text-muted-foreground">
                  Track applications
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

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
                      {document.isCloned ? (
                        <div className="flex-1 flex items-center justify-center">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <Check className="h-3 w-3 mr-1" /> Cloned
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open('/documents/cloned', '_blank')}
                            className="ml-2 h-6 px-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
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
                      )}
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
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedDocument && downloadDocument(selectedDocument, 'pdf')}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedDocument && downloadDocument(selectedDocument, 'docx')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Word
                </Button>
              </div>
              <div>
                {selectedDocument?.isCloned ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <Check className="h-4 w-4 mr-2" /> Already Cloned
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={() => window.open('/documents/cloned', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Cloned Document
                    </Button>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 