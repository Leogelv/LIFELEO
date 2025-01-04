export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      meditation_sessions: {
        Row: {
          uuid: string
          user_id: string
          date: string
          type: string
          duration: number
          completed: boolean
          created_at: string
          time_left?: number
        }
        Insert: {
          uuid?: string
          user_id: string
          date: string
          type: string
          duration: number
          completed: boolean
          created_at?: string
          time_left?: number
        }
        Update: {
          uuid?: string
          user_id?: string
          date?: string
          type?: string
          duration?: number
          completed?: boolean
          created_at?: string
          time_left?: number
        }
      }
    }
  }
} 