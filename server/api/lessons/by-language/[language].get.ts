import { eq } from 'drizzle-orm'

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

    const db = useDrizzle()

    // Fetch Spanish lessons for this user
    const rawLessons = await db.select()
      .from(tables.lessons)
      .where(eq(tables.lessons.userId, user.id))
      .orderBy(tables.lessons.lessonNumber)
      .all()

    // Parse and format lessons (only Spanish lessons)
    const lessons = rawLessons
      .filter(lesson => lesson.targetLanguage === 'spanish')
      .map(lesson => ({
        ...lesson,
        topics: JSON.parse(lesson.topics || '[]'),
        createdAt: new Date(lesson.createdAt),
        updatedAt: new Date(lesson.updatedAt),
      }))

    return {
      success: true,
      lessons,
      count: lessons.length,
    }
  }
  catch (error: any) {
    consola.error('Error fetching Spanish lessons:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch Spanish lessons',
    })
  }
})
