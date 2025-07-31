'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Recipient {
  _id: string;
  name: string;
  emails: string[];
  primaryEmail: string;
  title: string;
  institution: string;
  department?: string;
  phoneNumber?: string;
  officeAddress?: string;
  prefersDrafts: boolean;
  preferredCommunicationMethod: string;
}

interface EditRecipientModalProps {
  recipient: Recipient;
  onRecipientUpdated: (recipient: Recipient) => void;
  onCancel: () => void;
}

export default function EditRecipientModal({ recipient, onRecipientUpdated, onCancel }: EditRecipientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: recipient.name,
    emails: recipient.emails,
    title: recipient.title,
    institution: recipient.institution,
    department: recipient.department || '',
    phoneNumber: recipient.phoneNumber || '',
    officeAddress: recipient.officeAddress || '',
    prefersDrafts: recipient.prefersDrafts,
    preferredCommunicationMethod: recipient.preferredCommunicationMethod
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.emails[0] || !formData.title || !formData.institution) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = formData.emails.filter(email => email && email.trim());
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }
    
    for (const email of validEmails) {
      if (!emailRegex.test(email)) {
        toast.error(`Please enter a valid email address: ${email}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/recommendations/recipients/${recipient._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        onRecipientUpdated(data.recipient);
      } else {
        toast.error(data.error || 'Failed to update recipient');
      }
    } catch (error) {
      console.error('Error updating recipient:', error);
      toast.error('Failed to update recipient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Recipient</DialogTitle>
          <DialogDescription>
            Update the information for {recipient.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Dr. John Smith"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Primary Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.emails[0] || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  emails: [e.target.value, ...prev.emails.slice(1)]
                }))}
                placeholder="john.smith@university.edu"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title/Position *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Professor of Computer Science"
                required
              />
            </div>
            <div>
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="Stanford University"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="additional-emails">Additional Emails (Optional)</Label>
            <div className="space-y-2">
              {formData.emails.slice(1).map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...formData.emails];
                      newEmails[index + 1] = e.target.value;
                      setFormData(prev => ({ ...prev, emails: newEmails }));
                    }}
                    placeholder="Additional email address"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEmails = formData.emails.filter((_, i) => i !== index + 1);
                      setFormData(prev => ({ ...prev, emails: newEmails }));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  emails: [...prev.emails, '']
                }))}
              >
                Add Another Email
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="department">Department (Optional)</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              placeholder="Computer Science Department"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="preferredCommunicationMethod">Preferred Contact Method</Label>
              <Select 
                value={formData.preferredCommunicationMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, preferredCommunicationMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="officeAddress">Office Address (Optional)</Label>
            <Textarea
              id="officeAddress"
              value={formData.officeAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, officeAddress: e.target.value }))}
              placeholder="Building 380, Room 381, Stanford, CA 94305"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="prefersDrafts"
              checked={formData.prefersDrafts}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, prefersDrafts: checked }))}
            />
            <Label htmlFor="prefersDrafts">Prefers to receive draft recommendations</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Recipient'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 