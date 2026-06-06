import { api } from './index'
import { uploadToS3 } from './s3-upload'
import type { LmsCourseMaterial } from '@/types/course'

const BASE = '/edspace/manage/lms-course-materials'

export interface UploadInitPayload {
  original_file_name: string
  file_size: number
  content_type: string
}

export interface UploadInitResponse {
  upload_url: string
  object_key: string
  headers: { 'Content-Type': string }
  max_file_size: number
}

export interface UploadCompletePayload {
  object_key: string
  original_file_name: string
}

export interface UploadCompleteResponse {
  file_id: number
  file_in_course_id: number | null
  original_file_name: string
  file_url: string
  uploaded_by: number
  uploaded_at: string
  sort_order: number | null
  size_bytes: number
}

// Материал как он приходит в GET /lms-courses/<id>/
export type CourseMaterialFromCourse = LmsCourseMaterial

export async function uploadInit(payload: UploadInitPayload): Promise<UploadInitResponse> {
  try {
    const response = await api.post(`${BASE}/upload-init/`, payload)
    return response.data
  } catch (error) {
    console.error('[Course Materials API] Ошибка инициализации загрузки:', error)
    throw error
  }
}

export { uploadToS3 }

export async function uploadComplete(
  payload: UploadCompletePayload,
): Promise<UploadCompleteResponse> {
  try {
    const response = await api.post(`${BASE}/upload-complete/`, payload)
    return response.data
  } catch (error) {
    console.error('[Course Materials API] Ошибка фиксации файла:', error)
    throw error
  }
}

// Удаление по file_in_course_id (связь файла с курсом, не сам файл)
export async function deleteMaterial(
  fileInCourseId: number,
): Promise<CourseMaterialFromCourse[]> {
  try {
    const response = await api.delete(`${BASE}/${fileInCourseId}/`)
    return response.data ?? []
  } catch (error) {
    console.error('[Course Materials API] Ошибка удаления материала:', error)
    throw error
  }
}
