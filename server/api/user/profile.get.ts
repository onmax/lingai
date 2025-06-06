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

    // Hardcode language info - user speaks English and learns Spanish
    const languages = [{ language: 'english', level: 'native' }]

    return {
      profile,
      topics: topics.map(t => t.topic),
      languages,
    }
  }
  catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user profile',
    })
  }
})
