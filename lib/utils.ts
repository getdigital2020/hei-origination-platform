import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility to conditionally join classNames with full Tailwind merge support.
 * Example: cn("px-2", isActive && "bg-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
