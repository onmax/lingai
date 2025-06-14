import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

export const CourseLessonSchema = z.object({
  lesson_number: z.number().min(1).max(100),
  title: z.string(),
  description: z.string(),
  grammar_points: z.array(z.string()),
  vocabulary_topics: z.array(z.string()),
  communication_goals: z.array(z.string()),
})

export type CourseLesson = z.infer<typeof CourseLessonSchema>

// Validate the JSON content against our schema
const CourseContentSchema = z.array(CourseLessonSchema)

export async function fetchCourseContent(): Promise<CourseLesson[]> {
  try {
    // Get the current file's directory
    const __dirname = fileURLToPath(new URL('.', import.meta.url))
    // Construct path to the JSON file in the public directory
    const jsonPath = join(__dirname, '../../public/course-content.json')

    // Read and parse the JSON file
    const fileContent = readFileSync(jsonPath, 'utf-8')
    const courseContentJson = JSON.parse(fileContent)

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
