import matter from 'gray-matter'

export default defineEventHandler(async (event) => {
  try {
    // Get language from route params
    const language = getRouterParam(event, 'language') || 'es'

    // For demo purposes, using a dummy user ID
    // In production, this would come from authentication
    const dummyUserId = 'user-123'

    // List all lessons for this user and language
    const { blobs } = await hubBlob().list({
      prefix: `lessons/${dummyUserId}/${language}/`,
    })

    const lessons = []

    for (const blob of blobs) {
      try {
        // Get the lesson content
        const content = await hubBlob().get(blob.pathname)

        if (content) {
          const text = await content.text()

          // Parse frontmatter
          const { data: frontmatter, content: body } = matter(text)

          // Extract lesson number from filename for sorting
          const filename = blob.pathname.split('/').pop() || ''
          const lessonNumberMatch = filename.match(/^(\d+)\./)
          const lessonNumber = lessonNumberMatch ? Number.parseInt(lessonNumberMatch[1] || '0') : 0

          lessons.push({
            id: blob.pathname,
            filename,
            lessonNumber,
            title: frontmatter.title,
            language: frontmatter.language || language,
            content: body,
            frontmatter,
            path: `/courses/${language}/${lessonNumber}`,
            blobKey: blob.pathname,
          })
        }
      }
      catch (error) {
        console.error(`Error processing lesson ${blob.pathname}:`, error)
      }
    }

    // Sort lessons by lesson number
    lessons.sort((a, b) => a.lessonNumber - b.lessonNumber)

    return {
      success: true,
      language,
      lessons,
      total: lessons.length,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch lessons: ${error}`,
    })
  }
})
