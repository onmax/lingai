import { and, desc, eq, gt, lt } from 'drizzle-orm'
import { object, parse, pipe, string, transform } from 'valibot'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const authRequest = toWebRequest(event)
    const sessionData = await serverAuth().api.getSession(authRequest)
    const user = sessionData?.user

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - login required to access lesson navigation',
      })
    }

    // Validate route parameters
    const paramsSchema = object({
      id: pipe(
        string(),
        transform((input) => {
          const num = Number.parseInt(input, 10)
          if (Number.isNaN(num) || num <= 0) {
            throw new Error('ID must be a positive integer')
          }
          return num
        }),
      ),
    })

    const { id: lessonId } = await getValidatedRouterParams(event, data => parse(paramsSchema, data))

    const db = useDrizzle()

    // Get current lesson
    const currentLesson = await db.select()
      .from(tables.lessons)
      .where(and(
        eq(tables.lessons.id, lessonId),
        eq(tables.lessons.userId, user.id),
      ))
      .get()

    if (!currentLesson) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lesson not found',
      })
    }

    // Get previous lesson (lesson with the highest lessonNumber that's less than current)
    const previousLesson = await db.select()
      .from(tables.lessons)
      .where(and(
        eq(tables.lessons.userId, user.id),
        eq(tables.lessons.targetLanguage, currentLesson.targetLanguage),
        lt(tables.lessons.lessonNumber, currentLesson.lessonNumber)
      ))
      .orderBy(desc(tables.lessons.lessonNumber))
      .limit(1)
      .get()

    // Get next lesson (lesson with the lowest lessonNumber that's greater than current)
    const nextLesson = await db.select()
      .from(tables.lessons)
      .where(and(
        eq(tables.lessons.userId, user.id),
        eq(tables.lessons.targetLanguage, currentLesson.targetLanguage),
        gt(tables.lessons.lessonNumber, currentLesson.lessonNumber)
      ))
      .orderBy(tables.lessons.lessonNumber)
      .limit(1)
      .get()

    return {
      currentLessonId: currentLesson.id,
      currentLessonNumber: currentLesson.lessonNumber,
      hasPrevious: !!previousLesson,
      hasNext: !!nextLesson,
      previousLessonId: previousLesson?.id,
      nextLessonId: nextLesson?.id,
    }
  }
  catch (error: any) {
    consola.error('Error getting lesson navigation:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get lesson navigation: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}) 