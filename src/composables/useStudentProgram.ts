// src/composables/useStudentProgram.ts
import { ref, computed, watch, type ComputedRef, type Ref } from 'vue'
import { useStudentCourseStore } from '@/stores/useStudentCourseStore'
import { withLessonStatuses } from '@/utils/lesson-status'
import type {
  StudentProgramComponent,
  StudentProgramLessonViewModel,
} from '@/types/student-course'

export type StudentProgramDifficultyTabId = 'easy' | 'medium' | 'hard'

export const STUDENT_PROGRAM_DIFFICULTY_TABS: Array<{
  id: StudentProgramDifficultyTabId
  label: string
}> = [
  { id: 'easy', label: 'Легкий' },
  { id: 'medium', label: 'Средний' },
  { id: 'hard', label: 'Тяжелый' },
]

type CourseIdSource = Ref<string | number | null | undefined> | ComputedRef<string | number | null | undefined>

export function useStudentProgram(courseId?: CourseIdSource) {
  const studentCourseStore = useStudentCourseStore()

  const activeComponent = ref<StudentProgramComponent | null>(null)
  const activeDifficultyLevel = ref<StudentProgramDifficultyTabId>('easy')
  const searchQuery = ref('')

  const normalizedCourseId = computed(() => String(courseId?.value ?? studentCourseStore.courseHeader?.id ?? ''))
  const isProgramForCurrentCourse = computed(() => {
    if (!normalizedCourseId.value) return true
    return String(studentCourseStore.courseHeader?.id ?? '') === normalizedCourseId.value
  })

  const components = computed(() => {
    if (!isProgramForCurrentCourse.value) return []
    return studentCourseStore.program?.components ?? []
  })

  const hasDifficultyLevels = computed(
    () => studentCourseStore.courseHeader?.has_difficulty_levels ?? false,
  )

  const isProgramReady = computed(
    () =>
      !studentCourseStore.isLoading &&
      isProgramForCurrentCourse.value &&
      Boolean(studentCourseStore.program),
  )

  // Автовыбор первого компонента при загрузке
  const initActiveComponent = (): void => {
    const firstComponent = components.value[0]
    if (firstComponent && !activeComponent.value) {
      activeComponent.value = firstComponent
    }
  }

  const setActiveComponent = (component: StudentProgramComponent): void => {
    activeComponent.value = component
    activeDifficultyLevel.value = 'easy'
  }

  const mapToViewModels = (
    list: StudentProgramComponent['lessons'],
  ): StudentProgramLessonViewModel[] =>
    list.map((lesson) => ({
      ...lesson,
      starts_at: lesson.starts_at ?? null,
      status: null,
    }))

  const lessonsForActiveComponent = computed<StudentProgramLessonViewModel[]>(() => {
    if (!activeComponent.value) return []
    return mapToViewModels(activeComponent.value.lessons)
  })

  const pastLessonsForActiveComponent = computed<StudentProgramLessonViewModel[]>(() => {
    if (!activeComponent.value) return []
    const past = activeComponent.value.past_lessons ?? []
    return mapToViewModels(past)
  })

  const filterByDifficulty = (
    list: StudentProgramLessonViewModel[],
  ): StudentProgramLessonViewModel[] => {
    if (!hasDifficultyLevels.value) return list
    return list.filter((lesson) => lesson.difficulty_level === activeDifficultyLevel.value)
  }

  const filteredLessonsForActiveComponent = computed<StudentProgramLessonViewModel[]>(() => {
    return filterByDifficulty(lessonsForActiveComponent.value)
  })

  const filteredPastLessonsForActiveComponent = computed<StudentProgramLessonViewModel[]>(() => {
    return filterByDifficulty(pastLessonsForActiveComponent.value)
  })

  const filterBySearch = (
    list: StudentProgramLessonViewModel[],
    query: string,
  ): StudentProgramLessonViewModel[] => {
    if (!query) return list
    return list.filter((lesson) => lesson.title.toLowerCase().includes(query))
  }

  const searchedLessonsForActiveComponent = computed<StudentProgramLessonViewModel[]>(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const baseLessons = filteredLessonsForActiveComponent.value
    return withLessonStatuses(filterBySearch(baseLessons, query))
  })

  const searchedPastLessonsForActiveComponent = computed<StudentProgramLessonViewModel[]>(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const basePast = filteredPastLessonsForActiveComponent.value
    return withLessonStatuses(filterBySearch(basePast, query))
  })

  const showProgramSkeleton = computed(() => studentCourseStore.isLoading || !isProgramReady.value)
  const showLessonsEmptyState = computed(
    () =>
      isProgramReady.value &&
      lessonsForActiveComponent.value.length === 0 &&
      pastLessonsForActiveComponent.value.length === 0,
  )
  const showFilteredLessonsEmpty = computed(
    () =>
      hasDifficultyLevels.value &&
      isProgramReady.value &&
      (lessonsForActiveComponent.value.length > 0 ||
        pastLessonsForActiveComponent.value.length > 0) &&
      filteredLessonsForActiveComponent.value.length === 0 &&
      filteredPastLessonsForActiveComponent.value.length === 0,
  )
  const showSearchEmptyState = computed(
    () =>
      isProgramReady.value &&
      searchQuery.value.trim() !== '' &&
      (filteredLessonsForActiveComponent.value.length > 0 ||
        filteredPastLessonsForActiveComponent.value.length > 0) &&
      searchedLessonsForActiveComponent.value.length === 0 &&
      searchedPastLessonsForActiveComponent.value.length === 0,
  )

  watch(
    components,
    (newComponents) => {
      const activeId = activeComponent.value?.id
      const nextActive =
        newComponents.find((component) => component.id === activeId) ?? newComponents[0] ?? null

      activeComponent.value = nextActive
      activeDifficultyLevel.value = 'easy'
    },
    { immediate: true },
  )

  return {
    activeComponent,
    activeDifficultyLevel,
    difficultyTabs: STUDENT_PROGRAM_DIFFICULTY_TABS,
    searchQuery,
    components,
    hasDifficultyLevels,
    lessonsForActiveComponent,
    pastLessonsForActiveComponent,
    filteredLessonsForActiveComponent,
    filteredPastLessonsForActiveComponent,
    searchedLessonsForActiveComponent,
    searchedPastLessonsForActiveComponent,
    showProgramSkeleton,
    showLessonsEmptyState,
    showFilteredLessonsEmpty,
    showSearchEmptyState,
    initActiveComponent,
    setActiveComponent,
  }
}
