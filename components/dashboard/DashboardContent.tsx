'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  User, 
  Brain, 
  GraduationCap, 
  TrendingUp, 
  Settings, 
  LogOut,
  Sparkles,
  Calendar,
  Target,
  Award,
  BookOpen,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import ProfileEditModal, { EditableUserProfile } from './ProfileEditModal';

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
  stats: DashboardStats;
  careerPreferences?: any;
}

interface DashboardStats {
  quizScore: number;
  recommendationsCount: number;
  programsViewed: number;
  applicationsStarted: number;
}

export default function DashboardContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    fetchUserProfile();
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleRetakeQuiz = () => {
    router.push('/quiz');
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Remove the custom header here. Only keep the main content. */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.firstName}! 👋
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Quiz Score</p>
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.quizScore || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.recommendationsCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Programs Viewed</p>
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.programsViewed || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.applicationsStarted || 0}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleRetakeQuiz}
                      className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      <div className="text-left">
                        <Brain className="w-6 h-6 mb-2" />
                        <p className="font-semibold">{userProfile?.quizCompleted ? 'Retake Quiz' : 'Take Quiz'}</p>
                        <p className="text-sm opacity-90">{userProfile?.quizCompleted ? 'Update your preferences' : 'Start your career discovery'}</p>
                      </div>
                    </Button>
                    
                    <Link href="/quiz/results">
                      <Button className="h-20 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                        <div className="text-left">
                          <Target className="w-6 h-6 mb-2" />
                          <p className="font-semibold">View Results</p>
                          <p className="text-sm opacity-90">See your recommendations</p>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/scholarships">
                      <Button className="h-20 w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                        <div className="text-left">
                          <Award className="w-6 h-6 mb-2" />
                          <p className="font-semibold">Browse Scholarships</p>
                          <p className="text-sm opacity-90">Find funding opportunities</p>
                        </div>
                      </Button>
                    </Link>
                    
                    <Button className="h-20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                      <div className="text-left">
                        <TrendingUp className="w-6 h-6 mb-2" />
                        <p className="font-semibold">Career Paths</p>
                        <p className="text-sm opacity-90">Discover opportunities</p>
                      </div>
                    </Button>
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
                    <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Quiz Completed</p>
                        <p className="text-xs text-gray-500">Career discovery quiz finished</p>
                      </div>
                      <span className="text-xs text-gray-400">2 days ago</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Program Viewed</p>
                        <p className="text-xs text-gray-500">Stanford Data Science Program</p>
                      </div>
                      <span className="text-xs text-gray-400">1 day ago</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Recommendations Updated</p>
                        <p className="text-xs text-gray-500">New career paths available</p>
                      </div>
                      <span className="text-xs text-gray-400">3 days ago</span>
                    </div>
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
                          <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.quizScore || 0}%</p>
                          <p className="text-xs text-gray-500">Match Score</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{userProfile?.stats?.recommendationsCount || 0}</p>
                          <p className="text-xs text-gray-500">Programs</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
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
      </main>

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