import React from 'react';

/**
 * ScholarshipViewPage displays details of a single scholarship by fetching data from the API.
 * Shows loading and error states for better UX.
 */
const ScholarshipViewPage = async ({ params }: { params: { id: string } }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/scholarships/${params.id}`);
  if (!res.ok) {
    return <div className="p-4 text-red-600">Failed to load scholarship details.</div>;
  }
  const scholarship = await res.json();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{scholarship.title}</h1>
      <div className="space-y-2">
        <div><strong>Provider:</strong> {scholarship.provider}</div>
        <div><strong>Details:</strong> {scholarship.scholarshipDetails}</div>
        {scholarship.linkedSchool && <div><strong>Linked School:</strong> {scholarship.linkedSchool}</div>}
        {scholarship.linkedProgram && <div><strong>Linked Program:</strong> {scholarship.linkedProgram}</div>}
        <div><strong>Coverage:</strong> {scholarship.coverage?.join(', ')}</div>
        <div><strong>Value:</strong> {scholarship.value} {scholarship.currency}</div>
        <div><strong>Frequency:</strong> {scholarship.frequency}</div>
        {scholarship.numberOfAwardsPerYear && <div><strong>Number of Awards/Year:</strong> {scholarship.numberOfAwardsPerYear}</div>}
        {scholarship.eligibility && (
          <div>
            <strong>Eligibility:</strong>
            <ul className="list-disc ml-6">
              {scholarship.eligibility.nationalities?.length > 0 && <li>Nationalities: {scholarship.eligibility.nationalities.join(', ')}</li>}
              {scholarship.eligibility.genders?.length > 0 && <li>Genders: {scholarship.eligibility.genders.join(', ')}</li>}
              {scholarship.eligibility.disabilityStatus !== undefined && <li>Disability Status: {scholarship.eligibility.disabilityStatus ? 'Yes' : 'No'}</li>}
              {scholarship.eligibility.degreeLevels?.length > 0 && <li>Degree Levels: {scholarship.eligibility.degreeLevels.join(', ')}</li>}
              {scholarship.eligibility.fieldsOfStudy?.length > 0 && <li>Fields of Study: {scholarship.eligibility.fieldsOfStudy.join(', ')}</li>}
              {scholarship.eligibility.minGPA && <li>Min GPA: {scholarship.eligibility.minGPA}</li>}
              {scholarship.eligibility.ageLimit && <li>Age Limit: {scholarship.eligibility.ageLimit}</li>}
              {scholarship.eligibility.countryResidency?.length > 0 && <li>Country Residency: {scholarship.eligibility.countryResidency.join(', ')}</li>}
              {scholarship.eligibility.incomeStatus && <li>Income Status: {scholarship.eligibility.incomeStatus}</li>}
              {scholarship.eligibility.additionalCriteria && <li>Additional Criteria: {scholarship.eligibility.additionalCriteria}</li>}
            </ul>
          </div>
        )}
        {scholarship.applicationRequirements && (
          <div>
            <strong>Application Requirements:</strong>
            <ul className="list-disc ml-6">
              {scholarship.applicationRequirements.essay && <li>Essay Required</li>}
              {scholarship.applicationRequirements.cv && <li>CV Required</li>}
              {scholarship.applicationRequirements.testScores && <li>Test Scores Required</li>}
              {scholarship.applicationRequirements.recommendationLetters && <li>Recommendation Letters: {scholarship.applicationRequirements.recommendationLetters}</li>}
              {scholarship.applicationRequirements.requirementsDescription && <li>Description: {scholarship.applicationRequirements.requirementsDescription}</li>}
              {scholarship.applicationRequirements.documentsToSubmit?.length > 0 && <li>Documents: {scholarship.applicationRequirements.documentsToSubmit.join(', ')}</li>}
            </ul>
          </div>
        )}
        <div><strong>Deadline:</strong> {scholarship.deadline}</div>
        <div><strong>Application Link:</strong> <a href={scholarship.applicationLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Apply Here</a></div>
        <div><strong>Selection Criteria:</strong> {scholarship.selectionCriteria?.join(', ')}</div>
        {scholarship.renewalConditions && <div><strong>Renewal Conditions:</strong> {scholarship.renewalConditions}</div>}
        {scholarship.decisionTimeline && <div><strong>Decision Timeline:</strong> {scholarship.decisionTimeline}</div>}
        {scholarship.tags?.length > 0 && <div><strong>Tags:</strong> {scholarship.tags.join(', ')}</div>}
        {scholarship.notes && <div><strong>Notes:</strong> {scholarship.notes}</div>}
        <div className="text-xs text-gray-500 mt-4">Created: {new Date(scholarship.createdAt).toLocaleString()} | Updated: {new Date(scholarship.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
};

export default ScholarshipViewPage; 