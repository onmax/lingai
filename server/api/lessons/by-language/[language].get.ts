import { eq } from 'drizzle-orm'
import { object, parse, picklist } from 'valibot'

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
      language: picklist(['spanish', 'french', 'german', 'italian', 'portuguese'], 'Supported languages: spanish, french, german, italian, portuguese'),
    })
    const { language } = await getValidatedRouterParams(event, data => parse(paramsSchema, data))

    const db = useDrizzle()

    // Fetch lessons for this user and language
    const rawLessons = await db.select()
      .from(tables.lessons)
      .where(eq(tables.lessons.userId, user.id))
      .orderBy(tables.lessons.lessonNumber)
      .all()

    // Parse and format lessons
    const lessons = rawLessons
      .filter(lesson => lesson.targetLanguage === language)
      .map(lesson => ({
        ...lesson,
        topics: JSON.parse(lesson.topics || '[]'),
        createdAt: new Date(lesson.createdAt),
        updatedAt: new Date(lesson.updatedAt),
      }))

    return {
      success: true,
      lessons,
      language,
      count: lessons.length,
    }
  }
  catch (error: any) {
    consola.error('Error fetching lessons:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch lessons: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
