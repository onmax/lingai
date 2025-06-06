export default defineEventHandler(async (event) => {
  try {
    const key = getRouterParam(event, 'key')

    if (!key) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing lesson key',
      })
    }

    // Fetch content from blob storage
    const blob = await hubBlob().get(key)

    if (!blob) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lesson not found',
      })
    }

    const markdownContent = await blob.text()

    // Parse frontmatter and content
    const frontmatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

    if (!frontmatterMatch) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Invalid lesson format',
      })
    }

    const [, frontmatterStr, content] = frontmatterMatch
    const frontmatter: Record<string, any> = {}

    // Simple frontmatter parsing
    frontmatterStr?.split('\n').forEach((line) => {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '')
        frontmatter[key] = value
      }
    })

    const filename = key.split('/').pop()
    const lessonNumber = filename ? Number.parseInt(filename.split('.')[0] || '1', 10) : 1

    return {
      success: true,
      lesson: {
        id: key,
        filename,
        lessonNumber,
        content,
        frontmatter,
        blobKey: key,
      },
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch lesson content',
      data: error,
    })
  }
})
