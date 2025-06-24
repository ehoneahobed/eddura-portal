import React from 'react';

/**
 * ProgramViewPage displays details of a single program by fetching data from the API.
 * Shows loading and error states for better UX.
 */
const ProgramViewPage = async ({ params }: { params: { id: string } }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/programs/${params.id}`);
  if (!res.ok) {
    return <div className="p-4 text-red-600">Failed to load program details.</div>;
  }
  const program = await res.json();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{program.name}</h1>
      <div className="space-y-2">
        <div><strong>Degree Type:</strong> {program.degreeType}</div>
        <div><strong>Field of Study:</strong> {program.fieldOfStudy}</div>
        {program.subfield && <div><strong>Subfield:</strong> {program.subfield}</div>}
        <div><strong>Mode:</strong> {program.mode}</div>
        <div><strong>Duration:</strong> {program.duration}</div>
        <div><strong>Languages:</strong> {program.languages?.join(', ')}</div>
        <div><strong>Application Deadlines:</strong> {program.applicationDeadlines?.join(', ')}</div>
        <div><strong>Intake Sessions:</strong> {program.intakeSessions?.join(', ')}</div>
        {program.admissionRequirements && (
          <div>
            <strong>Admission Requirements:</strong>
            <ul className="list-disc ml-6">
              {program.admissionRequirements.minGPA && <li>Min GPA: {program.admissionRequirements.minGPA}</li>}
              {program.admissionRequirements.requiredDegrees?.length > 0 && <li>Required Degrees: {program.admissionRequirements.requiredDegrees.join(', ')}</li>}
              {program.admissionRequirements.requiredTests?.length > 0 && <li>Required Tests: {program.admissionRequirements.requiredTests.map((test: any) => `${test.name} (Min Score: ${test.minScore})`).join(', ')}</li>}
              {program.admissionRequirements.lettersOfRecommendation && <li>Letters of Recommendation: {program.admissionRequirements.lettersOfRecommendation}</li>}
              {program.admissionRequirements.requiresPersonalStatement && <li>Personal Statement Required</li>}
              {program.admissionRequirements.requiresCV && <li>CV Required</li>}
              {program.admissionRequirements.detailedRequirementNote && <li>Note: {program.admissionRequirements.detailedRequirementNote}</li>}
            </ul>
          </div>
        )}
        <div><strong>Tuition Fees:</strong> Local: {program.tuitionFees.local} {program.tuitionFees.currency}, International: {program.tuitionFees.international} {program.tuitionFees.currency}</div>
        {program.availableScholarships?.length > 0 && <div><strong>Available Scholarships:</strong> {program.availableScholarships.join(', ')}</div>}
        {program.applicationFee && <div><strong>Application Fee:</strong> {program.applicationFee}</div>}
        {program.teachingMethodology?.length > 0 && <div><strong>Teaching Methodology:</strong> {program.teachingMethodology.join(', ')}</div>}
        {program.careerOutcomes?.length > 0 && <div><strong>Career Outcomes:</strong> {program.careerOutcomes.join(', ')}</div>}
        {program.employabilityRank && <div><strong>Employability Rank:</strong> {program.employabilityRank}</div>}
        {program.alumniDetails && <div><strong>Alumni Details:</strong> {program.alumniDetails}</div>}
        {program.programSummary && <div><strong>Program Summary:</strong> {program.programSummary}</div>}
        {program.brochureLink && <div><strong>Brochure:</strong> <a href={program.brochureLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a></div>}
        {program.programOverview && <div><strong>Program Overview:</strong> {program.programOverview}</div>}
        {program.learningOutcomes && <div><strong>Learning Outcomes:</strong> {program.learningOutcomes}</div>}
        <div className="text-xs text-gray-500 mt-4">Created: {new Date(program.createdAt).toLocaleString()} | Updated: {new Date(program.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
};

export default ProgramViewPage; 