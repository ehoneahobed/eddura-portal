'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeAwareLogo } from '@/components/ui/logo';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface ResponsiveNavProps {
  items: NavItem[];
  className?: string;
  showThemeToggle?: boolean;
  rightContent?: React.ReactNode;
}

export function ResponsiveNav({ 
  items, 
  className, 
  showThemeToggle = true, 
  rightContent 
}: ResponsiveNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 dark:bg-eddura-900/95 backdrop-blur-xl shadow-lg border-b border-eddura-100 dark:border-eddura-800'
            : 'bg-transparent',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <ThemeAwareLogo size="nav" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {items.map((item, index) => (
                <NavItemDesktop key={index} item={item} />
              ))}
            </div>

            {/* Right Content */}
            <div className="flex items-center space-x-4">
              {showThemeToggle && <ThemeToggle />}
              {rightContent}
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-eddura-900 shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-eddura-100 dark:border-eddura-800">
                  <ThemeAwareLogo size="lg" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-6">
                  <div className="space-y-2 px-6">
                    {items.map((item, index) => (
                      <NavItemMobile 
                        key={index} 
                        item={item} 
                        onClose={() => setIsOpen(false)} 
                      />
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-eddura-100 dark:border-eddura-800">
                  {showThemeToggle && (
                    <div className="flex justify-center">
                      <ThemeToggle />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItemDesktop({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false);

  if (item.children) {
    return (
      <div className="relative group">
        <button
          className="flex items-center space-x-1 text-eddura-700 dark:text-eddura-300 hover:text-eddura-500 dark:hover:text-eddura-100 transition-colors font-medium"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <span>{item.label}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-eddura-800 rounded-xl shadow-xl border border-eddura-100 dark:border-eddura-700 py-2"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              {item.children.map((child, index) => (
                <a
                  key={index}
                  href={child.href}
                  className="block px-4 py-2 text-sm text-eddura-700 dark:text-eddura-300 hover:bg-eddura-50 dark:hover:bg-eddura-700 hover:text-eddura-900 dark:hover:text-white transition-colors"
                >
                  {child.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <a
      href={item.href}
      className="text-eddura-700 dark:text-eddura-300 hover:text-eddura-500 dark:hover:text-eddura-100 transition-colors font-medium"
    >
      {item.label}
    </a>
  );
}

function NavItemMobile({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  if (item.children) {
    return (
      <div>
        <button
          className="flex items-center justify-between w-full px-4 py-3 text-left text-eddura-700 dark:text-eddura-300 hover:bg-eddura-50 dark:hover:bg-eddura-800 rounded-lg transition-colors font-medium"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{item.label}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pl-4 py-2 space-y-1">
                {item.children.map((child, index) => (
                  <a
                    key={index}
                    href={child.href}
                    className="block px-4 py-2 text-sm text-eddura-600 dark:text-eddura-400 hover:bg-eddura-50 dark:hover:bg-eddura-800 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <a
      href={item.href}
      className="block px-4 py-3 text-eddura-700 dark:text-eddura-300 hover:bg-eddura-50 dark:hover:bg-eddura-800 rounded-lg transition-colors font-medium"
      onClick={onClose}
    >
      {item.label}
    </a>
  );
}