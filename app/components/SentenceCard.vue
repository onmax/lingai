<script setup lang="ts">
interface Props {
  sentence: Sentence
  showTranslation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTranslation: false,
})

const showTranslation = ref(props.showTranslation)
const isPlayingAudio = ref(false)

function toggleTranslation() {
  showTranslation.value = !showTranslation.value
}

async function playAudio() {
  if (isPlayingAudio.value)
    return

  if (props.sentence.audioUrl) {
    try {
      isPlayingAudio.value = true
      const audio = new Audio(props.sentence.audioUrl)

      audio.onended = () => {
        isPlayingAudio.value = false
      }

      audio.onerror = () => {
        isPlayingAudio.value = false
        console.error('Failed to play audio')
      }

      await audio.play()
    }
    catch (error) {
      console.error('Error playing audio:', error)
      isPlayingAudio.value = false
    }
  }
  else {
    // TODO: Generate audio on demand when not available
    console.warn('Audio not available for this sentence')
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleTranslation()
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
    class="sentence-card"
    bg="white"
    border="1 neutral-200 rounded-12"
    p-24
    shadow="sm hover:md"
    transition="all duration-200"
  >
    <!-- Target Language Sentence -->
    <div
      flex="~ items-start gap-16"
      mb-16
    >
      <div flex-1>
        <p
          text="f-lg neutral-900"
          font-medium
          leading-relaxed
          mb-8
        >
          {{ sentence.targetText }}
        </p>

        <!-- Translation (with opacity when shown) -->
        <div
          v-if="showTranslation"
          text="f-md neutral-600"
          opacity-75
          leading-relaxed
        >
          {{ sentence.userText }}
        </div>

        <!-- Context (if available) -->
        <div
          v-if="sentence.context"
          text="f-sm neutral-500"
          mt-12
          italic
        >
          {{ sentence.context }}
        </div>
      </div>

      <!-- Audio Button -->
      <button
        type="button"
        bg="blue-50 hover:blue-100"
        text="blue-600"
        border="none"
        rounded-full
        p-12
        transition="all duration-200"
        :disabled="isPlayingAudio"
        :class="{ 'animate-pulse': isPlayingAudio }"
        :aria-label="`Play audio for: ${sentence.targetText}`"
        @click="playAudio"
        @keydown="handleAudioKeyDown"
      >
        <div
          v-if="isPlayingAudio"
          i-heroicons-speaker-wave
          w-20
          h-20
        />
        <div
          v-else
          i-heroicons-speaker-wave
          w-20
          h-20
        />
      </button>
    </div>

    <!-- Toggle Translation Button -->
    <button
      type="button"
      text="f-sm blue-600 hover:blue-800"
      bg="transparent hover:blue-50"
      border="1 blue-200 hover:blue-300 rounded-8"
      px-16
      py-8
      transition="all duration-200"
      w-full
      :aria-label="showTranslation ? 'Hide translation' : 'Show translation'"
      @click="toggleTranslation"
      @keydown="handleKeyDown"
    >
      {{ showTranslation ? 'Hide Translation' : 'Show Translation' }}
    </button>
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
