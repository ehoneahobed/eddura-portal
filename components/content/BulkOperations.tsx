'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Checkbox 
} from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Archive, 
  Calendar,
  Tag,
  Users,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  author: string;
  publishDate?: string;
}

interface BulkOperationsProps {
  content: ContentItem[];
  onBulkAction: (action: string, selectedIds: string[], data?: any) => Promise<void>;
  onSelectAll: (selected: boolean) => void;
  onSelectItem: (id: string, selected: boolean) => void;
  selectedItems: string[];
  className?: string;
}

export default function BulkOperations({
  content,
  onBulkAction,
  onSelectAll,
  onSelectItem,
  selectedItems,
  className = ''
}: BulkOperationsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [actionData, setActionData] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedContent = content.filter(item => selectedItems.includes(item.id));
  const allSelected = selectedItems.length === content.length && content.length > 0;
  const someSelected = selectedItems.length > 0 && selectedItems.length < content.length;

  const handleSelectAll = (checked: boolean) => {
    onSelectAll(checked);
  };

  const handleBulkAction = async () => {
    if (!selectedAction || selectedItems.length === 0) {
      toast.error('Please select an action and items');
      return;
    }

    setIsProcessing(true);
    
    try {
      await onBulkAction(selectedAction, selectedItems, actionData);
      setIsDialogOpen(false);
      setSelectedAction('');
      setActionData({});
      toast.success(`Bulk action completed successfully`);
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'publish':
        return <Eye className="w-4 h-4" />;
      case 'unpublish':
        return <EyeOff className="w-4 h-4" />;
      case 'archive':
        return <Archive className="w-4 h-4" />;
      case 'schedule':
        return <Calendar className="w-4 h-4" />;
      case 'add-category':
        return <Tag className="w-4 h-4" />;
      case 'change-author':
        return <Users className="w-4 h-4" />;
      default:
        return <Edit className="w-4 h-4" />;
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'delete':
        return 'Permanently delete selected content';
      case 'publish':
        return 'Make selected content publicly visible';
      case 'unpublish':
        return 'Hide selected content from public view';
      case 'archive':
        return 'Move selected content to archive';
      case 'schedule':
        return 'Schedule selected content for future publication';
      case 'add-category':
        return 'Add category to selected content';
      case 'change-author':
        return 'Change author for selected content';
      default:
        return 'Perform action on selected content';
    }
  };

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'schedule':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="schedule-date">Schedule Date & Time</Label>
              <Input
                id="schedule-date"
                type="datetime-local"
                value={actionData.scheduledDate || ''}
                onChange={(e) => setActionData({ ...actionData, scheduledDate: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        );
      
      case 'add-category':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category Name</Label>
              <Input
                id="category"
                placeholder="Enter category name"
                value={actionData.category || ''}
                onChange={(e) => setActionData({ ...actionData, category: e.target.value })}
              />
            </div>
          </div>
        );
      
      case 'change-author':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="author">New Author</Label>
              <Input
                id="author"
                placeholder="Enter author name"
                value={actionData.author || ''}
                onChange={(e) => setActionData({ ...actionData, author: e.target.value })}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (content.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Bulk Selection Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm font-medium">
                  {allSelected ? 'Deselect All' : someSelected ? 'Some Selected' : 'Select All'}
                </Label>
              </div>
              
              {selectedItems.length > 0 && (
                <Badge variant="secondary">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </Badge>
              )}
            </div>

            {selectedItems.length > 0 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions
                    <Edit className="w-4 h-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Bulk Actions</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="action-select">Select Action</Label>
                      <Select value={selectedAction} onValueChange={setSelectedAction}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="publish">
                            <div className="flex items-center gap-2">
                              {getActionIcon('publish')}
                              Publish
                            </div>
                          </SelectItem>
                          <SelectItem value="unpublish">
                            <div className="flex items-center gap-2">
                              {getActionIcon('unpublish')}
                              Unpublish
                            </div>
                          </SelectItem>
                          <SelectItem value="archive">
                            <div className="flex items-center gap-2">
                              {getActionIcon('archive')}
                              Archive
                            </div>
                          </SelectItem>
                          <SelectItem value="schedule">
                            <div className="flex items-center gap-2">
                              {getActionIcon('schedule')}
                              Schedule
                            </div>
                          </SelectItem>
                          <SelectItem value="add-category">
                            <div className="flex items-center gap-2">
                              {getActionIcon('add-category')}
                              Add Category
                            </div>
                          </SelectItem>
                          <SelectItem value="change-author">
                            <div className="flex items-center gap-2">
                              {getActionIcon('change-author')}
                              Change Author
                            </div>
                          </SelectItem>
                          <SelectItem value="delete">
                            <div className="flex items-center gap-2 text-red-600">
                              {getActionIcon('delete')}
                              Delete
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedAction && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {getActionIcon(selectedAction)}
                          <span className="font-medium capitalize">
                            {selectedAction.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {getActionDescription(selectedAction)}
                        </p>
                      </div>
                    )}

                    {selectedAction === 'delete' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Warning</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">
                          This action cannot be undone. Selected content will be permanently deleted.
                        </p>
                      </div>
                    )}

                    {renderActionForm()}

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleBulkAction}
                        disabled={isProcessing || !selectedAction}
                        className="flex-1"
                      >
                        {isProcessing ? 'Processing...' : 'Apply Action'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setSelectedAction('');
                          setActionData({});
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Items Preview */}
      {selectedItems.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Selected Items ({selectedItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedContent.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                        {item.status}
                      </Badge>
                      <span>{item.author}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectItem(item.id, false)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 