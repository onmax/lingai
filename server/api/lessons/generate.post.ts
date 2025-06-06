function generateLessonsFromTopics(topics: string[], language: string, targetLanguage: string) {
  const topicLessons = topics.slice(0, 6).map((topic, index) => {
    const lessonNumber = (index + 1).toString().padStart(2, '0')
    const topicSlug = topic.toLowerCase().replace(/\s+/g, '-')

    return {
      filename: `${lessonNumber}.${topicSlug}.md`,
      content: `---
title: "${targetLanguage === 'spanish' ? 'Español' : targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)} para ${topic}"
language: "${language}"
difficulty: "${index < 2 ? 'beginner' : index < 4 ? 'intermediate' : 'advanced'}"
topics: ["${topic}", "vocabulary", "conversation"]
order: ${index + 1}
description: "Learn ${targetLanguage} vocabulary and phrases related to ${topic}"
---

# ${targetLanguage === 'spanish' ? 'Español' : targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)} para ${topic}

Welcome to your ${targetLanguage} lesson focused on **${topic}**!

## Vocabulario Esencial / Essential Vocabulary

### Palabras Clave / Key Words
- **Example 1** - Translation 1
- **Example 2** - Translation 2
- **Example 3** - Translation 3

## Frases Útiles / Useful Phrases

### Conversación Básica / Basic Conversation
- **¿Te gusta...?** - Do you like...?
- **Me encanta...** - I love...
- **No me gusta...** - I don't like...

## Ejercicios / Exercises

### Ejercicio 1: Vocabulario
Complete the sentences:
1. Me gusta _______ (${topic})
2. ¿Dónde está _______?
3. Necesito _______ para...

### Ejercicio 2: Conversación
Practice these dialogues with a partner or speak them aloud.

## Práctica Cultural / Cultural Practice

Learn about how ${topic} is important in Spanish-speaking cultures.

---

*¡Bien hecho! Keep practicing and you'll master these ${topic}-related phrases in no time!*
`,
    }
  })

  // Ensure we have at least 3 lessons by adding generic ones if needed
  while (topicLessons.length < 3) {
    const index = topicLessons.length
    const lessonNumber = (index + 1).toString().padStart(2, '0')

    topicLessons.push({
      filename: `${lessonNumber}.general-conversation.md`,
      content: `---
title: "Conversación General ${index + 1}"
language: "${language}"
difficulty: "beginner"
topics: ["conversation", "basics"]
order: ${index + 1}
description: "Essential conversation skills in ${targetLanguage}"
---

# Conversación General ${index + 1}

Practice essential conversation skills in ${targetLanguage}.

## Vocabulary
- **Hola** - Hello
- **Gracias** - Thank you
- **Por favor** - Please

## Practice
Try these basic conversations!
`,
    })
  }

  return topicLessons
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, language, topics, targetLanguage } = body

    if (!userId || !language || !topics || !Array.isArray(topics)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: userId, language, topics (array)',
      })
    }

    // Generate lessons based on topics (template-based for now)
    // TODO: Replace with NuxtHub AI when available
    const lessonsData = generateLessonsFromTopics(topics, language, targetLanguage || language)

    // Store generated lessons in blob storage
    const generatedLessons = []
    for (const lesson of lessonsData) {
      const blobKey = `lessons/${userId}/${language}/${lesson.filename}`

      try {
        await hubBlob().put(blobKey, lesson.content, {
          contentType: 'text/markdown',
        })

        generatedLessons.push({
          filename: lesson.filename,
          blobKey,
          generated: true,
        })
      }
      catch (error) {
        console.error(`Failed to store lesson ${lesson.filename}:`, error)
      }
    }

    return {
      success: true,
      message: 'Lessons generated successfully',
      generated: generatedLessons.length,
      lessons: generatedLessons,
      topics,
      language,
    }
  }
  catch (error) {
    console.error('Lesson generation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate lessons',
      data: error,
    })
  }
})
