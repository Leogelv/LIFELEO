export type HabitCategory = 'water' | 'meditation' | 'sport' | 'breathing' | 'business'

interface CategoryConfig {
  icon: string
  text: string
  unit: string
  colors: string[]
  gradient: string
  bg: string
  bgComplete: string
}

export const categoryConfig: Record<HabitCategory, CategoryConfig> = {
  water: {
    icon: 'mdi:water',
    text: 'text-blue-400',
    unit: 'мл',
    colors: ['#60A5FA', '#3B82F6'],
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500',
    bgComplete: 'bg-blue-400'
  },
  meditation: {
    icon: 'mdi:meditation',
    text: 'text-purple-400',
    unit: 'мин',
    colors: ['#C084FC', '#A855F7'],
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-500',
    bgComplete: 'bg-purple-400'
  },
  sport: {
    icon: 'mdi:dumbbell',
    text: 'text-green-400',
    unit: 'мин',
    colors: ['#4ADE80', '#22C55E'],
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-500',
    bgComplete: 'bg-green-400'
  },
  breathing: {
    icon: 'mdi:weather-windy',
    text: 'text-cyan-400',
    unit: 'мин',
    colors: ['#22D3EE', '#06B6D4'],
    gradient: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-500',
    bgComplete: 'bg-cyan-400'
  },
  business: {
    icon: 'mdi:briefcase',
    text: 'text-amber-400',
    unit: 'мин',
    colors: ['#FBBF24', '#F59E0B'],
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-500',
    bgComplete: 'bg-amber-400'
  }
} 