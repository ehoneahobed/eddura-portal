'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Users, 
  Phone, 
  CalendarDays, 
  BookOpen, 
  Users as MeetingIcon,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Application {
  _id: string;
  scholarshipId: {
    _id: string;
    title: string;
    value?: number;
    currency?: string;
    deadline: string;
    type?: 'scholarship' | 'program' | 'school';
  };
  status: string;
  progress: number;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  onTaskAdded: () => void;
}

const taskTypes = [
  { value: 'application', label: 'Application Task', icon: FileText, description: 'Application-related task' },
  { value: 'interview', label: 'Interview', icon: Users, description: 'Interview or meeting' },
  { value: 'follow_up', label: 'Follow Up', icon: Phone, description: 'Follow-up call or email' },
  { value: 'deadline', label: 'Deadline', icon: CalendarDays, description: 'Important deadline' },
  { value: 'document', label: 'Document', icon: BookOpen, description: 'Document preparation' },
  { value: 'meeting', label: 'Meeting', icon: MeetingIcon, description: 'General meeting' }
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
];

export default function AddTaskModal({ isOpen, onClose, applications, onTaskAdded }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    applicationId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Task added successfully');
        onTaskAdded();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      applicationId: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedTaskType = taskTypes.find(type => type.value === formData.type);
  const TaskTypeIcon = selectedTaskType?.icon || FileText;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md"
          >
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">Add New Task</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Task Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Task Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedTaskType && (
                      <p className="text-sm text-gray-500">{selectedTaskType.description}</p>
                    )}
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter task description (optional)"
                      rows={3}
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <span className={priority.color}>{priority.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    />
                  </div>

                  {/* Related Application */}
                  {applications.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="applicationId">Related Application (Optional)</Label>
                      <Select 
                        value={formData.applicationId} 
                        onValueChange={(value) => handleInputChange('applicationId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an application" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {applications.map((app) => (
                            <SelectItem key={app._id} value={app._id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{app.scholarshipId.title}</span>
                                <span className="text-xs text-gray-500">
                                  {app.status} • {app.progress}% complete
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting || !formData.type || !formData.title}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Add Task
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}