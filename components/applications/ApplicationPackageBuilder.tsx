'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  FileText,
  School,
  Star,
  Plus,
  ExternalLink,
  Calendar,
  Target,
  Search,
  Loader2
} from 'lucide-react';
import { RequirementsTemplateSelector } from './RequirementsTemplateSelector';
import { RequirementsChecklist } from './RequirementsChecklist';

interface ApplicationPackageBuilderProps {
  onComplete: (applicationData: any) => void;
  onCancel: () => void;
}

type Step = 'basic-info' | 'target-selection' | 'deadline-setup' | 'template-selection' | 'requirements-review' | 'finalize';

interface School {
  _id: string;
  name: string;
  country: string;
  city: string;
}

interface Program {
  _id: string;
  name: string;
  fieldOfStudy: string;
  degreeType: string;
  school: {
    _id: string;
    name: string;
  };
  requirementsTemplateId?: string;
}

interface Scholarship {
  _id: string;
  title: string;
  provider: string;
  deadline: string;
  value: number;
  currency: string;
  requirementsTemplateId?: string;
}

export const ApplicationPackageBuilder: React.FC<ApplicationPackageBuilderProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('basic-info');
  const [applicationData, setApplicationData] = useState({
    name: '',
    description: '',
    applicationType: 'school' as 'scholarship' | 'school' | 'program' | 'external',
    targetId: '',
    targetName: '',
    externalSchoolName: '',
    externalProgramName: '',
    externalScholarshipName: '',
    externalApplicationUrl: '',
    externalType: '' as 'program' | 'scholarship' | 'school' | '',
    applicationDeadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
    requirements: [] as any[],
    isExternal: false,
    selectedTemplateId: '' as string // Add this field
  });
  
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data fetching states
  const [schools, setSchools] = useState<School[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<any[]>([]); // Changed to any[] to match new structure
  const [startedApplications, setStartedApplications] = useState<any[]>([]); // Changed to any[] to match new structure
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [isLoadingScholarships, setIsLoadingScholarships] = useState(false);
  const [isLoadingSavedScholarships, setIsLoadingSavedScholarships] = useState(false);
  const [isLoadingStartedApplications, setIsLoadingStartedApplications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getCurrentSteps = () => {
    const baseSteps = [
      { id: 'basic-info', title: 'Basic Information', icon: <FileText className="h-4 w-4" /> },
      { id: 'target-selection', title: 'Target Selection', icon: <School className="h-4 w-4" /> },
      { id: 'deadline-setup', title: 'Deadline Setup', icon: <Calendar className="h-4 w-4" /> },
    ];
    
    // Conditionally include template selection and requirements review
    const optionalSteps = applicationData.selectedTemplateId ? [] : [
      { id: 'template-selection', title: 'Requirements Template', icon: <Star className="h-4 w-4" /> },
      { id: 'requirements-review', title: 'Review Requirements', icon: <Target className="h-4 w-4" /> }
    ];
    
    return [...baseSteps, ...optionalSteps, { id: 'finalize', title: 'Finalize', icon: <CheckCircle className="h-4 w-4" /> }];
  };

  const currentSteps = getCurrentSteps();
  const currentStepIndex = currentSteps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / currentSteps.length) * 100;

  // Fetch data based on application type
  useEffect(() => {
    if (currentStep === 'target-selection') {
      fetchData();
    }
  }, [currentStep, applicationData.applicationType]);

  const fetchData = async () => {
    if (applicationData.applicationType === 'school') {
      await fetchSchools();
    } else if (applicationData.applicationType === 'program') {
      await fetchPrograms();
    } else if (applicationData.applicationType === 'scholarship') {
      await fetchScholarships();
      await fetchSavedScholarships();
      await fetchStartedApplications();
    }
  };

  const fetchSchools = async () => {
    setIsLoadingSchools(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await fetch(`/api/schools?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const fetchPrograms = async () => {
    setIsLoadingPrograms(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await fetch(`/api/programs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  const fetchScholarships = async () => {
    setIsLoadingScholarships(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        includeExpired: 'false',
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await fetch(`/api/scholarships?${params}`);
      if (response.ok) {
        const data = await response.json();
        setScholarships(data.scholarships || []);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setIsLoadingScholarships(false);
    }
  };

  const fetchSavedScholarships = async () => {
    setIsLoadingSavedScholarships(true);
    try {
      const response = await fetch('/api/user/saved-scholarships');
      if (response.ok) {
        const data = await response.json();
        console.log('Saved scholarships raw data:', data);
        
        // Check if we have the expected structure
        if (!data.savedScholarships || !Array.isArray(data.savedScholarships)) {
          console.warn('No saved scholarships array found:', data);
          setSavedScholarships([]);
          return;
        }
        
        // Transform the data to match our expected structure
        const transformedScholarships = data.savedScholarships.map((saved: any) => {
          console.log('Processing saved scholarship:', saved);
          
          // Check if scholarshipId is populated
          if (!saved.scholarshipId || typeof saved.scholarshipId !== 'object') {
            console.warn('Saved scholarship without populated scholarshipId:', saved);
            return null;
          }
          
          return {
            _id: saved.scholarshipId._id,
            title: saved.scholarshipId.title,
            provider: saved.scholarshipId.provider,
            value: saved.scholarshipId.value,
            currency: saved.scholarshipId.currency,
            deadline: saved.scholarshipId.deadline,
            status: saved.status
          };
        }).filter(Boolean); // Remove null entries
        
        console.log('Transformed saved scholarships:', transformedScholarships);
        setSavedScholarships(transformedScholarships);
      } else {
        console.error('Failed to fetch saved scholarships:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching saved scholarships:', error);
    } finally {
      setIsLoadingSavedScholarships(false);
    }
  };

  const fetchStartedApplications = async () => {
    setIsLoadingStartedApplications(true);
    try {
      const response = await fetch('/api/applications?status=in_progress&applicationType=scholarship');
      if (response.ok) {
        const data = await response.json();
        console.log('Started applications raw data:', data);
        // Transform the data to include scholarship details
        const transformedApplications = data.applications?.map((app: any) => ({
          _id: app._id,
          scholarshipId: app.scholarshipId?._id || app.scholarshipId,
          scholarshipName: app.scholarshipId?.title || app.targetName || 'Unknown Scholarship',
          progress: app.progress || 0,
          status: app.status
        })) || [];
        console.log('Transformed started applications:', transformedApplications);
        setStartedApplications(transformedApplications);
      }
    } catch (error) {
      console.error('Error fetching started applications:', error);
    } finally {
      setIsLoadingStartedApplications(false);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentStep === 'target-selection' && searchQuery) {
        fetchData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const updateApplicationData = (field: string, value: any) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    const currentIndex = currentSteps.findIndex(step => step.id === currentStep);
    if (currentIndex < currentSteps.length - 1) {
      setCurrentStep(currentSteps[currentIndex + 1].id as Step);
    }
  };

  const prevStep = () => {
    const currentIndex = currentSteps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(currentSteps[currentIndex - 1].id as Step);
    }
  };

  const handleTemplateApplied = (templateId: string) => {
    console.log('Template applied:', templateId);
    setApplicationData(prev => ({
      ...prev,
      selectedTemplateId: templateId
    }));
    setShowTemplateSelector(false);
    nextStep();
  };

  const handleTargetSelection = (targetId: string, targetName: string) => {
    updateApplicationData('targetId', targetId);
    updateApplicationData('targetName', targetName);
    
    // Auto-select specific template if available
    if (applicationData.applicationType === 'scholarship') {
      // Find the selected scholarship and get its template
      const selectedScholarship = scholarships.find(s => s._id === targetId);
      if (selectedScholarship?.requirementsTemplateId) {
        updateApplicationData('selectedTemplateId', selectedScholarship.requirementsTemplateId);
        console.log('Auto-selected scholarship-specific template:', selectedScholarship.requirementsTemplateId);
      }
    } else if (applicationData.applicationType === 'program') {
      // Find the selected program and get its template
      const selectedProgram = programs.find(p => p._id === targetId);
      if (selectedProgram?.requirementsTemplateId) {
        updateApplicationData('selectedTemplateId', selectedProgram.requirementsTemplateId);
        console.log('Auto-selected program-specific template:', selectedProgram.requirementsTemplateId);
      }
    }
    
    // Auto-fill deadline for scholarships
    if (applicationData.applicationType === 'scholarship') {
      const selectedScholarship = scholarships.find(s => s._id === targetId);
      if (selectedScholarship?.deadline) {
        updateApplicationData('applicationDeadline', selectedScholarship.deadline.split('T')[0]);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create the application first
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        throw new Error('Failed to create application package');
      }

      const result = await response.json();
      const applicationId = result.applicationId;

      // Apply template if one was selected
      if (applicationData.selectedTemplateId) {
        try {
          const templateResponse = await fetch(`/api/requirements-templates/${applicationData.selectedTemplateId}/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId })
          });

          if (templateResponse.ok) {
            console.log('Template applied successfully');
          } else {
            console.warn('Failed to apply template, but application was created');
          }
        } catch (templateError) {
          console.warn('Error applying template:', templateError);
        }
      }

      // Call the onComplete callback with the created application
      onComplete(result.application);
    } catch (error) {
      console.error('Error creating application package:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic-info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Application Package Name *</Label>
              <Input
                id="name"
                placeholder="e.g., MIT Computer Science Application"
                value={applicationData.name}
                onChange={(e) => updateApplicationData('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this application package..."
                value={applicationData.description}
                onChange={(e) => updateApplicationData('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicationType">Application Type *</Label>
                <Select
                  value={applicationData.applicationType}
                  onValueChange={(value) => {
                    updateApplicationData('applicationType', value);
                    updateApplicationData('targetId', '');
                    updateApplicationData('targetName', '');
                    updateApplicationData('applicationDeadline', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="program">Program</SelectItem>
                    <SelectItem value="scholarship">Scholarship</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={applicationData.priority}
                  onValueChange={(value) => updateApplicationData('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this application..."
                value={applicationData.notes}
                onChange={(e) => updateApplicationData('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 'target-selection':
        return (
          <div className="space-y-4">
            {applicationData.applicationType === 'external' ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">External Application</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Add an external school, program, or scholarship not in our database to your application package.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalType">External Type *</Label>
                  <Select
                    value={applicationData.externalType || ''}
                    onValueChange={(value) => updateApplicationData('externalType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select external type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="program">Program</SelectItem>
                      <SelectItem value="scholarship">Scholarship</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalSchoolName">School/Institution Name *</Label>
                  <Input
                    id="externalSchoolName"
                    placeholder="e.g., Massachusetts Institute of Technology"
                    value={applicationData.externalSchoolName}
                    onChange={(e) => updateApplicationData('externalSchoolName', e.target.value)}
                    required
                  />
                </div>

                {applicationData.externalType === 'program' && (
                  <div className="space-y-2">
                    <Label htmlFor="externalProgramName">Program Name *</Label>
                    <Input
                      id="externalProgramName"
                      placeholder="e.g., Master of Science in Computer Science"
                      value={applicationData.externalProgramName}
                      onChange={(e) => updateApplicationData('externalProgramName', e.target.value)}
                      required
                    />
                  </div>
                )}

                {applicationData.externalType === 'scholarship' && (
                  <div className="space-y-2">
                    <Label htmlFor="externalScholarshipName">Scholarship Name *</Label>
                    <Input
                      id="externalScholarshipName"
                      placeholder="e.g., MIT Merit Scholarship"
                      value={applicationData.externalScholarshipName}
                      onChange={(e) => updateApplicationData('externalScholarshipName', e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="externalApplicationUrl">Application URL</Label>
                  <Input
                    id="externalApplicationUrl"
                    type="url"
                    placeholder="https://..."
                    value={applicationData.externalApplicationUrl}
                    onChange={(e) => updateApplicationData('externalApplicationUrl', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <School className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Select Target</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    {applicationData.applicationType === 'scholarship' 
                      ? 'Choose from your saved scholarships, started applications, or search for new ones.'
                      : applicationData.applicationType === 'school'
                      ? 'Browse and select schools you\'re interested in applying to.'
                      : 'Browse and select programs you\'re interested in applying to.'
                    }
                  </p>
                </div>

                {applicationData.applicationType === 'scholarship' && (
                  <div className="space-y-4">
                    {/* Debug Info - Remove this later */}
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <div className="font-medium text-yellow-800 mb-1">Debug Info:</div>
                      <div>Saved Scholarships: {savedScholarships.length}</div>
                      <div>Started Applications: {startedApplications.length}</div>
                      <div>Loading Saved: {isLoadingSavedScholarships ? 'Yes' : 'No'}</div>
                      <div>Loading Started: {isLoadingStartedApplications ? 'Yes' : 'No'}</div>
                    </div>

                    {/* Saved Scholarships */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Your Saved Scholarships</Label>
                      <div className="max-h-32 overflow-y-auto border rounded-lg">
                        {isLoadingSavedScholarships ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2 text-sm">Loading saved scholarships...</span>
                          </div>
                        ) : savedScholarships.length > 0 ? (
                          <div className="divide-y">
                            {savedScholarships.map((scholarship) => (
                              <button
                                key={scholarship._id}
                                onClick={() => handleTargetSelection(scholarship._id, scholarship.title)}
                                className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                                  applicationData.targetId === scholarship._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                              >
                                <div className="font-medium text-sm">{scholarship.title}</div>
                                <div className="text-xs text-gray-600">
                                  {scholarship.provider} • {scholarship.value} {scholarship.currency}
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                  Saved • {scholarship.status}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-gray-500">
                            <div className="mb-2">No saved scholarships</div>
                            <div className="text-xs">Save scholarships from the Scholarships page to see them here</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Started Applications */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Started Applications</Label>
                      <div className="max-h-32 overflow-y-auto border rounded-lg">
                        {isLoadingStartedApplications ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2 text-sm">Loading started applications...</span>
                          </div>
                        ) : startedApplications.length > 0 ? (
                          <div className="divide-y">
                            {startedApplications.map((application) => (
                              <button
                                key={application._id}
                                onClick={() => handleTargetSelection(application.scholarshipId, application.scholarshipName)}
                                className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                                  applicationData.targetId === application.scholarshipId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                              >
                                <div className="font-medium text-sm">{application.scholarshipName}</div>
                                <div className="text-xs text-gray-600">
                                  Application in progress • {application.progress}% complete
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                  Status: {application.status}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-gray-500">
                            <div className="mb-2">No started applications</div>
                            <div className="text-xs">Start applying to scholarships to see them here</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Search for new targets */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search {applicationData.applicationType === 'scholarship' ? 'New ' : ''}{applicationData.applicationType.charAt(0).toUpperCase() + applicationData.applicationType.slice(1)}s</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder={`Search ${applicationData.applicationType}s...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available {applicationData.applicationType.charAt(0).toUpperCase() + applicationData.applicationType.slice(1)}s</Label>
                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    {isLoadingSchools || isLoadingPrograms || isLoadingScholarships ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Loading...</span>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {applicationData.applicationType === 'school' && schools.map((school) => (
                          <button
                            key={school._id}
                            onClick={() => handleTargetSelection(school._id, school.name)}
                            className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                              applicationData.targetId === school._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            <div className="font-medium">{school.name}</div>
                            <div className="text-sm text-gray-600">{school.city}, {school.country}</div>
                          </button>
                        ))}
                        
                        {applicationData.applicationType === 'program' && programs.map((program) => (
                          <button
                            key={program._id}
                            onClick={() => handleTargetSelection(program._id, program.name)}
                            className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                              applicationData.targetId === program._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            <div className="font-medium">{program.name}</div>
                            <div className="text-sm text-gray-600">
                              {program.degreeType} in {program.fieldOfStudy} • {program.school.name}
                            </div>
                          </button>
                        ))}
                        
                        {applicationData.applicationType === 'scholarship' && scholarships.map((scholarship) => (
                          <button
                            key={scholarship._id}
                            onClick={() => handleTargetSelection(scholarship._id, scholarship.title)}
                            className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                              applicationData.targetId === scholarship._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            <div className="font-medium">{scholarship.title}</div>
                            <div className="text-sm text-gray-600">
                              {scholarship.provider} • {scholarship.value} {scholarship.currency}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateApplicationData('isExternal', true);
                      updateApplicationData('targetId', '');
                      updateApplicationData('targetName', '');
                    }}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!applicationData.targetId && !applicationData.isExternal}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'deadline-setup':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-900">Application Deadline</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Set the deadline for this application. For scholarships, this is automatically filled from the scholarship data.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                type="date"
                value={applicationData.applicationDeadline}
                onChange={(e) => updateApplicationData('applicationDeadline', e.target.value)}
              />
              {applicationData.applicationType === 'scholarship' && applicationData.targetId && (
                <p className="text-sm text-gray-600">
                  This deadline is automatically set from the selected scholarship data.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={nextStep}
                className="flex-1"
              >
                Skip Deadline
              </Button>
              <Button
                onClick={nextStep}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 'template-selection':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-900">Requirements Template</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Choose a template to automatically populate requirements for your application.
              </p>
            </div>

            {applicationData.selectedTemplateId ? (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-900">Template Selected</h4>
                    <p className="text-sm text-green-700">
                      A template has been selected and will be applied when you create the application package.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setApplicationData(prev => ({ ...prev, selectedTemplateId: '' }));
                    }}
                  >
                    Change Template
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowTemplateSelector(true)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Template
                </Button>
                <Button
                  variant="outline"
                  onClick={nextStep}
                  className="flex-1"
                >
                  Skip Template
                </Button>
              </div>
            )}

            {/* Setup System Templates Button */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">No Templates Available?</h4>
                  <p className="text-sm text-blue-700">
                    Create default system templates for graduate, undergraduate, and scholarship applications.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/requirements-templates/setup-system', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      });
                      
                      if (response.ok) {
                        console.log('System templates created successfully');
                        // Refresh the template selector
                        setShowTemplateSelector(true);
                      } else {
                        console.error('Failed to create system templates');
                      }
                    } catch (error) {
                      console.error('Error creating system templates:', error);
                    }
                  }}
                >
                  Create Default Templates
                </Button>
              </div>
            </div>

            {showTemplateSelector && (
              <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Requirements Template</DialogTitle>
                  </DialogHeader>
                  <RequirementsTemplateSelector
                    onTemplateApplied={handleTemplateApplied}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        );

      case 'requirements-review':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-900">Review Requirements</h3>
              </div>
              <p className="text-sm text-green-700">
                Review and customize the requirements for your application.
              </p>
            </div>

            {applicationData.selectedTemplateId ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Template Requirements Preview</CardTitle>
                    <p className="text-sm text-gray-600">
                      These requirements will be automatically added to your application package when created.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Template Selected</span>
                        <Badge variant="outline" className="capitalize">
                          {applicationData.selectedTemplateId ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Requirements</span>
                        <Badge variant="outline">
                          Will be populated from template
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Next Steps</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    After creating your application package, you'll be able to:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Review and customize all requirements</li>
                    <li>• Link existing documents from your library</li>
                    <li>• Create new documents for specific requirements</li>
                    <li>• Track your progress towards completion</li>
                    <li>• Mark requirements as completed or waived</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You haven't selected a requirements template. You can add requirements manually after creating your application package.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowTemplateSelector(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Select Template
                    </Button>
                  </CardContent>
                </Card>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Manual Requirements</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    You can add requirements manually after creating your application package. Common requirements include:
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Personal statement or essay</li>
                    <li>• Academic transcripts</li>
                    <li>• Letters of recommendation</li>
                    <li>• Standardized test scores</li>
                    <li>• Application fees</li>
                    <li>• Interview preparation</li>
                  </ul>
                </div>
              </div>
            )}

            {showTemplateSelector && (
              <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Requirements Template</DialogTitle>
                  </DialogHeader>
                  <RequirementsTemplateSelector
                    onTemplateApplied={handleTemplateApplied}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        );

      case 'finalize':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-900">Ready to Create</h3>
              </div>
              <p className="text-sm text-green-700">
                Review your application package details before creating it.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Application Package Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-gray-600">{applicationData.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <Badge variant="outline" className="capitalize">
                      {applicationData.applicationType}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge variant="outline" className="capitalize">
                      {applicationData.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Deadline</Label>
                    <p className="text-sm text-gray-600">
                      {applicationData.applicationDeadline ? new Date(applicationData.applicationDeadline).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>

                {applicationData.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-gray-600">{applicationData.description}</p>
                  </div>
                )}

                {applicationData.targetName && (
                  <div>
                    <Label className="text-sm font-medium">Target</Label>
                    <p className="text-sm text-gray-600">{applicationData.targetName}</p>
                  </div>
                )}

                {applicationData.isExternal && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">External Type</Label>
                      <Badge variant="outline" className="capitalize">
                        {applicationData.externalType}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">External School</Label>
                      <p className="text-sm text-gray-600">{applicationData.externalSchoolName}</p>
                    </div>
                    {applicationData.externalType === 'program' && applicationData.externalProgramName && (
                      <div>
                        <Label className="text-sm font-medium">External Program</Label>
                        <p className="text-sm text-gray-600">{applicationData.externalProgramName}</p>
                      </div>
                    )}
                    {applicationData.externalType === 'scholarship' && applicationData.externalScholarshipName && (
                      <div>
                        <Label className="text-sm font-medium">External Scholarship</Label>
                        <p className="text-sm text-gray-600">{applicationData.externalScholarshipName}</p>
                      </div>
                    )}
                    {applicationData.externalApplicationUrl && (
                      <div>
                        <Label className="text-sm font-medium">Application URL</Label>
                        <p className="text-sm text-gray-600">{applicationData.externalApplicationUrl}</p>
                      </div>
                    )}
                  </>
                )}

                {applicationData.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-gray-600">{applicationData.notes}</p>
                  </div>
                )}

                {applicationData.selectedTemplateId && (
                  <div>
                    <Label className="text-sm font-medium">Requirements Template</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-700 bg-green-50">
                        Auto-selected
                      </Badge>
                      <p className="text-sm text-gray-600">
                        Requirements will be automatically populated from the selected template
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'basic-info':
        return applicationData.name.trim() !== '';
      case 'target-selection':
        if (applicationData.applicationType === 'external') {
          return applicationData.externalSchoolName.trim() !== '' && 
                 applicationData.externalType !== '' &&
                 ((applicationData.externalType === 'program' && applicationData.externalProgramName.trim() !== '') ||
                  (applicationData.externalType === 'scholarship' && applicationData.externalScholarshipName.trim() !== '') ||
                  (applicationData.externalType === 'school'));
        }
        return true; // Allow proceeding even without selection (can associate later)
      case 'deadline-setup':
        return true; // Deadline is optional
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create Application Package</CardTitle>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Step {currentStepIndex + 1} of {currentSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {currentSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  index <= currentStepIndex 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {step.icon}
                  <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                </div>
                {index < currentSteps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    index < currentStepIndex ? 'bg-blue-300' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === 'finalize' ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Application Package'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 