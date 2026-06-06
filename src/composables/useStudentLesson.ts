import { computed, watch, type ComputedRef, type Ref } from 'vue'
import { useStudentLessonStore } from '@/stores/useStudentLessonStore'
import type { MaterialFileItem } from '@/types/file-upload'
import type { StudentLessonMediaMode } from '@/types/student-lesson'
import { mapUrlFileToMaterialItem } from '@/utils/material-file'
import type { StudentHomeworkCardViewModel } from '@/types/student-homework'
import type { StudentHomeworkSubmitSuccess } from '@/types/student-homework-submit'
import { mapStudentHomeworkToCardViewModel } from '@/utils/student-homework'
import {
  getStudentLessonInfoChipLabel,
  resolveStudentLessonMediaMode,
} from '@/utils/student-lesson-media'
import {
  resolveStudentLessonRecordingUrl,
  shouldShowStudentLessonRecordingBlock,
} from '@/utils/student-lesson-recording'

type LessonIdSource =
  | Ref<string | number | null | undefined>
  | ComputedRef<string | number | null | undefined>

export type StudentLessonHomeworkViewModel = StudentHomeworkCardViewModel

export function useStudentLesson(lessonId: LessonIdSource) {
  const studentLessonStore = useStudentLessonStore()

  const normalizedLessonId = computed(() => {
    const value = lessonId.value
    return value ? String(value) : ''
  })

  const lesson = computed(() => studentLessonStore.currentLesson)
  const isLoading = computed(() => studentLessonStore.isLoading)
  const error = computed(() => studentLessonStore.error)

  const lessonTitle = computed(() => lesson.value?.title?.trim() || 'Занятие')
  const lessonDescription = computed(() => lesson.value?.description?.trim() || null)

  const mediaMode = computed((): StudentLessonMediaMode | null => {
    if (!lesson.value) return null
    return resolveStudentLessonMediaMode(lesson.value)
  })

  const infoChipLabel = computed(() => {
    if (!mediaMode.value) return ''
    return getStudentLessonInfoChipLabel(mediaMode.value)
  })

  const scheduledDateLabel = computed(() => lesson.value?.starts_at_label?.trim() || '')
  const lessonLink = computed(() => lesson.value?.lesson_url?.trim() || '')

  const showRecordingBlock = computed((): boolean => {
    if (!lesson.value) return false
    return shouldShowStudentLessonRecordingBlock(lesson.value)
  })

  const recordingUrl = computed(() => {
    if (!lesson.value) return ''
    return resolveStudentLessonRecordingUrl(lesson.value)
  })

  const showLiveInfoBlock = computed((): boolean => {
    if (showRecordingBlock.value) return false
    const mode = mediaMode.value
    return mode === 'scheduled' || mode === 'live'
  })

  const materialFileItems = computed<MaterialFileItem[]>(() => {
    const materials = [...(lesson.value?.materials ?? [])].sort(
      (a, b) => (a.order ?? a.sort_order ?? 0) - (b.order ?? b.sort_order ?? 0),
    )

    return materials.map((material, index) =>
      mapUrlFileToMaterialItem(
        material.id ?? `lesson-material-${index}`,
        material.original_file_name,
        material.file_url,
      ),
    )
  })

  const homeworkItems = computed<StudentLessonHomeworkViewModel[]>(() => {
    const lessonId = lesson.value?.id ?? null

    return (lesson.value?.homework ?? []).map((homework, index) =>
      mapStudentHomeworkToCardViewModel(
        {
          ...homework,
          lesson_id: lessonId ?? undefined,
        },
        index,
      ),
    )
  })

  const hasHomework = computed(() => homeworkItems.value.length > 0)
  const hasMaterialFiles = computed(() => materialFileItems.value.length > 0)
  const teacherComment = computed(() => lesson.value?.teacher_comment?.trim() || null)
  const hasTeacherComment = computed(() => Boolean(teacherComment.value))
  const hasMaterials = computed(() => hasMaterialFiles.value || hasTeacherComment.value)

  /** Данные относятся к текущему lessonId из маршрута (без «вспышки» пустых блоков). */
  const isLessonReady = computed((): boolean => {
    const requestedId = normalizedLessonId.value
    if (!requestedId) return false
    return String(lesson.value?.id ?? '') === requestedId
  })

  const showLessonSkeleton = computed((): boolean => !isLessonReady.value && !error.value)

  const loadLessonPage = async (force = false): Promise<void> => {
    if (!normalizedLessonId.value) return
    await studentLessonStore.loadLesson(normalizedLessonId.value, force)
  }

  const applyWrittenHomeworkSubmission = (payload: StudentHomeworkSubmitSuccess): void => {
    studentLessonStore.applyWrittenHomeworkSubmission(
      payload.homeworkId,
      payload.solutionFile,
    )
  }

  watch(
    normalizedLessonId,
    () => {
      void loadLessonPage()
    },
    { immediate: true },
  )

  return {
    lesson,
    isLoading,
    error,
    lastLoadError: computed(() => studentLessonStore.lastLoadError),
    isLessonReady,
    showLessonSkeleton,
    lessonTitle,
    lessonDescription,
    mediaMode,
    infoChipLabel,
    scheduledDateLabel,
    lessonLink,
    showRecordingBlock,
    recordingUrl,
    showLiveInfoBlock,
    materialFileItems,
    homeworkItems,
    hasHomework,
    hasMaterialFiles,
    hasTeacherComment,
    teacherComment,
    hasMaterials,
    loadLessonPage,
    applyWrittenHomeworkSubmission,
  }
}
