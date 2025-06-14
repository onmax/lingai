export function useComicImageLoader() {
  const imageLoadingStates = ref<Record<number, boolean>>({})
  const imageUrls = ref<Record<number, string>>({})
  const pollingIntervals = ref<Record<number, NodeJS.Timeout>>({})

  // Callback to refresh lesson data when comic image becomes available
  let refreshLessonData: (() => void) | null = null

  /**
   * Stop polling for a specific lesson
   */
  const stopPolling = (lessonId: number) => {
    const interval = pollingIntervals.value[lessonId]
    if (interval) {
      clearInterval(interval)
      delete pollingIntervals.value[lessonId]
    }
    delete imageLoadingStates.value[lessonId]
  }

  /**
   * Stop all polling intervals
   */
  const stopAllPolling = () => {
    Object.values(pollingIntervals.value).forEach(clearInterval)
    pollingIntervals.value = {}
    imageLoadingStates.value = {}
  }

  /**
   * Check if comic image is loading for a specific lesson
   */
  const isImageLoading = (lessonId: number): boolean => {
    return imageLoadingStates.value[lessonId] || false
  }

  /**
   * Get the comic image URL for a lesson (either from cache or original)
   */
  const getImageUrl = (lesson: Lesson): string | undefined => {
    const cachedUrl = imageUrls.value[lesson.id]
    const originalUrl = lesson.comicImageUrl
    const result = cachedUrl || originalUrl
    console.warn(`getImageUrl for lesson ${lesson.id}: cached=${cachedUrl}, original=${originalUrl}, result=${result}`)
    return result
  }

  /**
   * Check if comic image is available for a lesson
   */
  const hasImage = (lesson: Lesson): boolean => {
    const result = Boolean(getImageUrl(lesson))
    console.warn(`hasImage for lesson ${lesson.id}: ${result}`)
    return result
  }

  /**
   * Start polling for comic image availability for lessons without images
   */
  const startImagePolling = (lesson: Lesson, onImageReady?: () => void) => {
    // Store the refresh callback
    refreshLessonData = onImageReady || null

    // Only poll for lessons that should have comic images but don't yet
    if (lesson.comicImageGenerated === false && !lesson.comicImageUrl) {
      imageLoadingStates.value[lesson.id] = true

      // Poll every 3 seconds (less frequent than audio since images take longer)
      const interval = setInterval(async () => {
        try {
          console.warn(`Checking comic image for lesson ${lesson.id}...`)
          // Check if comic image is now available
          const response = await $fetch<{ lesson: LessonWithSentences }>(`/api/lessons/${lesson.id}`)

          console.warn(`Lesson ${lesson.id} response:`, response.lesson)

          if (response.lesson.comicImageUrl) {
            console.warn(`Comic image now available for lesson ${lesson.id}:`, response.lesson.comicImageUrl)
            // Comic image is now available, store it in our reactive cache
            imageUrls.value[lesson.id] = response.lesson.comicImageUrl

            // Stop polling for this lesson
            stopPolling(lesson.id)

            // Refresh lesson data if callback is provided
            if (refreshLessonData) {
              console.warn(`Refreshing lesson data due to comic image availability for lesson ${lesson.id}`)
              refreshLessonData()
            }
          }
          else {
            console.warn(`Comic image still not available for lesson ${lesson.id}`)
          }
        }
        catch (error) {
          console.error(`Failed to check comic image for lesson ${lesson.id}:`, error)
        }
      }, 3000)

      pollingIntervals.value[lesson.id] = interval
    }
  }

  /**
   * Retry comic image generation for a lesson
   */
  const retryImageGeneration = async (lessonId: number) => {
    try {
      await $fetch('/api/lessons/retry-comic-image', {
        method: 'POST',
        body: { lessonId },
      })

      // Start polling for the retried lesson
      imageLoadingStates.value[lessonId] = true
    }
    catch (error) {
      console.error(`Failed to retry comic image generation for lesson ${lessonId}:`, error)
      throw error
    }
  }

  return {
    isImageLoading,
    getImageUrl,
    hasImage,
    startImagePolling,
    stopPolling,
    stopAllPolling,
    retryImageGeneration,
  }
}
