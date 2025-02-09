import { Wave } from '../animations/Wave'
import { MeditationOrb } from '../animations/MeditationOrb'

export const categoryConfig = {
  water: {
    colors: ['rgba(59, 130, 246, 0.2)', 'rgba(34, 211, 238, 0.2)'],
    border: 'border-blue-400/30',
    text: 'text-blue-400',
    icon: 'solar:glass-water-bold',
    animation: Wave,
    unit: 'мл',
    defaultTarget: 2000
  },
  meditation: {
    colors: ['rgba(168, 85, 247, 0.2)', 'rgba(217, 70, 239, 0.2)'],
    border: 'border-purple-400/30',
    text: 'text-purple-400',
    icon: 'solar:meditation-bold',
    animation: MeditationOrb,
    unit: 'мин',
    defaultTarget: 60
  },
  sport: {
    colors: ['rgba(16, 185, 129, 0.2)', 'rgba(20, 184, 166, 0.2)'],
    border: 'border-emerald-400/30',
    text: 'text-emerald-400',
    icon: 'solar:running-round-bold',
    unit: 'мин',
    defaultTarget: 30
  },
  breathing: {
    colors: ['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)'],
    border: 'border-green-400/30',
    text: 'text-green-400',
    icon: 'solar:breathing-bold',
    unit: 'мин',
    defaultTarget: 10
  }
} as const

export type HabitCategory = keyof typeof categoryConfig 