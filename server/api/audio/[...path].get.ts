export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Audio path is required',
    })
  }

  try {
    const audioBlob = await hubBlob().get(path)

    if (!audioBlob) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Audio file not found',
      })
    }

    // Set appropriate headers for audio streaming
    setHeader(event, 'Content-Type', 'audio/mpeg')
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // Cache for 1 year

    return audioBlob
  }
  catch (error) {
    console.error('Error serving audio:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to serve audio file',
    })
  }
})
