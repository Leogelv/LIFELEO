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
      sport_sessions: {
        Row: {
          uuid: string
          user_id: string
          date: string
          type: string
          duration: number
          completed: boolean
          created_at: string
        }
        Insert: {
          uuid?: string
          user_id: string
          date: string
          type: string
          duration: number
          completed: boolean
          created_at?: string
        }
        Update: {
          uuid?: string
          user_id?: string
          date?: string
          type?: string
          duration?: number
          completed?: boolean
          created_at?: string
        }
      }
      water_sessions: {
        Row: {
          uuid: string
          user_id: string
          date: string
          water_amount: number
          created_at: string
        }
        Insert: {
          uuid?: string
          user_id: string
          date: string
          water_amount: number
          created_at?: string
        }
        Update: {
          uuid?: string
          user_id?: string
          date?: string
          water_amount?: number
          created_at?: string
        }
      }
      sleep_sessions: {
        Row: {
          uuid: string
          user_id: string
          date: string
          sleep_time: string
          wake_time: string
          quality: number
          created_at: string
        }
        Insert: {
          uuid?: string
          user_id: string
          date: string
          sleep_time: string
          wake_time: string
          quality: number
          created_at?: string
        }
        Update: {
          uuid?: string
          user_id?: string
          date?: string
          sleep_time?: string
          wake_time?: string
          quality?: number
          created_at?: string
        }
      }
    }
  }
} 