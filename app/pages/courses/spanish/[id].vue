<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

// Get lesson ID from route
const route = useRoute()
const lessonId = computed(() => Number.parseInt(route.params.id as string, 10))

// Fetch the lesson with sentences
const { data: lessonResponse, pending, error, refresh: refreshLesson } = await useFetch<LessonApiResponse>(`/api/lessons/${lessonId.value}`)

// Fetch all lessons for navigation
const { data: lessonsResponse, refresh: refreshLessons } = await useFetch<LessonsListResponse>(`/api/lessons/by-language/spanish`, {
  key: 'lessons-cache',
})

const lesson = computed(() => lessonResponse.value?.lesson)
const allLessons = computed(() => lessonsResponse.value?.lessons || [])

// Lesson progress composable
const {
  setCurrentLessonId,
  goToNextLesson,
  goToPreviousLesson,
  hasNextLesson,
  hasPreviousLesson,
} = useLessonProgress()

// Audio loader composable
const { startAudioPolling, stopAllPolling } = useAudioLoader()

// Navigation state
const isNavigating = ref(false)

// Set current lesson as the active one when the page loads
watchEffect(() => {
  if (lesson.value) {
    setCurrentLessonId(lesson.value.id)
  }
})

// Start audio polling when lesson with sentences is loaded
watchEffect(() => {
  if (lesson.value?.sentences && lesson.value.sentences.length > 0) {
    startAudioPolling(lesson.value.sentences, refreshLesson)
  }
})

// Clean up polling when component unmounts
onBeforeUnmount(() => {
  stopAllPolling()
})

// Refresh lessons data if we're missing the current lesson in the list
watchEffect(async () => {
  if (lesson.value && allLessons.value.length > 0) {
    const lessonExists = allLessons.value.some(l => l.id === lesson.value?.id)
    if (!lessonExists) {
      // This lesson doesn't exist in our cached list, refresh it
      await refreshLessons()
    }
  }
})

// Navigation handlers
async function handleNextLesson() {
  if (!lesson.value || isNavigating.value)
    return

  try {
    isNavigating.value = true
    await goToNextLesson(lesson.value.id, allLessons.value)
  }
  catch (error) {
    console.error('Failed to navigate to next lesson:', error)
  }
  finally {
    isNavigating.value = false
  }
}

async function handlePreviousLesson() {
  if (!lesson.value || isNavigating.value)
    return

  try {
    isNavigating.value = true
    await goToPreviousLesson(lesson.value.id, allLessons.value)
  }
  catch (error) {
    console.error('Failed to navigate to previous lesson:', error)
  }
  finally {
    isNavigating.value = false
  }
}

// Computed navigation availability
const canGoNext = computed(() =>
  lesson.value ? hasNextLesson(lesson.value.id, allLessons.value) : false,
)

const canGoPrevious = computed(() =>
  lesson.value ? hasPreviousLesson(lesson.value.id, allLessons.value) : false,
)

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
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-neutral-50">
    <div class="max-w-7xl mx-auto px-8 py-12">
    <!-- Back button -->
    <div class="mb-8">
      <NuxtLink
        to="/courses/spanish"
        class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
      >
        <div class="i-heroicons-arrow-left w-5 h-5" />
        <span>Back to Lessons</span>
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="text-center py-20">
      <div class="i-heroicons-arrow-path w-12 h-12 text-neutral-300 mx-auto mb-6 animate-spin" />
      <p class="text-lg text-neutral-600">
        Loading lesson...
      </p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-heroicons-exclamation-triangle w-12 h-12 text-red-400 mx-auto mb-6" />
      <h2 class="text-xl text-neutral-900 font-medium mb-4">
        Error loading lesson
      </h2>
      <p class="text-neutral-600 mb-8 max-w-md mx-auto">
        {{ error?.message || 'Something went wrong while loading this lesson' }}
      </p>
      <NuxtLink
        to="/courses/spanish"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Lessons
      </NuxtLink>
    </div>

    <!-- Lesson content -->
    <div v-else-if="lesson">
      <!-- Header -->
      <header class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="flex items-center gap-4 mb-4">
              <span
                class="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
              >
                Lesson {{ lesson.lessonNumber }}
              </span>
              <div class="flex items-center gap-6 text-sm text-neutral-500">
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
            <h1 class="text-4xl text-neutral-900 font-bold">
              {{ lesson.title }}
            </h1>
          </div>
        </div>
      </header>

      <!-- Sentences -->
      <div v-if="lesson.sentences && lesson.sentences.length > 0" class="space-y-6 mb-16">
        <SentenceCard
          v-for="sentence in lesson.sentences"
          :key="sentence.id"
          :sentence="sentence"
        />
      </div>

      <!-- No sentences -->
      <div v-else class="text-center py-20">
        <div class="i-heroicons-document-text w-12 h-12 text-neutral-300 mx-auto mb-6" />
        <p class="text-lg text-neutral-600">
          No sentences available for this lesson.
        </p>
      </div>

      <!-- Navigation buttons -->
      <div class="flex justify-between items-center pt-12 border-t border-neutral-200">
        <!-- Previous lesson button -->
        <button
          v-if="canGoPrevious"
          :disabled="isNavigating"
          class="flex items-center gap-3 px-6 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          @click="handlePreviousLesson"
        >
          <div class="i-heroicons-chevron-left w-5 h-5" />
          <span>Previous Lesson</span>
        </button>
        <div v-else />

        <!-- Next lesson button -->
        <button
          v-if="canGoNext"
          :disabled="isNavigating"
          class="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-md"
          @click="handleNextLesson"
        >
          <template v-if="isNavigating">
            <div class="i-heroicons-arrow-path w-5 h-5 animate-spin" />
            <span>Generating...</span>
          </template>
          <template v-else>
            <span>Next Lesson</span>
            <div class="i-heroicons-chevron-right w-5 h-5" />
          </template>
        </button>
      </div>
    </div>
    </div>
  </div>
</template>
