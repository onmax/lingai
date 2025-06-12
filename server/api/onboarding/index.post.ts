export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const authRequest = toWebRequest(event)
    const sessionData = await serverAuth().api.getSession(authRequest)
    const user = sessionData?.user

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    const body = await readBody(event)
    const { topics, targetLanguage } = body

    if (!topics || !Array.isArray(topics) || !targetLanguage) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: topics (array), targetLanguage',
      })
    }

    // Save user preferences to database
    const db = useDrizzle()

    // Check if user profile already exists
    const existingProfile = await db.select()
      .from(tables.userProfiles)
      .where(eq(tables.userProfiles.userId, user.id))
      .get()

    if (existingProfile) {
      // Update existing profile
      await db.update(tables.userProfiles)
        .set({
          targetLanguage: targetLanguage.toLowerCase(),
          updatedAt: sql`(unixepoch())`,
        })
        .where(eq(tables.userProfiles.userId, user.id))
    }
    else {
      // Create new profile
      await db.insert(tables.userProfiles).values({
        userId: user.id,
        targetLanguage: targetLanguage.toLowerCase(),
      })
    }

    // Delete existing user topics
    await db.delete(tables.userTopics).where(eq(tables.userTopics.userId, user.id))

    // Insert new topics
    if (topics.length > 0) {
      const topicValues = topics.map((topic: string) => ({
        userId: user.id,
        topic,
      }))
      await db.insert(tables.userTopics).values(topicValues)
    }

    // Automatically generate the first lesson with audio
    try {
      const { generateLessons } = await import('../../utils/ai/lessons')

      const lessonResult = await generateLessons({
        topics,
        targetLanguage: targetLanguage.toLowerCase(),
        userLanguage: 'english', // Hardcoded for now
        userId: user.id,
      })

      // Return success with lesson information
      return {
        success: true,
        message: 'Welcome to LingAI! Your first lesson is ready.',
        topics,
        targetLanguage,
        userId: user.id,
        lessonGenerated: true,
        lesson: {
          id: lessonResult.lesson.id,
          lessonNumber: lessonResult.lesson.lessonNumber,
          title: lessonResult.lesson.title,
        },
      }
    }
    catch (lessonError) {
      consola.error('Failed to generate initial lesson:', lessonError)

      // Still return success for onboarding, but indicate lesson generation failed
      return {
        success: true,
        message: 'Onboarding completed successfully! We\'ll set up your first lesson shortly.',
        topics,
        targetLanguage,
        userId: user.id,
        lessonGenerated: false,
        error: 'Failed to generate initial lesson, but you can create lessons manually.',
      }
    }
  }
  catch (error) {
    consola.error('Onboarding error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save onboarding data',
    })
  }
})
