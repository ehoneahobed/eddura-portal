"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useDataFetching } from '@/hooks/useDataFetching';
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
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

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
}

export default function MyClonedDocumentsPage() {
  const { data: session } = useSession();
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

  const fetchClonedDocuments = useCallback(async (params?: { page?: number; limit?: number }) => {
    if (!session?.user?.id) return null;
    
    const page = params?.page || pagination.page;
    const limit = params?.limit || pagination.limit;
    
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: searchTerm,
      category: categoryFilter,
      type: typeFilter,
      sortBy: sortBy,
    });

    const response = await fetch(`/api/user/cloned-documents?${searchParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch cloned documents');
    }
    
    const data = await response.json();
    setPagination(data.pagination || pagination);
    return data;
  }, [session?.user?.id, searchTerm, categoryFilter, typeFilter, sortBy, pagination.page, pagination.limit]);

  const { data, loading: isLoading, error, refetch } = useDataFetching({
    fetchFunction: fetchClonedDocuments,
    dependencies: [session?.user?.id, searchTerm, categoryFilter, typeFilter, sortBy],
    debounceMs: 300
  });

  // Handle errors from the custom hook
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const documents = data?.documents || [];

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    refetch({ page: 1, limit: pagination.limit });
  };

  const handleFilterChange = (filterType: 'category' | 'type' | 'sort', value: string) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    
    switch (filterType) {
      case 'category':
        setCategoryFilter(value);
        break;
      case 'type':
        setTypeFilter(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
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
        refetch(); // Refresh the data after deletion
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };



  const getCategories = () => {
    const categories = new Set(documents.map(doc => doc.originalDocument.category));
    return Array.from(categories).sort();
  };

  const getTypes = () => {
    const types = new Set(documents.map(doc => doc.originalDocument.type));
    return Array.from(types).sort();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Cloned Documents</h1>
          <p className="text-muted-foreground">
            Manage your cloned documents from the library
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCategories().length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document Types</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTypes().length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Access</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.reduce((sum, doc) => sum + doc.accessCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Search</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Search documents by title, description, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              {searchTerm && (
                <p className="text-xs text-muted-foreground mt-1">
                  Search will automatically trigger as you type
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort', value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="accessed">Last Accessed</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="type">Type A-Z</SelectItem>
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
            {documents.length} document{documents.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t cloned any documents yet. Visit the library to get started.'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={() => window.location.href = '/library'}>
                  Browse Library
                </Button>
              )}
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
                        <div className="text-sm text-muted-foreground">
                          {document.customizations?.description || document.originalDocument.description}
                        </div>
                        {document.customizations?.tags && document.customizations.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {document.customizations.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {document.customizations.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{document.customizations.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.originalDocument.type}</Badge>
                    </TableCell>
                    <TableCell>{document.originalDocument.category}</TableCell>
                    <TableCell>{formatDate(document.createdAt)}</TableCell>
                    <TableCell>
                      {document.lastAccessedAt ? formatDate(document.lastAccessedAt) : 'Never'}
                    </TableCell>
                    <TableCell>{document.accessCount}</TableCell>
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