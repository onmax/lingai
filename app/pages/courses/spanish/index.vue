<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

// Fetch Spanish lessons
const { data: lessonsResponse, error: lessonsError, pending: lessonsPending, refresh } = await useFetch<LessonsListResponse>(`/api/lessons/by-language/spanish`, {
  key: 'lessons-cache',
})

const lessons = computed(() => {
  if (lessonsError.value) {
    consola.error('lessonsError:', lessonsError.value)
  }
  return lessonsResponse.value?.lessons || []
})

// Use lesson progress composable
const { getCurrentLessonId } = useLessonProgress()

// Get the current lesson for display purposes
const currentLessonId = ref<number | null>(null)

onMounted(() => {
  currentLessonId.value = getCurrentLessonId()
})

// Page meta
useHead({
  title: 'Learn Spanish - LingAI',
  meta: [
    { name: 'description', content: 'Learn Spanish step by step with our interactive method' },
  ],
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <header class="mb-8">
      <h1 class="text-3xl text-neutral-900 font-bold mb-2">
        Learn Spanish
      </h1>
      <p class="text-neutral-600">
        Practice Spanish with interactive lessons
      </p>

      <!-- Continue Learning Button -->
      <div v-if="currentLessonId && lessons.some(l => l.id === currentLessonId)" mb-6>
        <button
          flex="~ items-center gap-2"
          px-6 py-3
          bg-blue-600
          text-white
          rounded-lg
          hover="bg-blue-700"
          transition-colors
          @click="navigateTo(`/courses/spanish/${currentLessonId}`)"
        >
          <div i-heroicons-play w-5 h-5 />
          <span>Continue Learning</span>
        </button>
      </div>
    </header>

    <!-- Lessons List -->
    <div v-if="lessons && lessons.length > 0" class="space-y-4">
      <div
        v-for="lesson in lessons"
        :key="lesson.id"
        class="border border-neutral-200 rounded-lg p-6 hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer"
        @click="navigateTo(`/courses/spanish/${lesson.id}`)"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span
                class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                Lesson {{ lesson.lessonNumber }}
              </span>
              <h2 class="text-xl font-semibold">
                {{ lesson.title }}
              </h2>
            </div>
            <div class="flex items-center gap-4 text-sm text-neutral-500">
              <span>{{ lesson.totalSentences }} sentences</span>
              <span>{{ lesson.difficulty }}</span>
              <span v-if="lesson.topics && lesson.topics.length > 0">{{ lesson.topics.join(', ') }}</span>
            </div>
          </div>
          <div
            class="i-heroicons-chevron-right w-6 h-6 text-neutral-400"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="lessonsPending" class="text-center py-12">
      <div class="i-heroicons-arrow-path w-8 h-8 text-neutral-300 mx-auto mb-4 animate-spin" />
      <p class="text-neutral-600">
        Loading lessons...
      </p>
    </div>

    <!-- Error State -->
    <div v-else-if="lessonsError" class="text-center py-12">
      <div class="i-heroicons-exclamation-triangle w-8 h-8 text-red-400 mx-auto mb-4" />
      <h3 class="text-lg text-neutral-900 font-medium mb-2">
        Error loading lessons
      </h3>
      <p class="text-neutral-600 mb-6">
        {{ lessonsError?.message || 'Something went wrong' }}
      </p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @click="refresh()"
      >
        Try Again
      </button>
    </div>

    <!-- No Lessons State -->
    <div v-else class="text-center py-12">
      <div class="i-heroicons-document-text w-8 h-8 text-neutral-300 mx-auto mb-4" />
      <h3 class="text-lg text-neutral-900 font-medium mb-2">
        No lessons yet
      </h3>
      <p class="text-neutral-600 mb-6">
        Complete your onboarding to get started with personalized lessons.
      </p>
      <NuxtLink
        to="/onboarding"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Get Started
      </NuxtLink>
    </div>
  </div>
</template>
