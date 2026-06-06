// src/stores/useCourseStore.ts
import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createLmsCourse,
  fetchAdminCourses,
  getCourseDetails,
  updateCourseSettings,
} from '@/api/courses'
import type { LmsCourseCreatePayload, LmsCoursePart, LmsCourseResponse } from '@/types/course'
import type {
  CourseDraftSettings,
  CourseHeaderState,
  CourseFieldErrors,
} from '@/types/course-draft'
import {
  buildCourseCreatePayload,
  buildCourseUpdatePayload,
  createDefaultCourseDraft,
  formatCourseAccessDate,
  mapCourseToDraftSettings,
  mergeCourseResponseWithPayload,
  validateCourseDraft,
} from '@/utils/course-settings'
import { getApiErrorMessage } from '@/utils/api-error'

/** Роли в настройках курса */
export interface CourseRolesDraftItem {
  id: number
  fullName: string
  telegram: string
  email: string
  role: string
}

/** Создаёт объект заглушку шапки курса */
function createDefaultHeader(title: string = 'Название курса'): CourseHeaderState {
  const currentYear = new Date().getFullYear()
  return {
    title,
    accessDate: new Date(currentYear, 6, 15).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    sectionTitle: 'Раздел',
  }
}

const courseFieldMap = {
  telegram_chat_link: 'telegramChatLink',
  vk_chat_invite_link: 'vkChatInviteLink',
  title: 'title',
  subject: 'subject',
  lesson_count: 'lessonCount',
  start_date: 'startDate',
  end_date: 'endDate',
  program_url: 'programUrl',
  materials_available_until: 'materialsAvailableUntil',
  video_conference_url: 'videoConferenceUrl',
  sales_mode: 'salesMode',
  month_from: 'monthFrom',
  parts_count: 'partsCount',
  display_mode: 'displayMode',
  trial_period: 'trialPeriod',
} satisfies Partial<Record<keyof LmsCourseCreatePayload, keyof CourseDraftSettings>>

const getApiFieldErrors = (error: unknown): CourseFieldErrors => {
  const apiError = error as {
    response?: {
      data?: Record<string, unknown>
    }
  }
  const responseData = apiError.response?.data
  const errors: CourseFieldErrors = {}

  if (!responseData) return errors

  Object.entries(courseFieldMap).forEach(([apiField, draftField]) => {
    const value = responseData[apiField]

    if (typeof value === 'string') {
      errors[draftField] = value
      return
    }

    if (Array.isArray(value)) {
      const message = value.find((item): item is string => typeof item === 'string')
      if (message) errors[draftField] = message
    }
  })

  return errors
}

/** Создает массив заглушек ролей */
function createMockRoles(): CourseRolesDraftItem[] {
  return [
    {
      id: 1,
      fullName: 'Иван Иванов Иванович',
      telegram: '@tg-example',
      email: 'example@email.com',
      role: 'Тимлид',
    },
  ]
}

/** Инициализация хранилища курсов */
export const useCourseStore = defineStore('course', () => {
  // ===== STATE =====

  /** Шапка курса (заголовок + дата доступа) */
  const header = ref<CourseHeaderState>(createDefaultHeader())

  /** Настройки черновика курса (для форм) */
  const draftSettings = reactive<CourseDraftSettings>(createDefaultCourseDraft())

  /// Ошибки валидации полей
  const fieldErrors = reactive<CourseFieldErrors>({})

  /** Роли пользователей в настройках курса */
  const rolesDraft = ref<CourseRolesDraftItem[]>(createMockRoles())

  /** Созданный/отредактированный курс из API */
  const createdCourse = ref<LmsCourseResponse | null>(null)

  /** Список всех доступных курсов */
  const allCourses = ref<LmsCourseResponse[]>([])

  // --- ДОБАВЛЕНО ДЛЯ ЗАГРУЗКИ ---
  const isLoading = ref(false)

  /** Флаг: идёт создание нового курса (до сохранения в API) */
  const isDraftMode = ref(false)

  /** Индикатор загрузки данных */
  const isSaving = ref(false)

  /** Ошибка при сохранении */
  const error = ref<string | null>(null)
  const saveError = ref<string | null>(null)

  /** Курс загружен */
  const isCoursesLoaded = ref(false)

  // ===== COMPUTED =====

  /** Завершен ли процесс настройки */
  const isSettingsCompleted = computed(() => Boolean(createdCourse.value))

  /** Есть ли курсы у пользователя */
  const hasCourses = computed(() => {
    return allCourses.value.length > 0
  })

  /**
   * Принудительно обновляет список курсов.
   * Используется после создания/обновления/удаления.
   */
  const refreshCourses = async (): Promise<void> => {
    await loadAllCourses(true)
  }

  // ===== METHODS =====

  const setCourseParts = (parts: LmsCoursePart[]): void => {
    if (!createdCourse.value) return

    createdCourse.value.parts = parts
  }

  const appendCoursePart = (part: LmsCoursePart): void => {
    if (!createdCourse.value) return

    createdCourse.value.parts = [...createdCourse.value.parts, part]
  }

  const removeCoursePart = (partId: number | string): void => {
    if (!createdCourse.value) return

    createdCourse.value.parts = createdCourse.value.parts.filter(
      (part) => part.id !== Number(partId),
    )
  }

  const clearCreatedCourse = (): void => {
    createdCourse.value = null
    header.value = createDefaultHeader()
    Object.assign(draftSettings, createDefaultCourseDraft())
    isDraftMode.value = false
  }

  /**
   * Инициализация черновика курса
   * @param title - название курса
   */
  const initializeDraftCourse = (title: string = 'Название курса'): void => {
    header.value = createDefaultHeader(title)
    Object.assign(draftSettings, createDefaultCourseDraft())
    rolesDraft.value = createMockRoles()
    createdCourse.value = null
    error.value = null
    saveError.value = null
    isDraftMode.value = true

    // Очищаем ошибки
    Object.keys(fieldErrors).forEach((key) => {
      delete fieldErrors[key as keyof CourseFieldErrors]
    })
  }

  /**
   * Обновление роли в списке
   * @param roleId - ID роли
   * @param value - новое значение
   */
  const updateRole = (roleId: number, value: string): void => {
    rolesDraft.value = rolesDraft.value.map((item) =>
      item.id === roleId ? { ...item, role: value } : item,
    )
  }

  /**
   * Удаление роли из списка
   * @param roleId - ID роли
   */
  const removeRole = (roleId: number): void => {
    rolesDraft.value = rolesDraft.value.filter((item) => item.id !== roleId)
  }

  /**
   * Валидация формы курса
   * @returns true если форма валидна
   */
  const validateDraft = (): boolean => {
    // Очищаем старые ошибки
    Object.keys(fieldErrors).forEach((key) => {
      delete fieldErrors[key as keyof CourseFieldErrors]
    })

    Object.assign(fieldErrors, validateCourseDraft(draftSettings))

    return Object.keys(fieldErrors).length === 0
  }

  /**
   * Сбор payload для создания нового курса (POST)
   */
  const buildCreatePayload = (): LmsCourseCreatePayload => {
    return buildCourseCreatePayload(draftSettings)
  }

  /**
   * Сбор payload для обновления курса (PATCH)
   */
  const buildUpdatePayload = (): Partial<LmsCourseCreatePayload> => {
    return buildCourseUpdatePayload(draftSettings)
  }

  /**
   * Сохранение настроек курса (создание или обновление)
   * @returns созданный или обновлённый курс
   */
  const saveCourseSettings = async (materialIds?: number[]): Promise<LmsCourseResponse | null> => {
    // Валидация
    if (!validateDraft()) {
      saveError.value = 'Заполните обязательные поля настроек курса'
      return null
    }

    isSaving.value = true
    saveError.value = null

    try {
      let response: LmsCourseResponse

      // Проверяем, существует ли уже курс с ID (обновление)
      if (createdCourse.value?.id) {
        // РЕЖИМ ОБНОВЛЕНИЯ (PATCH)
        const updatePayload = buildUpdatePayload()
        if (materialIds) updatePayload.materials = materialIds
        response = await updateCourseSettings(String(createdCourse.value.id), updatePayload)

        // Обновляем данные курса
        createdCourse.value = mergeCourseResponseWithPayload(response, updatePayload)
        courseDetailsCache.delete(String(createdCourse.value.id)) // Сбрасываем кэш для этого курса, чтобы при следующей загрузке получить свежие данные

        // ✅ ВАЖНО! После сохранения обновляем список курсов
        await refreshCourses()

        header.value = {
          ...header.value,
          title: response.title,
          accessDate: formatCourseAccessDate(response.end_date) || header.value.accessDate,
        }
      } else {
        // РЕЖИМ СОЗДАНИЯ (POST)
        const fullPayload = buildCreatePayload()
        if (materialIds) fullPayload.materials = materialIds
        response = await createLmsCourse(fullPayload)
        createdCourse.value = mergeCourseResponseWithPayload(response, fullPayload)

        // ✅ ВАЖНО! После создания обновляем список курсов
        await refreshCourses()

        header.value = {
          ...header.value,
          title: response.title,
          accessDate: formatCourseAccessDate(response.end_date) || header.value.accessDate,
        }
      }

      return response
    } catch (requestError: unknown) {
      Object.assign(fieldErrors, getApiFieldErrors(requestError))

      const errorMessage = getApiErrorMessage(requestError, 'Ошибка при сохранении курса')
      console.error('[useCourseStore] Ошибка сохранения курса:', errorMessage)
      saveError.value = errorMessage
      return null
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Загрузка списка всех курсов
   * @param force — загрузить повторно даже если уже есть данные
   */
  // useCourseStore.ts
  let loadingPromise: Promise<LmsCourseResponse[]> | null = null

  const loadAllCourses = async (force: boolean = false): Promise<LmsCourseResponse[]> => {
    if (!force && isCoursesLoaded.value) return allCourses.value

    // Если запрос уже летит — возвращаем тот же промис, не дублируем
    if (loadingPromise) return loadingPromise

    loadingPromise = fetchAdminCourses()
      .then((courses) => {
        allCourses.value = courses
        isCoursesLoaded.value = true
        return courses
      })
      .catch((err) => {
        console.error('[useCourseStore] Ошибка загрузки списка курсов:', err)
        error.value = getApiErrorMessage(err, 'Не удалось загрузить список курсов')
        return []
      })
      .finally(() => {
        loadingPromise = null
      })

    return loadingPromise
  }

  /**
   * Загрузка конкретного курса по ID
   * @param courseId ID курса
   * @returns загруженный курс
   */
  const courseDetailsCache = new Map<string | number, LmsCourseResponse>()

  const loadCourseById = async (
    courseId: number | string,
    force: boolean = false,
  ): Promise<LmsCourseResponse | null> => {
    if (!force && courseDetailsCache.has(courseId)) {
      const cached = courseDetailsCache.get(courseId)!
      createdCourse.value = cached
      header.value = {
        ...header.value,
        title: cached.title,
        accessDate: formatCourseAccessDate(cached.end_date) || header.value.accessDate,
      }
      Object.assign(draftSettings, mapCourseToDraftSettings(cached))
      error.value = null
      saveError.value = null
      return cached
    }

    isLoading.value = true
    error.value = null
    try {
      const course = await getCourseDetails(courseId)
      saveError.value = null
      // Сохраняем в кэш
      courseDetailsCache.set(courseId, course)
      createdCourse.value = course

      header.value = {
        ...header.value,
        title: course.title,
        accessDate: formatCourseAccessDate(course.end_date) || header.value.accessDate,
      }

      // Заполняем draftSettings данными из загруженного курса
      Object.assign(draftSettings, mapCourseToDraftSettings(course))

      return course
    } catch (err) {
      console.error('[useCourseStore] Ошибка загрузки курса по ID:', err)
      error.value = getApiErrorMessage(err, 'Не удалось загрузить данные курса')
      clearCreatedCourse()
      return null
    } finally {
      // Всегда сбрасываем флаги после завершения
      isLoading.value = false
    }
  }

  return {
    // State
    header,
    draftSettings,
    fieldErrors,
    rolesDraft,
    createdCourse,
    isLoading,
    isSaving,
    error,
    saveError,
    allCourses,
    isCoursesLoaded,
    isDraftMode,

    // Computed
    isSettingsCompleted,
    hasCourses,

    // Methods
    initializeDraftCourse,
    setCourseParts,
    appendCoursePart,
    removeCoursePart,
    clearCreatedCourse,
    updateRole,
    removeRole,
    validateDraft,
    saveCourseSettings,
    loadAllCourses,
    loadCourseById,
  }
})
