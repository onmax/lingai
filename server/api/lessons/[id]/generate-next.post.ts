import { and, eq } from 'drizzle-orm'
import { object, parse, pipe, string, transform } from 'valibot'
import { generateLessons } from '../../../utils/ai/lessons'

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

    // Get current lesson to extract topics and language settings
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
        statusMessage: 'Current lesson not found',
      })
    }

    // Parse topics from current lesson
    const currentTopics = JSON.parse(currentLesson.topics || '[]')

    // Get user profile to get additional topics
    let topics = currentTopics
    try {
      const userProfile = await $fetch('/api/user/profile')
      if (userProfile?.topics?.length) {
        // Combine current lesson topics with user's preferred topics
        const userTopics = userProfile.topics
        topics = [...new Set([...currentTopics, ...userTopics])]
      }
    }
    catch (error) {
      // If we can't get user profile, just use current lesson topics
      consola.warn('Could not fetch user profile for topic enrichment:', error)
    }

    // If no topics found, use defaults
    if (topics.length === 0) {
      topics = ['travel', 'food', 'family', 'work', 'hobbies']
    }

    // Generate next lesson with AI
    const result = await generateLessons({
      topics,
      targetLanguage: currentLesson.targetLanguage,
      userLanguage: currentLesson.userLanguage,
      userId: user.id,
    })

    return {
      success: true,
      message: 'Next lesson generated successfully',
      lesson: result.lesson,
      sentences: result.sentences,
      totalSentences: result.sentences.length,
    }
  }
  catch (error: any) {
    consola.error('Error generating next lesson:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate next lesson: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
