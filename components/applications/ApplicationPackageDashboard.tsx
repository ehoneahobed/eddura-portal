'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Pause,
  Calendar,
  Award,
  Filter,
  Search,
  Plus,
  Loader2,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
  Building,
  ExternalLink,
  Target,
  BookOpen,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserInterest {
  _id: string;
  status: 'interested' | 'preparing' | 'applied' | 'interviewed' | 'accepted' | 'rejected' | 'waitlisted';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  requiresInterview?: boolean;
  interviewScheduled?: boolean;
  interviewDate?: Date;
  interviewType?: 'in-person' | 'virtual' | 'phone';
  appliedAt?: Date;
  decisionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Target information
  programId?: {
    _id: string;
    name: string;
    degreeType: string;
    fieldOfStudy: string;
    schoolId?: {
      _id: string;
      name: string;
      country: string;
      city: string;
    };
    applicationRequirements?: {
      documents: string[];
      deadlines: string[];
    };
  };
  schoolId?: {
    _id: string;
    name: string;
    country: string;
    city: string;
  };
  schoolName?: string;
  programName?: string;
  applicationUrl?: string;
}

interface ApplicationPackage {
  _id: string;
  name: string;
  type: 'program' | 'scholarship' | 'combined';
  progress: number;
  isReady: boolean;
  applicationStatus: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'interview_scheduled' | 'decision_made';
  decision?: 'accepted' | 'rejected' | 'waitlisted';
  appliedAt?: Date;
  decisionDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  documents: {
    type: string;
    name: string;
    required: boolean;
    status: 'pending' | 'uploaded' | 'reviewed' | 'approved';
  }[];
  
  linkedScholarships: {
    scholarshipId: string;
    scholarshipName: string;
    status: 'interested' | 'applied' | 'awarded' | 'rejected';
  }[];
  
  interestId: UserInterest;
}

export default function ApplicationPackageDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [packages, setPackages] = useState<ApplicationPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch interests and packages in parallel
      const [interestsResponse, packagesResponse] = await Promise.all([
        fetch('/api/user-interests'),
        fetch('/api/application-packages')
      ]);

      if (interestsResponse.ok) {
        const interestsData = await interestsResponse.json();
        setInterests(interestsData.interests || []);
      }

      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setPackages(packagesData.packages || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch application data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'interested':
        return { color: 'bg-blue-100 text-blue-800', icon: Target, label: 'Interested' };
      case 'preparing':
        return { color: 'bg-yellow-100 text-yellow-800', icon: BookOpen, label: 'Preparing' };
      case 'applied':
        return { color: 'bg-purple-100 text-purple-800', icon: FileText, label: 'Applied' };
      case 'interviewed':
        return { color: 'bg-indigo-100 text-indigo-800', icon: Users, label: 'Interviewed' };
      case 'accepted':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Rejected' };
      case 'waitlisted':
        return { color: 'bg-orange-100 text-orange-800', icon: Pause, label: 'Waitlisted' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Target, label: 'Unknown' };
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

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTargetName = (interest: UserInterest) => {
    if (interest.programId) {
      return `${interest.programId.name} - ${interest.programId.schoolId?.name || 'Unknown School'}`;
    } else if (interest.schoolId) {
      return interest.schoolId.name;
    } else if (interest.schoolName && interest.programName) {
      return `${interest.programName} - ${interest.schoolName}`;
    } else if (interest.schoolName) {
      return interest.schoolName;
    } else if (interest.programName) {
      return interest.programName;
    }
    return 'Unknown Target';
  };

  const getTargetIcon = (interest: UserInterest) => {
    if (interest.programId) {
      return GraduationCap;
    } else if (interest.schoolId || interest.schoolName) {
      return Building;
    }
    return Target;
  };

  const handleCreateInterest = () => {
    router.push('/applications/create-interest');
  };

  const handleViewInterest = (interestId: string) => {
    router.push(`/applications/interests/${interestId}`);
  };

  const handleViewPackage = (packageId: string) => {
    router.push(`/applications/packages/${packageId}`);
  };

  const handleCreatePackage = (interestId: string) => {
    router.push(`/applications/packages/create?interestId=${interestId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Applications</h2>
          <p className="text-gray-600">Getting your application data...</p>
        </div>
      </div>
    );
  }

  const readyPackages = packages.filter(pkg => pkg.isReady);
  const inProgressPackages = packages.filter(pkg => !pkg.isReady && pkg.applicationStatus !== 'not_started');
  const completedPackages = packages.filter(pkg => pkg.applicationStatus === 'decision_made');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your program interests and application packages
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleCreateInterest}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Interest
          </Button>
          <Button 
            onClick={() => router.push('/programs')}
            variant="outline"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Browse Programs
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interests</p>
                <p className="text-2xl font-bold text-gray-900">{interests.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Apply</p>
                <p className="text-2xl font-bold text-green-600">{readyPackages.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{inProgressPackages.length}</p>
              </div>
              <Play className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{completedPackages.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interests">My Interests</TabsTrigger>
          <TabsTrigger value="packages">Application Packages</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recent Interests
                </CardTitle>
                <CardDescription>
                  Your latest program and school interests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {interests.slice(0, 5).map((interest) => {
                  const statusInfo = getStatusInfo(interest.status);
                  const StatusIcon = statusInfo.icon;
                  const TargetIcon = getTargetIcon(interest);
                  
                  return (
                    <div key={interest._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <TargetIcon className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{getTargetName(interest)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={statusInfo.color} variant="secondary">
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Badge className={getPriorityColor(interest.priority)} variant="secondary">
                              {interest.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInterest(interest._id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
                {interests.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No interests yet</p>
                    <Button 
                      onClick={handleCreateInterest}
                      variant="link"
                      className="mt-2"
                    >
                      Add your first interest
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Packages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Application Packages
                </CardTitle>
                <CardDescription>
                  Your application packages and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {packages.slice(0, 5).map((pkg) => (
                  <div key={pkg._id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{pkg.name}</h4>
                      <Badge className={pkg.isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {pkg.isReady ? 'Ready' : `${pkg.progress}%`}
                      </Badge>
                    </div>
                    <Progress value={pkg.progress} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{pkg.documents.filter(d => d.required).length} required documents</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPackage(pkg._id)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {packages.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No application packages yet</p>
                    <p className="text-sm">Create an interest first to build application packages</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interests Tab */}
        <TabsContent value="interests" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search interests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interviewed">Interviewed</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interests List */}
          <div className="space-y-4">
            {interests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No interests found</h3>
                  <p className="text-gray-600 mb-4">
                    Start by adding programs or schools you're interested in.
                  </p>
                  <Button 
                    onClick={handleCreateInterest}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Interest
                  </Button>
                </CardContent>
              </Card>
            ) : (
              interests.map((interest) => {
                const statusInfo = getStatusInfo(interest.status);
                const StatusIcon = statusInfo.icon;
                const TargetIcon = getTargetIcon(interest);
                
                return (
                  <motion.div
                    key={interest._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Left side - Interest info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <TargetIcon className="w-5 h-5 text-blue-600" />
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {getTargetName(interest)}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Added: {formatDate(interest.createdAt)}
                                  </span>
                                  {interest.appliedAt && (
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-4 h-4" />
                                      Applied: {formatDate(interest.appliedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Badge className={statusInfo.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusInfo.label}
                                </Badge>
                                <Badge className={getPriorityColor(interest.priority)}>
                                  {interest.priority} priority
                                </Badge>
                              </div>
                            </div>
                            
                            {interest.notes && (
                              <p className="text-sm text-gray-600">{interest.notes}</p>
                            )}
                            
                            {interest.requiresInterview && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>Interview required</span>
                                {interest.interviewScheduled && (
                                  <Badge variant="outline" className="text-xs">
                                    Scheduled
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Right side - Actions */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                              onClick={() => handleViewInterest(interest._id)}
                              variant="outline"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            {!packages.find(pkg => pkg.interestId._id === interest._id) && (
                              <Button 
                                onClick={() => handleCreatePackage(interest._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Package
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search packages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="decision_made">Decision Made</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packages List */}
          <div className="space-y-4">
            {packages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No application packages found</h3>
                  <p className="text-gray-600 mb-4">
                    Create an interest first to build application packages.
                  </p>
                  <Button 
                    onClick={handleCreateInterest}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Interest
                  </Button>
                </CardContent>
              </Card>
            ) : (
              packages.map((pkg) => (
                <motion.div
                  key={pkg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left side - Package info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {pkg.name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Target className="w-4 h-4" />
                                  {getTargetName(pkg.interestId)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Created: {formatDate(pkg.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge className={pkg.isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {pkg.isReady ? 'Ready to Apply' : `${pkg.progress}% Complete`}
                              </Badge>
                              <Badge variant="outline">
                                {pkg.type}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Document Progress</span>
                              <span>{pkg.documents.filter(d => d.required && d.status !== 'pending').length}/{pkg.documents.filter(d => d.required).length} complete</span>
                            </div>
                            <Progress value={pkg.progress} className="h-2" />
                          </div>
                          
                          {pkg.linkedScholarships.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Award className="w-4 h-4" />
                              <span>{pkg.linkedScholarships.length} linked scholarships</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Right side - Actions */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            onClick={() => handleViewPackage(pkg._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}