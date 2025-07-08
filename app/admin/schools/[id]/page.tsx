import React from 'react';
import Image from 'next/image';
import { headers } from 'next/headers';
import { Globe, Mail, Phone, Home, Users, Building2, Languages, Award, Calendar, Link2, Facebook, Twitter, Linkedin, Youtube, Info, BarChart2, UserCheck, ShieldCheck, DollarSign, Clock } from 'lucide-react';
import SchoolActions from '@/components/schools/SchoolActions';
import { formatUrlForHref } from '@/lib/url-utils';

/**
 * SchoolViewPage displays all details of a single school in a modern, professional layout.
 * All fields are shown, including those not provided, for completeness.
 */
const SchoolViewPage = async ({ params }: { params: { id: string } }) => {
  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const res = await fetch(`${protocol}://${host}/api/schools/${params.id}`);
  if (!res.ok) {
    return <div className="p-4 text-red-600">Failed to load school details.</div>;
  }
  const school = await res.json();

  // Helper to display value or fallback
  const show = (value: any, fallback = 'Not provided') => {
    if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === undefined || value === null || value === '') return fallback;
    return value;
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Main content without card background */}
      <div>
        {/* Header: Logo & Name */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
          {school.logoUrl ? (
            <Image src={school.logoUrl} alt="School Logo" width={96} height={96} className="rounded-lg border bg-white shadow-sm" />
          ) : (
            <div className="h-24 w-24 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg border text-lg font-semibold">No Logo</div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 tracking-tight flex items-center gap-2"><Building2 className="w-7 h-7 text-blue-700" />{show(school.name)}</h1>
            <div className="text-gray-600 text-lg flex items-center gap-2 justify-center md:justify-start"><Home className="w-5 h-5 text-blue-400" />{show(school.city)}, {show(school.country)}</div>
          </div>
          <div className="mt-4 md:mt-0 md:ml-auto">
            <SchoolActions schoolId={params.id} />
          </div>
        </div>

        {/* General Info */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">General Information</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><dt className="font-semibold text-gray-700">Types</dt><dd className="text-gray-900">{show(school.types)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Global Ranking</dt><dd className="text-gray-900">{show(school.globalRanking)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Year Founded</dt><dd className="text-gray-900">{show(school.yearFounded)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Accreditation Bodies</dt><dd className="text-gray-900">{show(school.accreditationBodies)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Campus Type</dt><dd className="text-gray-900">{show(school.campusType)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Languages of Instruction</dt><dd className="text-gray-900">{show(school.languagesOfInstruction)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Virtual Tour Link</dt><dd>{school.virtualTourLink ? <a href={formatUrlForHref(school.virtualTourLink)} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer"><Link2 className="inline w-4 h-4 mr-1" />View Tour</a> : <span className="text-gray-400">Not provided</span>}</dd></div>
          </dl>
        </section>
        <hr className="my-6 border-gray-200" />

        {/* Contact Info */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">Contact Information</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><dt className="font-semibold text-gray-700">Website</dt><dd>{school.websiteUrl ? <a href={formatUrlForHref(school.websiteUrl)} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer"><Globe className="inline w-4 h-4 mr-1" />{school.websiteUrl}</a> : <span className="text-gray-400">Not provided</span>}</dd></div>
            <div><dt className="font-semibold text-gray-700">Contact Email</dt><dd className="text-gray-900 flex items-center gap-1"><Mail className="inline w-4 h-4" />{show(school.contactEmail)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Contact Phone</dt><dd className="text-gray-900 flex items-center gap-1"><Phone className="inline w-4 h-4" />{show(school.contactPhone)}</dd></div>
          </dl>
        </section>
        <hr className="my-6 border-gray-200" />

        {/* Social Links */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">Social Links</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><dt className="font-semibold text-gray-700 flex items-center gap-1"><Facebook className="w-4 h-4" />Facebook</dt><dd>{school.socialLinks?.facebook ? <a href={formatUrlForHref(school.socialLinks.facebook)} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer">{school.socialLinks.facebook}</a> : <span className="text-gray-400">Not provided</span>}</dd></div>
            <div><dt className="font-semibold text-gray-700 flex items-center gap-1"><Twitter className="w-4 h-4" />Twitter</dt><dd>{school.socialLinks?.twitter ? <a href={formatUrlForHref(school.socialLinks.twitter)} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer">{school.socialLinks.twitter}</a> : <span className="text-gray-400">Not provided</span>}</dd></div>
            <div><dt className="font-semibold text-gray-700 flex items-center gap-1"><Linkedin className="w-4 h-4" />LinkedIn</dt><dd>{school.socialLinks?.linkedin ? <a href={formatUrlForHref(school.socialLinks.linkedin)} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer">{school.socialLinks.linkedin}</a> : <span className="text-gray-400">Not provided</span>}</dd></div>
            <div><dt className="font-semibold text-gray-700 flex items-center gap-1"><Youtube className="w-4 h-4" />YouTube</dt><dd>{school.socialLinks?.youtube ? <a href={formatUrlForHref(school.socialLinks.youtube)} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer">{school.socialLinks.youtube}</a> : <span className="text-gray-400">Not provided</span>}</dd></div>
          </dl>
        </section>
        <hr className="my-6 border-gray-200" />

        {/* Stats & Services */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">Stats & Services</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><dt className="font-semibold text-gray-700">International Student Count</dt><dd className="text-gray-900">{show(school.internationalStudentCount)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Student-Faculty Ratio</dt><dd className="text-gray-900">{show(school.studentFacultyRatio)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Housing Options</dt><dd className="text-gray-900">{show(school.housingOptions)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Support Services</dt><dd className="text-gray-900">{show(school.supportServices)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Average Living Cost</dt><dd className="text-gray-900">{show(school.avgLivingCost)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Visa Support Services</dt><dd className="text-gray-900">{show(school.visaSupportServices)}</dd></div>
          </dl>
        </section>
        <hr className="my-6 border-gray-200" />

        {/* Facilities & Environment */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Home className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">Facilities & Environment</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><dt className="font-semibold text-gray-700">Campus Facilities</dt><dd className="text-gray-900">{show(school.campusFacilities)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Climate/Weather</dt><dd className="text-gray-900">{show(school.climate)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Transport/Location</dt><dd className="text-gray-900">{show(school.transportLocation)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Accessibility</dt><dd className="text-gray-900">{show(school.accessibility)}</dd></div>
          </dl>
        </section>
        <hr className="my-6 border-gray-200" />

        {/* Safety & Support */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">Safety & Support</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><dt className="font-semibold text-gray-700">Safety Rating</dt><dd className="text-gray-900">{show(school.safetyRating)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Safety Description</dt><dd className="text-gray-900">{show(school.safetyDescription)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Internships/Co-op Opportunities</dt><dd className="text-gray-900">{show(school.internshipsAvailable)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Internships Description</dt><dd className="text-gray-900">{show(school.internshipsDescription)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Career Services</dt><dd className="text-gray-900">{show(school.careerServicesAvailable)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Career Services Description</dt><dd className="text-gray-900">{show(school.careerServicesDescription)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Language Support</dt><dd className="text-gray-900">{show(school.languageSupportAvailable)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Language Support Description</dt><dd className="text-gray-900">{show(school.languageSupportDescription)}</dd></div>
          </dl>
        </section>
        <hr className="my-6 border-gray-200" />

        {/* Diversity & Accessibility */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">Diversity & Accessibility</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><dt className="font-semibold text-gray-700">Student Diversity</dt><dd className="text-gray-900">{show(school.studentDiversity)}</dd></div>
            <div><dt className="font-semibold text-gray-700">Accessibility</dt><dd className="text-gray-900">{show(school.accessibility)}</dd></div>
          </dl>
        </section>
        <hr className="my-6 border-gray-200" />

        {/* Additional Info */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">Additional Information</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><dt className="font-semibold text-gray-700">Acceptance Rate</dt><dd className="text-gray-900">{show(school.acceptanceRate)}</dd></div>
          </dl>
        </section>

        {/* Timestamps */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">Timestamps</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div><dt className="font-semibold text-gray-700">Created At</dt><dd className="text-gray-900">{school.createdAt ? new Date(school.createdAt).toLocaleString() : <span className="text-gray-400">Not provided</span>}</dd></div>
            <div><dt className="font-semibold text-gray-700">Updated At</dt><dd className="text-gray-900">{school.updatedAt ? new Date(school.updatedAt).toLocaleString() : <span className="text-gray-400">Not provided</span>}</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
};

export default SchoolViewPage; 