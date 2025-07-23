'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateRequirementData } from '@/types/requirements';

interface AddRequirementModalProps {
  applicationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddRequirementModal: React.FC<AddRequirementModalProps> = ({
  applicationId,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<CreateRequirementData>>({
    applicationId,
    name: '',
    description: '',
    requirementType: 'document',
    category: 'academic',
    isRequired: true,
    isOptional: false,
    order: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.requirementType || !formData.category) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/application-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create requirement');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating requirement:', error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof CreateRequirementData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Requirement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="name">Requirement Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Personal Statement, TOEFL Score, Application Fee"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description of the requirement..."
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requirementType">Requirement Type *</Label>
              <Select
                value={formData.requirementType}
                onValueChange={(value) => updateFormData('requirementType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="test_score">Test Score</SelectItem>
                  <SelectItem value="fee">Application Fee</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Required/Optional */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isRequired"
                checked={formData.isRequired}
                onCheckedChange={(checked) => updateFormData('isRequired', checked)}
              />
              <Label htmlFor="isRequired">Required</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isOptional"
                checked={formData.isOptional}
                onCheckedChange={(checked) => updateFormData('isOptional', checked)}
              />
              <Label htmlFor="isOptional">Optional</Label>
            </div>
          </div>

          {/* Type-specific fields */}
          {formData.requirementType === 'document' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Document Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => updateFormData('documentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal_statement">Personal Statement</SelectItem>
                      <SelectItem value="cv">CV/Resume</SelectItem>
                      <SelectItem value="transcript">Transcript</SelectItem>
                      <SelectItem value="recommendation_letter">Recommendation Letter</SelectItem>
                      <SelectItem value="test_scores">Test Scores</SelectItem>
                      <SelectItem value="portfolio">Portfolio</SelectItem>
                      <SelectItem value="financial_documents">Financial Documents</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    placeholder="10"
                    value={formData.maxFileSize}
                    onChange={(e) => updateFormData('maxFileSize', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wordLimit">Word Limit</Label>
                <Input
                  id="wordLimit"
                  type="number"
                  placeholder="1000"
                  value={formData.wordLimit}
                  onChange={(e) => updateFormData('wordLimit', parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>
          )}

          {formData.requirementType === 'test_score' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Test Score Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testType">Test Type</Label>
                  <Select
                    value={formData.testType}
                    onValueChange={(value) => updateFormData('testType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toefl">TOEFL</SelectItem>
                      <SelectItem value="ielts">IELTS</SelectItem>
                      <SelectItem value="gre">GRE</SelectItem>
                      <SelectItem value="gmat">GMAT</SelectItem>
                      <SelectItem value="sat">SAT</SelectItem>
                      <SelectItem value="act">ACT</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minScore">Minimum Score</Label>
                  <Input
                    id="minScore"
                    type="number"
                    placeholder="80"
                    value={formData.minScore}
                    onChange={(e) => updateFormData('minScore', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scoreFormat">Score Format</Label>
                <Input
                  id="scoreFormat"
                  placeholder="e.g., 80+ total score, 25+ per section"
                  value={formData.scoreFormat}
                  onChange={(e) => updateFormData('scoreFormat', e.target.value)}
                />
              </div>
            </div>
          )}

          {formData.requirementType === 'fee' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Fee Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationFeeAmount">Amount</Label>
                  <Input
                    id="applicationFeeAmount"
                    type="number"
                    placeholder="75"
                    value={formData.applicationFeeAmount}
                    onChange={(e) => updateFormData('applicationFeeAmount', parseFloat(e.target.value) || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicationFeeCurrency">Currency</Label>
                  <Select
                    value={formData.applicationFeeCurrency}
                    onValueChange={(value) => updateFormData('applicationFeeCurrency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
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
              <div className="space-y-2">
                <Label htmlFor="applicationFeeDescription">Description</Label>
                <Input
                  id="applicationFeeDescription"
                  placeholder="e.g., Non-refundable application processing fee"
                  value={formData.applicationFeeDescription}
                  onChange={(e) => updateFormData('applicationFeeDescription', e.target.value)}
                />
              </div>
            </div>
          )}

          {formData.requirementType === 'interview' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Interview Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interviewType">Interview Type</Label>
                  <Select
                    value={formData.interviewType}
                    onValueChange={(value) => updateFormData('interviewType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="multiple">Multiple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interviewDuration">Duration (minutes)</Label>
                  <Input
                    id="interviewDuration"
                    type="number"
                    placeholder="30"
                    value={formData.interviewDuration}
                    onChange={(e) => updateFormData('interviewDuration', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewNotes">Notes</Label>
                <Textarea
                  id="interviewNotes"
                  placeholder="Additional information about the interview..."
                  value={formData.interviewNotes}
                  onChange={(e) => updateFormData('interviewNotes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              placeholder="0"
              value={formData.order}
              onChange={(e) => updateFormData('order', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Requirement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 