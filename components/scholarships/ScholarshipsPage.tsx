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
import { ResponsiveContainer } from '../ui/responsive-container';
import { usePageTranslation, useCommonTranslation } from '@/hooks/useTranslation';

// Define the Filters interface locally since it's not exported from ScholarshipFilters
interface Filters {
  frequency: string;
  minGPA: string;
  hasEssay: boolean;
  hasCV: boolean;
  hasRecommendations: boolean;
  locations: string[];
  disciplines: string[];
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
  locations?: string[];
  disciplines?: string[];
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
  { value: 'relevance', key: 'relevance' },
  { value: 'alphabetical', key: 'alphabetical' },
  { value: 'deadline', key: 'deadline' },
  { value: 'opening-date', key: 'openingDate' },
  { value: 'newest', key: 'newest' },
  { value: 'oldest', key: 'oldest' }
] as const;

type SortOption = typeof SORT_OPTIONS[number]['value'];

export default function ScholarshipsPage() {
  const { t } = usePageTranslation('scholarships');
  const { t: tCommon } = useCommonTranslation();
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
    hasRecommendations: false,
    locations: [],
    disciplines: []
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

      // Add location and discipline filters
      if (selectedFilters.locations.length > 0) {
        params.append('locations', selectedFilters.locations.join(','));
      }
      if (selectedFilters.disciplines.length > 0) {
        params.append('disciplines', selectedFilters.disciplines.join(','));
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
        setPagination(prev => {
          if (!data.pagination ||
            (prev.currentPage === data.pagination.currentPage &&
             prev.totalPages === data.pagination.totalPages &&
             prev.totalCount === data.pagination.totalCount &&
             prev.hasNextPage === data.pagination.hasNextPage &&
             prev.hasPrevPage === data.pagination.hasPrevPage &&
             prev.limit === data.pagination.limit)
          ) {
            return prev;
          }
          return data.pagination;
        });
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      // Only set loading to false if we set it to true
      if (!isSearchOperation) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearchTerm, pagination.currentPage, pagination.limit, sortBy, selectedFilters, selectedStatus, scholarships.length]);

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
      hasRecommendations: false,
      locations: [],
      disciplines: []
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
      case 'active': return t('filters.status.currentlyAccepting');
      case 'expired': return t('filters.status.expired');
      case 'coming-soon': return t('filters.status.openingSoon');
      case 'urgent': return t('filters.status.urgent');
      default: return status;
    }
  };

  // Show loading state only on initial load, not during search
  if (isLoading && scholarships.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-transparent">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-[var(--eddura-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--eddura-primary-900)] dark:text-white mb-2">{t('loadingTitle')}</h2>
          <p className="text-[var(--eddura-primary-600)] dark:text-[var(--eddura-primary-300)]">{t('loadingSubtitle')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <ResponsiveContainer maxWidth="8xl" padding="md" className="py-4 sm:py-8">
      <div className=" mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[var(--eddura-primary-900)] dark:text-white mb-2">{t('title')}</h1>
          <p className="text-[var(--eddura-primary-700)] dark:text-[var(--eddura-primary-300)]">{t('subtitle')}</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="shadow-eddura border border-gray-200 dark:border-[var(--eddura-primary-800)] bg-white dark:bg-[var(--eddura-primary-900)] rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1" data-search-container>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--eddura-primary-400)] dark:text-[var(--eddura-primary-300)]" />
                    <Input
                      type="text"
                      placeholder={t('searchPlaceholder')}
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
                      className="pl-10 bg-white dark:bg-[var(--eddura-primary-800)]"
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
                    <SelectTrigger className="w-[140px] bg-white border-gray-200 text-gray-700 dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-700)] dark:text-white">
                      <SelectValue placeholder={t('filters.frequency.placeholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900 border-gray-200 dark:bg-[var(--eddura-primary-900)] dark:text-white dark:border-[var(--eddura-primary-700)]">
                      <SelectItem value="all">{t('filters.frequency.allTypes')}</SelectItem>
                      <SelectItem value="One-time">{t('filters.frequency.oneTime')}</SelectItem>
                      <SelectItem value="Annual">{t('filters.frequency.annual')}</SelectItem>
                      <SelectItem value="Full Duration">{t('filters.frequency.fullDuration')}</SelectItem>
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
                    <SelectTrigger className="w-[140px] bg-white border-gray-200 text-gray-700 dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-700)] dark:text-white">
                      <SelectValue placeholder={t('filters.status.placeholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900 border-gray-200 dark:bg-[var(--eddura-primary-900)] dark:text-white dark:border-[var(--eddura-primary-700)]">
                      <SelectItem value="all">{t('filters.status.all')}</SelectItem>
                      <SelectItem value="active">{t('filters.status.currentlyAccepting')}</SelectItem>
                      <SelectItem value="expired">{t('filters.status.expired')}</SelectItem>
                      <SelectItem value="coming-soon">{t('filters.status.openingSoon')}</SelectItem>
                      <SelectItem value="urgent">{t('filters.status.urgent')}</SelectItem>
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
                          <p><strong>{t('filters.status.currentlyAccepting')}:</strong> {t('filters.help.currentlyAccepting')}</p>
                          <p><strong>{t('filters.status.openingSoon')}:</strong> {t('filters.help.openingSoon')}</p>
                          <p><strong>{t('filters.status.urgent')}:</strong> {t('filters.help.urgent')}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    className="flex items-center gap-2 border-gray-200 dark:border-[var(--eddura-primary-700)] hover:bg-gray-50 dark:hover:bg-[var(--eddura-primary-800)] hover:text-eddura-700"
                  >
                    <Filter className="h-4 w-4" />
                    {t('filters.button')}
                  </Button>

                  {(searchTerm || Object.values(selectedFilters).some(v => v && v !== 'all') || selectedStatus !== 'all') && (
                    <Button 
                      variant="ghost" 
                      onClick={clearFilters}
                      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    >
                      {t('filters.clear')}
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
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-[var(--eddura-primary-800)]"
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
              <p className="text-gray-600 dark:text-[var(--eddura-primary-200)]">
                {t('results.showing', { count: scholarships.length, total: pagination.totalCount })}
                {searchTerm ? ` ${t('results.for', { term: searchTerm })}` : ''}
                {selectedStatus !== 'all' ? ` (${getStatusLabel(selectedStatus)})` : ''}
              </p>
              {isLoading && scholarships.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-[var(--eddura-primary-300)]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{t('results.updating')}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('sort.label')}</span>
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
                <SelectTrigger className="w-[160px] bg-white border-gray-200 text-gray-700 dark:bg-[var(--eddura-primary-900)] dark:border-[var(--eddura-primary-700)] dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900 border-gray-200 dark:bg-[var(--eddura-primary-900)] dark:text-white dark:border-[var(--eddura-primary-700)]">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{t(`sort.options.${option.key}.label`)}</span>
                        <span className="text-xs text-gray-500 dark:text-[var(--eddura-primary-300)]">{t(`sort.options.${option.key}.description`)}</span>
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
            <Award className="h-16 w-16 text-gray-400 dark:text-[var(--eddura-primary-300)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('empty.title')}</h3>
            <p className="text-gray-600 dark:text-[var(--eddura-primary-300)] mb-4">{t('empty.description')}</p>
            <Button 
              onClick={clearFilters} 
              variant="outline"
              onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
            >
              {t('empty.clearAllFilters')}
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
                {tCommon('actions.previous')}
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
                {tCommon('actions.next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </ResponsiveContainer>
  );
}
