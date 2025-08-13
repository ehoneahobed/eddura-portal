import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-eddura-100 bg-white text-eddura-900 shadow-sm transition-all duration-200 ease-in-out hover:shadow-eddura-lg hover:border-eddura-200 dark:bg-[var(--eddura-primary-900)] dark:text-eddura-100 dark:border-[var(--eddura-primary-800)] dark:hover:border-[var(--eddura-primary-700)]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-eddura-900 dark:text-eddura-100",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-eddura-600", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Eddura-specific card variants
const CardEddura = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'elevated' | 'subtle' | 'accent'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: "border-eddura-100 bg-white shadow-sm hover:shadow-eddura-lg hover:border-eddura-200 dark:bg-[var(--eddura-primary-900)] dark:text-eddura-100 dark:border-[var(--eddura-primary-800)] dark:hover:border-[var(--eddura-primary-700)]",
    elevated: "border-eddura-200 bg-white shadow-eddura hover:shadow-eddura-xl hover:border-eddura-300 dark:bg-[var(--eddura-primary-900)] dark:text-eddura-100 dark:border-[var(--eddura-primary-700)] dark:hover:border-[var(--eddura-primary-600)]",
    subtle: "border-eddura-50 bg-eddura-50 shadow-sm hover:shadow-eddura hover:border-eddura-100 dark:border-eddura-800 dark:bg-eddura-900 dark:hover:border-eddura-700",
    accent: "border-eddura-200 bg-eddura-100 shadow-sm hover:shadow-eddura-lg hover:border-eddura-300 dark:bg-eddura-900 dark:text-eddura-100 dark:border-eddura-700 dark:hover:border-eddura-600"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl transition-all duration-200 ease-in-out transform hover:-translate-y-1",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})
CardEddura.displayName = "CardEddura"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardEddura }
