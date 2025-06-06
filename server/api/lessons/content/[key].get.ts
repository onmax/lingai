import matter from 'gray-matter'

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

    const rawContent = await blob.text()

    let content = ''
    let frontmatter: Record<string, any> = {}

    // Try to parse as JSON first (new format)
    try {
      const jsonData = JSON.parse(rawContent)
      if (jsonData.response) {
        const markdownContent = jsonData.response

        // Parse the markdown content using gray-matter
        const parsed = matter(markdownContent)
        content = parsed.content
        frontmatter = parsed.data

        // If no frontmatter found in the content, try to extract from markdown structure
        if (Object.keys(frontmatter).length === 0) {
          // Look for frontmatter section in the markdown
          const frontmatterSection = markdownContent.match(/\*\*Frontmatter\*\*\n-+\n\n([\s\S]*?)\n\n\*\*/)
          if (frontmatterSection) {
            const frontmatterText = frontmatterSection[1]
            // Parse bullet point format: * key: value
            frontmatterText.split('\n').forEach((line: string) => {
              if (line.startsWith('*') && line.includes(':')) {
                const colonIndex = line.indexOf(':')
                const key = line.substring(1, colonIndex).trim()
                const value = line.substring(colonIndex + 1).trim()
                let parsedValue = value

                // Handle arrays like [travel, food, family]
                if (parsedValue.startsWith('[') && parsedValue.endsWith(']')) {
                  parsedValue = parsedValue.slice(1, -1).split(',').map((item: string) => item.trim())
                }

                frontmatter[key] = parsedValue
              }
            })
          }
        }
      }
    }
    catch {
      // If JSON parsing fails, try standard markdown with frontmatter
      const parsed = matter(rawContent)
      content = parsed.content
      frontmatter = parsed.data
    }

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
        title: frontmatter.title || `Lesson ${lessonNumber}`,
        language: frontmatter.language || 'spanish',
      },
    }
  }
  catch (error) {
    console.error('Error processing lesson content:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch lesson content',
      data: error,
    })
  }
})
