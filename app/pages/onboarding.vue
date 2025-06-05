<script setup lang="ts">
// Set page meta for authentication
definePageMeta({
  middleware: 'auth',
})

// Onboarding state
const currentStep = ref(1)
const totalSteps = 3

// Form data
const selectedTopics = ref<string[]>([])
const userLanguages = ref<Array<{ language: string, level: string }>>([])
const targetLanguage = ref('spanish')

// Available languages data using useFetch
const { data: availableLanguages } = await useFetch('/api/languages', {
  default: () => [],
})

// Available topics data using useFetch
const { data: availableTopics } = await useFetch('/api/topics', {
  default: () => [],
})

// Topic selection with combobox
const topicSearchValue = ref('')
const isTopicComboboxOpen = ref(false)

// Filtered topics based on search
const filteredTopics = computed(() => {
  if (!topicSearchValue.value)
    return availableTopics.value
  return availableTopics.value?.filter((topic: string) =>
    topic.toLowerCase().includes(topicSearchValue.value.toLowerCase()),
  ) || []
})

function addTopic(topic: string) {
  if (topic.trim() && !selectedTopics.value.includes(topic.trim())) {
    selectedTopics.value.push(topic.trim())
    topicSearchValue.value = ''
    isTopicComboboxOpen.value = false
  }
}

function removeTopic(topic: string) {
  const index = selectedTopics.value.indexOf(topic)
  if (index > -1) {
    selectedTopics.value.splice(index, 1)
  }
}

const languageLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'native', label: 'Native' },
]

// Add a language to the user's list
function addLanguage() {
  userLanguages.value.push({ language: '', level: 'beginner' })
}

// Remove a language from the user's list
function removeLanguage(index: number) {
  userLanguages.value.splice(index, 1)
}

// Navigate between steps
function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Submit onboarding data using useFetch
const { data: submitResult, status: submitStatus, execute: submitOnboarding } = await useFetch('/api/onboarding', {
  method: 'POST',
  body: {
    topics: selectedTopics,
    languages: userLanguages,
    targetLanguage,
  },
  immediate: false,
})

// Watch for successful submission
watch(submitResult, (result) => {
  if (result?.success) {
    navigateTo('/user')
  }
})

// Initialize with one language input
if (userLanguages.value.length === 0) {
  addLanguage()
}
</script>

<template>
  <div min-h-screen bg-neutral-50 flex="~ items-center justify-center" py-12 px-4>
    <div w="320 full" flex="~ col gap-8">
      <div>
        <h2 mt-6 text="center neutral-900 3xl" font-extrabold>
          Welcome to Lingua!
        </h2>
        <p mt-2 text="center neutral-600 f-sm">
          Let's personalize your language learning experience
        </p>
      </div>

      <!-- Progress indicator -->
      <div flex="~ justify-center gap-4" mb-8>
        <div
          v-for="step in totalSteps"
          :key="step"
          w-3 h-3 rounded-full
          :class="step <= currentStep ? 'bg-blue' : 'bg-neutral-300'"
        />
      </div>

      <!-- Step 1: Topics Selection -->
      <div v-if="currentStep === 1" flex="~ col gap-6">
        <div>
          <h3 text="neutral-900 f-lg" font-medium mb-4>
            What topics interest you?
          </h3>
          <p text="neutral-600 f-sm" mb-4>
            Add the topics you'd like to focus on in your language learning journey.
          </p>

          <!-- Topic selection with Reka UI Combobox -->
          <div mb-4>
            <ComboboxRoot
              v-model:open="isTopicComboboxOpen"
              v-model:search-term="topicSearchValue"
            >
              <ComboboxAnchor as-child>
                <div relative>
                  <ComboboxInput
                    placeholder="Search and select topics..."
                    flex-1 block w-full px-3 py-2 border="~ neutral-300" rounded-md shadow-sm text="f-sm"
                    focus="outline-none ring-blue border-blue"
                  />
                  <ComboboxTrigger
                    absolute right-2 top="1/2" translate-y="-1/2" p-1 text="neutral-500 hocus:neutral-700"
                  >
                    <div i-heroicons-chevron-down-20-solid w-4 h-4 />
                  </ComboboxTrigger>
                </div>
              </ComboboxAnchor>

              <ComboboxContent
                position="popper"
                side="bottom"
                align="start"
                avoid-collisions
                z-50 max-h-60 w="[--reka-combobox-trigger-width]" of-auto rounded-md border="~ neutral-200" bg-white py-1 shadow-lg
              >
                <ComboboxViewport>
                  <ComboboxEmpty px-2 py-3 text="f-sm neutral-500 center">
                    No topics found.
                  </ComboboxEmpty>
                  <ComboboxItem
                    v-for="topic in filteredTopics"
                    :key="topic"
                    :value="topic"
                    relative flex="~ items-center" cursor-default select-none py-2 px-3 text="f-sm neutral-900"
                    bg="hocus:neutral-100 reka-highlighted:neutral-100" outline-none capitalize
                    @select="() => addTopic(topic)"
                  >
                    <ComboboxItemIndicator
                      absolute left-2 flex="~ items-center justify-center" h-3.5 w-3.5
                    >
                      <div i-heroicons-check-20-solid w-4 h-4 />
                    </ComboboxItemIndicator>
                    <span ml-6>{{ topic }}</span>
                  </ComboboxItem>
                </ComboboxViewport>
              </ComboboxContent>
            </ComboboxRoot>
          </div>

          <!-- Selected topics -->
          <div v-if="selectedTopics.length > 0" flex="~ wrap gap-2">
            <span
              v-for="topic in selectedTopics"
              :key="topic"
              inline-flex="~ items-center" px-3 py-1 rounded-full text="f-sm blue" bg-blue-50 capitalize
            >
              {{ topic }}
              <button
                ml-2 text="blue hocus:blue-700"
                @click="removeTopic(topic)"
              >
                ×
              </button>
            </span>
          </div>

          <p v-if="selectedTopics.length === 0" text="neutral-500 f-sm" mt-2>
            No topics added yet. Add some topics that interest you!
          </p>
        </div>

        <div flex="~ justify-end">
          <button
            nq-pill-blue nq-arrow
            :disabled="selectedTopics.length === 0"
            @click="nextStep"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Step 2: Languages & Levels -->
      <div v-if="currentStep === 2" flex="~ col gap-6">
        <div>
          <h3 text="neutral-900 f-lg" font-medium mb-4>
            What languages do you speak?
          </h3>
          <p text="neutral-600 f-sm" mb-4>
            Tell us about your current language skills.
          </p>

          <div v-if="availableLanguages && availableLanguages.length > 0" flex="~ col gap-4">
            <div
              v-for="(lang, index) in userLanguages"
              :key="index"
              flex="~ items-center gap-3"
            >
              <select
                v-model="lang.language"
                flex-1 block w-full px-3 py-2 border="~ neutral-300" rounded-md shadow-sm text="f-sm"
                focus="outline-none ring-blue border-blue"
              >
                <option value="">
                  Select a language
                </option>
                <option
                  v-for="availableLang in availableLanguages"
                  :key="availableLang.id"
                  :value="availableLang.code"
                >
                  {{ availableLang.name }}
                </option>
              </select>

              <select
                v-model="lang.level"
                block w-32 px-3 py-2 border="~ neutral-300" rounded-md shadow-sm text="f-sm"
                focus="outline-none ring-blue border-blue"
              >
                <option
                  v-for="level in languageLevels"
                  :key="level.value"
                  :value="level.value"
                >
                  {{ level.label }}
                </option>
              </select>

              <button
                v-if="userLanguages.length > 1"
                nq-pill text="red-600 hocus:red-800"
                @click="removeLanguage(index)"
              >
                ×
              </button>
            </div>
          </div>

          <div v-else text="center" py-8>
            <p text="f-sm neutral-500">
              Loading languages...
            </p>
          </div>

          <button
            v-if="availableLanguages && availableLanguages.length > 0"
            nq-pill-blue nq-arrow
            @click="addLanguage"
          >
            Add Another Language
          </button>
        </div>

        <div flex="~ justify-between">
          <button
            nq-pill
            @click="prevStep"
          >
            Back
          </button>
          <button
            nq-pill-blue nq-arrow
            :disabled="userLanguages.some(lang => !lang.language)"
            @click="nextStep"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Step 3: Target Language -->
      <div v-if="currentStep === 3" flex="~ col gap-6">
        <div>
          <h3 text="neutral-900 f-lg" font-medium mb-4>
            What language do you want to learn?
          </h3>
          <p text="neutral-600 f-sm" mb-4>
            For now, we're focusing on Spanish, but more languages are coming soon!
          </p>

          <div flex="~ col gap-3">
            <label relative flex="~ items-center gap-3" rounded-lg border-blue-200 bg-white px-6 py-4 shadow-sm ring="2 blue">
              <input
                v-model="targetLanguage"
                value="spanish"
                type="radio"
                h-4 w-4 text-blue border-neutral-300 focus:ring-blue
              >
              <div min-w-0 flex-1>
                <span text="f-sm neutral-900" font-medium>
                  Spanish (Español)
                </span>
                <p text="f-xs neutral-500">
                  Learn Spanish with our Assimil + Anki method
                </p>
              </div>
            </label>
          </div>
        </div>

        <div flex="~ justify-between">
          <button
            nq-pill
            @click="prevStep"
          >
            Back
          </button>
          <button
            nq-pill-blue nq-arrow
            :disabled="submitStatus === 'pending'"
            @click="submitOnboarding"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
