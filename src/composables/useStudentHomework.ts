import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useStudentCourseStore } from '@/stores/useStudentCourseStore'
import { useStudentHomeworkStore } from '@/stores/useStudentHomeworkStore'
import type { StudentHomeworkFilterStatus } from '@/types/student-homework'
import type { StudentHomeworkSubmitSuccess } from '@/types/student-homework-submit'
import type { StudentProgramComponent } from '@/types/student-course'

type CourseIdSource = Ref<string | number | null | undefined> | ComputedRef<string | number | null | undefined>

export const STUDENT_HOMEWORK_FILTER_TABS: Array<{ id: StudentHomeworkFilterStatus; label: string }> = [
  { id: 'not_submitted', label: 'Требует решения' },
  { id: 'pending_review', label: 'На проверке' },
  { id: 'reviewed', label: 'Проверено' },
  { id: 'overdue', label: 'Просрочено' },
]

export function useStudentHomework(courseId: CourseIdSource) {
  const studentCourseStore = useStudentCourseStore()
  const studentHomeworkStore = useStudentHomeworkStore()

  const activeFilter = ref<StudentHomeworkFilterStatus>('not_submitted')
  const activeComponent = ref<StudentProgramComponent | null>(null)

  const normalizedCourseId = computed(() => {
    const value = courseId.value
    return value ? String(value) : ''
  })

  const components = computed(() => studentCourseStore.program?.components ?? [])
  const lessonGroups = computed(() => studentHomeworkStore.lessonGroups)

  const hasHomeworkItems = computed(() =>
    lessonGroups.value.some((group) => group.items.length > 0),
  )
  const hasProgramComponents = computed(() => components.value.length > 0)

  const isHomeworkLoading = computed(() => studentHomeworkStore.isLoading)

  const showPartSelectorSkeleton = computed(
    () => studentCourseStore.isLoading || !activeComponent.value,
  )

  const showHomeworkCardsSkeleton = computed(
    () => studentCourseStore.isLoading || isHomeworkLoading.value,
  )

  const showCourseEmptyState = computed(
    () => !studentCourseStore.isLoading && !hasProgramComponents.value,
  )

  const showFilteredEmptyState = computed(
    () =>
      !studentCourseStore.isLoading &&
      !isHomeworkLoading.value &&
      !studentHomeworkStore.error &&
      hasProgramComponents.value &&
      !hasHomeworkItems.value,
  )

  const showOverdueBanner = computed(
    () =>
      activeFilter.value === 'overdue' &&
      hasHomeworkItems.value &&
      !isHomeworkLoading.value,
  )

  const syncActiveComponent = (): void => {
    if (components.value.length === 0) {
      activeComponent.value = null
      return
    }

    const currentId = activeComponent.value?.id
    const matched = components.value.find((part) => part.id === currentId)
    activeComponent.value = matched ?? components.value[0] ?? null
  }

  const loadHomeworkPage = async (force: boolean = false): Promise<void> => {
    const id = normalizedCourseId.value
    if (!id) return

    if (!studentCourseStore.program && !studentCourseStore.isLoading) {
      await studentCourseStore.loadCourse(id, force)
    }

    syncActiveComponent()

    if (!activeComponent.value) {
      studentHomeworkStore.clearHomework()
      return
    }

    await studentHomeworkStore.loadHomework(
      id,
      {
        componentId: activeComponent.value.id,
        status: activeFilter.value,
      },
      force,
    )
  }

  const setActiveComponent = (component: StudentProgramComponent): void => {
    activeComponent.value = component
  }

  const applyWrittenHomeworkSubmission = (payload: StudentHomeworkSubmitSuccess): void => {
    const id = normalizedCourseId.value
    if (!id || !activeComponent.value) return

    const params = {
      componentId: activeComponent.value.id,
      status: activeFilter.value,
    }

    studentHomeworkStore.applyWrittenHomeworkSubmission(
      id,
      params,
      payload.homeworkId,
      payload.solutionFile,
    )

    studentHomeworkStore.clearHomeworkCacheExcept(id, params)
  }

  watch(components, syncActiveComponent, { immediate: true })

  watch(
    [normalizedCourseId, activeFilter, () => activeComponent.value?.id],
    () => {
      void loadHomeworkPage()
    },
    { immediate: true },
  )

  return {
    activeFilter,
    activeComponent,
    components,
    lessonGroups,
    error: computed(() => studentHomeworkStore.error),
    lastLoadError: computed(() => studentHomeworkStore.lastLoadError),
    hasHomeworkItems,
    hasProgramComponents,
    isHomeworkLoading,
    showPartSelectorSkeleton,
    showHomeworkCardsSkeleton,
    showCourseEmptyState,
    showFilteredEmptyState,
    showOverdueBanner,
    loadHomeworkPage,
    setActiveComponent,
    applyWrittenHomeworkSubmission,
  }
}
