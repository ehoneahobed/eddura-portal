'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Scholarship {
  _id: string;
  title: string;
  provider: string;
  scholarshipDetails: string;
  deadline: string;
  applicationLink: string;
  value?: number | string;
  currency?: string;
  frequency: string;
  coverage: string[];
  eligibility: {
    degreeLevels?: string[];
    fieldsOfStudy?: string[];
  };
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export default function ScholarshipsWithoutApplicationFormsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');

  const fetchScholarships = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search && { search }),
        ...(providerFilter !== 'all' && { provider: providerFilter })
      });

      const response = await fetch(`/api/scholarships/without-application-forms?${params}`);
      if (!response.ok) throw new Error('Failed to fetch scholarships');
      
      const data = await response.json();
      setScholarships(data.scholarships);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setLoading(false);
    }
  }, [search, providerFilter]);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  const formatValue = (value?: number | string, currency?: string) => {
    if (!value) return 'Not specified';
    if (typeof value === 'number') {
      return `${currency || '$'}${value.toLocaleString()}`;
    }
    return value;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scholarships Without Application Forms</h1>
        <Link href="/admin/application-templates/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Application Form
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search scholarships..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="university">University</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="private">Private Organization</SelectItem>
                <SelectItem value="foundation">Foundation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scholarships List */}
      <Card>
        <CardHeader>
          <CardTitle>Scholarships ({pagination?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No scholarships found</div>
          ) : (
            <div className="space-y-4">
              {scholarships.map((scholarship) => (
                <div key={scholarship._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold text-lg">{scholarship.title}</h3>
                      <p className="text-sm text-gray-600">{scholarship.provider}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {scholarship.scholarshipDetails}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Apply
                        </Button>
                      </Link>
                      <Link href={`/admin/application-templates/create?scholarshipId=${scholarship._id}`}>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Create Form
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {formatValue(scholarship.value, scholarship.currency)}
                    </Badge>
                    <Badge variant="secondary">
                      {scholarship.frequency}
                    </Badge>
                    {scholarship.coverage.map((item, index) => (
                      <Badge key={index} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Deadline: {formatDate(scholarship.deadline)}</span>
                    {scholarship.eligibility.degreeLevels && scholarship.eligibility.degreeLevels.length > 0 && (
                      <span>Level: {scholarship.eligibility.degreeLevels.join(', ')}</span>
                    )}
                    {scholarship.eligibility.fieldsOfStudy && scholarship.eligibility.fieldsOfStudy.length > 0 && (
                      <span>Field: {scholarship.eligibility.fieldsOfStudy.slice(0, 2).join(', ')}
                        {scholarship.eligibility.fieldsOfStudy.length > 2 && '...'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchScholarships(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => fetchScholarships(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}