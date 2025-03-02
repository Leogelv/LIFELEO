export interface Note {
  id: string
  telegram_id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  tags: string[]
  importance: number
  urgency: number
  category: NoteCategory
  is_analyzed: boolean
  analysis: NoteAnalysis | null
}

export type NoteCategory = 'work' | 'personal' | 'ideas' | 'learning' | 'health' | 'general'

export interface NoteAnalysis {
  tags: string[]
  importance: number
  urgency: number
  category: NoteCategory
  summary: string
  key_points?: string[]
  related_notes?: string[]
  action_items?: string[]
}

export interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onAnalyze: (id: string) => void
}

export interface EditNoteModalProps {
  note: Note | null
  onClose: () => void
  onSave: (note: Note) => void
}

export interface NoteListProps {
  initialNotes: Note[]
  onNotesChange?: (notes: Note[]) => void
} 