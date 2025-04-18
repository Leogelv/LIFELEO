import { Category } from './category'
import { Tag } from './tag'

export interface Habit {
  id: string
  name: string
  telegram_id: number
  category_id?: number
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
  values_add?: string     // Строка с числами для кнопок добавления прогресса
  values_del?: string     // Строка с числами для кнопок вычитания прогресса
  measure?: string        // Единица измерения (шт, мл, мин и т.д.)
  related_todos?: string[] // Пока оставляем (uuid[] в БД)
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
  completed_at?: string   // Дата и время выполнения
}

export interface HabitWithDetails extends Habit {
  category?: Category
  tags?: Tag[]
  stats?: HabitStats
  logs?: HabitLog[]
} 