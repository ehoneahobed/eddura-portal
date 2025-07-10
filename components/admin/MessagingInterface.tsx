"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MessageCircle, 
  Send, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Archive,
  Pin,
  Reply,
  Forward,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Check,
  Clock,
  User,
  Tag,
  Paperclip
} from "lucide-react";

interface Message {
  _id: string;
  subject: string;
  content: string;
  messageType: 'general' | 'urgent' | 'announcement' | 'task' | 'notification';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipients: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  ccRecipients?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  isRead: boolean;
  isArchived: boolean;
  isPinned: boolean;
  category?: string;
  tags?: string[];
  createdAt: string;
  readAt?: string;
}

interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function MessagingInterface() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Compose message state
  const [composeForm, setComposeForm] = useState({
    subject: "",
    content: "",
    recipients: [] as string[],
    ccRecipients: [] as string[],
    messageType: "general" as const,
    priority: "medium" as const,
    category: "",
    tags: [] as string[]
  });

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
      fetchAdmins();
    }
  }, [session?.user, currentPage, typeFilter, priorityFilter, statusFilter]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        type: typeFilter,
        priority: priorityFilter,
        isRead: statusFilter === "unread" ? "false" : statusFilter === "read" ? "true" : "",
        isArchived: statusFilter === "archived" ? "true" : "false"
      });

      const response = await fetch(`/api/admin/messages?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(composeForm),
      });

      if (response.ok) {
        setIsComposing(false);
        setComposeForm({
          subject: "",
          content: "",
          recipients: [],
          ccRecipients: [],
          messageType: "general",
          priority: "medium",
          category: "",
          tags: []
        });
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: true }),
      });
      fetchMessages();
    } catch (error) {
      console.error('Error archiving message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      });
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return '🚨';
      case 'announcement': return '📢';
      case 'task': return '📋';
      case 'notification': return '🔔';
      default: return '💬';
    }
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading messaging interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internal Messaging</h1>
          <p className="text-gray-600">
            Communicate with your admin team members
          </p>
        </div>
        <Button onClick={() => setIsComposing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Compose Message
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter(m => !m.isRead).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter(m => m.isRead).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Archive className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter(m => m.isArchived).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Manage your internal communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message._id} className={!message.isRead ? 'bg-blue-50' : ''}>
                    <TableCell>
                      <span className="text-lg">{getTypeIcon(message.messageType)}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {message.subject}
                          {message.isPinned && <Pin className="inline h-3 w-3 ml-1 text-yellow-500" />}
                        </div>
                        <div className="text-sm text-gray-500">
                          {message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {message.sender.firstName} {message.sender.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{message.sender.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(message.priority)}>
                        {message.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {message.isRead ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">
                          {message.isRead ? 'Read' : 'Unread'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(message.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedMessage(message)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Forward className="h-4 w-4 mr-2" />
                            Forward
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!message.isRead && (
                            <DropdownMenuItem onClick={() => handleMarkAsRead(message._id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleArchiveMessage(message._id)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteMessage(message._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredMessages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-500">
                {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by composing your first message.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compose Message Dialog */}
      <Dialog open={isComposing} onOpenChange={setIsComposing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>
              Send a message to your admin team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Message Type</label>
                <Select 
                  value={composeForm.messageType} 
                  onValueChange={(value) => setComposeForm({...composeForm, messageType: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select 
                  value={composeForm.priority} 
                  onValueChange={(value) => setComposeForm({...composeForm, priority: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={composeForm.subject}
                onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})}
                placeholder="Enter message subject"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Recipients</label>
              <Select 
                onValueChange={(value) => {
                  if (!composeForm.recipients.includes(value)) {
                    setComposeForm({
                      ...composeForm, 
                      recipients: [...composeForm.recipients, value]
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  {admins.map((admin) => (
                    <SelectItem key={admin._id} value={admin._id}>
                      {admin.firstName} {admin.lastName} ({admin.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {composeForm.recipients.map((recipientId) => {
                  const admin = admins.find(a => a._id === recipientId);
                  return admin ? (
                    <Badge key={recipientId} variant="secondary">
                      {admin.firstName} {admin.lastName}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setComposeForm({
                          ...composeForm,
                          recipients: composeForm.recipients.filter(r => r !== recipientId)
                        })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Message Content</label>
              <Textarea
                value={composeForm.content}
                onChange={(e) => setComposeForm({...composeForm, content: e.target.value})}
                placeholder="Enter your message..."
                rows={6}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category (Optional)</label>
              <Input
                value={composeForm.category}
                onChange={(e) => setComposeForm({...composeForm, category: e.target.value})}
                placeholder="e.g., System Updates, Team Meeting, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!composeForm.subject || !composeForm.content || composeForm.recipients.length === 0}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.sender.firstName} {selectedMessage?.sender.lastName} ({selectedMessage?.sender.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Badge variant={getPriorityColor(selectedMessage?.priority || 'medium')}>
                {selectedMessage?.priority}
              </Badge>
              <Badge variant="outline">
                {selectedMessage?.messageType}
              </Badge>
              {selectedMessage?.category && (
                <Badge variant="secondary">
                  {selectedMessage.category}
                </Badge>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
            </div>

            {selectedMessage?.tags && selectedMessage.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedMessage.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              Sent: {selectedMessage ? formatDate(selectedMessage.createdAt) : ''}
              {selectedMessage?.readAt && (
                <span className="block">
                  Read: {formatDate(selectedMessage.readAt)}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              Close
            </Button>
            <Button>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}