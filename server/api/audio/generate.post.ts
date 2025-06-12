import { Buffer } from 'node:buffer'
import { readValidatedBody } from 'h3'
import OpenAI from 'openai'
import { number, optional, safeParse, string, object as valibotObject } from 'valibot'

// Request body schema
const generateAudioSchema = valibotObject({
  text: string('Text to convert to speech'),
  language: optional(string('Target language (e.g., "spanish", "english")')),
  voice: optional(string('OpenAI voice name (alloy, echo, fable, onyx, nova, shimmer)')),
  speed: optional(number('Speech speed (0.25 to 4.0)')),
  model: optional(string('TTS model (tts-1 or tts-1-hd)')),
})

export default defineEventHandler(async (event) => {
  try {
    // Validate request body
    const { output: body, issues, success } = await readValidatedBody(event, body => safeParse(generateAudioSchema, body))
    if (!success || !body) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid request body: ${JSON.stringify(issues)}`,
      })
    }

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

    // Map language to appropriate voice if not specified
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

    const voice = body.voice || getVoiceForLanguage(body.language || 'english')
    const speed = body.speed || 1.0
    const model = body.model || 'tts-1-hd' // Use latest high-definition model by default

    consola.info(`Generating audio for text: "${body.text}" with voice: ${voice}`)

    // Generate audio using OpenAI's official SDK
    const mp3 = await openaiClient.audio.speech.create({
      model: model as 'tts-1' | 'tts-1-hd',
      voice,
      input: body.text,
      response_format: 'mp3',
      speed,
    })

    // Get the audio buffer
    const audioBuffer = Buffer.from(await mp3.arrayBuffer())

    // Generate a unique key for this audio
    const timestamp = Date.now()
    const hash = Buffer.from(body.text).toString('base64url').slice(0, 8)
    const audioKey = `audio/generated/${timestamp}-${hash}.mp3`

    // Store the audio in blob storage
    await hubBlob().put(audioKey, audioBuffer, {
      httpMetadata: {
        contentType: 'audio/mpeg',
      },
    })

    consola.success(`✅ Audio generated and stored at: ${audioKey}`)

    // Return success response with audio URL
    return {
      success: true,
      audioUrl: `/api/audio/${audioKey}`,
      message: 'Audio generated successfully',
      metadata: {
        text: body.text,
        voice,
        model,
        speed,
        language: body.language || 'english',
      },
    }
  }
  catch (error) {
    consola.error('Error generating audio:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate audio: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
