<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

// Check if user is already onboarded
const { data: userProfile } = await useFetch('/api/user/profile')

// If user is already onboarded (has profile and topics), redirect to Spanish lessons
if (userProfile.value?.profile && userProfile.value?.topics?.length > 0) {
  await navigateTo('/courses/spanish')
}

// Form data
const selectedTopics = ref<string[]>([])
const newTopicInput = ref('')
const isSubmitting = ref(false)

function addTopic() {
  const topic = newTopicInput.value.trim()
  if (topic && !selectedTopics.value.includes(topic)) {
    selectedTopics.value.push(topic)
    newTopicInput.value = ''
  }
}

function removeTopic(topic: string) {
  const index = selectedTopics.value.indexOf(topic)
  if (index > -1) {
    selectedTopics.value.splice(index, 1)
  }
}

function handleTopicKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    addTopic()
  }
}

// Submit and automatically generate lessons
async function handleSubmit() {
  if (isSubmitting.value || selectedTopics.value.length === 0)
    return

  try {
    isSubmitting.value = true

    // Submit onboarding and automatically generate lessons
    await $fetch('/api/onboarding', {
      method: 'POST',
      body: {
        topics: selectedTopics.value,
        targetLanguage: 'spanish',
      },
    })

    // Navigate to lessons page
    await navigateTo('/courses/spanish')
  }
  catch (error) {
    consola.error('Error during onboarding:', error)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-neutral-50 h-full px-6 flex items-center justify-center">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl text-neutral-900 font-bold mb-2">
          Welcome to Lingai!
        </h1>
        <p class="text-neutral-600">
          What topics interest you for learning Spanish?
        </p>
      </div>

      <div class="space-y-6">
        <!-- Topic input -->
        <div>
          <div class="flex gap-2 mb-4">
            <input
              v-model="newTopicInput"
              placeholder="Enter a topic (e.g., travel, food, business...)"
              class="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @keydown="handleTopicKeydown"
            >
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="!newTopicInput.trim()"
              @click="addTopic"
            >
              Add
            </button>
          </div>

          <!-- Selected topics -->
          <div v-if="selectedTopics.length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="topic in selectedTopics"
              :key="topic"
              class="flex items-center px-3 py-1 rounded-full text-sm text-blue-700 bg-blue-100"
            >
              {{ topic }}
              <button
                class="ml-2 text-blue-700 hover:text-blue-900"
                @click="removeTopic(topic)"
              >
                ×
              </button>
            </span>
          </div>

          <p v-if="selectedTopics.length === 0" class="text-sm text-neutral-500 mt-2">
            Add some topics that interest you to get started
          </p>
        </div>

        <!-- Submit button -->
        <button
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="selectedTopics.length === 0 || isSubmitting"
          @click="handleSubmit"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
            <div class="i-tabler:loader-2 w-4 h-4 animate-spin" />
            Creating your lessons...
          </span>
          <span v-else>
            Start Learning Spanish
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
