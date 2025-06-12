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

    return {
      success: true,
      message: 'Onboarding completed successfully! You can now generate personalized lessons.',
      topics,
      targetLanguage,
      userId: user.id,
    }
  }
  catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save onboarding data',
    })
  }
})
