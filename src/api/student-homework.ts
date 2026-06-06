import { api } from './index'
import type {
  FetchStudentCourseHomeworkParams,
  StudentCourseHomeworkResponse,
} from '@/types/student-homework'

/**
 * Список домашних заданий курса для студента.
 * GET /edspace/student/lms-courses/:courseId/homework/?component_id=&status=
 */
export async function fetchStudentCourseHomework(
  courseId: number | string,
  params: FetchStudentCourseHomeworkParams,
): Promise<StudentCourseHomeworkResponse> {
  try {
    const response = await api.get<StudentCourseHomeworkResponse>(
      `/edspace/student/lms-courses/${courseId}/homework/`,
      {
        params: {
          component_id: String(params.componentId),
          status: params.status,
        },
      },
    )

    return response.data
  } catch (error) {
    console.error('[Student Homework API] Ошибка получения списка ДЗ:', error)
    throw error
  }
}
