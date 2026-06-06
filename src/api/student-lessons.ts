// src/api/student-lessons.ts
import { api } from './index'
import type { StudentLessonDetail } from '@/types/student-lesson'

/**
 * Детали занятия для студента.
 * GET /edspace/student/lms-lessons/:lessonId/
 */
export async function fetchStudentLesson(lessonId: number | string): Promise<StudentLessonDetail> {
  try {
    const response = await api.get<StudentLessonDetail>(
      `/edspace/student/lms-lessons/${lessonId}/`,
    )
    return response.data
  } catch (error) {
    console.error('[Student Lessons API] Ошибка получения занятия:', error)
    throw error
  }
}

