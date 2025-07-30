"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GraduationCap, 
  School as SchoolIcon, 
  Clock, 
  DollarSign, 
  Globe, 
  Languages, 
  Calendar, 
  ArrowLeft,
  MapPin,
  Users,
  BookOpen,
  Award,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { useProgram } from "@/hooks/use-programs";

function getNextDeadline(deadlines: string[]): string | null {
  if (!deadlines || deadlines.length === 0) return null;
  const now = new Date();
  const future = deadlines
    .map((d) => new Date(d))
    .filter((d) => d > now)
    .sort((a, b) => a.getTime() - b.getTime());
  return future.length > 0 ? future[0].toLocaleDateString() : null;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Loading skeleton for program details
function ProgramDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-6 w-96" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;
  
  const { program, isLoading, isError } = useProgram(programId);

  // Debug logging
  useEffect(() => {
    console.log('Program detail data:', {
      programId,
      program,
      isLoading,
      isError
    });
  }, [programId, program, isLoading, isError]);

  if (isLoading) {
    return <ProgramDetailSkeleton />;
  }

  if (isError || !program) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Program not found</h2>
            <p className="text-gray-500 mb-4">The program you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Button variant="outline" onClick={() => router.push('/programs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/programs')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-blue-600" />
          {program.name}
        </h1>
        
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <SchoolIcon className="h-5 w-5" />
            <span className="font-medium">
              {(program.schoolId as any)?.name || "Unknown School"}
            </span>
          </div>
          {(program.schoolId as any)?.country && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{(program.schoolId as any).country}</span>
            </div>
          )}
          {(program.schoolId as any)?.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{(program.schoolId as any).city}</span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Program Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Program Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {program.programOverview && (
                <p className="text-gray-700 leading-relaxed">{program.programOverview}</p>
              )}
              {program.programSummary && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                  <p className="text-gray-600">{program.programSummary}</p>
                </div>
              )}
              {program.learningOutcomes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Learning Outcomes</h4>
                  <p className="text-gray-600">{program.learningOutcomes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admission Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Admission Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {program.admissionRequirements?.minGPA && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    <strong>Minimum GPA:</strong> {program.admissionRequirements.minGPA}/4.0
                  </span>
                </div>
              )}
              
              {program.admissionRequirements?.requiredDegrees && program.admissionRequirements.requiredDegrees.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Degrees</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {program.admissionRequirements.requiredDegrees.map((degree, index) => (
                      <li key={index}>{degree}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {program.admissionRequirements?.requiredTests && program.admissionRequirements.requiredTests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Tests</h4>
                  <div className="space-y-2">
                    {program.admissionRequirements.requiredTests.map((test, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">
                          {test.name}: Minimum {test.minScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {program.admissionRequirements?.lettersOfRecommendation && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    <strong>Letters of Recommendation:</strong> {program.admissionRequirements.lettersOfRecommendation} required
                  </span>
                </div>
              )}
              
              {program.admissionRequirements?.detailedRequirementNote && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Additional Requirements</h4>
                  <p className="text-gray-600 whitespace-pre-line">{program.admissionRequirements.detailedRequirementNote}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teaching Methodology & Career Outcomes */}
          {((program.teachingMethodology && program.teachingMethodology.length > 0) || (program.careerOutcomes && program.careerOutcomes.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-purple-600" />
                  Program Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.teachingMethodology && program.teachingMethodology.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Teaching Methodology</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {program.teachingMethodology.map((method, index) => (
                        <li key={index}>{method}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {program.careerOutcomes && program.careerOutcomes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Career Outcomes</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {program.careerOutcomes.map((outcome, index) => (
                        <li key={index}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {program.alumniDetails && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Alumni Network</h4>
                    <p className="text-gray-600 whitespace-pre-line">{program.alumniDetails}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Program Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Program Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                  {program.degreeType}
                </Badge>
                <Badge className="bg-green-50 text-green-700 border border-green-200">
                  {program.fieldOfStudy}
                </Badge>
                <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
                  {program.mode}
                </Badge>
                <Badge className="bg-gray-50 text-gray-700 border border-gray-200">
                  {program.programLevel}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    <strong>Duration:</strong> {program.duration}
                  </span>
                </div>
                
                {program.languages && program.languages.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Languages className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      <strong>Languages:</strong> {program.languages.join(", ")}
                    </span>
                  </div>
                )}
                
                {program.intakeSessions && program.intakeSessions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      <strong>Intake:</strong> {program.intakeSessions.join(", ")}
                    </span>
                  </div>
                )}
                
                {program.applicationDeadlines && program.applicationDeadlines.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      <strong>Next Deadline:</strong> {getNextDeadline(program.applicationDeadlines) || "TBD"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tuition Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tuition & Fees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-gray-700">
                  <strong>Local Students:</strong> {formatCurrency(program.tuitionFees?.local || 0, program.tuitionFees?.currency || 'USD')}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-gray-700">
                  <strong>International Students:</strong> {formatCurrency(program.tuitionFees?.international || 0, program.tuitionFees?.currency || 'USD')}
                </span>
              </div>
              
              {program.applicationFee && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="text-gray-700">
                    <strong>Application Fee:</strong> {formatCurrency(program.applicationFee, program.tuitionFees?.currency || 'USD')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg">
                Apply Now
              </Button>
              
              {program.brochureLink && (
                <Button variant="outline" className="w-full" size="lg">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Download Brochure
                </Button>
              )}
              
              <Button variant="ghost" className="w-full" size="lg">
                Save to Favorites
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 