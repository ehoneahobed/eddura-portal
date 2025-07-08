'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Award, 
  Calendar, 
  DollarSign, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  History,
  Star,
  MapPin,
  GraduationCap,
  Building
} from 'lucide-react';
import { useScholarships } from '@/hooks/use-scholarships';
import { Scholarship } from '@/types';

interface SearchableScholarshipSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface FilterState {
  coverage: string;
  frequency: string;
  degreeLevel: string;
  minValue: string;
  maxValue: string;
}

const RECENT_SCHOLARSHIPS_KEY = 'recent_scholarships';
const MAX_RECENT_SCHOLARSHIPS = 5;

export default function SearchableScholarshipSelect({
  value,
  onValueChange,
  placeholder = "Select a scholarship",
  disabled = false,
  className
}: SearchableScholarshipSelectProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedScholarship, setSelectedScholarship] = React.useState<Scholarship | null>(null);
  const [recentScholarships, setRecentScholarships] = React.useState<Scholarship[]>([]);
  const [filters, setFilters] = React.useState<FilterState>({
    coverage: '',
    frequency: '',
    degreeLevel: '',
    minValue: '',
    maxValue: ''
  });

  const debounceTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Debounce search term
  React.useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

  // Build query parameters for API call
  const queryParams = {
    page,
    limit: 20,
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(filters.coverage && { coverage: filters.coverage }),
    ...(filters.frequency && { frequency: filters.frequency }),
    ...(filters.degreeLevel && { degreeLevel: filters.degreeLevel }),
    ...(filters.minValue && { minValue: filters.minValue }),
    ...(filters.maxValue && { maxValue: filters.maxValue }),
    sortBy: 'title' as const,
    sortOrder: 'asc' as const
  };

  const { scholarships, pagination, isLoading, isError } = useScholarships(queryParams);

  // Load recent scholarships from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SCHOLARSHIPS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Scholarship[];
        setRecentScholarships(parsed);
      }
    } catch (error) {
      console.error('Error loading recent scholarships:', error);
    }
  }, []);

  // Find selected scholarship details
  React.useEffect(() => {
    if (value && scholarships.length > 0) {
      const found = scholarships.find((s: Scholarship) => s.id === value);
      if (found) {
        setSelectedScholarship(found);
      }
    }
  }, [value, scholarships]);

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure the dropdown is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Save to recent scholarships
  const saveToRecent = React.useCallback((scholarship: Scholarship) => {
    try {
      const existing = recentScholarships.filter((s: Scholarship) => s.id !== scholarship.id);
      const updated = [scholarship, ...existing].slice(0, MAX_RECENT_SCHOLARSHIPS);
      setRecentScholarships(updated);
      localStorage.setItem(RECENT_SCHOLARSHIPS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent scholarship:', error);
    }
  }, [recentScholarships]);

  const handleValueChange = (scholarshipId: string) => {
    const scholarship = scholarships.find((s: Scholarship) => s.id === scholarshipId);
    if (scholarship) {
      onValueChange(scholarshipId);
      setSelectedScholarship(scholarship);
      saveToRecent(scholarship);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRecentSelect = (scholarship: Scholarship) => {
    onValueChange(scholarship.id);
    setSelectedScholarship(scholarship);
    setIsOpen(false);
    setSearchTerm('');
  };

  const loadMore = () => {
    setPage((prev: number) => prev + 1);
  };

  const resetFilters = () => {
    setFilters({
      coverage: '',
      frequency: '',
      degreeLevel: '',
      minValue: '',
      maxValue: ''
    });
  };

  const formatScholarshipValue = (scholarship: Scholarship) => {
    if (!scholarship.value) return null;
    
    if (typeof scholarship.value === 'number') {
      return `${scholarship.currency || 'USD'} ${scholarship.value.toLocaleString()}`;
    }
    return scholarship.value;
  };

  const formatDeadline = (deadline: string) => {
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return deadline;
    }
  };

  const getCoverageColor = (coverage: string[]) => {
    const coverageTypes = coverage.join(', ').toLowerCase();
    if (coverageTypes.includes('full') || coverageTypes.includes('tuition')) {
      return 'bg-green-100 text-green-800';
    } else if (coverageTypes.includes('partial')) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };

  const renderScholarshipCard = (scholarship: Scholarship) => {
    const value = formatScholarshipValue(scholarship);
    const deadline = formatDeadline(scholarship.deadline);
    
    return (
      <div className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
              {scholarship.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <Building className="w-3 h-3" />
              <span>{scholarship.provider}</span>
              {scholarship.linkedSchool && (
                <>
                  <span>•</span>
                  <MapPin className="w-3 h-3" />
                  <span>{scholarship.linkedSchool}</span>
                </>
              )}
            </div>
          </div>
          
          {value && (
            <div className="ml-2 text-right">
              <div className="text-sm font-semibold text-green-600">
                {value}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {scholarship.frequency?.toLowerCase()}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {scholarship.coverage.slice(0, 2).map((coverage, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className={`text-xs px-2 py-0.5 ${getCoverageColor(scholarship.coverage)}`}
            >
              {coverage}
            </Badge>
          ))}
          {scholarship.coverage.length > 2 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              +{scholarship.coverage.length - 2} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{deadline}</span>
            </div>
            {scholarship.eligibility.degreeLevels && scholarship.eligibility.degreeLevels.length > 0 && (
              <div className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                <span>{scholarship.eligibility.degreeLevels[0]}</span>
                {scholarship.eligibility.degreeLevels.length > 1 && (
                  <span>+{scholarship.eligibility.degreeLevels.length - 1}</span>
                )}
              </div>
            )}
          </div>
          
          {scholarship.numberOfAwardsPerYear && (
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>{scholarship.numberOfAwardsPerYear} awards/year</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <Select 
        open={isOpen}
        onOpenChange={setIsOpen}
        value={value} 
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className={`${className} ${selectedScholarship ? 'h-auto min-h-[44px]' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedScholarship ? (
            <div className="flex items-center justify-between w-full py-1">
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{selectedScholarship.title}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{selectedScholarship.provider}</span>
                  {formatScholarshipValue(selectedScholarship) && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">
                        {formatScholarshipValue(selectedScholarship)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        
        <SelectContent className="w-full p-0" align="start" side="bottom" sideOffset={4}>
          {/* Search and Filters */}
          <div className="sticky top-0 bg-white border-b p-3 space-y-3 z-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search scholarships by title, provider, or description..."
                className="pl-10 h-9"
                onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                onFocus={(e: React.FocusEvent) => e.stopPropagation()}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-3 h-3" />
                Filters
                {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
              
              {Object.values(filters).some(v => v) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                <select
                  value={filters.frequency}
                  onChange={(e) => setFilters(prev => ({ ...prev, frequency: e.target.value }))}
                  className="px-2 py-1 text-xs border rounded"
                >
                  <option value="">All Frequencies</option>
                  <option value="One-time">One-time</option>
                  <option value="Annual">Annual</option>
                  <option value="Full Duration">Full Duration</option>
                </select>
                
                <select
                  value={filters.degreeLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, degreeLevel: e.target.value }))}
                  className="px-2 py-1 text-xs border rounded"
                >
                  <option value="">All Degrees</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                  <option value="MBA">MBA</option>
                </select>
                
                <input
                  type="number"
                  placeholder="Min Value"
                  value={filters.minValue}
                  onChange={(e) => setFilters(prev => ({ ...prev, minValue: e.target.value }))}
                  className="px-2 py-1 text-xs border rounded"
                />
                
                <input
                  type="number"
                  placeholder="Max Value"
                  value={filters.maxValue}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                  className="px-2 py-1 text-xs border rounded"
                />
              </div>
            )}
          </div>
          
          {/* Recent Scholarships */}
          {!searchTerm && recentScholarships.length > 0 && (
            <div className="border-b">
              <div className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 flex items-center gap-2">
                <History className="w-3 h-3" />
                Recent Selections
              </div>
              {recentScholarships.map((scholarship: Scholarship) => (
                <div 
                  key={scholarship.id}
                  onClick={() => handleRecentSelect(scholarship)}
                  className="cursor-pointer"
                >
                  {renderScholarshipCard(scholarship)}
                </div>
              ))}
            </div>
          )}
          
          {/* Search Results */}
          <ScrollArea className="max-h-96">
            {isLoading && page === 1 ? (
              <div className="px-3 py-8 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
                Searching scholarships...
              </div>
            ) : isError ? (
              <div className="px-3 py-8 text-center text-red-500">
                Error loading scholarships. Please try again.
              </div>
            ) : scholarships.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-500">
                {searchTerm ? 'No scholarships found matching your search criteria' : 'No scholarships available'}
              </div>
            ) : (
              <div>
                <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50 sticky top-0">
                  {pagination.totalCount ? `${scholarships.length} of ${pagination.totalCount} scholarships` : `${scholarships.length} scholarships`}
                </div>
                
                {scholarships.map((scholarship: Scholarship) => (
                  <SelectItem key={scholarship.id} value={scholarship.id} className="p-0 focus:bg-transparent">
                    <div className="w-full" onClick={() => handleValueChange(scholarship.id)}>
                      {renderScholarshipCard(scholarship)}
                    </div>
                  </SelectItem>
                ))}
                
                {/* Load More Button */}
                {scholarships.length < pagination.totalCount && (
                  <div className="p-3 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadMore}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Loading...' : `Load More (${scholarships.length} of ${pagination.totalCount})`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
} 