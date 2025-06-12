import { and, eq } from 'drizzle-orm'
import { number, object, parse } from 'valibot'

// Validation schema for the request body
const UpdateProgressSchema = object({
  lastLessonId: number('lastLessonId must be a number'),
})

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const authRequest = toWebRequest(event)
    const sessionData = await serverAuth().api.getSession(authRequest)
    const user = sessionData?.user

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - login required to update progress',
      })
    }

    const body = await readBody(event)

    // Validate input
    const { lastLessonId } = parse(UpdateProgressSchema, body)

    const db = useDrizzle()

    // Verify lesson exists and belongs to user
    const lesson = await db.select()
      .from(tables.lessons)
      .where(and(
        eq(tables.lessons.id, lastLessonId),
        eq(tables.lessons.userId, user.id),
      ))
      .get()

    if (!lesson) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lesson not found or does not belong to user',
      })
    }

    // Update or create progress record for each sentence in the lesson
    const sentences = await db.select()
      .from(tables.sentences)
      .where(and(
        eq(tables.sentences.lessonId, lastLessonId),
        eq(tables.sentences.userId, user.id),
      ))
      .all()

    // For each sentence, update or insert progress
    for (const sentence of sentences) {
      const existingProgress = await db.select()
        .from(tables.userSentenceProgress)
        .where(and(
          eq(tables.userSentenceProgress.userId, user.id),
          eq(tables.userSentenceProgress.sentenceId, sentence.id),
        ))
        .get()

      if (existingProgress) {
        // Update existing progress
        await db.update(tables.userSentenceProgress)
          .set({
            lastPracticedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(
            eq(tables.userSentenceProgress.userId, user.id),
            eq(tables.userSentenceProgress.sentenceId, sentence.id),
          ))
      } else {
        // Create new progress record
        await db.insert(tables.userSentenceProgress)
          .values({
            userId: user.id,
            sentenceId: sentence.id,
            lessonId: lastLessonId,
            completed: false,
            practiceCount: 0,
            lastPracticedAt: new Date(),
            masteryLevel: 0,
          })
      }
    }

    return {
      success: true,
      message: 'Progress updated successfully',
      lastLessonId,
    }
  }
  catch (error: any) {
    consola.error('Error updating user progress:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update user progress: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}) 