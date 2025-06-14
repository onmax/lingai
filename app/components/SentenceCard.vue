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
    class="bg-white border border-neutral-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 w-full"
  >
    <div class="flex items-start gap-3 sm:gap-4 w-full">
      <div class="flex-1 min-w-0">
        <!-- Target Language Sentence -->
        <p
          class="text-base sm:text-lg text-neutral-900 font-medium leading-relaxed mb-2 break-words"
        >
          {{ sentence.targetText }}
        </p>

        <!-- Translation -->
        <p
          class="text-sm sm:text-base text-neutral-600 leading-relaxed mb-2 break-words"
        >
          {{ sentence.userText }}
        </p>

        <!-- Context (if available) -->
        <p
          v-if="sentence.context"
          class="text-xs sm:text-sm text-neutral-500 italic break-words"
        >
          {{ sentence.context }}
        </p>
      </div>

      <!-- Audio Button or Audio Placeholder -->
      <button
        v-if="sentence.audioUrl"
        type="button"
        class="shrink-0 rounded-full p-2 sm:p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200"
        :disabled="isPlayingAudio"
        :class="{ 'animate-pulse': isPlayingAudio }"
        :aria-label="`Play audio for: ${sentence.targetText}`"
        @click="playAudio"
        @keydown="handleAudioKeyDown"
      >
        <div
          :class="isPlayingAudio ? 'i-heroicons-speaker-wave' : 'i-heroicons-play'"
          class="w-4 h-4 sm:w-5 sm:h-5"
        />
      </button>

      <!-- Audio Not Available Indicator -->
      <div
        v-else-if="sentence.audioGenerated === false"
        class="shrink-0 rounded-full p-2 sm:p-3 bg-neutral-100 text-neutral-400"
        :aria-label="`Audio not available for: ${sentence.targetText}`"
        title="Audio generation in progress or unavailable"
      >
        <div
          class="i-heroicons-speaker-x-mark w-4 h-4 sm:w-5 sm:h-5"
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
