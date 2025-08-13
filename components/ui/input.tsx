import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-eddura-200 bg-white px-3 py-2 text-sm text-eddura-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-eddura-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eddura-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out hover:border-eddura-300 focus:border-eddura-500 dark:border-[var(--eddura-primary-700)] dark:bg-[var(--eddura-primary-800)] dark:text-white dark:placeholder:text-[var(--eddura-primary-300)] dark:ring-offset-[var(--eddura-primary-900)]",
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
