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
        statusMessage: 'Unauthorized - login required to generate next lesson',
      })
    }

    const body = await readBody(event)
    const { currentLessonId } = body

    if (!currentLessonId || typeof currentLessonId !== 'number') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Current lesson ID is required',
      })
    }

    const db = useDrizzle()

    // Get the current lesson to understand context
    const currentLesson = await db.select()
      .from(tables.lessons)
      .where(and(
        eq(tables.lessons.id, currentLessonId),
        eq(tables.lessons.userId, user.id),
      ))
      .get()

    if (!currentLesson) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Current lesson not found',
      })
    }

    // Get user's topics for content generation
    const userTopics = await db.select()
      .from(tables.userTopics)
      .where(eq(tables.userTopics.userId, user.id))
      .all()

    const topics = userTopics.map(t => t.topic)

    if (!topics || topics.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No topics found for user. Complete onboarding first.',
      })
    }

    // Generate the next lesson using the existing generateLessons utility
    const { generateLessons } = await import('../../utils/ai/lessons')

    const lessonResult = await generateLessons({
      topics,
      userId: user.id,
    })

    return {
      success: true,
      lesson: lessonResult.lesson,
      sentences: lessonResult.sentences,
    }
  }
  catch (error: any) {
    consola.error('Error generating next lesson:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate next lesson',
    })
  }
})
