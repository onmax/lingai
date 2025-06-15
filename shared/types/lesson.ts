// Database-based lesson and sentence types

export interface Lesson {
  id: number
  userId: string
  title: string
  targetLanguage: string
  userLanguage: string
  difficulty: string
  topics: string[] // JSON parsed array
  lessonNumber: number
  totalSentences: number
  comicImageUrl?: string
  comicImageGenerated: boolean
  // Recap lesson fields
  isRecapLesson: boolean
  recapMarkdownUrl?: string
  recapGenerated: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Sentence {
  id: number
  lessonId: number
  userId: string
  targetText: string
  userText: string
  audioUrl?: string
  audioGenerated: boolean
  sentenceOrder: number
  context?: string
  difficulty?: string
  tags?: string[] // JSON parsed array
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface LessonWithSentences extends Lesson {
  sentences: Sentence[]
}

export interface LessonApiResponse {
  success: boolean
  lesson: LessonWithSentences
}

export interface LessonsListResponse {
  success: boolean
  lessons: Lesson[]
  total: number
}

export interface SentencesApiResponse {
  success: boolean
  sentences: Sentence[]
  total: number
  lesson: Lesson
}

export interface NextLessonResponse {
  success: boolean
  lesson: Lesson
  sentences: Sentence[]
}
