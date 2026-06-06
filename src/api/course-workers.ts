import { api } from './index'
import type {
  AvailableWorkersResponse,
  CourseWorker,
  AddWorkerPayload,
  UpdateWorkerRolePayload,
} from '@/types/course-worker'

export async function fetchAvailableWorkers(courseId: number): Promise<AvailableWorkersResponse> {
  try {
    const response = await api.get<AvailableWorkersResponse>(
      `edspace/manage/lms-courses/${courseId}/workers/available/`,
    )
    return response.data
  } catch (error) {
    console.error('[Course Workers API] Ошибка получения доступных работников:', error)
    throw error
  }
}

export async function fetchCourseWorkers(courseId: number): Promise<CourseWorker[]> {
  try {
    const response = await api.get<CourseWorker[]>(`edspace/manage/lms-courses/${courseId}/workers/`)
    return response.data
  } catch (error) {
    console.error('[Course Workers API] Ошибка получения работников курса:', error)
    throw error
  }
}

export async function addCourseWorker(
  courseId: number,
  payload: AddWorkerPayload,
): Promise<CourseWorker[]> {
  try {
    const response = await api.post<CourseWorker[]>(`edspace/manage/lms-courses/${courseId}/workers/`, payload)
    return response.data
  } catch (error) {
    console.error('[Course Workers API] Ошибка добавления работника:', error)
    throw error
  }
}

export async function updateCourseWorkerRole(
  courseId: number,
  workerId: string,
  payload: UpdateWorkerRolePayload,
): Promise<CourseWorker[]> {
  try {
    const response = await api.patch(`edspace/manage/lms-courses/${courseId}/workers/${workerId}/`, payload)
    return response.data
  } catch (error) {
    console.error('[Course Workers API] Ошибка обновления роли работника:', error)
    throw error
  }
}

export async function removeCourseWorker(
  courseId: number,
  workerId: string,
): Promise<CourseWorker[]> {
  try {
    const response = await api.delete(`edspace/manage/lms-courses/${courseId}/workers/${workerId}/`)
    return response.data
  } catch (error) {
    console.error('[Course Workers API] Ошибка удаления работника:', error)
    throw error
  }
}
