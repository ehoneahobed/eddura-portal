'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useScholarships } from '@/hooks/use-scholarships';
import { Search, Plus, Edit, Trash2, Calendar, DollarSign, ExternalLink, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import CSVImportModal from '@/components/admin/CSVImportModal';

export default function ScholarshipsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [selectedDegreeLevel, setSelectedDegreeLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  // Determine if we should include expired scholarships based on status filter
  const includeExpired = selectedStatus === 'all' || selectedStatus === 'expired';

  // Use SWR hook for scholarships data
  const { scholarships, pagination, isLoading, isError, mutate } = useScholarships({
    page: currentPage,
    limit: 12,
    search: debouncedSearch,
    provider: selectedProvider !== 'all' ? selectedProvider : undefined,
    frequency: selectedFrequency !== 'all' ? 
      (selectedFrequency === 'One-time' ? 'one-time' : 
       selectedFrequency === 'Annual' ? 'annual' : 
       selectedFrequency === 'Full Duration' ? 'other' : 'other') : undefined,
    sortBy: 'title',
    sortOrder: 'asc',
    includeExpired
  });

  // Filter scholarships by status on the client side
  const getFilteredScholarships = () => {
    if (selectedStatus === 'all') return scholarships;
    
    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    
    return scholarships.filter((scholarship: any) => {
      const deadline = new Date(scholarship.deadline);
      
      switch (selectedStatus) {
        case 'active':
          return deadline >= now;
        case 'expired':
          return deadline < now;
        case 'coming-soon':
          return deadline > now && deadline <= sixMonthsFromNow;
        case 'urgent':
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return deadline >= now && deadline <= thirtyDaysFromNow;
        default:
          return true;
      }
    });
  };

  const filteredScholarships = getFilteredScholarships();

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    setCurrentPage(1);
  };

  const handleFrequencyChange = (value: string) => {
    setSelectedFrequency(value);
    setCurrentPage(1);
  };

  const handleDegreeLevelChange = (value: string) => {
    setSelectedDegreeLevel(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      const response = await fetch(`/api/scholarships/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Scholarship deleted successfully'
        });
        mutate(); // Refresh data using SWR
      } else {
        throw new Error('Failed to delete scholarship');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete scholarship',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (deadlineDate < now) {
      return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 border-red-200"><AlertCircle className="h-3 w-3 mr-1" />Expired</span>;
    } else if (deadlineDate <= thirtyDaysFromNow) {
      return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 border-orange-200"><Clock className="h-3 w-3 mr-1" />Urgent</span>;
    } else if (deadlineDate <= sixMonthsFromNow) {
      return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200"><Clock className="h-3 w-3 mr-1" />Coming Soon</span>;
    } else {
      return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-200">Active</span>;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle error state
  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load scholarships</p>
          <Button onClick={() => mutate()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scholarships</h1>
          <p className="text-gray-600">Manage scholarship opportunities</p>
        </div>
        <div className="flex gap-2">
          <CSVImportModal
            title="Import Scholarships"
            description="Upload a CSV file to import multiple scholarships at once. Download the template to see the required format."
            importEndpoint="/api/scholarships/csv-import"
            templateEndpoint="/api/scholarships/csv-template"
            onImportComplete={() => {
              mutate(); // Refresh scholarships data after import
              toast({
                title: 'Import Complete',
                description: 'Scholarships have been imported successfully'
              });
            }}
          />
          <Link href="/admin/scholarships/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Scholarship
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-2">
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="University">University</SelectItem>
            <SelectItem value="Government">Government</SelectItem>
            <SelectItem value="Private">Private</SelectItem>
            <SelectItem value="Foundation">Foundation</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedFrequency} onValueChange={handleFrequencyChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frequencies</SelectItem>
            <SelectItem value="One-time">One-time</SelectItem>
            <SelectItem value="Annual">Annual</SelectItem>
            <SelectItem value="Full Duration">Full Duration</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDegreeLevel} onValueChange={handleDegreeLevelChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Degree Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Degree Levels</SelectItem>
            <SelectItem value="Bachelor">Bachelor</SelectItem>
            <SelectItem value="Master">Master</SelectItem>
            <SelectItem value="PhD">PhD</SelectItem>
            <SelectItem value="Diploma">Diploma</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="coming-soon">Coming Soon (6 months)</SelectItem>
            <SelectItem value="urgent">Urgent (30 days)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search scholarships by title, provider, or tags..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredScholarships.length} of {pagination.totalCount} scholarships
          {selectedStatus !== 'all' && ` (${selectedStatus} status)`}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading scholarships...</span>
          </div>
        </div>
      )}

      {/* Scholarships Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship) => (
            <Link
              key={scholarship.id}
              href={`/admin/scholarships/${scholarship.id}`}
              className="block group focus:outline-none"
              aria-label={`View details for ${scholarship.title}`}
            >
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer group-focus:ring-2 group-focus:ring-blue-500 relative"
                tabIndex={0}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:underline group-focus:underline">{scholarship.title}</CardTitle>
                      <div className="text-sm text-gray-600 mb-2">
                        {scholarship.provider}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{scholarship.frequency}</Badge>
                        {getStatusBadge(scholarship.deadline)}
                      </div>
                    </div>
                    <div className="flex space-x-1 z-10" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                      <Link href={`/admin/scholarships/${scholarship.id}/edit`} tabIndex={-1} legacyBehavior>
                        <Button size="sm" variant="ghost" onClick={e => e.stopPropagation()}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(scholarship.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Value:</span>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        <span>
                          {scholarship.value ? (
                            typeof scholarship.value === 'number' 
                              ? `${scholarship.currency || 'USD'} ${scholarship.value.toLocaleString()}`
                              : scholarship.value
                          ) : 'Variable'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Deadline:</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{formatDate(scholarship.deadline)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Application:</span>
                      <div className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-blue-600 hover:underline">
                          {scholarship.applicationLink ? 'External Link' : 'Internal'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <ExternalLink className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No scholarships found</p>
            <p className="text-sm">Try adjusting your search criteria or add a new scholarship.</p>
          </div>
          <Link href="/admin/scholarships/create">
            <Button>Add First Scholarship</Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex justify-center">
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