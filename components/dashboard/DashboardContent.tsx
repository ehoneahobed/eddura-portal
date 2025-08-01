'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  GraduationCap, 
  TrendingUp, 
  Settings, 
  Sparkles,
  Calendar,
  Target,
  Award,
  BookOpen,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  LogOut,
  Gift,
  Trophy,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import ProfileEditModal, { EditableUserProfile } from './ProfileEditModal';
import SquadWidget from './SquadWidget';
import TokenDisplay from './TokenDisplay';

interface UserActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  quizCompleted: boolean;
  quizCompletedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  tokens: number;
  totalTokensEarned: number;
  totalTokensSpent: number;
  referralCode?: string;
  stats: DashboardStats;
  careerPreferences?: any;
}

interface DashboardStats {
  applicationPackagesCreated: number;
  documentsCreated: number;
  recommendationLettersRequested: number;
  recommendationLettersReceived: number;
  scholarshipsSaved: number;
}

export default function DashboardContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    fetchUserProfile();
    fetchUserActivities();
  }, [session, status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const profile = await response.json();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const response = await fetch('/api/user/activities?limit=10');
      if (!response.ok) {
        throw new Error('Failed to fetch user activities');
      }
      
      const data = await response.json();
      setUserActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout is now handled by StudentLayout

  const handleRetakeQuiz = () => {
    router.push('/quiz');
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_completed':
      case 'quiz_retaken':
        return { icon: Brain, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
      case 'program_viewed':
        return { icon: BookOpen, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
      case 'scholarship_viewed':
        return { icon: Award, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' };
      case 'application_started':
      case 'application_submitted':
        return { icon: Target, bgColor: 'bg-orange-100', iconColor: 'text-orange-600' };
      case 'document_uploaded':
        return { icon: CheckCircle, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' };
      case 'profile_updated':
        return { icon: Settings, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
      case 'recommendation_viewed':
        return { icon: Sparkles, bgColor: 'bg-pink-100', iconColor: 'text-pink-600' };
      case 'login':
        return { icon: Clock, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
      default:
        return { icon: Clock, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now.getTime() - activityTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return activityTime.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-[#007fbd] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Preparing your personalized experience...</p>
        </motion.div>
      </div>
    );
  }

  const editableProfile: EditableUserProfile | null = userProfile
    ? {
        id: userProfile.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        dateOfBirth: userProfile.dateOfBirth,
        phoneNumber: userProfile.phoneNumber,
        country: userProfile.country,
        city: userProfile.city,
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.firstName || session?.user?.name || 'User'}! 👋
          </h2>
          <p className="text-gray-600">
            Here&apos;s your personalized dashboard with career insights and recommendations.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Application Packages</p>
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.applicationPackagesCreated || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Documents Created</p>
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.documentsCreated || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Recommendation Letters</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userProfile?.stats?.recommendationLettersRequested || 0} / {userProfile?.stats?.recommendationLettersReceived || 0}
                  </p>
                  <p className="text-xs text-gray-500">Requested / Received</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Scholarships Saved</p>
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.scholarshipsSaved || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <Gift className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tokens Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.tokens || 0}</p>
                  <p className="text-xs text-gray-500">Total: {userProfile?.totalTokensEarned || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                  <CardDescription>
                    Get started with your career journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button 
                      onClick={handleRetakeQuiz}
                      className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <Brain className="w-6 h-6 flex-shrink-0 mt-1" />
                        <div className="text-left">
                          <p className="font-semibold">{userProfile?.quizCompleted ? 'Retake Quiz' : 'Take Quiz'}</p>
                          <p className="text-sm opacity-90">{userProfile?.quizCompleted ? 'Update your preferences' : 'Start your career discovery'}</p>
                        </div>
                      </div>
                    </Button>
                    
                    <Link href="/quiz/results">
                      <Button className="h-20 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                        <div className="flex items-start space-x-3 w-full">
                          <Target className="w-6 h-6 flex-shrink-0 mt-1" />
                          <div className="text-left">
                            <p className="font-semibold">View Results</p>
                            <p className="text-sm opacity-90">See your recommendations</p>
                          </div>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/programs">
                      <Button className="h-20 w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                        <div className="flex items-start space-x-3 w-full">
                          <GraduationCap className="w-6 h-6 flex-shrink-0 mt-1" />
                          <div className="text-left">
                            <p className="font-semibold">Browse Programs</p>
                            <p className="text-sm opacity-90">Explore universities</p>
                          </div>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/scholarships">
                      <Button className="h-20 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                        <div className="flex items-start space-x-3 w-full">
                          <TrendingUp className="w-6 h-6 flex-shrink-0 mt-1" />
                          <div className="text-left">
                            <p className="font-semibold">Browse Scholarships</p>
                            <p className="text-sm opacity-90">Find funding opportunities</p>
                          </div>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/applications/manage">
                      <Button className="h-20 w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white">
                        <div className="flex items-start space-x-3 w-full">
                          <Target className="w-6 h-6 flex-shrink-0 mt-1" />
                          <div className="text-left">
                            <p className="font-semibold">Application Management</p>
                            <p className="text-sm opacity-90">Manage your applications</p>
                          </div>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/referrals">
                      <Button className="h-20 w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
                        <div className="flex items-start space-x-3 w-full">
                          <Users className="w-6 h-6 flex-shrink-0 mt-1" />
                          <div className="text-left">
                            <p className="font-semibold">Referral Program</p>
                            <p className="text-sm opacity-90">Invite friends & earn tokens</p>
                          </div>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/leaderboard">
                      <Button className="h-20 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                        <div className="flex items-start space-x-3 w-full">
                          <Trophy className="w-6 h-6 flex-shrink-0 mt-1" />
                          <div className="text-left">
                            <p className="font-semibold">Leaderboard</p>
                            <p className="text-sm opacity-90">Compete with other users</p>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest interactions and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userActivities.length > 0 ? (
                      userActivities.map((activity) => {
                        const { icon: Icon, bgColor, iconColor } = getActivityIcon(activity.type);
                        return (
                          <div key={activity.id} className={`flex items-center space-x-4 p-3 ${bgColor.replace('bg-', 'bg-').replace('-100', '-50')} rounded-lg`}>
                            <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                              <p className="text-xs text-gray-500">{activity.description}</p>
                            </div>
                            <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">No recent activity</p>
                        <p className="text-xs text-gray-400 mt-1">Your activities will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Profile & Settings */}
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-[#007fbd] text-white text-2xl">
                      {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{userProfile?.firstName} {userProfile?.lastName}</CardTitle>
                  <CardDescription>{userProfile?.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quiz Status</span>
                      <Badge className={userProfile?.quizCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {userProfile?.quizCompleted ? "Completed" : "Incomplete"}
                      </Badge>
                    </div>
                    
                    {userProfile?.quizCompletedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="text-sm text-gray-900">
                          {new Date(userProfile.quizCompletedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowProfileModal(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quiz Progress */}
            {userProfile?.quizCompleted && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Quiz Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Completion</span>
                          <span>100%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.applicationPackagesCreated || 0}</p>
                          <p className="text-xs text-gray-500">Applications</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.documentsCreated || 0}</p>
                          <p className="text-xs text-gray-500">Documents</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Token Display */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <TokenDisplay 
                tokens={userProfile?.tokens || 0}
                totalTokensEarned={userProfile?.totalTokensEarned || 0}
                totalTokensSpent={userProfile?.totalTokensSpent || 0}
              />
            </motion.div>

            {/* Eddura Squads Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <SquadWidget />
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/quiz/results" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        <Target className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    </Link>
                    <Link href="/quiz" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        <Brain className="w-4 h-4 mr-2" />
                        {userProfile?.quizCompleted ? 'Retake Quiz' : 'Take Quiz'}
                      </Button>
                    </Link>
                    <Link href="/scholarships" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        <Award className="w-4 h-4 mr-2" />
                        Browse Scholarships
                      </Button>
                    </Link>
                    <Link href="/applications/manage" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        <Target className="w-4 h-4 mr-2" />
                        Application Management
                      </Button>
                    </Link>
                    <Link href="/referrals" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Referral Program
                      </Button>
                    </Link>
                    <Link href="/leaderboard" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        <Trophy className="w-4 h-4 mr-2" />
                        Leaderboard
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Profile Edit Modal */}
        {editableProfile && (
          <ProfileEditModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            profile={editableProfile}
            onUpdate={(updated) => {
              setUserProfile((prev: UserProfile | null) => prev ? { ...prev, ...updated } : prev);
            }}
          />
        )}
      </div>
  );
} 