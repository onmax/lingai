<script setup lang="ts">
interface Props {
  sentence: Sentence
}

const props = defineProps<Props>()

const isPlayingAudio = ref(false)
const { isAudioLoading, getAudioUrl, hasAudio } = useAudioLoader()

// Reactive audio URL that updates when audio becomes available
const audioUrl = computed(() => getAudioUrl(props.sentence))
const audioAvailable = computed(() => hasAudio(props.sentence))

async function playAudio() {
  const currentAudioUrl = audioUrl.value
  if (isPlayingAudio.value || !currentAudioUrl)
    return

  try {
    isPlayingAudio.value = true
    const audio = new Audio(currentAudioUrl)

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

      <!-- Audio Button -->
      <button
        v-if="audioAvailable"
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

      <!-- Audio Loading Indicator -->
      <div
        v-else-if="isAudioLoading(sentence.id)"
        rounded-full
        p-3
        bg="blue-50"
        text-blue-500
        :aria-label="`Generating audio for: ${sentence.targetText}`"
        title="Audio is being generated..."
      >
        <div
          i-heroicons-arrow-path
          w-5
          h-5
          animate-spin
        />
      </div>

      <!-- Audio Not Available Indicator -->
      <div
        v-else-if="sentence.audioGenerated === false"
        rounded-full
        p-3
        bg="neutral-100"
        text-neutral-400
        :aria-label="`Audio generation pending for: ${sentence.targetText}`"
        title="Audio will be generated shortly..."
      >
        <div
          i-heroicons-clock
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
