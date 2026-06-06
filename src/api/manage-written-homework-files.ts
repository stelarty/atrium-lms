import { api } from './index'
import type {
  WrittenHomeworkFileUploadCompletePayload,
  WrittenHomeworkFileUploadCompleteResponse,
  WrittenHomeworkFileUploadInitPayload,
  WrittenHomeworkFileUploadInitResponse,
} from '@/types/written-homework-file'

const BASE = '/edspace/manage/lms-written-homework-files'

export async function manageWrittenHomeworkFileUploadInit(
  payload: WrittenHomeworkFileUploadInitPayload,
): Promise<WrittenHomeworkFileUploadInitResponse> {
  try {
    const response = await api.post<WrittenHomeworkFileUploadInitResponse>(
      `${BASE}/upload-init/`,
      payload,
    )
    return response.data
  } catch (error) {
    console.error('[Manage Written Homework Files API] upload-init failed', error)
    throw error
  }
}

export async function manageWrittenHomeworkFileUploadComplete(
  payload: WrittenHomeworkFileUploadCompletePayload,
): Promise<WrittenHomeworkFileUploadCompleteResponse> {
  try {
    const response = await api.post<WrittenHomeworkFileUploadCompleteResponse>(
      `${BASE}/upload-complete/`,
      payload,
    )
    return response.data
  } catch (error) {
    console.error('[Manage Written Homework Files API] upload-complete failed', error)
    throw error
  }
}
