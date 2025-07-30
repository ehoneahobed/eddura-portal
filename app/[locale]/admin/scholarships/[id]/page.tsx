'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ScholarshipActions from '@/components/scholarships/ScholarshipActions';
import { Award, Info, BarChart2, UserCheck, ShieldCheck, Clock, Link2, FileText, Users, BookOpen, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * ScholarshipViewPage displays all details of a single scholarship in a modern, professional layout.
 * All fields are shown, including those not provided, for completeness.
 */
const ScholarshipViewPage = () => {
  const params = useParams();
  const [scholarship, setScholarship] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scholarshipId = params.id as string;
  
  const fetchScholarshipAndTemplates = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch scholarship
      const scholarshipRes = await fetch(`/api/scholarships/${scholarshipId}`);
      if (!scholarshipRes.ok) {
        throw new Error(`Failed to fetch scholarship: ${scholarshipRes.status}`);
      }
      const scholarshipData = await scholarshipRes.json();
      setScholarship(scholarshipData);
      
      // Fetch application templates
      const templatesRes = await fetch(`/api/application-templates?scholarshipId=${scholarshipId}`);
      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }
    } catch (err) {
      console.error('Error fetching scholarship:', err);
      setError('Failed to load scholarship details');
    } finally {
      setLoading(false);
    }
  }, [scholarshipId]);

  useEffect(() => {
    if (scholarshipId) {
      fetchScholarshipAndTemplates();
    }
  }, [scholarshipId, fetchScholarshipAndTemplates]);

  // Helper to display value or fallback
  const show = (value: any, fallback = 'Not provided') => {
    if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === undefined || value === null || value === '') return fallback;
    return value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading scholarship details...</span>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return <div className="p-4 text-red-600">{error || 'Scholarship not found'}</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header: Title & Actions */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 relative">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 tracking-tight flex items-center gap-2"><Award className="w-7 h-7 text-blue-700" />{show(scholarship.title)}</h1>
          <div className="text-gray-600 text-lg flex items-center gap-2 justify-center md:justify-start"><BookOpen className="w-5 h-5 text-blue-400" />{show(scholarship.provider)}</div>
        </div>
        <div className="flex gap-2 absolute right-0 top-0 md:static md:mt-0 mt-4">
          <ScholarshipActions scholarshipId={scholarship._id || scholarship.id || scholarshipId || ''} />
        </div>
      </div>

      {/* Application Templates Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">Application Templates</h2>
          </div>
          <Link href={`/admin/application-templates/create?scholarshipId=${scholarshipId || ''}`}>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </Link>
        </div>
        
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template: any) => (
              <div key={template._id || template.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{template.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {template.description && (
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.estimatedTime} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {template.sections?.length || 0} sections
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/application-templates/${template._id || template.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Link href={`/admin/application-templates/${template._id || template.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No application templates</h3>
            <p className="text-gray-600 mb-4">
              Create an application form template to enable students to apply for this scholarship.
            </p>
            <Link href={`/admin/application-templates/create?scholarshipId=${scholarshipId || ''}`}>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create First Template
              </Button>
            </Link>
          </div>
        )}
      </section>
      <hr className="my-6 border-gray-200" />

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
          <div><dt className="font-semibold text-gray-700">Value</dt><dd className="text-gray-900">
            {scholarship.value ? (
              typeof scholarship.value === 'number' 
                ? `${scholarship.value.toLocaleString()} ${scholarship.currency || ''}`
                : scholarship.value
            ) : 'Not provided'}
          </dd></div>
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
          <div><dt className="font-semibold text-gray-700">Opening Date</dt><dd className="text-gray-900">{show(scholarship.openingDate)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Deadline</dt><dd className="text-gray-900">{show(scholarship.deadline)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Opening Date</dt><dd className="text-gray-900">{show(scholarship.openingDate)}</dd></div>
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

      {/* Award Details */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Award Details</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Award Usage</dt><dd className="text-gray-900">{show(scholarship.awardUsage)}</dd></div>
        </dl>
      </section>

      {/* Contact Information */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Contact Information</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Email</dt><dd className="text-gray-900">{show(scholarship.contactInfo?.email)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Phone</dt><dd className="text-gray-900">{show(scholarship.contactInfo?.phone)}</dd></div>
        </dl>
      </section>

      {/* Application Process */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Application Process</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Application Method</dt><dd className="text-gray-900">{show(scholarship.applicationMethod)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Selection Process</dt><dd className="text-gray-900">{show(scholarship.selectionProcess)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Notification Method</dt><dd className="text-gray-900">{show(scholarship.notificationMethod)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Deferral Policy</dt><dd className="text-gray-900">{show(scholarship.deferralPolicy)}</dd></div>
          <div><dt className="font-semibold text-gray-700">Disbursement Details</dt><dd className="text-gray-900">{show(scholarship.disbursementDetails)}</dd></div>
        </dl>
      </section>

      {/* Info & Links */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Info & Links</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Official Info Page</dt><dd>{scholarship.infoPage ? <a href={scholarship.infoPage} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer">View Info</a> : <span className="text-gray-400">Not provided</span>}</dd></div>
          <div><dt className="font-semibold text-gray-700">FAQ/Help Link</dt><dd>{scholarship.faqLink ? <a href={scholarship.faqLink} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer">View FAQ</a> : <span className="text-gray-400">Not provided</span>}</dd></div>
        </dl>
      </section>

      {/* Eligible Regions */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Eligible Regions</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Regions</dt><dd className="text-gray-900">{show(scholarship.eligibleRegions)}</dd></div>
        </dl>
      </section>

      {/* Past Recipients / Testimonials */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-5 h-5 text-blue-700" />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900">Past Recipients / Testimonials</h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div><dt className="font-semibold text-gray-700">Past Recipients</dt><dd className="text-gray-900">{show(scholarship.pastRecipients)}</dd></div>
        </dl>
      </section>
    </div>
  );
};

export default ScholarshipViewPage; 