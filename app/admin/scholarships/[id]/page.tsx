import React from 'react';
import { headers } from 'next/headers';
import ScholarshipActions from '@/components/scholarships/ScholarshipActions';
import { Award, Info, BarChart2, UserCheck, ShieldCheck, DollarSign, Clock, Edit, Trash2, Link2, FileText, Users, BookOpen } from 'lucide-react';

/**
 * ScholarshipViewPage displays all details of a single scholarship in a modern, professional layout.
 * All fields are shown, including those not provided, for completeness.
 */
const ScholarshipViewPage = async ({ params }: { params: { id: string } }) => {
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const res = await fetch(`${protocol}://${host}/api/scholarships/${params.id}`);
  if (!res.ok) {
    return <div className="p-4 text-red-600">Failed to load scholarship details.</div>;
  }
  const scholarship = await res.json();

  // Helper to display value or fallback
  const show = (value: any, fallback = 'Not provided') => {
    if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === undefined || value === null || value === '') return fallback;
    return value;
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header: Title & Actions */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 relative">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 tracking-tight flex items-center gap-2"><Award className="w-7 h-7 text-blue-700" />{show(scholarship.title)}</h1>
          <div className="text-gray-600 text-lg flex items-center gap-2 justify-center md:justify-start"><BookOpen className="w-5 h-5 text-blue-400" />{show(scholarship.provider)}</div>
        </div>
        <div className="flex gap-2 absolute right-0 top-0 md:static md:mt-0 mt-4">
          <ScholarshipActions scholarshipId={scholarship._id || scholarship.id} />
        </div>
      </div>

      {/* General Info */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">General Information</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Provider</dt><dd className="text-gray-900">{show(scholarship.provider)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Details</dt><dd className="text-gray-900">{show(scholarship.scholarshipDetails)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Linked School</dt><dd className="text-gray-900">{show(scholarship.linkedSchool)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Linked Program</dt><dd className="text-gray-900">{show(scholarship.linkedProgram)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Coverage</dt><dd className="text-gray-900">{show(scholarship.coverage)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Value</dt><dd className="text-gray-900">{scholarship.value ? `${scholarship.value} ${scholarship.currency}` : 'Not provided'}</dd></div>
          <div><dt className="font-semibold text-gray-700">Frequency</dt><dd className="text-gray-900">{show(scholarship.frequency)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Number of Awards/Year</dt><dd className="text-gray-900">{show(scholarship.numberOfAwardsPerYear)}</dd></div>
        </dl>
      </section>
      <hr className="my-6 border-gray-200" />

      {/* Eligibility */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Eligibility</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Nationalities</dt><dd className="text-gray-900">{show(scholarship.eligibility?.nationalities)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Genders</dt><dd className="text-gray-900">{show(scholarship.eligibility?.genders)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Disability Status</dt><dd className="text-gray-900">{show(scholarship.eligibility?.disabilityStatus)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Degree Levels</dt><dd className="text-gray-900">{show(scholarship.eligibility?.degreeLevels)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Fields of Study</dt><dd className="text-gray-900">{show(scholarship.eligibility?.fieldsOfStudy)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Min GPA</dt><dd className="text-gray-900">{show(scholarship.eligibility?.minGPA)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Age Limit</dt><dd className="text-gray-900">{show(scholarship.eligibility?.ageLimit)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Country Residency</dt><dd className="text-gray-900">{show(scholarship.eligibility?.countryResidency)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Income Status</dt><dd className="text-gray-900">{show(scholarship.eligibility?.incomeStatus)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Additional Criteria</dt><dd className="text-gray-900">{show(scholarship.eligibility?.additionalCriteria)}</dd></div>
        </dl>
      </section>
      <hr className="my-6 border-gray-200" />

      {/* Application Requirements */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Application Requirements</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Essay</dt><dd className="text-gray-900">{show(scholarship.applicationRequirements?.essay)}</dd></div>
          <div><dt className="font-semibold text-gray-700">CV</dt><dd className="text-gray-900">{show(scholarship.applicationRequirements?.cv)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Test Scores</dt><dd className="text-gray-900">{show(scholarship.applicationRequirements?.testScores)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Recommendation Letters</dt><dd className="text-gray-900">{show(scholarship.applicationRequirements?.recommendationLetters)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Requirements Description</dt><dd className="text-gray-900">{show(scholarship.applicationRequirements?.requirementsDescription)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Documents to Submit</dt><dd className="text-gray-900">{show(scholarship.applicationRequirements?.documentsToSubmit)}</dd></div>
        </dl>
      </section>
      <hr className="my-6 border-gray-200" />

      {/* Other Details */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Other Details</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Deadline</dt><dd className="text-gray-900">{show(scholarship.deadline)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Application Link</dt><dd>{scholarship.applicationLink ? <a href={scholarship.applicationLink} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer"><Link2 className="inline w-4 h-4 mr-1" />Apply Here</a> : <span className="text-gray-400">Not provided</span>}</dd></div>
          <div><dt className="font-semibold text-gray-700">Selection Criteria</dt><dd className="text-gray-900">{show(scholarship.selectionCriteria)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Renewal Conditions</dt><dd className="text-gray-900">{show(scholarship.renewalConditions)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Decision Timeline</dt><dd className="text-gray-900">{show(scholarship.decisionTimeline)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Tags</dt><dd className="text-gray-900">{show(scholarship.tags)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Notes</dt><dd className="text-gray-900">{show(scholarship.notes)}</dd></div>
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
          <div><dt className="font-semibold text-gray-700">Created At</dt><dd className="text-gray-900">{scholarship.createdAt ? new Date(scholarship.createdAt).toLocaleString() : <span className="text-gray-400">Not provided</span>}</dd></div>
          <div><dt className="font-semibold text-gray-700">Updated At</dt><dd className="text-gray-900">{scholarship.updatedAt ? new Date(scholarship.updatedAt).toLocaleString() : <span className="text-gray-400">Not provided</span>}</dd></div>
        </dl>
      </section>
    </div>
  );
};

export default ScholarshipViewPage; 