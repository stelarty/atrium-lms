import { computed, reactive, ref } from 'vue'
import { createLesson, deleteLesson, getLessonDetails, updateLesson } from '@/api/lessons'
import { getPartsDetails } from '@/api/courses'
import { useCourseStore } from '@/stores/useCourseStore'
import type { BaseSelectOption } from '@/components/base/BaseSelect.vue'
import type {
  CourseProgramResponse,
  LmsLessonHomeworkPayload,
  LmsLessonHomeworkResponse,
  LmsLessonResponse,
} from '@/types/lesson'
import type { LmsCoursePart, LmsCourseSection } from '@/types/course'
import type { HomeworkDraft, LessonDraft } from '@/types/lesson-draft'
import type { MaterialFileItem } from '@/types/file-upload'

interface CourseStructureOptions {
  parts: BaseSelectOption[]
  sections: BaseSelectOption[]
}

const courseStructureOptionsCache = new Map<string, CourseStructureOptions>()

export function invalidateLessonCourseStructureCache(courseId: number | string): void {
  courseStructureOptionsCache.delete(String(courseId))
}

const russianMonths = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const createDefaultDraft = (courseId: number): LessonDraft => ({
  course: courseId,
  part: null,
  section: null,
  title: '',
  duration_minutes: '90',
  lesson_type: 'live',
  date: null,
  time: '',
  lesson_url: '',
  recording_url: '',
  difficulty_level: null,
  teacher_comment: '',
})

const createDefaultHomework = (): HomeworkDraft => ({
  id: crypto.randomUUID(),
  type: 'none',
  url: '',
  deadline_date: null,
  deadline_time: '',
  points: '',
  files: [],
})

const formatApiError = (error: unknown, fallback: string): string => {
  const apiError = error as {
    response?: {
      data?: {
        detail?: string
        [key: string]: string[] | string | undefined
      }
    }
  }

  const data = apiError.response?.data
  const firstFieldError = data
    ? Object.values(data).find((value): value is string[] => Array.isArray(value))?.[0]
    : null

  return firstFieldError || data?.detail || fallback
}

const formatRussianApiDate = (dateValue: string | null): string => {
  if (!dateValue) return ''

  if (/^\d{1,2}\s+[а-яё]+\s+\d{4}$/i.test(dateValue.trim())) {
    return dateValue.trim()
  }

  const [year, month, day] = dateValue.split('-').map(Number)

  if (!year || !month || !day || !russianMonths[month - 1]) {
    return dateValue
  }

  return `${day} ${russianMonths[month - 1]} ${year}`
}

const normalizeDateForInput = (value?: string | null): string | null => {
  if (!value) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const isoDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})[T\s]/)
  if (isoDateMatch?.[1]) {
    return isoDateMatch[1]
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate.toISOString().slice(0, 10)
}

const normalizeTimeForInput = (value?: string | null): string => {
  if (!value) return ''

  const trimmed = value.trim()

  // "12:00" or "12:00:00"
  const timeOnlyMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (timeOnlyMatch?.[1] && timeOnlyMatch[2]) {
    return `${timeOnlyMatch[1].padStart(2, '0')}:${timeOnlyMatch[2]}`
  }

  // Date-only string has no time for <input type="time">
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return ''
  }

  // ISO / "YYYY-MM-DD HH:mm:ss"
  const dateTime = trimmed.includes(' ') && !trimmed.includes('T')
    ? trimmed.replace(' ', 'T')
    : trimmed

  const isoTimeMatch = dateTime.match(/^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/)
  if (isoTimeMatch?.[1] && isoTimeMatch[2]) {
    return `${isoTimeMatch[1]}:${isoTimeMatch[2]}`
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(dateTime)) {
    const parsed = new Date(dateTime)
    if (!Number.isNaN(parsed.getTime())) {
      return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
    }
  }

  return ''
}

const buildDateTimeWithOffset = (date: string | null, time: string): string => {
  if (!date || !time) return ''

  return `${date}T${time.length === 5 ? `${time}:00` : time}+03:00`
}

const getHomeworkFieldKey = (homeworkId: string, field: string): string => {
  return `homework_${homeworkId}_${field}`
}

export function useLessonCreation(courseId: number | string) {
  const courseStore = useCourseStore()
  const numericCourseId = Number(courseId)

  const draft = reactive<LessonDraft>(createDefaultDraft(numericCourseId))
  const homeworks = ref<HomeworkDraft[]>([createDefaultHomework()])
  const fieldErrors = reactive<Record<string, string>>({})
  const partsOptions = ref<BaseSelectOption[]>([])
  const sectionsOptions = ref<BaseSelectOption[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const hasDifficultyLevels = computed(() => {
    return courseStore.createdCourse?.has_difficulty_levels || false
  })

  const clearFieldErrors = (): void => {
    Object.keys(fieldErrors).forEach((key) => {
      delete fieldErrors[key]
    })
  }

  const loadCourseStructure = async (): Promise<void> => {
    const cacheKey = String(courseId)
    const cached = courseStructureOptionsCache.get(cacheKey)
    if (cached) {
      partsOptions.value = cached.parts
      sectionsOptions.value = cached.sections
      return
    }

    try {
      const data = await getPartsDetails(courseId)

      const nextParts = Array.isArray(data.parts)
        ? data.parts.map((part: LmsCoursePart) => ({
            value: part.id,
            label: part.title,
          }))
        : []

      const nextSections = Array.isArray(data.sections)
        ? data.sections.map((section: LmsCourseSection) => ({
            value: section.id,
            label: section.title,
          }))
        : []

      courseStructureOptionsCache.set(cacheKey, {
        parts: nextParts,
        sections: nextSections,
      })

      partsOptions.value = nextParts
      sectionsOptions.value = nextSections
    } catch (requestError) {
      error.value = formatApiError(requestError, 'Ошибка загрузки структуры курса')
    }
  }

  const validateRequiredFields = (): boolean => {
    clearFieldErrors()

    if (!draft.title.trim()) {
      fieldErrors.title = 'Введите название занятия'
    }

    if (!draft.duration_minutes || Number(draft.duration_minutes) <= 0) {
      fieldErrors.duration_minutes = 'Укажите длительность занятия'
    }

    // Валидируем дату и время ТОЛЬКО для эфира
    if (draft.lesson_type === 'live') {
      if (!draft.date) {
        fieldErrors.date = 'Выберите дату занятия'
      }

      if (!draft.time.trim()) {
        fieldErrors.time = 'Укажите время занятия'
      }
    }

    if (!draft.part) {
      fieldErrors.part = 'Выберите блок/месяц'
    }

    if (draft.difficulty_level && !hasDifficultyLevels.value) {
      fieldErrors.difficulty_level = 'Уровень сложности доступен только для курсов с уровнями'
    }

    homeworks.value.forEach((homework, index) => {
      if (homework.type === 'none') return

      const label = `ДЗ ${index + 1}`

      if (!homework.deadline_date) {
        fieldErrors[getHomeworkFieldKey(homework.id, 'deadline_date')] =
          `${label}: выберите дату дедлайна`
      }

      if (!homework.deadline_time.trim()) {
        fieldErrors[getHomeworkFieldKey(homework.id, 'deadline_time')] =
          `${label}: укажите время дедлайна`
      }

      if (!homework.points || Number(homework.points) <= 0) {
        fieldErrors[getHomeworkFieldKey(homework.id, 'points')] =
          `${label}: укажите максимальный балл`
      }

      if (homework.type === 'test' && !homework.url.trim()) {
        fieldErrors[getHomeworkFieldKey(homework.id, 'url')] = `${label}: укажите ссылку на тест`
      }
    })

    return Object.keys(fieldErrors).length === 0
  }

  const buildHomeworkPayload = (): LmsLessonHomeworkPayload[] => {
    return homeworks.value
      .filter((homework): homework is HomeworkDraft & { type: LmsLessonHomeworkPayload['type'] } => {
        return homework.type !== 'none'
      })
      .map((homework) => {
        const materials = homework.files
          .map((file) => file.fileId)
          .filter((fileId): fileId is number => fileId !== undefined)

        return {
          type: homework.type,
          deadline: buildDateTimeWithOffset(homework.deadline_date, homework.deadline_time),
          max_score: Number(homework.points).toFixed(2),
          ...(homework.type === 'test' ? { test_url: homework.url.trim() } : {}),
          ...(materials.length > 0 ? { materials } : {}),
        }
      })
  }

  const buildLiveLessonFields = () => ({
    date: formatRussianApiDate(draft.date),
    time: draft.time,
    lesson_url: draft.lesson_url.trim() || undefined,
    recording_url: draft.recording_url.trim() || undefined,
  })

  const buildTeacherCommentField = () => {
    const value = draft.teacher_comment.trim()
    return { teacher_comment: value.length > 0 ? value : null }
  }

  const buildCreatePayload = (materialIds?: number[]) => ({
    course: numericCourseId,
    part: draft.part!,
    section: draft.section,
    title: draft.title.trim(),
    duration_minutes: Number(draft.duration_minutes),
    lesson_type: draft.lesson_type,
    ...(draft.lesson_type === 'live' ? buildLiveLessonFields() : {}),
    difficulty_level: hasDifficultyLevels.value ? draft.difficulty_level || undefined : undefined,
    ...(materialIds !== undefined ? { materials: materialIds } : {}),
    homework: buildHomeworkPayload(),
    ...buildTeacherCommentField(),
  })

  const buildUpdatePayload = (materialIds?: number[]) => ({
    part: draft.part || undefined,
    section: draft.section,
    title: draft.title.trim(),
    duration_minutes: Number(draft.duration_minutes),
    lesson_type: draft.lesson_type,
    ...(draft.lesson_type === 'live'
      ? {
          date: draft.date ? formatRussianApiDate(draft.date) : undefined,
          time: draft.time || undefined,
          lesson_url: draft.lesson_url.trim() || undefined,
          recording_url: draft.recording_url.trim() || undefined,
        }
      : {
          lesson_url: null,
          recording_url: null,
        }),
    difficulty_level: hasDifficultyLevels.value ? draft.difficulty_level || undefined : undefined,
    ...(materialIds !== undefined ? { materials: materialIds } : {}),
    homework: buildHomeworkPayload(),
    ...buildTeacherCommentField(),
  })

  const saveLesson = async (materialIds?: number[]): Promise<CourseProgramResponse | null> => {
    if (!validateRequiredFields()) {
      error.value = 'Заполните обязательные поля формы'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      return await createLesson(buildCreatePayload(materialIds))
    } catch (requestError) {
      error.value = formatApiError(requestError, 'Ошибка при создании занятия')
      return null
    } finally {
      isLoading.value = false
    }
  }

  const removeLesson = async (lessonId: number): Promise<CourseProgramResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      return await deleteLesson(lessonId)
    } catch (requestError) {
      error.value = formatApiError(requestError, 'Ошибка при удалении занятия')
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateLessonData = async (
    lessonId: number,
    materialIds?: number[],
  ): Promise<CourseProgramResponse | null> => {
    if (!validateRequiredFields()) {
      error.value = 'Заполните обязательные поля формы'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      return await updateLesson(lessonId, buildUpdatePayload(materialIds))
    } catch (requestError) {
      error.value = formatApiError(requestError, 'Ошибка при обновлении занятия')
      return null
    } finally {
      isLoading.value = false
    }
  }

  const loadLessonDetails = async (lessonId: number | string): Promise<LmsLessonResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const lesson = await getLessonDetails(lessonId)
      applyLesson(lesson)
      return lesson
    } catch (requestError) {
      error.value = formatApiError(requestError, 'Ошибка загрузки занятия')
      return null
    } finally {
      isLoading.value = false
    }
  }

  const addHomework = (): void => {
    homeworks.value.push(createDefaultHomework())
  }

  const removeHomework = (id: string): void => {
    if (homeworks.value.length <= 1) return
    homeworks.value = homeworks.value.filter((hw: HomeworkDraft) => hw.id !== id)
  }

  const appendHomeworkFiles = (homeworkId: string, files: HomeworkDraft['files']): void => {
    const homework = homeworks.value.find((item) => item.id === homeworkId)
    if (!homework) return

    homework.files = [...homework.files, ...files]
  }

  const updateHomeworkFile = (
    homeworkId: string,
    clientId: string,
    patch: Partial<MaterialFileItem>,
  ): void => {
    const homework = homeworks.value.find((item) => item.id === homeworkId)
    const file = homework?.files.find((item) => item.clientId === clientId)
    if (!file) return

    Object.assign(file, patch)
  }

  const removeHomeworkFile = (homeworkId: string, clientId: string): void => {
    const homework = homeworks.value.find((item) => item.id === homeworkId)
    if (!homework) return

    homework.files = homework.files.filter((file) => file.clientId !== clientId)
  }

  const applyHomework = (serverHomework: LmsLessonHomeworkResponse[] | undefined): void => {
    if (!serverHomework?.length) {
      homeworks.value = [createDefaultHomework()]
      return
    }

    homeworks.value = serverHomework.map((item) => ({
      id: String(item.id),
      type: item.type,
      url: item.test_url ?? '',
      deadline_date: normalizeDateForInput(item.deadline),
      deadline_time: normalizeTimeForInput(item.deadline),
      points: String(item.max_score),
      files: item.materials.map((file) => ({
        clientId: `${file.file_in_homework_id ?? file.file_id}`,
        fileId: file.file_id,
        originalName: file.original_file_name,
        fileUrl: file.file_url,
        extension: file.original_file_name.split('.').pop()?.toUpperCase() ?? 'FILE',
        progress: 100,
        status: 'done',
      })),
    }))
  }

  const applyLesson = (lesson: LmsLessonResponse): void => {
    draft.part = lesson.part
    draft.section = lesson.section ?? null
    draft.title = lesson.title
    draft.duration_minutes = String(lesson.duration_minutes)
    draft.lesson_type = lesson.lesson_type
    draft.date = normalizeDateForInput(lesson.date ?? lesson.starts_at)
    draft.time = normalizeTimeForInput(lesson.time ?? lesson.starts_at)
    draft.lesson_url = lesson.lesson_url || ''
    draft.recording_url = lesson.recording_url || ''
    draft.difficulty_level = lesson.difficulty_level ?? null
    draft.teacher_comment = lesson.teacher_comment?.trim() ?? ''
    applyHomework(lesson.homework)
  }

  const resetDraft = (): void => {
    Object.assign(draft, createDefaultDraft(numericCourseId))
    homeworks.value = [createDefaultHomework()]
    clearFieldErrors()
    error.value = null
  }

  return {
    draft,
    isLoading,
    error,
    fieldErrors,
    hasDifficultyLevels,
    partsOptions,
    sectionsOptions,
    homeworks,
    loadCourseStructure,
    loadLessonDetails,
    saveLesson,
    updateLessonData,
    removeLesson,
    applyLesson,
    resetDraft,
    addHomework,
    removeHomework,
    appendHomeworkFiles,
    updateHomeworkFile,
    removeHomeworkFile,
  }
}
