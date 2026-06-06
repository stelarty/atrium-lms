import { computed, onMounted, ref, watch, type Ref } from 'vue'
import type {
  TeacherGradebookDifficultyLevel,
  TeacherGradebookFilterComponent,
  TeacherGradebookReviewDraft,
  TeacherGradebookSubmission,
} from '@/types/teacher-gradebook'
import { useTeacherGradebookStore } from '@/stores/useTeacherGradebookStore'
import { useManageWrittenHomeworkFileUpload } from '@/composables/useManageWrittenHomeworkFileUpload'
import {
  createTeacherGradebookReviewDraft,
  mapTeacherGradebookReviewToDraft,
  mapTeacherGradebookTemplateFiles,
  TEACHER_GRADEBOOK_DIFFICULTY_OPTIONS,
} from '@/utils/teacher-gradebook-labels'
import { formatTeacherGradebookHomeworkOptionLabel } from '@/utils/teacher-gradebook-mapper'
import { downloadRemoteFile, fileNameFromUrl } from '@/utils/download-file'
import type { BaseSelectOption } from '@/components/base/BaseSelect.vue'

type TeacherGradebookDifficultyFilter = TeacherGradebookDifficultyLevel

interface UseTeacherGradebookOptions {
  courseId: Ref<string | number | undefined>
}

function pickFirstLessonId(
  component: TeacherGradebookFilterComponent | null,
  difficulty: TeacherGradebookDifficultyFilter,
  hasDifficultyLevels: boolean,
): number | null {
  if (!component) return null

  const lessons = component.lessons.filter((lesson) => {
    if (!hasDifficultyLevels) return true
    return lesson.difficulty_level_id === difficulty
  })

  return lessons[0]?.id ?? null
}

function pickFirstHomeworkId(
  component: TeacherGradebookFilterComponent | null,
  lessonId: number | null,
): number | null {
  if (!component || lessonId === null) return null

  const lesson = component.lessons.find((item) => item.id === lessonId)
  return lesson?.homework[0]?.id ?? null
}

export function useTeacherGradebook({ courseId }: UseTeacherGradebookOptions) {
  const store = useTeacherGradebookStore()

  const activeComponent = ref<TeacherGradebookFilterComponent | null>(null)
  const selectedDifficulty = ref<TeacherGradebookDifficultyFilter>('easy')
  const selectedLessonId = ref<number | null>(null)
  const selectedHomeworkId = ref<number | null>(null)

  const isReviewModalOpen = ref(false)
  const openingReviewUserId = ref<string | null>(null)
  const activeSubmission = ref<TeacherGradebookSubmission | null>(null)
  const reviewDraft = ref<TeacherGradebookReviewDraft>(
    createTeacherGradebookReviewDraft(null),
  )

  const resolvedCourseId = computed(() => {
    const id = courseId.value
    if (id === undefined || id === null || id === '') return null
    return id
  })

  const { uploadReviewFile } = useManageWrittenHomeworkFileUpload(resolvedCourseId)

  const components = computed(() => store.filters?.components ?? [])

  const displayMode = computed(() => store.filters?.display_mode ?? 'custom_sections')

  const hasDifficultyLevels = computed(
    () => store.filters?.has_difficulty_levels ?? false,
  )

  const difficultyTabs = computed(() => {
    const levels = store.filters?.difficulty_levels
    if (levels && levels.length > 0) {
      return levels.map((level) => ({
        id: level.id,
        label: level.label,
      }))
    }

    return TEACHER_GRADEBOOK_DIFFICULTY_OPTIONS.map((option) => ({
      id: option.value,
      label: option.label,
    }))
  })

  const filteredLessons = computed(() => {
    if (!activeComponent.value) return []

    return activeComponent.value.lessons.filter((lesson) => {
      if (!hasDifficultyLevels.value) return true
      return lesson.difficulty_level_id === selectedDifficulty.value
    })
  })

  const selectedLesson = computed(() =>
    filteredLessons.value.find((lesson) => lesson.id === selectedLessonId.value) ?? null,
  )

  const lessonOptions = computed<BaseSelectOption[]>(() =>
    filteredLessons.value.map((lesson) => ({
      value: lesson.id,
      label: lesson.title,
    })),
  )

  const homeworkOptions = computed<BaseSelectOption[]>(() => {
    if (!selectedLesson.value) return []

    return selectedLesson.value.homework.map((homework) => ({
      value: homework.id,
      label: formatTeacherGradebookHomeworkOptionLabel(homework, selectedLesson.value!),
    }))
  })

  const homeworkHeader = computed(() => store.detail?.homework ?? null)

  const templateFiles = computed(() =>
    mapTeacherGradebookTemplateFiles(homeworkHeader.value?.materials ?? []),
  )

  const submissions = computed(() => store.detail?.students ?? [])

  const showStudentWorkDownload = computed(
    () => homeworkHeader.value?.show_student_work_download ?? false,
  )

  const showReviewAction = computed(() => homeworkHeader.value?.show_review_action ?? false)

  const pageError = computed(() => store.filtersError)

  const detailError = computed(() => store.detailError)

  const showPageSkeleton = computed(() => {
    const id = resolvedCourseId.value
    if (!id || pageError.value) return false

    return store.isFiltersLoading || !store.hasFiltersForCourse(id)
  })

  const showFiltersEmptyState = computed(() => {
    const id = resolvedCourseId.value
    if (!id || pageError.value || showPageSkeleton.value) return false

    return store.hasFiltersForCourse(id) && components.value.length === 0
  })

  const showDetailSkeleton = computed(() => {
    const id = resolvedCourseId.value
    if (!id || !selectedHomeworkId.value || detailError.value || showPageSkeleton.value) {
      return false
    }

    return (
      store.isDetailLoading ||
      !store.hasDetailForHomework(id, selectedHomeworkId.value)
    )
  })

  const showSubmissionsEmptyState = computed(() => {
    const id = resolvedCourseId.value
    if (!id || showPageSkeleton.value || showDetailSkeleton.value) return false

    const homeworkId = selectedHomeworkId.value
    if (homeworkId === null) return false

    return (
      store.hasDetailForHomework(id, homeworkId) &&
      !detailError.value &&
      submissions.value.length === 0
    )
  })

  const showHomeworkPreview = computed(() => {
    const id = resolvedCourseId.value
    if (!id || !selectedHomeworkId.value) return false

    return (
      store.hasDetailForHomework(id, selectedHomeworkId.value) &&
      Boolean(homeworkHeader.value) &&
      !store.isDetailLoading
    )
  })

  const canSaveReview = computed(() => {
    if (store.isReviewSaving) {
      return false
    }

    if (reviewDraft.value.withoutScore) return true

    const score = Number(reviewDraft.value.score)
    const maxScore = Number(reviewDraft.value.maxScore)

    return (
      reviewDraft.value.score.trim() !== '' &&
      reviewDraft.value.maxScore.trim() !== '' &&
      !Number.isNaN(score) &&
      !Number.isNaN(maxScore) &&
      score >= 0 &&
      maxScore > 0 &&
      score <= maxScore
    )
  })

  const reviewSaveButtonLabel = computed(() => {
    if (reviewDraft.value.reviewStatus === 'reviewed') {
      return 'Сохранить изменения'
    }
    return 'Отметить как проверено'
  })

  function persistUiState(): void {
    const id = resolvedCourseId.value
    if (!id) return

    store.saveUiState(id, {
      componentId: activeComponent.value?.id ?? null,
      difficulty: selectedDifficulty.value,
      lessonId: selectedLessonId.value,
      homeworkId: selectedHomeworkId.value,
    })
  }

  function applyDefaultSelections(): void {
    activeComponent.value = components.value[0] ?? null

    if (hasDifficultyLevels.value) {
      const firstDifficulty = difficultyTabs.value[0]?.id
      if (
        firstDifficulty === 'easy' ||
        firstDifficulty === 'medium' ||
        firstDifficulty === 'hard'
      ) {
        selectedDifficulty.value = firstDifficulty
      }
    }

    selectedLessonId.value = pickFirstLessonId(
      activeComponent.value,
      selectedDifficulty.value,
      hasDifficultyLevels.value,
    )
    selectedHomeworkId.value = pickFirstHomeworkId(
      activeComponent.value,
      selectedLessonId.value,
    )
  }

  function restoreUiState(): void {
    const id = resolvedCourseId.value
    if (!id || !store.hasFiltersForCourse(id)) return

    const saved = store.getUiState(id)

    activeComponent.value =
      components.value.find((item) => item.id === saved?.componentId) ??
      components.value[0] ??
      null

    if (
      saved?.difficulty === 'easy' ||
      saved?.difficulty === 'medium' ||
      saved?.difficulty === 'hard'
    ) {
      selectedDifficulty.value = saved.difficulty
    }

    const lessonId = saved?.lessonId
    selectedLessonId.value =
      lessonId !== null &&
      lessonId !== undefined &&
      filteredLessons.value.some((lesson) => lesson.id === lessonId)
        ? lessonId
        : pickFirstLessonId(
            activeComponent.value,
            selectedDifficulty.value,
            hasDifficultyLevels.value,
          )

    const homeworkId = saved?.homeworkId
    selectedHomeworkId.value =
      homeworkId !== null &&
      homeworkId !== undefined &&
      homeworkOptions.value.some((option) => option.value === homeworkId)
        ? homeworkId
        : pickFirstHomeworkId(activeComponent.value, selectedLessonId.value)
  }

  function syncLessonAndHomeworkSelection(): void {
    const nextLessonId = pickFirstLessonId(
      activeComponent.value,
      selectedDifficulty.value,
      hasDifficultyLevels.value,
    )

    const lessonStillValid = filteredLessons.value.some(
      (lesson) => lesson.id === selectedLessonId.value,
    )

    if (!lessonStillValid) {
      selectedLessonId.value = nextLessonId
    }

    const homeworkStillValid = homeworkOptions.value.some(
      (option) => option.value === selectedHomeworkId.value,
    )

    if (!homeworkStillValid) {
      selectedHomeworkId.value = pickFirstHomeworkId(
        activeComponent.value,
        selectedLessonId.value,
      )
    }
  }

  async function retryLoadDetail(): Promise<void> {
    await loadDetail(true)
  }

  async function retryInitialize(): Promise<void> {
    await initialize(true)
  }

  async function loadDetail(force = false): Promise<void> {
    const id = resolvedCourseId.value
    if (!id || selectedHomeworkId.value === null) {
      return
    }

    await store.loadDetail(id, selectedHomeworkId.value, { force })
  }

  async function initialize(force = false): Promise<void> {
    const id = resolvedCourseId.value
    if (!id) return

    if (!force && store.hasFiltersForCourse(id)) {
      restoreUiState()
      persistUiState()
      return
    }

    await store.loadFilters(id, { force })

    if (!store.hasFiltersForCourse(id)) return

    applyDefaultSelections()
    persistUiState()
  }

  function handleSelectSection(section: { id: number | string; title: string }): void {
    activeComponent.value =
      components.value.find((item) => item.id === Number(section.id)) ?? null

    syncLessonAndHomeworkSelection()
    persistUiState()
  }

  async function openReviewModal(submission: TeacherGradebookSubmission): Promise<void> {
    const id = resolvedCourseId.value
    const homeworkId = selectedHomeworkId.value
    if (!id || homeworkId === null || openingReviewUserId.value) return

    openingReviewUserId.value = submission.user_id
    store.reviewError = null

    try {
      const review = await store.loadReview(id, homeworkId, submission.user_id)
      if (!review) return

      activeSubmission.value = submission
      reviewDraft.value = mapTeacherGradebookReviewToDraft(review)
      isReviewModalOpen.value = true
    } finally {
      openingReviewUserId.value = null
    }
  }

  function closeReviewModal(): void {
    isReviewModalOpen.value = false
    activeSubmission.value = null
    reviewDraft.value = createTeacherGradebookReviewDraft(homeworkHeader.value?.max_score ?? null)
    store.reviewError = null
  }

  async function saveReview(): Promise<void> {
    const id = resolvedCourseId.value
    if (!id || !activeSubmission.value || selectedHomeworkId.value === null) return

    const draft = reviewDraft.value
    const reviewStatus = draft.reviewStatus
    if (!reviewStatus) return

    let reviewFileId: number | null | undefined = draft.reviewFile?.fileId ?? null

    if (draft.pendingReviewUploadFile) {
      try {
        reviewFileId = await uploadReviewFile(draft.pendingReviewUploadFile)
      } catch (error) {
        store.reviewError =
          error instanceof Error ? error.message : 'Не удалось загрузить файл проверки'
        return
      }
    }

    const method = reviewStatus === 'pending_review' ? 'POST' : 'PATCH'

    const body = {
      review_file_id: reviewFileId,
      comment: draft.comment.trim(),
      no_score: draft.withoutScore,
      score: draft.withoutScore ? null : draft.score.trim() || null,
    }

    const isSaved = await store.saveReview(id, {
      homework_id: selectedHomeworkId.value,
      user_id: activeSubmission.value.user_id,
      method,
      body,
    })

    if (!isSaved) return

    closeReviewModal()
    await loadDetail(true)
  }

  function handleDownloadSubmission(submission: TeacherGradebookSubmission): void {
    if (!submission.student_work_url) return

    const fileName = fileNameFromUrl(
      submission.student_work_url,
      `work-${submission.full_name}`,
    )
    void downloadRemoteFile(submission.student_work_url, fileName)
  }

  watch(resolvedCourseId, async (nextId, prevId) => {
    if (!nextId || nextId === prevId) return

    store.reset()
    activeComponent.value = null
    selectedLessonId.value = null
    selectedHomeworkId.value = null
    await initialize()
  })

  watch(selectedDifficulty, () => {
    syncLessonAndHomeworkSelection()
    persistUiState()
  })

  watch(selectedLessonId, () => {
    const homeworkStillValid = homeworkOptions.value.some(
      (option) => option.value === selectedHomeworkId.value,
    )

    if (!homeworkStillValid) {
      selectedHomeworkId.value = pickFirstHomeworkId(
        activeComponent.value,
        selectedLessonId.value,
      )
    }

    persistUiState()
  })

  watch(selectedHomeworkId, async (nextId, prevId) => {
    const id = resolvedCourseId.value
    if (id && prevId !== null && nextId !== prevId) {
      store.clearReviewCacheForHomework(id, prevId)
    }

    persistUiState()
    await loadDetail()
  })

  watch(activeComponent, () => {
    persistUiState()
  })

  onMounted(async () => {
    await initialize()
  })

  return {
    store,
    components,
    displayMode,
    hasDifficultyLevels,
    selectedDifficulty,
    selectedLessonId,
    selectedHomeworkId,
    isReviewModalOpen,
    openingReviewUserId,
    activeSubmission,
    reviewDraft,
    activeComponent,
    lessonOptions,
    homeworkOptions,
    difficultyTabs,
    homeworkHeader,
    templateFiles,
    submissions,
    showStudentWorkDownload,
    showReviewAction,
    showPageSkeleton,
    showFiltersEmptyState,
    showDetailSkeleton,
    pageError,
    detailError,
    showSubmissionsEmptyState,
    showHomeworkPreview,
    canSaveReview,
    reviewSaveButtonLabel,
    initialize,
    retryInitialize,
    retryLoadDetail,
    handleSelectSection,
    openReviewModal,
    closeReviewModal,
    saveReview,
    handleDownloadSubmission,
    loadDetail,
  }
}
