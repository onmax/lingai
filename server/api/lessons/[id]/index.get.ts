import { and, eq } from 'drizzle-orm'
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
        statusMessage: 'Unauthorized - login required to access lessons',
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

    // Fetch lesson
    const lesson = await db.select()
      .from(tables.lessons)
      .where(and(
        eq(tables.lessons.id, lessonId),
        eq(tables.lessons.userId, user.id),
      ))
      .get()

    if (!lesson) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lesson not found',
      })
    }

    // Fetch sentences for this lesson
    const rawSentences = await db.select()
      .from(tables.sentences)
      .where(and(
        eq(tables.sentences.lessonId, lesson.id),
        eq(tables.sentences.userId, user.id),
      ))
      .orderBy(tables.sentences.sentenceOrder)
      .all()

    // Format lesson data
    const lessonData = {
      ...lesson,
      topics: JSON.parse(lesson.topics || '[]'),
      comicImageUrl: lesson.comicImageUrl || undefined,
      createdAt: new Date(lesson.createdAt),
      updatedAt: new Date(lesson.updatedAt),
    }

    // Format sentences data
    const sentences = rawSentences.map(sentence => ({
      ...sentence,
      audioUrl: sentence.audioUrl || undefined,
      context: sentence.context || undefined,
      difficulty: sentence.difficulty || undefined,
      tags: sentence.tags ? JSON.parse(sentence.tags) : undefined,
      createdAt: new Date(sentence.createdAt),
      updatedAt: new Date(sentence.updatedAt),
    }))

    return {
      success: true,
      lesson: {
        ...lessonData,
        sentences,
      },
    }
  }
  catch (error: any) {
    consola.error('Error fetching lesson:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch lesson: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
