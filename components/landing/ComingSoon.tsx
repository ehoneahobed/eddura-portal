'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeAwareLogo } from '@/components/ui/logo';
import { 
  Rocket, 
  MessageCircle, 
  Users, 
  Zap,
  ArrowRight,
  Star,
  Globe,
  Brain,
  Award,
  MoveRight,
  CheckCircle
} from 'lucide-react';
import { config } from '@/lib/config';

export function ComingSoon() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [titleNumber, setTitleNumber] = useState(0);
  
  const titles = useMemo(
    () => [
      "Simpler.",
      "Smarter.",
      "More Successful.",
      "Personalized."
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
    }, 2500);
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
      color: 'text-eddura-500'
    },
    {
      icon: Globe,
      title: 'Global Opportunities',
      description: 'Access to 50+ universities and 100+ scholarship opportunities worldwide.',
      color: 'text-eddura-500'
    },
    {
      icon: Zap,
      title: '10x Faster Applications',
      description: 'Automate repetitive tasks and optimize your application strategy with intelligent insights.',
      color: 'text-eddura-500'
    },
    {
      icon: Award,
      title: '95% Success Rate',
      description: 'Proven track record of helping students get accepted to their dream programs.',
      color: 'text-eddura-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-eddura-900 text-eddura-900 dark:text-eddura-100 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-eddura-50 via-white to-eddura-100/20 dark:from-eddura-900 dark:via-eddura-800 dark:to-eddura-700/20">
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(25,103,117,0.1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(56,184,204,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
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
             <div className="flex items-center space-x-4">
               <ThemeToggle />
               <span className="text-sm text-eddura-700 bg-eddura-100 dark:bg-eddura-800 dark:text-eddura-300 px-4 py-2 rounded-full font-medium">
                 Coming Soon
               </span>
             </div>
           </div>
         </div>
       </header>

             {/* Hero Section */}
       <section className="relative min-h-screen flex items-center justify-center z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
                             className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-eddura-100 hover:bg-eddura-200 text-eddura-800 border-eddura-200 hover:border-eddura-300 transition-all duration-300 mb-8 shadow-eddura"
            >
              Explore Our AI in Action <MoveRight className="w-4 h-4 ml-2" />
            </motion.div>

                         {/* Main Heading with Animated Title */}
             <motion.h1 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                               className="text-4xl md:text-6xl lg:text-7xl font-bold text-eddura-800 dark:text-eddura-100 mb-6 leading-tight"
             >
               Make Your University & Scholarships Applications
               <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-2">
                 &nbsp;
                 {titles.map((title, index) => (
                   <motion.span
                     key={index}
                     className="absolute font-bold text-eddura-500 dark:text-eddura-300"
                     initial={{ opacity: 0, y: "-100%" }}
                     transition={{ type: "spring", stiffness: 50, damping: 10 }}
                     animate={
                       titleNumber === index
                         ? {
                             y: "0%",
                             opacity: 1,
                           }
                         : {
                             y: titleNumber > index ? "-150%" : "150%",
                             opacity: 0,
                           }
                     }
                   >
                     {title}
                   </motion.span>
                 ))}
               </span>
             </motion.h1>

             {/* Subtitle */}
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                               className="text-xl md:text-2xl text-eddura-800 dark:text-eddura-300 mb-12 max-w-3xl mx-auto"
             >
               {config.appDescription}. Get AI-powered insights, essay hacks, early betas & connect with future leaders.
             </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button 
                asChild
                size="lg"
                className="bg-eddura-500 hover:bg-eddura-600 text-white px-8 py-4 text-lg shadow-eddura-lg hover:shadow-eddura-xl transition-all duration-300 transform hover:scale-105 rounded-xl"
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
                className="border-2 border-eddura-500 text-eddura-600 hover:bg-eddura-500 hover:text-white px-8 py-4 text-lg transition-all duration-300 rounded-xl"
              >
                <Star className="mr-2 h-4 w-4" />
                Get Early Access
              </Button>
            </motion.div>

                         {/* Stats */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
               className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
             >
               <div className="text-center">
                                   <div className="text-3xl font-bold text-eddura-800 dark:text-eddura-100 mb-1">50+</div>
                  <div className="text-sm text-eddura-700 dark:text-eddura-400">Universities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-eddura-800 dark:text-eddura-100 mb-1">100+</div>
                  <div className="text-sm text-eddura-700 dark:text-eddura-400">Scholarships</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-eddura-800 dark:text-eddura-100 mb-1">95%</div>
                  <div className="text-sm text-eddura-700 dark:text-eddura-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-eddura-800 dark:text-eddura-100 mb-1">10x</div>
                  <div className="text-sm text-eddura-700 dark:text-eddura-400">Faster</div>
               </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-eddura-50 dark:bg-eddura-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
                         <h2 className="text-3xl md:text-4xl font-bold text-eddura-800 dark:text-eddura-100 mb-4">
               What&apos;s Coming
             </h2>
             <p className="text-lg text-eddura-800 dark:text-eddura-300 max-w-2xl mx-auto">
               Be the first to know when we launch. Don&apos;t just apply, succeed.
             </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-6 rounded-2xl bg-white dark:bg-eddura-900 border border-eddura-100 dark:border-eddura-700 hover:border-eddura-300 dark:hover:border-eddura-600 hover:shadow-eddura-lg transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-xl bg-eddura-100 dark:bg-eddura-800 group-hover:bg-eddura-200 dark:group-hover:bg-eddura-700 transition-colors duration-300 mb-4">
                      <Icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                                         <h3 className="text-lg font-semibold text-eddura-800 dark:text-eddura-100 mb-2">{feature.title}</h3>
                     <p className="text-sm text-eddura-800 dark:text-eddura-300">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-20 bg-eddura-gradient relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-white dark:bg-eddura-900 border border-eddura-100 dark:border-eddura-700 shadow-2xl"
          >
                         <h2 className="text-3xl md:text-4xl font-bold text-eddura-800 dark:text-eddura-100 mb-4">
               Get Early Access
             </h2>
             <p className="text-lg text-eddura-800 dark:text-eddura-300 mb-8">
               Be among the first to experience the future of scholarship applications
             </p>
            
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                             <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Enter your email"
                                   className="flex-1 px-4 py-3 border border-eddura-200 dark:border-eddura-600 rounded-lg focus:ring-2 focus:ring-eddura-500 focus:border-eddura-500 transition-all duration-200 bg-white dark:bg-eddura-800 text-eddura-800 dark:text-eddura-100 placeholder:text-eddura-400 dark:placeholder:text-eddura-500"
                 required
               />
              <Button 
                type="submit"
                className="bg-eddura-500 hover:bg-eddura-600 text-white px-6 py-3 rounded-lg"
              >
                Notify Me
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-eddura-900 dark:bg-eddura-950 text-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
                         <div className="flex items-center justify-center mb-4">
               <ThemeAwareLogo size="xl" />
             </div>
            <p className="text-white/90 mb-6 text-lg">
              Revolutionizing university & scholarship applications with AI-powered insights
            </p>
            <div className="flex justify-center space-x-6">
              <a 
                href={config.telegramChannel} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
              >
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-6 text-sm text-white/70">
              © 2024 {config.appName}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}