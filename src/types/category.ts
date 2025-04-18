// src/types/category.ts
export interface Category {
  id: number // В БД тип integer
  name: string
  description?: string
  color?: string
  icon?: string
} 