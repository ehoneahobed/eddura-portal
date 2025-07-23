'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Award, 
  DollarSign, 
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  BookOpen,
  Star,
  Heart,
  Share2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import ScholarshipCard from './ScholarshipCard';
import ScholarshipFilters from './ScholarshipFilters';

// Define the Filters interface locally since it's not exported from ScholarshipFilters
interface Filters {
  frequency: string;
  minGPA: string;
  hasEssay: boolean;
  hasCV: boolean;
  hasRecommendations: boolean;
}

interface Scholarship {
  _id: string;
  title: string;
  provider: string;
  scholarshipDetails: string;
  value?: number | string;
  currency?: string;
  frequency: 'One-time' | 'Annual' | 'Full Duration';
  deadline: string;
  openingDate?: string;
  eligibility: {
    degreeLevels?: string[];
    fieldsOfStudy?: string[];
    nationalities?: string[];
    minGPA?: number;
  };
  applicationRequirements: {
    essay?: boolean;
    cv?: boolean;
    recommendationLetters?: number;
  };
  linkedSchool?: string;
  linkedProgram?: string;
  coverage: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

// Define sorting options with descriptions
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance', description: 'Best matches for your search' },
  { value: 'alphabetical', label: 'Alphabetical', description: 'A-Z by title' },
  { value: 'deadline', label: 'Deadline', description: 'Earliest deadline first' },
  { value: 'opening-date', label: 'Opening Date', description: 'Applications opening soon' },
  { value: 'newest', label: 'Newest', description: 'Recently added' },
  { value: 'oldest', label: 'Oldest', description: 'Added first' }
] as const;

type SortOption = typeof SORT_OPTIONS[number]['value'];

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    frequency: 'all',
    minGPA: '',
    hasEssay: false,
    hasCV: false,
    hasRecommendations: false
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 15 // Show 15 scholarships per page
  });
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchTermRef = useRef<string>('');

  // Improved debounced search effect
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout for the current search term
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      lastSearchTermRef.current = searchTerm;
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Focus restoration effect
  useEffect(() => {
    if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
      // Re-focus if the input has lost focus but we're still typing
      searchInputRef.current.focus();
    }
  }, [scholarships]);

  const fetchScholarships = useCallback(async () => {
    // Don't show loading state for search operations if we already have results
    const isSearchOperation = debouncedSearchTerm && scholarships.length > 0;
    
    try {
      if (!isSearchOperation) {
        setIsLoading(true);
      }
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        sortBy: getSortByParam(sortBy),
        sortOrder: getSortOrder(sortBy)
      });

      // Add search parameter
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      // Add filter parameters
      if (selectedFilters.frequency !== 'all') {
        params.append('frequency', selectedFilters.frequency);
      }
      if (selectedFilters.minGPA) {
        params.append('minGPA', selectedFilters.minGPA);
      }
      if (selectedFilters.hasEssay) {
        params.append('hasEssay', 'true');
      }
      if (selectedFilters.hasCV) {
        params.append('hasCV', 'true');
      }
      if (selectedFilters.hasRecommendations) {
        params.append('hasRecommendations', 'true');
      }

      // Add status filter for server-side filtering
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      } else {
        // Include expired scholarships when showing all statuses
        params.append('includeExpired', 'true');
      }

      const response = await fetch(`/api/scholarships?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setScholarships(data.scholarships || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      // Only set loading to false if we set it to true
      if (!isSearchOperation) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearchTerm, pagination, sortBy, selectedFilters, selectedStatus]);

  // Effect to fetch scholarships when dependencies change
  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  const getSortByParam = (sort: SortOption): string => {
    switch (sort) {
      case 'alphabetical': return 'title';
      case 'deadline': return 'deadline';
      case 'opening-date': return 'openingDate';
      case 'newest': return 'createdAt';
      case 'oldest': return 'createdAt';
      case 'relevance': 
      default: return 'createdAt'; // relevance defaults to newest for now
    }
  };

  const getSortOrder = (sort: SortOption): string => {
    switch (sort) {
      case 'alphabetical': return 'asc';
      case 'deadline': return 'asc';
      case 'opening-date': return 'asc';
      case 'newest': return 'desc';
      case 'oldest': return 'asc';
      case 'relevance': 
      default: return 'desc';
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev: PaginationInfo) => ({ ...prev, currentPage: page }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      frequency: 'all',
      minGPA: '',
      hasEssay: false,
      hasCV: false,
      hasRecommendations: false
    });
    setSelectedStatus('all');
    setSearchTerm('');
    setPagination((prev: PaginationInfo) => ({ ...prev, currentPage: 1 }));
  };

  const formatValue = (value: number | string | undefined, currency?: string) => {
    if (typeof value === 'number') {
      return `${currency || '$'}${value.toLocaleString()}`;
    }
    return value || 'Varies';
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Currently Accepting';
      case 'expired': return 'Expired';
      case 'coming-soon': return 'Opening Soon (3 months)';
      case 'urgent': return 'Urgent (30 days)';
      default: return status;
    }
  };

  // Show loading state only on initial load, not during search
  if (isLoading && scholarships.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-[#007fbd] rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Scholarships</h2>
          <p className="text-gray-600">Finding the best opportunities for you...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Scholarships
          </h1>
          <p className="text-gray-600">
            Find and apply for scholarships that match your profile and academic goals.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1" data-search-container>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search scholarships by title, provider, or field of study..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        // Ensure focus is maintained after state update
                        setTimeout(() => {
                          if (searchInputRef.current) {
                            searchInputRef.current.focus();
                          }
                        }, 0);
                      }}
                      onBlur={(e: React.FocusEvent) => {
                        // Only allow blur if we're clicking outside the search area
                        const relatedTarget = e.relatedTarget as HTMLElement;
                        if (relatedTarget && !relatedTarget.closest('[data-search-container]')) {
                          // Allow normal blur behavior
                        } else {
                          // Prevent blur and restore focus
                          e.preventDefault();
                          setTimeout(() => {
                            if (searchInputRef.current) {
                              searchInputRef.current.focus();
                            }
                          }, 0);
                        }
                      }}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        e.stopPropagation();
                        // Prevent any key that might close the search
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          setSearchTerm('');
                        }
                      }}
                      autoComplete="off"
                      spellCheck={false}
                      className="pl-10"
                      ref={searchInputRef}
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2">


                  <Select 
                    value={selectedFilters.frequency} 
                    onValueChange={(value) => {
                      setSelectedFilters((prev: Filters) => ({ ...prev, frequency: value }));
                      setPagination((prev: PaginationInfo) => ({ ...prev, currentPage: 1 }));
                    }}
                    onOpenChange={(open) => {
                      if (!open && searchInputRef.current) {
                        // Restore focus to search input when select closes
                        setTimeout(() => {
                          searchInputRef.current?.focus();
                        }, 0);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="One-time">One-time</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="Full Duration">Full Duration</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedStatus} 
                    onValueChange={(value) => {
                      setSelectedStatus(value);
                      setPagination((prev: PaginationInfo) => ({ ...prev, currentPage: 1 }));
                    }}
                    onOpenChange={(open) => {
                      if (!open && searchInputRef.current) {
                        // Restore focus to search input when select closes
                        setTimeout(() => {
                          searchInputRef.current?.focus();
                        }, 0);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Currently Accepting</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="coming-soon">Opening Soon (3 months)</SelectItem>
                      <SelectItem value="urgent">Urgent (30 days)</SelectItem>
                    </SelectContent>
                  </Select>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p><strong>Currently Accepting:</strong> Applications are open and deadline hasn&apos;t passed</p>
                          <p><strong>Opening Soon:</strong> Applications will open within 3 months</p>
                          <p><strong>Urgent:</strong> Deadline is within 30 days</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>

                  {(searchTerm || Object.values(selectedFilters).some(v => v && v !== 'all') || selectedStatus !== 'all') && (
                    <Button 
                      variant="ghost" 
                      onClick={clearFilters}
                      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <ScholarshipFilters
                    filters={selectedFilters}
                    onFiltersChange={(filters) => {
                      setSelectedFilters(filters);
                      setPagination((prev: PaginationInfo) => ({ ...prev, currentPage: 1 }));
                    }}
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{scholarships.length}</span> of{' '}
                <span className="font-semibold">{pagination.totalCount}</span> scholarships
                {searchTerm && ` for &quot;${searchTerm}&quot;`}
                {selectedStatus !== 'all' && ` (${getStatusLabel(selectedStatus)})`}
              </p>
              {isLoading && scholarships.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => {
                setSortBy(value as SortOption);
                setPagination((prev: PaginationInfo) => ({ ...prev, currentPage: 1 }));
              }}
              onOpenChange={(open) => {
                if (!open && searchInputRef.current) {
                  // Restore focus to search input when select closes
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 0);
                }
              }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-gray-500">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Scholarships Grid */}
        {scholarships.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {scholarships.map((scholarship, index) => (
              <motion.div
                key={scholarship._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <ScholarshipCard scholarship={scholarship} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No scholarships found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find more opportunities.
            </p>
            <Button 
              onClick={clearFilters} 
              variant="outline"
              onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
            >
              Clear all filters
            </Button>
          </motion.div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mt-8"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                disabled={!pagination.hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
