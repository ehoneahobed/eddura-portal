"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, School as SchoolIcon, BookOpen, Clock, DollarSign, Search, XCircle, Globe, Languages, Calendar, AlertCircle } from "lucide-react";
import { usePrograms } from "@/hooks/use-programs";

function getNextDeadline(deadlines: string[]): string | null {
  if (!deadlines || deadlines.length === 0) return null;
  const now = new Date();
  const future = deadlines
    .map((d) => new Date(d))
    .filter((d) => d > now)
    .sort((a, b) => a.getTime() - b.getTime());
  return future.length > 0 ? future[0].toLocaleDateString() : null;
}

// Loading skeleton for program cards
function ProgramCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg animate-fade-in">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-full mt-3" />
      </CardContent>
    </Card>
  );
}

export default function ProgramsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [degreeType, setDegreeType] = useState("all");
  const [mode, setMode] = useState("all");
  const [country, setCountry] = useState("all");
  const [field, setField] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use the programs hook with pagination and proper parameters
  const { programs, pagination, isLoading, isError } = usePrograms({ 
    page: currentPage,
    limit: 12,
    search, 
    degreeType: degreeType === "all" ? undefined : degreeType, 
    fieldOfStudy: field === "all" ? undefined : field, 
    country: country === "all" ? undefined : country 
  });

  // Debug logging
  useEffect(() => {
    console.log('Programs data:', {
      count: programs?.length || 0,
      pagination,
      isLoading,
      isError,
      sampleProgram: programs?.[0]
    });
  }, [programs, pagination, isLoading, isError]);

  // Extract unique filter options from loaded programs
  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    programs?.forEach((p: any) => {
      if (p.schoolId && typeof p.schoolId === "object" && p.schoolId.country) {
        set.add(p.schoolId.country);
      }
    });
    return Array.from(set).sort();
  }, [programs]);

  const fieldOptions = useMemo(() => {
    const set = new Set<string>();
    programs?.forEach((p: any) => {
      if (p.fieldOfStudy) set.add(p.fieldOfStudy);
    });
    return Array.from(set).sort();
  }, [programs]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1); // Reset to first page when filters change
    switch (filterType) {
      case 'search':
        setSearch(value);
        break;
      case 'degreeType':
        setDegreeType(value);
        break;
      case 'mode':
        setMode(value);
        break;
      case 'country':
        setCountry(value);
        break;
      case 'field':
        setField(value);
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setDegreeType("all");
    setMode("all");
    setCountry("all");
    setField("all");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <SchoolIcon className="h-7 w-7 text-blue-600" />
          Discover Programs
        </h1>
        <p className="text-gray-600">Find academic programs and universities that match your career goals and preferences.</p>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Debug Info:</span>
            </div>
            <div className="text-xs text-yellow-700 mt-1">
              Programs loaded: {programs?.length || 0} | 
              Total: {pagination?.totalCount || 0} | 
              Page: {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
            </div>
          </div>
        )}
      </header>

      {/* Search and Filters */}
      <section className="mb-8 flex flex-col md:flex-row md:items-center gap-4 animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search programs by name or university..."
            value={search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 h-12 text-lg"
            aria-label="Search programs"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={degreeType}
            onChange={(e) => handleFilterChange('degreeType', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            aria-label="Degree Type"
          >
            <option value="all">All Degrees</option>
            <option value="Diploma">Diploma</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
            <option value="MBA">MBA</option>
            <option value="PhD">PhD</option>
            <option value="Certificate">Certificate</option>
            <option value="Short Course">Short Course</option>
          </select>
          <select
            value={mode}
            onChange={(e) => handleFilterChange('mode', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            aria-label="Mode"
          >
            <option value="all">All Modes</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Online">Online</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          <select
            value={country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            aria-label="Country"
          >
            <option value="all">All Countries</option>
            {countryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={field}
            onChange={(e) => handleFilterChange('field', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            aria-label="Field of Study"
          >
            <option value="all">All Fields</option>
            {fieldOptions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          {(degreeType !== "all" || mode !== "all" || country !== "all" || field !== "all" || search) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} aria-label="Clear filters">
              <XCircle className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </section>

      {/* Programs Grid */}
      <section className="animate-fade-in">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProgramCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Failed to load programs</h2>
              <p className="text-gray-500 mb-4">Please try refreshing the page or contact support if the problem persists.</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        ) : programs && programs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program: any) => (
                <Card key={program.id || program._id} className="border-0 shadow-lg hover:shadow-xl transition-shadow group animate-slide-in-up program-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      {program.name || "Unnamed Program"}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <SchoolIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 font-medium">
                        {program.schoolId?.name || "Unknown School"}
                      </span>
                      {program.schoolId?.country && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                          <Globe className="h-3 w-3" />
                          {program.schoolId.country}
                        </span>
                      )}
                      {program.schoolId?.city && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 ml-2">
                          {program.schoolId.city}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                        {program.degreeType}
                      </Badge>
                      <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs font-medium">
                        {program.fieldOfStudy}
                      </Badge>
                      <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium">
                        {program.mode}
                      </Badge>
                      <Badge className="bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium">
                        {program.programLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {program.duration}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Local: {program.tuitionFees?.local ? `${program.tuitionFees.currency} ${program.tuitionFees.local.toLocaleString()}` : "-"}
                      <span className="mx-1 text-gray-400">|</span>
                      Intl: {program.tuitionFees?.international ? `${program.tuitionFees.currency} ${program.tuitionFees.international.toLocaleString()}` : "-"}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 items-center">
                      {program.languages && program.languages.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Languages className="h-3 w-3" />
                          {program.languages.join(", ")}
                        </span>
                      )}
                      {program.intakeSessions && program.intakeSessions.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {program.intakeSessions.join(", ")}
                        </span>
                      )}
                      {program.applicationDeadlines && program.applicationDeadlines.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next Deadline: {getNextDeadline(program.applicationDeadlines)}
                        </span>
                      )}
                    </div>
                    {program.programSummary && (
                      <p className="text-gray-700 text-sm mt-2 line-clamp-3">
                        {program.programSummary}
                      </p>
                    )}
                    <Button 
                      className="w-full mt-3 group-hover:bg-blue-700 transition-all" 
                      variant="outline" 
                      aria-label="View Details"
                      onClick={() => router.push(`/programs/${program.id || program._id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No programs found</h2>
            <p className="text-gray-500 mb-4">Try adjusting your search terms or filters to find more programs.</p>
            <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
          </div>
        )}
      </section>
    </div>
  );
} 