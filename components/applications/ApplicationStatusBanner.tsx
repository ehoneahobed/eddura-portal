'use client';

import { Calendar, Clock, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getScholarshipStatus } from '@/lib/scholarship-status';

interface ApplicationStatusBannerProps {
  scholarship: {
    title: string;
    deadline: string;
    openingDate?: string;
    value?: number | string;
    currency?: string;
  };
}

export default function ApplicationStatusBanner({ scholarship }: ApplicationStatusBannerProps) {
  const status = getScholarshipStatus(scholarship.deadline, scholarship.openingDate);
  
  const formatCurrency = (value: number | string, currency: string = 'USD') => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Scholarship Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{scholarship.title}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {scholarship.value && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Value:</span>
                  <span className="text-green-700 font-semibold">
                    {formatCurrency(scholarship.value, scholarship.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Information */}
          <div className="flex flex-col gap-2">
            {/* Opening Date Status */}
            {scholarship.openingDate && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${status.openingDateInfo.color}`}>
                <status.openingDateInfo.icon className="h-4 w-4" />
                <span>{status.openingDateInfo.status}</span>
              </div>
            )}

            {/* Deadline Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${status.deadlineInfo.color}`}>
              <status.deadlineInfo.icon className="h-4 w-4" />
              <span>{status.deadlineInfo.status}</span>
            </div>

            {/* Important Notice */}
            {status.isNotYetOpen && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">Application Period Not Yet Open</p>
                    <p className="text-yellow-700">
                      You can start your application now, but it won't be reviewed until the application period opens.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status.isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800 mb-1">Application Deadline Passed</p>
                    <p className="text-red-700">
                      The application deadline has passed. You can still view your application but cannot submit it.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!status.isNotYetOpen && !status.isExpired && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800 mb-1">Application Period Active</p>
                    <p className="text-green-700">
                      Applications are currently being accepted. Complete and submit your application before the deadline.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}