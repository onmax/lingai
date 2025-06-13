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
    const { topics } = body

    if (!topics || !Array.isArray(topics)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required field: topics (array)',
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
          targetLanguage: 'spanish',
          updatedAt: sql`(unixepoch())`,
        })
        .where(eq(tables.userProfiles.userId, user.id))
    }
    else {
      // Create new profile
      await db.insert(tables.userProfiles).values({
        userId: user.id,
        targetLanguage: 'spanish',
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

    // Automatically generate the first Spanish lesson with audio
    try {
      const lessonResult = await generateLessons({
        topics,
        userId: user.id,
      })

      return {
        success: true,
        message: 'Welcome to LingAI! Your Spanish lesson is ready.',
        topics,
        lesson: {
          id: lessonResult.lesson.id,
          lessonNumber: lessonResult.lesson.lessonNumber,
          title: lessonResult.lesson.title,
        },
      }
    }
    catch (lessonError) {
      consola.error('Failed to generate initial lesson:', lessonError)

      return {
        success: true,
        message: 'Onboarding completed! We\'ll set up your lesson shortly.',
        topics,
        error: 'Failed to generate initial lesson',
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
