import { Buffer } from 'node:buffer'
import { and, eq } from 'drizzle-orm'
import { object, parse, pipe, string, transform } from 'valibot'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const authRequest = toWebRequest(event)
    const sessionData = await serverAuth().api.getSession(authRequest)
    const user = sessionData?.user

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - login required to generate audio',
      })
    }

    // Validate route parameters
    const paramsSchema = object({
      id: pipe(
        string(),
        transform((input) => {
          const num = Number.parseInt(input, 10)
          if (Number.isNaN(num) || num <= 0) {
            throw new Error('ID must be a positive integer')
          }
          return num
        }),
      ),
    })

    const { id: lessonId } = await getValidatedRouterParams(event, data => parse(paramsSchema, data))

    const db = useDrizzle()

    // Verify lesson exists and belongs to user
    const lesson = await db.select()
      .from(tables.lessons)
      .where(and(
        eq(tables.lessons.id, lessonId),
        eq(tables.lessons.userId, user.id),
      ))
      .get()

    if (!lesson) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lesson not found',
      })
    }

    // Get sentences that don't have audio generated yet
    const sentences = await db.select()
      .from(tables.sentences)
      .where(and(
        eq(tables.sentences.lessonId, lesson.id),
        eq(tables.sentences.userId, user.id),
        eq(tables.sentences.audioGenerated, false),
      ))
      .orderBy(tables.sentences.sentenceOrder)
      .all()

    if (sentences.length === 0) {
      return {
        success: true,
        message: 'All sentences already have audio generated',
        generated: 0,
        total: 0,
      }
    }

    consola.warn(`Generating audio for ${sentences.length} sentences in lesson ${lessonId}`)

    const ai = hubAI()
    let generatedCount = 0

    // Map language codes
    const langCode = lesson.targetLanguage.toLowerCase() === 'spanish'
      ? 'es'
      : lesson.targetLanguage.toLowerCase() === 'english'
        ? 'en'
        : lesson.targetLanguage.toLowerCase().substring(0, 2)

    for (const sentence of sentences) {
      try {
        consola.warn(`Generating audio for sentence ${sentence.id}: "${sentence.targetText}"`)

        const audioResponse = await ai.run('@cf/myshell-ai/melotts', {
          prompt: sentence.targetText,
          lang: langCode,
        })

        // The response contains base64-encoded MP3 audio
        let audioBase64: string
        if (typeof audioResponse === 'object' && audioResponse !== null && 'audio' in audioResponse) {
          audioBase64 = (audioResponse as any).audio
        }
        else if (typeof audioResponse === 'string') {
          audioBase64 = audioResponse
        }
        else {
          throw new TypeError('Unexpected audio response format')
        }

        // Store the audio in blob storage
        const audioBuffer = Buffer.from(audioBase64, 'base64')
        const audioKey = `audio/sentences/${sentence.id}.mp3`

        await hubBlob().put(audioKey, audioBuffer, {
          httpMetadata: {
            contentType: 'audio/mpeg',
          },
        })

        // Update the sentence record
        await db.update(tables.sentences)
          .set({
            audioUrl: `/api/audio/${audioKey}`,
            audioGenerated: true,
            updatedAt: sql`(unixepoch())`,
          })
          .where(eq(tables.sentences.id, sentence.id))

        generatedCount++
        consola.warn(`✅ Audio generated successfully for sentence ${sentence.id}`)

        // Add a small delay between generations
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      catch (error) {
        consola.error(`❌ Failed to generate audio for sentence ${sentence.id}:`, error)
        // Continue with next sentence instead of failing completely
      }
    }

    return {
      success: true,
      message: `Audio generated for ${generatedCount} of ${sentences.length} sentences`,
      generated: generatedCount,
      total: sentences.length,
    }
  }
  catch (error: any) {
    consola.error('Error generating lesson audio:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate lesson audio: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
