'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import ScholarshipCard from './ScholarshipCard';
import ScholarshipFilters from './ScholarshipFilters';

interface Scholarship {
  _id: string;
  title: string;
  provider: string;
  scholarshipDetails: string;
  value?: number | string;
  currency?: string;
  frequency: 'One-time' | 'Annual' | 'Full Duration';
  deadline: string;
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
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    degreeLevel: 'all',
    fieldOfStudy: 'all',
    frequency: 'all',
    minValue: '',
    maxValue: '',
    nationality: 'all',
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
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    fetchScholarships();
  }, [pagination.currentPage, searchTerm, selectedFilters, sortBy, selectedStatus]);

  const fetchScholarships = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        sortBy: getSortByParam(sortBy),
        sortOrder: getSortOrder(sortBy)
      });

      // Add search parameter
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Add filter parameters
      if (selectedFilters.degreeLevel !== 'all') {
        params.append('degreeLevel', selectedFilters.degreeLevel);
      }
      if (selectedFilters.fieldOfStudy !== 'all') {
        params.append('fieldOfStudy', selectedFilters.fieldOfStudy);
      }
      if (selectedFilters.frequency !== 'all') {
        params.append('frequency', selectedFilters.frequency);
      }
      if (selectedFilters.minValue) {
        params.append('minValue', selectedFilters.minValue);
      }
      if (selectedFilters.maxValue) {
        params.append('maxValue', selectedFilters.maxValue);
      }
      if (selectedFilters.nationality !== 'all') {
        params.append('nationality', selectedFilters.nationality);
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

      // Include expired scholarships if status filter allows it
      if (selectedStatus === 'all' || selectedStatus === 'expired') {
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
      setIsLoading(false);
    }
  };

  const getSortByParam = (sort: string) => {
    switch (sort) {
      case 'deadline': return 'deadline';
      case 'value': return 'value';
      case 'newest': return 'createdAt';
      default: return 'createdAt'; // relevance defaults to newest
    }
  };

  const getSortOrder = (sort: string) => {
    switch (sort) {
      case 'deadline': return 'asc';
      case 'value': return 'desc';
      case 'newest': return 'desc';
      default: return 'desc';
    }
  };

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

  const handlePageChange = (page: number) => {
    setPagination((prev: PaginationInfo) => ({ ...prev, currentPage: page }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      degreeLevel: 'all',
      fieldOfStudy: 'all',
      frequency: 'all',
      minValue: '',
      maxValue: '',
      nationality: 'all',
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

  if (isLoading) {
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
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search scholarships by title, provider, or field of study..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2">
                  <Select 
                    value={selectedFilters.degreeLevel} 
                    onValueChange={(value) => {
                      setSelectedFilters(prev => ({ ...prev, degreeLevel: value }));
                      setPagination(prev => ({ ...prev, currentPage: 1 }));
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Degree Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedFilters.frequency} 
                    onValueChange={(value) => {
                      setSelectedFilters(prev => ({ ...prev, frequency: value }));
                      setPagination(prev => ({ ...prev, currentPage: 1 }));
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
                      setPagination(prev => ({ ...prev, currentPage: 1 }));
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="coming-soon">Coming Soon</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>

                  {(searchTerm || Object.values(selectedFilters).some(v => v && v !== 'all') || selectedStatus !== 'all') && (
                    <Button variant="ghost" onClick={clearFilters}>
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
                      setPagination(prev => ({ ...prev, currentPage: 1 }));
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
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredScholarships.length}</span> of{' '}
              <span className="font-semibold">{pagination.totalCount}</span> scholarships
              {searchTerm && ` for "${searchTerm}"`}
              {selectedStatus !== 'all' && ` (${selectedStatus} status)`}
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => {
                setSortBy(value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Scholarships Grid */}
        {filteredScholarships.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredScholarships.map((scholarship, index) => (
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
            <Button onClick={clearFilters} variant="outline">
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
