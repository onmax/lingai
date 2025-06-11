import { generateLessons } from '../../utils/ai/lessons'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const authRequest = toWebRequest(event)
    const sessionData = await serverAuth().api.getSession(authRequest)
    const user = sessionData?.user

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - login required to generate lessons',
      })
    }

    const body = await readBody(event)
    const { topics, targetLanguage, userLanguage } = body

    if (!topics || !Array.isArray(topics) || !targetLanguage) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: topics (array), targetLanguage',
      })
    }

    // Generate lesson with sentences using AI
    const result = await generateLessons({
      topics,
      targetLanguage: targetLanguage || 'spanish',
      userLanguage: userLanguage || 'english',
      userId: user.id,
    })

    return {
      success: true,
      message: 'AI-generated lesson created successfully',
      lesson: result.lesson,
      sentences: result.sentences,
      totalSentences: result.sentences.length,
    }
  }
  catch (error: any) {
    console.error('AI lesson generation error:', error)

    // Handle specific error types
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `AI lesson generation failed: ${error instanceof Error ? error.message : String(error)}`,
      data: {
        originalError: error.message || error,
        stack: error.stack,
      },
    })
  }
})
