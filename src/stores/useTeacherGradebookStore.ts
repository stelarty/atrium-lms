import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchTeacherGradebookFilters,
  fetchTeacherGradebookHomeworkDetail,
  fetchTeacherGradebookReview,
  submitTeacherGradebookReview,
} from '@/api/teacher-gradebook'
import type {
  TeacherGradebookDetail,
  TeacherGradebookDifficultyLevel,
  TeacherGradebookFiltersResponse,
  TeacherGradebookReviewPayload,
  TeacherGradebookReviewResponse,
} from '@/types/teacher-gradebook'
import { mapTeacherGradebookDetail } from '@/utils/teacher-gradebook-mapper'
import { getApiErrorMessage, isAuthSessionExpiredError } from '@/utils/api-error'

export interface TeacherGradebookUiState {
  componentId: number | null
  difficulty: TeacherGradebookDifficultyLevel
  lessonId: number | null
  homeworkId: number | null
}

interface LoadOptions {
  force?: boolean
}

export const useTeacherGradebookStore = defineStore('teacherGradebook', () => {
  const filters = ref<TeacherGradebookFiltersResponse | null>(null)
  const detail = ref<TeacherGradebookDetail | null>(null)
  const detailsByHomeworkKey = ref<Record<string, TeacherGradebookDetail>>({})
  const reviewByKey = ref<Record<string, TeacherGradebookReviewResponse>>({})

  const filtersCourseId = ref<string | null>(null)
  const detailCourseId = ref<string | null>(null)
  const detailHomeworkId = ref<number | null>(null)

  const uiByCourse = ref<Record<string, TeacherGradebookUiState>>({})

  const isFiltersLoading = ref(false)
  const isDetailLoading = ref(false)
  const isReviewLoading = ref(false)
  const isReviewSaving = ref(false)

  const filtersError = ref<string | null>(null)
  const detailError = ref<string | null>(null)
  const reviewError = ref<string | null>(null)

  function courseKey(courseId: number | string): string {
    return String(courseId)
  }

  function homeworkKey(courseId: number | string, homeworkId: number): string {
    return `${courseKey(courseId)}:${homeworkId}`
  }

  function reviewCacheKey(courseId: number | string, homeworkId: number, userId: string): string {
    return `${homeworkKey(courseId, homeworkId)}:${userId}`
  }

  function hasCachedReview(courseId: number | string, homeworkId: number, userId: string): boolean {
    return Boolean(reviewByKey.value[reviewCacheKey(courseId, homeworkId, userId)])
  }

  function clearReviewCacheForHomework(courseId: number | string, homeworkId: number): void {
    const prefix = `${homeworkKey(courseId, homeworkId)}:`
    const next = { ...reviewByKey.value }

    for (const key of Object.keys(next)) {
      if (key.startsWith(prefix)) {
        delete next[key]
      }
    }

    reviewByKey.value = next
  }

  function hasFiltersForCourse(courseId: number | string): boolean {
    return filters.value !== null && filtersCourseId.value === courseKey(courseId)
  }

  function hasDetailForHomework(courseId: number | string, homeworkId: number): boolean {
    return Boolean(detailsByHomeworkKey.value[homeworkKey(courseId, homeworkId)])
  }

  function getUiState(courseId: number | string): TeacherGradebookUiState | null {
    return uiByCourse.value[courseKey(courseId)] ?? null
  }

  function saveUiState(courseId: number | string, state: TeacherGradebookUiState): void {
    uiByCourse.value[courseKey(courseId)] = state
  }

  async function loadFilters(courseId: number | string, options: LoadOptions = {}): Promise<void> {
    if (!options.force && hasFiltersForCourse(courseId)) {
      return
    }

    isFiltersLoading.value = true
    filtersError.value = null

    try {
      filters.value = await fetchTeacherGradebookFilters(courseId)
      filtersCourseId.value = courseKey(courseId)
    } catch (error) {
      if (isAuthSessionExpiredError(error)) return
      filters.value = null
      filtersCourseId.value = null
      filtersError.value = 'Не удалось загрузить фильтры журнала'
      console.error('[Teacher Gradebook Store] loadFilters failed', error)
    } finally {
      isFiltersLoading.value = false
    }
  }

  async function loadDetail(
    courseId: number | string,
    homeworkId: number,
    options: LoadOptions = {},
  ): Promise<void> {
    const key = homeworkKey(courseId, homeworkId)
    if (!options.force && hasDetailForHomework(courseId, homeworkId)) {
      detail.value = detailsByHomeworkKey.value[key] ?? null
      detailCourseId.value = courseKey(courseId)
      detailHomeworkId.value = homeworkId
      return
    }

    detail.value = null
    detailCourseId.value = null
    detailHomeworkId.value = null

    isDetailLoading.value = true
    detailError.value = null

    try {
      const response = await fetchTeacherGradebookHomeworkDetail(courseId, homeworkId)
      const mapped = mapTeacherGradebookDetail(response)
      detail.value = mapped
      detailsByHomeworkKey.value[key] = mapped
      detailCourseId.value = courseKey(courseId)
      detailHomeworkId.value = homeworkId
    } catch (error) {
      if (isAuthSessionExpiredError(error)) return
      detail.value = null
      detailCourseId.value = null
      detailHomeworkId.value = null
      detailError.value = 'Не удалось загрузить журнал'
      console.error('[Teacher Gradebook Store] loadDetail failed', error)
    } finally {
      isDetailLoading.value = false
    }
  }

  async function loadReview(
    courseId: number | string,
    homeworkId: number,
    userId: string,
    options: LoadOptions = {},
  ): Promise<TeacherGradebookReviewResponse | null> {
    const cacheKey = reviewCacheKey(courseId, homeworkId, userId)

    if (!options.force && reviewByKey.value[cacheKey]) {
      return reviewByKey.value[cacheKey]
    }

    isReviewLoading.value = true
    reviewError.value = null

    try {
      const data = await fetchTeacherGradebookReview(courseId, homeworkId, userId)
      reviewByKey.value[cacheKey] = data
      return data
    } catch (error) {
      if (isAuthSessionExpiredError(error)) return null
      reviewError.value = getApiErrorMessage(error, 'Не удалось загрузить проверку')
      console.error('[Teacher Gradebook Store] loadReview failed', error)
      return null
    } finally {
      isReviewLoading.value = false
    }
  }

  async function saveReview(
    courseId: number | string,
    payload: TeacherGradebookReviewPayload,
  ): Promise<boolean> {
    isReviewSaving.value = true
    reviewError.value = null

    try {
      const saved = await submitTeacherGradebookReview(courseId, payload)
      reviewByKey.value[reviewCacheKey(courseId, payload.homework_id, payload.user_id)] = saved
      return true
    } catch (error) {
      if (isAuthSessionExpiredError(error)) return false
      reviewError.value = getApiErrorMessage(error, 'Не удалось сохранить проверку')
      console.error('[Teacher Gradebook Store] saveReview failed', error)
      return false
    } finally {
      isReviewSaving.value = false
    }
  }

  function reset(): void {
    filters.value = null
    detail.value = null
    filtersCourseId.value = null
    detailCourseId.value = null
    detailHomeworkId.value = null
    detailsByHomeworkKey.value = {}
    reviewByKey.value = {}
    uiByCourse.value = {}
    filtersError.value = null
    detailError.value = null
    reviewError.value = null
  }

  return {
    filters,
    detail,
    isFiltersLoading,
    isDetailLoading,
    isReviewLoading,
    isReviewSaving,
    filtersError,
    detailError,
    reviewError,
    hasFiltersForCourse,
    hasDetailForHomework,
    getUiState,
    saveUiState,
    loadFilters,
    loadDetail,
    loadReview,
    hasCachedReview,
    clearReviewCacheForHomework,
    saveReview,
    reset,
  }
})
