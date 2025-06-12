<script setup lang="ts">
// Get lesson ID from route
const route = useRoute()
const lessonId = route.params.id as string

// Fetch the lesson with sentences
const { data: lessonResponse, pending, error, refresh } = await useFetch<LessonApiResponse>(`/api/lessons/${lessonId}`)

const lesson = computed(() => lessonResponse.value?.lesson)

// Audio generation state
const isGeneratingAudio = ref(false)

if (!lesson.value && !pending.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Lección no encontrada',
  })
}

// Generate audio for all sentences
async function generateAudioForAllSentences() {
  if (isGeneratingAudio.value)
    return

  try {
    isGeneratingAudio.value = true

    const response = await $fetch(`/api/lessons/${lessonId}/generate-audio`, {
      method: 'POST',
    })

    if (response.success && response.generated > 0) {
      // Refresh the lesson data to get updated audio URLs
      await refresh()
    }
  }
  catch (error) {
    console.error('Error generating audio for lesson:', error)
  }
  finally {
    isGeneratingAudio.value = false
  }
}

// Handle audio generation from individual sentence cards
function handleAudioGenerated(_sentenceId: number) {
  // Refresh the lesson data when audio is generated
  refresh()
}

// Check if any sentences are missing audio
const hasMissingAudio = computed(() => {
  return lesson.value?.sentences?.some(sentence => !sentence.audioUrl) || false
})

// Page meta
useHead({
  title: computed(() => lesson.value ? `${lesson.value.title} - LingAI` : 'Lección - LingAI'),
  meta: [
    {
      name: 'description',
      content: computed(() => lesson.value ? `Lección ${lesson.value.lessonNumber}: ${lesson.value.title}` : 'Aprende español con LingAI'),
    },
  ],
})
</script>

<template>
  <div max-w-512 mx-auto p-24>
    <!-- Back button -->
    <div mb-6>
      <NuxtLink
        to="/courses/spanish"
        flex="~ items-center gap-8"
        text-blue-600
        hover="text-blue-800"
        transition-colors
      >
        <div i-nimiq:arrow-left size-20 />
        <span>Volver a cursos</span>
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="pending" text-center py-12>
      <div i-heroicons-arrow-path w-16 h-16 text-neutral-300 mx-auto mb-4 animate-spin />
      <h3 f-text-xl font-medium text-neutral-600 mb-2>
        Cargando lección...
      </h3>
    </div>

    <!-- Error state -->
    <div v-else-if="error" text-center py-12>
      <div i-nimiq:alert size-20 text-red-300 mx-auto mb-4 />
      <h2 text="f-xl neutral-600" font-medium mb-2>
        Error al cargar la lección
      </h2>
      <p text-neutral-500 mb-6>
        {{ error?.message || 'Ocurrió un error inesperado' }}
      </p>
      <NuxtLink
        to="/courses/spanish"
        nq-hoverable
      >
        Volver a cursos
      </NuxtLink>
    </div>

    <!-- Lesson content -->
    <div v-else-if="lesson">
      <!-- Header -->
      <header mb-32>
        <div flex="~ items-center gap-12 mb-16">
          <span bg-neutral-100 text-blue px-12 py-4 rounded-full f-text-sm bg-blue-100>
            Lección {{ lesson.lessonNumber }}
          </span>
          <span text="f-sm neutral-500">
            {{ lesson.targetLanguage }}
          </span>
        </div>
        <h1 text="f-xl neutral-900" font-bold mb-4>
          {{ lesson.title }}
        </h1>
        <div flex="~ items-center gap-4 text-sm text-neutral-500 mb-6">
          <span>{{ lesson.totalSentences }} sentences</span>
          <span>{{ lesson.difficulty }}</span>
          <span v-if="lesson.topics && lesson.topics.length > 0">{{ lesson.topics.join(', ') }}</span>
        </div>

        <!-- Generate Audio Button -->
        <div v-if="hasMissingAudio" flex="~ items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg mb-6">
          <div i-heroicons-speaker-wave w-5 h-5 text-orange-600 />
          <div flex-1>
            <p text="f-sm neutral-700" font-medium>
              Some sentences don't have audio yet
            </p>
            <p text="f-xs neutral-600">
              Generate audio for all sentences to enable pronunciation practice
            </p>
          </div>
          <button
            type="button"
            bg="orange-600 hover:orange-700"
            text="white"
            px-4
            py-2
            rounded-lg
            f-text-sm
            font-medium
            transition="all duration-200"
            :disabled="isGeneratingAudio"
            :class="{ 'animate-pulse': isGeneratingAudio }"
            @click="generateAudioForAllSentences"
          >
            <div v-if="isGeneratingAudio" flex="~ items-center gap-2">
              <div i-heroicons-arrow-path w-4 h-4 animate-spin />
              <span>Generating...</span>
            </div>
            <div v-else flex="~ items-center gap-2">
              <div i-heroicons-musical-note w-4 h-4 />
              <span>Generate Audio</span>
            </div>
          </button>
        </div>
      </header>

      <!-- Sentences -->
      <div v-if="lesson.sentences && lesson.sentences.length > 0" space-y-6>
        <SentenceCard
          v-for="sentence in lesson.sentences"
          :key="sentence.id"
          :sentence="sentence"
          @audio-generated="handleAudioGenerated"
        />
      </div>

      <!-- Empty sentences state -->
      <div v-else text-center py-12>
        <div i-heroicons-document-text w-16 h-16 text-neutral-300 mx-auto mb-4 />
        <h3 f-text-xl font-medium text-neutral-600 mb-2>
          No hay oraciones disponibles
        </h3>
        <p text-neutral-500>
          Esta lección aún no tiene contenido.
        </p>
      </div>

      <!-- Navigation -->
      <div mt-12 pt-12 border="t-1 neutral-200">
        <div flex="~ items-center justify-between">
          <div>
            <!-- Previous lesson would go here -->
          </div>
          <div>
            <!-- Next lesson would go here -->
          </div>
        </div>
      </div>
    </div>

    <!-- Not found state -->
    <div v-else text="center py-12">
      <div i-nimiq:alert size-20 text-red-300 mx-auto mb-4 />
      <h2 text="f-xl neutral-600" font-medium mb-2>
        Lección no encontrada
      </h2>
      <p text-neutral-500 mb-6>
        La lección {{ lessonId }} no está disponible.
      </p>
      <NuxtLink
        to="/courses/spanish"
        nq-hoverable
      >
        Volver a cursos
      </NuxtLink>
    </div>
  </div>
</template>
