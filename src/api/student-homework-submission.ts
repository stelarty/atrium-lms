import { api } from './index'

export interface StudentHomeworkSubmissionPayload {
  file_id: number
}

export interface StudentHomeworkSubmissionCreateResponse {
  submission_id: number
}

/**
 * First written homework submission.
 * POST /edspace/student/lms-homework/{homework_id}/submission/
 */
export async function createStudentHomeworkSubmission(
  homeworkId: number | string,
  payload: StudentHomeworkSubmissionPayload,
): Promise<StudentHomeworkSubmissionCreateResponse> {
  try {
    const response = await api.post<StudentHomeworkSubmissionCreateResponse>(
      `/edspace/student/lms-homework/${homeworkId}/submission/`,
      payload,
    )
    return response.data
  } catch (error) {
    console.error('[Student Homework Submission API] create failed', error)
    throw error
  }
}

/**
 * Replace solution file while status is pending_review.
 * PATCH /edspace/student/lms-homework/{homework_id}/submission/
 */
export async function updateStudentHomeworkSubmission(
  homeworkId: number | string,
  payload: StudentHomeworkSubmissionPayload,
): Promise<StudentHomeworkSubmissionCreateResponse> {
  try {
    const response = await api.patch<StudentHomeworkSubmissionCreateResponse>(
      `/edspace/student/lms-homework/${homeworkId}/submission/`,
      payload,
    )
    return response.data
  } catch (error) {
    console.error('[Student Homework Submission API] update failed', error)
    throw error
  }
}
