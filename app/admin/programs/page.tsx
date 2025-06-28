'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePrograms } from '@/hooks/use-programs';
import { useSchoolsList } from '@/hooks/use-schools';
import { Search, Plus, Edit, Trash2, Clock, DollarSign, Globe, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';

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

export default function ProgramsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDegreeType, setSelectedDegreeType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  // Use SWR hooks for data
  const { programs, pagination, isLoading, isError, mutate } = usePrograms({
    page: currentPage,
    limit: 12,
    search: debouncedSearch,
    schoolId: selectedSchool !== 'all' ? selectedSchool : undefined,
    degreeType: selectedDegreeType !== 'all' ? selectedDegreeType : undefined,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { schools } = useSchoolsList();

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSchoolChange = (value: string) => {
    setSelectedSchool(value);
    setCurrentPage(1);
  };

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    setCurrentPage(1);
  };

  const handleDegreeTypeChange = (value: string) => {
    setSelectedDegreeType(value);
    setCurrentPage(1);
  };

  const getSchoolName = (schoolId: any) => {
    if (typeof schoolId === 'object' && schoolId !== null && 'name' in schoolId) {
      return schoolId.name || 'Unknown School';
    }
    const school = schools.find((s: any) => s.id === schoolId);
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
        mutate(); // Refresh data using SWR
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

  // Handle error state
  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load programs</p>
          <Button onClick={() => mutate()}>Try Again</Button>
        </div>
      </div>
    );
  }

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
        <Select value={selectedSchool} onValueChange={handleSchoolChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by School" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Schools</SelectItem>
            {schools.map((school: any) => (
              <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={handleLevelChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Undergraduate">Undergraduate</SelectItem>
            <SelectItem value="Postgraduate">Postgraduate</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDegreeType} onValueChange={handleDegreeTypeChange}>
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
          placeholder="Search programs by name, field of study, or school..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
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
                        <Badge variant="secondary">{program.degreeType}</Badge>
                        <Badge variant="outline">{program.programLevel}</Badge>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(program.id);
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
                      <span className="text-gray-600">Field:</span>
                      <span className="font-medium">{program.fieldOfStudy}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{program.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tuition (Int&apos;l):</span>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        <span>
                          {getCurrencySymbol(program.tuitionFees.currency)}
                          {program.tuitionFees.international.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Mode:</span>
                      <Badge variant="outline" className="text-xs">{program.mode}</Badge>
                    </div>
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
          <div className="text-gray-500 mb-4">
            <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No programs found</p>
            <p className="text-sm">Try adjusting your search criteria or add a new program.</p>
          </div>
          <Link href="/admin/programs/create">
            <Button>Add First Program</Button>
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