'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Loader2, 
  Plus, 
  Trash2, 
  Calendar,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface SquadGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  squadId: string;
  squadName: string;
  isCreator: boolean;
}

interface Goal {
  _id: string;
  type: string;
  target: number;
  timeframe: string;
  startDate: string;
  endDate: string;
  description?: string;
  individualTarget?: number;
  currentProgress: number;
  progressPercentage: number;
  daysRemaining: number;
  isOnTrack: boolean;
  memberProgress: Array<{
    userId: string;
    progress: number;
    target: number;
    percentage: number;
    lastActivity: string;
    needsHelp: boolean;
    isOnTrack: boolean;
  }>;
}

const goalTypes = [
  { value: 'applications_started', label: 'Applications Started', icon: FileText },
  { value: 'applications_completed', label: 'Applications Completed', icon: CheckCircle },
  { value: 'documents_created', label: 'Documents Created', icon: FileText },
  { value: 'peer_reviews_provided', label: 'Peer Reviews Provided', icon: Users },
  { value: 'days_active', label: 'Days Active', icon: Calendar },
  { value: 'streak_days', label: 'Streak Days', icon: TrendingUp },
  { value: 'squad_activity', label: 'Squad Activity', icon: Users },
];

const timeframes = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'ongoing', label: 'Ongoing' },
];

export default function SquadGoalsModal({ isOpen, onClose, squadId, squadName, isCreator }: SquadGoalsModalProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('goals');
  
  // Add goal form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: '',
    target: 1,
    timeframe: 'weekly',
    startDate: '',
    endDate: '',
    description: '',
    individualTarget: undefined as number | undefined,
  });
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Update progress state
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const [progressValues, setProgressValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      fetchGoals();
    }
  }, [isOpen, squadId]);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/squads/${squadId}/goals`);
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      } else {
        toast.error('Failed to fetch squad goals');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to fetch squad goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.type || !newGoal.target || !newGoal.startDate || !newGoal.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsAddingGoal(true);
    try {
      const response = await fetch(`/api/squads/${squadId}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGoal),
      });

      if (response.ok) {
        toast.success('Goal added successfully!');
        setShowAddForm(false);
        setNewGoal({
          type: '',
          target: 1,
          timeframe: 'weekly',
          startDate: '',
          endDate: '',
          description: '',
          individualTarget: undefined,
        });
        fetchGoals();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add goal');
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal');
    } finally {
      setIsAddingGoal(false);
    }
  };

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    setUpdatingProgress(goalId);
    try {
      const response = await fetch(`/api/squads/${squadId}/goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goalId, progress }),
      });

      if (response.ok) {
        toast.success('Progress updated successfully!');
        fetchGoals();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setUpdatingProgress(null);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const response = await fetch(`/api/squads/${squadId}/goals?goalId=${goalId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Goal deleted successfully!');
        fetchGoals();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const getGoalTypeIcon = (type: string) => {
    const goalType = goalTypes.find(gt => gt.value === type);
    return goalType?.icon || Target;
  };

  const getGoalTypeLabel = (type: string) => {
    const goalType = goalTypes.find(gt => gt.value === type);
    return goalType?.label || type;
  };

  const getTimeframeLabel = (timeframe: string) => {
    const tf = timeframes.find(t => t.value === timeframe);
    return tf?.label || timeframe;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Squad Goals - {squadName}
          </DialogTitle>
          <DialogDescription>
            Manage squad goals and track progress
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            {isCreator && (
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Squad Goals</h3>
                <Button onClick={() => setShowAddForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
            )}

            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goalType">Goal Type</Label>
                      <Select value={newGoal.type} onValueChange={(value) => setNewGoal(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal type" />
                        </SelectTrigger>
                        <SelectContent>
                          {goalTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target">Target</Label>
                      <Input
                        id="target"
                        type="number"
                        min="1"
                        value={newGoal.target}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeframe">Timeframe</Label>
                      <Select value={newGoal.timeframe} onValueChange={(value) => setNewGoal(prev => ({ ...prev, timeframe: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeframes.map((tf) => (
                            <SelectItem key={tf.value} value={tf.value}>
                              {tf.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="individualTarget">Individual Target (Optional)</Label>
                      <Input
                        id="individualTarget"
                        type="number"
                        min="1"
                        value={newGoal.individualTarget || ''}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, individualTarget: e.target.value ? parseInt(e.target.value) : undefined }))}
                        placeholder="Per member target"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newGoal.startDate}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newGoal.endDate}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the goal..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddGoal} disabled={isAddingGoal}>
                      {isAddingGoal ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Goal'
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : goals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Goals Set</h3>
                  <p className="text-gray-600 mb-4">
                    {isCreator 
                      ? 'Create goals to help your squad stay motivated and track progress together.'
                      : 'This squad hasn\'t set any goals yet.'
                    }
                  </p>
                  {isCreator && (
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Goal
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const IconComponent = getGoalTypeIcon(goal.type);
                  return (
                    <Card key={goal._id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5" />
                            <CardTitle className="text-lg">{getGoalTypeLabel(goal.type)}</CardTitle>
                          </div>
                          {isCreator && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            Target: {goal.target}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {getTimeframeLabel(goal.timeframe)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {goal.daysRemaining} days left
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {goal.description && (
                          <p className="text-gray-600 mb-4">{goal.description}</p>
                        )}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{goal.progressPercentage}%</span>
                          </div>
                          <Progress value={goal.progressPercentage} className="h-2" />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{goal.currentProgress} / {goal.target}</span>
                            <Badge variant={goal.isOnTrack ? 'default' : 'destructive'}>
                              {goal.isOnTrack ? 'On Track' : 'Behind'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <h3 className="text-lg font-semibold">Update Your Progress</h3>
            {goals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No goals to track progress for.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const IconComponent = getGoalTypeIcon(goal.type);
                  const userProgress = goal.memberProgress.find(p => p.userId === 'current-user-id'); // You'll need to get the actual user ID
                  const currentProgress = userProgress?.progress || 0;
                  
                  return (
                    <Card key={goal._id}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" />
                          <CardTitle className="text-lg">{getGoalTypeLabel(goal.type)}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Label htmlFor={`progress-${goal._id}`}>Your Progress</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  id={`progress-${goal._id}`}
                                  type="number"
                                  min="0"
                                  max={goal.target}
                                  value={progressValues[goal._id] ?? currentProgress}
                                  onChange={(e) => setProgressValues(prev => ({
                                    ...prev,
                                    [goal._id]: parseInt(e.target.value) || 0
                                  }))}
                                  className="flex-1"
                                />
                                <span className="text-sm text-gray-600">/ {goal.target}</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleUpdateProgress(goal._id, progressValues[goal._id] ?? currentProgress)}
                              disabled={updatingProgress === goal._id}
                              size="sm"
                            >
                              {updatingProgress === goal._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Update'
                              )}
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Your Progress</span>
                              <span>{Math.round((currentProgress / goal.target) * 100)}%</span>
                            </div>
                            <Progress value={(currentProgress / goal.target) * 100} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}