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
    class="bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 sentence-card"
  >
    <div class="grid grid-cols-12 gap-6 p-6">
      <!-- Target Language Sentence - Left Column -->
      <div class="col-span-5">
        <p class="text-lg text-neutral-900 font-medium leading-relaxed">
          {{ sentence.targetText }}
        </p>
      </div>

      <!-- Translation - Middle Column -->
      <div class="col-span-5">
        <p class="text-base text-neutral-600 leading-relaxed">
          {{ sentence.userText }}
        </p>
        
        <!-- Context (if available) -->
        <p
          v-if="sentence.context"
          class="text-sm text-neutral-500 italic mt-2"
        >
          {{ sentence.context }}
        </p>
      </div>

      <!-- Audio Button - Right Column -->
      <div class="col-span-2 flex justify-end items-start">
        <button
          v-if="audioAvailable"
          type="button"
          class="shrink-0 rounded-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200"
          :disabled="isPlayingAudio"
          :class="{ 'animate-pulse': isPlayingAudio }"
          :aria-label="`Play audio for: ${sentence.targetText}`"
          @click="playAudio"
          @keydown="handleAudioKeyDown"
        >
          <div
            :class="isPlayingAudio ? 'i-heroicons-speaker-wave' : 'i-heroicons-play'"
            class="w-5 h-5"
          />
        </button>

        <!-- Audio Loading Indicator -->
        <div
          v-else-if="isAudioLoading(sentence.id)"
          class="shrink-0 rounded-full p-3 bg-blue-50 text-blue-500"
          :aria-label="`Generating audio for: ${sentence.targetText}`"
          title="Audio is being generated..."
        >
          <div class="i-heroicons-arrow-path w-5 h-5 animate-spin" />
        </div>

        <!-- Audio Not Available Indicator -->
        <div
          v-else-if="sentence.audioGenerated === false"
          class="shrink-0 rounded-full p-3 bg-neutral-100 text-neutral-400"
          :aria-label="`Audio not available for: ${sentence.targetText}`"
          title="Audio generation in progress or unavailable"
        >
          <div class="i-heroicons-speaker-x-mark w-5 h-5" />
        </div>
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
