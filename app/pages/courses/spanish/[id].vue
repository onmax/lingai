<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

// Get lesson ID from route
const route = useRoute()
const lessonId = computed(() => Number.parseInt(route.params.id as string, 10))

// Fetch the lesson with sentences
const { data: lessonResponse, pending, error } = await useFetch<LessonApiResponse>(`/api/lessons/${lessonId.value}`)

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

// Navigation state
const isNavigating = ref(false)

// Set current lesson as the active one when the page loads
watchEffect(() => {
  if (lesson.value) {
    setCurrentLessonId(lesson.value.id)
  }
})

// Refresh lessons data if we're missing the current lesson in the list
watchEffect(async () => {
  if (lesson.value && allLessons.value.length > 0) {
    const lessonExists = allLessons.value.some(l => l.id === lesson.value.id)
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

      <!-- Navigation buttons -->
      <div flex="~ justify-between items-center" mt-12 pt-8 border="t neutral-200">
        <!-- Previous lesson button -->
        <button
          v-if="canGoPrevious"
          :disabled="isNavigating"
          flex="~ items-center gap-2"
          px-6 py-3
          bg-neutral-100
          text-neutral-700
          rounded-lg
          hover="bg-neutral-200"
          disabled:="opacity-50 cursor-not-allowed"
          transition-colors
          @click="handlePreviousLesson"
        >
          <div i-heroicons-chevron-left w-5 h-5 />
          <span>Previous Lesson</span>
        </button>
        <div v-else />

        <!-- Next lesson button -->
        <button
          v-if="canGoNext"
          :disabled="isNavigating"
          flex="~ items-center gap-2"
          px-6 py-3
          bg-blue-600
          text-white
          rounded-lg
          hover="bg-blue-700"
          disabled:="opacity-50 cursor-not-allowed"
          transition-colors
          @click="handleNextLesson"
        >
          <template v-if="isNavigating">
            <div i-heroicons-arrow-path w-5 h-5 animate-spin />
            <span>Generating...</span>
          </template>
          <template v-else>
            <span>Next Lesson</span>
            <div i-heroicons-chevron-right w-5 h-5 />
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
