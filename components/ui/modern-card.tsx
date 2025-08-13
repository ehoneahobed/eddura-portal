'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight, ExternalLink } from 'lucide-react';

interface ModernCardProps extends React.ComponentProps<typeof motion.div> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient' | 'glass';
  hover?: 'lift' | 'glow' | 'scale' | 'none';
  interactive?: boolean;
  loading?: boolean;
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ 
    className, 
    variant = 'default', 
    hover = 'lift', 
    interactive = false,
    loading = false,
    children,
    ...props 
  }, ref) => {
    const variantClasses = {
      default: 'bg-white dark:bg-eddura-800 border border-eddura-100 dark:border-eddura-700 shadow-sm',
      elevated: 'bg-white dark:bg-eddura-800 border border-eddura-100 dark:border-eddura-700 shadow-eddura',
      outlined: 'bg-transparent border-2 border-eddura-200 dark:border-eddura-600',
      gradient: 'bg-gradient-to-br from-eddura-50 to-white dark:from-eddura-800 dark:to-eddura-900 border border-eddura-100 dark:border-eddura-700',
      glass: 'bg-white/80 dark:bg-eddura-800/80 backdrop-blur-xl border border-eddura-100/50 dark:border-eddura-700/50'
    };

    const hoverClasses = {
      lift: 'hover:-translate-y-2 hover:shadow-eddura-lg',
      glow: 'hover:shadow-eddura-xl hover:ring-1 hover:ring-eddura-200 dark:hover:ring-eddura-600',
      scale: 'hover:scale-[1.02]',
      none: ''
    };

    const baseClasses = cn(
      'rounded-xl transition-all duration-300 ease-out',
      variantClasses[variant],
      hoverClasses[hover],
      interactive && 'cursor-pointer',
      loading && 'animate-pulse',
      className
    );

    if (loading) {
      return (
        <motion.div ref={ref} className={baseClasses} {...props}>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-eddura-200 dark:bg-eddura-600 rounded animate-pulse"></div>
            <div className="h-4 bg-eddura-200 dark:bg-eddura-600 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-eddura-200 dark:bg-eddura-600 rounded w-1/2 animate-pulse"></div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        whileHover={hover === 'scale' ? { scale: 1.02 } : undefined}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ModernCard.displayName = 'ModernCard';

const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
    {...props}
  />
));
ModernCardHeader.displayName = 'ModernCardHeader';

const ModernCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }
>(({ className, as: Component = 'h3', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-none tracking-tight text-eddura-900 dark:text-eddura-100',
      className
    )}
    {...props}
  />
));
ModernCardTitle.displayName = 'ModernCardTitle';

const ModernCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-eddura-600 dark:text-eddura-400 leading-relaxed', className)}
    {...props}
  />
));
ModernCardDescription.displayName = 'ModernCardDescription';

const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
ModernCardContent.displayName = 'ModernCardContent';

const ModernCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
ModernCardFooter.displayName = 'ModernCardFooter';

// Specialized card variants
interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: FeatureCardProps) {
  return (
    <ModernCard 
      variant="elevated" 
      hover="lift" 
      interactive={!!action}
      className={cn('group', className)}
    >
      <ModernCardHeader>
        {icon && (
          <div className="w-12 h-12 bg-eddura-100 dark:bg-eddura-700 rounded-lg flex items-center justify-center mb-4 group-hover:bg-eddura-200 dark:group-hover:bg-eddura-600 transition-colors">
            {icon}
          </div>
        )}
        <ModernCardTitle>{title}</ModernCardTitle>
        <ModernCardDescription>{description}</ModernCardDescription>
      </ModernCardHeader>
      
      {action && (
        <ModernCardFooter>
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center text-sm font-medium text-eddura-600 dark:text-eddura-400 hover:text-eddura-500 dark:hover:text-eddura-300 transition-colors group-hover:translate-x-1"
            >
              {action.label}
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center text-sm font-medium text-eddura-600 dark:text-eddura-400 hover:text-eddura-500 dark:hover:text-eddura-300 transition-colors group-hover:translate-x-1"
            >
              {action.label}
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          )}
        </ModernCardFooter>
      )}
    </ModernCard>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  change, 
  icon, 
  className 
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-eddura-600 dark:text-eddura-400'
  };

  return (
    <ModernCard variant="elevated" hover="glow" className={className}>
      <ModernCardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-eddura-600 dark:text-eddura-400 mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-eddura-900 dark:text-eddura-100">
              {value}
            </p>
            {change && (
              <p className={cn('text-xs mt-1', trendColors[change.trend])}>
                {change.value}
              </p>
            )}
          </div>
          {icon && (
            <div className="w-12 h-12 bg-eddura-100 dark:bg-eddura-700 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
}

interface LinkCardProps {
  title: string;
  description?: string;
  href: string;
  external?: boolean;
  className?: string;
}

export function LinkCard({ 
  title, 
  description, 
  href, 
  external = false, 
  className 
}: LinkCardProps) {
  const Component = external ? 'a' : 'a';
  const linkProps = external 
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { href };

  return (
    <Component {...linkProps}>
      <ModernCard 
        variant="outlined" 
        hover="lift" 
        interactive
        className={cn('group', className)}
      >
        <ModernCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-eddura-900 dark:text-eddura-100 group-hover:text-eddura-600 dark:group-hover:text-eddura-300 transition-colors">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-eddura-600 dark:text-eddura-400 mt-1">
                  {description}
                </p>
              )}
            </div>
            <div className="ml-4 opacity-60 group-hover:opacity-100 transition-opacity">
              {external ? (
                <ExternalLink className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </Component>
  );
}

export {
  ModernCard,
  ModernCardHeader,
  ModernCardFooter,
  ModernCardTitle,
  ModernCardDescription,
  ModernCardContent,
};