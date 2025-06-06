import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

export default defineEventHandler(async (_event) => {
  try {
    // For demo purposes, using a dummy user ID
    // In production, this would come from authentication
    const dummyUserId = 'user-123'
    const language = 'es' // Spanish

    const contentDir = join(process.cwd(), 'content/lessons')
    const files = await readdir(contentDir)

    const uploadedLessons = []

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = join(contentDir, file)
        const content = await readFile(filePath, 'utf-8')

        // Create blob key: lessons/{user_id}/{language}/{filename}
        const blobKey = `lessons/${dummyUserId}/${language}/${file}`

        // Upload to blob storage
        await hubBlob().put(blobKey, content, {
          contentType: 'text/markdown',
        })

        uploadedLessons.push({
          file,
          blobKey,
          uploaded: true,
        })
      }
    }

    return {
      success: true,
      message: `Uploaded ${uploadedLessons.length} lessons to blob storage`,
      lessons: uploadedLessons,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to upload lessons: ${error}`,
    })
  }
})
