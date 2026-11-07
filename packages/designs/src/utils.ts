/*
 * cn(): join class names and let later Tailwind classes win.
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge conditional class names and resolve conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
