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

async function playAudio() {
  if (isPlayingAudio.value || isGeneratingAudio.value)
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

      <!-- Audio Button -->
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

    <!-- Audio status indicator -->
    <div v-if="!sentence.audioUrl && !isGeneratingAudio" text="f-xs neutral-400" italic>
      Click the audio button to generate speech
    </div>
    <div v-else-if="isGeneratingAudio" text="f-xs blue-600" italic>
      Generating audio...
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
