<script setup lang="ts">
interface Props {
  sentence: Sentence
}

const props = defineProps<Props>()

const isPlayingAudio = ref(false)

async function playAudio() {
  if (isPlayingAudio.value || !props.sentence.audioUrl)
    return

  try {
    isPlayingAudio.value = true
    const audio = new Audio(props.sentence.audioUrl)

    audio.onended = () => {
      isPlayingAudio.value = false
    }

    audio.onerror = () => {
      isPlayingAudio.value = false
      consola.error('Failed to play audio')
    }

    await audio.play()
  }
  catch (error) {
    consola.error('Error playing audio:', error)
    isPlayingAudio.value = false
  }
}

function handleAudioKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    playAudio()
  }
}
</script>

<template>
  <div
    bg="white"
    border="1 neutral-200 rounded-lg"
    p-6
    shadow="sm hover:md"
    transition="all duration-200"
  >
    <div flex="~ items-start gap-4">
      <div flex-1>
        <!-- Target Language Sentence -->
        <p
          text="lg neutral-900"
          font-medium
          leading-relaxed
          mb-2
        >
          {{ sentence.targetText }}
        </p>

        <!-- Translation -->
        <p
          text="neutral-600"
          leading-relaxed
          mb-2
        >
          {{ sentence.userText }}
        </p>

        <!-- Context (if available) -->
        <p
          v-if="sentence.context"
          text="sm neutral-500"
          italic
        >
          {{ sentence.context }}
        </p>
      </div>

      <!-- Audio Button or Audio Placeholder -->
      <button
        v-if="sentence.audioUrl"
        type="button"
        rounded-full
        p-3
        bg="blue-50 hover:blue-100"
        text-blue-600
        transition="all duration-200"
        :disabled="isPlayingAudio"
        :class="{ 'animate-pulse': isPlayingAudio }"
        :aria-label="`Play audio for: ${sentence.targetText}`"
        @click="playAudio"
        @keydown="handleAudioKeyDown"
      >
        <div
          :class="isPlayingAudio ? 'i-heroicons-speaker-wave' : 'i-heroicons-play'"
          w-5
          h-5
        />
      </button>

      <!-- Audio Not Available Indicator -->
      <div
        v-else-if="sentence.audioGenerated === false"
        rounded-full
        p-3
        bg="neutral-100"
        text-neutral-400
        :aria-label="`Audio not available for: ${sentence.targetText}`"
        title="Audio generation in progress or unavailable"
      >
        <div
          i-heroicons-speaker-x-mark
          w-5
          h-5
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sentence-card:hover {
  transform: translateY(-2px);
}

.sentence-card:focus-within {
  outline: 2px solid rgb(59 130 246);
  outline-offset: 2px;
}
</style>
