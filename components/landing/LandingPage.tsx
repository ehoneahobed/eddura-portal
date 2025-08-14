'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeAwareLogo } from '@/components/ui/logo';
import { LanguageSelector } from '@/components/ui/language-selector';
import Hero from './Hero';
import { ComingSoon } from './ComingSoon';
import { config } from '@/lib/config';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  TrendingUp,
  Shield,
  Zap,
  Award,
  FileText,
  Search,
  Target,
  Lightbulb,
  DollarSign,
  Clock,
  Globe,
  Play,
  Rocket,
  Brain,
  Eye,
  Fingerprint,
  Layers,
  Cpu,
  Database,
  Network,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If not launched, show coming soon page
  if (!config.isLaunched) {
    return <ComingSoon />;
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced machine learning algorithms analyze your profile and automatically match you with the perfect programs and scholarships.',
      color: 'text-eddura-500',
      bgColor: 'bg-eddura-100'
    },
    {
      icon: Database,
      title: 'Unified Data Hub',
      description: 'Single source of truth for all your academic data. Upload once, use everywhere with intelligent auto-population.',
      color: 'text-eddura-500',
      bgColor: 'bg-eddura-100'
    },
    {
      icon: Layers,
      title: 'Smart Application Stack',
      description: 'Layer your applications with intelligent insights, deadline tracking, and progress optimization.',
      color: 'text-eddura-500',
      bgColor: 'bg-eddura-100'
    },
    {
      icon: Network,
      title: 'Global Opportunity Network',
      description: 'Connect with 50+ universities and 100+ scholarship opportunities worldwide.',
      color: 'text-eddura-500',
      bgColor: 'bg-eddura-100'
    },
    {
      icon: Cpu,
      title: 'Intelligent Automation',
      description: 'Automate repetitive tasks, generate personalized content, and optimize your application strategy.',
      color: 'text-eddura-500',
      bgColor: 'bg-eddura-100'
    },
    {
      icon: Eye,
      title: 'Predictive Analytics',
      description: 'Get insights into your application success probability and optimize your strategy in real-time.',
      color: 'text-eddura-500',
      bgColor: 'bg-eddura-100'
    }
  ];

  const stats = [
    { number: '95%', label: 'Success Rate', icon: TrendingUp, color: 'text-eddura-500' },
    { number: '10x', label: 'Faster Applications', icon: Zap, color: 'text-eddura-500' },
    { number: '50+', label: 'Universities', icon: Globe, color: 'text-eddura-500' },
    { number: '100+', label: 'Scholarships Available', icon: Award, color: 'text-eddura-500' }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Stanford University",
      content: "Eddura's AI helped me craft the perfect personal statement. I got accepted to my dream program!",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "MIT Graduate",
      content: "The automated application process saved me 40+ hours. The scholarship matching was spot-on.",
      avatar: "MR"
    },
    {
      name: "Priya Patel",
      role: "Harvard University",
      content: "From 3 applications to 15 successful submissions. Eddura transformed my academic journey.",
      avatar: "PP"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-eddura-900 text-eddura-900 dark:text-eddura-100 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-eddura-50 via-white to-eddura-100/30 dark:from-eddura-900 dark:via-eddura-800 dark:to-eddura-700/30">
                 <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(25,103,117,0.15)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(56,184,204,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-eddura-900 dark:via-transparent dark:to-transparent"></div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-20 left-10 w-2 h-2 bg-eddura-500/80 rounded-full animate-pulse"></div>
         <div className="absolute top-40 right-20 w-1 h-1 bg-eddura-300/80 rounded-full animate-ping"></div>
         <div className="absolute bottom-40 left-20 w-3 h-3 bg-eddura-500/80 rounded-full animate-bounce"></div>
         <div className="absolute bottom-20 right-10 w-2 h-2 bg-eddura-300/80 rounded-full animate-pulse"></div>
      </div>

             {/* Header */}
       <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-eddura-900/95 backdrop-blur-xl border-b border-eddura-100 dark:border-eddura-800 shadow-sm transition-all duration-300">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                       <div className="flex justify-between items-center py-4">
             <div className="flex items-center">
               <div className="flex-shrink-0">
                                   <ThemeAwareLogo size="nav" />
               </div>
             </div>
             <div className="flex items-center space-x-6">
               <LanguageSelector variant="compact" showLabel={false} />
               <ThemeToggle />
               <Link href="/quiz">
                 <Button variant="outline" className="border-eddura-500 text-eddura-600 hover:bg-eddura-500 hover:text-white transition-all duration-300 rounded-lg">
                   Take Quiz
                 </Button>
               </Link>
               <Link href="/auth/register">
                 <Button className="bg-eddura-500 hover:bg-eddura-600 text-white border-0 shadow-eddura hover:shadow-eddura-lg transition-all duration-300 rounded-lg">
                   Get Started
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               </Link>
             </div>
           </div>
         </div>
       </header>

             {/* Hero Section */}
       <section ref={heroRef} className="relative min-h-screen flex items-center justify-center">
        <div className="relative z-10">
          <Hero />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                                     className="group p-6 rounded-2xl bg-white dark:bg-eddura-900 border border-eddura-100 dark:border-eddura-700 hover:border-eddura-300 dark:hover:border-eddura-600 hover:shadow-eddura-lg transition-all duration-500"
                >
                                     <div className="text-center">
                     <div className="inline-flex p-3 rounded-xl bg-eddura-100 dark:bg-eddura-800 group-hover:bg-eddura-200 dark:group-hover:bg-eddura-700 transition-colors duration-300 mb-4">
                       <Icon className={`h-8 w-8 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                     </div>
                                           <div className="text-3xl font-bold text-eddura-800 dark:text-eddura-100 mb-1">{stat.number}</div>
                      <div className="text-sm text-eddura-700 dark:text-eddura-400">{stat.label}</div>
                   </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

             {/* Features Section */}
       <section id="features" className="py-32 relative bg-eddura-50/50 dark:bg-eddura-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
                         <h2 className="text-4xl md:text-6xl font-bold mb-8">
                               <span className="text-eddura-800 dark:text-eddura-100">
                  Revolutionary
                </span>
                <br />
                <span className="text-eddura-600 dark:text-eddura-300">
                  Features
                </span>
              </h2>
              <p className="text-xl text-eddura-800 dark:text-eddura-300 max-w-3xl mx-auto">
                Built with cutting-edge technology to give you the ultimate competitive advantage.
              </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                                     className="group p-8 rounded-3xl bg-white dark:bg-eddura-900 border border-eddura-100 dark:border-eddura-700 hover:border-eddura-300 dark:hover:border-eddura-600 hover:shadow-eddura-xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className="flex items-center mb-6">
                    <div className="p-4 rounded-2xl bg-eddura-500 shadow-eddura group-hover:shadow-eddura-lg transition-all duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                                                         <h3 className="text-2xl font-bold text-eddura-800 dark:text-eddura-100 mb-4">{feature.title}</h3>
                    <p className="text-eddura-800 dark:text-eddura-300 leading-relaxed">{feature.description}</p>
                  <div className="mt-6 flex items-center text-eddura-500 group-hover:text-eddura-600 transition-colors duration-300">
                    <span className="text-sm font-medium">Learn more</span>
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

             {/* Testimonials Section */}
       <section className="py-32 bg-white dark:bg-eddura-900 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
                         <h2 className="text-4xl md:text-6xl font-bold mb-8">
                               <span className="text-eddura-800 dark:text-eddura-100">
                  Trusted by
                </span>
                <br />
                <span className="text-eddura-600 dark:text-eddura-300">
                  Top Students
                </span>
             </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                                 className="p-8 rounded-3xl bg-eddura-50 dark:bg-eddura-800 border border-eddura-100 dark:border-eddura-700 hover:border-eddura-300 dark:hover:border-eddura-600 hover:shadow-eddura-lg transition-all duration-500"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-eddura-500 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-eddura">
                    {testimonial.avatar}
                  </div>
                  <div>
                                                                                   <div className="font-semibold text-eddura-800 dark:text-eddura-100">{testimonial.name}</div>
                      <div className="text-sm text-eddura-700 dark:text-eddura-400">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-eddura-800 dark:text-eddura-300 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-eddura-500 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="signup" className="py-32 relative bg-eddura-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="p-12 rounded-3xl bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
                         <h2 className="text-4xl md:text-6xl font-bold text-eddura-800 dark:text-eddura-100 mb-8">
               Ready to Transform
               <br />
               <span className="text-eddura-600 dark:text-eddura-300">
                 Your Future?
               </span>
             </h2>
             <p className="text-xl text-eddura-800 dark:text-eddura-300 mb-12 max-w-2xl mx-auto">
               Join thousands of students who have already discovered their path to success with Eddura&apos;s intelligent platform.
             </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/register">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-4 bg-eddura-500 hover:bg-eddura-600 text-white border-0 shadow-eddura-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-4 border-2 border-eddura-500 text-eddura-600 hover:bg-eddura-500 hover:text-white transition-all duration-300 rounded-xl"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

             {/* Footer */}
       <footer className="py-16 border-t border-eddura-100 dark:border-eddura-700 bg-eddura-50 dark:bg-eddura-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
                         <div className="flex items-center justify-center mb-6">
               <ThemeAwareLogo size="xl" />
             </div>
             <p className="text-eddura-600 dark:text-eddura-400 mb-8 max-w-md mx-auto">
               The future of academic applications. Powered by AI, designed for success.
             </p>
             <div className="flex justify-center space-x-8 mb-8">
               <Link href="#features" className="text-eddura-600 dark:text-eddura-400 hover:text-eddura-500 dark:hover:text-eddura-300 transition-colors">
                 Features
               </Link>
               <Link href="#" className="text-eddura-600 dark:text-eddura-400 hover:text-eddura-500 dark:hover:text-eddura-300 transition-colors">
                 Privacy
               </Link>
               <Link href="#" className="text-eddura-600 dark:text-eddura-400 hover:text-eddura-500 dark:hover:text-eddura-300 transition-colors">
                 Terms
               </Link>
             </div>
             <div className="border-t border-eddura-100 dark:border-eddura-700 pt-8">
               <p className="text-eddura-600 dark:text-eddura-400">&copy; 2025 Eddura. All rights reserved.</p>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 