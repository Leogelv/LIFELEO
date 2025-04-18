// src/types/history.ts
export interface HistoryEntry {
  id: string // uuid в БД
  action: string // 'create', 'update', 'delete' и т.д.
  old_data?: Record<string, any> | null // jsonb в БД
  new_data?: Record<string, any> | null // jsonb в БД
  changed_at: string // timestamptz в БД
}

export interface TaskHistoryEntry extends HistoryEntry {
  todo_id: string | null // uuid в БД, может быть null если задача удалена
}

export interface HabitHistoryEntry extends HistoryEntry {
  habit_id: string | null // uuid в БД, может быть null если привычка удалена
} 