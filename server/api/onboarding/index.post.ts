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

    // Automatically generate first lesson with AI after onboarding
    // We'll trigger this as a background task to avoid blocking the response
    Promise.resolve().then(async () => {
      try {
        const ai = hubAI()
        const topicsText = topics.join(', ')
        const prompt = `Create a Spanish language learning lesson focused on the topics: ${topicsText}.

The lesson should be formatted as markdown and include:

1. A conversation between two people that naturally incorporates vocabulary related to these topics
2. Vocabulary section with key words and phrases used in the conversation  
3. Grammar notes explaining any important structures used
4. Practice exercises to reinforce the vocabulary and structures
5. Cultural notes about how these topics relate to Spanish-speaking cultures

The lesson should be appropriate for beginner to intermediate Spanish learners.
The conversation should be realistic and practical, something learners might actually encounter.
Include both Spanish text and English translations.

Format the output as valid markdown with proper frontmatter that includes:
- title: A descriptive title in Spanish
- language: "spanish"  
- difficulty: "beginner" or "intermediate"
- topics: array of the topics covered
- order: 1
- description: Brief description of what the lesson covers

Make the content engaging and practical for real-world use.`

        const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt,
          max_tokens: 4096,
        })

        const lessonContent = (response as any)?.output?.generated_text || response
        const firstTopic = topics[0].toLowerCase().replace(/\s+/g, '-')
        const filename = `01.conversation-${firstTopic}.md`
        const blobKey = `lessons/${user.id}/spanish/${filename}`

        await hubBlob().put(blobKey, lessonContent, {
          contentType: 'text/markdown',
        })

        console.warn(`First lesson generated successfully for user ${user.id}`)
      }
      catch (lessonError) {
        console.error(`Failed to generate first lesson for user ${user.id}:`, lessonError)
      }
    })

    return {
      success: true,
      message: 'Onboarding completed successfully! Your first personalized lesson is being generated.',
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
