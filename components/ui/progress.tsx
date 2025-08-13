"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  // Current value of the progress indicator
  value?: number
  // Maximum value of the progress indicator; defaults to 100
  max?: number
  // Optional class override for the inner indicator bar; allows brand theming per usage
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    // Ensure value is a valid number between 0 and max
    const validValue = isNaN(value) || !isFinite(value) ? 0 : Math.max(0, Math.min(max, value))
    const percentage = max > 0 ? (validValue / max) * 100 : 0
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
