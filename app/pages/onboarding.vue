<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'

// Set page meta for authentication
definePageMeta({
  middleware: 'auth',
})

// Check if user is already onboarded
const { data: userProfile } = await useFetch('/api/user/profile')

// If user is already onboarded (has profile and topics), redirect to Spanish lessons
if (userProfile.value?.profile && userProfile.value?.topics?.length > 0) {
  await navigateTo('/courses/spanish')
}

// Use VueUse stepper
const stepper = useStepper([
  'topics',
  'ready',
])

// Form data - hardcode Spanish learning
const selectedTopics = ref<string[]>([])

// Topic input
const newTopicInput = ref('')

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

// Submit onboarding data using useFetch - hardcode Spanish
const { status: submitStatus, data: submitData, execute: submitOnboarding } = await useFetch('/api/onboarding', {
  method: 'POST',
  body: {
    topics: selectedTopics,
    targetLanguage: 'spanish', // Hardcoded
  },
  immediate: false,
  onResponse: ({ response }) => {
    if (response._data?.success) {
      // Show a brief message about lesson generation before redirecting
      setTimeout(() => {
        navigateTo('/courses/spanish')
      }, 2000)
    }
  },
  onResponseError: ({ error }) => {
    console.error('Onboarding submission failed:', error)
  },
})

// Handle button click for submit
function handleSubmitClick() {
  submitOnboarding()
}
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.6, ease: 'easeOut' }"
    bg-neutral-50 h-full f-px-sm flex="~ items-center justify-center"
  >
    <div w="f-lg full" flex="~ col gap-f-sm">
      <motion.div
        :initial="{ opacity: 0, y: -10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.2 }"
      >
        <h2 mt-f-xs text="center nq-900 f-2xl" font-extrabold>
          Welcome to Lingai!
        </h2>
        <p mt-f-3xs text="center neutral-600 f-sm">
          Let's personalize your language learning experience
        </p>
      </motion.div>

      <!-- Progress indicator -->
      <motion.div
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 0.4, delay: 0.3 }"
        flex="~ justify-center gap-4" mb-8
      >
        <motion.div
          v-for="(step, index) in stepper.steps.value"
          :key="step"
          w-3 h-3 rounded-full
          :class="index <= stepper.index.value ? 'bg-blue' : 'bg-neutral-300'"
          :animate="{
            scale: index <= stepper.index.value ? 1.1 : 1,
            backgroundColor: index <= stepper.index.value ? 'rgb(59, 130, 246)' : 'rgb(209, 213, 219)',
          }"
          :transition="{ duration: 0.3, ease: 'easeOut' }"
        />
      </motion.div>

      <!-- Step Content Container -->
      <AnimatePresence mode="wait">
        <!-- Step 1: Topics Selection -->
        <motion.div
          v-if="stepper.isCurrent('topics')"
          key="topics"
          :initial="{ opacity: 0, x: 20 }"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: -20 }"
          :transition="{ duration: 0.4, ease: 'easeOut' }"
          flex="~ col gap-6"
        >
          <div>
            <motion.h3
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.3, delay: 0.1 }"
              text="neutral-900 f-lg" font-medium mb-4
            >
              What topics interest you?
            </motion.h3>
            <motion.p
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :transition="{ duration: 0.3, delay: 0.2 }"
              text="neutral-600 f-sm" mb-4
            >
              Add the topics you'd like to focus on in your language learning journey.
            </motion.p>

            <!-- Simple topic input -->
            <motion.div
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.3, delay: 0.3 }"
              mb-4 flex="~ gap-2"
            >
              <input
                v-model="newTopicInput"
                placeholder="Enter a topic (e.g., travel, food, business...)"
                flex-1 block w-full px-3 py-2 border="~ neutral-300" rounded-md shadow-sm text="f-sm"
                focus="outline-none ring-blue border-blue"
                @keydown="handleTopicKeydown"
              >
              <motion.button
                nq-pill-blue
                :disabled="!newTopicInput.trim()"
                :while-hover="{ scale: 1.02 }"
                :while-tap="{ scale: 0.98 }"
                :transition="{ duration: 0.1 }"
                @click="addTopic"
              >
                Add
              </motion.button>
            </motion.div>

            <!-- Selected topics -->
            <AnimatePresence>
              <motion.div
                v-if="selectedTopics.length > 0"
                :initial="{ opacity: 0, height: 0 }"
                :animate="{ opacity: 1, height: 'auto' }"
                :exit="{ opacity: 0, height: 0 }"
                :transition="{ duration: 0.3 }"
                flex="~ wrap gap-2"
              >
                <motion.span
                  v-for="topic in selectedTopics"
                  :key="topic"
                  :initial="{ opacity: 0, scale: 0.8, y: 10 }"
                  :animate="{ opacity: 1, scale: 1, y: 0 }"
                  :exit="{ opacity: 0, scale: 0.8, y: -10 }"
                  :transition="{ duration: 0.3, ease: 'backOut' }"
                  :while-hover="{ scale: 1.05 }"
                  inline-flex="~ items-center" px-3 py-1 rounded-full text="f-sm blue" bg-blue-50 capitalize
                >
                  {{ topic }}
                  <motion.button
                    ml-2 text="blue hocus:blue-700"
                    :while-hover="{ scale: 1.2 }"
                    :while-tap="{ scale: 0.9 }"
                    :transition="{ duration: 0.1 }"
                    @click="removeTopic(topic)"
                  >
                    ×
                  </motion.button>
                </motion.span>
              </motion.div>
            </AnimatePresence>

            <motion.p
              v-if="selectedTopics.length === 0"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :transition="{ duration: 0.3, delay: 0.4 }"
              text="neutral-500 f-sm" mt-2
            >
              No topics added yet. Add some topics that interest you!
            </motion.p>
          </div>

          <motion.div
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.3, delay: 0.5 }"
            flex="~ justify-end"
          >
            <motion.button
              nq-pill-blue nq-arrow
              :disabled="selectedTopics.length === 0"
              :while-hover="selectedTopics.length > 0 ? { scale: 1.02 } : {}"
              :while-tap="selectedTopics.length > 0 ? { scale: 0.98 } : {}"
              :transition="{ duration: 0.1 }"
              @click="stepper.goToNext"
            >
              Next
            </motion.button>
          </motion.div>
        </motion.div>

        <!-- Step 2: Ready to Learn Spanish -->
        <motion.div
          v-if="stepper.isCurrent('ready')"
          key="ready"
          :initial="{ opacity: 0, x: 20 }"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: -20 }"
          :transition="{ duration: 0.4, ease: 'easeOut' }"
          flex="~ col gap-6"
        >
          <div text-center>
            <motion.div
              :initial="{ opacity: 0, scale: 0.5, rotate: -10 }"
              :animate="{ opacity: 1, scale: 1, rotate: 0 }"
              :transition="{ duration: 0.5, ease: 'backOut', delay: 0.1 }"
              text="6xl" mb-6
            >
              🎉
            </motion.div>
            <motion.h3
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.4, delay: 0.2 }"
              text="neutral-900 2xl" font-bold mb-4
            >
              ¡Vamos a aprender español!
            </motion.h3>
            <motion.p
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :transition="{ duration: 0.4, delay: 0.3 }"
              text="neutral-600 f-base" mb-6
            >
              You're all set! Let's start your Spanish learning journey with the topics you've chosen.
            </motion.p>

            <motion.div
              v-if="selectedTopics.length > 0"
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.4, delay: 0.4 }"
              mb-6
            >
              <p text="neutral-700 f-sm" mb-3>
                Your selected topics:
              </p>
              <div flex="~ wrap gap-2 justify-center">
                <motion.span
                  v-for="(topic, index) in selectedTopics"
                  :key="topic"
                  :initial="{ opacity: 0, scale: 0.8 }"
                  :animate="{ opacity: 1, scale: 1 }"
                  :transition="{ duration: 0.3, delay: 0.5 + index * 0.1 }"
                  inline-flex="~ items-center" px-3 py-1 rounded-full text="f-sm blue" bg-blue-50 capitalize
                >
                  {{ topic }}
                </motion.span>
              </div>
            </motion.div>
          </div>

          <motion.div
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.4, delay: 0.6 }"
            flex="~ justify-between"
          >
            <motion.button
              nq-pill
              :while-hover="{ scale: 1.02 }"
              :while-tap="{ scale: 0.98 }"
              :transition="{ duration: 0.1 }"
              @click="stepper.goToPrevious"
            >
              Back
            </motion.button>
            <motion.button
              nq-pill-blue nq-arrow
              :disabled="submitStatus === 'pending' || submitStatus === 'success'"
              :while-hover="submitStatus === 'idle' ? { scale: 1.02 } : {}"
              :while-tap="submitStatus === 'idle' ? { scale: 0.98 } : {}"
              :transition="{ duration: 0.1 }"
              @click="handleSubmitClick"
            >
              <span v-if="submitStatus === 'idle'">¡Empezar!</span>
              <span v-else-if="submitStatus === 'pending'" flex="~ items-center gap-2">
                <div i-tabler:loader-2 w-4 h-4 animate-spin />
                Setting up...
              </span>
              <span v-else-if="submitStatus === 'success'" flex="~ items-center gap-2">
                <div i-tabler:check w-4 h-4 />
                {{ submitData?.message || 'Success!' }}
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  </motion.div>
</template>
