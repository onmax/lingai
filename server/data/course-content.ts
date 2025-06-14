import { z } from 'zod'

export const CourseLessonSchema = z.object({
  lesson_number: z.number().min(1).max(100),
  title: z.string(),
  description: z.string(),
  grammar_points: z.array(z.string()),
  vocabulary_topics: z.array(z.string()),
  communication_goals: z.array(z.string()),
  difficulty_level: z.enum(['A1', 'A2', 'B1']),
  difficulty_score: z.number().min(1).max(10),
})

export type CourseLesson = z.infer<typeof CourseLessonSchema>

// Validate the JSON content against our schema
const CourseContentSchema = z.array(CourseLessonSchema)

export async function fetchCourseContent(): Promise<CourseLesson[]> {
  try {
    let courseContentJson: any

    // Check if we're in a server context
    if (import.meta.server) {
      // Server-side: use runtime config
      const config = useRuntimeConfig()
      courseContentJson = config.public.courseContent
    }
    else {
      // Client-side: fetch from public directory
      const response = await fetch('/course-content.json')
      if (!response.ok) {
        throw new Error(`Failed to fetch course content: ${response.statusText}`)
      }
      courseContentJson = await response.json()
    }

    // Parse and validate the JSON content
    const parsedContent = CourseContentSchema.safeParse(courseContentJson)

    if (!parsedContent.success) {
      throw new Error(`Invalid course content format: ${JSON.stringify(parsedContent.error.format(), null, 2)}`)
    }

    return parsedContent.data
  }
  catch (error) {
    throw new Error(`Failed to fetch course content: ${error instanceof Error ? error.message : String(error)}`)
  }
}
