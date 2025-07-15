'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, BookOpen, Award, Calendar, Languages, Info, BarChart2, UserCheck, ShieldCheck, DollarSign, Clock, Edit, Trash2, Link2, FileText, Users, Loader2 } from 'lucide-react';
import ProgramActions from '@/components/programs/ProgramActions';

/**
 * ProgramViewPage displays all details of a single program in a modern, professional layout.
 * All fields are shown, including those not provided, for completeness.
 */
const ProgramViewPage = () => {
  const params = useParams();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const programId = params.id as string;
  
  const fetchProgram = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/programs/${programId}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch program: ${res.status}`);
      }
      
      const programData = await res.json();
      setProgram(programData);
    } catch (err) {
      console.error('Error fetching program:', err);
      setError('Failed to load program details');
    } finally {
      setLoading(false);
    }
  }, [programId]);
  
  useEffect(() => {
    if (programId) {
      fetchProgram();
    }
  }, [fetchProgram, programId]);

  // Helper to display value or fallback
  const show = (value: any, fallback = 'Not provided') => {
    if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === undefined || value === null || value === '') return fallback;
    return value;
  };

  // Helper to display arrays as badges
  const showBadges = (arr: any[], fallback = 'Not provided') =>
    Array.isArray(arr) && arr.length ? (
      <div className="flex flex-wrap gap-2">{arr.map((item, i) => <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{item}</span>)}</div>
    ) : <span className="text-gray-400">{fallback}</span>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading program details...</span>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return <div className="p-4 text-red-600">{error || 'Program not found'}</div>;
  }

  // Optionally fetch school name if not present
  let schoolName = program.schoolName || program.school?.name || '';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header: Name & Actions */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 relative">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 tracking-tight flex items-center gap-2"><BookOpen className="w-7 h-7 text-blue-700" />{show(program.name)}
            {schoolName && <span className="ml-3 text-base font-medium text-blue-600">({schoolName})</span>}
          </h1>
          <div className="text-gray-600 text-lg flex items-center gap-2 justify-center md:justify-start"><Building2 className="w-5 h-5 text-blue-400" />{show(program.fieldOfStudy)}</div>
        </div>
        <div className="flex gap-2 absolute right-0 top-0 md:static md:mt-0 mt-4">
          <ProgramActions programId={program._id || program.id || programId || ''} />
        </div>
      </div>

      {/* General Info */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">General Information</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Program Level <span title="Whether the program is undergraduate or postgraduate."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd className="text-gray-900">{show(program.programLevel)}</dd></div>
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Degree Type <span title="The type of degree awarded by this program."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd className="text-gray-900">{show(program.degreeType)}</dd></div>
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Field of Study <span title="The main academic discipline of the program."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd className="text-gray-900">{show(program.fieldOfStudy)}</dd></div>
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Subfield <span title="Specialization or subfield within the main field of study."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd className="text-gray-900">{show(program.subfield)}</dd></div>
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Mode <span title="How the program is delivered (e.g., Full-time, Online)."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd className="text-gray-900">{show(program.mode)}</dd></div>
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Duration <span title="Typical length of the program."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd className="text-gray-900">{show(program.duration)}</dd></div>
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Languages <span title="Languages in which the program is taught."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd>{showBadges(program.languages)}</dd></div>
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Application Deadlines <span title="Key dates for submitting applications."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd>{showBadges(program.applicationDeadlines)}</dd></div>
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Intake Sessions <span title="When students can start the program."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd>{showBadges(program.intakeSessions)}</dd></div>
        </dl>
      </section>
      <hr className="my-6 border-gray-200" />

      {/* Admission Requirements */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Admission Requirements</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Min GPA</dt><dd className="text-gray-900">{show(program.admissionRequirements?.minGPA)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Required Degrees</dt><dd className="text-gray-900">{show(program.admissionRequirements?.requiredDegrees)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Required Tests</dt><dd className="text-gray-900">{program.admissionRequirements?.requiredTests?.length ? program.admissionRequirements.requiredTests.map((test: any, i: number) => <span key={i}>{test.name} (Min Score: {test.minScore})</span>) : 'Not provided'}</dd></div>
          <div><dt className="font-semibold text-gray-700">Letters of Recommendation</dt><dd className="text-gray-900">{show(program.admissionRequirements?.lettersOfRecommendation)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Personal Statement Required</dt><dd className="text-gray-900">{show(program.admissionRequirements?.requiresPersonalStatement)}</dd></div>
          <div><dt className="font-semibold text-gray-700">CV Required</dt><dd className="text-gray-900">{show(program.admissionRequirements?.requiresCV)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Detailed Requirement Note</dt><dd className="text-gray-900">{show(program.admissionRequirements?.detailedRequirementNote)}</dd></div>
          <div><dt className="font-semibold text-gray-700">SAT/ACT Score</dt><dd className="text-gray-900">{show(program.admissionRequirements?.satScore)}</dd></div>
          <div><dt className="font-semibold text-gray-700">GRE/GMAT Score</dt><dd className="text-gray-900">{show(program.admissionRequirements?.greScore)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Work Experience (years)</dt><dd className="text-gray-900">{show(program.admissionRequirements?.workExperience)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Thesis/Research Required</dt><dd className="text-gray-900">{show(program.admissionRequirements?.thesisRequired)}</dd></div>
        </dl>
      </section>
      <hr className="my-6 border-gray-200" />

      {/* Tuition & Scholarships */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Tuition & Scholarships</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Tuition Fees (Local)</dt><dd className="text-gray-900">{program.tuitionFees ? `${program.tuitionFees.local} ${program.tuitionFees.currency}` : 'Not provided'}</dd></div>
          <div><dt className="font-semibold text-gray-700">Tuition Fees (International)</dt><dd className="text-gray-900">{program.tuitionFees ? `${program.tuitionFees.international} ${program.tuitionFees.currency}` : 'Not provided'}</dd></div>
          <div><dt className="font-semibold text-gray-700">Application Fee</dt><dd className="text-gray-900">{show(program.applicationFee)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Available Scholarships</dt><dd className="text-gray-900">{show(program.availableScholarships)}</dd></div>
        </dl>
      </section>
      <hr className="my-6 border-gray-200" />

      {/* Program Details */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Program Details</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Teaching Methodology <span title="How the program is taught (e.g., lectures, labs, online)."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd>{showBadges(program.teachingMethodology)}</dd></div>
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Career Outcomes <span title="Typical career paths for graduates."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd>{showBadges(program.careerOutcomes)}</dd></div>
          <div><dt className="font-semibold text-gray-700 flex items-center gap-1">Employability Rank <span title="Relative employability of graduates (0 = lowest, 100 = highest)."><Info className="w-4 h-4 text-gray-400" /></span></dt><dd className="text-gray-900">{show(program.employabilityRank)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Alumni Details</dt><dd className="text-gray-900">{show(program.alumniDetails)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Program Summary</dt><dd className="text-gray-900">{show(program.programSummary)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Brochure Link</dt><dd>{program.brochureLink ? <a href={program.brochureLink} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer"><Link2 className="inline w-4 h-4 mr-1" />Download</a> : <span className="text-gray-400">Not provided</span>}</dd></div>
          <div><dt className="font-semibold text-gray-700">Program Overview</dt><dd className="text-gray-900">{show(program.programOverview)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Learning Outcomes</dt><dd className="text-gray-900">{show(program.learningOutcomes)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Vector ID</dt><dd className="text-gray-900">{show(program.vectorId)}</dd></div>
        </dl>
      </section>
      <hr className="my-6 border-gray-200" />

      {/* Timestamps */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Timestamps</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Created At</dt><dd className="text-gray-900">{program.createdAt ? new Date(program.createdAt).toLocaleString() : <span className="text-gray-400">Not provided</span>}</dd></div>
          <div><dt className="font-semibold text-gray-700">Updated At</dt><dd className="text-gray-900">{program.updatedAt ? new Date(program.updatedAt).toLocaleString() : <span className="text-gray-400">Not provided</span>}</dd></div>
        </dl>
      </section>
    </div>
  );
};

export default ProgramViewPage; 