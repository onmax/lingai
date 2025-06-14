export default defineEventHandler(async (event) => {
  const pathSegments = getRouterParam(event, 'path')

  // For catch-all routes [...path], the parameter contains the full path segments
  // If pathSegments is an array, join it; if it's a string, use it directly
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image path is required',
    })
  }

  try {
    consola.info(`Attempting to serve image file: ${path}`)
    const imageBlob = await hubBlob().get(path)

    if (!imageBlob) {
      consola.warn(`Image file not found: ${path}`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Image file not found',
      })
    }

    // Set appropriate headers for image serving
    setHeader(event, 'Content-Type', 'image/png')
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // Cache for 1 year

    consola.info(`Successfully serving image file: ${path}`)
    return imageBlob
  }
  catch (error) {
    consola.error('Error serving image:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to serve image file',
    })
  }
})
