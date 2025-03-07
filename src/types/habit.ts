import { HabitCategory } from '@/app/components/habits/config/categoryConfig'

export interface Habit {
  id: string
  name: string
  telegram_id: number
  category: HabitCategory
  target_value: number
  created_at: string
  active: boolean
  current_value?: number
  progress?: number
  repeat_type?: 'daily' | 'weekly' | 'monthly'
  repeat_interval?: number
  repeat_days?: number[]
  repeat_months?: number[]
  repeat_until?: string
  repeat_ends?: string
  updated_at?: string
  notes?: string
  tags?: string[]
}

export interface HabitStats {
  total_value: number
  completion_rate: number
  current_streak: number
  average_value: number
  best_streak?: number
  total_completions?: number
  total_days?: number
}

export interface HabitLog {
  id: string
  habit_id: string
  value: number
  date: string
  created_at: string
  notes?: string
}

export interface HabitWithStats extends Habit {
  stats?: HabitStats
  logs?: HabitLog[]
} 