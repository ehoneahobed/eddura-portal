'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ApplicationFormRequest {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  scholarship: {
    title: string;
    provider: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestReason?: string;
  adminNotes?: string;
  requestedAt: string;
  processedAt?: string;
  admin?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  applicationTemplate?: {
    title: string;
    version: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export default function ApplicationFormRequestsPage() {
  const [requests, setRequests] = useState<ApplicationFormRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ApplicationFormRequest | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/application-form-requests?${params}`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !updateStatus) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/application-form-requests/${selectedRequest._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          adminNotes: updateNotes
        })
      });

      if (!response.ok) throw new Error('Failed to update request');

      // Refresh the requests list
      fetchRequests(pagination?.currentPage || 1);
      setUpdateDialogOpen(false);
      setSelectedRequest(null);
      setUpdateStatus('');
      setUpdateNotes('');
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { className: 'bg-gray-100 text-gray-800', icon: Clock, text: 'Pending' },
      approved: { className: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
      rejected: { className: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
      completed: { className: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </div>
    );
  };

  const openUpdateDialog = (request: ApplicationFormRequest) => {
    setSelectedRequest(request);
    setUpdateStatus(request.status);
    setUpdateNotes(request.adminNotes || '');
    setUpdateDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Application Form Requests</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by student name, email, or scholarship..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Requests ({pagination?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No requests found</div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{request.scholarship.title}</h3>
                      <p className="text-sm text-gray-600">{request.scholarship.provider}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{request.user.firstName} {request.user.lastName}</span>
                        <span>•</span>
                        <span>{request.user.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateDialog(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                  
                  {request.requestReason && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Request Reason:</p>
                      <p className="text-sm text-gray-600">{request.requestReason}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Requested: {format(new Date(request.requestedAt), 'MMM dd, yyyy HH:mm')}</span>
                    {request.processedAt && (
                      <span>Processed: {format(new Date(request.processedAt), 'MMM dd, yyyy HH:mm')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={fetchRequests}
        />
      )}

      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Request Status</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Scholarship</h4>
                <p className="text-gray-600">{selectedRequest.scholarship.title}</p>
                <p className="text-sm text-gray-500">{selectedRequest.scholarship.provider}</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Student</h4>
                <p className="text-gray-600">{selectedRequest.user.firstName} {selectedRequest.user.lastName}</p>
                <p className="text-sm text-gray-500">{selectedRequest.user.email}</p>
              </div>
              
              {selectedRequest.requestReason && (
                <div>
                  <h4 className="font-semibold">Request Reason</h4>
                  <p className="text-gray-600">{selectedRequest.requestReason}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <Textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setUpdateDialogOpen(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={updating || !updateStatus}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}