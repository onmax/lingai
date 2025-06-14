<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

// Get lesson ID from route
const route = useRoute()
const lessonId = computed(() => Number.parseInt(route.params.id as string, 10))

// Fetch the lesson with sentences
const { data: lessonResponse, pending, error } = await useFetch<LessonApiResponse>(`/api/lessons/${lessonId.value}`)

const lesson = computed(() => lessonResponse.value?.lesson)

if (!lesson.value && !pending.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Lesson not found',
  })
}

// Page meta
useHead({
  title: computed(() => lesson.value ? `${lesson.value.title} - LingAI` : 'Lesson - LingAI'),
  meta: [
    {
      name: 'description',
      content: computed(() => lesson.value ? `Lesson ${lesson.value.lessonNumber}: ${lesson.value.title}` : 'Learn Spanish with LingAI'),
    },
  ],
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-screen w-full">
    <!-- Back button -->
    <div class="mb-4 sm:mb-6">
      <NuxtLink
        to="/courses/spanish"
        class="flex items-center gap-2 text-sm sm:text-base text-blue-600 hover:text-blue-800 transition-colors"
      >
        <div class="i-heroicons-arrow-left w-4 h-4 sm:w-5 sm:h-5" />
        <span>Back to Lessons</span>
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="text-center py-12">
      <div class="i-heroicons-arrow-path w-8 h-8 text-neutral-300 mx-auto mb-4 animate-spin" />
      <p class="text-neutral-600">
        Loading lesson...
      </p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <div class="i-heroicons-exclamation-triangle w-8 h-8 text-red-400 mx-auto mb-4" />
      <h2 class="text-lg text-neutral-900 font-medium mb-2">
        Error loading lesson
      </h2>
      <p class="text-sm text-neutral-600 mb-6">
        {{ error?.message || 'Something went wrong' }}
      </p>
      <NuxtLink
        to="/courses/spanish"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Back to Lessons
      </NuxtLink>
    </div>

    <!-- Lesson content -->
    <div v-else-if="lesson">
      <!-- Header -->
      <header class="mb-6 sm:mb-8">
        <div class="flex items-center gap-3 mb-3 sm:mb-4">
          <span
            class="bg-blue-100 text-blue-800 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium"
          >
            Lesson {{ lesson.lessonNumber }}
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl text-neutral-900 font-bold mb-2 break-words">
          {{ lesson.title }}
        </h1>
        <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-500">
          <span>{{ lesson.totalSentences }} sentences</span>
          <span>{{ lesson.difficulty }}</span>
          <span v-if="lesson.topics && lesson.topics.length > 0" class="break-words">{{ lesson.topics.join(', ') }}</span>
        </div>
      </header>

      <!-- Sentences -->
      <div v-if="lesson.sentences && lesson.sentences.length > 0" class="space-y-4 sm:space-y-6">
        <SentenceCard
          v-for="sentence in lesson.sentences"
          :key="sentence.id"
          :sentence="sentence"
        />
      </div>

      <!-- No sentences -->
      <div v-else class="text-center py-12">
        <div class="i-heroicons-document-text w-8 h-8 text-neutral-300 mx-auto mb-4" />
        <p class="text-sm text-neutral-600">
          No sentences available for this lesson.
        </p>
      </div>
    </div>
  </div>
</template>
