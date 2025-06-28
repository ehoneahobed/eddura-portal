'use client';

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
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
          {/* Optional: Consider if a 'launch article' button is still relevant here.
              If not, you can remove this div or replace it with a different highlight.
              For now, keeping it but suggesting a more relevant text. */}
          <div>
            <Button variant="secondary" size="sm" className="gap-4 bg-[#dbebfa] hover:bg-[#007fbd] hover:text-white text-[#00334e] border-[#007fbd]/30 transition-all duration-300">
              Explore Our AI in Action <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-center font-regular text-[#00334e]">
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

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-600 max-w-3xl text-center">
              Eddura is your <strong className="text-[#00334e]">AI-powered command center</strong> for academic success. Centralize documents, get <strong className="text-[#00334e]">personalized program recommendations</strong>, and craft <strong className="text-[#00334e]">winning essays</strong> for every university and scholarship application.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            {/* Removed 'Jump on a call' as it's less common for initial sign-ups in this context. */}
            <Button size="lg" className="gap-4 bg-[#007fbd] hover:bg-[#004d73] text-white border-0 shadow-2xl hover:shadow-[#007fbd]/25 transition-all duration-300 transform hover:scale-105">
              Get Started for Free <MoveRight className="w-4 h-4" />
            </Button>
            {/* Added a secondary CTA for program discovery, aligning with a key feature. */}
            <Button size="lg" className="gap-4 border-2 border-[#007fbd] text-[#007fbd] hover:bg-[#007fbd] hover:text-white transition-all duration-300" variant="outline">
              Find Your Perfect Program
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero }; 