import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-eddura-500 text-white hover:bg-eddura-600 focus-visible:ring-eddura-500 shadow-eddura hover:shadow-eddura-lg transform hover:scale-105 active:scale-95',
        destructive:
          'bg-error text-white hover:bg-error-dark focus-visible:ring-error shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
        outline:
          'border-2 border-eddura-500 bg-white text-eddura-700 hover:bg-eddura-50 hover:text-eddura-800 focus-visible:ring-eddura-500 transition-all duration-200 dark:border-eddura-400 dark:bg-eddura-800 dark:text-eddura-100 dark:hover:bg-eddura-700 dark:hover:text-white',
        secondary:
          'bg-eddura-100 text-eddura-700 hover:bg-eddura-200 focus-visible:ring-eddura-500 border border-eddura-200 hover:border-eddura-300 dark:bg-eddura-700 dark:text-eddura-100 dark:hover:bg-eddura-600 dark:border-eddura-600 dark:hover:border-eddura-500',
        ghost: 'text-eddura-600 hover:bg-eddura-50 hover:text-eddura-700 focus-visible:ring-eddura-500 dark:text-eddura-300 dark:hover:bg-eddura-800 dark:hover:text-eddura-100',
        link: 'text-eddura-500 underline-offset-4 hover:underline hover:text-eddura-600',
        accent: 'bg-accent text-white hover:bg-accent-dark focus-visible:ring-accent shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
        success: 'bg-success text-white hover:bg-success-dark focus-visible:ring-success shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
        warning: 'bg-warning text-white hover:bg-warning-dark focus-visible:ring-warning shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 py-2 text-sm',
        lg: 'h-12 px-8 py-3 text-base',
        xl: 'h-14 px-10 py-4 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
