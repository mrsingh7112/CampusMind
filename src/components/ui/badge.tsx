import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" && "bg-blue-100 text-blue-800",
        variant === "secondary" && "bg-gray-100 text-gray-800",
        variant === "destructive" && "bg-red-100 text-red-800",
        variant === "outline" && "border border-gray-300 text-gray-800",
        className
      )}
      {...props}
    />
  )
} 