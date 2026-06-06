import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useCourseWorkersStore } from '@/stores/useCourseWorkersStore'
import type {
  CourseWorker,
  AvailableWorkerUser,
  WorkerRole,
  WorkerRoleCode,
} from '@/types/course-worker'
import type { BaseSelectOption } from '@/components/base/BaseSelect.vue'

export function useCourseWorkers(courseId: MaybeRefOrGetter<number>) {
  const store = useCourseWorkersStore()

  const resolveCourseId = (): number => toValue(courseId)

  const workers = computed<CourseWorker[]>(() => store.workers)
  const availableUsers = computed<AvailableWorkerUser[]>(() => store.availableUsers)
  const availableRoles = computed<WorkerRole[]>(() => store.availableRoles)

  const isLoading = computed(() => store.isLoading)
  const hasLoaded = computed(() => store.hydratedForCourseId === resolveCourseId())
  const error = computed(() => store.error)

  /** Опции для <BaseSelect> выбора роли */
  const roleOptions = computed((): BaseSelectOption[] =>
    availableRoles.value.map((role) => ({
      value: role.code,
      label: role.label,
    })),
  )

  /** Опции для <BaseSelect> выбора пользователя (с форматированием ФИО) */
  const userOptions = computed((): BaseSelectOption[] =>
    availableUsers.value.map((user) => ({
      value: user.user_id,
      label: `${user.surname} ${user.name}`,
    })),
  )

  // ===== БИЗНЕС-ПРАВИЛА (валидация) =====

  /**
   * Можно ли назначить пользователю данную роль?
   * Правило: Тимлидом можно назначить только Менеджера/Тимлида (глобальная роль)
   * @param user Пользователь из availableUsers
   * @param roleCode Код роли для назначения
   */
  const canAssignRole = (user: AvailableWorkerUser, roleCode: WorkerRoleCode): boolean => {
    // Если роль не 'teamlead' — можно назначать любому staff
    if (roleCode !== 'teamlead') return true

    // Для teamlead нужна проверка глобальной роли пользователя
    // ⚠️ В реальном проекте это поле должно приходить из API availableUsers
    // Пока заглушка: считаем, что все доступные пользователи — staff с нужными правами
    // TODO: добавить поле globalRole в AvailableWorkerUser при обновлении API
    return true
  }

  /**
   * Проверка на дубликат роли для пользователя в курсе
   * @param userId ID пользователя
   * @param roleCode Код роли
   */
  const isDuplicateRole = (userId: string, roleCode: WorkerRoleCode): boolean => {
    return workers.value.some((worker) => worker.user_id === userId && worker.role === roleCode)
  }

  /**
   * Можно ли удалить работника?
   * Правило: нельзя удалить тимлида
   * @param worker Работник курса
   */
  const canRemoveWorker = (worker: CourseWorker): boolean => {
    return worker.role !== 'teamlead'
  }

  /**
   * Можно ли изменить роль работника?
   * Правило: нельзя понизить тимлида до другой роли (сначала нужно назначить нового тимлида)
   * @param worker Текущий работник
   * @param newRoleCode Новая роль
   */
  const canChangeRole = (worker: CourseWorker, newRoleCode: WorkerRoleCode): boolean => {
    // Если текущий — тимлид, а новая роль — не тимлид, запрещаем
    if (worker.role === 'teamlead' && newRoleCode !== 'teamlead') {
      return false
    }
    return true
  }

  // ===== БЕЗОПАСНЫЕ МЕТОДЫ ДЛЯ КОМПОНЕНТА =====

  /**
   * Добавляет работника с предварительной валидацией
   * @param userId ID пользователя
   * @param roleCode Код роли
   * @throws Error если валидация не прошла
   */
  const assignWorker = async (userId: string, roleCode: WorkerRoleCode): Promise<void> => {
    // 1. Находим пользователя в списке доступных
    const user = availableUsers.value.find((u) => u.user_id === userId)
    if (!user) {
      throw new Error('Пользователь не найден в списке доступных')
    }

    // 2. Проверяем бизнес-правила
    if (!canAssignRole(user, roleCode)) {
      throw new Error('Нельзя назначить эту роль данному пользователю')
    }

    if (isDuplicateRole(userId, roleCode)) {
      throw new Error('Эта роль уже назначена данному пользователю')
    }

    // 3. Выполняем запрос через store
    await store.addWorker(resolveCourseId(), { user_id: userId, role: roleCode })
  }

  /**
   * Изменяет роль работника с проверкой правил
   * @param workerId ID связи работника
   * @param newRoleCode Новая роль
   * @throws Error если валидация не прошла
   */
  const changeWorkerRole = async (workerId: string, newRoleCode: WorkerRoleCode): Promise<void> => {
    const worker = workers.value.find((w) => w.worker_id === workerId)
    if (!worker) {
      throw new Error('Работник не найден')
    }

    if (!canChangeRole(worker, newRoleCode)) {
      throw new Error('Нельзя изменить роль тимлида')
    }

    if (isDuplicateRole(worker.user_id, newRoleCode)) {
      throw new Error('Эта роль уже назначена данному пользователю')
    }

    await store.updateWorkerRoleAction(resolveCourseId(), workerId, { role: newRoleCode })
  }

  /**
   * Удаляет работника с проверкой правил
   * @param workerId ID связи работника
   * @throws Error если удаление запрещено
   */
  const deleteWorker = async (workerId: string): Promise<void> => {
    const worker = workers.value.find((w) => w.worker_id === workerId)
    if (!worker) {
      throw new Error('Работник не найден')
    }

    if (!canRemoveWorker(worker)) {
      throw new Error('Нельзя удалить тимлида')
    }

    await store.removeWorker(resolveCourseId(), workerId)
  }

  /**
   * Инициализация: один раз загружает работников и справочник для курса (кэш в store при переключении табов).
   */
  const initialize = async (options?: { force?: boolean }): Promise<void> => {
    const id = resolveCourseId()
    if (!Number.isFinite(id) || id <= 0) return

    if (!options?.force && hasLoaded.value) return

    await store.ensureWorkersLoaded(id, options)
  }

  /**
   * Принудительное обновление с бэкенда (например, после действий другой вкладки).
   */
  const refresh = async (): Promise<void> => {
    await store.ensureWorkersLoaded(resolveCourseId(), { force: true })
  }

  /**
   * Очистка данных при уходе со страницы
   */
  const cleanup = (): void => {
    store.clearStore()
  }

  // ===== RETURN: ПУБЛИЧНЫЙ API ДЛЯ КОМПОНЕНТА =====
  return {
    // Реактивные данные
    workers,
    availableUsers,
    availableRoles,
    roleOptions, // ✅ Готовые опции для <BaseSelect>
    userOptions, // ✅ Готовые опции для <BaseSelect>
    isLoading,
    hasLoaded,
    error,

    // Валидация (для отображения подсказок/блокировок в UI)
    canAssignRole,
    isDuplicateRole,
    canRemoveWorker,
    canChangeRole,

    // Безопасные методы (компонент вызывает их по клику)
    assignWorker,
    changeWorkerRole,
    deleteWorker,

    // Управление жизненным циклом
    initialize,
    refresh,
    cleanup,
  }
}
