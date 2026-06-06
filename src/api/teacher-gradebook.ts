import { api } from '@/api/index'
import type {
  TeacherGradebookFiltersResponse,
  TeacherGradebookHomeworkDetailResponse,
  TeacherGradebookReviewPayload,
  TeacherGradebookReviewResponse,
  TeacherGradebookReviewSaveBody,
} from '@/types/teacher-gradebook'

const journalBase = (courseId: number | string): string =>
  `/edspace/manage/lms-courses/${courseId}/homework-journal`

function reviewPath(
  courseId: number | string,
  homeworkId: number | string,
  userId: string,
): string {
  return `${journalBase(courseId)}/homework/${homeworkId}/students/${userId}/review/`
}

/** GET /api/edspace/manage/lms-courses/{course_id}/homework-journal/filters/ */
export async function fetchTeacherGradebookFilters(
  courseId: number | string,
): Promise<TeacherGradebookFiltersResponse> {
  try {
    const response = await api.get<TeacherGradebookFiltersResponse>(
      `${journalBase(courseId)}/filters/`,
    )
    return response.data
  } catch (error) {
    console.error('[Teacher Gradebook API] Ошибка загрузки фильтров:', error)
    throw error
  }
}

/** GET /api/edspace/manage/lms-courses/{course_id}/homework-journal/homework/{homework_id}/ */
export async function fetchTeacherGradebookHomeworkDetail(
  courseId: number | string,
  homeworkId: number,
): Promise<TeacherGradebookHomeworkDetailResponse> {
  try {
    const response = await api.get<TeacherGradebookHomeworkDetailResponse>(
      `${journalBase(courseId)}/homework/${homeworkId}/`,
    )
    return response.data
  } catch (error) {
    console.error('[Teacher Gradebook API] Ошибка загрузки журнала по ДЗ:', error)
    throw error
  }
}

/** GET …/homework-journal/homework/{hw}/students/{user_uuid}/review/ */
export async function fetchTeacherGradebookReview(
  courseId: number | string,
  homeworkId: number | string,
  userId: string,
): Promise<TeacherGradebookReviewResponse> {
  try {
    const response = await api.get<TeacherGradebookReviewResponse>(
      reviewPath(courseId, homeworkId, userId),
    )
    return response.data
  } catch (error) {
    console.error('[Teacher Gradebook API] Ошибка загрузки проверки:', error)
    throw error
  }
}

export async function submitTeacherGradebookReview(
  courseId: number | string,
  payload: TeacherGradebookReviewPayload,
): Promise<TeacherGradebookReviewResponse> {
  const url = reviewPath(courseId, payload.homework_id, payload.user_id)

  try {
    if (payload.method === 'POST') {
      const response = await api.post<TeacherGradebookReviewResponse>(url, payload.body)
      return response.data
    }

    const response = await api.patch<TeacherGradebookReviewResponse>(url, payload.body)
    return response.data
  } catch (error) {
    console.error('[Teacher Gradebook API] Ошибка сохранения проверки:', error)
    throw error
  }
}

export type { TeacherGradebookReviewSaveBody }
