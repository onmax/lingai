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

    const query = getQuery(event)
    const language = query.language as string || 'spanish'

    const db = useDrizzle()

    // Fetch lessons for this user and language
    const rawLessons = await db.select()
      .from(tables.lessons)
      .where(eq(tables.lessons.userId, user.id))
      .orderBy(tables.lessons.lessonNumber)
      .all()

    // Parse and format lessons
    const lessons = rawLessons
      .filter(lesson => lesson.targetLanguage === language.toLowerCase())
      .map(lesson => ({
        ...lesson,
        description: lesson.description || undefined,
        topics: JSON.parse(lesson.topics || '[]'),
        createdAt: new Date(lesson.createdAt),
        updatedAt: new Date(lesson.updatedAt),
      }))

    return {
      success: true,
      lessons,
      total: lessons.length,
      language,
    }
  }
  catch (error) {
    console.error('Error fetching lessons:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch lessons: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
