import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { fetchCourseLessons } from '@/api/courses'
import { useCourseStore } from '@/stores/useCourseStore'
import { withLessonStatuses } from '@/utils/lesson-status'
import type { LmsCoursePart } from '@/types/course'
import type {
  CourseProgramApiResponse,
  CourseProgramComponent,
  CourseProgramLesson,
} from '@/types/lesson'
export type ProgramDifficultyTabId = 'easy' | 'medium' | 'hard'

export const PROGRAM_DIFFICULTY_TABS: Array<{ id: ProgramDifficultyTabId; label: string }> = [
  { id: 'easy', label: 'Легкий' },
  { id: 'medium', label: 'Средний' },
  { id: 'hard', label: 'Тяжелый' },
]

const lessonsCache = new Map<string | number, CourseProgramComponent[]>()

function extractProgramComponents(data: CourseProgramApiResponse): CourseProgramComponent[] {
  return Array.isArray(data) ? data : data.components ?? []
}

export function applyProgramLessonsResponse(
  courseId: number | string,
  response: CourseProgramApiResponse,
): void {
  lessonsCache.set(courseId, extractProgramComponents(response))
}

export function useTeacherProgramLessons(
  courseId: Ref<number | string> | ComputedRef<number | string>,
  activePart: Ref<LmsCoursePart | null>,
) {
  const courseStore = useCourseStore()

  const components = ref<CourseProgramComponent[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  /** Для какого courseId актуальны `components` (защита от пустого empty-state при смене курса) */
  const loadedCourseId = ref<number | null>(null)
  const activeDifficultyLevel = ref<ProgramDifficultyTabId>('easy')
  const searchQuery = ref<string>('')

  const resolveCourseId = (): number => Number(courseId.value)

  const hasDifficultyLevels = computed(
    () => courseStore.createdCourse?.has_difficulty_levels ?? false,
  )

  const lessonsForActivePart = computed((): CourseProgramLesson[] => {
    if (!activePart.value) return []
    const component = components.value.find((c) => c.id === activePart.value!.id)
    return component?.lessons ?? []
  })

  const pastLessonsForActivePart = computed((): CourseProgramLesson[] => {
    if (!activePart.value) return []
    const component = components.value.find((c) => c.id === activePart.value!.id)
    return component?.past_lessons ?? []
  })

  const filterByDifficulty = (list: CourseProgramLesson[]): CourseProgramLesson[] => {
    if (!hasDifficultyLevels.value) return list
    return list.filter((lesson) => lesson.difficulty_level === activeDifficultyLevel.value)
  }

  const filteredLessonsForActivePart = computed((): CourseProgramLesson[] => {
    return filterByDifficulty(lessonsForActivePart.value)
  })

  const filteredPastLessonsForActivePart = computed((): CourseProgramLesson[] => {
    return filterByDifficulty(pastLessonsForActivePart.value)
  })

  const isLessonsReady = computed(() => {
    const id = resolveCourseId()
    return id > 0 && loadedCourseId.value === id
  })

  /** Пока грузим или данные ещё от другого курса — скелетон, не empty-state */
  const showLessonsSkeleton = computed(() => isLoading.value || !isLessonsReady.value)

  const filterBySearch = (list: CourseProgramLesson[], query: string): CourseProgramLesson[] => {
    if (!query) return list
    return list.filter((lesson) => lesson.title.toLowerCase().includes(query))
  }

  /** Занятия, отфильтрованные по поисковому запросу (регистронезависимо) */
  const searchedLessonsForActivePart = computed((): CourseProgramLesson[] => {
    const baseLessons = hasDifficultyLevels.value
      ? filteredLessonsForActivePart.value
      : lessonsForActivePart.value

    const query = searchQuery.value.toLowerCase().trim()
    return withLessonStatuses(filterBySearch(baseLessons, query))
  })

  const searchedPastLessonsForActivePart = computed((): CourseProgramLesson[] => {
    const basePast = hasDifficultyLevels.value
      ? filteredPastLessonsForActivePart.value
      : pastLessonsForActivePart.value

    const query = searchQuery.value.toLowerCase().trim()
    return withLessonStatuses(filterBySearch(basePast, query))
  })

  /** В разделе нет занятий (ни текущих, ни прошедших) */
  const showLessonsEmptyState = computed(
    () =>
      isLessonsReady.value &&
      !isLoading.value &&
      lessonsForActivePart.value.length === 0 &&
      pastLessonsForActivePart.value.length === 0,
  )

  /** Есть занятия в разделе, но не на выбранном уровне сложности */
  const showFilteredLessonsEmpty = computed(
    () =>
      hasDifficultyLevels.value &&
      isLessonsReady.value &&
      !isLoading.value &&
      (lessonsForActivePart.value.length > 0 || pastLessonsForActivePart.value.length > 0) &&
      filteredLessonsForActivePart.value.length === 0 &&
      filteredPastLessonsForActivePart.value.length === 0,
  )

  /** Показывать ли empty-состояние для поиска (есть занятия, но ничего не найдено) */
  const showSearchEmptyState = computed(
    () =>
      isLessonsReady.value &&
      !isLoading.value &&
      searchQuery.value.trim() !== '' &&
      (filteredLessonsForActivePart.value.length > 0 ||
        filteredPastLessonsForActivePart.value.length > 0) &&
      searchedLessonsForActivePart.value.length === 0 &&
      searchedPastLessonsForActivePart.value.length === 0,
  )

  const loadLessons = async (force: boolean = false): Promise<void> => {
    const id = resolveCourseId()
    if (!id) {
      components.value = []
      loadedCourseId.value = null
      isLoading.value = false
      return
    }

    if (!force && lessonsCache.has(id)) {
      components.value = lessonsCache.get(id)!
      loadedCourseId.value = id
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    if (loadedCourseId.value !== id) {
      components.value = []
    }

    try {
      const data = await fetchCourseLessons(id)
      const newComponents = extractProgramComponents(data)

      lessonsCache.set(id, newComponents)
      components.value = newComponents
      loadedCourseId.value = id
    } catch (e) {
      console.error('[useTeacherProgramLessons] Ошибка загрузки:', e)
      error.value = 'Не удалось загрузить занятия'
      components.value = []
      loadedCourseId.value = null
    } finally {
      isLoading.value = false
    }
  }

  // ===== INVALIDATE =====
  const invalidateCourseLessons = (): void => {
    const id = resolveCourseId()
    if (id) {
      lessonsCache.delete(id)
    }
    if (loadedCourseId.value === id) {
      components.value = []
      loadedCourseId.value = null
    }
  }

  const clearAllLessonsCache = (): void => {
    lessonsCache.clear()
    components.value = []
    loadedCourseId.value = null
  }

  watch(courseId, (id, oldId) => {
    if (oldId !== undefined && Number(oldId) !== Number(id)) {
      activeDifficultyLevel.value = 'easy'
    }
  })

  watch(activePart, () => {
    activeDifficultyLevel.value = 'easy'
  })

  watch(
    courseId,
    (id, oldId) => {
      if (!id) {
        components.value = []
        loadedCourseId.value = null
        isLoading.value = false
        return
      }

      const numericId = Number(id)
      const courseChanged = oldId !== undefined && Number(oldId) !== numericId

      if (courseChanged) {
        components.value = []
        loadedCourseId.value = null
        activeDifficultyLevel.value = 'easy'
      }

      if (!lessonsCache.has(numericId)) {
        isLoading.value = true
      }

      void loadLessons()
    },
    { immediate: true },
  )

  return {
    components,
    lessonsForActivePart,
    pastLessonsForActivePart,
    filteredLessonsForActivePart,
    filteredPastLessonsForActivePart,
    hasDifficultyLevels,
    activeDifficultyLevel,
    difficultyTabs: PROGRAM_DIFFICULTY_TABS,
    isLoading,
    isLessonsReady,
    showLessonsSkeleton,
    showLessonsEmptyState,
    showFilteredLessonsEmpty,
    searchQuery,
    searchedLessonsForActivePart,
    searchedPastLessonsForActivePart,
    showSearchEmptyState,
    error,
    loadLessons,
    invalidateCourseLessons,
    clearAllLessonsCache,
  }
}
