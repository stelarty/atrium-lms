import { api } from './index'

const BASE = '/edspace/manage/lms-course-lesson-materials'

export interface LessonMaterialUploadInitPayload {
  course: number
  original_file_name: string
  file_size: number
  content_type?: string
}

export interface LessonMaterialUploadInitResponse {
  upload_url: string
  object_key: string
  headers: { 'Content-Type': string }
  max_file_size: number
}

export interface LessonMaterialUploadCompletePayload {
  object_key: string
  original_file_name: string
  lesson?: number
}

export interface LessonMaterialUploadCompleteResponse {
  id: number
  original_file_name: string
  file_url: string
  uploaded_at: string
  file_in_lesson_id: number | null
  sort_order: number | null
  size_bytes: number
}

/**
 * Инициализация загрузки файла материала занятия (presigned URL).
 */
export async function lessonMaterialUploadInit(
  payload: LessonMaterialUploadInitPayload,
): Promise<LessonMaterialUploadInitResponse> {
  try {
    const response = await api.post<LessonMaterialUploadInitResponse>(`${BASE}/upload-init/`, payload)
    return response.data
  } catch (error) {
    console.error('[Lesson Materials API] Ошибка инициализации загрузки:', error)
    throw error
  }
}

/**
 * Фиксация файла в БД после успешной загрузки в S3.
 */
export async function lessonMaterialUploadComplete(
  payload: LessonMaterialUploadCompletePayload,
): Promise<LessonMaterialUploadCompleteResponse> {
  try {
    const response = await api.post<LessonMaterialUploadCompleteResponse>(
      `${BASE}/upload-complete/`,
      payload,
    )
    return response.data
  } catch (error) {
    console.error('[Lesson Materials API] Ошибка фиксации файла:', error)
    throw error
  }
}
