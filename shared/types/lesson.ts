// Database-based lesson and sentence types

export interface Lesson {
  id: number
  userId: string
  title: string
  description?: string
  targetLanguage: string
  userLanguage: string
  difficulty: string
  topics: string[] // JSON parsed array
  lessonNumber: number
  totalSentences: number
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

export interface SentenceProgress {
  id: number
  userId: string
  sentenceId: number
  lessonId: number
  completed: boolean
  practiceCount: number
  lastPracticedAt?: Date
  masteryLevel: number
  createdAt: Date
  updatedAt: Date
}

// File-based lesson types (for blob storage)
export interface FileLessonFrontmatter {
  title?: string
  description?: string
  language?: string
  difficulty?: string
  topics?: string | string[]
}

export interface FileLesson {
  id: string
  filename: string
  lessonNumber: number
  title: string
  language: string
  content: string
  frontmatter: FileLessonFrontmatter
  path: string
  blobKey: string
}

export interface LessonListItem {
  key: string
  filename: string
  lessonNumber: number
  path: string
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

// File-based lesson API responses
export interface SpanishLessonsResponse {
  success: boolean
  language: string
  lessons: FileLesson[]
  total: number
}

export interface LessonKeysResponse {
  success: boolean
  keys: LessonListItem[]
  total: number
  language: string
}

export interface SentencesApiResponse {
  success: boolean
  sentences: Sentence[]
  total: number
  lesson: Lesson
}

// For sentence practice and learning
export interface SentenceWithProgress extends Sentence {
  progress?: SentenceProgress
}

export interface LessonWithProgressSentences extends Lesson {
  sentences: SentenceWithProgress[]
}
