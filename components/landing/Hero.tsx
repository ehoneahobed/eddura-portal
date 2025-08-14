'use client';

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Brain, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeAwareLogo } from "@/components/ui/logo";
import Link from "next/link";
import { usePageTranslation } from "@/hooks/useTranslation";

function Hero() {
  const { t } = usePageTranslation('landing');
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => [
      t('hero.titles.simpler'),
      t('hero.titles.smarter'),
      t('hero.titles.moreSuccessful'),
      t('hero.titles.personalized')
    ],
    [t]
  );

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

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-eddura-50 via-white to-eddura-100/30 dark:from-eddura-900 dark:via-eddura-900 dark:to-eddura-800/30" />
      
      {/* Abstract geometric shapes */}
      {/* <div className="absolute top-20 left-10 w-32 h-32 bg-eddura-200/20 rounded-full blur-3xl" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-eddura-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-accent/20 rounded-full blur-3xl" /> */}
      
      <div className="mt-20 container mx-auto relative z-10">
        <div className="flex gap-8 items-center justify-center flex-col">
         
          {/* Quiz Discovery Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Link href="/quiz">
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-3 bg-eddura-100 dark:bg-eddura-800 hover:bg-eddura-200 dark:hover:bg-eddura-700 text-eddura-700 dark:text-eddura-200 border-eddura-200 dark:border-eddura-700 hover:border-eddura-300 dark:hover:border-eddura-600 transition-all duration-300 rounded-full px-6 py-2 shadow-eddura"
              >
                <Brain className="w-4 h-4" />
                {t('hero.takeQuiz')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Main Headline */}
          <motion.div 
            className="flex gap-4 flex-col text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-5xl tracking-tight font-bold text-eddura-800 dark:text-eddura-100 leading-tight">
              {t('hero.heading')}
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
            </h1>

            <motion.p 
              className="text-lg md:text-xl leading-relaxed tracking-tight text-eddura-800 dark:text-eddura-300 max-w-4xl text-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              {t('hero.subtitle')}
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          >
            {/* Primary CTA - Start Quiz */}
            <Link href="/quiz">
              <Button 
                size="lg" 
                className="gap-3 bg-eddura-500 hover:bg-eddura-600 text-white border-0 shadow-eddura-lg hover:shadow-eddura-xl transition-all duration-300 transform hover:scale-105 rounded-xl px-8 py-4 text-lg font-semibold"
              >
                <Brain className="w-5 h-5" />
                {t('hero.primaryCta')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            
            {/* Secondary CTA - Register */}
            <Link href="/auth/register">
              <Button 
                size="lg" 
                variant="outline"
                className="gap-3 border-2 border-eddura-500 dark:border-eddura-400 text-eddura-600 dark:text-eddura-300 hover:bg-eddura-500 hover:text-white hover:border-eddura-500 dark:hover:bg-eddura-400 dark:hover:text-white dark:hover:border-eddura-400 transition-all duration-300 rounded-xl px-8 py-4 text-lg font-semibold bg-white/80 dark:bg-eddura-800/80 backdrop-blur-sm"
              >
                <Users className="w-5 h-5" />
                {t('hero.secondaryCta')}
              </Button>
            </Link>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
          >
            <div className="flex items-center gap-2 text-eddura-600 dark:text-eddura-400">
              <CheckCircle className="w-5 h-5 text-eddura-500 dark:text-eddura-400" />
              <span className="text-sm font-medium">{t('hero.trust.personalizedFast')}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-eddura-200 dark:bg-eddura-700" />
            <div className="flex items-center gap-2 text-eddura-600 dark:text-eddura-400">
              <ThemeAwareLogo size="md" className="text-eddura-500 dark:text-eddura-400" />
              <span className="text-sm font-medium">{t('hero.trust.noRegistration')}</span>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1.0 }}
          >
            <p className="text-sm text-eddura-500 dark:text-eddura-400 mb-4 font-medium">{t('hero.trust.worldwide')}</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              {/* Placeholder for partner logos */}
              <div className="w-24 h-8 bg-eddura-200 dark:bg-eddura-700 rounded animate-pulse" />
              <div className="w-20 h-8 bg-eddura-200 dark:bg-eddura-700 rounded animate-pulse" />
              <div className="w-28 h-8 bg-eddura-200 dark:bg-eddura-700 rounded animate-pulse" />
              <div className="w-24 h-8 bg-eddura-200 dark:bg-eddura-700 rounded animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Hero; 