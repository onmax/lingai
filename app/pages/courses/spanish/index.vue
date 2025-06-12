<script setup lang="ts">
// Fetch lessons using our database API
const { data: lessonsResponse, refresh: refreshLessons, error: lessonsError, pending: lessonsPending } = await useFetch<LessonsListResponse>(`/api/lessons/by-language/spanish`)

const lessons = computed(() => {
  if (lessonsError.value)
    consola.error('lessonsError:', lessonsError.value)
  if (!lessonsResponse.value)
    consola.error('No lessonsResponse data')
  return lessonsResponse.value?.lessons || []
})

// Get user authentication
const { user } = useAuth()

// Loading state for lesson generation
const isGeneratingLessons = ref(false)

// Generate lessons function
async function generateLessons() {
  if (isGeneratingLessons.value)
    return

  try {
    isGeneratingLessons.value = true

    // First, get user profile to fetch their topics
    const userProfile = await $fetch('/api/user/profile')

    if (!userProfile?.topics?.length) {
      // If user has no topics, use default ones for Spanish learning
      const defaultTopics = ['travel', 'food', 'family', 'work', 'hobbies']

      await $fetch('/api/lessons/generate', {
        method: 'POST',
        body: {
          userId: user.value?.id,
          topics: defaultTopics,
          targetLanguage: 'spanish',
          userLanguage: 'english',
        },
      })
    }
    else {
      // Use user's topics
      await $fetch('/api/lessons/generate', {
        method: 'POST',
        body: {
          userId: user.value?.id,
          topics: userProfile.topics,
          targetLanguage: 'spanish',
          userLanguage: 'english',
        },
      })
    }

    // Refresh the lessons list after generation
    await refreshLessons()
  }
  catch (error) {
    consola.error('Error generating lessons:', error)
    // You could add a toast notification here
  }
  finally {
    isGeneratingLessons.value = false
  }
}

// Page meta
useHead({
  title: 'Cursos de Español - LingAI',
  meta: [
    { name: 'description', content: 'Aprende español con nuestro método interactivo' },
  ],
})
</script>

<template>
  <div max-w-512 mx-auto p-24>
    <header mb-32>
      <h1 text="f-xl neutral-900" font-bold mb-16>
        Cursos de Español
      </h1>
      <p text="f-lg neutral-600">
        Aprende español paso a paso con nuestro método interactivo
      </p>
    </header>

    <div v-if="lessons && lessons.length > 0" flex="~ col gap-4">
      <div
        v-for="lesson in lessons"
        :key="lesson.id"
        border="~ neutral-200 rounded-lg"
        p-6
        hover="bg-neutral-50 border-neutral-300"
        transition-all
        cursor-pointer
        @click="navigateTo(`/courses/spanish/${lesson.id}`)"
      >
        <div flex="~ items-center justify-between">
          <div flex="~ col gap-2">
            <div flex="~ items-center gap-3">
              <span
                bg-blue-100
                text-blue-800
                px-3
                py-1
                rounded-full
                text-sm
                font-medium
              >
                Lección {{ lesson.lessonNumber }}
              </span>
              <h2 f-text-xl font-semibold>
                {{ lesson.title }}
              </h2>
            </div>
            <div flex="~ items-center gap-4 text-sm text-neutral-500">
              <span>{{ lesson.totalSentences }} sentences</span>
              <span>{{ lesson.difficulty }}</span>
              <span v-if="lesson.topics && lesson.topics.length > 0">{{ lesson.topics.join(', ') }}</span>
            </div>
          </div>
          <div
            i-heroicons-chevron-right
            w-6
            h-6
            text-neutral-400
          />
        </div>
      </div>
    </div>

    <div v-else-if="lessonsPending" text-center py-12>
      <div i-heroicons-arrow-path w-16 h-16 text-neutral-300 mx-auto mb-4 animate-spin />
      <h3 f-text-xl font-medium text-neutral-600 mb-2>
        Cargando lecciones...
      </h3>
    </div>

    <div v-else-if="lessonsError" text-center py-12>
      <div i-nimiq:alert w-16 h-16 text-red-300 mx-auto mb-4 />
      <h3 f-text-xl font-medium text-neutral-600 mb-2>
        Error al cargar lecciones
      </h3>
      <p text-neutral-500 mb-6>
        {{ lessonsError?.message || 'Ocurrió un error inesperado' }}
      </p>
      <button
        nq-pill-blue
        @click="refreshLessons()"
      >
        <div i-heroicons-arrow-path w-4 h-4 />
        Reintentar
      </button>
    </div>

    <div v-else text-center py-12>
      <div i-heroicons-document-text w-16 h-16 text-neutral-300 mx-auto mb-4 />
      <h3 f-text-xl font-medium text-neutral-600 mb-2>
        No hay lecciones disponibles
      </h3>
      <p text-neutral-500 mb-6>
        Genera tu primera lección con IA.
      </p>

      <!-- Generate Lessons Button -->
      <button
        :disabled="isGeneratingLessons"
        nq-pill-blue
        @click="generateLessons"
      >
        <div
          v-if="isGeneratingLessons"
          i-heroicons-arrow-path
          size-16
          animate-spin
        />
        <div
          v-else
          i-heroicons-sparkles
          w-4
          h-4
        />
        {{ isGeneratingLessons ? 'Generando lecciones...' : 'Generar lecciones con IA' }}
      </button>
    </div>
  </div>
</template>
