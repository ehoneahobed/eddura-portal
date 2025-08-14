'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Globe, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';
import { languages, Locale } from '@/i18n/config';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'toggle' | 'compact';
  showLabel?: boolean;
  align?: 'start' | 'center' | 'end';
}

export function LanguageSelector({ 
  className, 
  variant = 'dropdown',
  showLabel = true,
  align = 'end'
}: LanguageSelectorProps) {
  const { locale, setLocale, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === locale);

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale !== locale) {
      await setLocale(newLocale);
      setIsOpen(false);
    }
  };

  if (variant === 'toggle') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showLabel && (
          <span className="text-sm text-eddura-600 dark:text-eddura-400 font-medium">
            Language:
          </span>
        )}
        <div className="flex bg-eddura-100 dark:bg-eddura-800 rounded-lg p-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code as Locale)}
              disabled={isLoading}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-eddura-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                locale === language.code
                  ? 'bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 shadow-sm'
                  : 'text-eddura-600 dark:text-eddura-400 hover:text-eddura-900 dark:hover:text-eddura-100'
              )}
              aria-pressed={locale === language.code}
              aria-label={`Switch to ${language.name}`}
            >
              <span className="mr-1">{language.flag}</span>
              {language.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0 hover:bg-eddura-100 dark:hover:bg-eddura-800',
              className
            )}
            disabled={isLoading}
            aria-label={`Current language: ${currentLanguage?.name}. Click to change language`}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-eddura-300 border-t-eddura-600" />
            ) : (
              <span className="text-base">{currentLanguage?.flag}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-40">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code as Locale)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span className="font-medium">{language.nativeName}</span>
              </div>
              {locale === language.code && (
                <Check className="h-4 w-4 text-eddura-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default dropdown variant
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex items-center gap-2 h-10 px-3',
            'border-eddura-300 dark:border-eddura-600',
            'hover:bg-eddura-50 dark:hover:bg-eddura-800',
            'focus:ring-2 focus:ring-eddura-500 focus:ring-offset-2',
            className
          )}
          disabled={isLoading}
          aria-label={`Current language: ${currentLanguage?.name}. Click to change language`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-eddura-300 border-t-eddura-600" />
          ) : (
            <>
              {variant === 'dropdown' && <Globe className="h-4 w-4" />}
              <span className="text-base mr-1">{currentLanguage?.flag}</span>
              {showLabel && (
                <span className="font-medium">{currentLanguage?.nativeName}</span>
              )}
              <ChevronDown 
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )} 
              />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        className="w-48 p-1"
        sideOffset={4}
      >
        <div className="px-2 py-1.5 text-xs font-medium text-eddura-500 dark:text-eddura-400 uppercase tracking-wide">
          Select Language
        </div>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code as Locale)}
            className={cn(
              'flex items-center justify-between cursor-pointer rounded-md px-2 py-2',
              'hover:bg-eddura-50 dark:hover:bg-eddura-800',
              'focus:bg-eddura-50 dark:focus:bg-eddura-800',
              locale === language.code && 'bg-eddura-100 dark:bg-eddura-700'
            )}
            aria-current={locale === language.code ? 'true' : 'false'}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium text-eddura-900 dark:text-eddura-100">
                  {language.nativeName}
                </span>
                <span className="text-xs text-eddura-500 dark:text-eddura-400">
                  {language.name}
                </span>
              </div>
            </div>
            <AnimatePresence>
              {locale === language.code && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check className="h-4 w-4 text-eddura-600 dark:text-eddura-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile-optimized language selector
export function MobileLanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale, isLoading } = useTranslation();

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 px-4">
        <Languages className="h-5 w-5 text-eddura-600 dark:text-eddura-400" />
        <span className="font-medium text-eddura-900 dark:text-eddura-100">
          Language
        </span>
      </div>
      <div className="space-y-1">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => setLocale(language.code as Locale)}
            disabled={isLoading}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 text-left',
              'hover:bg-eddura-50 dark:hover:bg-eddura-800 transition-colors',
              'focus:outline-none focus:bg-eddura-50 dark:focus:bg-eddura-800',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              locale === language.code && 'bg-eddura-100 dark:bg-eddura-700'
            )}
            aria-current={locale === language.code ? 'true' : 'false'}
            aria-label={`Switch to ${language.name}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium text-eddura-900 dark:text-eddura-100">
                  {language.nativeName}
                </span>
                <span className="text-sm text-eddura-500 dark:text-eddura-400">
                  {language.name}
                </span>
              </div>
            </div>
            {locale === language.code && (
              <Check className="h-5 w-5 text-eddura-600 dark:text-eddura-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}