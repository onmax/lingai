import { retryFailedAudioGeneration } from '../../utils/ai/lessons'

export default defineEventHandler(async (event) => {
  try {
    const { lessonId } = await readBody(event)

    // Retry failed audio generation
    await retryFailedAudioGeneration(lessonId)

    return {
      success: true,
      message: lessonId
        ? `Audio retry completed for lesson ${lessonId}`
        : 'Audio retry completed for all failed sentences',
    }
  }
  catch (error) {
    consola.error('Error retrying audio generation:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to retry audio generation: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
