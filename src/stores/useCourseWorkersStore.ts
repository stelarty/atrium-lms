import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchCourseWorkers,
  fetchAvailableWorkers,
  addCourseWorker,
  updateCourseWorkerRole,
  removeCourseWorker,
} from '@/api/course-workers'
import type {
  CourseWorker,
  AvailableWorkerUser,
  WorkerRole,
  AddWorkerPayload,
  UpdateWorkerRolePayload,
} from '@/types/course-worker'

export const useCourseWorkersStore = defineStore('courseWorkers', () => {
  const workers = ref<CourseWorker[]>([])
  const availableUsers = ref<AvailableWorkerUser[]>([])
  const availableRoles = ref<WorkerRole[]>([])

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /** После успешной пары fetch для курса повторные запросы при возврате на таб не нужны */
  const hydratedForCourseId = ref<number | null>(null)

  /**
   * Загружает список работников курса (без проверки кэша; для явного обновления).
   */
  const fetchWorkers = async (courseId: number): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      workers.value = await fetchCourseWorkers(courseId)
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } }
      error.value = apiErr.response?.data?.detail || 'Ошибка загрузки работников'
      console.error('[useCourseWorkersStore] Ошибка загрузки работников:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Загружает справочник доступных пользователей и ролей.
   */
  const fetchAvailable = async (courseId: number): Promise<void> => {
    try {
      const response = await fetchAvailableWorkers(courseId)
      availableUsers.value = response.users
      availableRoles.value = response.roles
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } }
      error.value = apiErr.response?.data?.detail || 'Ошибка загрузки справочника'
      console.error('[useCourseWorkersStore] Ошибка загрузки справочника:', error.value)
      throw err
    }
  }

  /**
   * Добавляет работника в курс
   * @param courseId ID курса
   * @param payload Данные для добавления (user_id, role)
   */
  const addWorker = async (
    courseId: number,
    payload: AddWorkerPayload,
  ): Promise<CourseWorker[]> => {
    isLoading.value = true
    error.value = null
    try {
      // API возвращает обновленный список, сразу обновляем стейт
      workers.value = await addCourseWorker(courseId, payload)
      return workers.value
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } }
      error.value = apiErr.response?.data?.detail || 'Ошибка добавления работника'
      console.error('[useCourseWorkersStore] Ошибка добавления:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Изменяет роль работника
   * @param courseId ID курса
   * @param workerId ID связи работника
   * @param payload Новая роль
   */
  const updateWorkerRoleAction = async (
    courseId: number,
    workerId: string,
    payload: UpdateWorkerRolePayload,
  ): Promise<CourseWorker[]> => {
    isLoading.value = true
    error.value = null
    try {
      workers.value = await updateCourseWorkerRole(courseId, workerId, payload)
      return workers.value
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } }
      error.value = apiErr.response?.data?.detail || 'Ошибка обновления роли'
      console.error('[useCourseWorkersStore] Ошибка обновления:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Удаляет работника из курса
   * @param courseId ID курса
   * @param workerId ID связи работника
   */
  const removeWorker = async (courseId: number, workerId: string): Promise<CourseWorker[]> => {
    isLoading.value = true
    error.value = null
    try {
      workers.value = await removeCourseWorker(courseId, workerId)
      return workers.value
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } }
      error.value = apiErr.response?.data?.detail || 'Ошибка удаления работника'
      console.error('[useCourseWorkersStore] Ошибка удаления:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Очистка стора (при выходе из страницы или логауте)
   */
  const clearStore = (): void => {
    workers.value = []
    availableUsers.value = []
    availableRoles.value = []
    error.value = null
    hydratedForCourseId.value = null
  }

  /**
   * Загружает работников и справочник один раз на курс (пока не сменили курс и не вызвали force).
   * Убирает лишние запросы при переключении табов «Общее» ↔ «Роли».
   */
  const ensureWorkersLoaded = async (
    courseId: number,
    options?: { force?: boolean },
  ): Promise<void> => {
    if (!options?.force && hydratedForCourseId.value === courseId) {
      return
    }

    const switchingCourse =
      hydratedForCourseId.value !== null && hydratedForCourseId.value !== courseId

    if (switchingCourse) {
      workers.value = []
      availableUsers.value = []
      availableRoles.value = []
      hydratedForCourseId.value = null
    }

    isLoading.value = true
    error.value = null
    try {
      const [w, avail] = await Promise.all([
        fetchCourseWorkers(courseId),
        fetchAvailableWorkers(courseId),
      ])
      workers.value = w
      availableUsers.value = avail.users
      availableRoles.value = avail.roles
      hydratedForCourseId.value = courseId
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } }
      error.value = apiErr.response?.data?.detail || 'Ошибка загрузки данных ролей'
      console.error('[useCourseWorkersStore] ensureWorkersLoaded:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ===== RETURN =====
  return {
    // State
    workers,
    availableUsers,
    availableRoles,
    isLoading,
    error,
    hydratedForCourseId,

    // Actions
    fetchWorkers,
    fetchAvailable,
    ensureWorkersLoaded,
    addWorker,
    updateWorkerRoleAction,
    removeWorker,
    clearStore,
  }
})
