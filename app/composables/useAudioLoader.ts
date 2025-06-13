export function useAudioLoader() {
  const audioLoadingStates = ref<Record<number, boolean>>({})
  const audioUrls = ref<Record<number, string>>({})
  const pollingIntervals = ref<Record<number, NodeJS.Timeout>>({})

  // Callback to refresh lesson data when audio becomes available
  let refreshLessonData: (() => void) | null = null

  /**
   * Stop polling for a specific sentence
   */
  const stopPolling = (sentenceId: number) => {
    const interval = pollingIntervals.value[sentenceId]
    if (interval) {
      clearInterval(interval)
      delete pollingIntervals.value[sentenceId]
    }
    delete audioLoadingStates.value[sentenceId]
  }

  /**
   * Stop all polling intervals
   */
  const stopAllPolling = () => {
    Object.values(pollingIntervals.value).forEach(clearInterval)
    pollingIntervals.value = {}
    audioLoadingStates.value = {}
  }

  /**
   * Check if audio is loading for a specific sentence
   */
  const isAudioLoading = (sentenceId: number): boolean => {
    return audioLoadingStates.value[sentenceId] || false
  }

  /**
   * Get the audio URL for a sentence (either from cache or original)
   */
  const getAudioUrl = (sentence: Sentence): string | undefined => {
    const cachedUrl = audioUrls.value[sentence.id]
    const originalUrl = sentence.audioUrl
    const result = cachedUrl || originalUrl
    console.warn(`getAudioUrl for sentence ${sentence.id}: cached=${cachedUrl}, original=${originalUrl}, result=${result}`)
    return result
  }

  /**
   * Check if audio is available for a sentence
   */
  const hasAudio = (sentence: Sentence): boolean => {
    const result = Boolean(getAudioUrl(sentence))
    console.warn(`hasAudio for sentence ${sentence.id}: ${result}`)
    return result
  }

  /**
   * Start polling for audio availability for sentences without audio
   */
  const startAudioPolling = (sentences: Sentence[], onAudioReady?: () => void) => {
    // Store the refresh callback
    refreshLessonData = onAudioReady || null

    // Stop any existing polling
    stopAllPolling()

    sentences.forEach((sentence) => {
      // Only poll for sentences that should have audio but don't yet
      if (sentence.audioGenerated === false && !sentence.audioUrl) {
        audioLoadingStates.value[sentence.id] = true

        // Poll every 2 seconds
        const interval = setInterval(async () => {
          try {
            console.warn(`Checking audio for sentence ${sentence.id}...`)
            // Check if audio is now available
            const response = await $fetch<{ sentence: Sentence }>(`/api/lessons/sentences/${sentence.id}`)

            console.warn(`Sentence ${sentence.id} response:`, response.sentence)

            if (response.sentence.audioUrl) {
              console.warn(`Audio now available for sentence ${sentence.id}:`, response.sentence.audioUrl)
              // Audio is now available, store it in our reactive cache
              audioUrls.value[sentence.id] = response.sentence.audioUrl

              // Stop polling for this sentence
              stopPolling(sentence.id)

              // Refresh lesson data if callback is provided
              if (refreshLessonData) {
                console.warn(`Refreshing lesson data due to audio availability for sentence ${sentence.id}`)
                refreshLessonData()
              }
            }
            else {
              console.warn(`Audio still not available for sentence ${sentence.id}`)
            }
          }
          catch (error) {
            console.error(`Failed to check audio for sentence ${sentence.id}:`, error)
          }
        }, 2000)

        pollingIntervals.value[sentence.id] = interval
      }
    })
  }

  /**
   * Clean up intervals when component unmounts
   */
  onBeforeUnmount(() => {
    stopAllPolling()
  })

  return {
    isAudioLoading,
    getAudioUrl,
    hasAudio,
    startAudioPolling,
    stopPolling,
    stopAllPolling,
  }
}
