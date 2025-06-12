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
  <div max-w-520 mx-auto px-6 py-8 min-h-screen>
    <!-- Back button -->
    <div mb-6>
      <NuxtLink
        to="/courses/spanish"
        flex="~ items-center gap-2"
        text-blue-600
        hover="text-blue-800"
        transition-colors
      >
        <div i-heroicons-arrow-left w-5 h-5 />
        <span>Back to Lessons</span>
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="pending" text-center py-12>
      <div i-heroicons-arrow-path w-8 h-8 text-neutral-300 mx-auto mb-4 animate-spin />
      <p text="neutral-600">
        Loading lesson...
      </p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" text-center py-12>
      <div i-heroicons-exclamation-triangle w-8 h-8 text-red-400 mx-auto mb-4 />
      <h2 text="f-lg neutral-900" font-medium mb-2>
        Error loading lesson
      </h2>
      <p text="f-sm neutral-600" mb-6>
        {{ error?.message || 'Something went wrong' }}
      </p>
      <NuxtLink
        to="/courses/spanish"
        nq-pill-blue
      >
        Back to Lessons
      </NuxtLink>
    </div>

    <!-- Lesson content -->
    <div v-else-if="lesson">
      <!-- Header -->
      <header mb-8>
        <div flex="~ items-center gap-3 mb-4">
          <span
            bg-blue-100
            text-blue-800
            px-3
            py-1
            rounded-full
            f-text-sm
            font-medium
          >
            Lesson {{ lesson.lessonNumber }}
          </span>
        </div>
        <h1 text="f-3xl neutral-900" font-bold mb-2>
          {{ lesson.title }}
        </h1>
        <div flex="~ items-center gap-4 f-text-sm text-neutral-500">
          <span>{{ lesson.totalSentences }} sentences</span>
          <span>{{ lesson.difficulty }}</span>
          <span v-if="lesson.topics && lesson.topics.length > 0">{{ lesson.topics.join(', ') }}</span>
        </div>
      </header>

      <!-- Sentences -->
      <div v-if="lesson.sentences && lesson.sentences.length > 0" space-y-6>
        <SentenceCard
          v-for="sentence in lesson.sentences"
          :key="sentence.id"
          :sentence="sentence"
        />
      </div>

      <!-- No sentences -->
      <div v-else text-center py-12>
        <div i-heroicons-document-text w-8 h-8 text-neutral-300 mx-auto mb-4 />
        <p text="f-sm neutral-600">
          No sentences available for this lesson.
        </p>
      </div>
    </div>
  </div>
</template>
