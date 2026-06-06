import { computed, ref, watch } from 'vue'
import { createCoursePart, deleteCoursePart, updateCoursePart } from '@/api/course-parts'
import { invalidateLessonCourseStructureCache } from '@/composables/useLessonCreation'
import { useCourseStore } from '@/stores/useCourseStore'
import type { LmsCoursePart } from '@/types/course'

type CoursePartMutationResponse = LmsCoursePart | LmsCoursePart[]

const buildApiErrorMessage = (error: unknown, fallback: string): string => {
  const apiError = error as {
    response?: {
      data?: {
        title?: string[]
        detail?: string
      }
    }
  }

  return apiError.response?.data?.title?.[0] || apiError.response?.data?.detail || fallback
}

const createSuggestedPartTitle = (parts: LmsCoursePart[]): string => {
  const usedNumbers = new Set<number>()
  const partTitlePattern = /^Раздел\s+(\d+)$/

  parts.forEach((part) => {
    const match = part.title.match(partTitlePattern)
    const number = match ? Number(match[1]) : Number.NaN

    if (Number.isFinite(number)) {
      usedNumbers.add(number)
    }
  })

  let suggestedNumber = 1

  while (usedNumbers.has(suggestedNumber)) {
    suggestedNumber += 1
  }

  return `Раздел ${suggestedNumber}`
}

export function useTeacherProgramParts() {
  const courseStore = useCourseStore()

  const activePart = ref<LmsCoursePart | null>(null)
  const isEditingPart = ref(false)
  const editingPartTitle = ref('')

  const parts = computed(() => courseStore.createdCourse?.parts || [])
  const displayMode = computed(() => courseStore.createdCourse?.display_mode)
  const isSettingsCompleted = computed(() => courseStore.isSettingsCompleted)

  const applyMutationResult = (result: CoursePartMutationResponse, title: string): void => {
    if (Array.isArray(result)) {
      courseStore.setCourseParts(result)
      activePart.value =
        result.find((part) => part.title === title) || result[result.length - 1] || null
      return
    }

    courseStore.appendCoursePart(result)
    activePart.value = result
  }

  const setActivePart = (part: LmsCoursePart | null): void => {
    activePart.value = part
    isEditingPart.value = false // ✅ Сбрасываем при смене раздела
  }

  const createPart = async (): Promise<string | null> => {
    if (courseStore.createdCourse?.display_mode !== 'custom_sections') {
      return 'Разделы можно создавать только в режиме "Пользовательские разделы"'
    }

    if (!courseStore.createdCourse?.id) {
      return 'Сначала сохраните настройки курса'
    }

    const title = createSuggestedPartTitle(parts.value)

    try {
      const result = (await createCoursePart({
        course: Number(courseStore.createdCourse.id),
        title,
      })) as CoursePartMutationResponse

      invalidateLessonCourseStructureCache(courseStore.createdCourse.id)
      applyMutationResult(result, title)
      return null
    } catch (error) {
      return buildApiErrorMessage(error, 'Ошибка создания раздела')
    }
  }

  const startEditingPart = (part: LmsCoursePart | null): string | null => {
    if (!part) return 'Раздел не выбран'

    const exists = parts.value.some((item) => item.id === part.id)

    if (!exists) {
      return 'Раздел не найден. Возможно, он был удалён.'
    }

    activePart.value = part
    editingPartTitle.value = part.title
    isEditingPart.value = true

    return null
  }

  const cancelEdit = (): void => {
    isEditingPart.value = false
    editingPartTitle.value = ''
  }

  const savePart = async (): Promise<string | null> => {
    const title = editingPartTitle.value.trim()

    if (!title) {
      return 'Введите название раздела'
    }

    try {
      if (activePart.value?.id) {
        const updatedParts = await updateCoursePart(activePart.value.id, { title })
        if (courseStore.createdCourse?.id) {
          invalidateLessonCourseStructureCache(courseStore.createdCourse.id)
        }
        courseStore.setCourseParts(updatedParts)

        activePart.value = updatedParts.find((part) => part.id === activePart.value?.id) || null
      } else if (courseStore.createdCourse?.id) {
        const result = (await createCoursePart({
          course: Number(courseStore.createdCourse.id),
          title,
        })) as CoursePartMutationResponse

        invalidateLessonCourseStructureCache(courseStore.createdCourse.id)
        applyMutationResult(result, title)
      }

      isEditingPart.value = false
      return null
    } catch (error) {
      return buildApiErrorMessage(error, 'Ошибка сохранения раздела')
    }
  }

  const deletePart = async (): Promise<string | null> => {
    if (!activePart.value?.id) return null

    try {
      await deleteCoursePart(activePart.value.id)
      if (courseStore.createdCourse?.id) {
        invalidateLessonCourseStructureCache(courseStore.createdCourse.id)
      }
      courseStore.removeCoursePart(activePart.value.id)
      activePart.value = null
      isEditingPart.value = false

      return null
    } catch {
      return 'Ошибка при удалении раздела'
    }
  }

  watch(
    parts,
    (newParts) => {
      const activePartId = activePart.value?.id

      if (newParts.length === 0) {
        activePart.value = null
        return
      }

      if (!activePartId || !newParts.some((part) => part.id === activePartId)) {
        activePart.value = newParts[0] || null
      }
    },
    { immediate: true },
  )

  return {
    activePart,
    isEditingPart,
    editingPartTitle,
    parts,
    displayMode,
    isSettingsCompleted,
    setActivePart,
    createPart,
    startEditingPart,
    cancelEdit,
    savePart,
    deletePart,
  }
}
