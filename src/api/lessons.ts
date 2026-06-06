// src/api/lessons.ts
import { api } from './index'
import type {
  CourseProgramResponse,
  LmsLessonCreatePayload,
  LmsLessonResponse,
  LmsLessonUpdatePayload,
} from '@/types/lesson'

/**
 * Создать новое занятие
 * @param payload данные для создания занятия
 * @returns созданное занятие
 */
export async function createLesson(payload: LmsLessonCreatePayload): Promise<CourseProgramResponse> {
  try {
    const response = await api.post<CourseProgramResponse>('/edspace/manage/lms-lessons/', payload, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    console.error('[Lessons API] Ошибка создания занятия:', error)
    throw error
  }
}

/**
 * Получить детали занятия
 * @param lessonId ID занятия
 * @returns данные занятия
 */
export async function getLessonDetails(lessonId: number | string): Promise<LmsLessonResponse> {
  try {
    const response = await api.get<LmsLessonResponse>(`/edspace/manage/lms-lessons/${lessonId}/`)
    return response.data
  } catch (error) {
    console.error('[Lessons API] Ошибка получения деталей занятия:', error)
    throw error
  }
}

/**
 * Обновить занятие
 * @param lessonId ID занятия
 * @param payload частичные данные для обновления
 * @returns обновлённое занятие
 */
export async function updateLesson(
  lessonId: number | string,
  payload: LmsLessonUpdatePayload,
): Promise<CourseProgramResponse> {
  try {
    const response = await api.patch<CourseProgramResponse>(
      `/edspace/manage/lms-lessons/${lessonId}/`,
      payload,
      { headers: { 'Content-Type': 'application/json' } },
    )
    return response.data
  } catch (error) {
    console.error('[Lessons API] Ошибка обновления занятия:', error)
    throw error
  }
}

/**
 * Удалить занятие
 * @param lessonId ID занятия
 */
export async function deleteLesson(lessonId: number | string): Promise<CourseProgramResponse> {
  try {
    const response = await api.delete<CourseProgramResponse>(`/edspace/manage/lms-lessons/${lessonId}/`)
    return response.data
  } catch (error) {
    console.error('[Lessons API] Ошибка удаления занятия:', error)
    throw error
  }
}
