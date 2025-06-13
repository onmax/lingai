export default defineEventHandler(async (event) => {
  try {
    const sentenceId = getRouterParam(event, 'id')

    if (!sentenceId || Number.isNaN(Number(sentenceId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid sentence ID is required',
      })
    }

    // Get authenticated user
    const authRequest = toWebRequest(event)
    const sessionData = await serverAuth().api.getSession(authRequest)
    const user = sessionData?.user

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - login required to access sentence',
      })
    }

    const db = useDrizzle()

    // Fetch the sentence
    const sentence = await db.select()
      .from(tables.sentences)
      .where(and(
        eq(tables.sentences.id, Number(sentenceId)),
        eq(tables.sentences.userId, user.id),
      ))
      .get()

    if (!sentence) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sentence not found',
      })
    }

    // Format the sentence data
    const formattedSentence = {
      ...sentence,
      audioUrl: sentence.audioUrl || undefined,
      context: sentence.context || undefined,
      difficulty: sentence.difficulty || undefined,
      tags: sentence.tags ? JSON.parse(sentence.tags) : undefined,
      createdAt: new Date(sentence.createdAt),
      updatedAt: new Date(sentence.updatedAt),
    }

    return {
      success: true,
      sentence: formattedSentence,
    }
  }
  catch (error: any) {
    consola.error('Error fetching sentence:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch sentence: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
})
