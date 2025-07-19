'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  GraduationCap, 
  DollarSign, 
  Calendar,
  MapPin,
  BookOpen,
  Star,
  Heart,
  Share2,
  ArrowRight,
  Globe,
  Users,
  Award,
  ChevronLeft, ChevronRight, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import ProgramCard from './ProgramCard';
import SchoolCard from './SchoolCard';

interface School {
  _id: string;
  name: string;
  country: string;
  city: string;
  globalRanking?: number;
  logoUrl?: string;
  yearFounded?: number;
  internationalStudentCount?: number;
  languagesOfInstruction?: string[];
  campusType?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface Program {
  _id: string;
  name: string;
  degreeType: 'Diploma' | 'Bachelor' | 'Master' | 'MBA' | 'PhD' | 'Certificate' | 'Short Course';
  fieldOfStudy: string;
  subfield?: string;
  mode: 'Full-time' | 'Part-time' | 'Online' | 'Hybrid';
  duration: string;
  languages: string[];
  applicationDeadlines: string[];
  intakeSessions: string[];
  tuitionFees: {
    local: number;
    international: number;
    currency: string;
  };
  availableScholarships?: string[];
  applicationFee?: number;
  employabilityRank?: number;
  programLevel: 'Undergraduate' | 'Postgraduate';
  school: {
    _id: string;
    name: string;
    country: string;
    city: string;
    globalRanking?: number;
  };
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    degreeType: 'all',
    fieldOfStudy: 'all',
    mode: 'all',
    programLevel: 'all',
    country: '',
    minRanking: '',
    maxTuition: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolPagination, setSchoolPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12
  });
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);

  // Fetch schools on mount and when search/pagination changes
  useEffect(() => {
    fetchSchools();
  }, [schoolSearch, schoolPagination.currentPage]);

  // Fetch programs when a school is selected
  useEffect(() => {
    if (selectedSchool) {
      fetchPrograms(selectedSchool._id);
    } else {
      setPrograms([]);
      setFilteredPrograms([]);
    }
  }, [selectedSchool]);

  // Only filter programs if a school is selected
  useEffect(() => {
    if (selectedSchool) {
      filterPrograms();
    }
  }, [programs, searchTerm, selectedFilters, selectedSchool]);

  const fetchSchools = async () => {
    setIsLoadingSchools(true);
    try {
      const params = new URLSearchParams({
        page: schoolPagination.currentPage.toString(),
        limit: schoolPagination.limit.toString(),
        ...(schoolSearch && { search: schoolSearch })
      });
      
      const response = await fetch(`/api/schools?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
        setSchoolPagination(data.pagination || schoolPagination);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  // Handle school search with debouncing
  const handleSchoolSearch = (value: string) => {
    setSchoolSearch(value);
    setSchoolPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setSchoolPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Fetch programs for a specific school
  const fetchPrograms = async (schoolId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/programs?schoolId=${schoolId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = [...programs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.fieldOfStudy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.school.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Degree type filter
    if (selectedFilters.degreeType && selectedFilters.degreeType !== 'all') {
      filtered = filtered.filter(program =>
        program.degreeType === selectedFilters.degreeType
      );
    }

    // Field of study filter
    if (selectedFilters.fieldOfStudy && selectedFilters.fieldOfStudy !== 'all') {
      filtered = filtered.filter(program =>
        program.fieldOfStudy.toLowerCase().includes(selectedFilters.fieldOfStudy.toLowerCase())
      );
    }

    // Mode filter
    if (selectedFilters.mode && selectedFilters.mode !== 'all') {
      filtered = filtered.filter(program =>
        program.mode === selectedFilters.mode
      );
    }

    // Program level filter
    if (selectedFilters.programLevel && selectedFilters.programLevel !== 'all') {
      filtered = filtered.filter(program =>
        program.programLevel === selectedFilters.programLevel
      );
    }

    // Country filter
    if (selectedFilters.country) {
      filtered = filtered.filter(program =>
        program.school.country.toLowerCase().includes(selectedFilters.country.toLowerCase())
      );
    }

    // Ranking filter
    if (selectedFilters.minRanking) {
      filtered = filtered.filter(program =>
        program.school.globalRanking && program.school.globalRanking <= parseInt(selectedFilters.minRanking)
      );
    }

    // Tuition filter
    if (selectedFilters.maxTuition) {
      filtered = filtered.filter(program =>
        program.tuitionFees.international <= parseInt(selectedFilters.maxTuition)
      );
    }

    setFilteredPrograms(filtered);
  };

  const clearFilters = () => {
    setSelectedFilters({
      degreeType: 'all',
      fieldOfStudy: 'all',
      mode: 'all',
      programLevel: 'all',
      country: '',
      minRanking: '',
      maxTuition: ''
    });
    setSearchTerm('');
  };

  // School search filter
  const filteredSchools = schoolSearch
    ? schools.filter(school =>
        school.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        school.country.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        school.city.toLowerCase().includes(schoolSearch.toLowerCase())
      )
    : schools;

  if (!selectedSchool) {
    // Show school selection UI with pagination
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-6">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Browse Programs by School
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover academic programs from top universities around the world. 
                Select a school to explore their available programs and find your perfect academic path.
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search schools by name, country, or city..."
                value={schoolSearch}
                onChange={e => handleSchoolSearch(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm"
              />
            </div>
            {schoolSearch && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Searching for &quot;{schoolSearch}&quot;...
              </p>
            )}
          </div>

          {/* Schools Grid */}
          {isLoadingSchools ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Schools</h2>
                <p className="text-gray-600">Finding the best universities around the world...</p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-8 text-center">
                <motion.p 
                  className="text-gray-600"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Showing <span className="font-semibold text-blue-600">{schools.length}</span> of{' '}
                  <span className="font-semibold">{schoolPagination.totalCount}</span> schools
                  {schoolSearch && ` matching &quot;${schoolSearch}&quot;`}
                </motion.p>
              </div>

              {/* Schools Grid */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {schools.map((school, index) => (
                  <motion.div
                    key={school._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -2 }}
                  >
                    <SchoolCard school={school} onSelect={setSelectedSchool} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination Controls */}
              {schoolPagination.totalPages > 1 && (
                <motion.div 
                  className="flex items-center justify-center gap-6 mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handlePageChange(schoolPagination.currentPage - 1)}
                    disabled={!schoolPagination.hasPrevPage}
                    className="px-6 py-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Page {schoolPagination.currentPage} of {schoolPagination.totalPages}
                      </span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <span className="text-sm text-gray-500">
                      {schoolPagination.totalCount.toLocaleString()} schools total
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handlePageChange(schoolPagination.currentPage + 1)}
                    disabled={!schoolPagination.hasNextPage}
                    className="px-6 py-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {schools.length === 0 && !isLoadingSchools && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No schools found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We couldn&apos;t find any schools matching your search criteria. 
                    Try adjusting your search terms or browse all schools.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSchoolSearch('')}
                    className="px-6 py-2"
                  >
                    View All Schools
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Show programs for the selected school
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header with back button and school info */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedSchool(null)}
          className="mb-4 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Schools
        </Button>
        
        <div className="flex items-center gap-4 mb-6">
          {selectedSchool.logoUrl && (
            <img
              src={selectedSchool.logoUrl}
              alt={selectedSchool.name}
              className="w-16 h-16 rounded-lg object-cover border"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedSchool.name}</h1>
            <p className="text-gray-600 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {selectedSchool.city}, {selectedSchool.country}
              {selectedSchool.globalRanking && (
                <span className="ml-2 text-sm text-blue-600">
                  • #{selectedSchool.globalRanking} Global Ranking
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
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
                    placeholder="Search programs by name, field, or university..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <Select value={selectedFilters.degreeType} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, degreeType: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Degree Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Degrees</SelectItem>
                    <SelectItem value="Bachelor">Bachelor</SelectItem>
                    <SelectItem value="Master">Master</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedFilters.mode} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, mode: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Field of Study */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Field of Study</label>
                    <Select value={selectedFilters.fieldOfStudy} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, fieldOfStudy: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Fields</SelectItem>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Medicine">Medicine</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Social Sciences">Social Sciences</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Program Level */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Program Level</label>
                    <Select value={selectedFilters.programLevel} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, programLevel: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <Input
                      type="text"
                      placeholder="e.g., United States"
                      value={selectedFilters.country}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, country: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  {/* Max Tuition */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Max Tuition (USD)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      value={selectedFilters.maxTuition}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, maxTuition: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
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
            Showing <span className="font-semibold">{filteredPrograms.length}</span> programs
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
                <SelectItem value="ranking">University Ranking</SelectItem>
                <SelectItem value="tuition">Tuition (Low to High)</SelectItem>
                <SelectItem value="deadline">Application Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Programs Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-[#007fbd] rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Programs</h2>
            <p className="text-gray-600">Finding the best academic opportunities at {selectedSchool.name}...</p>
          </motion.div>
        </div>
      ) : filteredPrograms.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPrograms.map((program, index) => (
            <motion.div
              key={program._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <ProgramCard program={program} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find more programs.
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear all filters
          </Button>
        </motion.div>
      )}

      {/* Load More */}
      {filteredPrograms.length >= 50 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-8"
        >
          <Button variant="outline" size="lg">
            Load More Programs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
