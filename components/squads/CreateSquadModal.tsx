'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSquad, mutate } from '@/hooks/use-squads';
import { toast } from 'sonner';

interface CreateSquadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primarySquadExists: boolean;
}

export default function CreateSquadModal({ open, onOpenChange, primarySquadExists }: CreateSquadModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 6,
    visibility: 'invite_only' as const,
    formationType: 'general' as const,
    squadType: 'secondary' as 'primary' | 'secondary',
    academicLevel: [] as string[],
    fieldOfStudy: [] as string[],
    geographicRegion: [] as string[],
    activityLevel: 'medium' as const,
    goals: [] as any[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('You must be signed in to create a squad');
      return;
    }

    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // If user already has a primary squad, force squad type to secondary
    if (primarySquadExists && formData.squadType === 'primary') {
      formData.squadType = 'secondary';
    }

    setIsLoading(true);
    try {
      await createSquad({
        name: formData.name,
        description: formData.description,
        maxMembers: formData.maxMembers,
        visibility: formData.visibility,
        formationType: formData.formationType,
        academicLevel: formData.academicLevel,
        fieldOfStudy: formData.fieldOfStudy,
        geographicRegion: formData.geographicRegion,
        activityLevel: formData.activityLevel,
        squadType: formData.squadType,
        goals: formData.goals
      });

      toast.success('Squad created successfully!');
      onOpenChange(false);
      
      // Refresh squad data
      await mutate('/api/squads');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        maxMembers: 6,
        visibility: 'invite_only',
        formationType: 'general',
        squadType: 'secondary',
        academicLevel: [],
        fieldOfStudy: [],
        geographicRegion: [],
        activityLevel: 'medium',
        goals: []
      });
    } catch (error) {
      console.error('Failed to create squad:', error);
      toast.error('Failed to create squad. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Squad</DialogTitle>
          <DialogDescription>
            Start a collaborative group to support your application journey
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="name">Squad Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter squad name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your squad's purpose and goals"
              rows={3}
              required
            />
          </div>

          {/* Squad Type */}
          <div className="space-y-2">
            <Label htmlFor="squadType">Squad Type</Label>
            <Select
              value={formData.squadType}
              onValueChange={(value) => handleInputChange('squadType', value)}
              disabled={primarySquadExists}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary" disabled={primarySquadExists}>
                  Primary Squad {primarySquadExists && '(Already have one)'}
                </SelectItem>
                <SelectItem value="secondary">Secondary Squad</SelectItem>
              </SelectContent>
            </Select>
            {primarySquadExists && (
              <p className="text-xs text-muted-foreground">
                You already have a primary squad. Creating a secondary squad.
              </p>
            )}
          </div>

          {/* Squad Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxMembers">Max Members</Label>
              <Select
                value={formData.maxMembers.toString()}
                onValueChange={(value) => handleInputChange('maxMembers', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 members</SelectItem>
                  <SelectItem value="6">6 members</SelectItem>
                  <SelectItem value="8">8 members</SelectItem>
                  <SelectItem value="10">10 members</SelectItem>
                  <SelectItem value="12">12 members</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => handleInputChange('visibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="invite_only">Invite Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Formation Type */}
          <div className="space-y-2">
            <Label htmlFor="formationType">Formation Type</Label>
            <Select
              value={formData.formationType}
              onValueChange={(value) => handleInputChange('formationType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="academic_level">Academic Level</SelectItem>
                <SelectItem value="field_of_study">Field of Study</SelectItem>
                <SelectItem value="geographic">Geographic</SelectItem>
                <SelectItem value="activity_based">Activity Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Expected Activity Level</Label>
            <Select
              value={formData.activityLevel}
              onValueChange={(value) => handleInputChange('activityLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Casual)</SelectItem>
                <SelectItem value="medium">Medium (Regular)</SelectItem>
                <SelectItem value="high">High (Intensive)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Squad'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}