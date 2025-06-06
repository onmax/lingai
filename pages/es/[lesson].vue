<script setup lang="ts">
import type { LessonApiResponse, LessonsListResponse } from '~/types/lesson'

const route = useRoute()
const lessonSlug = route.params.lesson as string

// Get all lessons first to find the one matching our slug
const { data: lessonsResponse } = await useFetch<LessonsListResponse>('/api/lessons/keys', {
  query: { language: 'es' },
})

// Find the lesson that matches our slug
const matchingLesson = lessonsResponse.value?.lessons?.find((key) => {
  const filename = key.filename?.replace('.md', '') || ''
  return filename === lessonSlug
})

if (!matchingLesson) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Lesson not found',
  })
}

// Fetch the lesson content
const { data: lessonResponse } = await useFetch<LessonApiResponse>(`/api/lessons/content/${encodeURIComponent(matchingLesson.key)}`)

if (!lessonResponse.value?.success || !lessonResponse.value.lesson) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to load lesson content',
  })
}

const lesson = lessonResponse.value.lesson

// Parse markdown content
const htmlContent = useMarkdown(lesson.content || '')

// Set page meta
useSeoMeta({
  title: lesson.frontmatter?.title || 'Spanish Lesson',
  description: lesson.frontmatter?.description || `Spanish lesson: ${lesson.frontmatter?.title || 'Learn Spanish'}`,
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="lesson" class="max-w-4xl mx-auto">
      <!-- Lesson Header -->
      <header class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <NuxtLink
            to="/courses/spanish"
            class="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <div class="i-tabler-arrow-left" />
            Back to Course
          </NuxtLink>
        </div>

        <h1 class="text-3xl font-bold mb-2">
          {{ lesson.frontmatter?.title || 'Spanish Lesson' }}
        </h1>

        <div class="flex flex-wrap gap-3 text-sm text-gray-600">
          <span class="flex items-center gap-1">
            <div class="i-tabler-world" />
            {{ lesson.frontmatter?.language || 'es' }}
          </span>
          <span class="flex items-center gap-1">
            <div class="i-tabler-chart-line" />
            {{ lesson.frontmatter?.difficulty || 'beginner' }}
          </span>
          <span v-if="lesson.frontmatter?.topics" class="flex items-center gap-1">
            <div class="i-tabler-tags" />
            {{ Array.isArray(lesson.frontmatter.topics) ? lesson.frontmatter.topics.join(', ') : lesson.frontmatter.topics }}
          </span>
        </div>
      </header>

      <!-- Lesson Content -->
      <main class="nq-prose max-w-none">
        <div v-html="htmlContent" />
      </main>

      <!-- Navigation -->
      <nav class="mt-12 pt-8 border-t border-gray-200">
        <div class="flex justify-between">
          <div>
            <!-- Previous lesson link would go here -->
          </div>
          <div>
            <!-- Next lesson link would go here -->
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>
