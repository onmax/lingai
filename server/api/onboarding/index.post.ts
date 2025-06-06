export default eventHandler(async (event) => {
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

  if (!topics || !targetLanguage) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: topics, targetLanguage',
    })
  }

  const db = useDrizzle()

  try {
    // Create or update user profile
    await db.insert(tables.userProfiles)
      .values({
        userId: user.id,
        targetLanguage,
      })
      .onConflictDoUpdate({
        target: tables.userProfiles.userId,
        set: {
          targetLanguage,
          updatedAt: new Date(),
        },
      })
      .run()

    // Delete existing user topics
    await db.delete(tables.userTopics).where(eq(tables.userTopics.userId, user.id)).run()

    // Insert new topics
    if (topics.length > 0) {
      const topicValues = topics.map((topic: string) => ({
        userId: user.id,
        topic,
      }))
      await db.insert(tables.userTopics).values(topicValues).run()
    }

    return {
      success: true,
      message: 'Onboarding completed successfully! Call /api/lessons/generate to create your personalized lessons.',
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
