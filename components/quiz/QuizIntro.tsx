'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Clock, 
  Shield, 
  ArrowRight, 
  Sparkles, 
  Users, 
  BookOpen,
  CheckCircle,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function QuizIntro() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Our advanced AI analyzes your responses to provide highly personalized recommendations'
    },
    {
      icon: Target,
      title: 'Precise Matching',
      description: 'Get matched with programs that align with your interests, strengths, and career goals'
    },
    {
      icon: Clock,
      title: 'Quick & Efficient',
      description: 'Complete the quiz in just 15-20 minutes and get instant insights'
    },
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'Your responses are secure and only used to provide personalized recommendations'
    }
  ];

  const quizStats = [
    { number: '10', label: 'Comprehensive Sections' },
    { number: '25+', label: 'Carefully Crafted Questions' },
    { number: '15-20', label: 'Minutes to Complete' },
    { number: '100%', label: 'Free & Confidential' }
  ];

  const benefits = [
    'Discover programs you never knew existed',
    'Understand your career compatibility',
    'Get insights into your learning style',
    'Identify your core strengths and skills',
    'Find programs that match your budget and timeline',
    'Receive personalized university recommendations'
  ];

  const handleStartQuiz = () => {
    setIsStarting(true);
    // Navigate to the first quiz section
    router.push('/quiz/sections/education-aspirations');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-[#00334e]">
                    Eddura
                  </h1>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[#007fbd] hover:bg-[#004d73] text-white">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Career Discovery
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Discover Your Perfect
                <span className="text-[#007fbd] block">University Program</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Take our comprehensive career discovery quiz and get personalized AI recommendations 
                for university programs that match your interests, strengths, and career aspirations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  onClick={handleStartQuiz}
                  disabled={isStarting}
                  className="text-lg px-8 py-4 bg-[#007fbd] hover:bg-[#004d73] text-white shadow-2xl hover:shadow-[#007fbd]/25 transition-all duration-300 transform hover:scale-105"
                >
                  {isStarting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Starting Quiz...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-5 w-5" />
                      Start Your Quiz
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <Link href="/auth/register">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-4 border-2 border-[#007fbd] text-[#007fbd] hover:bg-[#007fbd] hover:text-white transition-all duration-300"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Register First
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {quizStats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-[#007fbd] mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Quiz?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive assessment goes beyond simple questions to provide you with 
              truly personalized insights and recommendations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-[#007fbd] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What You&apos;ll Discover
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our quiz will help you uncover insights about yourself and find the perfect 
              educational path for your future.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#007fbd]">Personal Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#007fbd]">Program Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {benefits.slice(3).map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#00334e]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Discover Your Path?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of students who have already found their perfect university program 
              with our AI-powered career discovery quiz.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleStartQuiz}
                disabled={isStarting}
                className="text-lg px-8 py-4 bg-[#007fbd] hover:bg-[#004d73] text-white shadow-2xl hover:shadow-[#007fbd]/25 transition-all duration-300 transform hover:scale-105"
              >
                {isStarting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Starting Quiz...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Start Quiz Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              
              <Link href="/auth/register">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#00334e] transition-all duration-300"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Create Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 