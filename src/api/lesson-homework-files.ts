import { api } from './index'

const BASE = '/edspace/manage/lms-course-lesson-homework-files'

export interface LessonHomeworkFileUploadInitPayload {
  course: number
  original_file_name: string
  file_size: number
  content_type?: string
}

export interface LessonHomeworkFileUploadInitResponse {
  upload_url: string
  object_key: string
  headers: { 'Content-Type': string }
  max_file_size: number
}

export interface LessonHomeworkFileUploadCompletePayload {
  object_key: string
  original_file_name: string
}

export interface LessonHomeworkFileUploadCompleteResponse {
  id: number
  original_file_name: string
  file_url: string
  uploaded_at?: string
}

export async function lessonHomeworkFileUploadInit(
  payload: LessonHomeworkFileUploadInitPayload,
): Promise<LessonHomeworkFileUploadInitResponse> {
  try {
    const response = await api.post<LessonHomeworkFileUploadInitResponse>(
      `${BASE}/upload-init/`,
      payload,
    )
    return response.data
  } catch (error) {
    console.error('[Lesson Homework Files API] Ошибка инициализации загрузки:', error)
    throw error
  }
}

export async function lessonHomeworkFileUploadComplete(
  payload: LessonHomeworkFileUploadCompletePayload,
): Promise<LessonHomeworkFileUploadCompleteResponse> {
  try {
    const response = await api.post<LessonHomeworkFileUploadCompleteResponse>(
      `${BASE}/upload-complete/`,
      payload,
    )
    return response.data
  } catch (error) {
    console.error('[Lesson Homework Files API] Ошибка фиксации файла:', error)
    throw error
  }
}
