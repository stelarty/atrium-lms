// src/api/courses.ts
import { api } from './index'
import type {
  LmsCourseComponentsResponse,
  LmsCourseCreatePayload,
  LmsCourseResponse,
} from '@/types/course'
import type { CourseProgramApiResponse } from '@/types/lesson'

/**
 * Создать курс LMS.
 * @param payload — данные для создания курса
 * @returns объект созданного курса
 */
export async function createLmsCourse(payload: LmsCourseCreatePayload): Promise<LmsCourseResponse> {
  try {
    const response = await api.post('/edspace/manage/lms-courses/', payload)
    return response.data
  } catch (error) {
    console.error('[Courses API] Ошибка создания курса:', error)
    throw error
  }
}

/**
 * Получить список курсов (админ).
 * @returns массив курсов
 */
export async function fetchAdminCourses(): Promise<LmsCourseResponse[]> {
  try {
    const response = await api.get('/edspace/manage/lms-courses/')
    return response.data
  } catch (error) {
    console.error('[Courses API] Ошибка получения списка курсов:', error)
    throw error
  }
}

/**
 * Получить детали курса по ID.
 * @param courseId ID курса
 * @returns детали курса
 */
export async function getCourseDetails(courseId: number | string): Promise<LmsCourseResponse> {
  try {
    const response = await api.get(`/edspace/manage/lms-courses/${courseId}/`)
    return response.data
  } catch (error) {
    console.error('[Courses API] Ошибка получения деталей курса:', error)
    throw error
  }
}

/**
 * Получить детали курса по ID.
 * @param courseId ID курса
 * @returns детали курса
 */
export async function getPartsDetails(
  courseId: number | string,
): Promise<LmsCourseComponentsResponse> {
  try {
    const response = await api.get(`/edspace/manage/lms-courses-components/${courseId}/`)
    return response.data
  } catch (error) {
    console.error('[Courses API] Ошибка получения деталей разделов:', error)
    throw error
  }
}

/**
 * Обновить настройки существующего курса.
 * @param courseId - ID курса для обновления
 * @param payload - частичные данные для обновления
 * @returns обновлённый курс
 */
export async function updateCourseSettings(
  courseId: number | string,
  payload: Partial<LmsCourseCreatePayload>,
): Promise<LmsCourseResponse> {
  try {
    const response = await api.patch(`/edspace/manage/lms-courses/${courseId}/`, payload)
    return response.data
  } catch (error) {
    console.error('[Courses API] Ошибка обновления настроек курса:', error)
    throw error
  }
}

/**
 * Получить список занятий курса
 * @param courseId ID курса
 * @returns массив занятий
 */
export async function fetchCourseLessons(courseId: number | string): Promise<CourseProgramApiResponse> {
  try {
    const response = await api.get(`/edspace/manage/lms-courses/${courseId}/lessons/`)
    return response.data
  } catch (error) {
    console.error('[Courses API] Ошибка получения занятий курса:', error)
    throw error
  }
}
