import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to readable string
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format time for medication reminders
export function formatTime(time: string): string {
  // Handle times like "8:00 AM", "After Dinner", etc.
  if (time.includes("After") || time.includes("Before") || time === "Bedtime") {
    return time
  }
  return time
}

// Calculate health score based on various factors
export function calculateHealthScore(
  medicationAdherence: number,
  foodSafetyScore: number,
  emotionalWellness: number
): number {
  return Math.round((medicationAdherence * 0.4 + foodSafetyScore * 0.3 + emotionalWellness * 0.3))
}

// Get risk level color
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel.toLowerCase()) {
    case 'low':
      return 'text-green-400'
    case 'medium':
      return 'text-yellow-400'
    case 'high':
      return 'text-orange-400'
    case 'very high':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

// Get risk level background
export function getRiskLevelBg(riskLevel: string): string {
  switch (riskLevel.toLowerCase()) {
    case 'low':
      return 'bg-green-500/10 border-green-500/20'
    case 'medium':
      return 'bg-yellow-500/10 border-yellow-500/20'
    case 'high':
      return 'bg-orange-500/10 border-orange-500/20'
    case 'very high':
      return 'bg-red-500/10 border-red-500/20'
    default:
      return 'bg-gray-500/10 border-gray-500/20'
  }
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Debounce function for search/input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Generate random ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Check if user is elderly (age >= 60)
export function isElderly(age: number): boolean {
  return age >= 60
}

// Get greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (basic)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
  return phoneRegex.test(phone)
}

// Local storage helpers
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key: string) => {
    localStorage.removeItem(key)
  },
  clear: () => {
    localStorage.clear()
  },
}
