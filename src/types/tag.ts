// src/types/tag.ts
export interface Tag {
  id: string // uuid в БД
  name: string
}

// Опционально: интерфейс для связи задачи с тегом
export interface TodoTag {
  todo_id: string
  tag_id: string
}

// Опционально: интерфейс для связи привычки с тегом
export interface HabitTag {
  habit_id: string
  tag_id: string
} 