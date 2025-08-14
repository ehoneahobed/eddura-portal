'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { usePageTranslation } from '@/hooks/useTranslation';

interface RecommendationRequest {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'sent' | 'received' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  recipientId: {
    name: string;
    emails: string[];
    primaryEmail: string;
    title: string;
    institution: string;
    department?: string;
    prefersDrafts: boolean;
  };
  createdAt: string;
  sentAt?: string;
  receivedAt?: string;
}

export default function RecommendationsPage() {
  const [requests, setRequests] = useState<RecommendationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = usePageTranslation('recommendationsPage');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/recommendations/requests');
      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
        </div>
        <Link href="/recommendations/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('actions.newRequest')}
          </Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Clock className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">{t('empty.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('empty.description')}</p>
            </div>
            <Link href="/recommendations/new">
              <Button>{t('empty.createFirst')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {request.recipientId?.name || t('labels.unknownRecipient')} • {request.recipientId?.institution || t('labels.unknownInstitution')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <Badge className={getStatusColor(request.status)}>
                      {t(`status.${request.status}`)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
                    {request.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {t(`priority.${request.priority}`)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(request.deadline), t('dateFormat'))}
                    </div>
                  </div>

                  {request.status !== 'received' && request.status !== 'cancelled' && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getDaysUntilDeadline(request.deadline) > 0 ? (
                        <span className="text-yellow-600">
                          {t('deadline.daysRemaining', { count: getDaysUntilDeadline(request.deadline) })}
                        </span>
                      ) : (
                        <span className="text-red-600">
                          {t('deadline.daysOverdue', { count: Math.abs(getDaysUntilDeadline(request.deadline)) })}
                        </span>
                      )}
                    </div>
                  )}

                  {request.status === 'received' && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {t('deadline.receivedOn', { date: format(new Date(request.receivedAt!), t('dateFormat')) })}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link href={`/recommendations/${request._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        {t('actions.viewDetails')}
                      </Button>
                    </Link>
                    {request.status === 'pending' && (
                      <Link href={`/recommendations/${request._id}/edit`} className="flex-1">
                        <Button size="sm" className="w-full text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                          {t('actions.edit')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}