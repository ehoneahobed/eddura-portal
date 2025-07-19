'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  Users, 
  Edit,
  Link,
  ExternalLink,
  MoreVertical,
  Unlink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RequirementStatus, RequirementType, RequirementCategory } from '@/types/requirements';
import { DocumentLinkingModal } from '@/components/applications/DocumentLinkingModal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Plain object interface for frontend use (without Mongoose Document methods)
interface RequirementData {
  _id: string;
  applicationId: string;
  requirementType: RequirementType;
  category: RequirementCategory;
  name: string;
  description?: string;
  isRequired: boolean;
  isOptional: boolean;
  documentType?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  wordLimit?: number;
  characterLimit?: number;
  testType?: string;
  minScore?: number;
  maxScore?: number;
  scoreFormat?: string;
  applicationFeeAmount?: number;
  applicationFeeCurrency?: string;
  applicationFeeDescription?: string;
  applicationFeePaid?: boolean;
  applicationFeePaidAt?: Date;
  interviewType?: string;
  interviewDuration?: number;
  interviewNotes?: string;
  status: RequirementStatus;
  submittedAt?: Date;
  verifiedAt?: Date;
  notes?: string;
  linkedDocumentId?: string;
  externalUrl?: string;
  taskId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RequirementCardProps {
  requirement: RequirementData;
  applicationId: string;
  onStatusUpdate: (requirementId: string, status: RequirementStatus, notes?: string) => Promise<void>;
  onDocumentLink: (requirementId: string, documentId: string, notes?: string) => Promise<void>;
  onRequirementUpdate?: (requirementId: string, updates: Partial<RequirementData>) => Promise<void>;
  onRequirementRefresh?: () => void;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  applicationId,
  onStatusUpdate,
  onDocumentLink,
  onRequirementUpdate,
  onRequirementRefresh
}) => {
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [notes, setNotes] = useState(requirement.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: requirement.name,
    description: requirement.description || '',
    isRequired: requirement.isRequired,
    isOptional: requirement.isOptional,
    wordLimit: requirement.wordLimit?.toString() || '',
    characterLimit: requirement.characterLimit?.toString() || '',
    minScore: requirement.minScore?.toString() || '',
    maxScore: requirement.maxScore?.toString() || '',
    applicationFeeAmount: requirement.applicationFeeAmount?.toString() || '',
    applicationFeeCurrency: requirement.applicationFeeCurrency || 'USD',
    interviewDuration: requirement.interviewDuration?.toString() || '',
    interviewNotes: requirement.interviewNotes || ''
  });

  const getStatusIcon = (status: RequirementStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'waived':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'not_applicable':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRequirementTypeIcon = (type: RequirementType) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'fee':
        return <DollarSign className="h-4 w-4" />;
      case 'interview':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: RequirementStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'waived':
        return 'bg-blue-100 text-blue-800';
      case 'not_applicable':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: RequirementCategory) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-orange-100 text-orange-800';
      case 'administrative':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (newStatus: RequirementStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(requirement._id.toString(), newStatus, notes);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotesSave = async () => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(requirement._id.toString(), requirement.status, notes);
      setShowNotes(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDocumentAction = async () => {
    if (requirement.linkedDocumentId) {
      // Unlink document
      try {
        console.log('Unlinking document from requirement:', requirement._id, 'in application:', applicationId);
        
        const response = await fetch(`/api/applications/${applicationId}/requirements/${requirement._id}/unlink-document`, {
          method: 'DELETE'
        });

        if (response.ok) {
          console.log('Document unlinked successfully');
          // Refresh the requirement data
          onRequirementRefresh?.();
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to unlink document:', response.status, errorData);
        }
      } catch (error) {
        console.error('Error unlinking document:', error);
      }
    } else {
      // Show document linking modal
      setShowDocumentModal(true);
    }
  };

  const handleEditSave = async () => {
    setIsUpdating(true);
    try {
      const updates: Partial<RequirementData> = {
        name: editForm.name,
        description: editForm.description || undefined,
        isRequired: editForm.isRequired,
        isOptional: editForm.isOptional,
        applicationFeeCurrency: editForm.applicationFeeCurrency,
        interviewNotes: editForm.interviewNotes || undefined
      };

      // Convert string values to numbers where appropriate
      if (editForm.wordLimit) {
        updates.wordLimit = parseInt(editForm.wordLimit);
      }
      if (editForm.characterLimit) {
        updates.characterLimit = parseInt(editForm.characterLimit);
      }
      if (editForm.minScore) {
        updates.minScore = parseFloat(editForm.minScore);
      }
      if (editForm.maxScore) {
        updates.maxScore = parseFloat(editForm.maxScore);
      }
      if (editForm.applicationFeeAmount) {
        updates.applicationFeeAmount = parseFloat(editForm.applicationFeeAmount);
      }
      if (editForm.interviewDuration) {
        updates.interviewDuration = parseInt(editForm.interviewDuration);
      }

      await onRequirementUpdate?.(requirement._id.toString(), updates);
      setShowEdit(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRequirementDetails = () => {
    const details = [];

    if (requirement.description) {
      details.push(requirement.description);
    }

    switch (requirement.requirementType) {
      case 'document':
        if (requirement.documentType) {
          details.push(`Type: ${requirement.documentType.replace('_', ' ')}`);
        }
        if (requirement.wordLimit) {
          details.push(`Word limit: ${requirement.wordLimit}`);
        }
        if (requirement.maxFileSize) {
          details.push(`Max file size: ${requirement.maxFileSize}MB`);
        }
        break;
      case 'test_score':
        if (requirement.testType) {
          details.push(`Test: ${requirement.testType.toUpperCase()}`);
        }
        if (requirement.minScore) {
          details.push(`Min score: ${requirement.minScore}`);
        }
        if (requirement.scoreFormat) {
          details.push(`Format: ${requirement.scoreFormat}`);
        }
        break;
      case 'fee':
        if (requirement.applicationFeeAmount) {
          details.push(`Amount: ${requirement.applicationFeeAmount} ${requirement.applicationFeeCurrency || 'USD'}`);
        }
        break;
      case 'interview':
        if (requirement.interviewType) {
          details.push(`Type: ${requirement.interviewType}`);
        }
        if (requirement.interviewDuration) {
          details.push(`Duration: ${requirement.interviewDuration} minutes`);
        }
        break;
    }

    return details;
  };

  const details = getRequirementDetails();

  return (
    <>
      <Card className={`transition-all duration-200 ${
        requirement.status === 'completed' ? 'border-green-200 bg-green-50/30' :
        requirement.status === 'in_progress' ? 'border-yellow-200 bg-yellow-50/30' :
        'border-gray-200'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getRequirementTypeIcon(requirement.requirementType)}
                <h3 className="font-medium text-gray-900">{requirement.name}</h3>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(requirement.status)}>
                    {getStatusIcon(requirement.status)}
                    <span className="ml-1 capitalize">
                      {requirement.status.replace('_', ' ')}
                    </span>
                  </Badge>
                  <Badge className={getCategoryColor(requirement.category)}>
                    {requirement.category}
                  </Badge>
                  {requirement.isRequired && !requirement.isOptional && (
                    <Badge variant="destructive">Required</Badge>
                  )}
                  {requirement.isOptional && (
                    <Badge variant="secondary">Optional</Badge>
                  )}
                </div>
              </div>

              {details.length > 0 && (
                <div className="text-sm text-gray-600 mb-3">
                  {details.map((detail, index) => (
                    <span key={index}>
                      {detail}
                      {index < details.length - 1 && ' • '}
                    </span>
                  ))}
                </div>
              )}

              {requirement.linkedDocumentId && (
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                  <Link className="h-4 w-4" />
                  <span>Document linked</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              )}

              {requirement.notes && (
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Notes:</strong> {requirement.notes}
                </div>
              )}

              {showNotes && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Add notes about this requirement..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleNotesSave}
                      disabled={isUpdating}
                    >
                      Save Notes
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowNotes(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {showEdit && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-4">
                  <h4 className="font-medium text-gray-900">Edit Requirement</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Requirement name"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional description"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isRequired"
                        checked={editForm.isRequired}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          isRequired: e.target.checked,
                          isOptional: e.target.checked ? false : prev.isOptional
                        }))}
                        className="rounded"
                      />
                      <Label htmlFor="isRequired" className="text-sm">Required</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isOptional"
                        checked={editForm.isOptional}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          isOptional: e.target.checked,
                          isRequired: e.target.checked ? false : prev.isRequired
                        }))}
                        className="rounded"
                      />
                      <Label htmlFor="isOptional" className="text-sm">Optional</Label>
                    </div>
                  </div>

                  {/* Type-specific fields */}
                  {requirement.requirementType === 'document' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Word Limit</Label>
                        <Input
                          type="number"
                          value={editForm.wordLimit}
                          onChange={(e) => setEditForm(prev => ({ ...prev, wordLimit: e.target.value }))}
                          placeholder="e.g., 500"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Character Limit</Label>
                        <Input
                          type="number"
                          value={editForm.characterLimit}
                          onChange={(e) => setEditForm(prev => ({ ...prev, characterLimit: e.target.value }))}
                          placeholder="e.g., 3000"
                        />
                      </div>
                    </div>
                  )}

                  {requirement.requirementType === 'test_score' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Minimum Score</Label>
                        <Input
                          type="number"
                          value={editForm.minScore}
                          onChange={(e) => setEditForm(prev => ({ ...prev, minScore: e.target.value }))}
                          placeholder="e.g., 6.5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Maximum Score</Label>
                        <Input
                          type="number"
                          value={editForm.maxScore}
                          onChange={(e) => setEditForm(prev => ({ ...prev, maxScore: e.target.value }))}
                          placeholder="e.g., 9.0"
                        />
                      </div>
                    </div>
                  )}

                  {requirement.requirementType === 'fee' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Fee Amount</Label>
                        <Input
                          type="number"
                          value={editForm.applicationFeeAmount}
                          onChange={(e) => setEditForm(prev => ({ ...prev, applicationFeeAmount: e.target.value }))}
                          placeholder="e.g., 75"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Currency</Label>
                        <Select
                          value={editForm.applicationFeeCurrency}
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, applicationFeeCurrency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {requirement.requirementType === 'interview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={editForm.interviewDuration}
                          onChange={(e) => setEditForm(prev => ({ ...prev, interviewDuration: e.target.value }))}
                          placeholder="e.g., 30"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Interview Notes</Label>
                        <Input
                          value={editForm.interviewNotes}
                          onChange={(e) => setEditForm(prev => ({ ...prev, interviewNotes: e.target.value }))}
                          placeholder="e.g., Virtual interview via Zoom"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={handleEditSave}
                      disabled={isUpdating}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowEdit(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Select
                value={requirement.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEdit(!showEdit)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {showEdit ? 'Hide Edit' : 'Edit Requirement'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowNotes(!showNotes)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {showNotes ? 'Hide Notes' : 'Add Notes'}
                  </DropdownMenuItem>
                  {requirement.requirementType === 'document' && (
                    <DropdownMenuItem onClick={handleDocumentAction}>
                      {requirement.linkedDocumentId ? (
                        <Unlink className="h-4 w-4 mr-2" />
                      ) : (
                        <Link className="h-4 w-4 mr-2" />
                      )}
                      {requirement.linkedDocumentId ? 'Unlink Document' : 'Link Document'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {showDocumentModal && (
        <DocumentLinkingModal
          requirement={requirement}
          onClose={() => setShowDocumentModal(false)}
          onDocumentLink={onDocumentLink}
        />
      )}
    </>
  );
}; 