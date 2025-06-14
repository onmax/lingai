export function useLessonProgress() {
  // Key for localStorage
  const PROGRESS_KEY = 'lingua-lesson-progress'

  // Get current lesson ID from localStorage
  const getCurrentLessonId = (): number | null => {
    if (import.meta.server)
      return null

    try {
      const stored = localStorage.getItem(PROGRESS_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        return data.currentLessonId || null
      }
    }
    catch (error) {
      console.warn('Failed to read lesson progress from localStorage:', error)
    }
    return null
  }

  // Set current lesson ID in localStorage
  const setCurrentLessonId = (lessonId: number): void => {
    if (import.meta.server)
      return

    try {
      const data = {
        currentLessonId: lessonId,
        lastAccessedAt: new Date().toISOString(),
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data))
    }
    catch (error) {
      console.warn('Failed to save lesson progress to localStorage:', error)
    }
  }

  // Clear progress (for logout or reset)
  const clearProgress = (): void => {
    if (import.meta.server)
      return

    try {
      localStorage.removeItem(PROGRESS_KEY)
    }
    catch (error) {
      console.warn('Failed to clear lesson progress from localStorage:', error)
    }
  }

  // Navigate to next lesson (generate if needed)
  const goToNextLesson = async (currentLessonId: number, allLessons: any[]): Promise<void> => {
    try {
      // First, check if there's already a next lesson
      const currentLessonNumber = allLessons.find(l => l.id === currentLessonId)?.lessonNumber
      const nextLesson = allLessons.find(l => l.lessonNumber === (currentLessonNumber + 1))

      if (nextLesson) {
        // Next lesson already exists, navigate to it
        setCurrentLessonId(nextLesson.id)
        await navigateTo(`/courses/spanish/${nextLesson.id}`)
      }
      else {
        // Generate next lesson
        const response = await $fetch('/api/lessons/next', {
          method: 'POST',
          body: { currentLessonId },
        })

        if (response.success && response.lesson) {
          setCurrentLessonId(response.lesson.id)
          // Clear the lessons cache to ensure fresh data is fetched
          await clearNuxtData('lessons-cache')
          await navigateTo(`/courses/spanish/${response.lesson.id}`)
        }
        else {
          throw new Error('Failed to generate next lesson')
        }
      }
    }
    catch (error) {
      console.error('Error navigating to next lesson:', error)
      throw error
    }
  }

  // Navigate to previous lesson
  const goToPreviousLesson = async (currentLessonId: number, allLessons: any[]): Promise<void> => {
    try {
      const currentLessonNumber = allLessons.find(l => l.id === currentLessonId)?.lessonNumber
      const previousLesson = allLessons.find(l => l.lessonNumber === (currentLessonNumber - 1))

      if (previousLesson) {
        setCurrentLessonId(previousLesson.id)
        await navigateTo(`/courses/spanish/${previousLesson.id}`)
      }
    }
    catch (error) {
      console.error('Error navigating to previous lesson:', error)
      throw error
    }
  }

  // Check if there's a next lesson available
  const hasNextLesson = (_currentLessonId: number, _allLessons: any[]): boolean => {
    // Always return true since we can generate new lessons
    return true
  }

  // Check if there's a previous lesson available
  const hasPreviousLesson = (currentLessonId: number, allLessons: any[]): boolean => {
    const currentLessonNumber = allLessons.find(l => l.id === currentLessonId)?.lessonNumber
    return currentLessonNumber > 1
  }

  return {
    getCurrentLessonId,
    setCurrentLessonId,
    clearProgress,
    goToNextLesson,
    goToPreviousLesson,
    hasNextLesson,
    hasPreviousLesson,
  }
}
