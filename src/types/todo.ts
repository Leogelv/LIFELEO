export interface Todo {
  id: string
  name: string
  done: boolean
  created_at: string
  deadline: string
  telegram_id: number
  notes?: string
  repeat_ends?: string
  category_id?: number
  habit_id?: string
} 