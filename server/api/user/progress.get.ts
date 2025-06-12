import { and, desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const authRequest = toWebRequest(event)
    const sessionData = await serverAuth().api.getSession(authRequest)
    const user = sessionData?.user

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - login required to access progress',
      })
    }

    const db = useDrizzle()

    // Get user's last lesson progress
    const lastProgress = await db.select({
      lessonId: tables.userSentenceProgress.lessonId,
      lastPracticedAt: tables.userSentenceProgress.lastPracticedAt,
      lessonNumber: tables.lessons.lessonNumber,
    })
      .from(tables.userSentenceProgress)
      .innerJoin(tables.lessons, eq(tables.lessons.id, tables.userSentenceProgress.lessonId))
      .where(and(
        eq(tables.userSentenceProgress.userId, user.id),
        eq(tables.lessons.userId, user.id)
      ))
      .orderBy(desc(tables.userSentenceProgress.lastPracticedAt))
      .limit(1)
      .get()

    if (!lastProgress) {
      // If no progress found, check if user has any lessons and return the first one
      const firstLesson = await db.select({
        id: tables.lessons.id,
        lessonNumber: tables.lessons.lessonNumber,
      })
        .from(tables.lessons)
        .where(eq(tables.lessons.userId, user.id))
        .orderBy(tables.lessons.lessonNumber)
        .limit(1)
        .get()

      if (firstLesson) {
        return {
          success: true,
          progress: {
            lastLessonId: firstLesson.id,
            lastLessonNumber: firstLesson.lessonNumber,
          }
        }
      }

      return {
        success: true,
        progress: null,
      }
    }

    return {
      success: true,
      progress: {
        lastLessonId: lastProgress.lessonId,
        lastLessonNumber: lastProgress.lessonNumber,
      }
    }
  }
  catch (error: any) {
    consola.error('Error getting user progress:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get user progress: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}) 