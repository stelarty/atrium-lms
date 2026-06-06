export type WorkerRoleCode = 'teamlead' | 'teacher' | 'assistant' | 'curator' | 'manager'

/**
 * Пользователь, которого можно назначить работником курса.
 * Ответ от GET /lms-courses/<course_id>/workers/available/ → users[]
 */
export interface AvailableWorkerUser {
  user_id: string
  name: string
  surname: string
  email: string
}

/**
 * Доступная роль для назначения.
 * Ответ от GET /lms-courses/<course_id>/workers/available/ → roles[]
 */
export interface WorkerRole {
  code: WorkerRoleCode
  label: string
}

/**
 * Полный ответ от GET /workers/available/
 */
export interface AvailableWorkersResponse {
  course_id: number
  users: AvailableWorkerUser[]
  roles: WorkerRole[]
}

/**
 * Работник курса (текущий состав).
 * Ответ от GET /lms-courses/<course_id>/workers/
 */
export interface CourseWorker {
  worker_id: string      // Уникальный идентификатор связи "пользователь+роль+курс"
  user_id: string        // ID пользователя в системе
  name: string
  surname: string
  email: string
  role: WorkerRoleCode   // Строгая типизация через union
  role_label: string     // Человекочитаемое название роли
}

/**
 * Тело запроса для добавления работника (POST /workers/)
 */
export interface AddWorkerPayload {
  user_id: string
  role: WorkerRoleCode
}

/**
 * Тело запроса для изменения роли работника (PATCH /workers/<worker_id>/)
 */
export interface UpdateWorkerRolePayload {
  role: WorkerRoleCode
}
