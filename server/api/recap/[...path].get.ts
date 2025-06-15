export default defineEventHandler(async (event) => {
  const pathSegments = getRouterParam(event, 'path')

  // For catch-all routes [...path], the parameter contains the full path segments
  // If pathSegments is an array, join it; if it's a string, use it directly
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments

  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Recap markdown path is required',
    })
  }

  try {
    consola.info(`Attempting to serve recap markdown file: ${path}`)
    const markdownBlob = await hubBlob().get(path)

    if (!markdownBlob) {
      consola.warn(`Recap markdown file not found: ${path}`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Recap markdown file not found',
      })
    }

    // Set appropriate headers for markdown serving
    setHeader(event, 'Content-Type', 'text/markdown')
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // Cache for 1 year

    consola.info(`Successfully serving recap markdown file: ${path}`)
    return markdownBlob
  }
  catch (error) {
    consola.error('Error serving recap markdown:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to serve recap markdown file',
    })
  }
})
