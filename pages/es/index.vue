<script setup lang="ts">
// Fetch all Spanish lessons
const { data: lessonsResponse } = await useFetch('/api/lessons/spanish')

const lessons = lessonsResponse.value?.lessons || []

// Set page meta
useSeoMeta({
  title: 'Spanish Lessons - LingAI',
  description: 'Learn Spanish with interactive lessons',
})
</script>

<template>
  <div mx-auto f-p-md>
    <div max-w-512 mx-auto>
      <!-- Header -->
      <header mb-32>
        <h1 f-text-2xl font-bold mb-16>
          Spanish Lessons
        </h1>
        <p text="f-lg neutral-900">
          Learn Spanish step by step with our interactive lessons
        </p>
      </header>

      <!-- Lessons List -->
      <div grid="~ gap-6 cols-2 lg:cols-3">
        <NuxtLink
          v-for="lesson in lessons"
          :key="lesson.blobKey"
          :to="lesson.path"
          nq-hoverable
        >
          <div flex="~ items-center justify-between mb-3">
            <span text="f-sm neutral-900">
              Lesson {{ lesson.lessonNumber }}
            </span>
            <div i-nimiq:arrow-right text-neutral-700 />
          </div>

          <h3 text="f-lg neutral-900" font-semibold mb-2>
            {{ lesson.filename?.replace('.md', '').replace(/^\d+\./, '').replace(/-/g, ' ') || 'Lesson' }}
          </h3>

          <p text="f-sm neutral-600">
            Click to start this lesson
          </p>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-if="lessons.length === 0" class="text-center py-12">
        <div class="i-tabler-book-2 text-6xl text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No lessons available
        </h3>
        <p class="text-gray-600">
          Lessons will appear here once they're added to the system.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
</style>
