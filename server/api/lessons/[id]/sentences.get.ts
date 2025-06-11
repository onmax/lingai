import { and, eq } from 'drizzle-orm'

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

    const lessonId = getRouterParam(event, 'id')
    if (!lessonId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lesson ID is required',
      })
    }

    const db = useDrizzle()

    // Fetch lesson
    const lesson = await db.select()
      .from(tables.lessons)
      .where(and(
        eq(tables.lessons.id, Number.parseInt(lessonId)),
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
      description: lesson.description || undefined,
      topics: JSON.parse(lesson.topics || '[]'),
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
    console.error('Error fetching lesson sentences:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch lesson sentences: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
