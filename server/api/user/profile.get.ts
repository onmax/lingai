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

  const db = useDrizzle()

  try {
    // Get user profile
    const profile = await db.select()
      .from(tables.userProfiles)
      .where(eq(tables.userProfiles.userId, user.id))
      .get()

    // Get user topics
    const topics = await db.select()
      .from(tables.userTopics)
      .where(eq(tables.userTopics.userId, user.id))
      .all()

    // Get user languages
    const languages = await db.select()
      .from(tables.userLanguages)
      .where(eq(tables.userLanguages.userId, user.id))
      .all()

    return {
      profile,
      topics: topics.map(t => t.topic),
      languages: languages.map(l => ({ language: l.language, level: l.level })),
    }
  }
  catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user profile',
    })
  }
})
