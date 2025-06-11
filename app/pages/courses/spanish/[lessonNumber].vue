<script setup lang="ts">
// Get lesson number from route
const route = useRoute()
const lessonNumber = route.params.lessonNumber as string

// First, get the list of lessons to find the matching one
const { data: lessonsResponse } = await useFetch<SpanishLessonsResponse>('/api/lessons/spanish')
const matchingLesson = lessonsResponse.value?.lessons?.find((l: FileLesson) => l.lessonNumber === Number.parseInt(lessonNumber))

if (!matchingLesson) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Lección no encontrada',
  })
}

// Then fetch the lesson content
const { data: lessonResponse } = await useFetch<LessonApiResponse>(`/api/lessons/content/${encodeURIComponent(matchingLesson.blobKey)}`)

const lesson = computed(() => lessonResponse.value?.lesson)

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

    <div v-if="lesson">
      <!-- Header -->
      <header mb-32>
        <div flex="~ items-center gap-12 mb-16">
          <span bg-neutral-100 text-blue px-12 py-4 rounded-full f-text-sm bg-blue-100>
            Lección {{ lesson.lessonNumber || matchingLesson.lessonNumber }}
          </span>
          <span text="f-sm neutral-500">
            {{ lesson.targetLanguage || matchingLesson.language }}
          </span>
        </div>
        <h1 text="f-3xl neutral-900" font-bold>
          {{ lesson.title || matchingLesson.title }}
        </h1>
      </header>

      <!-- Content rendered as markdown -->
      <div nq-prose v-html="useMarkdown(lesson.description || matchingLesson.content || '')" />

      <!-- Navigation -->
      <div mt-12 pt-12 border="t-1 neutral-200">
        <div flex="~ items-center justify-between">
          <NuxtLink
            v-if="matchingLesson.lessonNumber > 1"
            :to="`/courses/spanish/${matchingLesson.lessonNumber - 1}`"
            nq-hoverable
          >
            <div i-nimiq:arrow-left size-20 />
            <span>Lección anterior</span>
          </NuxtLink>
          <div v-else />

          <NuxtLink
            :to="`/courses/spanish/${matchingLesson.lessonNumber + 1}`"
            nq-hoverable
          >
            <span>Siguiente lección</span>
            <div i-heroicons-arrow-right w-4 h-4 />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else text="center py-12">
      <div i-nimiq:alert size-20 text-red-300 mx-auto mb-4 />
      <h2 text="f-xl neutral-600" font-medium mb-2>
        Lección no encontrada
      </h2>
      <p text-neutral-500 mb-6>
        La lección {{ lessonNumber }} no está disponible.
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

<style>
.prose {
  @apply text-neutral-700 leading-relaxed;
}

.prose h1 {
  @apply text-2xl font-bold text-neutral-900 mt-8 mb-4;
}

.prose h2 {
  @apply text-xl font-semibold text-neutral-900 mt-6 mb-3;
}

.prose h3 {
  @apply text-lg font-medium text-neutral-900 mt-4 mb-2;
}

.prose ul {
  @apply space-y-2 ml-6 mb-4;
}

.prose li {
  @apply list-disc;
}

.prose p {
  @apply mb-4;
}

.prose strong {
  @apply font-semibold text-neutral-900;
}
</style>
