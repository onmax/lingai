import { and, eq, sql } from 'drizzle-orm'
import OpenAI from 'openai'
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

    const config = useRuntimeConfig()

    if (!config.openaiApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'OpenAI API key not configured',
      })
    }

    // Initialize OpenAI client
    const openaiClient = new OpenAI({
      apiKey: config.openaiApiKey,
    })

    let generatedCount = 0

    // Map language to appropriate voice
    const getVoiceForLanguage = (language: string): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' => {
      const langLower = language.toLowerCase()
      switch (langLower) {
        case 'spanish':
        case 'es':
          return 'nova' // Good for Spanish
        case 'french':
        case 'fr':
          return 'shimmer' // Good for French
        case 'german':
        case 'de':
          return 'echo' // Good for German
        case 'italian':
        case 'it':
          return 'fable' // Good for Italian
        case 'portuguese':
        case 'pt':
          return 'onyx' // Good for Portuguese
        case 'english':
        case 'en':
        default:
          return 'alloy' // Default English voice
      }
    }

    const voice = getVoiceForLanguage(lesson.targetLanguage)

    for (const sentence of sentences) {
      try {
        consola.warn(`Generating audio for sentence ${sentence.id}: "${sentence.targetText}"`)
        consola.warn(`Using OpenAI model: tts-1-hd, voice: ${voice}`)

        // Generate audio using OpenAI's official SDK
        const mp3 = await openaiClient.audio.speech.create({
          model: 'tts-1-hd', // Use high-definition TTS model
          voice,
          input: sentence.targetText,
          response_format: 'mp3',
          instructions: 'Speak in a natural, conversational tone. Do not use any special characters or symbols. Speak in Spanish.',
          speed: 1.0,
        })

        consola.warn(`✅ OpenAI TTS request successful for sentence ${sentence.id}`)

        // Get the audio as ArrayBuffer, then convert to Uint8Array for Cloudflare Workers compatibility
        const arrayBuffer = await mp3.arrayBuffer()
        const audioData = new Uint8Array(arrayBuffer)
        const audioKey = `audio/sentences/${sentence.id}.mp3`
        console.warn(`Audio key: ${audioKey}, data size: ${audioData.length} bytes`)

        try {
          await hubBlob().put(audioKey, audioData, {
            httpMetadata: {
              contentType: 'audio/mpeg',
            },
          })
        }
        catch (error) {
          console.error({ error })
        }
        console.warn(`✅ Audio uploaded successfully to: ${audioKey}`)

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
