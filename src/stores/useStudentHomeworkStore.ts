import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchStudentCourseHomework } from '@/api/student-homework'
import { getApiErrorMessage } from '@/utils/api-error'
import { isRequestCancelled } from '@/utils/unauthorized'
import type {
  FetchStudentCourseHomeworkParams,
  StudentHomeworkCardViewModel,
  StudentHomeworkFilterStatus,
  StudentHomeworkLessonGroup,
} from '@/types/student-homework'
import type { StudentLessonHomework, StudentLessonHomeworkFile } from '@/types/student-lesson'
import { parseStudentCourseHomeworkResponse } from '@/utils/student-homework'
import type { WrittenHomeworkFileRef } from '@/types/written-homework-file'
import {
  buildPendingReviewHomeworkPatch,
  mapHomeworkToCardAfterSubmission,
} from '@/utils/student-written-homework-patch'

const buildCacheKey = (
  courseId: number | string,
  params: FetchStudentCourseHomeworkParams,
): string => `${courseId}:${params.componentId}:${params.status}`

export const useStudentHomeworkStore = defineStore('studentHomework', () => {
  const lessonGroups = ref<StudentHomeworkLessonGroup[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastLoadError = ref<unknown>(null)

  const homeworkCache = new Map<string, StudentHomeworkLessonGroup[]>()
  const homeworkLoadingPromises = new Map<string, Promise<StudentHomeworkLessonGroup[]>>()

  const loadHomework = async (
    courseId: number | string,
    params: FetchStudentCourseHomeworkParams,
    force: boolean = false,
  ): Promise<StudentHomeworkLessonGroup[]> => {
    const cacheKey = buildCacheKey(courseId, params)

    if (!force && homeworkCache.has(cacheKey)) {
      lessonGroups.value = homeworkCache.get(cacheKey)!
      error.value = null
      lastLoadError.value = null
      return lessonGroups.value
    }

    if (!force && homeworkLoadingPromises.has(cacheKey)) {
      return homeworkLoadingPromises.get(cacheKey)!
    }

    isLoading.value = true
    error.value = null
    lastLoadError.value = null

    const promise = (async () => {
      try {
        const data = await fetchStudentCourseHomework(courseId, params)
        const groups = parseStudentCourseHomeworkResponse(data)
        lessonGroups.value = groups
        homeworkCache.set(cacheKey, groups)
        lastLoadError.value = null
        return groups
      } catch (err: unknown) {
        if (isRequestCancelled(err)) {
          throw err
        }

        lastLoadError.value = err
        error.value = getApiErrorMessage(err, 'Не удалось загрузить домашние задания')
        console.error('[useStudentHomeworkStore] Ошибка:', error.value)
        throw err
      } finally {
        isLoading.value = false
        homeworkLoadingPromises.delete(cacheKey)
      }
    })()

    homeworkLoadingPromises.set(cacheKey, promise)
    return promise
  }

  const cardMaterialsToHomeworkFiles = (
    item: StudentHomeworkCardViewModel,
  ): StudentLessonHomeworkFile[] =>
    item.files
      .filter(
        (file) =>
          !file.clientId.includes('-solution-') && !file.clientId.includes('-review-'),
      )
      .map((file) => ({
        file_id: file.fileId,
        original_file_name: file.originalName,
        file_url: file.fileUrl ?? '',
      }))
      .filter((file) => Boolean(file.file_url))

  const cardToHomeworkBase = (
    item: StudentHomeworkCardViewModel,
    homeworkId: number,
  ): StudentLessonHomework => ({
    id: homeworkId,
    type: item.type,
    type_label: item.title,
    deadline: '',
    deadline_label: item.deadlineLabel ?? '',
    materials: cardMaterialsToHomeworkFiles(item),
  })

  /**
   * Instant UI update on the homework list page for the active filter tab.
   * - `not_submitted` / `overdue`: card is removed (homework moved to another tab).
   * - `pending_review`: card is updated in place.
   */
  const applyWrittenHomeworkSubmission = (
    courseId: number | string,
    params: FetchStudentCourseHomeworkParams,
    homeworkId: number,
    solutionFile: WrittenHomeworkFileRef,
  ): void => {
    const activeStatus = params.status
    const shouldRemove =
      activeStatus === 'not_submitted' || activeStatus === 'overdue'

    const nextGroups = lessonGroups.value
      .map((group) => {
        const nextItems = group.items.flatMap((item, index) => {
          if (item.homeworkId !== homeworkId) return [item]
          if (shouldRemove) return []

          const patched = buildPendingReviewHomeworkPatch(
            cardToHomeworkBase(item, homeworkId),
            solutionFile,
          )

          return [
            mapHomeworkToCardAfterSubmission(patched, group.lessonId, item.key, index),
          ]
        })

        return { ...group, items: nextItems }
      })
      .filter((group) => group.items.length > 0)

    lessonGroups.value = nextGroups
    homeworkCache.set(buildCacheKey(courseId, params), nextGroups)
  }

  const clearHomework = (): void => {
    lessonGroups.value = []
    error.value = null
    lastLoadError.value = null
  }

  const clearHomeworkCache = (courseId?: number | string): void => {
    if (courseId === undefined) {
      homeworkCache.clear()
      homeworkLoadingPromises.clear()
      return
    }

    const prefix = `${courseId}:`
    for (const key of homeworkCache.keys()) {
      if (key.startsWith(prefix)) {
        homeworkCache.delete(key)
        homeworkLoadingPromises.delete(key)
      }
    }
  }

  const clearHomeworkCacheExcept = (
    courseId: number | string,
    keepParams: FetchStudentCourseHomeworkParams,
  ): void => {
    const keepKey = buildCacheKey(courseId, keepParams)
    const prefix = `${courseId}:`

    for (const key of homeworkCache.keys()) {
      if (key.startsWith(prefix) && key !== keepKey) {
        homeworkCache.delete(key)
        homeworkLoadingPromises.delete(key)
      }
    }
  }

  return {
    lessonGroups,
    isLoading,
    error,
    lastLoadError,
    loadHomework,
    applyWrittenHomeworkSubmission,
    clearHomework,
    clearHomeworkCache,
    clearHomeworkCacheExcept,
  }
})
