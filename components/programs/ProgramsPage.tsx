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
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentLayout from '@/components/layout/StudentLayout';
import ProgramCard from './ProgramCard';

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
    degreeType: '',
    fieldOfStudy: '',
    mode: '',
    programLevel: '',
    country: '',
    minRanking: '',
    maxTuition: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [programs, searchTerm, selectedFilters]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs?limit=50');
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
    if (selectedFilters.degreeType) {
      filtered = filtered.filter(program =>
        program.degreeType === selectedFilters.degreeType
      );
    }

    // Field of study filter
    if (selectedFilters.fieldOfStudy) {
      filtered = filtered.filter(program =>
        program.fieldOfStudy.toLowerCase().includes(selectedFilters.fieldOfStudy.toLowerCase())
      );
    }

    // Mode filter
    if (selectedFilters.mode) {
      filtered = filtered.filter(program =>
        program.mode === selectedFilters.mode
      );
    }

    // Program level filter
    if (selectedFilters.programLevel) {
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
      degreeType: '',
      fieldOfStudy: '',
      mode: '',
      programLevel: '',
      country: '',
      minRanking: '',
      maxTuition: ''
    });
    setSearchTerm('');
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
              <GraduationCap className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Programs</h2>
            <p className="text-gray-600">Finding the best academic opportunities...</p>
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
            Discover Programs
          </h1>
          <p className="text-gray-600">
            Find academic programs and universities that match your career goals and preferences.
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
                      <SelectItem value="">All Degrees</SelectItem>
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
                      <SelectItem value="">All Modes</SelectItem>
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
                          <SelectItem value="">All Fields</SelectItem>
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
                          <SelectItem value="">All Levels</SelectItem>
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
        {filteredPrograms.length > 0 ? (
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
    </StudentLayout>
  );
}