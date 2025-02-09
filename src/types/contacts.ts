export interface ContactAnalysis {
  summary: string
  topics: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  actionItems: string[]
  participants: {
    roles: string[]
    interests: string[]
    communicationStyle: string[]
  }
  context: {
    type: string
    mainGoal: string
    technologies: string[]
  }
  psychologicalAspects: {
    values: string[]
    motivations: string[]
    mood: string
  }
  businessAnalysis: {
    strengths: string[]
    risks: string[]
    recommendations: string[]
  }
  conclusions: {
    achieved: string[]
    pending: string[]
    nextSteps: string[]
  }
}

export interface Contact {
  id?: number
  user_id: number
  first_name: string
  last_name: string
  username: string
  last_message?: string
  is_pinned?: boolean
  is_group?: boolean
  members_count?: number
  unread_count?: number
  last_message_date?: string
  history?: {
    raw: {
      messages: Array<{
        text: string
        date: string
        from_user: boolean
      }>
    }
    analysis?: ContactAnalysis
  }
  summary?: ContactAnalysis
} 