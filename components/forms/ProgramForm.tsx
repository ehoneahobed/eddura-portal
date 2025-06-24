'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Program, School } from '@/types';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ProgramFormProps {
  program?: Program;
  onSubmit: (data: Partial<Program>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProgramForm({ program, onSubmit, onCancel, isLoading }: ProgramFormProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(program?.schoolId || '');
  const [selectedDegreeType, setSelectedDegreeType] = useState(program?.degreeType || '');
  const [selectedMode, setSelectedMode] = useState(program?.mode || '');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<Program>({
    defaultValues: program || {
      name: '',
      schoolId: '',
      fieldOfStudy: '',
      degreeType: 'Bachelor',
      mode: 'Full-time',
      duration: '',
      languages: [],
      applicationDeadlines: [],
      intakeSessions: [],
      tuitionFees: {
        local: 0,
        international: 0,
        currency: 'USD'
      },
      admissionRequirements: {
        requiredDegrees: [],
        requiredTests: []
      },
      availableScholarships: [],
      teachingMethodology: [],
      careerOutcomes: []
    }
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newIntake, setNewIntake] = useState('');
  const [newRequiredDegree, setNewRequiredDegree] = useState('');
  const [newRequiredTest, setNewRequiredTest] = useState({ name: '', minScore: 0 });
  const [newScholarship, setNewScholarship] = useState('');
  const [newMethodology, setNewMethodology] = useState('');
  const [newCareerOutcome, setNewCareerOutcome] = useState('');

  const watchedLanguages = watch('languages') || [];
  const watchedDeadlines = watch('applicationDeadlines') || [];
  const watchedIntakes = watch('intakeSessions') || [];
  const watchedRequiredDegrees = watch('admissionRequirements.requiredDegrees') || [];
  const watchedRequiredTests = watch('admissionRequirements.requiredTests') || [];
  const watchedScholarships = watch('availableScholarships') || [];
  const watchedMethodology = watch('teachingMethodology') || [];
  const watchedCareerOutcomes = watch('careerOutcomes') || [];

  useEffect(() => {
    async function fetchSchools() {
      try {
        const response = await fetch('/api/schools');
        const schoolsData = await response.json();
        setSchools(schoolsData);
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    }
    fetchSchools();
  }, []);

  const addToArray = (field: string, value: string | { name: string; minScore: number }, setter: (value: any) => void, currentArray: any[]) => {
    if (typeof value === 'string') {
      if (value.trim() && !currentArray.includes(value.trim())) {
        const fieldPath = field.split('.');
        if (fieldPath.length === 1) {
          setValue(field as keyof Program, [...currentArray, value.trim()] as any);
        } else {
          setValue(`${fieldPath[0]}.${fieldPath[1]}` as any, [...currentArray, value.trim()]);
        }
        setter('');
      }
    } else {
      if (value.name.trim() && value.minScore > 0) {
        const fieldPath = field.split('.');
        setValue(`${fieldPath[0]}.${fieldPath[1]}` as any, [...currentArray, value]);
        setter({ name: '', minScore: 0 });
      }
    }
  };

  const removeFromArray = (field: string, value: any, currentArray: any[]) => {
    const fieldPath = field.split('.');
    if (fieldPath.length === 1) {
      setValue(field as keyof Program, currentArray.filter(item => item !== value) as any);
    } else {
      setValue(`${fieldPath[0]}.${fieldPath[1]}` as any, currentArray.filter(item => 
        typeof item === 'string' ? item !== value : item.name !== value.name
      ));
    }
  };

  const handleFormSubmit = (data: Program) => {
    onSubmit({
      ...data,
      schoolId: selectedSchoolId,
      degreeType: selectedDegreeType as Program['degreeType'],
      mode: selectedMode as Program['mode']
    });
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>School *</Label>
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedSchoolId && (
                <p className="text-sm text-red-600 mt-1">School is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Program Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Program name is required' })}
                placeholder="Enter program name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label>Degree Type *</Label>
              <Select value={selectedDegreeType} onValueChange={setSelectedDegreeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select degree type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Bachelor">Bachelor</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="MBA">MBA</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                  <SelectItem value="Short Course">Short Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fieldOfStudy">Field of Study *</Label>
              <Input
                id="fieldOfStudy"
                {...register('fieldOfStudy', { required: 'Field of study is required' })}
                placeholder="e.g., Computer Science"
              />
              {errors.fieldOfStudy && (
                <p className="text-sm text-red-600 mt-1">{errors.fieldOfStudy.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subfield">Subfield</Label>
              <Input
                id="subfield"
                {...register('subfield')}
                placeholder="e.g., Artificial Intelligence"
              />
            </div>

            <div>
              <Label>Mode *</Label>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                {...register('duration', { required: 'Duration is required' })}
                placeholder="e.g., 2 years"
              />
              {errors.duration && (
                <p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="employabilityRank">Employability Rank</Label>
              <Input
                id="employabilityRank"
                type="number"
                {...register('employabilityRank', { valueAsNumber: true })}
                placeholder="e.g., 95"
              />
            </div>
          </div>
        </div>

        {/* Program Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Program Details</h3>
          
          <div>
            <Label htmlFor="programOverview">Program Overview</Label>
            <Textarea
              id="programOverview"
              {...register('programOverview')}
              placeholder="Comprehensive overview of the program"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="programSummary">Program Summary</Label>
            <Textarea
              id="programSummary"
              {...register('programSummary')}
              placeholder="Brief summary of the program"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="learningOutcomes">Learning Outcomes</Label>
            <Textarea
              id="learningOutcomes"
              {...register('learningOutcomes')}
              placeholder="What students will learn and achieve"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="alumniDetails">Alumni Details</Label>
            <Textarea
              id="alumniDetails"
              {...register('alumniDetails')}
              placeholder="Information about program alumni and their achievements"
              rows={3}
            />
          </div>
        </div>

        {/* Tuition Fees */}
        <div>
          <Label>Tuition Fees</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <Label htmlFor="localFee">Local Fee</Label>
              <Input
                id="localFee"
                type="number"
                {...register('tuitionFees.local', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="internationalFee">International Fee</Label>
              <Input
                id="internationalFee"
                type="number"
                {...register('tuitionFees.international', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                {...register('tuitionFees.currency')}
                placeholder="USD"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="applicationFee">Application Fee</Label>
            <Input
              id="applicationFee"
              type="number"
              {...register('applicationFee', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>
        </div>

        {/* Languages */}
        <div>
          <Label>Languages</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add language"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('languages', newLanguage, setNewLanguage, watchedLanguages);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addToArray('languages', newLanguage, setNewLanguage, watchedLanguages)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedLanguages.map((language, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {language}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('languages', language, watchedLanguages)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Application Deadlines */}
        <div>
          <Label>Application Deadlines</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              placeholder="Add deadline"
            />
            <Button
              type="button"
              onClick={() => addToArray('applicationDeadlines', newDeadline, setNewDeadline, watchedDeadlines)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedDeadlines.map((deadline, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {deadline}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('applicationDeadlines', deadline, watchedDeadlines)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Intake Sessions */}
        <div>
          <Label>Intake Sessions</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newIntake}
              onChange={(e) => setNewIntake(e.target.value)}
              placeholder="Add intake session"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('intakeSessions', newIntake, setNewIntake, watchedIntakes);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addToArray('intakeSessions', newIntake, setNewIntake, watchedIntakes)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedIntakes.map((intake, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {intake}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('intakeSessions', intake, watchedIntakes)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Admission Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Admission Requirements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minGPA">Minimum GPA</Label>
              <Input
                id="minGPA"
                type="number"
                step="0.1"
                {...register('admissionRequirements.minGPA', { valueAsNumber: true })}
                placeholder="3.0"
              />
            </div>

            <div>
              <Label htmlFor="lettersOfRecommendation">Letters of Recommendation</Label>
              <Input
                id="lettersOfRecommendation"
                type="number"
                {...register('admissionRequirements.lettersOfRecommendation', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="detailedRequirementNote">Detailed Requirement Note</Label>
            <Textarea
              id="detailedRequirementNote"
              {...register('admissionRequirements.detailedRequirementNote')}
              placeholder="Additional details about admission requirements"
              rows={3}
            />
          </div>

          {/* Required Degrees */}
          <div>
            <Label>Required Degrees</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                value={newRequiredDegree}
                onChange={(e) => setNewRequiredDegree(e.target.value)}
                placeholder="Add required degree"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('admissionRequirements.requiredDegrees', newRequiredDegree, setNewRequiredDegree, watchedRequiredDegrees);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('admissionRequirements.requiredDegrees', newRequiredDegree, setNewRequiredDegree, watchedRequiredDegrees)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {watchedRequiredDegrees.map((degree, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {degree}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('admissionRequirements.requiredDegrees', degree, watchedRequiredDegrees)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Required Tests */}
          <div>
            <Label>Required Tests</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                value={newRequiredTest.name}
                onChange={(e) => setNewRequiredTest({ ...newRequiredTest, name: e.target.value })}
                placeholder="Test name (e.g., GRE)"
              />
              <Input
                type="number"
                value={newRequiredTest.minScore}
                onChange={(e) => setNewRequiredTest({ ...newRequiredTest, minScore: parseInt(e.target.value) || 0 })}
                placeholder="Min score"
              />
              <Button
                type="button"
                onClick={() => addToArray('admissionRequirements.requiredTests', newRequiredTest, setNewRequiredTest, watchedRequiredTests)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {watchedRequiredTests.map((test, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {test.name} ({test.minScore})
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray('admissionRequirements.requiredTests', test, watchedRequiredTests)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Teaching Methodology */}
        <div>
          <Label>Teaching Methodology</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newMethodology}
              onChange={(e) => setNewMethodology(e.target.value)}
              placeholder="Add teaching method"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('teachingMethodology', newMethodology, setNewMethodology, watchedMethodology);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addToArray('teachingMethodology', newMethodology, setNewMethodology, watchedMethodology)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedMethodology.map((method, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {method}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('teachingMethodology', method, watchedMethodology)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Career Outcomes */}
        <div>
          <Label>Career Outcomes</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newCareerOutcome}
              onChange={(e) => setNewCareerOutcome(e.target.value)}
              placeholder="Add career outcome"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('careerOutcomes', newCareerOutcome, setNewCareerOutcome, watchedCareerOutcomes);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addToArray('careerOutcomes', newCareerOutcome, setNewCareerOutcome, watchedCareerOutcomes)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedCareerOutcomes.map((outcome, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {outcome}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('careerOutcomes', outcome, watchedCareerOutcomes)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Available Scholarships */}
        <div>
          <Label>Available Scholarships</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={newScholarship}
              onChange={(e) => setNewScholarship(e.target.value)}
              placeholder="Add scholarship ID"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArray('availableScholarships', newScholarship, setNewScholarship, watchedScholarships);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addToArray('availableScholarships', newScholarship, setNewScholarship, watchedScholarships)}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedScholarships.map((scholarship, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {scholarship}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFromArray('availableScholarships', scholarship, watchedScholarships)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brochureLink">Brochure Link</Label>
              <Input
                id="brochureLink"
                {...register('brochureLink')}
                placeholder="https://example.com/brochure"
              />
            </div>

            <div>
              <Label htmlFor="vectorId">Vector ID</Label>
              <Input
                id="vectorId"
                {...register('vectorId')}
                placeholder="Unique vector identifier"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : program ? 'Update Program' : 'Create Program'}
          </Button>
        </div>
      </form>
    </div>
  );
}