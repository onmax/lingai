import matter from 'gray-matter'

export default defineEventHandler(async (event) => {
  try {
    // Get language from route params
    const language = getRouterParam(event, 'language') || 'es'

    // Get authenticated user
    const authRequest = toWebRequest(event)
    const sessionData = await serverAuth().api.getSession(authRequest)
    const user = sessionData?.user

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - login required to access lessons',
      })
    }

    // List all lessons for this user and language
    const { blobs } = await hubBlob().list({
      prefix: `lessons/${user.id}/${language}/`,
    })

    const lessons = []

    for (const blob of blobs) {
      try {
        // Get the lesson content
        const content = await hubBlob().get(blob.pathname)

        if (content) {
          const rawText = await content.text()
          let frontmatter: Record<string, any> = {}
          let body = ''

          // Try to parse as JSON first (new format)
          try {
            const jsonData = JSON.parse(rawText)
            if (jsonData.response) {
              const markdownContent = jsonData.response
              const parsed = matter(markdownContent)
              frontmatter = parsed.data
              body = parsed.content

              // If no frontmatter found, try to extract from markdown structure
              if (Object.keys(frontmatter).length === 0) {
                const frontmatterSection = markdownContent.match(/\*\*Frontmatter\*\*\n-+\n\n([\s\S]*?)\n\n\*\*/)
                if (frontmatterSection) {
                  const frontmatterText = frontmatterSection[1]
                  frontmatterText.split('\n').forEach((line: string) => {
                    if (line.startsWith('*') && line.includes(':')) {
                      const colonIndex = line.indexOf(':')
                      const key = line.substring(1, colonIndex).trim()
                      const value = line.substring(colonIndex + 1).trim()

                      let parsedValue: string | string[] = value
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
            // If JSON parsing fails, try standard markdown
            const parsed = matter(rawText)
            frontmatter = parsed.data
            body = parsed.content
          }

          // Extract lesson number from filename for sorting
          const filename = blob.pathname.split('/').pop() || ''
          const lessonNumberMatch = filename.match(/^(\d+)\./)
          const lessonNumber = lessonNumberMatch ? Number.parseInt(lessonNumberMatch[1] || '0') : 0

          lessons.push({
            id: blob.pathname,
            filename,
            lessonNumber,
            title: frontmatter.title || `Lesson ${lessonNumber}`,
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
