<script setup lang="ts">
interface Props {
  markdownUrl: string
}

const props = defineProps<Props>()

// Fetch the markdown content
const { data: markdownContent, pending, error } = await useFetch<string>(props.markdownUrl)
</script>

<template>
  <div class="recap-content">
    <!-- Loading state -->
    <div v-if="pending" class="text-center py-12">
      <div class="i-heroicons-arrow-path w-8 h-8 text-neutral-300 mx-auto mb-4 animate-spin" />
      <p class="text-neutral-600">Loading recap content...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-12">
      <div class="i-heroicons-exclamation-triangle w-8 h-8 text-red-400 mx-auto mb-4" />
      <p class="text-red-600">Failed to load recap content</p>
    </div>

    <!-- Render markdown content with enhanced prose styling -->
    <div
      v-else-if="markdownContent"
      class="recap-markdown-content bg-white rounded-2xl shadow-lg p-8"
    >
      <div
        class="prose"
        v-html="useMarkdown(markdownContent)"
      />
    </div>
  </div>
</template>

<style scoped>
/* Enhanced custom styling for recap content */
.recap-content :deep(.prose) {
  line-height: 1.7;
}

/* Beautiful gradient text for headings */
.recap-content :deep(.prose h1) {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Styled h2 with left border */
.recap-content :deep(.prose h2) {
  position: relative;
  padding-left: 1rem;
}

.recap-content :deep(.prose h2::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: linear-gradient(to bottom, #7c3aed, #a855f7);
  border-radius: 2px;
}

/* Enhanced details/summary for answer keys */
.recap-content :deep(.prose details) {
  margin: 1.5rem 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.recap-content :deep(.prose details[open]) {
  background: #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.recap-content :deep(.prose summary) {
  cursor: pointer;
  font-weight: 600;
  color: #7c3aed;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.recap-content :deep(.prose summary:hover) {
  background-color: #f3f4f6;
}

/* Beautiful tables */
.recap-content :deep(.prose table) {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}

.recap-content :deep(.prose th) {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  color: white;
  font-weight: 600;
}

.recap-content :deep(.prose tr:nth-child(even)) {
  background-color: #f9fafb;
}

/* Enhanced code styling */
.recap-content :deep(.prose code) {
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

/* Gradient text for strong elements */
.recap-content :deep(.prose strong) {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* List styling improvements */
.recap-content :deep(.prose ul li) {
  position: relative;
  padding-left: 0.5rem;
}

.recap-content :deep(.prose ul li::marker) {
  color: #7c3aed;
}

.recap-content :deep(.prose ol li::marker) {
  color: #7c3aed;
  font-weight: 600;
}
</style>
