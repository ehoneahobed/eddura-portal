import * as React from "react"
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils"
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant = 'default',
    inputSize = 'md',
    error,
    success,
    leftIcon,
    rightIcon,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base'
    };

    const variantClasses = {
      default: 'border border-eddura-200 dark:border-eddura-600 bg-white dark:bg-eddura-800',
      filled: 'border-0 bg-eddura-50 dark:bg-eddura-700',
      outlined: 'border-2 border-eddura-200 dark:border-eddura-600 bg-transparent'
    };

    const stateClasses = error 
      ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
      : success
      ? 'border-green-500 dark:border-green-400 focus:ring-green-500 dark:focus:ring-green-400'
      : 'focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400';

    if (leftIcon || rightIcon || isPassword || error || success) {
      return (
        <div className="relative">
          <div className="relative">
            {leftIcon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eddura-400 dark:text-eddura-500">
                {leftIcon}
              </div>
            )}
            
            <input
              type={inputType}
              className={cn(
                'flex w-full rounded-lg text-eddura-900 dark:text-eddura-100 placeholder:text-eddura-500 dark:placeholder:text-eddura-400 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-eddura-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out hover:border-eddura-300 dark:hover:border-eddura-500 ring-offset-white dark:ring-offset-eddura-900 file:border-0 file:bg-transparent file:text-sm file:font-medium',
                sizeClasses[inputSize],
                variantClasses[variant],
                stateClasses,
                leftIcon && 'pl-10',
                (rightIcon || isPassword) && 'pr-10',
                className
              )}
              ref={ref}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...props}
            />

            {(rightIcon || isPassword || error || success) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {error && (
                  <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                )}
                {success && !error && (
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                )}
                {isPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-eddura-400 dark:text-eddura-500 hover:text-eddura-600 dark:hover:text-eddura-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                )}
                {rightIcon && !isPassword && !error && !success && rightIcon}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.p>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-eddura-200 dark:border-eddura-600 bg-white dark:bg-eddura-800 px-3 py-2 text-sm text-eddura-900 dark:text-eddura-100 ring-offset-white dark:ring-offset-eddura-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-eddura-400 dark:placeholder:text-eddura-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eddura-500 dark:focus-visible:ring-eddura-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out hover:border-eddura-300 dark:hover:border-eddura-500 focus:border-eddura-500 dark:focus:border-eddura-400",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Eddura-specific input variants
const InputEddura = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    variant?: 'default' | 'success' | 'error' | 'warning'
    size?: 'sm' | 'md' | 'lg'
  }
>(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  const variantClasses = {
    default: "border-eddura-200 focus:ring-eddura-500 focus:border-eddura-500",
    success: "border-success focus:ring-success focus:border-success",
    error: "border-error focus:ring-error focus:border-error",
    warning: "border-warning focus:ring-warning focus:border-warning"
  }

  const sizeClasses = {
    sm: "h-8 px-2 py-1 text-xs",
    md: "h-10 px-3 py-2 text-sm",
    lg: "h-12 px-4 py-3 text-base"
  }

  return (
    <input
      className={cn(
        "flex w-full rounded-lg bg-white text-eddura-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-eddura-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out hover:border-eddura-300 dark:bg-[var(--eddura-primary-800)] dark:text-white dark:ring-offset-[var(--eddura-primary-900)] dark:placeholder:text-[var(--eddura-primary-300)]",
        variantClasses[variant],
        sizeClasses[size as keyof typeof sizeClasses],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
InputEddura.displayName = "InputEddura"

export { Input, InputEddura }
