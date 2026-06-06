/** Shared file object in written homework API responses. */
export interface WrittenHomeworkFileRef {
  file_id: number
  original_file_name: string
  file_url: string
}

export interface WrittenHomeworkFileUploadInitPayload {
  course: number
  original_file_name: string
  file_size: number
  content_type?: string
}

export interface WrittenHomeworkFileUploadInitResponse {
  upload_url: string
  object_key: string
  headers: { 'Content-Type': string }
  max_file_size: number
}

export interface WrittenHomeworkFileUploadCompletePayload {
  object_key: string
  original_file_name: string
}

export interface WrittenHomeworkFileUploadCompleteResponse {
  id: number
  original_file_name: string
  file_url: string
  uploaded_at?: string
}
