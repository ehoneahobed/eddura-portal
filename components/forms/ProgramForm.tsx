'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Program, School } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Info } from 'lucide-react';
import CustomMultiSelect from '@/components/CustomMultiSelect';

interface ProgramFormProps {
  program?: Program;
  onSubmit: (data: Partial<Program>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const popularCurrencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'ZAR', 'NGN', 'GHS', 'SGD', 'BRL', 'SEK', 'NOK', 'DKK', 'RUB', 'KRW', 'MXN', 'TRY', 'PLN', 'NZD', 'HKD', 'MYR', 'IDR', 'THB', 'SAR', 'AED', 'EGP', 'KES', 'TZS', 'UGX', 'MAD', 'XOF', 'XAF', 'UAH', 'CZK', 'HUF', 'ILS', 'PKR', 'BDT', 'PHP', 'COP', 'CLP', 'ARS', 'VND', 'LKR', 'QAR', 'OMR', 'BHD', 'KWD', 'JOD', 'DZD', 'TND', 'LBP', 'SDG', 'ETB', 'SOS', 'MZN', 'AOA', 'ZMW', 'BWP', 'MUR', 'SCR', 'MGA', 'MWK', 'BIF', 'RWF', 'CDF', 'GMD', 'SLL', 'GNF', 'XPF', 'FJD', 'PGK', 'TOP', 'WST', 'VUV', 'KZT', 'UZS', 'TJS', 'KGS', 'MNT', 'LAK', 'KHR', 'MMK', 'BND', 'BTN', 'NPR', 'AFN', 'IRR', 'IQD', 'YER', 'SYP', 'LYD', 'TMT', 'AZN', 'GEL', 'AMD', 'MDL', 'BYN', 'ISK', 'HRK', 'MKD', 'ALL', 'RON', 'BGN', 'SRD', 'GYD', 'TTD', 'JMD', 'BBD', 'BSD', 'BZD', 'KYD', 'XCD', 'TTD', 'HTG', 'DOP', 'HNL', 'NIO', 'PAB', 'PYG', 'UYU', 'BOB', 'PEN', 'GTQ', 'CRC', 'SVC', 'BMD', 'ANG', 'AWG', 'CUC', 'CUP', 'DZD', 'MAD', 'TND', 'SDG', 'SSP', 'DJF', 'SZL', 'LSL', 'NAD', 'ZWL', 'MRO', 'MRU', 'GHS', 'NGN', 'XOF', 'XAF', 'CFA', 'CVE', 'STD', 'STN', 'SHP', 'FKP', 'GIP', 'JEP', 'IMP', 'GGP', 'SPL', 'TVD', 'ZWD', 'ZWL', 'ZMW', 'ZAR', 'ZMK', 'YUN', 'YUD', 'YUM', 'YUG', 'YER', 'XTS', 'XXX', 'XUA', 'XSU', 'XRE', 'XPT', 'XPD', 'XPF', 'XOF', 'XDR', 'XCD', 'XBC', 'XBB', 'XBA', 'XAG', 'XAF', 'WST', 'VUV', 'VND', 'VEF', 'UZS', 'UYU', 'USD', 'UAH', 'TZS', 'TWD', 'TTD', 'TRY', 'TOP', 'TND', 'TMT', 'THB', 'SZL', 'SYP', 'SVC', 'STD', 'SRD', 'SOS', 'SLL', 'SGD', 'SEK', 'SDG', 'SCR', 'SAR', 'RWF', 'RUB', 'RON', 'QAR', 'PYG', 'PLN', 'PHP', 'PGK', 'PEN', 'PKR', 'OMR', 'NZD', 'NPR', 'NOK', 'NGN', 'NAD', 'MZN', 'MWK', 'MUR', 'MRO', 'MOP', 'MMK', 'MKD', 'MGA', 'MDL', 'MAD', 'LYD', 'LSL', 'LRD', 'LBP', 'LAK', 'KZT', 'KWD', 'KRW', 'KMF', 'KES', 'JOD', 'JPY', 'JMD', 'ISK', 'IQD', 'INR', 'ILS', 'IDR', 'HUF', 'HTG', 'HRK', 'HNL', 'HKD', 'GYD', 'GTQ', 'GNF', 'GMD', 'GEL', 'FJD', 'ETB', 'ERN', 'EGP', 'DZD', 'DOP', 'DKK', 'DJF', 'CZK', 'CVE', 'CUP', 'CRC', 'COP', 'CNY', 'CLP', 'CHF', 'CDF', 'BZD', 'BWP', 'BTN', 'BSD', 'BRL', 'BND', 'BMD', 'BIF', 'BGN', 'BDT', 'BBD', 'AZN', 'AWG', 'AUD', 'ARS', 'AOA', 'ANG', 'ALL', 'AFN'
];

const languageOptions = [
  'English', 'French', 'Spanish', 'German', 'Mandarin', 'Arabic', 'Portuguese', 'Russian', 'Japanese', 'Italian', 'Hindi', 'Bengali', 'Korean', 'Turkish', 'Vietnamese', 'Polish', 'Dutch', 'Swedish', 'Greek', 'Czech', 'Romanian', 'Hungarian', 'Finnish', 'Danish', 'Norwegian', 'Hebrew', 'Thai', 'Indonesian', 'Malay', 'Filipino', 'Ukrainian', 'Persian', 'Swahili', 'Zulu', 'Afrikaans', 'Other'
];
const intakeOptions = ['Fall', 'Spring', 'Summer', 'Winter', 'Rolling', 'Other'];
const methodologyOptions = ['Lectures', 'Seminars', 'Workshops', 'Lab Work', 'Research Projects', 'Field Work', 'Online Learning', 'Other'];
const careerOptions = ['Software Engineer', 'Data Scientist', 'Researcher', 'Consultant', 'Manager', 'Entrepreneur', 'Other'];

// Add a curated list of common admission tests
const testOptions = [
  'TOEFL', 'IELTS', 'SAT', 'ACT', 'GRE', 'GMAT', 'LSAT', 'MCAT', 'Duolingo English Test', 'PTE', 'CAEL', 'Cambridge English', 'AP', 'IB', 'Other'
];

export default function ProgramForm({ program, onSubmit, onCancel, isLoading }: ProgramFormProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const initialSchoolId = program?.schoolId
    ? typeof program.schoolId === 'object' && program.schoolId !== null && ('_id' in program.schoolId || 'id' in program.schoolId)
      ? ((program.schoolId as any)?._id || (program.schoolId as any)?.id)
      : program.schoolId
    : '';
  const [selectedSchoolId, setSelectedSchoolId] = useState(initialSchoolId);
  const [selectedDegreeType, setSelectedDegreeType] = useState(program?.degreeType || '');
  const [selectedMode, setSelectedMode] = useState(program?.mode || '');
  const [programLevel, setProgramLevel] = useState(program?.programLevel || 'Undergraduate');

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
        minGPA: undefined,
        requiredDegrees: [],
        requiredTests: [],
        lettersOfRecommendation: undefined,
        requiresPersonalStatement: undefined,
        requiresCV: undefined,
        detailedRequirementNote: '',
        satScore: '',
        greScore: '',
        workExperience: undefined,
        thesisRequired: ''
      },
      availableScholarships: [],
      teachingMethodology: [],
      careerOutcomes: [],
      programLevel: 'Undergraduate',
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

  const [schoolSearch, setSchoolSearch] = useState('');
  const schoolInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchSchools() {
      try {
        const response = await fetch('/api/schools');
        const data = await response.json();
        // The API returns { schools: [...], pagination: {...} }
        setSchools(data.schools || []);
      } catch (error) {
        console.error('Error fetching schools:', error);
        setSchools([]);
      }
    }
    fetchSchools();
  }, []);

  // Reset form when program data changes
  useEffect(() => {
    if (program) {
      // Reset the form with the program data
      Object.keys(program).forEach((key) => {
        const value = program[key as keyof Program];
        if (value !== undefined && value !== null) {
          setValue(key as keyof Program, value);
        }
      });
      // Also update the state variables
      if (program.schoolId) {
        const schoolId = typeof program.schoolId === 'object' && program.schoolId !== null && ('_id' in program.schoolId || 'id' in program.schoolId)
          ? ((program.schoolId as any)?._id || (program.schoolId as any)?.id)
          : program.schoolId;
        setSelectedSchoolId(schoolId);
      }
      if (program.degreeType) {
        setSelectedDegreeType(program.degreeType);
      }
      if (program.mode) {
        setSelectedMode(program.mode);
      }
      if (program.programLevel) {
        setProgramLevel(program.programLevel);
      }
    }
  }, [program, setValue]);

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
      programLevel,
      schoolId: selectedSchoolId,
      degreeType: selectedDegreeType as Program['degreeType'],
      mode: selectedMode as Program['mode']
    });
  };

  const uniqueCurrencies = Array.from(new Set(popularCurrencies));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Program Level *</Label>
            <Select value={programLevel} onValueChange={val => setProgramLevel(val as "Undergraduate" | "Postgraduate")}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select program level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                <SelectItem value="Postgraduate">Postgraduate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>School * <span className="ml-1 text-gray-400" title="The school offering this program."><Info className="inline w-4 h-4" /></span></Label>
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-2">
                    <Input
                      ref={schoolInputRef}
                      value={schoolSearch}
                      onChange={e => setSchoolSearch(e.target.value)}
                      placeholder="Search school..."
                      className="h-9 mb-2"
                      onKeyDown={e => e.stopPropagation()}
                    />
                  </div>
                  {Array.isArray(schools) && schools.filter(s => s.name.toLowerCase().includes(schoolSearch.toLowerCase())).map((school) => (
                    <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedSchoolId && (
                <p className="text-sm text-red-600">School is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Program Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Program name is required' })}
                placeholder="Enter program name"
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Degree Type *</Label>
              <Select value={selectedDegreeType} onValueChange={setSelectedDegreeType}>
                <SelectTrigger className="h-11">
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

            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy">Field of Study *</Label>
              <Input
                id="fieldOfStudy"
                {...register('fieldOfStudy', { required: 'Field of study is required' })}
                placeholder="e.g., Computer Science"
                className="h-11"
              />
              {errors.fieldOfStudy && (
                <p className="text-sm text-red-600">{errors.fieldOfStudy.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subfield">Subfield</Label>
              <Input
                id="subfield"
                {...register('subfield')}
                placeholder="e.g., Artificial Intelligence"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Mode *</Label>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="h-11">
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

            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                {...register('duration', { required: 'Duration is required' })}
                placeholder="e.g., 2 years"
                className="h-11"
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employabilityRank">Employability Rank</Label>
              <Input
                id="employabilityRank"
                type="number"
                min={0}
                {...register('employabilityRank', { valueAsNumber: true, min: 0 })}
                placeholder="e.g., 95"
                className="h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Program Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="programOverview">Program Overview</Label>
            <Textarea
              id="programOverview"
              {...register('programOverview')}
              rows={2}
              style={{ resize: 'vertical' }}
              placeholder="Enter a detailed overview of the program..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="programSummary">Program Summary</Label>
            <Textarea
              id="programSummary"
              {...register('programSummary')}
              placeholder="Enter a detailed summary of the program"
              rows={4}
              className="resize-y min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningOutcomes">Learning Outcomes</Label>
            <Textarea
              id="learningOutcomes"
              {...register('learningOutcomes')}
              rows={2}
              style={{ resize: 'vertical' }}
              placeholder="Enter a detailed description of the learning outcomes..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alumniDetails">Alumni Details</Label>
            <Textarea
              id="alumniDetails"
              {...register('alumniDetails')}
              rows={2}
              style={{ resize: 'vertical' }}
              placeholder="Enter details about the program alumni and their achievements..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Tuition & Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Tuition & Fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tuitionFees.local">Local Fee</Label>
              <Input
                id="tuitionFees.local"
                type="number"
                min={0}
                {...register('tuitionFees.local', { valueAsNumber: true })}
                placeholder="Local tuition fee"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuitionFees.international">International Fee</Label>
              <Input
                id="tuitionFees.international"
                type="number"
                min={0}
                {...register('tuitionFees.international', { valueAsNumber: true })}
                placeholder="International tuition fee"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={watch('tuitionFees.currency')}
                onValueChange={val => setValue('tuitionFees.currency', val)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCurrencies.map((cur) => (
                    <SelectItem key={cur} value={cur}>{cur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicationFee">Application Fee</Label>
            <Input
              id="applicationFee"
              type="number"
              min={0}
              {...register('applicationFee', { valueAsNumber: true })}
              placeholder="Application fee"
              className="h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Arrays */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Program Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Languages */}
          <div className="mb-4">
            <Label htmlFor="languages">Languages of Instruction</Label>
            <CustomMultiSelect
              options={languageOptions}
              value={watch('languages') || []}
              onChange={val => setValue('languages', val)}
              placeholder="Select or type languages..."
              allowCustom
            />
            <span className="text-xs text-gray-500">Select all languages in which the program is taught. You can also type to add a language not in the list.</span>
          </div>

          {/* Application Deadlines */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Application Deadlines</Label>
            <div className="flex space-x-2">
              <Input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="h-10"
              />
              <Button
                type="button"
                onClick={() => addToArray('applicationDeadlines', newDeadline, setNewDeadline, watchedDeadlines)}
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedDeadlines.map((deadline, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {deadline}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('applicationDeadlines', deadline, watchedDeadlines)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Intake Sessions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Intake Sessions</Label>
            <div className="flex space-x-2">
              <Input
                value={newIntake}
                onChange={(e) => setNewIntake(e.target.value)}
                placeholder="Add intake session"
                className="h-10"
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
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedIntakes.map((intake, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {intake}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('intakeSessions', intake, watchedIntakes)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admission Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Admission Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="minGPA">Minimum GPA</Label>
              <Input
                id="minGPA"
                type="number"
                min={0}
                max={4}
                step={0.01}
                {...register('admissionRequirements.minGPA', { valueAsNumber: true })}
                placeholder="Minimum GPA"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lettersOfRecommendation">Letters of Recommendation</Label>
              <Input
                id="lettersOfRecommendation"
                type="number"
                min={0}
                {...register('admissionRequirements.lettersOfRecommendation', { valueAsNumber: true })}
                placeholder="Letters of recommendation"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailedRequirementNote">Detailed Requirement Note</Label>
            <Textarea
              id="detailedRequirementNote"
              {...register('admissionRequirements.detailedRequirementNote')}
              rows={2}
              style={{ resize: 'vertical' }}
              placeholder="Additional details about admission requirements..."
            />
          </div>

          {/* Required Degrees */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Required Degrees</Label>
            <div className="flex space-x-2">
              <Input
                value={newRequiredDegree}
                onChange={(e) => setNewRequiredDegree(e.target.value)}
                placeholder="Add required degree"
                className="h-10"
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
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedRequiredDegrees.map((degree, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {degree}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('admissionRequirements.requiredDegrees', degree, watchedRequiredDegrees)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Required Tests Multi-Select */}
          <div className="mb-4">
            <Label>Required Tests</Label>
            <CustomMultiSelect
              options={testOptions}
              value={watch('admissionRequirements.requiredTests')?.map((t: any) => t.name) || []}
              onChange={testNames => {
                // Map to objects with name and minScore, preserving existing minScores
                const prev = watch('admissionRequirements.requiredTests') || [];
                const newTests = testNames.map((name: string) => {
                  const existing = prev.find((t: any) => t.name === name);
                  return existing || { name, minScore: 0 };
                });
                setValue('admissionRequirements.requiredTests', newTests);
              }}
              placeholder="Select or type test names..."
              allowCustom
            />
            <span className="text-xs text-gray-500">Select all standardized tests required for admission. You can also type to add a test not in the list.</span>
            <div className="space-y-2 mt-2">
              {(watch('admissionRequirements.requiredTests') || []).map((test: any, idx: number) => (
                <div key={test.name} className="flex items-center gap-3">
                  <span className="min-w-[120px] font-medium">{test.name}</span>
                  <Label htmlFor={`requiredTests-minScore-${idx}`}>Minimum Score</Label>
                  <Input
                    id={`requiredTests-minScore-${idx}`}
                    type="number"
                    min={0}
                    value={test.minScore}
                    onChange={e => {
                      const updated = [...(watch('admissionRequirements.requiredTests') || [])];
                      updated[idx] = { ...test, minScore: e.target.value === '' ? undefined : Number(e.target.value) };
                      setValue('admissionRequirements.requiredTests', updated);
                    }}
                    className="w-32"
                  />
                </div>
              ))}
            </div>
          </div>

          {programLevel === 'Undergraduate' && (
            <div className="space-y-2">
              <Label htmlFor="satScore">SAT/ACT Score</Label>
              <Input id="satScore" {...register('admissionRequirements.satScore')} placeholder="Enter SAT/ACT score" className="h-11" />
            </div>
          )}
          {programLevel === 'Postgraduate' && (
            <div className="space-y-2">
              <Label htmlFor="greScore">GRE/GMAT Score</Label>
              <Input id="greScore" {...register('admissionRequirements.greScore')} placeholder="Enter GRE/GMAT score" className="h-11" />
              <Label htmlFor="workExperience">Work Experience (years)</Label>
              <Input id="workExperience" type="number" min={0} {...register('admissionRequirements.workExperience', { valueAsNumber: true })} placeholder="Enter years of work experience" className="h-11" />
              <Label htmlFor="thesisRequired">Thesis/Research Required?</Label>
              <Select value={watch('admissionRequirements.thesisRequired') || ''} onValueChange={val => setValue('admissionRequirements.thesisRequired', val)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Teaching Methodology */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Teaching Methodology</Label>
            <div className="flex space-x-2">
              <Input
                value={newMethodology}
                onChange={(e) => setNewMethodology(e.target.value)}
                placeholder="Add teaching method"
                className="h-10"
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
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedMethodology.map((method, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {method}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('teachingMethodology', method, watchedMethodology)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Career Outcomes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Career Outcomes</Label>
            <div className="flex space-x-2">
              <Input
                value={newCareerOutcome}
                onChange={(e) => setNewCareerOutcome(e.target.value)}
                placeholder="Add career outcome"
                className="h-10"
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
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedCareerOutcomes.map((outcome, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {outcome}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('careerOutcomes', outcome, watchedCareerOutcomes)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Available Scholarships */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Available Scholarships</Label>
            <div className="flex space-x-2">
              <Input
                value={newScholarship}
                onChange={(e) => setNewScholarship(e.target.value)}
                placeholder="Add scholarship ID"
                className="h-10"
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
                size="sm"
                className="h-10 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {watchedScholarships.map((scholarship, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {scholarship}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFromArray('availableScholarships', scholarship, watchedScholarships)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="brochureLink">Brochure Link</Label>
              <Input
                id="brochureLink"
                {...register('brochureLink')}
                placeholder="https://example.com/brochure"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vectorId">Vector ID</Label>
              <Input
                id="vectorId"
                {...register('vectorId')}
                placeholder="Unique vector identifier"
                className="h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="px-8">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? 'Saving...' : program ? 'Update Program' : 'Create Program'}
        </Button>
      </div>
    </form>
  );
}