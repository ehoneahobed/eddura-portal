'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Award, 
  DollarSign, 
  Calendar, 
  MapPin, 
  GraduationCap,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useScholarships } from '@/hooks/use-scholarships';
import { Scholarship } from '@/types';

function ScholarshipsContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedProvider, setSelectedProvider] = useState(searchParams.get('provider') || '');
  const [selectedCoverage, setSelectedCoverage] = useState(searchParams.get('coverage') || '');
  const [selectedFrequency, setSelectedFrequency] = useState(searchParams.get('frequency') || '');
  const [selectedDegreeLevel, setSelectedDegreeLevel] = useState(searchParams.get('degreeLevel') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [showFilters, setShowFilters] = useState(false);

  // Use the scholarships hook with current filters
  const { scholarships, pagination, isLoading, isError, mutate } = useScholarships({
    page: currentPage,
    limit: 12,
    search: searchTerm,
    provider: selectedProvider,
    coverage: selectedCoverage,
    frequency: selectedFrequency,
    degreeLevel: selectedDegreeLevel,
    sortBy: 'deadline',
    sortOrder: 'asc'
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedProvider) params.set('provider', selectedProvider);
    if (selectedCoverage) params.set('coverage', selectedCoverage);
    if (selectedFrequency) params.set('frequency', selectedFrequency);
    if (selectedDegreeLevel) params.set('degreeLevel', selectedDegreeLevel);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = `/scholarships${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [searchTerm, selectedProvider, selectedCoverage, selectedFrequency, selectedDegreeLevel, currentPage, router]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1); // Reset to first page when filtering
    
    switch (filterType) {
      case 'provider':
        setSelectedProvider(value);
        break;
      case 'coverage':
        setSelectedCoverage(value);
        break;
      case 'frequency':
        setSelectedFrequency(value);
        break;
      case 'degreeLevel':
        setSelectedDegreeLevel(value);
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProvider('');
    setSelectedCoverage('');
    setSelectedFrequency('');
    setSelectedDegreeLevel('');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedProvider || selectedCoverage || selectedFrequency || selectedDegreeLevel;

  // Format currency
  const formatCurrency = (value: number | string, currency: string = 'USD') => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format deadline
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `${diffDays} days left`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Get deadline color
  const getDeadlineColor = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-red-100 text-red-800';
    if (diffDays <= 7) return 'bg-orange-100 text-orange-800';
    if (diffDays <= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Scholarships</h2>
          <p className="text-gray-600">Finding the best opportunities for you...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2 mr-6">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#00334e]">Scholarships</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search scholarships by title, provider, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Filter Toggle and Clear */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Provider Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                  <Select value={selectedProvider} onValueChange={(value) => handleFilterChange('provider', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All providers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All providers</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="private">Private Organization</SelectItem>
                      <SelectItem value="foundation">Foundation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Coverage Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coverage</label>
                  <Select value={selectedCoverage} onValueChange={(value) => handleFilterChange('coverage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All coverage types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All coverage types</SelectItem>
                      <SelectItem value="tuition">Tuition</SelectItem>
                      <SelectItem value="living">Living Expenses</SelectItem>
                      <SelectItem value="full">Full Coverage</SelectItem>
                      <SelectItem value="partial">Partial Coverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Frequency Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <Select value={selectedFrequency} onValueChange={(value) => handleFilterChange('frequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All frequencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All frequencies</SelectItem>
                      <SelectItem value="One-time">One-time</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="Full Duration">Full Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Degree Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Degree Level</label>
                  <Select value={selectedDegreeLevel} onValueChange={(value) => handleFilterChange('degreeLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All degree levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All degree levels</SelectItem>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="MBA">MBA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-gray-600">
              {isLoading ? 'Loading...' : `${pagination.totalCount} scholarships found`}
            </span>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && <Badge variant="secondary">{searchTerm}</Badge>}
              {selectedProvider && <Badge variant="secondary">{selectedProvider}</Badge>}
              {selectedCoverage && <Badge variant="secondary">{selectedCoverage}</Badge>}
              {selectedFrequency && <Badge variant="secondary">{selectedFrequency}</Badge>}
              {selectedDegreeLevel && <Badge variant="secondary">{selectedDegreeLevel}</Badge>}
            </div>
          )}
        </div>

        {/* Error State */}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">Failed to load scholarships</p>
              <Button onClick={() => mutate()}>Try again</Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Scholarships Grid */}
        {!isLoading && !isError && (
          <>
            {scholarships.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="p-12 text-center">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
                  <p className="text-gray-600 mb-4">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters or search terms.' 
                      : 'Check back later for new opportunities.'
                    }
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters}>Clear filters</Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {scholarships.map((scholarship) => (
                  <motion.div
                    key={scholarship.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/scholarships/${scholarship.id}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer border-0 shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2 mb-2">
                                {scholarship.title}
                              </CardTitle>
                              <CardDescription className="line-clamp-1">
                                {scholarship.provider}
                              </CardDescription>
                            </div>
                            <Badge className={getDeadlineColor(scholarship.deadline)}>
                              {formatDeadline(scholarship.deadline)}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {/* Value */}
                            {scholarship.value && (
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  {formatCurrency(scholarship.value, scholarship.currency)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({scholarship.frequency})
                                </span>
                              </div>
                            )}

                            {/* Coverage */}
                            {scholarship.coverage && scholarship.coverage.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <Award className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-gray-700">
                                  {scholarship.coverage.join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Degree Levels */}
                            {scholarship.eligibility?.degreeLevels && scholarship.eligibility.degreeLevels.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <GraduationCap className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">
                                  {scholarship.eligibility.degreeLevels.join(', ')}
                                </span>
                              </div>
                            )}

                            {/* Location */}
                            {scholarship.linkedSchool && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-gray-700 line-clamp-1">
                                  {scholarship.linkedSchool}
                                </span>
                              </div>
                            )}

                            {/* Tags */}
                            {scholarship.tags && scholarship.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-2">
                                {scholarship.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {scholarship.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{scholarship.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!isLoading && !isError && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {pagination.totalPages > 5 && (
                <>
                  {currentPage > 3 && <span className="px-2">...</span>}
                  {currentPage > 3 && currentPage < pagination.totalPages - 2 && (
                    <Button variant="outline" className="w-10 h-10">
                      {currentPage}
                    </Button>
                  )}
                  {currentPage < pagination.totalPages - 2 && <span className="px-2">...</span>}
                  {currentPage < pagination.totalPages - 2 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      className="w-10 h-10"
                    >
                      {pagination.totalPages}
                    </Button>
                  )}
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="flex items-center space-x-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
 }

export default function ScholarshipsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Scholarships</h2>
          <p className="text-gray-600">Preparing your search experience...</p>
        </div>
      </div>
    }>
      <ScholarshipsContent />
    </Suspense>
  );
}