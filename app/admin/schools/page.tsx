'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { School } from '@/types';
import { Search, Plus, Edit, Trash2, Globe, MapPin, Users, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when search changes
      fetchSchools();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch schools when page changes
  useEffect(() => {
    fetchSchools();
  }, [currentPage]);

  const fetchSchools = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        search: searchTerm
      });

      const response = await fetch(`/api/schools?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setSchools(data.schools || []);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 12
        });
      } else {
        throw new Error(data.error || 'Failed to fetch schools');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch schools',
        variant: 'destructive'
      });
      console.error('Error fetching schools:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, toast]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school?')) return;

    try {
      const response = await fetch(`/api/schools/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'School deleted successfully'
        });
        fetchSchools(); // Refresh current page
      } else {
        throw new Error('Failed to delete school');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete school',
        variant: 'destructive'
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
          <p className="text-gray-600">Manage educational institutions</p>
        </div>
        <Link href="/admin/schools/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add School
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search schools by name, country, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
          {pagination.totalCount} schools
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading schools...</span>
          </div>
        </div>
      )}

      {/* Schools Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <Link
              key={school.id}
              href={`/admin/schools/${school.id}`}
              className="block group focus:outline-none"
              aria-label={`View details for ${school.name}`}
            >
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer group-focus:ring-2 group-focus:ring-blue-500 relative"
                tabIndex={0}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:underline group-focus:underline">{school.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {school.city}, {school.country}
                      </div>
                      {school.globalRanking && (
                        <div className="text-sm text-blue-600 font-medium">
                          Ranking: #{school.globalRanking}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1 z-10" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                      <Link href={`/admin/schools/${school.id}/edit`} tabIndex={-1} legacyBehavior>
                        <Button size="sm" variant="ghost" onClick={e => e.stopPropagation()}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={e => { e.stopPropagation(); handleDelete(school.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {school.types.slice(0, 2).map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                      {school.types.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{school.types.length - 2} more
                        </Badge>
                      )}
                    </div>

                    {school.yearFounded && (
                      <div className="text-sm text-gray-600">
                        Founded: {school.yearFounded}
                      </div>
                    )}

                    {school.internationalStudentCount && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {school.internationalStudentCount.toLocaleString()} international students
                      </div>
                    )}

                    {school.websiteUrl && (
                      <div className="flex items-center text-sm text-blue-600">
                        <Globe className="h-4 w-4 mr-1" />
                        <a
                          href={school.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                          onClick={e => e.stopPropagation()}
                          tabIndex={-1}
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && schools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No schools found</div>
          <div className="text-gray-400 text-sm mt-1">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first school to get started'}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}