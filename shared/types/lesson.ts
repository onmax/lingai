export interface LessonFrontmatter {
  title: string
  language: string
  difficulty: string
  topics?: string | string[]
  description?: string
}

export interface Lesson {
  _id?: string
  _path?: string
  id: string
  filename: string
  lessonNumber: number
  title: string
  language: string
  content: string
  frontmatter: LessonFrontmatter
  blobKey: string
  path: string
}

export interface LessonListItem {
  key: string
  filename: string
  lessonNumber: number
  path: string
}

export interface LessonApiResponse {
  success: boolean
  lesson: Lesson
}

export interface LessonsListResponse {
  success: boolean
  lessons: LessonListItem[]
}

// For the spanish lessons API response
export interface SpanishLessonsResponse {
  success: boolean
  language: string
  lessons: Lesson[]
  total: number
}

// For the keys API response
export interface LessonKeysResponse {
  success: boolean
  keys: LessonListItem[]
  total: number
  language: string
}
