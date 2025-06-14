import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
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
const CourseContentSchema = z.object({
  lessons: z.array(CourseLessonSchema),
})

// Read and parse the JSON file
const courseContentPath = join(process.cwd(), 'server/data/course-content.json')
const rawContent = readFileSync(courseContentPath, 'utf-8')
let courseContentJson: unknown

try {
  courseContentJson = JSON.parse(rawContent)
}
catch (error) {
  throw new Error(`Failed to parse course content JSON: ${error instanceof Error ? error.message : String(error)}`)
}

// Parse and validate the JSON content
const parsedContent = CourseContentSchema.safeParse(courseContentJson)

if (!parsedContent.success) {
  throw new Error(`Invalid course content format: ${JSON.stringify(parsedContent.error.format(), null, 2)}`)
}

// Export the validated lessons
export const courseContent: CourseLesson[] = parsedContent.data.lessons
