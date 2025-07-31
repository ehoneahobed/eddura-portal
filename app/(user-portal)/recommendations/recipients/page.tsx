'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  User,
  Filter,
  MoreHorizontal,
  Copy,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AddRecipientModal from '@/components/recommendations/AddRecipientModal';
import EditRecipientModal from '@/components/recommendations/EditRecipientModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  createdAt: string;
  updatedAt: string;
}

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('all');
  const [filterPreference, setFilterPreference] = useState('all');
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [deletingRecipient, setDeletingRecipient] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      const response = await fetch('/api/recommendations/recipients');
      const data = await response.json();
      if (response.ok) {
        setRecipients(data.recipients);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast.error('Failed to fetch recipients');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientAdded = (newRecipient: Recipient) => {
    setRecipients(prev => [newRecipient, ...prev]);
    toast.success('Recipient added successfully!');
  };

  const handleRecipientUpdated = (updatedRecipient: Recipient) => {
    setRecipients(prev => 
      prev.map(r => r._id === updatedRecipient._id ? updatedRecipient : r)
    );
    setEditingRecipient(null);
    toast.success('Recipient updated successfully!');
  };

  const handleDeleteRecipient = async (recipientId: string) => {
    if (!confirm('Are you sure you want to delete this recipient? This action cannot be undone.')) {
      return;
    }

    setDeletingRecipient(recipientId);
    try {
      const response = await fetch(`/api/recommendations/recipients/${recipientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecipients(prev => prev.filter(r => r._id !== recipientId));
        toast.success('Recipient deleted successfully!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete recipient');
      }
    } catch (error) {
      console.error('Error deleting recipient:', error);
      toast.error('Failed to delete recipient');
    } finally {
      setDeletingRecipient(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const filteredRecipients = recipients.filter(recipient => {
    const matchesSearch = 
      recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.emails.some(email => email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      recipient.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recipient.department && recipient.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesInstitution = filterInstitution === 'all' || recipient.institution === filterInstitution;
    const matchesPreference = filterPreference === 'all' || 
      (filterPreference === 'drafts' && recipient.prefersDrafts) ||
      (filterPreference === 'no-drafts' && !recipient.prefersDrafts);

    return matchesSearch && matchesInstitution && matchesPreference;
  });

  const institutions = Array.from(new Set(recipients.map(r => r.institution))).sort();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipients</h1>
          <p className="text-gray-600 mt-2">
            Manage your professors, supervisors, and managers who can write recommendation letters
          </p>
        </div>
        <AddRecipientModal 
          onRecipientAdded={handleRecipientAdded}
          trigger={
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Recipient
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, institution..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Institution</label>
              <Select value={filterInstitution} onValueChange={setFilterInstitution}>
                <SelectTrigger>
                  <SelectValue placeholder="All institutions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All institutions</SelectItem>
                  {institutions.map((institution) => (
                    <SelectItem key={institution} value={institution}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Draft Preference</label>
              <Select value={filterPreference} onValueChange={setFilterPreference}>
                <SelectTrigger>
                  <SelectValue placeholder="All preferences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All preferences</SelectItem>
                  <SelectItem value="drafts">Prefers drafts</SelectItem>
                  <SelectItem value="no-drafts">No drafts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients Grid */}
      {filteredRecipients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <User className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {recipients.length === 0 ? 'No recipients yet' : 'No recipients match your filters'}
              </h3>
              <p className="text-sm">
                {recipients.length === 0 
                  ? 'Start by adding your first recipient'
                  : 'Try adjusting your search or filters'
                }
              </p>
            </div>
            {recipients.length === 0 && (
              <AddRecipientModal 
                onRecipientAdded={handleRecipientAdded}
                trigger={<Button>Add First Recipient</Button>}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipients.map((recipient) => (
            <Card key={recipient._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{recipient.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {recipient.title}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingRecipient(recipient)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => copyToClipboard(recipient.primaryEmail)}>
                         <Copy className="h-4 w-4 mr-2" />
                         Copy Primary Email
                       </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteRecipient(recipient._id)}
                        className="text-red-600"
                        disabled={deletingRecipient === recipient._id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingRecipient === recipient._id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 font-medium">{recipient.primaryEmail}</span>
                      <Badge variant="outline" className="text-xs">Primary</Badge>
                    </div>
                    {recipient.emails.length > 1 && (
                      <div className="ml-6 space-y-1">
                        {recipient.emails.slice(1).map((email, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{recipient.institution}</span>
                  </div>

                  {recipient.department && (
                    <div className="text-sm text-gray-600">
                      {recipient.department}
                    </div>
                  )}

                  {recipient.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{recipient.phoneNumber}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant={recipient.prefersDrafts ? 'default' : 'secondary'}>
                      {recipient.prefersDrafts ? 'Prefers Drafts' : 'No Drafts'}
                    </Badge>
                    <Badge variant="outline">
                      {recipient.preferredCommunicationMethod}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-500">
                    Added {format(new Date(recipient.createdAt), 'MMM dd, yyyy')}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setEditingRecipient(recipient)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(recipient.primaryEmail)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {recipients.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recipients Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{recipients.length}</div>
                <div className="text-sm text-gray-600">Total Recipients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {recipients.filter(r => r.prefersDrafts).length}
                </div>
                <div className="text-sm text-gray-600">Prefer Drafts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {institutions.length}
                </div>
                <div className="text-sm text-gray-600">Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {recipients.filter(r => r.phoneNumber).length}
                </div>
                <div className="text-sm text-gray-600">Have Phone</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {editingRecipient && (
        <EditRecipientModal
          recipient={editingRecipient}
          onRecipientUpdated={handleRecipientUpdated}
          onCancel={() => setEditingRecipient(null)}
        />
      )}
    </div>
  );
} 