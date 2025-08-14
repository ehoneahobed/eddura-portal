'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeAwareLogo } from '@/components/ui/logo';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [titleNumber, setTitleNumber] = useState(0);
  
  const titles = useMemo(
    () => [
      t('pages.landing.hero.titles.simpler'),
      t('pages.landing.hero.titles.smarter'),
      t('pages.landing.hero.titles.moreSuccessful'),
      t('pages.landing.hero.titles.personalized')
    ],
    [t]
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
      title: t('pages.landing.comingSoon.features.aiIntelligence.title'),
      description: t('pages.landing.comingSoon.features.aiIntelligence.description'),
      color: 'text-eddura-500'
    },
    {
      icon: Globe,
      title: t('pages.landing.comingSoon.features.globalOpportunities.title'),
      description: t('pages.landing.comingSoon.features.globalOpportunities.description'),
      color: 'text-eddura-500'
    },
    {
      icon: Zap,
      title: t('pages.landing.comingSoon.features.fasterApplications.title'),
      description: t('pages.landing.comingSoon.features.fasterApplications.description'),
      color: 'text-eddura-500'
    },
    {
      icon: Award,
      title: t('pages.landing.comingSoon.features.successRate.title'),
      description: t('pages.landing.comingSoon.features.successRate.description'),
      color: 'text-eddura-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-eddura-900 text-eddura-900 dark:text-eddura-100 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-eddura-50 via-white to-eddura-100/20 dark:from-eddura-900 dark:via-eddura-900 dark:to-eddura-800/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(25,103,117,0.1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(56,184,204,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-eddura-900 dark:via-transparent dark:to-transparent opacity-20"></div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-eddura-500/80 dark:bg-eddura-400/80 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-eddura-300/80 dark:bg-eddura-400/80 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-eddura-500/80 dark:bg-eddura-400/80 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-eddura-300/80 dark:bg-eddura-400/80 rounded-full animate-pulse"></div>
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
              <LanguageSelector variant="compact" />
              <ThemeToggle />
              <span className="text-sm text-eddura-700 dark:text-eddura-300 bg-eddura-100 dark:bg-eddura-800 px-4 py-2 rounded-full font-medium">
                {t('pages.landing.comingSoon.badge')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center z-10 pt-20 bg-white dark:bg-eddura-900 rounded-3xl mx-4 my-4 shadow-2xl p-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-eddura-100 dark:bg-eddura-800 text-eddura-800 dark:text-eddura-200 border-eddura-200 dark:border-eddura-700 hover:bg-eddura-200 dark:hover:bg-eddura-700 hover:border-eddura-300 dark:hover:border-eddura-600 transition-all duration-300 mb-8 shadow-eddura"
            >
              {t('pages.landing.comingSoon.exploreAi')} <MoveRight className="w-4 h-4 ml-2" />
            </motion.div>

            {/* Main Heading with Animated Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-eddura-800 dark:text-eddura-100 mb-6 leading-tight"
            >
              {t('pages.landing.comingSoon.mainHeading')}
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
              {t('pages.landing.comingSoon.subtitle', { appDescription: config.appDescription })}
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
                  {t('pages.landing.comingSoon.telegramCta')}
                  <MoveRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-eddura-500 dark:border-eddura-400 text-eddura-600 dark:text-eddura-300 hover:bg-eddura-500 hover:text-white dark:hover:bg-eddura-400 px-8 py-4 text-lg transition-all duration-300 rounded-xl bg-white/80 dark:bg-eddura-800/80 backdrop-blur-sm"
              >
                <Star className="mr-2 h-4 w-4" />
                {t('pages.landing.comingSoon.earlyAccess')}
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
                <div className="text-sm text-eddura-700 dark:text-eddura-400">{t('pages.landing.comingSoon.stats.universities')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-eddura-800 dark:text-eddura-100 mb-1">100+</div>
                <div className="text-sm text-eddura-700 dark:text-eddura-400">{t('pages.landing.comingSoon.stats.scholarships')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-eddura-800 dark:text-eddura-100 mb-1">95%</div>
                <div className="text-sm text-eddura-700 dark:text-eddura-400">{t('pages.landing.comingSoon.stats.successRate')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-eddura-800 dark:text-eddura-100 mb-1">10x</div>
                <div className="text-sm text-eddura-700 dark:text-eddura-400">{t('pages.landing.comingSoon.stats.faster')}</div>
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
              {t('pages.landing.comingSoon.whatsComing')}
            </h2>
            <p className="text-lg text-eddura-800 dark:text-eddura-300 max-w-2xl mx-auto">
              {t('pages.landing.comingSoon.whatsComingSub')}
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
              {t('pages.landing.comingSoon.earlyAccess')}
            </h2>
            <p className="text-lg text-eddura-800 dark:text-eddura-300 mb-8">
              {t('pages.landing.comingSoon.earlyAccessSub')}
            </p>
            
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('pages.landing.comingSoon.emailPlaceholder')}
                className="flex-1 px-4 py-3 border border-eddura-200 dark:border-eddura-600 rounded-lg focus:ring-2 focus:ring-eddura-500 focus:border-eddura-500 transition-all duration-200 bg-white dark:bg-eddura-800 text-eddura-800 dark:text-eddura-100 placeholder:text-eddura-400 dark:placeholder:text-eddura-500"
                required
              />
              <Button 
                type="submit"
                className="bg-eddura-500 hover:bg-eddura-600 text-white px-6 py-3 rounded-lg"
              >
                {t('pages.landing.comingSoon.notifyMe')}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className=" dark:bg-eddura-950 text-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <ThemeAwareLogo size="xl" />
            </div>
            <p className="text-eddura-100 dark:text-eddura-200 mb-6 text-lg font-medium">
              {t('pages.landing.comingSoon.footer.tagline')}
            </p>
            <div className="flex justify-center space-x-6">
              <a 
                href={config.telegramChannel} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-eddura-200 dark:text-eddura-300 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-eddura-800 dark:hover:bg-eddura-700"
              >
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-6 text-sm text-eddura-200 dark:text-eddura-300 font-medium">
              © 2025 {config.appName}. {t('pages.landing.footer.copyright', { year: '2024' })}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}