<script setup lang="ts">
interface Props {
  sentence: Sentence
}

const props = defineProps<Props>()
const emit = defineEmits<{
  audioGenerated: [sentenceId: number]
}>()

const isPlayingAudio = ref(false)
const isGeneratingAudio = ref(false)
const playbackSpeed = ref(1) // Default speed is 1x
const showSpeedMenu = ref(false)

// Available playback speeds
const speedOptions = [
  { value: 1, label: '1x' },
  { value: 0.75, label: '0.75x' },
  { value: 0.5, label: '0.5x' },
]

async function playAudio() {
  if (isPlayingAudio.value || isGeneratingAudio.value)
    return

  if (props.sentence.audioUrl) {
    try {
      isPlayingAudio.value = true
      const audio = new Audio(props.sentence.audioUrl)

      // Set the playback speed
      audio.playbackRate = playbackSpeed.value

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
  else {
    // Audio not available - try to generate it
    await generateAudio()
  }
}

function setPlaybackSpeed(speed: number) {
  playbackSpeed.value = speed
  showSpeedMenu.value = false
}

function toggleSpeedMenu() {
  showSpeedMenu.value = !showSpeedMenu.value
}

// Close speed menu when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.speed-control-container')) {
    showSpeedMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

async function generateAudio() {
  if (isGeneratingAudio.value)
    return

  try {
    isGeneratingAudio.value = true

    // Get lesson ID from the sentence to call the generation endpoint
    const response = await $fetch(`/api/lessons/${props.sentence.lessonId}/generate-audio`, {
      method: 'POST',
    })

    if (response.success && response.generated > 0) {
      // Emit event to parent to refresh data
      emit('audioGenerated', props.sentence.id)
    }
  }
  catch (error) {
    consola.error('Error generating audio:', error)
  }
  finally {
    isGeneratingAudio.value = false
  }
}

function handleAudioKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    playAudio()
  }
}

function handleSpeedKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleSpeedMenu()
  }
}
</script>

<template>
  <div
    bg="white"
    border="1 neutral-200 rounded-12"
    p-24
    shadow="sm hover:md"
    transition="all duration-200"
  >
    <!-- Target Language Sentence -->
    <div flex="~ items-start gap-16" mb-16>
      <div flex-1>
        <p
          text="f-lg neutral-900"
          font-medium
          leading-relaxed
          mb-8
        >
          {{ sentence.targetText }}
        </p>

        <!-- Translation -->
        <div
          text="f-md neutral-600"
          leading-relaxed
          mb-8
        >
          {{ sentence.userText }}
        </div>

        <!-- Context (if available) -->
        <div
          v-if="sentence.context"
          text="f-sm neutral-500"
          italic
        >
          {{ sentence.context }}
        </div>
      </div>

      <!-- Audio Controls Container -->
      <div flex="~ items-center gap-8">
        <!-- Speed Control Button (only show if audio exists) -->
        <div
          v-if="sentence.audioUrl"
          class="speed-control-container"
          relative
        >
          <button
            type="button"
            border="1 neutral-300"
            rounded-full
            px-8
            py-4
            transition="all duration-200"
            text="f-xs neutral-600 hover:neutral-900"
            bg="neutral-50 hover:neutral-100"
            :disabled="isPlayingAudio || isGeneratingAudio"
            :class="{ 'opacity-50 cursor-not-allowed': isPlayingAudio || isGeneratingAudio }"
            :aria-label="`Playback speed: ${playbackSpeed}x`"
            @click="toggleSpeedMenu"
            @keydown="handleSpeedKeyDown"
          >
            {{ playbackSpeed }}x
          </button>

          <!-- Speed Menu Dropdown -->
          <div
            v-if="showSpeedMenu"
            absolute
            top="100%"
            right-0
            mt-4
            bg="white"
            border="1 neutral-300 rounded-8"
            shadow-lg
            z-10
            min-w-20
            py-4
          >
            <button
              v-for="option in speedOptions"
              :key="option.value"
              type="button"
              w-full
              px-12
              py-6
              text="f-xs left"
              transition="colors duration-200"
              :class="{
                'bg-blue-50 text-blue-600': option.value === playbackSpeed,
                'text-neutral-700 hover:bg-neutral-50': option.value !== playbackSpeed,
              }"
              @click="setPlaybackSpeed(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Main Audio Button -->
        <button
          type="button"
          border="none"
          rounded-full
          p-12
          transition="all duration-200"
          :disabled="isPlayingAudio || isGeneratingAudio"
          :class="{
            'bg-blue-50 hover:bg-blue-100 text-blue-600': sentence.audioUrl && !isGeneratingAudio,
            'bg-orange-50 hover:bg-orange-100 text-orange-600': !sentence.audioUrl && !isGeneratingAudio,
            'bg-neutral-100 text-neutral-400': isGeneratingAudio,
            'animate-pulse': isPlayingAudio || isGeneratingAudio,
          }"
          :aria-label="sentence.audioUrl
            ? `Play audio for: ${sentence.targetText}`
            : `Generate audio for: ${sentence.targetText}`"
          @click="playAudio"
          @keydown="handleAudioKeyDown"
        >
          <div
            v-if="isGeneratingAudio"
            i-heroicons-arrow-path
            w-20
            h-20
            animate-spin
          />
          <div
            v-else-if="isPlayingAudio"
            i-heroicons-speaker-wave
            w-20
            h-20
          />
          <div
            v-else-if="sentence.audioUrl"
            i-heroicons-speaker-wave
            w-20
            h-20
          />
          <div
            v-else
            i-heroicons-musical-note
            w-20
            h-20
          />
        </button>
      </div>
    </div>

    <!-- Audio status indicator -->
    <div v-if="!sentence.audioUrl && !isGeneratingAudio" text="f-xs neutral-400" italic>
      Click the audio button to generate speech
    </div>
    <div v-else-if="isGeneratingAudio" text="f-xs blue-600" italic>
      Generating audio...
    </div>
    <div v-else-if="sentence.audioUrl && playbackSpeed !== 1" text="f-xs blue-600" italic>
      Audio will play at {{ playbackSpeed }}x speed
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
