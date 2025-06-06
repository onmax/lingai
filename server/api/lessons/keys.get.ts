export default defineEventHandler(async (event) => {
  try {
    // For now, we'll use a default user ID. Later this will come from auth
    const userId = 'demo-user'
    const language = getQuery(event).language as string || 'es'

    // List all files in the user's lesson directory
    const prefix = `lessons/${userId}/${language}/`
    const blobList = await hubBlob().list({ prefix })

    // Extract lesson keys from blob objects
    const blobs = Array.isArray(blobList) ? blobList : blobList?.blobs || []
    const keys = blobs
      .filter(blob => blob.pathname?.endsWith('.md'))
      .map((blob) => {
        const filename = blob.pathname.replace(prefix, '')
        const lessonNumber = Number.parseInt(filename.split('.')[0], 10)
        return {
          key: blob.pathname,
          filename,
          lessonNumber,
          path: `/${language}/${filename.replace('.md', '')}`,
        }
      })
      .sort((a, b) => a.lessonNumber - b.lessonNumber)

    return {
      success: true,
      keys,
      total: keys.length,
      language,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch lesson keys',
      data: error,
    })
  }
})
