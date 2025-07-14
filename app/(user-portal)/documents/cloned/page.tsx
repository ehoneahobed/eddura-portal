"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Eye,
  Copy,
  Star,
  Calendar,
  Loader2,
  Download,
  Share2,
  Trash2,
  FileText,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';

interface ClonedDocument {
  _id: string;
  originalDocument: {
    _id: string;
    title: string;
    type: string;
    description: string;
    category: string;
    tags: string[];
  };
  clonedContent: string;
  customizations: {
    title?: string;
    description?: string;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  isBookmarked: boolean;
}

export default function MyClonedDocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<ClonedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchClonedDocuments();
  }, [pagination.page, categoryFilter, typeFilter, sortBy]);

  const fetchClonedDocuments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        sortBy
      });

      const response = await fetch(`/api/user/cloned-documents?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setPagination(data.pagination || pagination);
      } else {
        toast.error('Failed to fetch cloned documents');
      }
    } catch (error) {
      console.error('Error fetching cloned documents:', error);
      toast.error('Failed to fetch cloned documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchClonedDocuments();
  };

  const handleBookmark = async (documentId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/user/cloned-documents/${documentId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBookmarked: !currentStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Bookmark status updated');
        fetchClonedDocuments(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update bookmark status');
      }
    } catch (error) {
      console.error('Error updating bookmark status:', error);
      toast.error('Failed to update bookmark status');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this cloned document? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/cloned-documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Document deleted successfully');
        setDocuments(documents.filter(doc => doc._id !== documentId));
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Cloned Documents</h1>
          <p className="text-muted-foreground">
            Manage your cloned documents from the library
          </p>
        </div>
        <Button onClick={() => window.open('/library', '_blank')}>
          <Copy className="mr-2 h-4 w-4" />
          Clone More Documents
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cloned</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarked</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.isBookmarked).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Accessed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.lastAccessedAt && 
                new Date(d.lastAccessedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Access</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.reduce((sum, d) => sum + d.accessCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <label className="text-sm font-medium">Document Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Personal Statement">Personal Statement</SelectItem>
                  <SelectItem value="Statement of Purpose">Statement of Purpose</SelectItem>
                  <SelectItem value="Research Proposal">Research Proposal</SelectItem>
                  <SelectItem value="Academic CV">Academic CV</SelectItem>
                  <SelectItem value="Cover Letter">Cover Letter</SelectItem>
                  <SelectItem value="Scholarship Essay">Scholarship Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="accessed">Recently Accessed</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="type">Document Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cloned Documents</CardTitle>
          <CardDescription>
            Your personalized copies of library documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cloned documents yet</h3>
              <p className="text-gray-500 mb-4">
                Start by cloning documents from the library to create your personalized copies.
              </p>
              <Button onClick={() => window.open('/library', '_blank')}>
                <Copy className="mr-2 h-4 w-4" />
                Browse Library
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Cloned</TableHead>
                  <TableHead>Last Accessed</TableHead>
                  <TableHead>Access Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {document.customizations?.title || document.originalDocument.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {document.customizations?.description || document.originalDocument.description}
                        </div>
                        {document.isBookmarked && (
                          <Badge variant="outline" className="mt-1">
                            <Bookmark className="h-3 w-3 mr-1" />
                            Bookmarked
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.originalDocument.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{document.originalDocument.category}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(document.createdAt)}</div>
                        <div className="text-gray-500">
                          {getRelativeTime(document.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {document.lastAccessedAt ? (
                          <>
                            <div>{formatDate(document.lastAccessedAt)}</div>
                            <div className="text-gray-500">
                              {getRelativeTime(document.lastAccessedAt)}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">Never</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span>{document.accessCount}</span>
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
                          <DropdownMenuItem onClick={() => window.open(`/documents/cloned/${document._id}`, '_blank')}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/documents/cloned/${document._id}/edit`, '_blank')}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleBookmark(document._id, document.isBookmarked)}
                          >
                            {document.isBookmarked ? (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Bookmark
                              </>
                            ) : (
                              <>
                                <Bookmark className="mr-2 h-4 w-4" />
                                Bookmark
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(document._id)}
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
    </div>
  );
} 