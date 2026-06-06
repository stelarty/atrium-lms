// src/api/course-parts.ts
import { api } from './index'
import type { CoursePartResponse } from '@/types/course-part'

/**
 * Создать новый раздел курса
 * @param payload данные для создания раздела
 * @returns созданный раздел
 */
export async function createCoursePart(payload: { course: number; title: string }): Promise<CoursePartResponse> {
  try {
    const response = await api.post<CoursePartResponse>(
      '/edspace/manage/lms-course-sections/',
      payload,
      { headers: { 'Content-Type': 'application/json' } },
    )
    return response.data
  } catch (error) {
    console.error('[Course Parts API] Ошибка создания раздела:', error)
    throw error
  }
}

/**
 * Получить детали одного раздела
 * @param courseId ID курса (для контекста)
 * @param partId ID раздела
 * @returns данные раздела
 */
export async function getCoursePartDetails(courseId: number | string, partId: number | string): Promise<CoursePartResponse> {
  try {
    const response = await api.get<CoursePartResponse>(`/edspace/manage/lms-course-sections/${partId}/`)
    return response.data
  } catch (error) {
    console.error('[Course Parts API] Ошибка получения деталей раздела:', error)
    throw error
  }
}

/**
 * Обновить существующий раздел
 * @param partId ID раздела
 * @param payload частичные данные для обновления
 * @returns обновлённый список разделов
 */
export async function updateCoursePart(
  partId: number | string,
  payload: { title: string },
): Promise<CoursePartResponse[]> {
  try {
    const response = await api.patch<string | CoursePartResponse[]>(
      `/edspace/manage/lms-course-sections/${partId}/`,
      payload,
      { headers: { 'Content-Type': 'application/json' } },
    )

    let result: CoursePartResponse[]

    if (typeof response.data === 'string') {
      // Если пришла строка — парсим
      result = JSON.parse(response.data) as CoursePartResponse[]
    } else {
      // Если уже объект — используем напрямую
      result = response.data as CoursePartResponse[]
    }

    return result
  } catch (error) {
    console.error('[Course Parts API] Ошибка обновления раздела:', error)
    throw error
  }
}

/**
 * Удалить раздел
 * @param partId ID раздела
 */
export async function deleteCoursePart(partId: number | string): Promise<void> {
  try {
    await api.delete(`/edspace/manage/lms-course-sections/${partId}/`)
  } catch (error) {
    console.error('[Course Parts API] Ошибка удаления раздела:', error)
    throw error
  }
}
