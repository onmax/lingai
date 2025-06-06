<script setup lang="ts">
// Fetch lessons using our API instead of queryContent
const { data: lessonsResponse } = await useFetch<SpanishLessonsResponse>('/api/lessons/spanish')

const lessons = computed(() => {
  return lessonsResponse.value?.lessons?.map((lesson: Lesson) => ({
    _id: lesson.id,
    _path: lesson.path,
    lessonNumber: lesson.lessonNumber,
    title: lesson.filename.replace('.md', '').replace(/^\d+\./, '').replace(/-/g, ' '),
    filename: lesson.filename,
    key: lesson.blobKey,
  })) || []
})

// Page meta
useHead({
  title: 'Cursos de Español - LingAI',
  meta: [
    { name: 'description', content: 'Aprende español con nuestro método Assimil' },
  ],
})
</script>

<script lang="ts">
async function uploadLessons() {
  try {
    const response = await $fetch('/api/lessons/upload', { method: 'POST' })
    console.warn('Upload response:', response)
    // Refresh the page to show uploaded lessons
    await navigateTo('/courses/spanish', { replace: true })
  }
  catch (error) {
    console.error('Upload failed:', error)
  }
}
</script>

<template>
  <div max-w-512 mx-auto p-24>
    <header mb-32>
      <h1 text="f-3xl neutral-900" font-bold mb-16>
        Cursos de Español
      </h1>
      <p text="f-lg neutral-600">
        Aprende español paso a paso con nuestro método interactivo
      </p>
    </header>

    <div v-if="lessons && lessons.length > 0" flex="~ col gap-4">
      <div
        v-for="lesson in lessons"
        :key="lesson._id"
        border="~ neutral-200 rounded-lg"
        p-6
        hover="bg-neutral-50 border-neutral-300"
        transition-all
        cursor-pointer
        @click="navigateTo(`/courses/spanish/${lesson.lessonNumber}`)"
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
              <h2 text-xl font-semibold>
                {{ lesson.title }}
              </h2>
            </div>
            <p text-neutral-600 text-sm>
              {{ lesson._path }}
            </p>
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

    <div v-else text-center py-12>
      <div i-heroicons-document-text w-16 h-16 text-neutral-300 mx-auto mb-4 />
      <h3 text-xl font-medium text-neutral-600 mb-2>
        No hay lecciones disponibles
      </h3>
      <p text-neutral-500>
        Las lecciones se cargarán pronto.
      </p>
    </div>

    <!-- Upload button for development -->
    <div mt-12 pt-8 border-t border-neutral-200>
      <details>
        <summary text-sm text-neutral-500 cursor-pointer>
          Opciones de desarrollo
        </summary>
        <div mt-4>
          <button
            bg-blue-600
            text-white
            px-4
            py-2
            rounded-lg
            hover="bg-blue-700"
            @click="uploadLessons"
          >
            Subir lecciones a blob storage
          </button>
        </div>
      </details>
    </div>
  </div>
</template>
