import { retryFailedComicImageGeneration } from '../../utils/ai/lessons'

export default defineEventHandler(async (event) => {
  try {
    const { lessonId } = await readBody(event)

    // Retry failed comic image generation
    await retryFailedComicImageGeneration(lessonId)

    return {
      success: true,
      message: lessonId
        ? `Comic image retry completed for lesson ${lessonId}`
        : 'Comic image retry completed for all failed lessons',
    }
  }
  catch (error) {
    consola.error('Error retrying comic image generation:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to retry comic image generation: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}) 
