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
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-neutral-50">
    <div class="max-w-7xl mx-auto px-8 py-12">
      <header class="mb-12">
        <h1 class="text-4xl text-neutral-900 font-bold mb-4">
          Learn Spanish
        </h1>
        <p class="text-lg text-neutral-600 mb-8">
          Practice Spanish with interactive lessons designed to accelerate your learning
        </p>

        <!-- Continue Learning Button -->
        <div v-if="currentLessonId && lessons.some(l => l.id === currentLessonId)" class="mb-8">
          <button
            class="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
            @click="navigateTo(`/courses/spanish/${currentLessonId}`)"
          >
            <div class="i-heroicons-play w-6 h-6" />
            <span class="text-white font-semibold">Continue Learning</span>
          </button>
        </div>
      </header>

      <!-- Lessons Grid -->
      <div v-if="lessons && lessons.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="lesson in lessons"
          :key="lesson.id"
          class="bg-white border border-neutral-200 rounded-xl p-6 hover:bg-neutral-50 hover:border-neutral-300 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
          @click="navigateTo(`/courses/spanish/${lesson.id}`)"
        >
          <div class="flex flex-col h-full">
            <!-- Lesson Header -->
            <div class="flex items-center justify-between mb-4">
              <span
                class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                Lesson {{ lesson.lessonNumber }}
              </span>
              <div
                class="i-heroicons-chevron-right w-5 h-5 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all duration-200"
              />
            </div>

            <!-- Lesson Title -->
            <h2 class="text-xl font-semibold text-neutral-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
              {{ lesson.title }}
            </h2>

            <!-- Lesson Stats -->
            <div class="flex items-center gap-6 text-sm text-neutral-500 mt-auto">
              <div class="flex items-center gap-2">
                <div class="i-heroicons-document-text w-4 h-4" />
                <span>{{ lesson.totalSentences }} sentences</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="i-heroicons-academic-cap w-4 h-4" />
                <span class="capitalize">{{ lesson.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="lessonsPending" class="text-center py-20">
        <div class="i-heroicons-arrow-path w-12 h-12 text-neutral-300 mx-auto mb-6 animate-spin" />
        <p class="text-lg text-neutral-600">
          Loading lessons...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="lessonsError" class="text-center py-20">
        <div class="i-heroicons-exclamation-triangle w-12 h-12 text-red-400 mx-auto mb-6" />
        <h3 class="text-xl text-neutral-900 font-medium mb-4">
          Error loading lessons
        </h3>
        <p class="text-neutral-600 mb-8 max-w-md mx-auto">
          {{ lessonsError?.message || 'Something went wrong while fetching your lessons' }}
        </p>
        <button
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          @click="refresh()"
        >
          Try Again
        </button>
      </div>

      <!-- No Lessons State -->
      <div v-else class="text-center py-20">
        <div class="i-heroicons-document-text w-12 h-12 text-neutral-300 mx-auto mb-6" />
        <h3 class="text-xl text-neutral-900 font-medium mb-4">
          No lessons available yet
        </h3>
        <p class="text-neutral-600 mb-8 max-w-md mx-auto">
          Complete your onboarding to get started with personalized lessons tailored to your learning goals.
        </p>
        <NuxtLink
          to="/onboarding"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <div class="i-heroicons-rocket-launch w-5 h-5" />
          <span>Get Started</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
