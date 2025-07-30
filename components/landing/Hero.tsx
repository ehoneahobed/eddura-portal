'use client';

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Brain, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from 'next-intl';

function Hero() {
  const t = useTranslations('landing.hero');
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
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2500); // Increased delay slightly for better readability
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          {/* Quiz Discovery Badge */}
          <div>
            <Link href="/quiz">
              <Button variant="secondary" size="sm" className="gap-4 bg-[#dbebfa] hover:bg-[#007fbd] hover:text-white text-[#00334e] border-[#007fbd]/30 transition-all duration-300">
                <Brain className="w-4 h-4" />
                {t('quizButton')} <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-center font-regular text-[#00334e]">
              {t('title')}
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

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-600 max-w-3xl text-center">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Primary CTA - Start Quiz */}
            <Link href="/quiz">
              <Button size="lg" className="gap-4 bg-[#007fbd] hover:bg-[#004d73] text-white border-0 shadow-2xl hover:shadow-[#007fbd]/25 transition-all duration-300 transform hover:scale-105">
                <Brain className="w-4 h-4" />
                {t('cta')} <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
            {/* Secondary CTA - Register */}
            <Link href="/auth/register">
              <Button size="lg" className="gap-4 border-2 border-[#007fbd] text-[#007fbd] hover:bg-[#007fbd] hover:text-white transition-all duration-300" variant="outline">
                <Users className="w-4 h-4" />
                {t('createAccount')}
              </Button>
            </Link>
          </div>
          
          {/* Additional Info */}
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>🎯 Get personalized recommendations in 10 minutes • 📊 No registration required to start</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero }; 