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
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentLayout from '@/components/layout/StudentLayout';
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

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    degreeLevel: '',
    fieldOfStudy: '',
    frequency: '',
    minValue: '',
    maxValue: '',
    nationality: '',
    minGPA: '',
    hasEssay: false,
    hasCV: false,
    hasRecommendations: false
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchScholarships();
  }, []);

  useEffect(() => {
    filterScholarships();
  }, [scholarships, searchTerm, selectedFilters]);

  const fetchScholarships = async () => {
    try {
      const response = await fetch('/api/scholarships?limit=50');
      if (response.ok) {
        const data = await response.json();
        setScholarships(data.scholarships || []);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterScholarships = () => {
    let filtered = [...scholarships];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(scholarship =>
        scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.scholarshipDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.eligibility.fieldsOfStudy?.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Degree level filter
    if (selectedFilters.degreeLevel) {
      filtered = filtered.filter(scholarship =>
        scholarship.eligibility.degreeLevels?.includes(selectedFilters.degreeLevel)
      );
    }

    // Field of study filter
    if (selectedFilters.fieldOfStudy) {
      filtered = filtered.filter(scholarship =>
        scholarship.eligibility.fieldsOfStudy?.some(field =>
          field.toLowerCase().includes(selectedFilters.fieldOfStudy.toLowerCase())
        )
      );
    }

    // Frequency filter
    if (selectedFilters.frequency) {
      filtered = filtered.filter(scholarship =>
        scholarship.frequency === selectedFilters.frequency
      );
    }

    // Value range filter
    if (selectedFilters.minValue || selectedFilters.maxValue) {
      filtered = filtered.filter(scholarship => {
        if (typeof scholarship.value === 'number') {
          const value = scholarship.value;
          const min = selectedFilters.minValue ? parseFloat(selectedFilters.minValue) : 0;
          const max = selectedFilters.maxValue ? parseFloat(selectedFilters.maxValue) : Infinity;
          return value >= min && value <= max;
        }
        return true;
      });
    }

    // Nationality filter
    if (selectedFilters.nationality) {
      filtered = filtered.filter(scholarship =>
        scholarship.eligibility.nationalities?.includes(selectedFilters.nationality)
      );
    }

    setFilteredScholarships(filtered);
  };

  const clearFilters = () => {
    setSelectedFilters({
      degreeLevel: '',
      fieldOfStudy: '',
      frequency: '',
      minValue: '',
      maxValue: '',
      nationality: '',
      minGPA: '',
      hasEssay: false,
      hasCV: false,
      hasRecommendations: false
    });
    setSearchTerm('');
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
      <StudentLayout>
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
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
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
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2">
                  <Select value={selectedFilters.degreeLevel} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, degreeLevel: value }))}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Degree Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedFilters.frequency} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="One-time">One-time</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="Full Duration">Full Duration</SelectItem>
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

                  {(searchTerm || Object.values(selectedFilters).some(v => v)) && (
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
                    onFiltersChange={setSelectedFilters}
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
              Showing <span className="font-semibold">{filteredScholarships.length}</span> scholarships
              {searchTerm && ` for "${searchTerm}"`}
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select defaultValue="relevance">
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

        {/* Load More */}
        {filteredScholarships.length >= 50 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <Button variant="outline" size="lg">
              Load More Scholarships
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </StudentLayout>
  );
}