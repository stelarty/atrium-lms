export type MaterialUploadStatus = 'pending' | 'uploading' | 'finalizing' | 'done' | 'error'

export interface MaterialFileItem {
  clientId: string
  fileId?: number
  fileInCourseId?: number
  originalName: string
  fileUrl?: string
  extension: string
  progress: number
  status: MaterialUploadStatus
  errorMessage?: string
  /** Per-file remove button (student: only own submission files). */
  removable?: boolean
}
