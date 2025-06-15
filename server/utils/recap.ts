import type { Lesson, LessonWithSentences } from '../../shared/types/lesson'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import OpenAI from 'openai'
import { fetchCourseContent } from '../data/course-content'
import { tables } from './drizzle'

/**
 * Check if a lesson number should be a recap lesson
 * Recap lessons occur every 7th lesson: 7, 14, 21, 28, etc.
 */
export function isRecapLesson(lessonNumber: number): boolean {
  return lessonNumber % 7 === 0 && lessonNumber > 0
}

/**
 * Get the range of lessons to include in the recap
 * For lesson 7: lessons 1-6
 * For lesson 14: lessons 8-13
 * For lesson 21: lessons 15-20
 */
export function getRecapLessonRange(recapLessonNumber: number): { start: number, end: number } {
  if (!isRecapLesson(recapLessonNumber)) {
    throw new Error(`Lesson ${recapLessonNumber} is not a recap lesson`)
  }

  const end = recapLessonNumber - 1
  const start = end - 5 // 6 lessons total (end - 5 to end inclusive)

  return { start, end }
}

/**
 * Retrieve lessons and their sentences for recap generation
 */
export async function getLessonsForRecap(
  userId: string,
  recapLessonNumber: number,
): Promise<LessonWithSentences[]> {
  const db = useDrizzle()
  const { start, end } = getRecapLessonRange(recapLessonNumber)

  // Get lessons in the range
  const lessons = await db.select()
    .from(tables.lessons)
    .where(and(
      eq(tables.lessons.userId, userId),
      gte(tables.lessons.lessonNumber, start),
      lte(tables.lessons.lessonNumber, end),
    ))
    .orderBy(tables.lessons.lessonNumber)
    .all()

  // Get sentences for each lesson
  const lessonsWithSentences: LessonWithSentences[] = []

  for (const lesson of lessons) {
    const sentences = await db.select()
      .from(tables.sentences)
      .where(eq(tables.sentences.lessonId, lesson.id))
      .orderBy(tables.sentences.sentenceOrder)
      .all()

    // Parse lesson data
    const lessonData: Lesson = {
      ...lesson,
      topics: JSON.parse(lesson.topics || '[]'),
      comicImageUrl: lesson.comicImageUrl || undefined,
      recapMarkdownUrl: lesson.recapMarkdownUrl || undefined,
      createdAt: new Date(lesson.createdAt),
      updatedAt: new Date(lesson.updatedAt),
    }

    // Parse sentence data
    const sentenceData = sentences.map((sentence: any) => ({
      ...sentence,
      audioUrl: sentence.audioUrl || undefined,
      context: sentence.context || undefined,
      difficulty: sentence.difficulty || undefined,
      tags: sentence.tags ? JSON.parse(sentence.tags) : undefined,
      createdAt: new Date(sentence.createdAt),
      updatedAt: new Date(sentence.updatedAt),
    }))

    lessonsWithSentences.push({
      ...lessonData,
      sentences: sentenceData,
    })
  }

  return lessonsWithSentences
}

/**
 * Generate recap markdown content using AI
 */
export async function generateRecapMarkdown(
  lessons: LessonWithSentences[],
  recapLessonNumber: number,
): Promise<string> {
  // Extract concepts and sentences from lessons
  const concepts = new Set<string>()
  const vocabularyTopics = new Set<string>()
  const grammarPoints = new Set<string>()
  const sentences: Array<{ spanish: string, english: string, context?: string }> = []

  lessons.forEach((lesson) => {
    // Add topics as concepts
    lesson.topics.forEach((topic: string) => concepts.add(topic))

    // Add sentences
    lesson.sentences.forEach((sentence) => {
      sentences.push({
        spanish: sentence.targetText,
        english: sentence.userText,
        context: sentence.context,
      })
    })
  })

  // Get course content for grammar points and vocabulary
  const courseContent = await fetchCourseContent()
  const relevantCourseContent = courseContent.filter(content =>
    content.lesson_number >= getRecapLessonRange(recapLessonNumber).start
    && content.lesson_number <= getRecapLessonRange(recapLessonNumber).end,
  )

  relevantCourseContent.forEach((content) => {
    content.grammar_points.forEach((point: string) => grammarPoints.add(point))
    content.vocabulary_topics.forEach((topic: string) => vocabularyTopics.add(topic))
  })

  // Initialize OpenAI client
  const config = useRuntimeConfig()
  if (!config.openaiApiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const openaiClient = new OpenAI({
    apiKey: config.openaiApiKey,
  })

  // Build the recap-range once to avoid repeating the function call
  const recapRange = getRecapLessonRange(recapLessonNumber)

  const prompt = `
## Spanish Recap Generator · Lesson ${recapLessonNumber}

You are a seasoned Spanish instructor creating an **Assimil-style recap** for lessons ${recapRange.start}-${recapRange.end}.  
Learners have *already* encountered this material; the goal is **reinforcement through concise review and contextual practice**—no new grammar, only familiar vocabulary where useful.

### INPUT
- **Grammar points:** ${Array.from(grammarPoints).join(', ')}
- **Vocabulary topics:** ${Array.from(vocabularyTopics).join(', ')}
- **Canonical sentences**  
${sentences.map(s => `- ${s.spanish} → ${s.english}`).join('\n')}

---

### TASK  
Return a single **Markdown** document **exactly** in the structure below (no extra headings or commentary).

# Recap: Lessons ${recapRange.start}-${recapRange.end}

## 1 · Grammar Review  
For each grammar point:  
1. **Brief rule** (max 2 lines).  
2. **Lesson examples** – quote 1-2 sentences from the list above, highlighting the grammar with **bold**.  
3. **Fresh example** you craft that *naturally* reuses lesson vocabulary when possible.

## 2 · Vocabulary in Context  
- Two-column table **Spanish | English** containing ~ 80-90 % of the words from the listed topics (prioritise those that appear in §1).  
- After the table, give **one short illustrative sentence** for each word (Spanish + English).

## 3 · Key Sentences  
Select 8-10 pivotal sentences that illustrate both grammar & vocab. Format each as:  
- **Spanish:** …  
  - *English:* …  
  - *Note:* …

## 4 · Practice Exercises  
Provide **exactly four** exercises:  
1. Fill-in-the-blank (grammar focus)  
2. Sentence unscramble (word order)  
3. EN→ES translation (vocabulary)  
4. Mini-dialogue completion  

Add an **Answer Key** hidden inside a \`<details>\` block.

---

### STYLE GUIDE  
- Use bullet lists and tables where helpful.  
- Show accents & punctuation correctly.  
- *Do not* invent new vocabulary.  
- Output **only valid Markdown**—no additional commentary, HTML, or code fences.
`

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Spanish language teacher creating recap lessons in the Assimil method style. Create comprehensive, educational content that reinforces previous learning.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated by AI')
    }

    return content
  }
  catch (error) {
    consola.error('Error generating recap markdown:', error)
    throw new Error(`Failed to generate recap content: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Store recap markdown in blob storage
 */
export async function storeRecapMarkdown(
  userId: string,
  lessonId: number,
  markdownContent: string,
): Promise<string> {
  const markdownKey = `recap/users/${userId}/lessons/${lessonId}.md`

  try {
    const markdownBlob = new Blob([markdownContent], { type: 'text/markdown' })
    await hubBlob().put(markdownKey, markdownBlob, {
      httpMetadata: {
        contentType: 'text/markdown',
      },
    })

    consola.success(`✅ Recap markdown stored successfully: ${markdownKey}`)
    return `/api/recap/${markdownKey}`
  }
  catch (error) {
    consola.error('❌ Failed to store recap markdown:', error)
    throw error
  }
}

/**
 * Generate complete recap lesson
 */
export async function generateRecapLesson(
  userId: string,
  recapLessonNumber: number,
): Promise<{ markdownUrl: string, content: string }> {
  consola.info(`Generating recap lesson ${recapLessonNumber} for user ${userId}`)

  // Get lessons for recap
  const lessons = await getLessonsForRecap(userId, recapLessonNumber)

  if (lessons.length === 0) {
    throw new Error(`No lessons found for recap lesson ${recapLessonNumber}`)
  }

  // Generate markdown content
  const markdownContent = await generateRecapMarkdown(lessons, recapLessonNumber)

  // Get the recap lesson from database
  const db = useDrizzle()
  const recapLesson = await db.select()
    .from(tables.lessons)
    .where(and(
      eq(tables.lessons.userId, userId),
      eq(tables.lessons.lessonNumber, recapLessonNumber),
    ))
    .limit(1)
    .get()

  if (!recapLesson) {
    throw new Error(`Recap lesson ${recapLessonNumber} not found in database`)
  }

  // Store markdown in blob
  const markdownUrl = await storeRecapMarkdown(userId, recapLesson.id, markdownContent)

  // Update lesson record
  await db.update(tables.lessons)
    .set({
      recapMarkdownUrl: markdownUrl,
      recapGenerated: true,
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(tables.lessons.id, recapLesson.id))

  consola.success(`✅ Recap lesson ${recapLessonNumber} generated successfully`)

  return {
    markdownUrl,
    content: markdownContent,
  }
}
