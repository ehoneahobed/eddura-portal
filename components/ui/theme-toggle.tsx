'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative w-10 h-10 p-0 rounded-xl border border-eddura-200 dark:border-eddura-700 bg-white dark:bg-eddura-800 hover:bg-eddura-50 dark:hover:bg-eddura-700 transition-all duration-300"
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === 'light' ? (
          <Sun className="h-5 w-5 text-eddura-600 dark:text-eddura-400" />
        ) : (
          <Moon className="h-5 w-5 text-eddura-600 dark:text-eddura-400" />
        )}
      </motion.div>
    </Button>
  );
}

export function ThemeToggleLarge() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={toggleTheme}
      className="relative px-6 py-3 rounded-xl border-2 border-eddura-200 dark:border-eddura-700 bg-white dark:bg-eddura-800 hover:bg-eddura-50 dark:hover:bg-eddura-700 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <motion.div
        className="flex items-center space-x-2"
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === 'light' ? (
          <>
            <Sun className="h-5 w-5 text-eddura-600 dark:text-eddura-400" />
            <span className="text-eddura-700 dark:text-eddura-300 font-medium">Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="h-5 w-5 text-eddura-600 dark:text-eddura-400" />
            <span className="text-eddura-700 dark:text-eddura-300 font-medium">Dark Mode</span>
          </>
        )}
      </motion.div>
    </Button>
  );
}
