import { Wave } from '../animations/Wave'
import { MeditationOrb } from '../animations/MeditationOrb'

export const categoryConfig = {
  water: {
    gradient: 'from-blue-500/20 via-blue-400/20 to-cyan-400/20',
    border: 'border-blue-400/30',
    text: 'text-blue-400',
    icon: 'solar:glass-water-bold',
    animation: Wave,
    unit: 'мл',
    defaultTarget: 2000
  },
  meditation: {
    gradient: 'from-purple-500/20 via-purple-400/20 to-fuchsia-400/20',
    border: 'border-purple-400/30',
    text: 'text-purple-400',
    icon: 'solar:meditation-bold',
    animation: MeditationOrb,
    unit: 'мин',
    defaultTarget: 60
  },
  sport: {
    gradient: 'from-emerald-500/20 via-emerald-400/20 to-teal-400/20',
    border: 'border-emerald-400/30',
    text: 'text-emerald-400',
    icon: 'solar:running-round-bold',
    unit: 'мин',
    defaultTarget: 30
  },
  breathing: {
    gradient: 'from-green-500/20 via-green-400/20 to-emerald-400/20',
    border: 'border-green-400/30',
    text: 'text-green-400',
    icon: 'solar:breathing-bold',
    unit: 'мин',
    defaultTarget: 10
  }
} as const

export type HabitCategory = keyof typeof categoryConfig 