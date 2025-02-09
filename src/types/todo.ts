export interface Todo {
  id: string
  name: string
  done: boolean
  deadline: string
  telegram_id: number
  comment?: string
  notes?: string
  repeat_type?: 'daily' | 'weekly' | 'monthly'
  repeat_interval?: number
  repeat_days?: number[]
  repeat_months?: number[]
  repeat_until?: string
  repeat_ends?: string
  parent_id?: string
  subtasks?: Todo[]
  created_at?: string
  updated_at?: string
  is_habit?: boolean
  category?: string
  tags?: string[]
  contact_id?: string | null
} 