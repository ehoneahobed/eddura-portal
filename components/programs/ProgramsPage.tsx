'use client';

import { useState, useEffect, useCallback } from 'react';
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
import Image from 'next/image';

import ProgramCard from './ProgramCard';
import SchoolCard from './SchoolCard';
import { ResponsiveContainer } from '../ui/responsive-container';
import { usePageTranslation, useCommonTranslation } from '@/hooks/useTranslation';

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
  const { t } = usePageTranslation('programs');
  const { t: tCommon } = useCommonTranslation();
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
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  const fetchSchools = useCallback(async () => {
    setIsLoadingSchools(true);
    try {
      const params = new URLSearchParams({
        page: schoolPagination.currentPage.toString(),
        limit: schoolPagination.limit.toString(),
        search: schoolSearch,
      });

      const response = await fetch(`/api/schools?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
        setSchoolPagination(prev => data.pagination || prev);
      } else {
        console.error('Failed to fetch schools:', response.status, response.statusText);
        setSchools([]);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      setSchools([]);
    } finally {
      setIsLoadingSchools(false);
    }
  }, [schoolSearch, schoolPagination.currentPage, schoolPagination.limit]);

  const filterPrograms = useCallback(() => {
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
        program.fieldOfStudy === selectedFilters.fieldOfStudy
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

    // Max tuition filter
    if (selectedFilters.maxTuition) {
      filtered = filtered.filter(program =>
        program.tuitionFees.international <= parseInt(selectedFilters.maxTuition)
      );
    }

    setFilteredPrograms(filtered);
  }, [programs, searchTerm, selectedFilters]);

  // Fetch programs for a specific school
  const fetchPrograms = useCallback(async (schoolId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/programs?schoolId=${schoolId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      } else {
        console.error('Failed to fetch programs:', response.status, response.statusText);
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]); // Only run on mount

  // Fetch programs when a school is selected
  useEffect(() => {
    if (selectedSchool) {
      fetchPrograms(selectedSchool._id);
    } else {
      setPrograms([]);
      setFilteredPrograms([]);
    }
  }, [selectedSchool, fetchPrograms]);

  // Only filter programs if a school is selected
  useEffect(() => {
    if (selectedSchool) {
      filterPrograms();
    }
  }, [filterPrograms, selectedSchool]);



  // Handle school search with debouncing
  const handleSchoolSearch = (value: string) => {
    setSchoolSearch(value);
    setSchoolPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSchools();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [schoolSearch, fetchSchools]);

  // Handle pagination changes
  useEffect(() => {
    if (schoolPagination.currentPage > 1) { // Don't fetch on initial load
      fetchSchools();
    }
  }, [schoolPagination.currentPage, fetchSchools]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setSchoolPagination(prev => ({ ...prev, currentPage: page }));
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
      // <div className="min-h-screen bg-gradient-to-br from-eddura-50 via-white to-eddura-100 dark:from-[var(--eddura-primary-900)] dark:via-[var(--eddura-primary-900)] dark:to-[var(--eddura-primary-800)]">
      <ResponsiveContainer maxWidth="8xl" padding="md" className="py-4 sm:py-8">
        {/* Hero Section */}
        <div className="bg-white dark:bg-[var(--eddura-primary-900)] border-b border-gray-100 dark:border-[var(--eddura-primary-800)]">
          <div className=" mx-auto px-4 py-12">
            <div >
              {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-teal rounded-full mb-6 shadow-eddura">
                <Building className="w-8 h-8 text-white" />
              </div> */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('title')}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 ">{t('subtitle')}</p>
              

            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className=" mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder={t('searchSchools')}
                value={schoolSearch}
                onChange={e => handleSchoolSearch(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-eddura-500 focus:ring-2 focus:ring-eddura-200 rounded-xl shadow-sm dark:border-[var(--eddura-primary-700)] dark:bg-[var(--eddura-primary-800)] dark:text-white dark:placeholder:text-[var(--eddura-primary-300)]"
              />
            </div>
            {schoolSearch && (
              <p className="text-sm text-gray-500 mt-2 text-center">{t('searchingFor', { term: schoolSearch })}</p>
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
                <div className="w-20 h-20 bg-gradient-teal rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-eddura">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('loadingSchools')}</h2>
                <p className="text-gray-600">{t('loadingSchoolsSubtitle')}</p>
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
                  {t('showingSchools', { count: schools.length, total: schoolPagination.totalCount })}
                  {schoolSearch ? ` ${t('matching', { term: schoolSearch })}` : ''}
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
                    className="px-6 py-2 hover:bg-eddura-50 hover:border-eddura-200 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    {tCommon('actions.previous')}
                  </Button>

                  <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{t('pageOf', { page: schoolPagination.currentPage, total: schoolPagination.totalPages })}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                      <span className="text-sm text-gray-500">{t('schoolsTotal', { total: schoolPagination.totalCount.toLocaleString() })}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handlePageChange(schoolPagination.currentPage + 1)}
                    disabled={!schoolPagination.hasNextPage}
                    className="px-6 py-2 hover:bg-eddura-50 hover:border-eddura-200 transition-colors"
                  >
                    {tCommon('actions.next')}
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              )}

                                      {schools.length === 0 && !isLoadingSchools && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {schoolSearch ? t('noSchools') : t('unableToLoadSchools')}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {schoolSearch ? t('noSchoolsHelp') : t('loadSchoolsError')}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSchoolSearch('')}
                      className="px-6 py-2"
                    >
                      {t('viewAllSchools')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                      className="px-6 py-2"
                    >
                      {t('refreshPage')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      {/* </div> */}
    </ResponsiveContainer>
  );
  }

  // Show programs for the selected school
  return (
    <ResponsiveContainer maxWidth="8xl" padding="md" className="py-4 sm:py-8">
      {/* Header with back button and school info */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedSchool(null)}
          className="mb-4 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t('backToSchools')}
        </Button>
        
        <div className="flex items-center gap-4 mb-6">
          {selectedSchool.logoUrl && (
            <Image
              src={selectedSchool.logoUrl}
              alt={selectedSchool.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-lg object-cover border"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedSchool.name}</h1>
            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {selectedSchool.city}, {selectedSchool.country}
              {selectedSchool.globalRanking && (
                <span className="ml-2 text-sm text-eddura-600 dark:text-eddura-300">
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
                    placeholder={t('searchPrograms')}
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
                    <SelectValue placeholder={t('filters.degreeType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allDegrees')}</SelectItem>
                    <SelectItem value="Bachelor">{t('degrees.bachelor')}</SelectItem>
                    <SelectItem value="Master">{t('degrees.master')}</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedFilters.mode} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, mode: value }))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={t('filters.mode')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allModes')}</SelectItem>
                    <SelectItem value="Full-time">{t('modes.fullTime')}</SelectItem>
                    <SelectItem value="Part-time">{t('modes.partTime')}</SelectItem>
                    <SelectItem value="Online">{t('modes.online')}</SelectItem>
                    <SelectItem value="Hybrid">{t('modes.hybrid')}</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {t('filters.button')}
                </Button>

                {(searchTerm || Object.values(selectedFilters).some(v => v)) && (
                  <Button variant="ghost" onClick={clearFilters}>
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
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Field of Study */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('filters.fieldOfStudy')}</label>
                    <Select value={selectedFilters.fieldOfStudy} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, fieldOfStudy: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t('filters.selectField')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('filters.allFields')}</SelectItem>
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
                    <label className="text-sm font-medium text-gray-700">{t('filters.programLevel')}</label>
                    <Select value={selectedFilters.programLevel} onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, programLevel: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t('filters.selectLevel')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('filters.allLevels')}</SelectItem>
                        <SelectItem value="Undergraduate">{t('levels.undergraduate')}</SelectItem>
                        <SelectItem value="Postgraduate">{t('levels.postgraduate')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('filters.country')}</label>
                    <Input
                      type="text"
                      placeholder={t('filters.countryPlaceholder')}
                      value={selectedFilters.country}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, country: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  {/* Max Tuition */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('filters.maxTuition')}</label>
                    <Input
                      type="number"
                      placeholder={t('filters.maxTuitionPlaceholder')}
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
          <p className="text-gray-600">{t('results.showingPrograms', { count: filteredPrograms.length })}{searchTerm ? ` ${t('results.for', { term: searchTerm })}` : ''}</p>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{t('sort.label')}</span>
            <Select defaultValue="relevance">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{t('sort.options.relevance')}</SelectItem>
                <SelectItem value="ranking">{t('sort.options.ranking')}</SelectItem>
                <SelectItem value="tuition">{t('sort.options.tuition')}</SelectItem>
                <SelectItem value="deadline">{t('sort.options.deadline')}</SelectItem>
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
            <div className="w-16 h-16 bg-gradient-teal rounded-full flex items-center justify-center mx-auto mb-4 shadow-eddura">
              <GraduationCap className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('loadingPrograms')}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t('loadingProgramsSubtitle', { school: selectedSchool.name })}</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('empty.title')}</h3>
            <p className="text-gray-600 mb-4">{t('empty.description')}</p>
          <Button onClick={clearFilters} variant="outline">
            {t('empty.clearAllFilters')}
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
            {t('loadMore')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </ResponsiveContainer>
  );
}
