'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Clock,
  CheckCircle,
  GraduationCap,
  BookOpen,
  Award,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Application {
  _id: string;
  applicationType: 'school' | 'program' | 'scholarship';
  title: string;
  status: string;
  applicationDeadline: string;
  earlyDecisionDeadline?: string;
  regularDecisionDeadline?: string;
  rollingDeadline?: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  // Related data
  scholarshipId?: {
    _id: string;
    title: string;
    value?: number;
    currency?: string;
  };
  schoolId?: {
    _id: string;
    name: string;
    country: string;
    city: string;
  };
  programId?: {
    _id: string;
    title: string;
    school: string;
    degree: string;
  };
}

interface DeadlineCalendarProps {
  applications: Application[];
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  deadlines: Array<{
    application: Application;
    type: 'application' | 'early_decision' | 'regular_decision';
    deadline: string;
  }>;
}

export default function DeadlineCalendar({ applications }: DeadlineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getTypeInfo = (type: 'school' | 'program' | 'scholarship') => {
    switch (type) {
      case 'school':
        return { color: 'bg-blue-100 text-blue-800', icon: GraduationCap, label: 'School' };
      case 'program':
        return { color: 'bg-purple-100 text-purple-800', icon: BookOpen, label: 'Program' };
      case 'scholarship':
        return { color: 'bg-green-100 text-green-800', icon: Award, label: 'Scholarship' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Calendar, label: 'Unknown' };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Urgent' };
      case 'high':
        return { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'High' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Medium' };
      case 'low':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Low' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Unknown' };
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 0) {
      return { status: 'overdue', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    } else if (daysUntilDeadline <= 7) {
      return { status: 'urgent', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    } else if (daysUntilDeadline <= 30) {
      return { status: 'soon', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    } else {
      return { status: 'ok', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDateObj = new Date(startDate);
    
    while (currentDateObj <= endDate) {
      const dayDeadlines: Array<{
        application: Application;
        type: 'application' | 'early_decision' | 'regular_decision';
        deadline: string;
      }> = [];
      
      // Check for deadlines on this day
      applications.forEach(app => {
        const appDate = new Date(app.applicationDeadline);
        if (appDate.toDateString() === currentDateObj.toDateString()) {
          dayDeadlines.push({
            application: app,
            type: 'application',
            deadline: app.applicationDeadline
          });
        }
        
        if (app.earlyDecisionDeadline) {
          const earlyDate = new Date(app.earlyDecisionDeadline);
          if (earlyDate.toDateString() === currentDateObj.toDateString()) {
            dayDeadlines.push({
              application: app,
              type: 'early_decision',
              deadline: app.earlyDecisionDeadline
            });
          }
        }
        
        if (app.regularDecisionDeadline) {
          const regularDate = new Date(app.regularDecisionDeadline);
          if (regularDate.toDateString() === currentDateObj.toDateString()) {
            dayDeadlines.push({
              application: app,
              type: 'regular_decision',
              deadline: app.regularDecisionDeadline
            });
          }
        }
      });
      
      days.push({
        date: new Date(currentDateObj),
        day: currentDateObj.getDate(),
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: currentDateObj.toDateString() === new Date().toDateString(),
        deadlines: dayDeadlines
      });
      
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return days;
  }, [currentDate, applications]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDeadlineTypeLabel = (type: string) => {
    switch (type) {
      case 'application':
        return 'Application';
      case 'early_decision':
        return 'Early Decision';
      case 'regular_decision':
        return 'Regular Decision';
      default:
        return 'Deadline';
    }
  };

  const selectedDateDeadlines = selectedDate 
    ? calendarDays.find(day => day.date.toDateString() === selectedDate.toDateString())?.deadlines || []
    : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value: 'month' | 'week') => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-white p-3 text-center">
                <span className="text-sm font-medium text-gray-900">{day}</span>
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {calendarDays.map((day, index) => {
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
              
              return (
                <motion.div
                  key={index}
                  className={`bg-white min-h-[120px] p-2 cursor-pointer transition-colors ${
                    day.isToday ? 'bg-blue-50' : ''
                  } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
                    !day.isCurrentMonth ? 'text-gray-400' : ''
                  }`}
                  onClick={() => setSelectedDate(day.date)}
                  whileHover={{ backgroundColor: day.isCurrentMonth ? '#f8fafc' : '#f1f5f9' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      day.isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                    }`}>
                      {day.day}
                    </span>
                    {day.deadlines.length > 0 && (
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        {day.deadlines.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Deadlines */}
                  <div className="space-y-1">
                    {day.deadlines.slice(0, 2).map((deadline, idx) => {
                      const typeInfo = getTypeInfo(deadline.application.applicationType);
                      const deadlineStatus = getDeadlineStatus(deadline.deadline);
                      const TypeIcon = typeInfo.icon;
                      
                      return (
                        <div
                          key={idx}
                          className={`text-xs p-1 rounded border ${deadlineStatus.borderColor} ${deadlineStatus.bgColor}`}
                        >
                          <div className="flex items-center gap-1">
                            <TypeIcon className="w-3 h-3" />
                            <span className={`font-medium ${deadlineStatus.color}`}>
                              {getDeadlineTypeLabel(deadline.type)}
                            </span>
                          </div>
                          <div className="truncate text-gray-700">
                            {deadline.application.title}
                          </div>
                        </div>
                      );
                    })}
                    
                    {day.deadlines.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{day.deadlines.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
            <CardDescription>
              {selectedDateDeadlines.length} deadline{selectedDateDeadlines.length !== 1 ? 's' : ''} on this date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateDeadlines.length > 0 ? (
              <div className="space-y-4">
                {selectedDateDeadlines.map((deadline, index) => {
                  const typeInfo = getTypeInfo(deadline.application.applicationType);
                  const priorityInfo = getPriorityInfo(deadline.application.priority);
                  const deadlineStatus = getDeadlineStatus(deadline.deadline);
                  const TypeIcon = typeInfo.icon;
                  const PriorityIcon = priorityInfo.icon;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${deadlineStatus.borderColor} ${deadlineStatus.bgColor}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-5 h-5" />
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                          <Badge className={priorityInfo.color}>
                            <PriorityIcon className="w-3 h-3 mr-1" />
                            {priorityInfo.label}
                          </Badge>
                        </div>
                        <Badge className={`${deadlineStatus.bgColor} ${deadlineStatus.color}`}>
                          {getDeadlineTypeLabel(deadline.type)}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {deadline.application.title}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        {deadline.application.schoolId && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{deadline.application.schoolId.name}</span>
                            <span>•</span>
                            <span>{deadline.application.schoolId.city}, {deadline.application.schoolId.country}</span>
                          </div>
                        )}
                        
                        {deadline.application.programId && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{deadline.application.programId.title}</span>
                            <span>•</span>
                            <span>{deadline.application.programId.degree}</span>
                          </div>
                        )}
                        
                        {deadline.application.scholarshipId && deadline.application.scholarshipId.value && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatCurrency(deadline.application.scholarshipId.value, deadline.application.scholarshipId.currency)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Deadline:</span>
                          <span className={`font-medium ${deadlineStatus.color}`}>
                            {formatDate(deadline.deadline)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No deadlines on this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}