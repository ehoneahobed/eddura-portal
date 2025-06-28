'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Program, School } from '@/types';
import { Search, Plus, Edit, Trash2, Clock, DollarSign, Globe, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';

// Helper to get currency symbol from code
const getCurrencySymbol = (code: string) => {
  switch (code) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'CAD': return 'C$';
    case 'AUD': return 'A$';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'INR': return '₹';
    case 'ZAR': return 'R';
    case 'NGN': return '₦';
    case 'GHS': return '₵';
    default: return code;
  }
};

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDegreeType, setSelectedDegreeType] = useState('all');
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
      fetchPrograms();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedSchool, selectedLevel, selectedDegreeType]);

  // Fetch programs when page changes
  useEffect(() => {
    fetchPrograms();
  }, [currentPage]);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        search: searchTerm,
        school: selectedSchool,
        level: selectedLevel,
        degreeType: selectedDegreeType
      });

      const response = await fetch(`/api/programs?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setPrograms(data.programs || []);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 12
        });
      } else {
        throw new Error(data.error || 'Failed to fetch programs');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch programs',
        variant: 'destructive'
      });
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, selectedSchool, selectedLevel, selectedDegreeType, toast]);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      const data = await response.json();
      // Ensure each school has an 'id' property (from 'id' or '_id')
      const schoolsWithId: School[] = data.map((school: any) => ({
        ...school,
        id: school.id || school._id,
      }));
      setSchools(schoolsWithId);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const getSchoolName = (schoolId: any) => {
    if (typeof schoolId === 'object' && schoolId !== null && 'name' in schoolId) {
      return schoolId.name || 'Unknown School';
    }
    const school = schools.find(s => s.id === schoolId);
    return school?.name || 'Unknown School';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Program deleted successfully'
        });
        fetchPrograms(); // Refresh current page
      } else {
        throw new Error('Failed to delete program');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete program',
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
          <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-600">Manage academic programs</p>
        </div>
        <Link href="/admin/programs/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Program
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-2">
        <Select value={selectedSchool} onValueChange={setSelectedSchool}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by School" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Schools</SelectItem>
            {(schools as any[]).map((school, idx) => (
              <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Undergraduate">Undergraduate</SelectItem>
            <SelectItem value="Postgraduate">Postgraduate</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDegreeType} onValueChange={setSelectedDegreeType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Degree Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Degree Types</SelectItem>
            <SelectItem value="Diploma">Diploma</SelectItem>
            <SelectItem value="Bachelor">Bachelor</SelectItem>
            <SelectItem value="Master">Master</SelectItem>
            <SelectItem value="MBA">MBA</SelectItem>
            <SelectItem value="PhD">PhD</SelectItem>
            <SelectItem value="Certificate">Certificate</SelectItem>
            <SelectItem value="Short Course">Short Course</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search programs by name, field, or degree type..."
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
          {pagination.totalCount} programs
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading programs...</span>
          </div>
        </div>
      )}

      {/* Programs Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/admin/programs/${program.id}`}
              className="block group focus:outline-none"
              aria-label={`View details for ${program.name}`}
            >
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer group-focus:ring-2 group-focus:ring-blue-500 relative"
                tabIndex={0}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:underline group-focus:underline">{program.name}</CardTitle>
                      <div className="text-sm text-gray-600 mb-2">
                        {getSchoolName(program.schoolId)}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{program.degreeType}</Badge>
                        <Badge variant="secondary">{program.mode}</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1 z-10" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                      <Link href={`/admin/programs/${program.id}/edit`} tabIndex={-1} legacyBehavior>
                        <Button size="sm" variant="ghost" onClick={e => e.stopPropagation()}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={e => { e.stopPropagation(); handleDelete(program.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{program.fieldOfStudy}</div>
                      {program.subfield && (
                        <div className="text-sm text-gray-500">{program.subfield}</div>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {program.duration}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-1 font-bold">{getCurrencySymbol(program.tuitionFees.currency)}</span>
                      {program.tuitionFees.international.toLocaleString()} {program.tuitionFees.currency}
                      <span className="text-xs text-gray-500 ml-1">(International)</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {program.languages.slice(0, 2).map((language, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          {language}
                        </Badge>
                      ))}
                      {program.languages.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{program.languages.length - 2} more
                        </Badge>
                      )}
                    </div>

                    {program.programSummary && (
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {program.programSummary}
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
      {!isLoading && programs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No programs found</div>
          <div className="text-gray-400 text-sm mt-1">
            {searchTerm || selectedSchool !== 'all' || selectedLevel !== 'all' || selectedDegreeType !== 'all' 
              ? 'Try adjusting your search terms or filters' 
              : 'Create your first program to get started'
            }
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