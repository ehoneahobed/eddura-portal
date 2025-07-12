'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Star,
  Users,
  GraduationCap,
  Globe,
  ArrowRight,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentLayout from '@/components/layout/StudentLayout';

interface School {
  _id: string;
  name: string;
  country: string;
  city: string;
  types: string[];
  globalRanking?: number;
  yearFounded?: number;
  websiteUrl: string;
  logoUrl?: string;
  campusType?: string;
  languagesOfInstruction: string[];
  internationalStudentCount?: number;
  studentFacultyRatio?: string;
  avgLivingCost?: number;
  visaSupportServices?: boolean;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    country: 'all',
    campusType: 'all',
    ranking: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchSchools(1, false);
  }, [searchTerm, selectedFilters.country, selectedFilters.campusType, selectedFilters.ranking]);

  const fetchSchools = async (page = 1, append = false) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/schools?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        if (append) {
          setSchools((prev: School[]) => [...prev, ...data.schools]);
        } else {
          setSchools(data.schools || []);
        }
        
        setHasMore(data.pagination?.hasNextPage || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const clearFilters = () => {
    setSelectedFilters({
      country: 'all',
      campusType: 'all',
      ranking: 'all'
    });
    setSearchTerm('');
    setCurrentPage(1);
    fetchSchools(1, false);
  };

  const getRankingBadge = (ranking?: number) => {
    if (!ranking) return null;
    if (ranking <= 10) return { text: `#${ranking}`, color: 'bg-red-100 text-red-800' };
    if (ranking <= 50) return { text: `#${ranking}`, color: 'bg-orange-100 text-orange-800' };
    if (ranking <= 100) return { text: `#${ranking}`, color: 'bg-yellow-100 text-yellow-800' };
    return { text: `#${ranking}`, color: 'bg-green-100 text-green-800' };
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
              <Building2 className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Schools</h2>
            <p className="text-gray-600">Finding the best universities...</p>
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
            Discover Universities
          </h1>
          <p className="text-gray-600">
            Explore top universities and institutions worldwide to find your perfect academic home.
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
                      placeholder="Search universities by name, country, or city..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2">
                  <Select 
                    value={selectedFilters.country} 
                    onValueChange={(value: string) => setSelectedFilters((prev: any) => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedFilters.ranking} 
                    onValueChange={(value: string) => setSelectedFilters((prev: any) => ({ ...prev, ranking: value }))}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Ranking" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rankings</SelectItem>
                      <SelectItem value="top10">Top 10</SelectItem>
                      <SelectItem value="top50">Top 50</SelectItem>
                      <SelectItem value="top100">Top 100</SelectItem>
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

                  {(searchTerm || Object.values(selectedFilters).some(v => v !== 'all')) && (
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Campus Type</label>
                      <Select 
                        value={selectedFilters.campusType} 
                        onValueChange={(value: string) => setSelectedFilters((prev: any) => ({ ...prev, campusType: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Urban">Urban</SelectItem>
                          <SelectItem value="Suburban">Suburban</SelectItem>
                          <SelectItem value="Rural">Rural</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Language of Instruction</label>
                      <Select defaultValue="all">
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Languages</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Max Living Cost (USD)</label>
                      <Input
                        type="number"
                        placeholder="e.g., 25000"
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
              Showing <span className="font-semibold">{schools.length}</span> universities
              {searchTerm && ` for "${searchTerm}"`}
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select defaultValue="ranking">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ranking">Global Ranking</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="livingCost">Living Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Schools Grid */}
        {schools.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {schools.map((school: School, index: number) => (
              <motion.div
                key={school._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Header */}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                          {school.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{school.city}, {school.country}</span>
                        </div>
                      </div>
                      
                                             {school.globalRanking && getRankingBadge(school.globalRanking) && (
                         <Badge>
                           {getRankingBadge(school.globalRanking)?.text}
                         </Badge>
                       )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* School Type */}
                    {school.types && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                                                   {school.types.slice(0, 2).map((type, index) => (
                           <Badge key={index}>
                             {type}
                           </Badge>
                         ))}
                         {school.types.length > 2 && (
                           <Badge>
                             +{school.types.length - 2}
                           </Badge>
                         )}
                        </div>
                      </div>
                    )}

                    {/* Key Stats */}
                    <div className="space-y-2 mb-4">
                      {school.yearFounded && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            Founded {school.yearFounded}
                          </span>
                        </div>
                      )}
                      
                      {school.internationalStudentCount && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {school.internationalStudentCount.toLocaleString()} international students
                          </span>
                        </div>
                      )}

                      {school.studentFacultyRatio && (
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            Student-faculty ratio: {school.studentFacultyRatio}
                          </span>
                        </div>
                      )}

                      {school.avgLivingCost && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            Avg. living cost: ${school.avgLivingCost.toLocaleString()}/year
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Languages */}
                    {school.languagesOfInstruction && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">Languages of Instruction:</p>
                        <div className="flex flex-wrap gap-1">
                                                     {school.languagesOfInstruction.map((language, index) => (
                             <Badge key={index}>
                               {language}
                             </Badge>
                           ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                                                 {school.visaSupportServices && (
                           <Badge>
                             Visa Support
                           </Badge>
                         )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                        
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Visit Website
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No universities found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find more universities.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </motion.div>
        )}

        {/* Load More */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                setIsLoadingMore(true);
                fetchSchools(currentPage + 1, true);
              }}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Load More Universities'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </StudentLayout>
  );
}