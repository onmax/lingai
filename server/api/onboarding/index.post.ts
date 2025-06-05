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
  const { topics, languages, targetLanguage } = body

  if (!topics || !languages || !targetLanguage) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: topics, languages, targetLanguage',
    })
  }

  const db = useDrizzle()

  try {
    // Start a transaction-like approach using batch
    const operations = []

    // Create or update user profile
    operations.push(
      db.insert(tables.userProfiles)
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
        }),
    )

    // Execute the profile operation first
    await operations[0].run()

    // Delete existing user topics and languages
    await db.delete(tables.userTopics).where(eq(tables.userTopics.userId, user.id)).run()
    await db.delete(tables.userLanguages).where(eq(tables.userLanguages.userId, user.id)).run()

    // Insert new topics
    if (topics.length > 0) {
      const topicValues = topics.map((topic: string) => ({
        userId: user.id,
        topic,
      }))
      await db.insert(tables.userTopics).values(topicValues).run()
    }

    // Insert new languages
    if (languages.length > 0) {
      const languageValues = languages.map((lang: { language: string, level: string }) => ({
        userId: user.id,
        language: lang.language,
        level: lang.level,
      }))
      await db.insert(tables.userLanguages).values(languageValues).run()
    }

    return { success: true, message: 'Onboarding data saved successfully' }
  }
  catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save onboarding data',
    })
  }
})
