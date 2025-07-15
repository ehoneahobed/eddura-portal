'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { format, addMinutes, isAfter, isBefore } from 'date-fns';

interface ContentSchedulerProps {
  scheduledDate?: string;
  publishDate?: string;
  status: string;
  onScheduleChange: (scheduledDate: string | undefined) => void;
  onPublishDateChange: (publishDate: string | undefined) => void;
  onStatusChange: (status: string) => void;
}

export default function ContentScheduler({
  scheduledDate,
  publishDate,
  status,
  onScheduleChange,
  onPublishDateChange,
  onStatusChange
}: ContentSchedulerProps) {
  const [isScheduled, setIsScheduled] = useState(!!scheduledDate);
  const [scheduleDateTime, setScheduleDateTime] = useState(
    scheduledDate ? format(new Date(scheduledDate), "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [publishDateTime, setPublishDateTime] = useState(
    publishDate ? format(new Date(publishDate), "yyyy-MM-dd'T'HH:mm") : ''
  );

  const now = new Date();
  const scheduledDateObj = scheduledDate ? new Date(scheduledDate) : null;
  const publishDateObj = publishDate ? new Date(publishDate) : null;

  const isScheduledInPast = scheduledDateObj && isBefore(scheduledDateObj, now);
  const isPublishInPast = publishDateObj && isBefore(publishDateObj, now);
  const isScheduledInFuture = scheduledDateObj && isAfter(scheduledDateObj, now);

  useEffect(() => {
    if (isScheduled) {
      if (scheduleDateTime) {
        onScheduleChange(scheduleDateTime);
        // Auto-set status to draft when scheduling
        if (status === 'published') {
          onStatusChange('draft');
        }
      }
    } else {
      onScheduleChange(undefined);
    }
  }, [isScheduled, scheduleDateTime, onScheduleChange, onStatusChange, status]);

  useEffect(() => {
    if (publishDateTime) {
      onPublishDateChange(publishDateTime);
    } else {
      onPublishDateChange(undefined);
    }
  }, [publishDateTime, onPublishDateChange]);

  const handleScheduleToggle = (checked: boolean) => {
    setIsScheduled(checked);
    if (!checked) {
      setScheduleDateTime('');
    }
  };

  const getStatusMessage = () => {
    if (isScheduledInPast) {
      return {
        type: 'error',
        message: 'Scheduled date is in the past. Content will not be published automatically.',
        icon: <AlertCircle className="w-4 h-4 text-red-500" />
      };
    }
    if (isScheduledInFuture) {
      return {
        type: 'success',
        message: `Content will be published on ${format(scheduledDateObj!, 'PPP p')}`,
        icon: <CheckCircle className="w-4 h-4 text-green-500" />
      };
    }
    if (isPublishInPast) {
      return {
        type: 'warning',
        message: 'Publish date is in the past. Consider updating the date.',
        icon: <AlertCircle className="w-4 h-4 text-yellow-500" />
      };
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Content Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Schedule Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="schedule-toggle"
            checked={isScheduled}
            onCheckedChange={handleScheduleToggle}
          />
          <Label htmlFor="schedule-toggle">Schedule for future publication</Label>
        </div>

        {/* Scheduled Date/Time */}
        {isScheduled && (
          <div className="space-y-2">
            <Label htmlFor="schedule-datetime">Scheduled Date & Time</Label>
            <Input
              id="schedule-datetime"
              type="datetime-local"
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
              min={format(now, "yyyy-MM-dd'T'HH:mm")}
            />
            <p className="text-sm text-gray-500">
              Content will be automatically published at this time
            </p>
          </div>
        )}

        {/* Publish Date/Time */}
        <div className="space-y-2">
          <Label htmlFor="publish-datetime">Publish Date & Time</Label>
          <Input
            id="publish-datetime"
            type="datetime-local"
            value={publishDateTime}
            onChange={(e) => setPublishDateTime(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            This date will be displayed as the publication date
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            statusMessage.type === 'error' ? 'bg-red-50 border border-red-200' :
            statusMessage.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            {statusMessage.icon}
            <span className={`text-sm ${
              statusMessage.type === 'error' ? 'text-red-700' :
              statusMessage.type === 'warning' ? 'text-yellow-700' :
              'text-green-700'
            }`}>
              {statusMessage.message}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const in15Minutes = format(addMinutes(now, 15), "yyyy-MM-dd'T'HH:mm");
              setScheduleDateTime(in15Minutes);
              setIsScheduled(true);
            }}
          >
            <Clock className="w-4 h-4 mr-1" />
            In 15 minutes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const tomorrow = format(addMinutes(now, 24 * 60), "yyyy-MM-dd'T'HH:mm");
              setScheduleDateTime(tomorrow);
              setIsScheduled(true);
            }}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Tomorrow
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setScheduleDateTime('');
              setIsScheduled(false);
              setPublishDateTime('');
            }}
          >
            Clear
          </Button>
        </div>

        {/* Scheduling Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Scheduled content will be automatically published at the specified time</p>
          <p>• Content status will be set to &quot;draft&quot; when scheduled</p>
          <p>• You can manually publish content before the scheduled time</p>
          <p>• Publish date is used for display purposes and SEO</p>
        </div>
      </CardContent>
    </Card>
  );
} 