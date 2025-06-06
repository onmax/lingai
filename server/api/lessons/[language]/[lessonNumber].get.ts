import matter from 'gray-matter'

export default defineEventHandler(async (event) => {
  try {
    // Get parameters from route
    const language = getRouterParam(event, 'language') || 'es'
    const lessonNumber = getRouterParam(event, 'lessonNumber')

    if (!lessonNumber) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lesson number is required',
      })
    }

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

    // List all lessons for this user and language to find the right file
    const { blobs } = await hubBlob().list({
      prefix: `lessons/${user.id}/${language}/`,
    })

    // Find the lesson file that starts with the lesson number
    const lessonBlob = blobs.find((blob) => {
      const filename = blob.pathname.split('/').pop() || ''
      return filename.startsWith(`${lessonNumber.padStart(2, '0')}.`)
    })

    if (!lessonBlob) {
      throw createError({
        statusCode: 404,
        statusMessage: `Lesson ${lessonNumber} not found`,
      })
    }

    // Get the lesson content
    const content = await hubBlob().get(lessonBlob.pathname)

    if (!content) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lesson content not found',
      })
    }

    const text = await content.text()

    // Parse frontmatter
    const { data: frontmatter, content: body } = matter(text)

    return {
      success: true,
      lesson: {
        id: lessonBlob.pathname,
        filename: lessonBlob.pathname.split('/').pop(),
        lessonNumber: Number.parseInt(lessonNumber),
        title: frontmatter.title,
        language: frontmatter.language || language,
        content: body,
        frontmatter,
        blobKey: lessonBlob.pathname,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch lesson: ${error}`,
    })
  }
})
