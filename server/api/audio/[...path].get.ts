export default defineEventHandler(async (event) => {
  const pathSegments = getRouterParam(event, 'path')

  // For catch-all routes [...path], the parameter contains the full path segments
  // If pathSegments is an array, join it; if it's a string, use it directly
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Audio path is required',
    })
  }

  try {
    consola.info(`Attempting to serve audio file: ${path}`)
    const audioBlob = await hubBlob().get(path)

    if (!audioBlob) {
      consola.warn(`Audio file not found: ${path}`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Audio file not found',
      })
    }

    // Set appropriate headers for audio streaming
    setHeader(event, 'Content-Type', 'audio/mpeg')
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // Cache for 1 year

    consola.info(`Successfully serving audio file: ${path}`)
    return audioBlob
  }
  catch (error) {
    consola.error('Error serving audio:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to serve audio file',
    })
  }
})
