'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Copy,
  Download,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import CreateLibraryDocumentDialog from '@/components/admin/CreateLibraryDocumentDialog';
import LibraryAnalyticsWidget from '@/components/admin/LibraryAnalyticsWidget';

interface LibraryDocument {
  _id: string;
  title: string;
  type: string;
  description: string;
  category: string;
  subcategory?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  reviewStatus: 'pending' | 'approved' | 'rejected';
  qualityScore: number;
  viewCount: number;
  cloneCount: number;
  averageRating: number;
  ratingCount: number;
  targetAudience: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminLibraryPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [targetAudienceFilter, setTargetAudienceFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<LibraryDocument | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(reviewStatusFilter !== 'all' && { reviewStatus: reviewStatusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(targetAudienceFilter !== 'all' && { targetAudience: targetAudienceFilter }),
      });

      const response = await fetch(`/api/admin/library/documents?${params}`);
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
  }, [pagination, searchTerm, statusFilter, reviewStatusFilter, categoryFilter, targetAudienceFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDocuments();
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/admin/library/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Document deleted successfully');
        setDocuments(documents.filter(doc => doc._id !== documentId));
        setIsDeleteDialogOpen(false);
        setSelectedDocument(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handlePublishDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/admin/library/documents/${documentId}/publish`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Document published successfully');
        fetchDocuments(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to publish document');
      }
    } catch (error) {
      console.error('Error publishing document:', error);
      toast.error('Failed to publish document');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-800">In Review</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-red-100 text-red-800">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReviewStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Library</h1>
          <p className="text-muted-foreground">
            Manage and curate high-quality academic documents for the library
          </p>
        </div>
        <CreateLibraryDocumentDialog onDocumentCreated={fetchDocuments} />
      </div>

      {/* Analytics Widget */}
      <LibraryAnalyticsWidget />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Review Status</label>
              <Select value={reviewStatusFilter} onValueChange={setReviewStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Select value={targetAudienceFilter} onValueChange={setTargetAudienceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Manage library documents and their publication status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.title}</div>
                        <div className="text-sm text-gray-500">{document.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.category}</div>
                        {document.subcategory && (
                          <div className="text-sm text-gray-500">{document.subcategory}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(document.status)}
                        {getReviewStatusBadge(document.reviewStatus)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className={`h-4 w-4 ${getQualityScoreColor(document.qualityScore)}`} />
                        <span className={getQualityScoreColor(document.qualityScore)}>
                          {document.qualityScore}/10
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
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
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(document.createdAt)}</div>
                        <div className="text-gray-500">
                          by {document.createdBy.firstName} {document.createdBy.lastName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => window.open(`/admin/library/documents/${document._id}`, '_blank')}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/admin/library/documents/${document._id}/edit`, '_blank')}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {document.status === 'review' && document.reviewStatus === 'approved' && (
                            <DropdownMenuItem onClick={() => handlePublishDocument(document._id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedDocument(document);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedDocument?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedDocument && handleDeleteDocument(selectedDocument._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
} 