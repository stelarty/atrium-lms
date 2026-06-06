// src/stores/useStudentCourseStore.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchStudentCourseChatLinks,
  fetchStudentCourseHeader,
  fetchStudentCourses,
  fetchStudentProgram,
  fetchStudentUsefulMaterials,
} from '@/api/student-courses'
import type {
  StudentCourseChatLinks,
  StudentCourseHeader,
  StudentProgram,
  StudentUsefulMaterialsResponse,
} from '@/types/student-course'
import { getApiErrorMessage } from '@/utils/api-error'

const normalizeCourseCacheKey = (courseId: number | string): string => String(courseId)

export const useStudentCourseStore = defineStore('studentCourse', () => {
  // ===== STATE =====

  const courseHeader = ref<StudentCourseHeader | null>(null)
  const program = ref<StudentProgram | null>(null)
  const chatLinks = ref<StudentCourseChatLinks | null>(null)
  const usefulMaterials = ref<StudentUsefulMaterialsResponse | null>(null)
  const allCourses = ref<StudentCourseHeader[]>([])

  const isLoading = ref(false)
  const isCoursesLoaded = ref(false) // ← НОВОЕ: флаг успешной загрузки
  const error = ref<string | null>(null)

  // Кэш деталей курса по ID
  const courseDetailsCache = new Map<
    string | number,
    {
      header: StudentCourseHeader
      program: StudentProgram
    }
  >()

  // Промисы для дедупликации: курс → текущий запрос
  const courseLoadingPromises = new Map<string | number, Promise<void>>()

  // Кэш для предотвращения дублирования параллельных запросов
  let loadingPromise: Promise<StudentCourseHeader[]> | null = null
  const chatLinksCache = new Map<string | number, StudentCourseChatLinks>()
  const usefulMaterialsCache = new Map<string | number, StudentUsefulMaterialsResponse>()

  // ===== COMPUTED =====

  /** Есть ли загруженные курсы */
  const hasCourses = computed(() => allCourses.value.length > 0)

  // ===== METHODS =====

  /**
   * Загружает шапку курса и программу параллельно
   */
  const loadCourse = async (courseId: number | string, force: boolean = false): Promise<void> => {
    const cacheKey = normalizeCourseCacheKey(courseId)

    if (!force && courseDetailsCache.has(cacheKey)) {
      const cached = courseDetailsCache.get(cacheKey)!
      courseHeader.value = cached.header
      program.value = cached.program
      return
    }

    if (!force && courseLoadingPromises.has(cacheKey)) {
      return courseLoadingPromises.get(cacheKey)!
    }

    isLoading.value = true
    error.value = null

    if (String(courseHeader.value?.id || '') !== cacheKey) {
      courseHeader.value = null
      program.value = null
    }

    const promise = (async () => {
      try {
        const [header, programData] = await Promise.all([
          fetchStudentCourseHeader(courseId),
          fetchStudentProgram(courseId),
        ])

        courseHeader.value = header
        program.value = programData
        courseDetailsCache.set(cacheKey, { header, program: programData })
      } catch (err: unknown) {
        error.value = getApiErrorMessage(err, 'Ошибка загрузки курса')
        console.error('[useStudentCourseStore] Ошибка:', error.value)
        throw err
      } finally {
        isLoading.value = false
        courseLoadingPromises.delete(cacheKey)
      }
    })()

    courseLoadingPromises.set(cacheKey, promise)

    return promise
  }

  /**
   * Загружает список всех курсов студента
   * @param force — принудительно перезагрузить данные, игнорируя кэш
   * @returns массив курсов
   */
  const loadAllCourses = async (force: boolean = false): Promise<StudentCourseHeader[]> => {
    // Если данные уже загружены и force=false — возвращаем кэш
    if (!force && isCoursesLoaded.value) {
      return allCourses.value
    }

    // Если запрос уже выполняется — возвращаем тот же промис (дедупликация)
    if (loadingPromise) {
      return loadingPromise
    }

    isLoading.value = true
    error.value = null // Очищаем ошибку перед новой попыткой

    loadingPromise = fetchStudentCourses()
      .then((courses) => {
        allCourses.value = courses
        isCoursesLoaded.value = true // ← Помечаем как загружено
        return courses
      })
      .catch((err: unknown) => {
        error.value = getApiErrorMessage(err, 'Не удалось загрузить список курсов')
        console.error('[useStudentCourseStore] Ошибка загрузки списка курсов:', error.value)
        return [] // Возвращаем пустой массив вместо throw, чтобы не ломать интерфейс
      })
      .finally(() => {
        // Сбрасываем промис-кэш после завершения
        loadingPromise = null
        isLoading.value = false
      })

    return loadingPromise
  }

  /**
   * Принудительно обновляет список курсов
   */
  const refreshCourses = async (): Promise<StudentCourseHeader[]> => {
    return loadAllCourses(true)
  }

  const loadChatLinks = async (
    courseId: number | string,
    force: boolean = false,
    options?: { silent?: boolean },
  ): Promise<StudentCourseChatLinks | null> => {
    const cacheKey = normalizeCourseCacheKey(courseId)

    if (!force && chatLinksCache.has(cacheKey)) {
      chatLinks.value = chatLinksCache.get(cacheKey)!
      return chatLinks.value
    }

    chatLinks.value = null

    try {
      const data = await fetchStudentCourseChatLinks(courseId)
      chatLinks.value = data
      chatLinksCache.set(cacheKey, data)
      return data
    } catch (err: unknown) {
      if (!options?.silent) {
        error.value = getApiErrorMessage(err, 'Не удалось загрузить ссылки на чаты')
      }
      console.error('[useStudentCourseStore] Ошибка загрузки ссылок на чаты', err)
      chatLinks.value = null
      return null
    }
  }

  const loadUsefulMaterials = async (
    courseId: number | string,
    force: boolean = false,
  ): Promise<StudentUsefulMaterialsResponse | null> => {
    const cacheKey = normalizeCourseCacheKey(courseId)

    if (!force && usefulMaterialsCache.has(cacheKey)) {
      usefulMaterials.value = usefulMaterialsCache.get(cacheKey)!
      return usefulMaterials.value
    }

    usefulMaterials.value = null

    try {
      const data = await fetchStudentUsefulMaterials(courseId)
      usefulMaterials.value = data
      usefulMaterialsCache.set(cacheKey, data)
      return data
    } catch (err: unknown) {
      error.value = getApiErrorMessage(err, 'Не удалось загрузить полезные материалы')
      console.error('[useStudentCourseStore] Ошибка загрузки полезных материалов:', error.value)
      usefulMaterials.value = null
      return null
    }
  }

  /**
   * Очищает данные курса
   */
  const clearCourse = (): void => {
    courseHeader.value = null
    program.value = null
    chatLinks.value = null
    usefulMaterials.value = null
    error.value = null
  }

  /**
   * Очищает кэш курсов (для логаута или смены пользователя)
   */
  const clearCoursesCache = (): void => {
    allCourses.value = []
    isCoursesLoaded.value = false
    loadingPromise = null
  }

  /**
   * Очищает кэш деталей курса (для логаута или смены пользователя)
   */
  const clearCourseDetailsCache = (courseId?: string | number): void => {
    if (courseId !== undefined) {
      const cacheKey = normalizeCourseCacheKey(courseId)
      courseDetailsCache.delete(cacheKey)
      chatLinksCache.delete(cacheKey)
      usefulMaterialsCache.delete(cacheKey)
    } else {
      courseDetailsCache.clear()
      chatLinksCache.clear()
      usefulMaterialsCache.clear()
    }
  }

  return {
    // State
    courseHeader,
    program,
    chatLinks,
    usefulMaterials,
    allCourses,
    isLoading,
    isCoursesLoaded, // ← Экспортируем новый флаг
    error,

    // Computed
    hasCourses,

    // Methods
    loadCourse,
    loadAllCourses,
    loadChatLinks,
    loadUsefulMaterials,
    refreshCourses, // ← Новая удобная функция
    clearCourse,
    clearCoursesCache, // ← Новая функция для очистки
    clearCourseDetailsCache, // ← Экспортируем новый метод
  }
})
