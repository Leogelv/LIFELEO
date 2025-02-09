export type HabitCategory = 'water' | 'meditation' | 'sport' | 'breathing'

interface CategoryConfig {
  icon: string
  text: string
  unit: string
  colors: string[]
}

export const categoryConfig: Record<HabitCategory, CategoryConfig> = {
  water: {
    icon: 'mdi:water',
    text: 'text-blue-400',
    unit: 'мл',
    colors: ['#60A5FA', '#3B82F6']
  },
  meditation: {
    icon: 'mdi:meditation',
    text: 'text-purple-400',
    unit: 'мин',
    colors: ['#C084FC', '#A855F7']
  },
  sport: {
    icon: 'mdi:dumbbell',
    text: 'text-green-400',
    unit: 'мин',
    colors: ['#4ADE80', '#22C55E']
  },
  breathing: {
    icon: 'mdi:weather-windy',
    text: 'text-cyan-400',
    unit: 'мин',
    colors: ['#22D3EE', '#06B6D4']
  }
} 