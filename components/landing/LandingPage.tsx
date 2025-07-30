'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Hero } from './Hero';
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
  Sparkles,
  Rocket,
  Brain,
  Eye,
  Fingerprint,
  Layers,
  Cpu,
  Database,
  Network
} from 'lucide-react';

export default function LandingPage() {
  const t = useTranslations('landing');
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
      title: t('features.aiIntelligence.title'),
      description: t('features.aiIntelligence.description'),
      color: 'text-[#007fbd]',
      bgColor: 'bg-[#dbebfa]'
    },
    {
      icon: Database,
      title: t('features.unifiedData.title'),
      description: t('features.unifiedData.description'),
      color: 'text-[#007fbd]',
      bgColor: 'bg-[#dbebfa]'
    },
    {
      icon: Layers,
      title: t('features.smartStack.title'),
      description: t('features.smartStack.description'),
      color: 'text-[#007fbd]',
      bgColor: 'bg-[#dbebfa]'
    },
    {
      icon: Network,
      title: t('features.globalNetwork.title'),
      description: t('features.globalNetwork.description'),
      color: 'text-[#007fbd]',
      bgColor: 'bg-[#dbebfa]'
    },
    {
      icon: Cpu,
      title: t('features.automation.title'),
      description: t('features.automation.description'),
      color: 'text-[#007fbd]',
      bgColor: 'bg-[#dbebfa]'
    },
    {
      icon: Eye,
      title: t('features.analytics.title'),
      description: t('features.analytics.description'),
      color: 'text-[#007fbd]',
      bgColor: 'bg-[#dbebfa]'
    }
  ];

  const stats = [
    { number: '95%', label: 'Success Rate', icon: TrendingUp, color: 'text-[#007fbd]' },
    { number: '10x', label: 'Faster Applications', icon: Zap, color: 'text-[#007fbd]' },
    { number: '50+', label: 'Universities', icon: Globe, color: 'text-[#007fbd]' },
    { number: '1000+', label: 'Scholarships Available', icon: Award, color: 'text-[#007fbd]' }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Stanford University",
      content: "Eddura&apos;s AI helped me craft the perfect personal statement. I got accepted to my dream program!",
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
                    Eddura
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/quiz">
                <Button variant="outline" className="border-[#007fbd] text-[#007fbd] hover:bg-[#007fbd] hover:text-white transition-all duration-300">
                  Take Quiz
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[#007fbd] hover:bg-[#004d73] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative">
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
                <div 
                  key={index}
                  className={`group p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#007fbd]/30 hover:shadow-lg transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-center">
                    <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`} />
                    <div className="text-3xl font-bold text-[#00334e] mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-[#00334e]">
                Revolutionary
              </span>
              <br />
              <span className="text-[#007fbd]">
                Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with cutting-edge technology to give you the ultimate competitive advantage.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`group p-8 rounded-3xl bg-white border border-gray-200 hover:border-[#007fbd]/30 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center mb-6">
                    <div className={`p-4 rounded-2xl bg-[#007fbd] shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#00334e] mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-[#00334e]">
                Trusted by
              </span>
              <br />
              <span className="text-[#007fbd]">
                Top Students
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`p-8 rounded-3xl bg-gray-50 border border-gray-200 hover:border-[#007fbd]/30 hover:shadow-lg transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[#007fbd] rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-[#00334e]">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#007fbd] fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="signup" className="py-32 relative bg-[#dbebfa]/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="p-12 rounded-3xl bg-white border border-[#007fbd]/20 shadow-xl">
            <h2 className="text-5xl md:text-6xl font-bold text-[#00334e] mb-8">
              Ready to Transform
              <br />
              <span className="text-[#007fbd]">
                Your Future?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of students who have already discovered their path to success with Eddura&apos;s intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="#signup">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-4 bg-[#007fbd] hover:bg-[#004d73] text-white border-0 shadow-2xl hover:shadow-[#007fbd]/25 transition-all duration-300 transform hover:scale-105"
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
                  className="text-lg px-8 py-4 border-2 border-[#007fbd] text-[#007fbd] hover:bg-[#007fbd] hover:text-white transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-[#007fbd] rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-[#00334e]">
                Eddura
              </div>
            </div>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              The future of academic applications. Powered by AI, designed for success.
            </p>
            <div className="flex justify-center space-x-8 mb-8">
              <Link href="#features" className="text-gray-600 hover:text-[#007fbd] transition-colors">
                Features
              </Link>
              <Link href="#" className="text-gray-600 hover:text-[#007fbd] transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-gray-600 hover:text-[#007fbd] transition-colors">
                Terms
              </Link>
            </div>
            <div className="border-t border-gray-200 pt-8">
              <p className="text-gray-600">&copy; 2025 Eddura. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 