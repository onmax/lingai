export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, language, topics, targetLanguage } = body

    if (!userId || !language || !topics || !Array.isArray(topics)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: userId, language, topics (array)',
      })
    }

    // Use AI to generate a conversation-based lesson
    const ai = hubAI()

    // Create a comprehensive prompt for generating a conversational lesson
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

    // Extract the generated content
    const lessonContent = (response as any)?.output?.generated_text || response

    // Generate filename based on first topic
    const firstTopic = topics[0].toLowerCase().replace(/\s+/g, '-')
    const filename = `01.conversation-${firstTopic}.md`

    // Store in blob storage
    const blobKey = `lessons/${userId}/${language}/${filename}`

    await hubBlob().put(blobKey, lessonContent, {
      contentType: 'text/markdown',
    })

    return {
      success: true,
      message: 'AI-generated lesson created successfully',
      filename,
      blobKey,
      topics,
      language: targetLanguage,
      userId,
    }
  }
  catch (error) {
    console.error('AI lesson generation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate AI lesson',
      data: error,
    })
  }
})
