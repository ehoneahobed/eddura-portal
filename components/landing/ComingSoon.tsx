'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { 
  Sparkles, 
  Rocket, 
  MessageCircle, 
  Users, 
  Zap,
  ArrowRight,
  Star,
  Globe,
  Brain,
  Award,
  MoveRight
} from 'lucide-react';
import { config } from '@/lib/config';

export function ComingSoon() {
  const t = useTranslations('comingSoon');
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [titleNumber, setTitleNumber] = useState(0);
  
  const titles = useMemo(
    () => [
      "Simpler.", // Option 1
      "Smarter.", // Option 2
      "More Successful.", // Option 3
      "Personalized." // Option 4
    ],
    []
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2500); // Increased delay slightly for better readability
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email collection for early access
    console.log('Email submitted:', email);
    setEmail('');
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced machine learning algorithms analyze your profile and match you with perfect opportunities.',
      color: 'text-[#007fbd]'
    },
    {
      icon: Globe,
      title: 'Global Opportunities',
      description: 'Access to 50+ universities and 1000+ scholarship opportunities worldwide.',
      color: 'text-[#007fbd]'
    },
    {
      icon: Zap,
      title: '10x Faster Applications',
      description: 'Automate repetitive tasks and optimize your application strategy with intelligent insights.',
      color: 'text-[#007fbd]'
    },
    {
      icon: Award,
      title: '95% Success Rate',
      description: 'Proven track record of helping students get accepted to their dream programs.',
      color: 'text-[#007fbd]'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,rgba(0,127,189,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#007fbd] rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-[#dbebfa] rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-[#007fbd] rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-[#dbebfa] rounded-full animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-[#00334e]">
                    {config.appName}
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#dbebfa] hover:bg-[#007fbd] hover:text-white text-[#00334e] border-[#007fbd]/30 transition-all duration-300 mb-8 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              Explore Our AI in Action <MoveRight className="w-4 h-4 ml-2" />
            </div>

            {/* Main Heading with Animated Title */}
            <h1 className={`text-5xl md:text-7xl font-bold text-[#00334e] mb-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              Make Your University & Scholarships Applications
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp; {/* This non-breaking space helps maintain height */}
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-[#007fbd]"
                    initial={{ opacity: 0, y: "-100%" }} // Use % for better responsiveness
                    transition={{ type: "spring", stiffness: 50, damping: 10 }} // Added damping for smoother animation
                    animate={
                      titleNumber === index
                        ? {
                            y: "0%",
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? "-150%" : "150%", // Use % here too
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              {config.appDescription}. Get AI-powered insights, essay hacks, early betas & connect with future leaders.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <Button 
                asChild
                size="lg"
                className="bg-[#007fbd] hover:bg-[#004d73] text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <a href={config.telegramChannel} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Join Our Telegram Channel
                  <MoveRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-[#007fbd] text-[#007fbd] hover:bg-[#007fbd] hover:text-white px-8 py-4 text-lg transition-all duration-300"
              >
                <Star className="mr-2 h-4 w-4" />
                Get Early Access
              </Button>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00334e] mb-1">50+</div>
                <div className="text-sm text-gray-600">Universities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00334e] mb-1">1000+</div>
                <div className="text-sm text-gray-600">Scholarships</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00334e] mb-1">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00334e] mb-1">10x</div>
                <div className="text-sm text-gray-600">Faster</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#00334e] mb-4">
              What&apos;s Coming
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Be the first to know when we launch. Don&apos;t just apply, succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`group p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#007fbd]/30 hover:shadow-lg transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-center">
                    <Icon className={`h-8 w-8 ${feature.color} mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`} />
                    <h3 className="text-lg font-semibold text-[#00334e] mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#00334e] mb-4">
            Get Early Access
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Be among the first to experience the future of scholarship applications
          </p>
          
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fbd] focus:border-transparent"
              required
            />
            <Button 
              type="submit"
              className="bg-[#007fbd] hover:bg-[#004d73] text-white px-6 py-3"
            >
              Notify Me
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#00334e] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">{config.appName}</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Revolutionizing university & scholarship applications with AI-powered insights
            </p>
            <div className="flex justify-center space-x-6">
              <a 
                href={config.telegramChannel} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6 text-sm text-gray-400">
              © 2024 {config.appName}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 