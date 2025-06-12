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
  <div bg-neutral-50 h-full px-6 flex="~ items-center justify-center">
    <div w="full max-w-md" space-y-8>
      <div text-center>
        <h1 text="3xl neutral-900" font-bold mb-2>
          Welcome to Lingai!
        </h1>
        <p text="neutral-600">
          What topics interest you for learning Spanish?
        </p>
      </div>

      <div space-y-6>
        <!-- Topic input -->
        <div>
          <div flex="~ gap-2" mb-4>
            <input
              v-model="newTopicInput"
              placeholder="Enter a topic (e.g., travel, food, business...)"
              flex-1 px-3 py-2 border="~ neutral-300" rounded-md text="f-sm"
              focus="outline-none ring-2 ring-blue-500 border-blue-500"
              @keydown="handleTopicKeydown"
            >
            <button
              nq-pill-blue
              :disabled="!newTopicInput.trim()"
              @click="addTopic"
            >
              Add
            </button>
          </div>

          <!-- Selected topics -->
          <div v-if="selectedTopics.length > 0" flex="~ wrap gap-2">
            <span
              v-for="topic in selectedTopics"
              :key="topic"
              flex="~ items-center" px-3 py-1 rounded-full text="f-sm blue-700" bg-blue-100
            >
              {{ topic }}
              <button
                ml-2 text="blue-700 hover:blue-900"
                @click="removeTopic(topic)"
              >
                ×
              </button>
            </span>
          </div>

          <p v-if="selectedTopics.length === 0" text="f-sm neutral-500" mt-2>
            Add some topics that interest you to get started
          </p>
        </div>

        <!-- Submit button -->
        <button
          nq-pill-blue w-full
          :disabled="selectedTopics.length === 0 || isSubmitting"
          @click="handleSubmit"
        >
          <span v-if="isSubmitting" flex="~ items-center justify-center gap-2">
            <div i-tabler:loader-2 w-4 h-4 animate-spin />
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
