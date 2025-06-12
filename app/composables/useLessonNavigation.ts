interface LessonNavigation {
  currentLessonId: number
  currentLessonNumber: number
  hasPrevious: boolean
  hasNext: boolean
  nextLessonId?: number
  previousLessonId?: number
}

interface UserProgress {
  lastLessonId: number
  lastLessonNumber: number
}

export function useLessonNavigation(currentLessonId: MaybeRef<number>) {
  const lessonId = toRef(currentLessonId)
  const isGeneratingNext = ref(false)
  const isNavigating = ref(false)

  // Get current lesson's navigation info
  async function getLessonNavigation(): Promise<LessonNavigation> {
    const response = await $fetch<LessonNavigation>(`/api/lessons/${lessonId.value}/navigation`)
    return response
  }

  // Generate next lesson if it doesn't exist
  async function generateNextLesson() {
    if (isGeneratingNext.value) return null

    try {
      isGeneratingNext.value = true
      
      const response = await $fetch<{ success: boolean; lesson: any }>(`/api/lessons/${lessonId.value}/generate-next`, {
        method: 'POST'
      })
      
      return response.lesson
    } catch (error) {
      console.error('Error generating next lesson:', error)
      throw error
    } finally {
      isGeneratingNext.value = false
    }
  }

  // Navigate to next lesson (generate if needed)
  async function goToNextLesson() {
    if (isNavigating.value) return

    try {
      isNavigating.value = true
      
      const navigation = await getLessonNavigation()
      
      if (navigation.nextLessonId) {
        // Next lesson exists, navigate to it
        await navigateTo(`/courses/spanish/${navigation.nextLessonId}`)
      } else {
        // Generate next lesson and navigate
        const newLesson = await generateNextLesson()
        if (newLesson) {
          await navigateTo(`/courses/spanish/${newLesson.id}`)
        }
      }
    } catch (error) {
      console.error('Error navigating to next lesson:', error)
      throw error
    } finally {
      isNavigating.value = false
    }
  }

  // Navigate to previous lesson
  async function goToPreviousLesson() {
    if (isNavigating.value) return

    try {
      isNavigating.value = true
      
      const navigation = await getLessonNavigation()
      
      if (navigation.previousLessonId) {
        await navigateTo(`/courses/spanish/${navigation.previousLessonId}`)
      }
    } catch (error) {
      console.error('Error navigating to previous lesson:', error)
      throw error
    } finally {
      isNavigating.value = false
    }
  }

  // Update user's last lesson progress
  async function updateProgress() {
    try {
      await $fetch('/api/user/progress', {
        method: 'PUT',
        body: {
          lastLessonId: lessonId.value
        }
      })
    } catch (error) {
      console.error('Error updating user progress:', error)
    }
  }

  // Get user's last lesson for resume functionality
  async function getLastLesson(): Promise<UserProgress | null> {
    try {
      const response = await $fetch<{ progress: UserProgress }>('/api/user/progress')
      return response.progress
    } catch (error) {
      console.error('Error getting user progress:', error)
      return null
    }
  }

  return {
    isGeneratingNext: readonly(isGeneratingNext),
    isNavigating: readonly(isNavigating),
    getLessonNavigation,
    generateNextLesson,
    goToNextLesson,
    goToPreviousLesson,
    updateProgress,
    getLastLesson
  }
} 