import { array, object, safeParse, string } from 'valibot'
import { generateLessons } from '../../utils/ai/lessons'

// Validation schema for the request body
const GenerateLessonsSchema = object({
  topics: array(string('Topic must be a string'), 'Topics must be an array of strings'),
  targetLanguage: string('Target language is required'),
  userLanguage: string('User language is required'),
})

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

    // Validate input using Valibot
    const { output: validatedData, issues, success } = safeParse(GenerateLessonsSchema, body)
    if (!success || !validatedData) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid request data: ${issues?.map(issue => issue.message).join(', ')}`,
      })
    }

    const { topics, targetLanguage, userLanguage } = validatedData

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
    consola.error('AI lesson generation error:', error)

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
