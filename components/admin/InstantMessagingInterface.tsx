"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  MoreHorizontal, 
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
  Paperclip,
  ChevronLeft,
  Phone,
  Video,
  Info,
  Smile,
  Mic
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
  parentMessage?: string;
  threadId?: string;
}

interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Conversation {
  id: string;
  participants: AdminUser[];
  lastMessage: Message;
  unreadCount: number;
  isGroup: boolean;
}

export default function InstantMessagingInterface() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
      fetchAdmins();
    }
  }, [session?.user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/messages?limit=100');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        buildConversations(data.messages);
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

  const buildConversations = (allMessages: Message[]) => {
    const conversationMap = new Map<string, Conversation>();
    
    allMessages.forEach(message => {
      // Create conversation key based on participants
      const participants = [message.sender, ...message.recipients];
      const participantIds = participants
        .map((p: any) => p._id)
        .sort()
        .join('-');
      
      if (!conversationMap.has(participantIds)) {
        conversationMap.set(participantIds, {
          id: participantIds,
          participants: participants.filter((p: any) => p._id !== session?.user?.id) as AdminUser[],
          lastMessage: message,
          unreadCount: 0,
          isGroup: participants.length > 2
        });
      }
      
      const conversation = conversationMap.get(participantIds)!;
      if (message.createdAt > conversation.lastMessage.createdAt) {
        conversation.lastMessage = message;
      }
      
      if (!message.isRead && message.sender._id !== session?.user?.id) {
        conversation.unreadCount++;
      }
    });
    
    setConversations(Array.from(conversationMap.values()));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Validate that if we're replying, we have a valid message to reply to
    if (replyTo && !replyTo._id) {
      alert('Invalid message to reply to. Please try again.');
      setReplyTo(null);
      return;
    }

    try {
      const recipients = selectedConversation.participants.map(p => p._id);
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: "Message",
          content: newMessage,
          recipients: recipients,
          messageType: "general",
          priority: "medium",
          ...(replyTo?._id && { parentMessage: replyTo._id })
        }),
      });

      if (response.ok) {
        setNewMessage("");
        setReplyTo(null);
        fetchMessages();
      } else {
        const errorData = await response.json();
        console.error('Error sending message:', errorData);
        alert(`Failed to send message: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewConversation = () => {
    setShowUserSearch(true);
    setSelectedUsers([]);
  };

  const createConversation = () => {
    if (selectedUsers.length === 0) return;
    
    const participantIds = selectedUsers.map(u => u._id).sort().join('-');
    const newConversation: Conversation = {
      id: participantIds,
      participants: selectedUsers,
      lastMessage: {
        _id: 'temp',
        subject: '',
        content: '',
        messageType: 'general',
        priority: 'medium',
        sender: { _id: '', firstName: '', lastName: '', email: '' },
        recipients: [],
        isRead: false,
        isArchived: false,
        isPinned: false,
        createdAt: new Date().toISOString()
      },
      unreadCount: 0,
      isGroup: selectedUsers.length > 1
    };
    
    setSelectedConversation(newConversation);
    setShowUserSearch(false);
    setSelectedUsers([]);
  };

  const handleOpenConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Mark all unread messages as read
    const unreadMessages = getConversationMessages()
      .filter((m: Message) => !m.isRead && m.sender._id !== session?.user?.id);
    for (const msg of unreadMessages) {
      await fetch(`/api/admin/messages/${msg._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
    }
    fetchMessages(); // Refresh messages and unread count
  };

  const getConversationMessages = () => {
    if (!selectedConversation) return [];
    
    const participantIds = selectedConversation.participants.map(p => p._id);
    participantIds.push(session?.user?.id || '');
    
    return messages.filter(message => {
      const messageParticipants = [message.sender._id, ...message.recipients.map((r: any) => r._id)];
      return participantIds.every((id: string) => messageParticipants.includes(id)) &&
             messageParticipants.every((id: string) => participantIds.includes(id));
    }).sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const filteredConversations = conversations.filter((conv: Conversation) => {
    const searchLower = searchTerm.toLowerCase();
    return conv.participants.some((p: AdminUser) => 
      p.firstName.toLowerCase().includes(searchLower) ||
      p.lastName.toLowerCase().includes(searchLower) ||
      p.email.toLowerCase().includes(searchLower)
    ) || conv.lastMessage.content.toLowerCase().includes(searchLower);
  });

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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Mobile Header - Only show when conversation is selected */}
      {selectedConversation && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversation(null)}
              className="p-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-500 text-white">
                {selectedConversation.isGroup 
                  ? 'G' 
                  : getInitials(selectedConversation.participants[0]?.firstName || '', selectedConversation.participants[0]?.lastName || '')
                }
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {selectedConversation.isGroup 
                  ? `${selectedConversation.participants.map(p => p.firstName).join(', ')}`
                  : `${selectedConversation.participants[0]?.firstName} ${selectedConversation.participants[0]?.lastName}`
                }
              </h2>
              <p className="text-xs text-gray-500">
                {selectedConversation.isGroup 
                  ? `${selectedConversation.participants.length} participants`
                  : selectedConversation.participants[0]?.email
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex justify-center pt-16 bg-gray-50">
        <div className="w-full max-w-5xl flex h-[calc(100vh-4rem)] bg-white rounded-lg shadow border overflow-hidden">
          {/* Conversations List */}
          <div className={`
            hidden lg:flex flex-col w-80 border-r border-gray-200 h-full bg-white
            ${selectedConversation ? '' : 'lg:flex'}
          `}>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                <Button size="sm" onClick={startNewConversation} className="h-10 w-10 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            
            {/* Scrollable Conversations List */}
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="p-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleOpenConversation(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-blue-500 text-white">
                              {conversation.isGroup 
                                ? 'G' 
                                : getInitials(conversation.participants[0]?.firstName || '', conversation.participants[0]?.lastName || '')
                              }
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.isGroup 
                                ? `${conversation.participants.map(p => p.firstName).join(', ')}`
                                : `${conversation.participants[0]?.firstName} ${conversation.participants[0]?.lastName}`
                              }
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.sender._id === session.user?.id ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full bg-gray-50">
            {selectedConversation ? (
              <>
                {/* Desktop Chat Header */}
                <div className="hidden lg:flex bg-white border-b border-gray-200 p-4 items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {selectedConversation.isGroup 
                          ? 'G' 
                          : getInitials(selectedConversation.participants[0]?.firstName || '', selectedConversation.participants[0]?.lastName || '')
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedConversation.isGroup 
                          ? `${selectedConversation.participants.map(p => p.firstName).join(', ')}`
                          : `${selectedConversation.participants[0]?.firstName} ${selectedConversation.participants[0]?.lastName}`
                        }
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.isGroup 
                          ? `${selectedConversation.participants.length} participants`
                          : selectedConversation.participants[0]?.email
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {getConversationMessages().map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender._id === session.user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${message.sender._id === session.user?.id ? 'order-2' : 'order-1'}`}>
                          {message.sender._id !== session.user?.id && (
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-blue-500 text-white text-xs">
                                  {getInitials(message.sender.firstName, message.sender.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">
                                {message.sender.firstName} {message.sender.lastName}
                              </span>
                            </div>
                          )}
                          
                          <div
                               className={`p-3 rounded-lg ${
                                 message.sender._id === session.user?.id
                                   ? 'bg-blue-500 text-white'
                                   : 'bg-gray-100 text-gray-900'
                               }`}
                             >
                             {message.parentMessage && (
                               <div className={`text-xs mb-2 p-2 rounded ${
                                 message.sender._id === session.user?.id
                                   ? 'bg-blue-400 text-white'
                                   : 'bg-gray-200 text-gray-600'
                               }`}>
                                 <Reply className="inline h-3 w-3 mr-1" />
                                 Reply to message
                               </div>
                             )}
                            
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            
                            <div className={`text-xs mt-1 ${
                              message.sender._id === session.user?.id
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                              {message.sender._id === session.user?.id && (
                                <span className="ml-2">
                                  {message.isRead ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className={`flex items-center space-x-1 mt-1 ${message.sender._id === session.user?.id ? 'justify-end' : 'justify-start'}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setReplyTo(message)}
                            >
                              <Reply className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Sticky Chat Input */}
                <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10">
                  {replyTo && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex-1 truncate">
                        Replying to: {replyTo.content.substring(0, 50)}...
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(null)}
                        className="ml-2 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="min-h-[44px] max-h-32 resize-none text-base"
                        rows={1}
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim()}
                      className="h-11 w-11 p-0 flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Welcome screen for desktop
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-4">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Messages</h2>
                  <p className="text-gray-500 mb-6">
                    Select a conversation or start a new one to begin messaging
                  </p>
                  <Button onClick={startNewConversation} className="h-12 px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Search Dialog */}
      <Dialog open={showUserSearch} onOpenChange={setShowUserSearch}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>
              Select users to start a conversation with
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 flex flex-col h-full">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10 h-10"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-2">
                {admins
                  .filter(admin => admin._id !== session.user?.id)
                  .filter(admin => 
                    admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((admin) => (
                    <div
                      key={admin._id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.some(u => u._id === admin._id)
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (selectedUsers.some(u => u._id === admin._id)) {
                          setSelectedUsers(selectedUsers.filter(u => u._id !== admin._id));
                        } else {
                          setSelectedUsers([...selectedUsers, admin]);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-blue-500 text-white">
                            {getInitials(admin.firstName, admin.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </h3>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </div>
                        {selectedUsers.some(u => u._id === admin._id) && (
                          <Check className="h-5 w-5 text-blue-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowUserSearch(false)}>
              Cancel
            </Button>
            <Button onClick={createConversation} disabled={selectedUsers.length === 0}>
              Start Conversation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}