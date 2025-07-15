'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Calendar,
  MapPin,
  DollarSign,
  Plus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ApplicationType, ApplicationStatus } from '@/models/Application';

interface School {
  _id: string;
  name: string;
  country: string;
  city: string;
}

interface Program {
  _id: string;
  title: string;
  school: string;
  degree: string;
}

interface Scholarship {
  _id: string;
  title: string;
  value?: number;
  currency?: string;
  deadline: string;
}

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationAdded: (application: any) => void;
}

export default function AddApplicationModal({ isOpen, onClose, onApplicationAdded }: AddApplicationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [applicationType, setApplicationType] = useState<ApplicationType>('school');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('not_started');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [earlyDecisionDeadline, setEarlyDecisionDeadline] = useState('');
  const [regularDecisionDeadline, setRegularDecisionDeadline] = useState('');
  const [rollingDeadline, setRollingDeadline] = useState(false);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Related entity selection
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedScholarshipId, setSelectedScholarshipId] = useState('');

  // Available options
  const [schools, setSchools] = useState<School[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableOptions();
    }
  }, [isOpen]);

  const fetchAvailableOptions = async () => {
    try {
      // Fetch schools
      const schoolsResponse = await fetch('/api/schools');
      if (schoolsResponse.ok) {
        const schoolsData = await schoolsResponse.json();
        setSchools(schoolsData.schools || []);
      }

      // Fetch programs
      const programsResponse = await fetch('/api/programs');
      if (programsResponse.ok) {
        const programsData = await programsResponse.json();
        setPrograms(programsData.programs || []);
      }

      // Fetch scholarships
      const scholarshipsResponse = await fetch('/api/scholarships');
      if (scholarshipsResponse.ok) {
        const scholarshipsData = await scholarshipsResponse.json();
        setScholarships(scholarshipsData.scholarships || []);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for your application');
      return;
    }

    if (!applicationDeadline) {
      toast.error('Please set an application deadline');
      return;
    }

    setIsLoading(true);

    try {
      const applicationData = {
        applicationType,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        applicationDeadline: new Date(applicationDeadline).toISOString(),
        earlyDecisionDeadline: earlyDecisionDeadline ? new Date(earlyDecisionDeadline).toISOString() : undefined,
        regularDecisionDeadline: regularDecisionDeadline ? new Date(regularDecisionDeadline).toISOString() : undefined,
        rollingDeadline,
        notes: notes.trim(),
        tags,
        // Related entity IDs
        schoolId: applicationType === 'school' ? selectedSchoolId : undefined,
        programId: applicationType === 'program' ? selectedProgramId : undefined,
        scholarshipId: applicationType === 'scholarship' ? selectedScholarshipId : undefined,
      };

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        const newApplication = await response.json();
        onApplicationAdded(newApplication);
        toast.success('Application added successfully!');
        handleClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add application');
      }
    } catch (error) {
      console.error('Error adding application:', error);
      toast.error('Failed to add application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStatus('not_started');
    setPriority('medium');
    setApplicationDeadline('');
    setEarlyDecisionDeadline('');
    setRegularDecisionDeadline('');
    setRollingDeadline(false);
    setNotes('');
    setTags([]);
    setNewTag('');
    setSelectedSchoolId('');
    setSelectedProgramId('');
    setSelectedScholarshipId('');
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getTypeInfo = (type: ApplicationType) => {
    switch (type) {
      case 'school':
        return { color: 'bg-blue-100 text-blue-800', icon: GraduationCap, label: 'School' };
      case 'program':
        return { color: 'bg-purple-100 text-purple-800', icon: BookOpen, label: 'Program' };
      case 'scholarship':
        return { color: 'bg-green-100 text-green-800', icon: Award, label: 'Scholarship' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: GraduationCap, label: 'Unknown' };
    }
  };

  const typeInfo = getTypeInfo(applicationType);
  const TypeIcon = typeInfo.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <TypeIcon className="w-6 h-6" />
                <h2 className="text-xl font-semibold text-gray-900">Add New Application</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Application Type */}
              <div className="space-y-2">
                <Label htmlFor="applicationType">Application Type</Label>
                <Select value={applicationType} onValueChange={(value: ApplicationType) => setApplicationType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        School Application
                      </div>
                    </SelectItem>
                    <SelectItem value="program">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Program Application
                      </div>
                    </SelectItem>
                    <SelectItem value="scholarship">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Scholarship Application
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Related Entity Selection */}
              {applicationType === 'school' && (
                <div className="space-y-2">
                  <Label htmlFor="school">Select School (Optional)</Label>
                  <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a school..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Create new school application</SelectItem>
                      {schools.map(school => (
                        <SelectItem key={school._id} value={school._id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {school.name} - {school.city}, {school.country}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {applicationType === 'program' && (
                <div className="space-y-2">
                  <Label htmlFor="program">Select Program (Optional)</Label>
                  <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a program..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Create new program application</SelectItem>
                      {programs.map(program => (
                        <SelectItem key={program._id} value={program._id}>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {program.title} - {program.degree}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {applicationType === 'scholarship' && (
                <div className="space-y-2">
                  <Label htmlFor="scholarship">Select Scholarship (Optional)</Label>
                  <Select value={selectedScholarshipId} onValueChange={setSelectedScholarshipId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a scholarship..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Create new scholarship application</SelectItem>
                      {scholarships.map(scholarship => (
                        <SelectItem key={scholarship._id} value={scholarship._id}>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {scholarship.title}
                            {scholarship.value && (
                              <span className="text-sm text-gray-500">
                                - {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: scholarship.currency || 'USD',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(scholarship.value)}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Application Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for this application"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional details about this application"
                  rows={3}
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: ApplicationStatus) => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="researching">Researching</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="waiting_for_documents">Waiting for Documents</SelectItem>
                      <SelectItem value="waiting_for_recommendations">Waiting for Recommendations</SelectItem>
                      <SelectItem value="waiting_for_test_scores">Waiting for Test Scores</SelectItem>
                      <SelectItem value="ready_to_submit">Ready to Submit</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="interview_completed">Interview Completed</SelectItem>
                      <SelectItem value="waiting_for_feedback">Waiting for Feedback</SelectItem>
                      <SelectItem value="need_to_follow_up">Need to Follow Up</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                      <SelectItem value="deferred">Deferred</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
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

              {/* Deadlines */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Deadlines
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="earlyDecisionDeadline">Early Decision Deadline</Label>
                    <Input
                      id="earlyDecisionDeadline"
                      type="date"
                      value={earlyDecisionDeadline}
                      onChange={(e) => setEarlyDecisionDeadline(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regularDecisionDeadline">Regular Decision Deadline</Label>
                    <Input
                      id="regularDecisionDeadline"
                      type="date"
                      value={regularDecisionDeadline}
                      onChange={(e) => setRegularDecisionDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rollingDeadline"
                    checked={rollingDeadline}
                    onCheckedChange={(checked) => setRollingDeadline(checked as boolean)}
                  />
                  <Label htmlFor="rollingDeadline">Rolling deadline (no fixed date)</Label>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any personal notes about this application"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Application'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}