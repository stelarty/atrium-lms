import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchStudentLesson } from '@/api/student-lessons'
import { getApiErrorMessage } from '@/utils/api-error'
import { isRequestCancelled } from '@/utils/unauthorized'
import type { StudentLessonDetail } from '@/types/student-lesson'
import type { WrittenHomeworkFileRef } from '@/types/written-homework-file'
import { buildPendingReviewHomeworkPatch } from '@/utils/student-written-homework-patch'

export const useStudentLessonStore = defineStore('studentLesson', () => {
  // ===== STATE =====
  const currentLesson = ref<StudentLessonDetail | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastLoadError = ref<unknown>(null)

  const lessonCache = new Map<string, StudentLessonDetail>()
  const lessonLoadingPromises = new Map<string, Promise<StudentLessonDetail>>()

  // ===== METHODS =====
  const loadLesson = async (
    lessonId: number | string,
    force: boolean = false,
  ): Promise<StudentLessonDetail> => {
    const cacheKey = String(lessonId)

    if (!force && lessonCache.has(cacheKey)) {
      currentLesson.value = lessonCache.get(cacheKey)!
      error.value = null
      lastLoadError.value = null
      return currentLesson.value
    }

    if (!force && lessonLoadingPromises.has(cacheKey)) {
      return lessonLoadingPromises.get(cacheKey)!
    }

    if (String(currentLesson.value?.id ?? '') !== cacheKey) {
      currentLesson.value = null
    }

    isLoading.value = true
    error.value = null
    lastLoadError.value = null

    const promise = (async () => {
      try {
        const data = await fetchStudentLesson(lessonId)
        currentLesson.value = data
        lessonCache.set(cacheKey, data)
        lastLoadError.value = null
        return data
      } catch (err: unknown) {
        if (isRequestCancelled(err)) {
          throw err
        }

        lastLoadError.value = err
        error.value = getApiErrorMessage(err, 'Не удалось загрузить занятие')
        console.error('[useStudentLessonStore] Ошибка:', error.value)
        throw err
      } finally {
        isLoading.value = false
        lessonLoadingPromises.delete(cacheKey)
      }
    })()

    lessonLoadingPromises.set(cacheKey, promise)
    return promise
  }

  const clearLesson = (): void => {
    currentLesson.value = null
    error.value = null
    lastLoadError.value = null
  }

  /** Instant UI update after POST/PATCH submission (before optional GET refresh). */
  const applyWrittenHomeworkSubmission = (
    homeworkId: number,
    solutionFile: WrittenHomeworkFileRef,
  ): void => {
    if (!currentLesson.value) return

    const nextHomework = currentLesson.value.homework.map((item) => {
      if (item.id !== homeworkId) return item
      return buildPendingReviewHomeworkPatch(item, solutionFile)
    })

    const nextLesson: StudentLessonDetail = {
      ...currentLesson.value,
      homework: nextHomework,
    }

    currentLesson.value = nextLesson
    lessonCache.set(String(nextLesson.id), nextLesson)
  }

  const clearLessonCache = (lessonId?: string | number): void => {
    if (lessonId !== undefined) {
      lessonCache.delete(String(lessonId))
      lessonLoadingPromises.delete(String(lessonId))
      return
    }

    lessonCache.clear()
    lessonLoadingPromises.clear()
  }

  return {
    currentLesson,
    isLoading,
    error,
    lastLoadError,
    loadLesson,
    applyWrittenHomeworkSubmission,
    clearLesson,
    clearLessonCache,
  }
})
